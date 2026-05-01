# K3-SMART Project Setup

## Project Overview

K3-SMART adalah aplikasi pembelajaran keselamatan kerja berbasis mobile untuk menciptakan budaya zero accident di lingkungan pembangkit listrik.

**Features:**
- Material K3 mingguan (video, infografis, artikel)
- Kuis mingguan wajib
- Sistem poin & leaderboard
- Dashboard manajemen real-time
- Reward redemption system

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth v5
- **Validation**: Zod
- **Styling**: Tailwind CSS + shadcn/ui
- **Password Hashing**: bcryptjs

## Tahap Pengembangan

### ✅ Tahap 01: Project Setup + Prisma Schema
- Database schema lengkap dengan 27 tables
- Prisma client configuration
- Type definitions
- Validation schemas
- Helper utilities

### 🔄 Tahap 02: Autentikasi (NextAuth v5 + Middleware + Role Guard)
- NextAuth v5 configuration
- Login & Register pages
- Session management
- Role-based access control (RBAC)
- Middleware untuk route protection

### 📋 Tahap 03: User Management (CRUD)
- User listing dengan filter
- User creation
- User profile update
- User deletion/suspension
- User role assignment

---

## Setup Instructions

### 1. Copy Environment File
```bash
cp .env.example .env.local
```

### 2. Update Database URL
Edit `.env.local` dan sesuaikan `DATABASE_URL` dengan PostgreSQL connection string Anda.

Contoh untuk lokal:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/k3_smart_db"
```

### 3. Generate Prisma Client
```bash
pnpm prisma:generate
```

### 4. Run Database Migration
```bash
pnpm prisma:migrate
```

Ketika diminta nama migration, gunakan nama deskriptif seperti:
```
initial_schema
```

### 5. (Optional) Seed Database
Jika sudah ada seed script:
```bash
pnpm prisma:seed
```

### 6. Start Development Server
```bash
pnpm dev
```

Server akan berjalan di `http://localhost:3000`

---

## Database Management

### View Database dengan Prisma Studio
```bash
pnpm prisma:studio
```

### Reset Database (Development Only)
⚠️ **Warning**: Ini akan menghapus semua data!
```bash
pnpm db:reset
```

### Create New Migration
```bash
pnpm prisma:migrate
```

### Apply Production Migrations
```bash
pnpm prisma:migrate:prod
```

---

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── api/                # API routes (server actions)
├── components/             # React components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── types.ts            # TypeScript type definitions
│   ├── auth.ts             # Auth utilities
│   ├── validations.ts      # Zod validation schemas
│   └── utils.ts            # Common utilities (cn, etc)
├── prisma/
│   ├── schema.prisma       # Prisma database schema
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── .env.example            # Environment template
├── SETUP.md                # Ini file
└── package.json
```

---

## Database Schema Overview

### Organizational Structure
- **units** - Unit kerja (contoh: PLTG Tanjung Redeb)
- **divisions** - Divisi dalam unit
- **shifts** - Shift kerja dalam divisi

### User Management
- **users** - Pengguna dengan roles (SUPER_ADMIN, HSE_ADMIN, SUPERVISOR, WORKER)
- **sessions** - Session management

### Content Management
- **topics** - Topik K3 (contoh: "Keselamatan Kerja di Ketinggian")
- **materials** - Materi pembelajaran (VIDEO, INFOGRAPHIC, ARTICLE)
- **material_assignments** - Penugasan materi ke unit/divisi/shift
- **media_files** - File media (video, gambar)

### Quiz System
- **question_banks** - Bank soal quiz
- **answer_options** - Pilihan jawaban
- **quiz_configs** - Konfigurasi quiz untuk materi
- **quiz_sessions** - Sesi quiz pengguna
- **user_answers** - Jawaban pengguna per pertanyaan

### Gamification
- **point_transactions** - Transaksi poin
- **monthly_point_summaries** - Ringkasan poin bulanan
- **semester_summaries** - Ringkasan poin semesteran
- **user_streaks** - Streak harian
- **badge_definitions** - Definisi badge
- **user_badges** - Badge yang dimiliki pengguna

### Rewards
- **rewards** - Hadiah yang bisa ditukar
- **redemptions** - Riwayat penukaran hadiah

### System
- **notifications** - Notifikasi untuk pengguna
- **audit_logs** - Audit trail untuk compliance
- **system_configs** - Konfigurasi sistem

---

## Next Steps

Setelah setup selesai, lanjutkan ke **Tahap 02: Autentikasi**

Instruksi akan diberikan di tahap berikutnya.

---

## Troubleshooting

### Error: DATABASE_URL not found
Pastikan `.env.local` sudah ada dan `DATABASE_URL` sudah diset dengan benar.

### Error: Can't reach database
- Pastikan PostgreSQL running
- Cek connection string di `.env.local`
- Pastikan database sudah dibuat

### Error: Prisma Client generation failed
```bash
# Clean and regenerate
rm -rf node_modules/.prisma
pnpm prisma:generate
```

### Error: Migration failed
- Cek error message dengan detail
- Jika perlu reset, gunakan `pnpm db:reset` (development only)
- Atau buat migration baru untuk fix schema

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Zod Documentation](https://zod.dev)

---

**Last Updated**: May 2026
