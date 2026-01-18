-- ============================================================
-- Oracle Autonomous Database Schema
-- Masashi Enokida Pianist Website
-- Migration: 001_initial
-- ============================================================

-- Enable session settings
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS"Z"';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"';

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE users (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    name VARCHAR2(255),
    email VARCHAR2(255) NOT NULL UNIQUE,
    email_verified TIMESTAMP,
    image CLOB,
    role VARCHAR2(20) DEFAULT 'USER' NOT NULL
        CONSTRAINT chk_user_role CHECK (role IN ('USER', 'ADMIN', 'MEMBER_FREE', 'MEMBER_GOLD')),
    stripe_customer_id VARCHAR2(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================================
-- Accounts Table (OAuth providers)
-- ============================================================
CREATE TABLE accounts (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    type VARCHAR2(50) NOT NULL,
    provider VARCHAR2(50) NOT NULL,
    provider_account_id VARCHAR2(255) NOT NULL,
    refresh_token CLOB,
    access_token CLOB,
    expires_at NUMBER,
    token_type VARCHAR2(50),
    scope VARCHAR2(500),
    id_token CLOB,
    session_state VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_provider_account UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ============================================================
-- Sessions Table
-- ============================================================
CREATE TABLE sessions (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    session_token VARCHAR2(500) NOT NULL UNIQUE,
    user_id VARCHAR2(36) NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- ============================================================
-- Verification Tokens Table
-- ============================================================
CREATE TABLE verification_tokens (
    identifier VARCHAR2(255) NOT NULL,
    token VARCHAR2(255) NOT NULL UNIQUE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_verification UNIQUE (identifier, token)
);

CREATE INDEX idx_verification_expires ON verification_tokens(expires);

-- ============================================================
-- Subscriptions Table
-- ============================================================
CREATE TABLE subscriptions (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    stripe_subscription_id VARCHAR2(255) UNIQUE,
    stripe_price_id VARCHAR2(255),
    status VARCHAR2(30) DEFAULT 'ACTIVE' NOT NULL
        CONSTRAINT chk_subscription_status CHECK (status IN (
            'ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING',
            'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID', 'PAUSED'
        )),
    tier VARCHAR2(20) DEFAULT 'MEMBER_FREE' NOT NULL
        CONSTRAINT chk_subscription_tier CHECK (tier IN ('MEMBER_FREE', 'MEMBER_GOLD')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end NUMBER(1) DEFAULT 0,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================================
-- Contacts Table (Contact form submissions)
-- ============================================================
CREATE TABLE contacts (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36),
    name VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    phone VARCHAR2(50),
    subject VARCHAR2(500) NOT NULL,
    category VARCHAR2(100),
    message CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL
        CONSTRAINT chk_contact_status CHECK (status IN ('PENDING', 'READ', 'REPLIED', 'CLOSED', 'SPAM')),
    ip_address VARCHAR2(45),
    user_agent CLOB,
    recaptcha_score NUMBER(3,2),
    admin_notes CLOB,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_contacts_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX idx_contacts_category ON contacts(category);

-- ============================================================
-- Rate Limits Table (For API rate limiting)
-- ============================================================
CREATE TABLE rate_limits (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    key VARCHAR2(255) NOT NULL UNIQUE,
    ip_address VARCHAR2(45) NOT NULL,
    request_count NUMBER DEFAULT 1 NOT NULL,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- ============================================================
-- Audit Log Table (For tracking important actions)
-- ============================================================
CREATE TABLE audit_logs (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(36),
    action VARCHAR2(100) NOT NULL,
    entity_type VARCHAR2(50),
    entity_id VARCHAR2(36),
    old_value CLOB,
    new_value CLOB,
    ip_address VARCHAR2(45),
    user_agent CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- Triggers for updated_at timestamps
-- ============================================================

-- Users updated_at trigger
CREATE OR REPLACE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Subscriptions updated_at trigger
CREATE OR REPLACE TRIGGER trg_subscriptions_updated
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Contacts updated_at trigger
CREATE OR REPLACE TRIGGER trg_contacts_updated
    BEFORE UPDATE ON contacts
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- ============================================================
-- Stored Procedures for Maintenance
-- ============================================================

-- Cleanup expired sessions
CREATE OR REPLACE PROCEDURE cleanup_expired_sessions AS
    v_deleted_count NUMBER;
BEGIN
    DELETE FROM sessions WHERE expires < CURRENT_TIMESTAMP;
    v_deleted_count := SQL%ROWCOUNT;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' expired sessions');
END;
/

-- Cleanup old rate limit entries
CREATE OR REPLACE PROCEDURE cleanup_rate_limits AS
    v_deleted_count NUMBER;
    v_cutoff TIMESTAMP;
BEGIN
    v_cutoff := CURRENT_TIMESTAMP - INTERVAL '24' HOUR;
    DELETE FROM rate_limits WHERE window_start < v_cutoff;
    v_deleted_count := SQL%ROWCOUNT;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' old rate limit entries');
END;
/

-- Cleanup old audit logs (keep 90 days)
CREATE OR REPLACE PROCEDURE cleanup_audit_logs AS
    v_deleted_count NUMBER;
    v_cutoff TIMESTAMP;
BEGIN
    v_cutoff := CURRENT_TIMESTAMP - INTERVAL '90' DAY;
    DELETE FROM audit_logs WHERE created_at < v_cutoff;
    v_deleted_count := SQL%ROWCOUNT;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' old audit log entries');
END;
/

-- ============================================================
-- Scheduled Jobs for Maintenance (Optional)
-- ============================================================
-- Note: These require DBMS_SCHEDULER privileges

/*
-- Schedule session cleanup (daily at 3 AM)
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'CLEANUP_SESSIONS_JOB',
        job_type        => 'STORED_PROCEDURE',
        job_action      => 'cleanup_expired_sessions',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=DAILY; BYHOUR=3; BYMINUTE=0; BYSECOND=0',
        enabled         => TRUE
    );
END;
/

-- Schedule rate limit cleanup (hourly)
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'CLEANUP_RATE_LIMITS_JOB',
        job_type        => 'STORED_PROCEDURE',
        job_action      => 'cleanup_rate_limits',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; BYMINUTE=30; BYSECOND=0',
        enabled         => TRUE
    );
END;
/

-- Schedule audit log cleanup (weekly on Sunday at 4 AM)
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'CLEANUP_AUDIT_LOGS_JOB',
        job_type        => 'STORED_PROCEDURE',
        job_action      => 'cleanup_audit_logs',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=WEEKLY; BYDAY=SUN; BYHOUR=4; BYMINUTE=0; BYSECOND=0',
        enabled         => TRUE
    );
END;
/
*/

-- ============================================================
-- Initial Data (Optional)
-- ============================================================

-- Insert default admin user (update email before running)
/*
INSERT INTO users (id, name, email, role, created_at, updated_at)
VALUES (SYS_GUID(), 'Admin', 'admin@masashi-enokida.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
*/

-- ============================================================
-- Migration Complete
-- ============================================================
COMMIT;
