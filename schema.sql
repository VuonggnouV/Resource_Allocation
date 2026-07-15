-- PostgreSQL schema for Resource Allocation Management System
-- Creates tables for employees, projects, and allocations with constraints and business-rule triggers.

BEGIN;

DROP TABLE IF EXISTS allocation;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS employee;

CREATE TABLE employee (
    employee_id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project (
    project_id BIGSERIAL PRIMARY KEY,
    project_code VARCHAR(20) NOT NULL UNIQUE,
    project_name VARCHAR(200) NOT NULL,
    customer VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_project_dates CHECK (end_date IS NULL OR start_date <= end_date)
);

CREATE TABLE allocation (
    allocation_id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    allocation_percent INTEGER NOT NULL,
    role_in_project VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_allocation_project
        FOREIGN KEY (project_id) REFERENCES project(project_id)
        ON DELETE CASCADE,
    CONSTRAINT ck_allocation_percent CHECK (allocation_percent > 0 AND allocation_percent <= 100),
    CONSTRAINT ck_allocation_dates CHECK (end_date IS NULL OR start_date <= end_date)
);

CREATE OR REPLACE FUNCTION check_employee_allocation_limit()
RETURNS TRIGGER AS $$
DECLARE
    total_allocation INTEGER;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        SELECT COALESCE(SUM(allocation_percent), 0)
        INTO total_allocation
        FROM allocation
        WHERE employee_id = NEW.employee_id AND allocation_id != OLD.allocation_id;
    ELSE
        SELECT COALESCE(SUM(allocation_percent), 0)
        INTO total_allocation
        FROM allocation
        WHERE employee_id = NEW.employee_id;
    END IF;

    IF total_allocation + NEW.allocation_percent > 100 THEN
        RAISE EXCEPTION 'Employee allocation exceeds 100%%';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_project_not_completed()
RETURNS TRIGGER AS $$
DECLARE
    project_status VARCHAR(20);
BEGIN
    SELECT status
    INTO project_status
    FROM project
    WHERE project_id = NEW.project_id;

    IF project_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Cannot allocate resources to a completed project';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_employee_allocation_limit
BEFORE INSERT OR UPDATE ON allocation
FOR EACH ROW
EXECUTE FUNCTION check_employee_allocation_limit();

CREATE TRIGGER trg_check_project_not_completed
BEFORE INSERT OR UPDATE ON allocation
FOR EACH ROW
EXECUTE FUNCTION check_project_not_completed();

-- Index optimization for reporting and recommendation lookups
CREATE INDEX idx_allocation_employee_id ON allocation(employee_id);
CREATE INDEX idx_allocation_project_id ON allocation(project_id);
CREATE INDEX idx_employee_role ON employee(role);
CREATE INDEX idx_project_status ON project(status);

COMMIT;
