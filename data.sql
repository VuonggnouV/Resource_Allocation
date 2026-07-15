-- Sample data for Resource Allocation Management System (Expanded for Pagination Testing)

BEGIN;

-- Clear old data (cascade rules will handle foreign keys)
TRUNCATE TABLE allocation RESTART IDENTITY CASCADE;
TRUNCATE TABLE project RESTART IDENTITY CASCADE;
TRUNCATE TABLE employee RESTART IDENTITY CASCADE;

-- ==========================================
-- 1. INSERT 50 EMPLOYEES
-- ==========================================
INSERT INTO employee (employee_code, full_name, email, role, department) VALUES
-- Existing 11 Employees
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
('EMP011', 'Nguyen Quang Hai', 'hainq@company.com', 'Developer', 'FSOFT-Q2'),
-- New 39 Employees
('EMP012', 'Hoang Nam Anh', 'anhhn@company.com', 'Java Developer', 'FSOFT-Q1'),
('EMP013', 'Nguyen Van Cuong', 'cuongnv@company.com', 'Angular Developer', 'FSOFT-Q2'),
('EMP014', 'Pham Thuy Duong', 'duongpt@company.com', 'QA Engineer', 'QA'),
('EMP015', 'Le Hoang Giang', 'gianglh@company.com', 'Project Manager', 'PMO'),
('EMP016', 'Tran Quoc Huy', 'huytq@company.com', 'Business Analyst', 'BA-TEAM'),
('EMP017', 'Nguyen Minh Khanh', 'khanhnm@company.com', 'DevOps Engineer', 'DEVOPS'),
('EMP018', 'Vu Thi Linh', 'linhvt@company.com', 'UI/UX Designer', 'DESIGN-UI'),
('EMP019', 'Dang Duc Manh', 'manhdd@company.com', 'Backend Engineer', 'FSOFT-Q1'),
('EMP020', 'Ngo Thi Ngan', 'ngannt@company.com', 'QA Specialist', 'QA'),
('EMP021', 'Phan Van Phong', 'phongpv@company.com', 'Frontend Developer', 'FSOFT-Q2'),
('EMP022', 'Bui Minh Quan', 'quanbm@company.com', 'Data Scientist', 'AI-LAB'),
('EMP023', 'Nguyen Hong Son', 'sonnh@company.com', 'Security Specialist', 'SECURITY'),
('EMP024', 'Tran Duc Thang', 'thangtd@company.com', 'Solution Architect', 'PMO'),
('EMP025', 'Pham Minh Tri', 'tripm@company.com', 'Scrum Master', 'PMO'),
('EMP026', 'Le Thanh Tung', 'tunglt@company.com', 'Java Developer', 'FSOFT-Q1'),
('EMP027', 'Nguyen Thi Van', 'vann@company.com', 'Manual Tester', 'QA'),
('EMP028', 'Do Duy Anh', 'anhdd@company.com', 'Automation Tester', 'QA'),
('EMP029', 'Vu Hoang Bach', 'bachvh@company.com', 'System Engineer', 'DEVOPS'),
('EMP030', 'Tran Quang Dang', 'dangtq@company.com', 'Fullstack Developer', 'FSOFT-Q1'),
('EMP031', 'Pham Le Hoang', 'hoangpl@company.com', 'Senior Developer', 'FSOFT-Q1'),
('EMP032', 'Ngo Quoc Huy', 'huynq@company.com', 'Angular Developer', 'FSOFT-Q2'),
('EMP033', 'Dinh Xuan Truong', 'truongdx@company.com', 'Backend Developer', 'FSOFT-Q1'),
('EMP034', 'Ta Quang Khai', 'khaitq@company.com', 'QA Specialist', 'QA'),
('EMP035', 'Ngo Xuan Manh', 'manhnx@company.com', 'Project Manager', 'PMO'),
('EMP036', 'Trinh Van Quyet', 'quyettv@company.com', 'Business Analyst', 'BA-TEAM'),
('EMP037', 'Hoang Quoc Trung', 'trunghq@company.com', 'DevOps Engineer', 'DEVOPS'),
('EMP038', 'Luu Hoang Nam', 'namlh@company.com', 'UI/UX Designer', 'DESIGN-UI'),
('EMP039', 'Nong Van Dien', 'diennv@company.com', 'Data Scientist', 'AI-LAB'),
('EMP040', 'Bui Thi Nga', 'ngabt@company.com', 'QA Engineer', 'QA'),
('EMP041', 'Phan Thanh Tung', 'tungpt@company.com', 'Java Developer', 'FSOFT-Q1'),
('EMP042', 'Tran Quang Hai', 'haitq@company.com', 'Fullstack Developer', 'FSOFT-Q2'),
('EMP043', 'Bui Xuan Truong', 'truongbx@company.com', 'Manual Tester', 'QA'),
('EMP044', 'Vuong Quang Huy', 'huyvq@company.com', 'Security Specialist', 'SECURITY'),
('EMP045', 'Le Hoang Nam', 'namlh2@company.com', 'Solution Architect', 'PMO'),
('EMP046', 'Pham Le Binh', 'binhpl@company.com', 'Java Developer', 'FSOFT-Q1'),
('EMP047', 'Nguyen Van An', 'annv@company.com', 'Frontend Developer', 'FSOFT-Q2'),
('EMP048', 'Hoang Thi Hoa', 'hoaht@company.com', 'QA Engineer', 'QA'),
('EMP049', 'Bui Tien Dung', 'dungbt@company.com', 'DevOps Engineer', 'DEVOPS'),
('EMP050', 'Nguyen Quang Sang', 'sangnq@company.com', 'Business Analyst', 'BA-TEAM');

