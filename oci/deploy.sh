#!/bin/bash
# ============================================================
# deploy.sh - Deployment Script for Masashi Enokida Website
# ============================================================
# Prerequisites:
#   - setup.sh has been run successfully
#   - OCI CLI configured
#   - Docker installed (for Functions)
#   - Node.js and npm installed (for frontend)
#
# Usage:
#   ./deploy.sh              # Deploy everything
#   ./deploy.sh frontend     # Deploy frontend only
#   ./deploy.sh functions    # Deploy functions only
#   ./deploy.sh gateway      # Update API Gateway only
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
NC='\033[0m'

# ============================================================
# Configuration
# ============================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="${SCRIPT_DIR}/config/setup-config.json"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
FUNCTIONS_DIR="${PROJECT_DIR}/functions"

# ============================================================
# Helper Functions
# ============================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

check_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration file not found: $CONFIG_FILE\nPlease run setup.sh first."
    fi
}

load_config() {
    check_config

    REGION=$(jq -r '.region' "$CONFIG_FILE")
    COMPARTMENT_ID=$(jq -r '.compartmentId' "$CONFIG_FILE")
    OS_NAMESPACE=$(jq -r '.objectStorageNamespace' "$CONFIG_FILE")
    BUCKET_NAME=$(jq -r '.objectStorageBucket' "$CONFIG_FILE")
    FN_APP_ID=$(jq -r '.functionsAppId' "$CONFIG_FILE")
    API_GW_ID=$(jq -r '.apiGatewayId' "$CONFIG_FILE")
    API_GW_HOSTNAME=$(jq -r '.apiGatewayHostname' "$CONFIG_FILE")

    log_info "Configuration loaded from: $CONFIG_FILE"
}

# ============================================================
# Frontend Deployment
# ============================================================
build_frontend() {
    log_step "Building Frontend (Next.js Static Export)"

    if [[ ! -d "$FRONTEND_DIR" ]]; then
        log_error "Frontend directory not found: $FRONTEND_DIR"
    fi

    cd "$FRONTEND_DIR"

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci

    # Build with static export
    log_info "Building Next.js application..."
    npm run build

    # Verify output
    if [[ ! -d "out" ]]; then
        log_error "Build failed: 'out' directory not found. Ensure next.config.ts has output: 'export'"
    fi

    log_success "Frontend build complete"
    cd "$PROJECT_DIR"
}

upload_static_files() {
    log_step "Uploading Static Files to Object Storage"

    local out_dir="${FRONTEND_DIR}/out"

    if [[ ! -d "$out_dir" ]]; then
        log_error "Build output not found. Run 'deploy.sh frontend' or build first."
    fi

    local total_files
    total_files=$(find "$out_dir" -type f | wc -l | tr -d ' ')
    local uploaded=0

    log_info "Uploading $total_files files to bucket: $BUCKET_NAME"

    find "$out_dir" -type f | while read -r file; do
        local relative_path="${file#$out_dir/}"

        # Determine content type
        local content_type="application/octet-stream"
        case "$file" in
            *.html) content_type="text/html; charset=utf-8" ;;
            *.css)  content_type="text/css; charset=utf-8" ;;
            *.js)   content_type="application/javascript; charset=utf-8" ;;
            *.json) content_type="application/json; charset=utf-8" ;;
            *.svg)  content_type="image/svg+xml" ;;
            *.png)  content_type="image/png" ;;
            *.jpg|*.jpeg) content_type="image/jpeg" ;;
            *.webp) content_type="image/webp" ;;
            *.gif)  content_type="image/gif" ;;
            *.woff2) content_type="font/woff2" ;;
            *.woff) content_type="font/woff" ;;
            *.ttf)  content_type="font/ttf" ;;
            *.ico)  content_type="image/x-icon" ;;
            *.xml)  content_type="application/xml" ;;
            *.txt)  content_type="text/plain; charset=utf-8" ;;
        esac

        # Upload file
        oci os object put \
            --bucket-name "$BUCKET_NAME" \
            --namespace-name "$OS_NAMESPACE" \
            --name "$relative_path" \
            --file "$file" \
            --content-type "$content_type" \
            --force > /dev/null 2>&1

        uploaded=$((uploaded + 1))
        printf "\r  Uploaded: %d/%d files" "$uploaded" "$total_files"
    done

    echo
    log_success "All static files uploaded"
    log_info "Static site URL: https://objectstorage.$REGION.oraclecloud.com/n/$OS_NAMESPACE/b/$BUCKET_NAME/o/index.html"
}

