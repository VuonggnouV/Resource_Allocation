-- PostgreSQL initialization script for Resource Allocation Management System
-- Combines database schema creation, triggers, indexes, and sample data.
-- Run this script inside the 'resource_allocation_db' database context in pgAdmin.

BEGIN;

-- 1. Drop existing tables and functions if they exist to allow clean re-runs
DROP TRIGGER IF EXISTS trg_check_employee_allocation_limit ON allocation;
DROP TRIGGER IF EXISTS trg_check_project_not_completed ON allocation;
DROP FUNCTION IF EXISTS check_employee_allocation_limit();
DROP FUNCTION IF EXISTS check_project_not_completed();

DROP TABLE IF EXISTS allocation CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS employee CASCADE;

-- 2. Create tables
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

-- 3. Create business rule trigger functions
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

-- 4. Assign triggers to tables
CREATE TRIGGER trg_check_employee_allocation_limit
BEFORE INSERT OR UPDATE ON allocation
FOR EACH ROW
EXECUTE FUNCTION check_employee_allocation_limit();

CREATE TRIGGER trg_check_project_not_completed
BEFORE INSERT OR UPDATE ON allocation
FOR EACH ROW
EXECUTE FUNCTION check_project_not_completed();

-- 5. Index optimization for reporting and recommendation lookups
CREATE INDEX idx_allocation_employee_id ON allocation(employee_id);
CREATE INDEX idx_allocation_project_id ON allocation(project_id);
CREATE INDEX idx_employee_role ON employee(role);
CREATE INDEX idx_project_status ON project(status);

-- 6. Insert rich sample data (11 Employees, 7 Projects, 18 Allocations)
INSERT INTO employee (employee_code, full_name, email, role, department) VALUES
('EMP001', 'Tuan Ho Anh', 'tuanha@company.com', 'Senior Developer', 'FSOFT-Q1'),
('EMP002', 'Nguyen Van Binh', 'binh.nguyen@company.com', 'Developer', 'FSOFT-Q2'),
('EMP003', 'Tran Thi Lan', 'lan.tran@company.com', 'QA Engineer', 'QA'),
('EMP004', 'Pham Minh Hoang', 'hoangpm@company.com', 'Project Manager', 'PMO'),
('EMP005', 'Le Thi Mai', 'mailt@company.com', 'Business Analyst', 'BA-TEAM'),
('EMP006', 'Vuong Hoang Nam', 'namvh@company.com', 'DevOps Engineer', 'DEVOPS'),
('EMP007', 'Hoang Xuan Bach', 'bachhx@company.com', 'Senior Developer', 'FSOFT-Q1'),
('EMP008', 'Nguyen Thuy Linh', 'linhnt@company.com', 'Developer', 'FSOFT-Q2'),
('EMP009', 'Tran Minh Tu', 'tutm@company.com', 'QA Engineer', 'QA'),
('EMP010', 'Doan Van Hau', 'haudv@company.com', 'Developer', 'FSOFT-Q1'),
('EMP011', 'Nguyen Quang Hai', 'hainq@company.com', 'Developer', 'FSOFT-Q2');

INSERT INTO project (project_code, project_name, customer, start_date, end_date, status) VALUES
('NCG', 'NCG Digital Platform', 'Customer A', '2026-01-01', '2026-12-31', 'ACTIVE'),
('GRID', 'GRID Migration Program', 'Customer B', '2026-02-01', '2026-10-31', 'ACTIVE'),
('INT-AI', 'Internal AI Initiative', 'Internal', '2026-03-01', NULL, 'PLANNING'),
('LEGACY', 'Legacy Portal Modernization', 'Customer C', '2025-01-01', '2025-06-30', 'COMPLETED'),
('E-COMM', 'E-Commerce Platform Modernization', 'Customer D', '2026-05-01', '2026-11-30', 'ACTIVE'),
('BANKING', 'Core Banking Integration', 'Customer E', '2026-07-01', '2027-06-30', 'PLANNING'),
('CLOUDMIG', 'Cloud Infrastructure Migration', 'Customer F', '2025-08-01', '2026-02-28', 'COMPLETED');

INSERT INTO allocation (employee_id, project_id, allocation_percent, role_in_project, start_date, end_date) VALUES
-- EMP001 (Tuan Ho Anh - 100%)
(1, 1, 50, 'Backend Developer', '2026-01-01', '2026-12-31'),
(1, 2, 30, 'Backend Developer', '2026-02-01', '2026-10-31'),
(1, 3, 20, 'Backend Developer', '2026-03-01', NULL),

-- EMP002 (Nguyen Van Binh - 80%)
(2, 1, 40, 'Frontend Developer', '2026-01-01', '2026-12-31'),
(2, 5, 40, 'Frontend Developer', '2026-05-01', '2026-11-30'),

-- EMP003 (Tran Thi Lan - 80%)
(3, 2, 50, 'QA Engineer', '2026-02-01', '2026-10-31'),
(3, 5, 30, 'QA Engineer', '2026-05-01', '2026-11-30'),

-- EMP004 (Pham Minh Hoang - 100%)
(4, 1, 40, 'Project Manager', '2026-01-01', '2026-12-31'),
(4, 2, 30, 'Project Manager', '2026-02-01', '2026-10-31'),
(4, 5, 30, 'Project Manager', '2026-05-01', '2026-11-30'),

-- EMP005 (Le Thi Mai - 80%)
(5, 1, 50, 'Business Analyst', '2026-01-01', '2026-12-31'),
(5, 5, 30, 'Business Analyst', '2026-05-01', '2026-11-30'),

-- EMP006 (Vuong Hoang Nam - 60%)
(6, 1, 30, 'DevOps Engineer', '2026-01-01', '2026-12-31'),
(6, 5, 30, 'DevOps Engineer', '2026-05-01', '2026-11-30'),

-- EMP007 (Hoang Xuan Bach - 40%)
(7, 2, 40, 'Backend Developer', '2026-02-01', '2026-10-31'),

-- EMP008 (Nguyen Thuy Linh - 80%)
(8, 2, 30, 'Frontend Developer', '2026-02-01', '2026-10-31'),
(8, 5, 50, 'Frontend Developer', '2026-05-01', '2026-11-30'),

-- EMP009 (Tran Minh Tu - 40%)
(9, 1, 40, 'QA Engineer', '2026-01-01', '2026-12-31'),

-- EMP010 (Doan Van Hau - 40%)
(10, 5, 40, 'Machine Learning Engineer', '2026-05-01', '2026-11-30');

-- EMP011 (Nguyen Quang Hai - 0% - Available for new assignments)

COMMIT;