-- ==========================================
-- 2. INSERT 25 PROJECTS
-- ==========================================
INSERT INTO project (project_code, project_name, customer, start_date, end_date, status) VALUES
-- Existing 7 Projects
('NCG', 'NCG Digital Platform', 'Customer A', '2026-01-01', '2026-12-31', 'ACTIVE'),
('GRID', 'GRID Migration Program', 'Customer B', '2026-02-01', '2026-10-31', 'ACTIVE'),
('INT-AI', 'Internal AI Initiative', 'Internal', '2026-03-01', NULL, 'PLANNING'),
('LEGACY', 'Legacy Portal Modernization', 'Customer C', '2025-01-01', '2025-06-30', 'COMPLETED'),
('E-COMM', 'E-Commerce Platform Modernization', 'Customer D', '2026-05-01', '2026-11-30', 'ACTIVE'),
('BANKING', 'Core Banking Integration', 'Customer E', '2026-07-01', '2027-06-30', 'PLANNING'),
('CLOUDMIG', 'Cloud Infrastructure Migration', 'Customer F', '2025-08-01', '2026-02-28', 'COMPLETED'),
-- New 18 Projects
('MOBILE-APP', 'Healthcare Mobile Application', 'Customer G', '2026-01-01', '2026-09-30', 'ACTIVE'),
('ERP-SYS', 'Enterprise Resource Planning', 'Customer H', '2026-08-01', '2027-07-31', 'PLANNING'),
('IOT-GATE', 'Smart Home IoT Gateway', 'Customer I', '2026-02-15', '2026-12-15', 'ACTIVE'),
('DATA-LAKE', 'Big Data Analytics Platform', 'Customer J', '2026-03-01', '2026-12-31', 'ACTIVE'),
('SECURITY-AUDIT', 'Corporate Security Assessment', 'Customer K', '2025-09-01', '2025-11-30', 'COMPLETED'),
('BLOCKCHAIN-PAY', 'Crypto Payment Gateway', 'Customer L', '2026-09-01', NULL, 'PLANNING'),
('AI-CHAT', 'Customer Support GenAI Bot', 'Customer M', '2026-01-15', '2026-08-15', 'ACTIVE'),
('DEVOPS-PIPELINE', 'CI/CD Optimization Initiative', 'Internal', '2025-06-01', '2025-12-31', 'COMPLETED'),
('HR-PORTAL', 'Human Resource Portal Update', 'Internal', '2026-04-01', '2026-12-31', 'ACTIVE'),
('LOGISTICS-SYS', 'Smart Logistics Optimizer', 'Customer N', '2026-01-10', '2026-12-31', 'ACTIVE'),
('FINTECH-APP', 'Microfinance Application Platform', 'Customer O', '2026-02-01', '2026-11-30', 'ACTIVE'),
('ARCH-REFACTOR', 'Core Architecture Refactoring', 'Customer P', '2026-10-01', '2027-04-30', 'PLANNING'),
('CLOUD-MIG-2', 'AWS Cloud Migration Wave 2', 'Customer Q', '2026-03-01', '2026-10-31', 'ACTIVE'),
('CRM-PLATFORM', 'Customer Relationship Management Customization', 'Customer R', '2026-01-15', '2026-10-15', 'ACTIVE'),
('RETAIL-POS', 'NextGen Retail POS System', 'Customer S', '2026-02-01', '2026-12-31', 'ACTIVE'),
('SAAS-BILLING', 'Multi-tenant Billing Service Integration', 'Customer T', '2026-03-01', '2026-11-30', 'ACTIVE'),
('MEDIA-STREAM', 'Video Streaming Engine Dev', 'Customer U', '2025-05-01', '2025-10-31', 'COMPLETED'),
('VOICE-ASSIST', 'Voice Assistant Integration Feature', 'Customer V', '2026-11-01', '2027-05-31', 'PLANNING');

-- ==========================================
-- 3. INSERT 53 ALLOCATIONS
-- ==========================================
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
(10, 5, 40, 'Machine Learning Engineer', '2026-05-01', '2026-11-30'),

