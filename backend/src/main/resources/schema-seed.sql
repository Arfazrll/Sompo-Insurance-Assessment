-- ============================================
-- SQL Script: Inisialisasi Database Task Management System
-- Database: Microsoft SQL Server
-- ============================================

-- Buat database (jalankan terpisah jika perlu)
-- CREATE DATABASE task_management_db;
-- GO
-- USE task_management_db;
-- GO

-- ============================================
-- Tabel Users
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL,
        last_login DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- Tabel Tasks
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tasks' AND xtype='U')
BEGIN
    CREATE TABLE tasks (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        status NVARCHAR(50) NOT NULL DEFAULT 'TODO',
        assigned_to BIGINT,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_tasks_users FOREIGN KEY (assigned_to) REFERENCES users(id)
    );
END
GO

-- ============================================
-- Seed Data: Akun Awal
-- Password terenkripsi BCrypt
-- ============================================
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@taskmanager.com')
BEGIN
    INSERT INTO users (email, password, full_name, role, created_at)
    VALUES ('admin@taskmanager.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'ROLE_ADMIN', GETDATE());
END
GO

IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@taskmanager.com')
BEGIN
    INSERT INTO users (email, password, full_name, role, created_at)
    VALUES ('user@taskmanager.com', '$2a$10$dXJ3SW6G7P50lGmMQgel2u7CdBPcjXlZ9dZ0Aj1VqS.UXVvwJqbC6', 'John Doe', 'ROLE_USER', GETDATE());
END
GO

-- ============================================
-- Seed Data: Tugas Awal
-- ============================================
IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup project backend')
BEGIN
    INSERT INTO tasks (title, description, status, assigned_to, created_at, updated_at)
    VALUES ('Setup project backend', 'Inisialisasi project Spring Boot dengan konfigurasi SQL Server', 'DONE',
            (SELECT id FROM users WHERE email = 'admin@taskmanager.com'), GETDATE(), GETDATE());
END
GO

IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Implementasi autentikasi JWT')
BEGIN
    INSERT INTO tasks (title, description, status, assigned_to, created_at, updated_at)
    VALUES ('Implementasi autentikasi JWT', 'Membuat sistem login dengan Spring Security dan JWT token', 'IN_PROGRESS',
            (SELECT id FROM users WHERE email = 'user@taskmanager.com'), GETDATE(), GETDATE());
END
GO

IF NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Desain halaman dashboard')
BEGIN
    INSERT INTO tasks (title, description, status, assigned_to, created_at, updated_at)
    VALUES ('Desain halaman dashboard', 'Membuat tampilan dashboard utama dengan Angular Material', 'TODO',
            (SELECT id FROM users WHERE email = 'user@taskmanager.com'), GETDATE(), GETDATE());
END
GO
