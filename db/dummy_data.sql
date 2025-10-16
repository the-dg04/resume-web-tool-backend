-- This script populates the database with sample data for the interview prep portal.
-- The order of insertion is important to respect foreign key constraints.

-- 1. Populate Users
-- We'll create 3 sample users.
INSERT INTO Users ( name, email, type) VALUES
( 'Alice Johnson', 'alice.j@example.com', 'premium'),
( 'Bob Williams', 'bob.w@example.com', 'free'),
( 'Charlie Brown', 'charlie.b@example.com', 'free');

-- 2. Populate Companies
-- We'll create 4 sample companies.
INSERT INTO Companies (name, location, linkedin_url) VALUES
('Innovatech Solutions', 'San Francisco, CA', 'https://linkedin.com/company/innovatech-solutions'),
('DataWise Inc.', 'New York, NY', 'https://linkedin.com/company/datawise-inc'),
('QuantumLeap', 'Austin, TX', 'https://linkedin.com/company/quantumleap'),
('NextGen Systems', 'Remote', 'https://linkedin.com/company/nextgen-systems');

-- 3. Populate Resumes
-- Assuming user_ids are 1, 2, 3 from the inserts above.
-- Alice (user_id=1) has two resumes, Bob (user_id=2) and Charlie (user_id=3) each have one.
INSERT INTO Resumes (user_id, resume_name, resume_url) VALUES
(1, 'resumE', 'https://example-storage.com/resumes/alice_johnson_swe_v2.pdf'),
(1, 'resumE', 'https://example-storage.com/resumes/alice_johnson_pm_v1.pdf'),
(2, 'resumE', 'https://example-storage.com/resumes/bob_williams_datasci.pdf'),
(3, 'resumE', 'https://example-storage.com/resumes/charlie_brown_devops.pdf');

-- 4. Populate Roles
-- Assuming company_ids are 1, 2, 3, 4 from the inserts above.
INSERT INTO Roles (company_id, job_description, pay, location, start_date, application_end_date, hours_per_week) VALUES
(1, 'Developing and maintaining our flagship web application using React and Node.js. Experience with microservices is a plus.', '$120,000 - $150,000 USD', 'San Francisco, CA', '2025-12-01', '2025-11-15', 40),
(2, 'Analyzing large datasets to extract meaningful insights. Must be proficient in Python, SQL, and data visualization tools like Tableau.', '$110,000 - $140,000 USD', 'New York, NY', '2026-01-05', '2025-12-10', 40),
(3, 'Research and develop cutting-edge machine learning models for predictive analytics. PhD or Masters in a related field preferred.', '$150,000 - $190,000 USD', 'Austin, TX', '2026-02-01', '2025-12-20', 40),
(4, 'Manage our cloud infrastructure on AWS. Experience with Docker, Kubernetes, and CI/CD pipelines is essential.', '$130,000 - $160,000 USD', 'Remote', '2025-11-20', '2025-11-01', 40);

-- 5. Populate Applications
-- Assuming user_ids are 1, 2, 3 and role_ids are 1, 2, 3, 4.
-- We'll create a few applications with different statuses.
-- Alice (user_id=1) applies for the Software Engineer role (role_id=1) with her SWE resume (resume_id=1).
INSERT INTO Applications (role_id, user_id, resume_id, status) VALUES
(1, 1, 1, 'interviewing');

-- Bob (user_id=2) applies for the Data Analyst role (role_id=2) with his resume (resume_id=3).
INSERT INTO Applications (role_id, user_id, resume_id, status) VALUES
(2, 2, 3, 'applied');

-- Charlie (user_id=3) applies for the DevOps Engineer role (role_id=4) with his resume (resume_id=4).
INSERT INTO Applications (role_id, user_id, resume_id, status) VALUES
(4, 3, 4, 'reviewing');

-- Alice (user_id=1) also applies for the Data Analyst role (role_id=2) with her SWE resume (resume_id=1) and gets rejected.
INSERT INTO Applications (role_id, user_id, resume_id, status) VALUES
(2, 1, 1, 'rejected');

-- Bob (user_id=2) also applies for the Software Engineer role (role_id=1).
INSERT INTO Applications (role_id, user_id, resume_id, status) VALUES
(1, 2, 3, 'applied');