-- EMP012 (Hoang Nam Anh - 90%)
(12, 1, 50, 'Java Developer', '2026-01-01', '2026-12-31'),
(12, 8, 40, 'Backend Engineer', '2026-01-10', '2026-09-30'),

-- EMP013 (Nguyen Van Cuong - 70%)
(13, 5, 30, 'Angular Developer', '2026-05-01', '2026-11-30'),
(13, 8, 40, 'Angular Developer', '2026-01-10', '2026-09-30'),

-- EMP014 (Pham Thuy Duong - 80%)
(14, 8, 40, 'QA Tester', '2026-01-10', '2026-09-30'),
(14, 10, 40, 'Lead QA', '2026-02-15', '2026-12-15'),

-- EMP015 (Le Hoang Giang - 90%)
(15, 8, 50, 'Project Lead', '2026-01-01', '2026-09-30'),
(15, 10, 40, 'Project Manager', '2026-02-15', '2026-12-15'),

-- EMP016 (Tran Quoc Huy - 80%)
(16, 10, 40, 'Business Analyst', '2026-02-15', '2026-12-15'),
(16, 11, 40, 'Senior BA', '2026-03-01', '2026-12-31'),

-- EMP017 (Nguyen Minh Khanh - 70%)
(17, 10, 30, 'DevOps Support', '2026-02-15', '2026-12-15'),
(17, 11, 40, 'CI/CD Engineer', '2026-03-01', '2026-12-31'),

-- EMP018 (Vu Thi Linh - 100%)
(18, 1, 50, 'UI Designer', '2026-01-01', '2026-12-31'),
(18, 8, 50, 'UX Designer', '2026-01-01', '2026-09-30'),

-- EMP019 (Dang Duc Manh - 80%)
(19, 11, 40, 'Data Engineer', '2026-03-01', '2026-12-31'),
(19, 14, 40, 'Backend Developer', '2026-01-15', '2026-08-15'),

-- EMP020 (Ngo Thi Ngan - 70%)
(20, 14, 40, 'QA Automation', '2026-01-15', '2026-08-15'),
(20, 16, 30, 'QA Manual', '2026-04-01', '2026-12-31'),

-- EMP021 (Phan Van Phong - 90%)
(21, 14, 50, 'Frontend Developer', '2026-01-15', '2026-08-15'),
(21, 16, 40, 'Frontend Lead', '2026-04-01', '2026-12-31'),

-- EMP022 (Bui Minh Quan - 90%)
(22, 14, 50, 'AI/ML Specialist', '2026-01-15', '2026-08-15'),
(22, 17, 40, 'Data Scientist', '2026-01-10', '2026-12-31'),

-- EMP023 (Nguyen Hong Son - 70%)
(23, 17, 40, 'Security consultant', '2026-01-10', '2026-12-31'),
(23, 18, 30, 'Security Engineer', '2026-02-01', '2026-11-30'),

-- EMP024 (Tran Duc Thang - 90%)
(24, 17, 50, 'Solution Architect', '2026-01-10', '2026-12-31'),
(24, 18, 40, 'System Architect', '2026-02-01', '2026-11-30'),

-- EMP025 (Pham Minh Tri - 80%)
(25, 18, 40, 'Scrum Master', '2026-02-01', '2026-11-30'),
(25, 20, 40, 'Agile Coach', '2026-03-01', '2026-10-31'),

-- EMP026 (Le Thanh Tung - 90%)
(26, 20, 50, 'Java Developer', '2026-03-01', '2026-10-31'),
(26, 21, 40, 'Backend Developer', '2026-01-15', '2026-10-15'),

-- EMP027 (Nguyen Thi Van - 70%)
(27, 21, 40, 'QA Specialist', '2026-01-15', '2026-10-15'),
(27, 22, 30, 'Tester', '2026-02-01', '2026-12-31'),

-- EMP028 (Do Duy Anh - 80%)
(28, 22, 40, 'Automation Lead', '2026-02-01', '2026-12-31'),
(28, 23, 40, 'QA Automation', '2026-03-01', '2026-11-30'),

-- EMP029 (Vu Hoang Bach - 70%)
(29, 23, 40, 'DevOps Support', '2026-03-01', '2026-11-30'),
(29, 20, 30, 'System Engineer', '2026-03-01', '2026-10-31'),

-- EMP030 (Tran Quang Dang - 90%)
(30, 22, 50, 'Fullstack Developer', '2026-02-01', '2026-12-31'),
(30, 23, 40, 'Node.js Developer', '2026-03-01', '2026-11-30'),

-- EMP031 (Pham Le Hoang - 40%)
(31, 21, 40, 'Senior Developer', '2026-01-15', '2026-10-15'),

-- EMP032 (Ngo Quoc Huy - 50%)
(32, 10, 50, 'Angular Developer', '2026-02-15', '2026-12-15'),

-- EMP033 (Dinh Xuan Truong - 60%)
(33, 11, 60, 'Database Administrator', '2026-03-01', '2026-12-31');

COMMIT;
