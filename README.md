# Task Management System

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arfazrll_Sompo-Insurance-Assessment&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arfazrll_Sompo-Insurance-Assessment)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Arfazrll_Sompo-Insurance-Assessment&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Arfazrll_Sompo-Insurance-Assessment)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Arfazrll_Sompo-Insurance-Assessment&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Arfazrll_Sompo-Insurance-Assessment)
Aplikasi web **Task Management System** untuk mengelola daftar tugas harian user secara CRUD (Create, Read, Update, Delete) dengan sistem otentikasi berbasis peran (role-based).

## Tech Stack

| Layer      | Teknologi                                |
|------------|------------------------------------------|
| Backend    | Spring Boot 3.3.5, Java 17              |
| Frontend   | Angular 16, TypeScript                   |
| Database   | Microsoft SQL Server                     |
| Security   | Spring Security 6, JWT (JJWT 0.12.x)    |
| Styling    | Angular Material (akan dikonfigurasi)    |
| Build Tool | Maven (Backend), npm (Frontend)          |

## Struktur Monorepo

```
Sompo-Insurance-Assessment/
├── backend/                           # Spring Boot API
│   ├── src/main/java/com/taskmanagement/
│   │   ├── config/                    # Konfigurasi Security, Data Seeder
│   │   ├── controller/                # REST Controller (Auth, Task)
│   │   ├── dto/                       # Data Transfer Objects
│   │   │   ├── request/               # Request DTOs (Login, Register, Task)
│   │   │   └── response/              # Response DTOs (Auth, Task, User, Error)
│   │   ├── exception/                 # Custom Exception & Global Handler
│   │   ├── model/                     # Entity JPA (User, Task, Enums)
│   │   ├── repository/                # Spring Data JPA Repository
│   │   ├── security/                  # JWT Provider, Filter, UserDetails
│   │   └── service/                   # Business Logic Layer
│   ├── src/main/resources/
│   │   ├── application.properties     # Konfigurasi aplikasi
│   │   └── schema-seed.sql            # Script SQL manual
│   └── pom.xml
├── frontend/                          # Angular 16 Application
│   ├── src/
│   │   ├── app/                       # Komponen Angular
│   │   ├── assets/                    # Static assets
│   │   └── styles.scss                # Global styles
│   ├── angular.json
│   └── package.json
└── README.md
```

## Persyaratan Sistem

- **Java 17+** (JDK)
- **Node.js 16+** & **npm 8+**
- **Microsoft SQL Server** (2019 atau lebih baru)
- **Maven 3.8+** (atau gunakan Maven Wrapper di folder backend)

## Konfigurasi Database

### 1. Buat Database di SQL Server

```sql
CREATE DATABASE task_management_db;
GO
```

### 2. Konfigurasi Connection String & Environment

Aplikasi ini menggunakan file Environment (`.env`) untuk menjaga kerahasiaan data sensitif.

**Backend (.env):**
Buat file `backend/.env` (Anda bisa menyalin dari `backend/.env.example`):
```properties
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=task_management_db;encrypt=true;trustServerCertificate=true
DB_USERNAME=sa
DB_PASSWORD=MasukkanPasswordAndaDisini

JWT_SECRET=TaskManagementSecretKey2024SompoInsuranceAssessmentJWTSecretKeyMinimal256Bits
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

**Frontend (environment.ts):**
Buat file `frontend/src/environments/environment.ts` (salin dari `environment.example.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

> **Catatan**: Sesuaikan `DB_PASSWORD` dengan konfigurasi SQL Server Anda. File-file ini sudah masuk ke `.gitignore` sehingga aman.

### 3. Seed Data (Otomatis)

Aplikasi akan otomatis membuat tabel dan seed data saat pertama kali dijalankan (`spring.jpa.hibernate.ddl-auto=update` + `DataSeeder`).

**Akun Default:**

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@taskmanager.com   | admin123   |
| User  | user@taskmanager.com    | user1234   |

Alternatif: Jalankan script SQL manual di `backend/src/main/resources/schema-seed.sql`.

## Cara Menjalankan

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Atau menggunakan Maven global:

```bash
cd backend
mvn spring-boot:run
```

Backend akan berjalan di: `http://localhost:8080`

### Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

Frontend akan berjalan di: `http://localhost:4200`

## API Endpoints

[📚 Buka Dokumentasi API Lengkap di Postman](https://documenter.getpostman.com/view/39986471/2sBXwsK9br)

*(Catatan: Anda juga dapat mengimpor file `docs/Task_Management_System_API.postman_collection.json` yang tersedia di dalam repositori ini secara lokal ke dalam Postman Anda).*

### Autentikasi

| Method | Endpoint             | Deskripsi            | Akses   |
|--------|----------------------|----------------------|---------|
| POST   | `/api/auth/login`    | Login pengguna       | Public  |
| POST   | `/api/auth/register` | Registrasi pengguna  | Public  |
| GET    | `/api/auth/users`    | Daftar semua user    | Auth    |

### Manajemen Tugas

| Method | Endpoint                  | Deskripsi                | Akses   |
|--------|---------------------------|--------------------------|---------|
| GET    | `/api/tasks`              | Daftar tugas             | Auth    |
| GET    | `/api/tasks?search=&status=` | Cari & filter tugas   | Auth    |
| GET    | `/api/tasks/{id}`         | Detail tugas             | Auth    |
| POST   | `/api/tasks`              | Buat tugas baru          | ADMIN   |
| PUT    | `/api/tasks/{id}`         | Update tugas             | ADMIN   |
| PATCH  | `/api/tasks/{id}/status`  | Update status tugas      | Auth    |
| DELETE | `/api/tasks/{id}`         | Hapus tugas              | ADMIN   |

## Fitur Utama

- ✅ Autentikasi JWT dengan Spring Security 6
- ✅ Role-based Authorization (ADMIN & USER)
- ✅ CRUD Tugas lengkap
- ✅ Pencarian berdasarkan judul tugas
- ✅ Filter berdasarkan status (TODO, IN_PROGRESS, DONE)
- ✅ Validasi input dengan Bean Validation
- ✅ Password terenkripsi BCrypt
- ✅ Global Exception Handling
- ✅ Data Seeder untuk akun awal
- ✅ Frontend Angular dengan Angular Material

## Lisensi

Proyek ini dibuat untuk keperluan Technical Assessment Sompo Insurance.

---
**Disclaimer:**
*Codebase pada repositori ini dikembangkan dengan bantuan AI sebagai alat pendamping (pair-programming assistant). Meskipun demikian, arsitektur, desain sistem, logika bisnis, dan penyelesaian masalah diinisiasi, diarahkan, dan direview secara mandiri untuk memastikan standar industri, keamanan, dan fungsionalitas yang optimal terpenuhi sesuai degn requirment yang diberikan.*