deploy_frontend() {
    build_frontend
    upload_static_files
}

# ============================================================
# Functions Deployment
# ============================================================
login_to_registry() {
    log_info "Logging into OCI Container Registry..."

    local auth_token
    log_warning "You need to create an Auth Token in OCI Console if you haven't already"
    read -sp "Enter your OCI Auth Token: " auth_token
    echo

    local username="${OS_NAMESPACE}/$(oci iam user get --user-id "$(oci iam user list --query 'data[0].id' --raw-output)" --query 'data.name' --raw-output 2>/dev/null || echo 'oracleidentitycloudservice/your-email')"

    echo "$auth_token" | docker login "${REGION}.ocir.io" -u "$username" --password-stdin

    log_success "Logged into OCI Container Registry"
}

build_and_push_function() {
    local func_name="$1"
    local func_dir="${FUNCTIONS_DIR}/${func_name}"

    if [[ ! -d "$func_dir" ]]; then
        log_warning "Function directory not found: $func_dir, skipping..."
        return 1
    fi

    log_info "Building function: $func_name"

    local registry="${REGION}.ocir.io/${OS_NAMESPACE}/enokida-functions"
    local tag
    tag=$(date +%Y%m%d%H%M%S)
    local image_tag="${registry}/${func_name}:${tag}"

    cd "$func_dir"

    # Build Docker image
    docker build -t "$image_tag" .

    # Push to registry
    log_info "Pushing image: $image_tag"
    docker push "$image_tag"

    cd "$PROJECT_DIR"

    # Return the image tag
    echo "$image_tag"
}

deploy_function() {
    local func_name="$1"
    local image_tag="$2"

    local fn_display_name="${func_name}-function"

    # Check if function exists
    local existing_fn
    existing_fn=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "$fn_display_name" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$existing_fn" && "$existing_fn" != "null" ]]; then
        log_info "Updating existing function: $fn_display_name"

        oci fn function update \
            --function-id "$existing_fn" \
            --image "$image_tag" \
            --memory-in-mbs 256 \
            --timeout-in-seconds 60 > /dev/null

        log_success "Function updated: $fn_display_name"
    else
        log_info "Creating new function: $fn_display_name"

        oci fn function create \
            --application-id "$FN_APP_ID" \
            --display-name "$fn_display_name" \
            --image "$image_tag" \
            --memory-in-mbs 256 \
            --timeout-in-seconds 60 > /dev/null

        log_success "Function created: $fn_display_name"
    fi
}

deploy_functions() {
    log_step "Deploying OCI Functions"

    # Login to registry
    login_to_registry

    # List of functions to deploy
    local functions=("auth" "stripe" "contact" "members" "blog")

    for func_name in "${functions[@]}"; do
        if [[ -d "${FUNCTIONS_DIR}/${func_name}" ]]; then
            local image_tag
            image_tag=$(build_and_push_function "$func_name")

            if [[ -n "$image_tag" ]]; then
                deploy_function "$func_name" "$image_tag"
            fi
        else
            log_warning "Skipping $func_name: directory not found"
        fi
    done

    log_success "All functions deployed"
}

