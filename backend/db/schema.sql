-- Kloudspot Employee Management System - PostgreSQL schema.
--
-- This file is a reference for the tables the application uses. It is NOT read
-- at runtime: with spring.jpa.hibernate.ddl-auto=update, Hibernate creates and
-- updates these tables automatically on startup (see application.properties).
--
-- Use this script only if you prefer to provision the database yourself, e.g.
--   createdb kloudspot
--   psql -d kloudspot -f backend/db/schema.sql
-- The bootstrap admin account is still seeded by the application on first run.

CREATE TABLE admins (
    id          uuid         PRIMARY KEY,
    name        varchar(255) NOT NULL,
    email       varchar(255) NOT NULL,
    password    varchar(255) NOT NULL,
    created_at  timestamp(6) NOT NULL,
    CONSTRAINT admins_email_key UNIQUE (email)
);

CREATE TABLE departments (
    id          uuid         PRIMARY KEY,
    name        varchar(255) NOT NULL,
    created_by  uuid         NOT NULL,
    created_at  timestamp(6) NOT NULL,
    updated_at  timestamp(6) NOT NULL,
    CONSTRAINT departments_name_key UNIQUE (name),
    CONSTRAINT departments_created_by_fkey FOREIGN KEY (created_by) REFERENCES admins (id)
);

CREATE TABLE employees (
    id                uuid          PRIMARY KEY,
    emp_id            varchar(255)  NOT NULL,
    full_name         varchar(255)  NOT NULL,
    email             varchar(255)  NOT NULL,
    phone_number      varchar(255)  NOT NULL,
    department_id     uuid          NOT NULL,
    designation       varchar(255)  NOT NULL,
    date_of_joining   date          NOT NULL,
    salary            numeric(12,2) NOT NULL,
    employment_status boolean       NOT NULL,
    created_by        uuid          NOT NULL,
    created_at        timestamp(6)  NOT NULL,
    updated_at        timestamp(6)  NOT NULL,
    updated_by        uuid,
    CONSTRAINT employees_emp_id_key UNIQUE (emp_id),
    CONSTRAINT employees_email_key UNIQUE (email),
    CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES admins (id),
    CONSTRAINT employees_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES admins (id)
);

CREATE INDEX employees_department_id_idx ON employees (department_id);
CREATE INDEX employees_employment_status_idx ON employees (employment_status);
