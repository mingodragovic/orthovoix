# 🏥 Orthovoix Backend - Complete Speech Therapy Management System

A production-ready NestJS backend for speech therapy practice management with real-time notifications, multimedia exercise support, and comprehensive patient tracking.

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [What This Project Demonstrates](#what-this-project-demonstrates)

---

## 🎯 Overview

**Orthovoix Backend** is a comprehensive, enterprise-grade REST API built with NestJS for speech therapy practice management. It serves as the backbone for a complete therapy management platform, handling everything from patient intake to progress tracking with real-time notifications.

### What Makes This Stand Out

- **Complete Therapy Lifecycle Management**: From patient registration to discharge
- **Multimedia Exercise Support**: Upload and manage audio/video exercises
- **Real-Time Communication**: WebSocket notifications for instant updates
- **Role-Based Access**: Granular permissions for therapists and parents
- **Scalable Architecture**: Built with modular NestJS patterns

---

## ✨ Key Features

### 👤 Authentication & Authorization
- **JWT Authentication** with Access/Refresh token rotation
- **Role-Based Access Control** (Orthophoniste/Therapist, Parent)
- **Secure Password Reset** flow with expiration
- **Rate Limiting** on auth endpoints (5 req/min)
- **Session Management** with refresh token revocation

### 🏥 Patient Management
- **Complete Patient CRUD** with medical history tracking
- **Emergency Contact Management**
- **Therapy Goals & Progress Tracking**
- **Status Management** (Active/Inactive/Discharged)
- **Parent-Child Relationship** mapping
- **Soft Delete** functionality

### 📚 Exercise Management
- **10 Exercise Categories** (Pronunciation, Vocabulary, Grammar, etc.)
- **3 Difficulty Levels** (Beginner, Intermediate, Advanced)
- **Multimedia Support**: Upload audio, video, and images
- **Search & Filter** by category, difficulty, tags
- **Exercise Assignment** to patients

### 📊 Progress Tracking
- **Multi-Dimensional Scoring** (9 score types)
- **Progress Visualization** with chart-ready data
- **Goal Tracking** with status (not-started, in-progress, achieved)
- **Therapy Plan Adjustments**
- **Trend Analysis**

### 📅 Appointment Management
- **Scheduling** with conflict detection
- **Session Notes** with topics and progress
- **Virtual/In-Person** support
- **Status Tracking** (scheduled, in-progress, completed, cancelled)

### 🔔 Real-Time Notifications
- **WebSocket Integration** with Socket.IO
- **12 Notification Types** (appointment, exercise, progress, etc.)
- **Unread Count Tracking**
- **Mark as Read/Unread** functionality
- **Bulk Notification** support

### 💾 File Storage
- **MinIO Integration** (S3-compatible)
- **Audio/Image/Video Upload**
- **Presigned URLs** for secure access
- **Organized Folder Structure** by module

---

## 🏗️ Technical Architecture

### Architecture Overview
┌─────────────────────────────────────────────────────────────────────────────┐
│ ORTHOVOIX BACKEND │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ AUTH │ │ USERS │ │ PATIENTS │ │ EXERCISES │ │
│ │ MODULE │ │ MODULE │ │ MODULE │ │ MODULE │ │
│ │ │ │ │ │ │ │ │ │
│ │ • JWT │ │ • CRUD │ │ • Medical │ │ • Categories│ │
│ │ • Refresh │ │ • Roles │ │ • Therapy │ │ • Multimedia│ │
│ │ • Reset PW │ │ • Profile │ │ • Status │ │ • Search │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │PATIENT-EXER.│ │ PROGRESS │ │APPOINTMENTS │ │NOTIFICATIONS│ │
│ │ MODULE │ │ MODULE │ │ MODULE │ │ MODULE │ │
│ │ │ │ │ │ │ │ │ │
│ │ • Assign │ │ • Scoring │ │ • Schedule │ │ • WebSocket │ │
│ │ • Status │ │ • Chart Data│ │ • Notes │ │ • Real-time │ │
│ │ • Progress │ │ • Goals │ │ • Sessions │ │ • Unread │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ STORAGE │ │ COMMON │ │
│ │ MODULE │ │ MODULES │ │
│ │ │ │ │ │
│ │ • MinIO │ │ • Filters │ │
│ │ • Upload │ │ • Intercept │ │
│ │ • Presigned │ │ • DTOs │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ POSTGRESQL DATABASE │
│ │
│ users │ patients │ exercises │ patient_exercises │ progress_records │
│ │ │ │ │ │
│ appointments │ notifications │
└─────────────────────────────────────────────────────────────────────────────┘

text

### Database Schema

```sql
-- Core Tables
users          - User accounts with role-based access
patients       - Patient information with medical history
exercises      - Therapy exercises with multimedia URLs
patient_exercises - Exercise assignments with status/progress
progress_records - Multi-dimensional progress tracking
appointments   - Scheduled sessions with notes
notifications  - Real-time user notifications
🛠️ Tech Stack
Backend Framework
Technology	Version	Purpose
NestJS	10.x	Backend framework
TypeScript	5.x	Language
Node.js	18+	Runtime
Database
Technology	Version	Purpose
PostgreSQL	14+	Primary database
TypeORM	0.3.x	ORM
uuid-ossp	-	UUID generation
Authentication
Technology	Version	Purpose
Passport.js	0.7.x	Authentication strategies
JWT	10.x	Token generation
bcrypt	5.x	Password hashing
Storage
Technology	Version	Purpose
MinIO	Latest	S3-compatible object storage
Multer	-	File upload handling
Real-time
Technology	Version	Purpose
Socket.IO	4.x	WebSocket server
@nestjs/websockets	-	WebSocket integration
Development
Technology	Version	Purpose
ESLint	9.x	Code linting
Prettier	3.x	Code formatting
Jest	30.x	Unit testing
ts-node	10.x	TypeScript execution
Swagger	7.x	API documentation
📦 Installation
Prerequisites
bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# MinIO (optional for development)
minio --version

# NestJS CLI
npm install -g @nestjs/cli
Step 1: Clone and Install
bash
# Clone the repository
git clone <repository-url>
cd orthovoix-backend

# Install dependencies
npm install
Step 2: Environment Configuration
bash
# Copy environment example
cp .env.example .env

# Update with your credentials
# See .env.example for all required variables
Step 3: Database Setup
bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE orthovoix_db;"

# Enable UUID extension
psql -U postgres -d orthovoix_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Run migrations
npm run migration:run

# Seed the database with test data
npm run seed
Step 4: MinIO Setup (for file storage)
bash
# Download MinIO
# Visit: https://min.io/download

# Start MinIO server
minio server ~/minio_data --console-address ":9001"

# Access console at http://localhost:9001
# Default credentials: minioadmin / minioadmin
Step 5: Start the Application
bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
📚 API Documentation
Interactive Swagger Documentation
Once running, access Swagger UI at:

text
http://localhost:3000/api/docs
Authentication Endpoints
Method	Endpoint	Description	Access
POST	/auth/login	Login with email/password	Public
POST	/auth/logout	Logout and revoke refresh token	Auth
POST	/auth/refresh	Refresh access token	Public
POST	/auth/forgot-password	Request password reset	Public
POST	/auth/reset-password	Reset password with token	Public
GET	/auth/me	Get current user profile	Auth
POST	/auth/register	Register new parent	Public
Patient Endpoints
Method	Endpoint	Description	Access
POST	/patients	Create patient	Orthophoniste
GET	/patients	Get all patients	Orthophoniste
GET	/patients/my-patients	Get assigned patients	Orthophoniste
GET	/patients/my-child	Get my child	Parent
GET	/patients/:id	Get patient by ID	Both
PUT	/patients/:id	Update patient	Orthophoniste
DELETE	/patients/:id	Delete patient	Orthophoniste
Exercise Endpoints
Method	Endpoint	Description	Access
POST	/exercises	Create exercise	Orthophoniste
POST	/exercises/with-media	Create exercise with files	Orthophoniste
GET	/exercises	Get all exercises	Both
GET	/exercises/categories	Get categories	Both
GET	/exercises/search	Search exercises	Both
GET	/exercises/:id	Get exercise by ID	Both
PUT	/exercises/:id	Update exercise	Orthophoniste
DELETE	/exercises/:id	Delete exercise	Orthophoniste
File Upload Example
bash
# Upload audio with exercise creation
curl -X POST http://localhost:3000/api/exercises/with-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Pronunciation Practice" \
  -F "category=pronunciation" \
  -F "difficulty=intermediate" \
  -F "files=@audio.mp3" \
  -F "audioFileIndex=0"
🔒 Security Features
Implemented Security Measures
JWT Authentication with Access (15min) and Refresh (7d) tokens

Password Hashing with bcrypt (10 salt rounds)

Role-Based Access Control with custom guards

Input Validation with class-validator (whitelist enabled)

Rate Limiting (5 requests/minute on auth)

CORS Configuration restricted to allowed origins

XSS Protection via validation

SQL Injection Prevention via TypeORM parameterization

Session Management with token revocation

Secure Password Reset with expiration

Global Exception Filter for consistent error handling

Security Headers (Recommended for Production)
typescript
// Add helmet for production
npm install @nestjs/helmet

// In main.ts
app.use(helmet());
🧪 Testing
bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
Postman Collection
Import the provided Postman collection:

text
orthovoix-backend.postman_collection.json
Test Credentials
Role	Email	Password
Orthophoniste	dr.sarah@ortho.fr	Password123!
Parent 1	david.martin@email.com	Password123!
Parent 2	sophie.dupont@email.com	Password123!