# ============================================================
# API Gateway Deployment
# ============================================================
update_api_gateway() {
    log_step "Updating API Gateway Routes"

    # Get function IDs
    local auth_fn_id stripe_fn_id contact_fn_id members_fn_id blog_fn_id

    auth_fn_id=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "auth-function" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    stripe_fn_id=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "stripe-function" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    contact_fn_id=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "contact-function" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    members_fn_id=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "members-function" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    blog_fn_id=$(oci fn function list \
        --application-id "$FN_APP_ID" \
        --display-name "blog-function" \
        --lifecycle-state ACTIVE \
        --query "data[0].id" --raw-output 2>/dev/null || echo "")

    # Build routes array
    local routes='[]'

    # Health check route (always present)
    routes=$(echo "$routes" | jq '. + [{
        "path": "/health",
        "methods": ["GET"],
        "backend": {
            "type": "STOCK_RESPONSE_BACKEND",
            "status": 200,
            "body": "{\"status\":\"healthy\"}"
        }
    }]')

    # Add function routes if functions exist
    if [[ -n "$auth_fn_id" && "$auth_fn_id" != "null" ]]; then
        routes=$(echo "$routes" | jq --arg fn_id "$auth_fn_id" '. + [{
            "path": "/auth/{action*}",
            "methods": ["GET", "POST", "OPTIONS"],
            "backend": {
                "type": "ORACLE_FUNCTIONS_BACKEND",
                "functionId": $fn_id
            }
        }]')
        log_info "Added auth routes"
    fi

    if [[ -n "$stripe_fn_id" && "$stripe_fn_id" != "null" ]]; then
        routes=$(echo "$routes" | jq --arg fn_id "$stripe_fn_id" '. + [
            {
                "path": "/stripe/webhook",
                "methods": ["POST"],
                "backend": {
                    "type": "ORACLE_FUNCTIONS_BACKEND",
                    "functionId": $fn_id
                }
            },
            {
                "path": "/stripe/{action*}",
                "methods": ["GET", "POST", "OPTIONS"],
                "backend": {
                    "type": "ORACLE_FUNCTIONS_BACKEND",
                    "functionId": $fn_id
                }
            }
        ]')
        log_info "Added stripe routes"
    fi

    if [[ -n "$contact_fn_id" && "$contact_fn_id" != "null" ]]; then
        routes=$(echo "$routes" | jq --arg fn_id "$contact_fn_id" '. + [{
            "path": "/contact",
            "methods": ["POST", "OPTIONS"],
            "backend": {
                "type": "ORACLE_FUNCTIONS_BACKEND",
                "functionId": $fn_id
            }
        }]')
        log_info "Added contact routes"
    fi

    if [[ -n "$members_fn_id" && "$members_fn_id" != "null" ]]; then
        routes=$(echo "$routes" | jq --arg fn_id "$members_fn_id" '. + [{
            "path": "/members/{action*}",
            "methods": ["GET", "POST", "PUT", "OPTIONS"],
            "backend": {
                "type": "ORACLE_FUNCTIONS_BACKEND",
                "functionId": $fn_id
            }
        }]')
        log_info "Added members routes"
    fi

    if [[ -n "$blog_fn_id" && "$blog_fn_id" != "null" ]]; then
        routes=$(echo "$routes" | jq --arg fn_id "$blog_fn_id" '. + [
            {
                "path": "/blog",
                "methods": ["GET", "OPTIONS"],
                "backend": {
                    "type": "ORACLE_FUNCTIONS_BACKEND",
                    "functionId": $fn_id
                }
            },
            {
                "path": "/blog/{id}",
                "methods": ["GET", "OPTIONS"],
                "backend": {
                    "type": "ORACLE_FUNCTIONS_BACKEND",
                    "functionId": $fn_id
                }
            }
        ]')
        log_info "Added blog routes"
    fi

    # Create deployment specification
    local deployment_spec
    deployment_spec=$(cat << EOF
{
    "loggingPolicies": {
        "accessLog": {"isEnabled": true},
        "executionLog": {"isEnabled": true, "logLevel": "INFO"}
    },
    "requestPolicies": {
        "cors": {
            "allowedOrigins": ["*"],
            "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allowedHeaders": ["Content-Type", "Authorization", "X-Requested-With", "Stripe-Signature"],
            "exposedHeaders": ["Content-Length"],
            "isAllowCredentialsEnabled": true,
            "maxAgeInSeconds": 3600
        },
        "rateLimiting": {
            "rateKey": "CLIENT_IP",
            "rateInRequestsPerSecond": 10
        }
    },
    "routes": $routes
}
EOF
)

    # Get existing deployment
    local deployment_id
    deployment_id=$(oci api-gateway deployment list \
        --compartment-id "$COMPARTMENT_ID" \
        --gateway-id "$API_GW_ID" \
        --display-name "enokida-api-v1" \
        --lifecycle-state ACTIVE \
        --query "data.items[0].id" --raw-output 2>/dev/null || echo "")

    if [[ -n "$deployment_id" && "$deployment_id" != "null" ]]; then
        log_info "Updating existing API deployment..."

        oci api-gateway deployment update \
            --deployment-id "$deployment_id" \
            --specification "$deployment_spec" \
            --wait-for-state ACTIVE > /dev/null

        log_success "API deployment updated"
    else
        log_info "Creating new API deployment..."

        oci api-gateway deployment create \
            --compartment-id "$COMPARTMENT_ID" \
            --gateway-id "$API_GW_ID" \
            --display-name "enokida-api-v1" \
            --path-prefix "/api" \
            --specification "$deployment_spec" \
            --wait-for-state ACTIVE > /dev/null

        log_success "API deployment created"
    fi

    log_info "API Gateway URL: https://$API_GW_HOSTNAME/api"
}

