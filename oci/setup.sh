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
    "emailSenderId": "$EMAIL_SENDER_ID"
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

    # Check if gateway exists
    local existing_gw
    existing_gw=$(oci api-gateway gateway list \
        --compartment-id "$COMPARTMENT_ID" \
        --display-name "$API_GW_NAME" \
        --lifecycle-state ACTIVE \
        --query "data.items[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_gw" && "$existing_gw" != "null" ]]; then
        log_warning "API Gateway '$API_GW_NAME' already exists"
        API_GW_ID="$existing_gw"
    else
        log_info "Creating API Gateway: $API_GW_NAME"
        log_info "This may take several minutes..."

        API_GW_ID=$(oci api-gateway gateway create \
            --compartment-id "$COMPARTMENT_ID" \
            --display-name "$API_GW_NAME" \
            --endpoint-type "PUBLIC" \
            --subnet-id "$PUBLIC_SUBNET_ID" \
            --wait-for-state ACTIVE \
            --query "data.id" --raw-output)

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
        --lifecycle-state ACTIVE \
        --query "data.items[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -z "$existing_deployment" || "$existing_deployment" == "null" ]]; then
        oci api-gateway deployment create \
            --compartment-id "$COMPARTMENT_ID" \
            --gateway-id "$API_GW_ID" \
            --display-name "enokida-api-v1" \
            --path-prefix "/api" \
            --specification "$deployment_spec" \
            --wait-for-state ACTIVE > /dev/null

        log_success "API deployment created"
    else
        log_info "API deployment already exists"
    fi
}

# ============================================================
# Step 9: Setup Email Delivery (Optional)
# ============================================================
setup_email_delivery() {
    log_step "Step 9: Setup Email Delivery"

    log_info "Email Delivery requires manual configuration in OCI Console:"
    echo "  1. Go to Email Delivery in OCI Console"
    echo "  2. Create an Email Domain"
    echo "  3. Verify the domain with DNS records"
    echo "  4. Create an Approved Sender"
    echo "  5. Generate SMTP credentials"
    echo
    log_warning "Skipping automated Email Delivery setup"

    EMAIL_SENDER_ID="manual-configuration-required"
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
    echo
    echo "Configuration saved to: $CONFIG_FILE"
    echo
    echo "Next Steps:"
    echo "  1. Configure environment variables in Functions Application"
    echo "  2. Set up Email Delivery domain in OCI Console"
    echo "  3. Run database migrations: ./migrate.sh"
    echo "  4. Deploy the application: ./deploy.sh"
    echo
    echo "Database Connection:"
    echo "  - Wallet location: ${CONFIG_DIR}/wallet/"
    echo "  - TNS Name: ${DB_NAME}_low (for connection string)"
    echo
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
