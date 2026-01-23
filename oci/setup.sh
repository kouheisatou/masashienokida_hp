#!/bin/bash
# ============================================================
# setup.sh - OCI Infrastructure Setup for Masashi Enokida Website
# ============================================================
# Prerequisites:
#   - OCI CLI installed and configured (oci setup config)
#   - Appropriate IAM permissions
#
# Usage: ./setup.sh
# ============================================================

set -e

# ============================================================
# ANSI Color Codes
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================
# Configuration
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/config"
CONFIG_FILE="${CONFIG_DIR}/setup-config.json"

# Default values
DEFAULT_COMPARTMENT_NAME="masashi-enokida-website"
DEFAULT_VCN_CIDR="10.0.0.0/16"
DEFAULT_PUBLIC_SUBNET_CIDR="10.0.1.0/24"
DEFAULT_PRIVATE_SUBNET_CIDR="10.0.2.0/24"
DEFAULT_BUCKET_NAME="enokida-website-static"
DEFAULT_DB_NAME="enokidadb"
DEFAULT_FN_APP_NAME="enokida-website-functions"
DEFAULT_API_GW_NAME="enokida-api-gateway"
DEFAULT_EMAIL_DOMAIN=""
DEFAULT_SENDER_EMAIL="noreply"

# ============================================================
# Helper Functions
# ============================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"

    read -p "$prompt [$default]: " input
    eval "$var_name=\"${input:-$default}\""
}

