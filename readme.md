# K3-SMART

<img src="public/images/Login page k3smart.png" alt="Login Page" width="100%" />

Platform pembelajaran keselamatan kerja berbasis web menggunakan:

* Next.js
* TypeScript
* Prisma ORM
* PostgreSQL
* NextAuth
* TailwindCSS
* shadcn/ui

---

# Prerequisites

Pastikan sudah terinstall:

* Node.js >= 20
* PostgreSQL
* pnpm

Cek versi:

```bash
node -v
pnpm -v
```

---

# Clone Project

```bash
git clone <repository-url>
cd <project-folder>
```

---

# Install Dependencies

```bash
pnpm install
```

---

# Setup Environment

Copy file environment:

```bash
cp .env.example .env
```

Isi `.env` sesuai database dan konfigurasi lokal.

Contoh:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/k3smart"

NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

# Generate Prisma Client

```bash
npx prisma generate
```

---

# Jalankan Migration

```bash
npx prisma migrate dev
```

---

# Seed Database (Opsional)

```bash
npx prisma db seed
```

---

# Jalankan Development Server

```bash
pnpm dev
```

Akses:

```txt
http://localhost:3000
```

---

# Build Production

```bash
pnpm build
```

---

# Jalankan Production

```bash
pnpm start
```

---

# Struktur Hierarki Organisasi

```txt
Unit
└── Division
    └── Shift
        └── User
```

Contoh nyata:

```txt
PLTU Unit 1
└── Divisi Operasi
    └── Shift Pagi
        └── Worker A
```

---

# Akun Role

```txt
SUPER_ADMIN
HSE_ADMIN
REWARD_ADMIN
WORKER
```

---

# Fitur Utama

* Authentication & Authorization
* CMS Materi K3
* Quiz & Bank Soal
* Academic Period
* Material Progress
* Notification System
* Reward & Point System
* Dashboard Admin & Worker

---

# Git Workflow

Pull terbaru:

```bash
git pull origin main
```

Commit perubahan:

```bash
git add .
git commit -m "feat: update K3-SMART feature"
```

Push:

```bash
git push origin main
```

---

# Prisma Commands

Generate client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

Reset database:

```bash
npx prisma migrate reset
```

---

# Docker (Opsional)

Build:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```