# ============================================================
# Health Checks
# ============================================================
run_health_checks() {
    log_step "Running Health Checks"

    # Check static files
    local static_url="https://objectstorage.$REGION.oraclecloud.com/n/$OS_NAMESPACE/b/$BUCKET_NAME/o/index.html"
    log_info "Checking static files..."

    local static_status
    static_status=$(curl -s -o /dev/null -w "%{http_code}" "$static_url" 2>/dev/null || echo "000")

    if [[ "$static_status" == "200" ]]; then
        log_success "Static files accessible (HTTP $static_status)"
    else
        log_warning "Static files may not be accessible (HTTP $static_status)"
    fi

    # Check API health
    local api_url="https://$API_GW_HOSTNAME/api/health"
    log_info "Checking API health..."

    local api_status
    api_status=$(curl -s -o /dev/null -w "%{http_code}" "$api_url" 2>/dev/null || echo "000")

    if [[ "$api_status" == "200" ]]; then
        log_success "API Gateway healthy (HTTP $api_status)"
    else
        log_warning "API Gateway health check returned HTTP $api_status"
    fi
}

# ============================================================
# Print Summary
# ============================================================
print_summary() {
    log_step "Deployment Complete!"

    echo -e "${GREEN}Application deployed successfully!${NC}"
    echo
    echo "URLs:"
    echo "  - Static Site: https://objectstorage.$REGION.oraclecloud.com/n/$OS_NAMESPACE/b/$BUCKET_NAME/o/index.html"
    echo "  - API Gateway: https://$API_GW_HOSTNAME/api"
    echo "  - Health Check: https://$API_GW_HOSTNAME/api/health"
    echo
    echo "Next Steps:"
    echo "  1. Configure custom domain DNS to point to API Gateway"
    echo "  2. Set up Let's Encrypt SSL certificate"
    echo "  3. Update CORS allowed origins in API Gateway"
    echo "  4. Test all functionality"
    echo
}

# ============================================================
# Main Execution
# ============================================================
main() {
    echo
    echo "========================================================"
    echo "    Deployment Script for Masashi Enokida Website       "
    echo "========================================================"
    echo

    load_config

    local target="${1:-all}"

    case "$target" in
        frontend)
            deploy_frontend
            ;;
        functions)
            deploy_functions
            ;;
        gateway)
            update_api_gateway
            ;;
        all)
            deploy_frontend
            deploy_functions
            update_api_gateway
            run_health_checks
            print_summary
            ;;
        *)
            echo "Usage: $0 [frontend|functions|gateway|all]"
            echo
            echo "  frontend   - Build and upload static files"
            echo "  functions  - Build and deploy OCI Functions"
            echo "  gateway    - Update API Gateway routes"
            echo "  all        - Deploy everything (default)"
            exit 1
            ;;
    esac
}

main "$@"
