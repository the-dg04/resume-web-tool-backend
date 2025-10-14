-- Use SERIAL PRIMARY KEY for auto-incrementing IDs
-- Use TIMESTAMPTZ for timezone-aware timestamps
-- Use TEXT for potentially long strings like job descriptions

-- Users Table
-- Added google_id to store the unique ID from Google
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    age INT,
    linkedin_url VARCHAR(255),
    type VARCHAR(10) DEFAULT 'free' CHECK (type IN ('free', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE Resumes (
    resume_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    resume_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Companies Table
CREATE TABLE Companies (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    linkedin_url VARCHAR(255)
);

-- Roles Table
CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    job_description TEXT NOT NULL,
    pay VARCHAR(100),
    location VARCHAR(255),
    start_date DATE,
    application_end_date DATE,
    hours_per_week INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

-- Applications Table
-- Added a status field which is very common
CREATE TABLE Applications (
    application_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    user_id INT NOT NULL,
    resume_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interviewing', 'rejected', 'hired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id) ON DELETE CASCADE
);