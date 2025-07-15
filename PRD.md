# 🧠 Task Master AI – MVP Project Requirement Document

> **Project Type**: AI-Powered Medical Data Management Platform\
> **Environment**: PostgreSQL + Drizzle ORM + Supabase Storage (Optional)\
> **Editor**: Cursor IDE\
> **Focus**: Medical record management for orthotic prescriptions, diagnostics, and media/scans\
> **Scope**: MVP (Minimum Viable Product)

---

## 📌 1. Objective

Task Master AI aims to streamline the creation and management of patient records, prescriptions, diagnoses, and medical media (photos, videos, and 3D scans) through a structured database and intelligent task assistance. This MVP will deliver the core infrastructure, access control, and CRUD functionality via a PostgreSQL schema built for Drizzle ORM.

---

## 🚀 2. Features (MVP Scope)

### ✅ Core Modules

| Module                 | Features                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| **User Management**    | - Create users with hashed passwords- Assign roles (admin, doctor, technician)                                  |
| **Patient Records**    | - Basic details: name, age, gender, contact- Emergency contact- Physical attributes (height, weight, shoe size) |
| **Prescriptions**      | - Create prescriptions per patient- Specify orthotic type and notes                                             |
| **Diagnoses**          | - Add multiple diagnoses per prescription- Include diagnosis type, GMFCS level, and recommendation              |
| **Media Uploads**      | - Upload patient photos/videos with tags: view & body part                                                      |
| **3D Scan Uploads**    | - Upload original or corrected scans- Track versions and upload notes                                           |
| **External Documents** | - Attach files (PDF, DOCX) related to patient                                                                   |
| **Audit Logging**      | - Track who changed what and when for all major records                                                         |

---

## 🗃️ 3. Database Models (PostgreSQL + Drizzle ORM)

### Entity Summary

| Table            | Description                               |
| ---------------- | ----------------------------------------- |
| `users`          | App users with login credentials          |
| `roles`          | Role definitions (admin, doctor...)       |
| `user_roles`     | Links users to roles (many-to-many)       |
| `patients`       | All patient-related information           |
| `prescriptions`  | Per-patient prescriptions                 |
| `diagnoses`      | Related diagnoses for prescriptions       |
| `media_files`    | Patient image/video uploads               |
| `scans`          | Patient scan uploads (original/corrected) |
| `external_files` | Reports or docs (PDF, DOCX, etc.)         |
| `audit_logs`     | Change history for traceability           |

### Relational Highlights

- One `patient` → many `prescriptions`
- One `prescription` → many `diagnoses`
- One `patient` → many `media_files`, `scans`, and `external_files`
- Users can be assigned many roles
- All key changes (insert/update/delete) are logged in `audit_logs`

---

## 🛠️ 4. Development Tasks (In Cursor IDE)

### 1. Project Setup

-

### 2. Schema Modeling (Drizzle)

-

### 3. Migrations

-

### 4. Sample Data Seeding

-

---

## 🔐 5. Security & Access Control (MVP-level)

| Level          | Strategy                                                                    |
| -------------- | --------------------------------------------------------------------------- |
| Authentication | Not in MVP, but structure ready for token-based login (Supabase/Auth.js)    |
| Authorization  | Role-based via `user_roles`                                                 |
| Audit Trail    | All changes recorded in `audit_logs` table                                  |
| File Access    | Use secure external storage (e.g. Supabase bucket w/ signed URLs if needed) |

---

## 📆 6. File & Media Storage

| Type          | Notes                                       |
| ------------- | ------------------------------------------- |
| 3D Scans      | Store URL + version metadata                |
| Media Files   | Tag with view & body part                   |
| External Docs | Attach DOCX, PDF, etc. with patient linkage |

> ⚠️ Actual storage (Supabase, S3) is optional for MVP. Use mocked URLs in dev.

---

## 📊 7. Future Roadmap (Post-MVP)

- ✅ Full authentication + access control UI
- ✅ Admin dashboard to view all activity
- ✅ AI-powered diagnosis recommendation
- ✅ PDF export for patient records
- ✅ Scan visualization (React Three Fiber)

---

## 📁 8. Folder Structure Suggestion (Cursor IDE)

```
/task-master-ai/
├── drizzle/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── patients.ts
│   │   ├── prescriptions.ts
│   │   └── ...
│   └── migrations/
├── scripts/
│   └── seed.ts
├── .env
├── drizzle.config.ts
├── README.md
└── task-master-ai-prd.md  <-- THIS FILE
```

---

## ✅ Deliverables for MVP Completion

| Deliverable                 | Description                             |
| --------------------------- | --------------------------------------- |
| ✅ PostgreSQL schema         | Fully defined Drizzle-compatible schema |
| ✅ Migrations                | Working migration scripts               |
| ✅ Seed Script               | Sample patients, doctors, diagnoses     |
| ✅ `PRD.md`                  | PRD documentation                       |
| ✅ Local dev ready in Cursor | All tasks runnable via Cursor IDE       |