prompt_password() {
    local prompt="$1"
    local var_name="$2"

    while true; do
        read -sp "$prompt: " password
        echo
        read -sp "Confirm password: " password_confirm
        echo

        if [[ "$password" != "$password_confirm" ]]; then
            log_error "Passwords do not match. Please try again."
            continue
        fi

        if [[ ${#password} -lt 12 ]]; then
            log_error "Password must be at least 12 characters."
            continue
        fi

        if ! [[ "$password" =~ [A-Z] ]]; then
            log_error "Password must contain at least one uppercase letter."
            continue
        fi

        if ! [[ "$password" =~ [a-z] ]]; then
            log_error "Password must contain at least one lowercase letter."
            continue
        fi

        if ! [[ "$password" =~ [0-9] ]]; then
            log_error "Password must contain at least one number."
            continue
        fi

        eval "$var_name=\"$password\""
        break
    done
}

confirm_action() {
    local prompt="$1"
    read -p "$prompt [y/N]: " confirm
    [[ "$confirm" =~ ^[Yy]$ ]]
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

wait_for_state() {
    local check_cmd="$1"
    local target_state="$2"
    local max_attempts="${3:-60}"
    local interval="${4:-10}"

    log_info "Waiting for resource to reach $target_state state..."
    for ((i=1; i<=max_attempts; i++)); do
        local state
        state=$(eval "$check_cmd" 2>/dev/null || echo "UNKNOWN")

        if [[ "$state" == "$target_state" ]]; then
            log_success "Resource is now $target_state"
            return 0
        fi

        printf "."
        sleep "$interval"
    done

    echo
    log_error "Timeout waiting for resource to reach $target_state state"
    return 1
}

wait_for_api_gateway_active() {
    local gateway_id="$1"
    local max_attempts=60
    local interval=10

    for ((i=1; i<=max_attempts; i++)); do
        local state
        state=$(oci api-gateway gateway get \
            --gateway-id "$gateway_id" \
            --query "data.\"lifecycle-state\"" \
            --raw-output 2>/dev/null || echo "UNKNOWN")

        printf "\r  [%d/%d] Status: %-15s" "$i" "$max_attempts" "$state"

        if [[ "$state" == "ACTIVE" ]]; then
            echo
            return 0
        elif [[ "$state" == "FAILED" ]]; then
            echo
            log_error "API Gateway creation failed!"
            oci api-gateway gateway get --gateway-id "$gateway_id" \
                --query "data.{state: \"lifecycle-state\", details: \"lifecycle-details\"}"
            return 1
        fi

        sleep "$interval"
    done

    echo
    log_error "Timeout waiting for API Gateway to become ACTIVE (waited $((max_attempts * interval)) seconds)"
    return 1
}

save_config() {
    mkdir -p "$CONFIG_DIR"
    cat > "$CONFIG_FILE" << EOF
{
    "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "region": "$REGION",
    "tenancyId": "$TENANCY_ID",
    "compartmentId": "$COMPARTMENT_ID",
    "compartmentName": "$COMPARTMENT_NAME",
    "tagNamespaceId": "$TAG_NAMESPACE_ID",
    "vcnId": "$VCN_ID",
    "internetGatewayId": "$IGW_ID",
    "natGatewayId": "$NAT_ID",
    "serviceGatewayId": "$SGW_ID",
    "publicSubnetId": "$PUBLIC_SUBNET_ID",
    "privateSubnetId": "$PRIVATE_SUBNET_ID",
    "objectStorageNamespace": "$OS_NAMESPACE",
    "objectStorageBucket": "$BUCKET_NAME",
    "autonomousDatabaseId": "$ATP_ID",
    "functionsAppId": "$FN_APP_ID",
    "apiGatewayId": "$API_GW_ID",
    "apiGatewayHostname": "$API_GW_HOSTNAME",
    "emailDelivery": {
        "emailDomainId": "$EMAIL_DOMAIN_ID",
        "emailDomain": "$EMAIL_DOMAIN",
        "senderId": "$EMAIL_SENDER_ID",
        "senderEmail": "$SENDER_EMAIL",
        "smtpHost": "$SMTP_HOST",
        "smtpUsername": "$SMTP_USERNAME"
    }
}
EOF
    log_success "Configuration saved to $CONFIG_FILE"
}

# ============================================================
# Pre-flight Checks
# ============================================================
preflight_checks() {
    log_step "Pre-flight Checks"

    # Check required commands
    check_command "oci"
    check_command "jq"

    # Verify OCI CLI configuration
    log_info "Verifying OCI CLI configuration..."
    if ! oci iam region list --output json &> /dev/null; then
        log_error "OCI CLI is not configured properly. Please run 'oci setup config' first."
        exit 1
    fi
    log_success "OCI CLI is configured"

    # Get tenancy ID
    TENANCY_ID=$(oci iam compartment list --query "data[0].\"compartment-id\"" --raw-output 2>/dev/null)
    if [[ -z "$TENANCY_ID" || "$TENANCY_ID" == "null" ]]; then
        log_error "Could not determine tenancy ID"
        exit 1
    fi
    log_info "Tenancy ID: $TENANCY_ID"

    # Get current region
    REGION=$(oci iam region-subscription list --query "data[?\"is-home-region\"].\"region-name\" | [0]" --raw-output 2>/dev/null)
    if [[ -z "$REGION" || "$REGION" == "null" ]]; then
        REGION=$(oci iam region-subscription list --query "data[0].\"region-name\"" --raw-output 2>/dev/null)
    fi
    log_info "Region: $REGION"
}

# ============================================================
# Step 1: Configuration
# ============================================================
configure_setup() {
    log_step "Step 1: Configuration"

    echo "Please configure the following settings:"
    echo

    prompt_with_default "Compartment name" "$DEFAULT_COMPARTMENT_NAME" "COMPARTMENT_NAME"
    prompt_with_default "Object Storage bucket name" "$DEFAULT_BUCKET_NAME" "BUCKET_NAME"
    prompt_with_default "Database name" "$DEFAULT_DB_NAME" "DB_NAME"
    prompt_with_default "Functions application name" "$DEFAULT_FN_APP_NAME" "FN_APP_NAME"
    prompt_with_default "API Gateway name" "$DEFAULT_API_GW_NAME" "API_GW_NAME"

    echo
    log_info "Email Delivery Configuration:"
    echo "  Enter your domain for sending emails (e.g., masashi-enokida.com)"
    echo "  Leave empty to skip Email Delivery setup"
    echo
    prompt_with_default "Email domain" "$DEFAULT_EMAIL_DOMAIN" "EMAIL_DOMAIN"

    if [[ -n "$EMAIL_DOMAIN" ]]; then
        prompt_with_default "Sender email prefix (e.g., noreply -> noreply@$EMAIL_DOMAIN)" "$DEFAULT_SENDER_EMAIL" "SENDER_EMAIL_PREFIX"
        SENDER_EMAIL="${SENDER_EMAIL_PREFIX}@${EMAIL_DOMAIN}"
    fi

    echo
    log_info "Database Admin Password Requirements:"
    echo "  - Minimum 12 characters"
    echo "  - At least one uppercase letter"
    echo "  - At least one lowercase letter"
    echo "  - At least one number"
    echo "  - Special characters allowed: _ # only"
    echo

    prompt_password "Enter database ADMIN password" "DB_PASSWORD"

    echo
    log_info "Configuration Summary:"
    echo "  - Region: $REGION"
    echo "  - Compartment: $COMPARTMENT_NAME"
    echo "  - Bucket: $BUCKET_NAME"
    echo "  - Database: $DB_NAME"
    echo "  - Functions App: $FN_APP_NAME"
    echo "  - API Gateway: $API_GW_NAME"
    if [[ -n "$EMAIL_DOMAIN" ]]; then
        echo "  - Email Domain: $EMAIL_DOMAIN"
        echo "  - Sender Email: $SENDER_EMAIL"
    else
        echo "  - Email Delivery: Skipped"
    fi
    echo

    if ! confirm_action "Proceed with this configuration?"; then
        log_warning "Setup cancelled by user"
        exit 0
    fi
}

# ============================================================
# Step 2: Create Compartment
# ============================================================
create_compartment() {
    log_step "Step 2: Create Compartment"

    # Check if compartment already exists
    local existing
    existing=$(oci iam compartment list \
        --compartment-id "$TENANCY_ID" \
        --name "$COMPARTMENT_NAME" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing" && "$existing" != "null" ]]; then
        log_warning "Compartment '$COMPARTMENT_NAME' already exists"
        COMPARTMENT_ID="$existing"
        log_info "Using existing compartment: $COMPARTMENT_ID"
        return
    fi

    log_info "Creating compartment: $COMPARTMENT_NAME"

    COMPARTMENT_ID=$(oci iam compartment create \
        --compartment-id "$TENANCY_ID" \
        --name "$COMPARTMENT_NAME" \
        --description "Masashi Enokida Pianist Website - Production Environment" \
        --query "data.id" --raw-output)

    log_success "Compartment created: $COMPARTMENT_ID"

    # Wait for compartment to be active
    log_info "Waiting for compartment to become active..."
    sleep 10

    wait_for_state \
        "oci iam compartment get --compartment-id '$COMPARTMENT_ID' --query 'data.\"lifecycle-state\"' --raw-output" \
        "ACTIVE" 30 5
}

# ============================================================
# Step 3: Create Cost Tracking Tags
# ============================================================
create_cost_tracking_tags() {
    log_step "Step 3: Create Cost Tracking Tags"

    local tag_namespace_name="EnokidaWebsite"

    # Check if tag namespace exists
    local existing_ns
    existing_ns=$(oci iam tag-namespace list \
        --compartment-id "$TENANCY_ID" \
        --query "data[?name=='$tag_namespace_name'] | [0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_ns" && "$existing_ns" != "null" ]]; then
        log_warning "Tag namespace '$tag_namespace_name' already exists"
        TAG_NAMESPACE_ID="$existing_ns"
    else
        log_info "Creating tag namespace: $tag_namespace_name"

        TAG_NAMESPACE_ID=$(oci iam tag-namespace create \
            --compartment-id "$TENANCY_ID" \
            --name "$tag_namespace_name" \
            --description "Cost tracking for Masashi Enokida website" \
            --query "data.id" --raw-output)

        log_success "Tag namespace created: $TAG_NAMESPACE_ID"
        sleep 5
    fi

    # Create tags
    local tags=("Project" "Environment" "CostCenter")

    for tag_name in "${tags[@]}"; do
        local existing_tag
        existing_tag=$(oci iam tag list \
            --tag-namespace-id "$TAG_NAMESPACE_ID" \
            --query "data[?name=='$tag_name'] | [0].id" --raw-output 2>/dev/null || echo "")

        if [[ -n "$existing_tag" && "$existing_tag" != "null" ]]; then
            log_info "Tag '$tag_name' already exists"
        else
            log_info "Creating tag: $tag_name"
            oci iam tag create \
                --tag-namespace-id "$TAG_NAMESPACE_ID" \
                --name "$tag_name" \
                --description "Tag for $tag_name tracking" > /dev/null
            log_success "Tag created: $tag_name"
        fi
    done

    # Build defined tags JSON for use in resource creation
    DEFINED_TAGS="{\"$tag_namespace_name\":{\"Project\":\"EnokidaWebsite\",\"Environment\":\"Production\",\"CostCenter\":\"Marketing\"}}"
}

# ============================================================
# Step 4: Create VCN and Networking
# ============================================================
create_networking() {
    log_step "Step 4: Create VCN and Networking"

    local vcn_name="enokida-vcn"

    # Check if VCN exists
    local existing_vcn
    existing_vcn=$(oci network vcn list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$vcn_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_vcn" && "$existing_vcn" != "null" ]]; then
        log_warning "VCN '$vcn_name' already exists"
        VCN_ID="$existing_vcn"
    else
        log_info "Creating VCN: $vcn_name"

        VCN_ID=$(oci network vcn create \
            --compartment-id "$COMPARTMENT_ID" \
            --display-name "$vcn_name" \
            --cidr-blocks "[\"$DEFAULT_VCN_CIDR\"]" \
            --dns-label "enokidavcn" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "VCN created: $VCN_ID"
    fi

    # Get default route table and security list
    local default_rt
    default_rt=$(oci network route-table list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --query "data[0].id" --raw-output)

    local default_sl
    default_sl=$(oci network security-list list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --query "data[0].id" --raw-output)

    # Create Internet Gateway
    local existing_igw
    existing_igw=$(oci network internet-gateway list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "enokida-igw" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_igw" && "$existing_igw" != "null" ]]; then
        log_info "Internet Gateway already exists"
        IGW_ID="$existing_igw"
    else
        log_info "Creating Internet Gateway..."

        IGW_ID=$(oci network internet-gateway create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "enokida-igw" \
            --is-enabled true \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Internet Gateway created: $IGW_ID"
    fi

    # Create NAT Gateway
    local existing_nat
    existing_nat=$(oci network nat-gateway list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "enokida-nat" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_nat" && "$existing_nat" != "null" ]]; then
        log_info "NAT Gateway already exists"
        NAT_ID="$existing_nat"
    else
        log_info "Creating NAT Gateway..."

        NAT_ID=$(oci network nat-gateway create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "enokida-nat" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "NAT Gateway created: $NAT_ID"
    fi

    # Create Service Gateway
    local existing_sgw
    existing_sgw=$(oci network service-gateway list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --query "data[?\"display-name\"=='enokida-sgw'] | [0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_sgw" && "$existing_sgw" != "null" ]]; then
        log_info "Service Gateway already exists"
        SGW_ID="$existing_sgw"
    else
        log_info "Creating Service Gateway..."

        # Get Oracle Services Network service ID
        local all_services_id
        all_services_id=$(oci network service list \
            --query "data[?contains(name, 'All')].id | [0]" --raw-output)

        SGW_ID=$(oci network service-gateway create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "enokida-sgw" \
            --services "[{\"serviceId\":\"$all_services_id\"}]" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Service Gateway created: $SGW_ID"
    fi

    # Create Public Route Table
    local public_rt_name="enokida-public-rt"
    local existing_public_rt
    existing_public_rt=$(oci network route-table list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$public_rt_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_public_rt" && "$existing_public_rt" != "null" ]]; then
        log_info "Public Route Table already exists"
        PUBLIC_RT_ID="$existing_public_rt"
    else
        log_info "Creating Public Route Table..."

        PUBLIC_RT_ID=$(oci network route-table create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$public_rt_name" \
            --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW_ID\"}]" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Public Route Table created: $PUBLIC_RT_ID"
    fi

    # Create Private Route Table
    local private_rt_name="enokida-private-rt"
    local existing_private_rt
    existing_private_rt=$(oci network route-table list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$private_rt_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_private_rt" && "$existing_private_rt" != "null" ]]; then
        log_info "Private Route Table already exists"
        PRIVATE_RT_ID="$existing_private_rt"
    else
        log_info "Creating Private Route Table..."

        PRIVATE_RT_ID=$(oci network route-table create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$private_rt_name" \
            --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$NAT_ID\"}]" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Private Route Table created: $PRIVATE_RT_ID"
    fi

    # Create Public Security List
    local public_sl_name="enokida-public-sl"
    local existing_public_sl
    existing_public_sl=$(oci network security-list list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$public_sl_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_public_sl" && "$existing_public_sl" != "null" ]]; then
        log_info "Public Security List already exists"
        PUBLIC_SL_ID="$existing_public_sl"
    else
        log_info "Creating Public Security List..."

        PUBLIC_SL_ID=$(oci network security-list create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$public_sl_name" \
            --egress-security-rules '[{"destination":"0.0.0.0/0","protocol":"all","isStateless":false}]' \
            --ingress-security-rules '[
                {"source":"0.0.0.0/0","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":443,"max":443}}},
                {"source":"0.0.0.0/0","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":80,"max":80}}}
            ]' \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Public Security List created: $PUBLIC_SL_ID"
    fi

    # Create Private Security List
    local private_sl_name="enokida-private-sl"
    local existing_private_sl
    existing_private_sl=$(oci network security-list list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$private_sl_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_private_sl" && "$existing_private_sl" != "null" ]]; then
        log_info "Private Security List already exists"
        PRIVATE_SL_ID="$existing_private_sl"
    else
        log_info "Creating Private Security List..."

        PRIVATE_SL_ID=$(oci network security-list create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$private_sl_name" \
            --egress-security-rules '[{"destination":"0.0.0.0/0","protocol":"all","isStateless":false}]' \
            --ingress-security-rules '[{"source":"10.0.0.0/16","protocol":"all","isStateless":false}]' \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Private Security List created: $PRIVATE_SL_ID"
    fi

    # Create Public Subnet
    local public_subnet_name="enokida-public-subnet"
    local existing_public_subnet
    existing_public_subnet=$(oci network subnet list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$public_subnet_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_public_subnet" && "$existing_public_subnet" != "null" ]]; then
        log_info "Public Subnet already exists"
        PUBLIC_SUBNET_ID="$existing_public_subnet"
    else
        log_info "Creating Public Subnet..."

        PUBLIC_SUBNET_ID=$(oci network subnet create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$public_subnet_name" \
            --cidr-block "$DEFAULT_PUBLIC_SUBNET_CIDR" \
            --dns-label "public" \
            --route-table-id "$PUBLIC_RT_ID" \
            --security-list-ids "[\"$PUBLIC_SL_ID\"]" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Public Subnet created: $PUBLIC_SUBNET_ID"
    fi

    # Create Private Subnet
    local private_subnet_name="enokida-private-subnet"
    local existing_private_subnet
    existing_private_subnet=$(oci network subnet list \
        --compartment-id "$COMPARTMENT_ID" \
        --vcn-id "$VCN_ID" \
        --display-name "$private_subnet_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_private_subnet" && "$existing_private_subnet" != "null" ]]; then
        log_info "Private Subnet already exists"
        PRIVATE_SUBNET_ID="$existing_private_subnet"
    else
        log_info "Creating Private Subnet..."

        PRIVATE_SUBNET_ID=$(oci network subnet create \
            --compartment-id "$COMPARTMENT_ID" \
            --vcn-id "$VCN_ID" \
            --display-name "$private_subnet_name" \
            --cidr-block "$DEFAULT_PRIVATE_SUBNET_CIDR" \
            --dns-label "private" \
            --prohibit-public-ip-on-vnic true \
            --route-table-id "$PRIVATE_RT_ID" \
            --security-list-ids "[\"$PRIVATE_SL_ID\"]" \
            --wait-for-state AVAILABLE \
            --query "data.id" --raw-output)

        log_success "Private Subnet created: $PRIVATE_SUBNET_ID"
    fi

    log_info "Networking Summary:"
    echo "  - VCN: $VCN_ID"
    echo "  - Public Subnet: $PUBLIC_SUBNET_ID"
    echo "  - Private Subnet: $PRIVATE_SUBNET_ID"
}

# ============================================================
# Step 5: Create Object Storage Bucket
# ============================================================
create_object_storage() {
    log_step "Step 5: Create Object Storage Bucket"

    # Get namespace
    OS_NAMESPACE=$(oci os ns get --query "data" --raw-output)
    log_info "Object Storage Namespace: $OS_NAMESPACE"

    # Check if bucket exists
    local existing_bucket
    existing_bucket=$(oci os bucket get \
        --bucket-name "$BUCKET_NAME" \
        --namespace-name "$OS_NAMESPACE" \
        --query "data.name" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_bucket" && "$existing_bucket" != "null" ]]; then
        log_warning "Bucket '$BUCKET_NAME' already exists"
        return
    fi

    log_info "Creating Object Storage bucket: $BUCKET_NAME"

    oci os bucket create \
        --compartment-id "$COMPARTMENT_ID" \
        --name "$BUCKET_NAME" \
        --namespace-name "$OS_NAMESPACE" \
        --public-access-type "ObjectRead" \
        --storage-tier "Standard" \
        --versioning "Disabled"

    log_success "Object Storage bucket created"
    log_info "Static files URL: https://objectstorage.$REGION.oraclecloud.com/n/$OS_NAMESPACE/b/$BUCKET_NAME/o/"
}

# ============================================================
# Step 6: Create Autonomous Database
# ============================================================
create_autonomous_database() {
    log_step "Step 6: Create Autonomous Database (Always Free)"

    local db_display_name="Enokida Website Database"

    # Check if database exists
    local existing_db
    existing_db=$(oci db autonomous-database list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$db_display_name" \
        --lifecycle-state AVAILABLE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_db" && "$existing_db" != "null" ]]; then
        log_warning "Autonomous Database '$db_display_name' already exists"
        ATP_ID="$existing_db"
        return
    fi

    log_info "Creating Autonomous Database: $DB_NAME"
    log_info "This may take several minutes..."

    ATP_ID=$(oci db autonomous-database create \
        --compartment-id "$COMPARTMENT_ID" \
        --db-name "$DB_NAME" \
        --display-name "$db_display_name" \
        --admin-password "$DB_PASSWORD" \
        --cpu-core-count 1 \
        --data-storage-size-in-tbs 1 \
        --db-workload "OLTP" \
        --is-free-tier true \
        --is-auto-scaling-enabled false \
        --license-model "LICENSE_INCLUDED" \
        --wait-for-state AVAILABLE \
        --query "data.id" --raw-output)

    log_success "Autonomous Database created: $ATP_ID"

    # Download wallet
    log_info "Downloading database wallet..."

    local wallet_dir="${CONFIG_DIR}/wallet"
    mkdir -p "$wallet_dir"

    oci db autonomous-database generate-wallet \
        --autonomous-database-id "$ATP_ID" \
        --password "$DB_PASSWORD" \
        --file "${wallet_dir}/wallet.zip"

    # Unzip wallet
    if command -v unzip &> /dev/null; then
        unzip -o "${wallet_dir}/wallet.zip" -d "$wallet_dir" > /dev/null
        log_success "Wallet downloaded and extracted to: $wallet_dir"
    else
        log_warning "unzip not found. Please extract ${wallet_dir}/wallet.zip manually"
    fi
}

# ============================================================
# Step 7: Create Functions Application
# ============================================================
create_functions_application() {
    log_step "Step 7: Create Functions Application"

    # Check if application exists
    local existing_app
    existing_app=$(oci fn application list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$FN_APP_NAME" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_app" && "$existing_app" != "null" ]]; then
        log_warning "Functions Application '$FN_APP_NAME' already exists"
        FN_APP_ID="$existing_app"
        return
    fi

    log_info "Creating Functions Application: $FN_APP_NAME"

    FN_APP_ID=$(oci fn application create \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$FN_APP_NAME" \
        --subnet-ids "[\"$PRIVATE_SUBNET_ID\"]" \
        --query "data.id" --raw-output)

    log_success "Functions Application created: $FN_APP_ID"

    # Wait for application to be active
    sleep 5
}

# ============================================================
# Step 8: Create API Gateway
# ============================================================
create_api_gateway() {
    log_step "Step 8: Create API Gateway"

    # Check if gateway exists (check both ACTIVE and CREATING states)
    local existing_gw
    existing_gw=$(oci api-gateway gateway list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$API_GW_NAME" \
        --query "data.items[?\"lifecycle-state\"=='ACTIVE' || \"lifecycle-state\"=='CREATING'] | [0].id" \
        --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_gw" && "$existing_gw" != "null" ]]; then
        log_warning "API Gateway '$API_GW_NAME' already exists"
        API_GW_ID="$existing_gw"

        # Wait if still creating
        local gw_state
        gw_state=$(oci api-gateway gateway get --gateway-id "$API_GW_ID" \
            --query "data.\"lifecycle-state\"" --raw-output 2>/dev/null)

        if [[ "$gw_state" == "CREATING" ]]; then
            log_info "API Gateway is still being created, waiting..."
            wait_for_api_gateway_active "$API_GW_ID"
        fi
    else
        log_info "Creating API Gateway: $API_GW_NAME"
        log_info "This may take 2-5 minutes..."

        # Create without --wait-for-state to avoid timeout issues
        local create_output
        create_output=$(oci api-gateway gateway create \
            --compartment-id "$COMPARTMENT_ID" \
            --display-name "$API_GW_NAME" \
            --endpoint-type "PUBLIC" \
            --subnet-id "$PUBLIC_SUBNET_ID" 2>&1)

        local create_exit_code=$?

        if [[ $create_exit_code -ne 0 ]]; then
            log_error "Failed to create API Gateway:"
            echo "$create_output"
            exit 1
        fi

        API_GW_ID=$(echo "$create_output" | jq -r '.data.id')

        if [[ -z "$API_GW_ID" || "$API_GW_ID" == "null" ]]; then
            log_error "Failed to get API Gateway ID from response:"
            echo "$create_output"
            exit 1
        fi

        log_info "API Gateway creation initiated: $API_GW_ID"

        # Wait for ACTIVE state with progress
        wait_for_api_gateway_active "$API_GW_ID"

        log_success "API Gateway created: $API_GW_ID"
    fi

    # Get gateway hostname
    API_GW_HOSTNAME=$(oci api-gateway gateway get \
        --gateway-id "$API_GW_ID" \
        --query "data.hostname" --raw-output)

    log_info "API Gateway Hostname: $API_GW_HOSTNAME"

    # Create initial health check deployment
    log_info "Creating initial API deployment with health check..."

    local deployment_spec='{
        "loggingPolicies": {
            "accessLog": {"isEnabled": true},
            "executionLog": {"isEnabled": true, "logLevel": "INFO"}
        },
        "routes": [
            {
                "path": "/health",
                "methods": ["GET"],
                "backend": {
                    "type": "STOCK_RESPONSE_BACKEND",
                    "status": 200,
                    "body": "{\"status\":\"healthy\"}"
                }
            }
        ]
    }'

    # Check if deployment exists
    local existing_deployment
    existing_deployment=$(oci api-gateway deployment list \
        --compartment-id "$COMPARTMENT_ID" \
        --gateway-id "$API_GW_ID" \
        --display-name "enokida-api-v1" \
        --query "data.items[?\"lifecycle-state\"=='ACTIVE' || \"lifecycle-state\"=='CREATING'] | [0].id" \
        --raw-output 2>/dev/null || echo "")

    if [[ -z "$existing_deployment" || "$existing_deployment" == "null" ]]; then
        log_info "Creating API deployment..."

        local deploy_output
        deploy_output=$(oci api-gateway deployment create \
            --compartment-id "$COMPARTMENT_ID" \
            --gateway-id "$API_GW_ID" \
            --display-name "enokida-api-v1" \
            --path-prefix "/api" \
            --specification "$deployment_spec" 2>&1)

        local deploy_exit_code=$?

        if [[ $deploy_exit_code -ne 0 ]]; then
            log_error "Failed to create API deployment:"
            echo "$deploy_output"
            exit 1
        fi

        local deployment_id
        deployment_id=$(echo "$deploy_output" | jq -r '.data.id')

        # Wait for deployment to be active
        log_info "Waiting for API deployment to become ACTIVE..."
        for ((i=1; i<=30; i++)); do
            local dep_state
            dep_state=$(oci api-gateway deployment get \
                --deployment-id "$deployment_id" \
                --query "data.\"lifecycle-state\"" \
                --raw-output 2>/dev/null || echo "UNKNOWN")

            printf "\r  [%d/30] Status: %-15s" "$i" "$dep_state"

            if [[ "$dep_state" == "ACTIVE" ]]; then
                echo
                log_success "API deployment created"
                break
            elif [[ "$dep_state" == "FAILED" ]]; then
                echo
                log_error "API deployment creation failed!"
                exit 1
            fi

            sleep 5
        done
    else
        log_info "API deployment already exists"
    fi
}

# ============================================================
# Step 9: Setup Email Delivery (Optional)
# ============================================================
setup_email_delivery() {
    log_step "Step 9: Setup Email Delivery"

    # Skip if no email domain configured
    if [[ -z "$EMAIL_DOMAIN" ]]; then
        log_warning "Email domain not configured, skipping Email Delivery setup"
        EMAIL_DOMAIN_ID=""
        EMAIL_SENDER_ID=""
        SMTP_USERNAME=""
        SMTP_PASSWORD=""
        SMTP_HOST=""
        return
    fi

    log_info "Setting up Email Delivery for domain: $EMAIL_DOMAIN"

    # Get SMTP endpoint for the region
    SMTP_HOST="smtp.email.${REGION}.oci.oraclecloud.com"
    log_info "SMTP Host: $SMTP_HOST"

    # Step 1: Create Email Domain
    local existing_domain
    existing_domain=$(oci email domain list \
        --compartment-id "$COMPARTMENT_ID" \
        --name "$EMAIL_DOMAIN" \
        --query "data.items[?\"lifecycle-state\"!='DELETED'] | [0].id" \
        --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_domain" && "$existing_domain" != "null" ]]; then
        log_warning "Email domain '$EMAIL_DOMAIN' already exists"
        EMAIL_DOMAIN_ID="$existing_domain"
    else
        log_info "Creating Email Domain: $EMAIL_DOMAIN"

        local domain_output
        domain_output=$(oci email domain create \
            --compartment-id "$COMPARTMENT_ID" \
            --name "$EMAIL_DOMAIN" \
            --description "Email domain for Masashi Enokida website" 2>&1)

        local domain_exit_code=$?

        if [[ $domain_exit_code -ne 0 ]]; then
            log_error "Failed to create Email Domain:"
            echo "$domain_output"
            log_warning "Continuing without Email Delivery..."
            EMAIL_DOMAIN_ID=""
            return
        fi

        EMAIL_DOMAIN_ID=$(echo "$domain_output" | jq -r '.data.id')
        log_success "Email Domain created: $EMAIL_DOMAIN_ID"

        # Wait for domain to be active
        log_info "Waiting for Email Domain to become ACTIVE..."
        for ((i=1; i<=30; i++)); do
            local domain_state
            domain_state=$(oci email domain get \
                --email-domain-id "$EMAIL_DOMAIN_ID" \
                --query "data.\"lifecycle-state\"" \
                --raw-output 2>/dev/null || echo "UNKNOWN")

            printf "\r  [%d/30] Status: %-15s" "$i" "$domain_state"

            if [[ "$domain_state" == "ACTIVE" ]]; then
                echo
                break
            elif [[ "$domain_state" == "FAILED" ]]; then
                echo
                log_error "Email Domain creation failed!"
                return
            fi

            sleep 5
        done
    fi

    # Get DNS records needed for domain verification
    log_info "Fetching DNS records for domain verification..."
    local dkim_records
    dkim_records=$(oci email dkim list \
        --email-domain-id "$EMAIL_DOMAIN_ID" \
        --query "data.items[0]" 2>/dev/null || echo "")

    if [[ -n "$dkim_records" && "$dkim_records" != "null" ]]; then
        echo
        log_info "DNS Records Required for Domain Verification:"
        echo "  Add the following DNS records to your domain:"
        echo

        local dkim_id
        dkim_id=$(echo "$dkim_records" | jq -r '.id')

        if [[ -n "$dkim_id" && "$dkim_id" != "null" ]]; then
            local dkim_details
            dkim_details=$(oci email dkim get --dkim-id "$dkim_id" 2>/dev/null || echo "")

            if [[ -n "$dkim_details" ]]; then
                local cname_name cname_value
                cname_name=$(echo "$dkim_details" | jq -r '.data."cname-record-value"' 2>/dev/null || echo "")
                cname_value=$(echo "$dkim_details" | jq -r '.data."dns-subdomain-name"' 2>/dev/null || echo "")

                if [[ -n "$cname_name" && "$cname_name" != "null" ]]; then
                    echo "  DKIM CNAME Record:"
                    echo "    Name: ${cname_value}._domainkey.${EMAIL_DOMAIN}"
                    echo "    Value: $cname_name"
                    echo
                fi
            fi
        fi

        # SPF record recommendation
        echo "  SPF TXT Record (recommended):"
        echo "    Name: $EMAIL_DOMAIN"
        echo "    Value: v=spf1 include:rp.oracleemaildelivery.com ~all"
        echo
    fi

    # Step 2: Create Approved Sender
    local existing_sender
    existing_sender=$(oci email sender list \
        --compartment-id "$COMPARTMENT_ID" \
        --email-address "$SENDER_EMAIL" \
        --query "data.items[?\"lifecycle-state\"=='ACTIVE'] | [0].id" \
        --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_sender" && "$existing_sender" != "null" ]]; then
        log_warning "Approved Sender '$SENDER_EMAIL' already exists"
        EMAIL_SENDER_ID="$existing_sender"
    else
        log_info "Creating Approved Sender: $SENDER_EMAIL"

        local sender_output
        sender_output=$(oci email sender create \
            --compartment-id "$COMPARTMENT_ID" \
            --email-address "$SENDER_EMAIL" 2>&1)

        local sender_exit_code=$?

        if [[ $sender_exit_code -ne 0 ]]; then
            log_error "Failed to create Approved Sender:"
            echo "$sender_output"
            EMAIL_SENDER_ID=""
        else
            EMAIL_SENDER_ID=$(echo "$sender_output" | jq -r '.data.id')
            log_success "Approved Sender created: $EMAIL_SENDER_ID"

            # Wait for sender to be active
            log_info "Waiting for Approved Sender to become ACTIVE..."
            for ((i=1; i<=20; i++)); do
                local sender_state
                sender_state=$(oci email sender get \
                    --sender-id "$EMAIL_SENDER_ID" \
                    --query "data.\"lifecycle-state\"" \
                    --raw-output 2>/dev/null || echo "UNKNOWN")

                printf "\r  [%d/20] Status: %-15s" "$i" "$sender_state"

                if [[ "$sender_state" == "ACTIVE" ]]; then
                    echo
                    log_success "Approved Sender is active"
                    break
                fi

                sleep 3
            done
        fi
    fi

    # Step 3: Create SMTP Credentials
    log_info "Creating SMTP Credentials..."

    # Get user OCID
    local user_id
    user_id=$(oci iam user list \
        --compartment-id "$TENANCY_ID" \
        --query "data[?\"lifecycle-state\"=='ACTIVE'] | [0].id" \
        --raw-output 2>/dev/null)

    if [[ -z "$user_id" || "$user_id" == "null" ]]; then
        log_warning "Could not get user ID for SMTP credentials"
        log_info "Please create SMTP credentials manually in OCI Console"
        SMTP_USERNAME=""
        SMTP_PASSWORD=""
    else
        # Check if SMTP credential already exists
        local existing_smtp
        existing_smtp=$(oci iam smtp-credential list \
            --user-id "$user_id" \
            --query "data[?\"lifecycle-state\"=='ACTIVE'] | [0].id" \
            --raw-output 2>/dev/null || echo "")

        if [[ -n "$existing_smtp" && "$existing_smtp" != "null" ]]; then
            log_warning "SMTP credentials already exist"
            log_info "Using existing SMTP credentials. Password was shown at creation time."
            SMTP_USERNAME=$(oci iam smtp-credential list \
                --user-id "$user_id" \
                --query "data[?\"lifecycle-state\"=='ACTIVE'] | [0].username" \
                --raw-output 2>/dev/null || echo "")
            SMTP_PASSWORD="(existing - check your records)"
        else
            local smtp_output
            smtp_output=$(oci iam smtp-credential create \
                --user-id "$user_id" \
                --description "SMTP credential for Enokida website" 2>&1)

            local smtp_exit_code=$?

            if [[ $smtp_exit_code -ne 0 ]]; then
                log_error "Failed to create SMTP credentials:"
                echo "$smtp_output"
                SMTP_USERNAME=""
                SMTP_PASSWORD=""
            else
                SMTP_USERNAME=$(echo "$smtp_output" | jq -r '.data.username')
                SMTP_PASSWORD=$(echo "$smtp_output" | jq -r '.data.password')

                log_success "SMTP credentials created"
                echo
                log_warning "IMPORTANT: Save these SMTP credentials! The password cannot be retrieved again."
                echo "  SMTP Host: $SMTP_HOST"
                echo "  SMTP Port: 587 (TLS) or 25"
                echo "  SMTP Username: $SMTP_USERNAME"
                echo "  SMTP Password: $SMTP_PASSWORD"
                echo

                # Save to a separate secure file
                local smtp_creds_file="${CONFIG_DIR}/smtp-credentials.txt"
                cat > "$smtp_creds_file" << SMTP_EOF
# OCI Email Delivery SMTP Credentials
# Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# IMPORTANT: Keep this file secure and do not commit to version control!

SMTP_HOST=$SMTP_HOST
SMTP_PORT=587
SMTP_USERNAME=$SMTP_USERNAME
SMTP_PASSWORD=$SMTP_PASSWORD
SENDER_EMAIL=$SENDER_EMAIL
SMTP_EOF
                chmod 600 "$smtp_creds_file"
                log_info "SMTP credentials saved to: $smtp_creds_file"
            fi
        fi
    fi

    echo
    log_info "Email Delivery Setup Summary:"
    echo "  - Email Domain: $EMAIL_DOMAIN (ID: $EMAIL_DOMAIN_ID)"
    echo "  - Sender Email: $SENDER_EMAIL"
    echo "  - SMTP Host: $SMTP_HOST"
    if [[ -n "$SMTP_USERNAME" ]]; then
        echo "  - SMTP Username: $SMTP_USERNAME"
    fi
    echo
    log_warning "Remember to verify your domain by adding the DNS records shown above!"
}

# ============================================================
# Print Summary
# ============================================================
print_summary() {
    log_step "Setup Complete!"

    echo -e "${GREEN}All OCI resources have been created successfully!${NC}"
    echo
    echo "Resources Created:"
    echo "  - Compartment: $COMPARTMENT_NAME ($COMPARTMENT_ID)"
    echo "  - VCN: enokida-vcn"
    echo "  - Object Storage Bucket: $BUCKET_NAME"
    echo "  - Autonomous Database: $DB_NAME"
    echo "  - Functions Application: $FN_APP_NAME"
    echo "  - API Gateway: https://$API_GW_HOSTNAME/api"
    if [[ -n "$EMAIL_DOMAIN" ]]; then
        echo "  - Email Domain: $EMAIL_DOMAIN"
        echo "  - Sender Email: $SENDER_EMAIL"
    fi
    echo
    echo "Configuration saved to: $CONFIG_FILE"
    echo
    echo "Next Steps:"
    echo "  1. Configure environment variables in Functions Application"
    if [[ -n "$EMAIL_DOMAIN" ]]; then
        echo "  2. Add DNS records to verify your email domain (DKIM + SPF)"
        echo "  3. Run database migrations: ./migrate.sh"
        echo "  4. Deploy the application: ./deploy.sh"
    else
        echo "  2. Run database migrations: ./migrate.sh"
        echo "  3. Deploy the application: ./deploy.sh"
    fi
    echo
    echo "Database Connection:"
    echo "  - Wallet location: ${CONFIG_DIR}/wallet/"
    echo "  - TNS Name: ${DB_NAME}_low (for connection string)"
    echo
    if [[ -n "$EMAIL_DOMAIN" && -n "$SMTP_USERNAME" ]]; then
        echo "Email Delivery:"
        echo "  - SMTP Host: $SMTP_HOST"
        echo "  - SMTP Port: 587 (TLS)"
        echo "  - SMTP Username: $SMTP_USERNAME"
        echo "  - Credentials file: ${CONFIG_DIR}/smtp-credentials.txt"
        echo
    fi
}

# ============================================================
# Main Execution
# ============================================================
main() {
    echo
    echo "========================================================"
    echo "  OCI Infrastructure Setup for Masashi Enokida Website  "
    echo "========================================================"
    echo

    preflight_checks
    configure_setup
    create_compartment
    create_cost_tracking_tags
    create_networking
    create_object_storage
    create_autonomous_database
    create_functions_application
    create_api_gateway
    setup_email_delivery
    save_config
    print_summary
}

main "$@"
