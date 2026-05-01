# K3-SMART Folder Structure

```
app/
├── page.tsx                        — Root redirect ke role-based dashboard
├── layout.tsx                      — Root layout: fonts, theme, providers
├── globals.css
│
├── actions/                        — Next.js Server Actions (CRUD & business logic)
│   ├── auth.actions.ts             — login, logout, register
│   ├── user.actions.ts             — CRUD user, status, role changes
│   ├── content.actions.ts           — CRUD materi, schedule publish
│   ├── quiz.actions.ts              — CRUD soal, submit jawaban
│   ├── progress.actions.ts          — checkin, mark complete materi
│   ├── reward.actions.ts            — CRUD reward, redeem logic
│   ├── notification.actions.ts      — kirim notif manual
│   └── report.actions.ts            — generate laporan
│
├── api/
│   ├── auth/[...nextauth]/
│   │   └── route.ts                — NextAuth handler
│   ├── upload/
│   │   └── route.ts                — File upload multipart/form-data
│   ├── upload/presign/
│   │   └── route.ts                — Presigned URL untuk client-side upload
│   ├── media/[fileId]/
│   │   └── route.ts                — Stream file dari storage
│   ├── cron/
│   │   ├── publish-content/route.ts — Auto publish scheduled materi
│   │   ├── send-reminders/route.ts  — Kirim reminder quiz H-1
│   │   └── calc-points/route.ts     — Rekap poin bulanan
│   └── webhooks/
│       └── whatsapp/route.ts        — Webhook WA notification
│
├── (auth)/                         — Route Group: Auth pages (no sidebar)
│   ├── layout.tsx                  — Fullscreen layout
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (worker)/                       — Route Group: Worker / TAD
│   ├── layout.tsx                  — Mobile-first layout + bottom nav
│   ├── home/
│   │   └── page.tsx                — Dashboard: poin, streak, materi hari ini
│   ├── materials/
│   │   ├── page.tsx                — Daftar materi (filter topik)
│   │   └── [materialId]/
│   │       └── page.tsx            — Detail materi + mulai quiz
│   ├── quiz/
│   │   ├── page.tsx                — Daftar quiz aktif / history
│   │   └── [quizId]/
│   │       ├── page.tsx            — Pengerjaan quiz (timer, soal)
│   │       └── result/
│   │           └── page.tsx        — Hasil: skor, poin, feedback
│   ├── leaderboard/
│   │   └── page.tsx                — Leaderboard bulanan & semesteran
│   ├── rewards/
│   │   └── page.tsx                — Katalog reward & redeem
│   └── profile/
│       └── page.tsx                — Badge, poin history, statistik
│
├── (hse)/                          — Route Group: HSE Admin
│   ├── layout.tsx                  — Sidebar + header layout
│   ├── dashboard/
│   │   └── page.tsx                — KPI realtime, near miss monitoring
│   ├── content/
│   │   ├── page.tsx                — List semua materi (CMS)
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [materialId]/edit/
│   │       └── page.tsx
│   ├── questions/
│   │   ├── page.tsx                — Bank soal
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [questionId]/edit/
│   │       └── page.tsx
│   ├── quiz-sessions/
│   │   └── page.tsx                — Monitor sesi quiz aktif
│   ├── participants/
│   │   ├── page.tsx                — Semua pekerja + status
│   │   └── [userId]/
│   │       └── page.tsx            — Detail pekerja
│   └── reports/
│       └── page.tsx                — Generate & download laporan
│
├── (reward)/                       — Route Group: Reward Admin
│   ├── layout.tsx                  — Sidebar + header layout
│   ├── dashboard/
│   │   └── page.tsx                — Overview reward management
│   ├── rewards/
│   │   ├── page.tsx                — Kelola katalog reward
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [rewardId]/edit/
│   │       └── page.tsx
│   ├── redemptions/
│   │   ├── page.tsx                — Proses/tolak permintaan redeem
│   │   └── [redemptionId]/
│   │       └── page.tsx
│   └── reports/
│       └── page.tsx                — Laporan penukaran reward
│
├── (supervisor)/                   — Route Group: Supervisor
│   ├── layout.tsx                  — Sidebar + header layout
│   ├── dashboard/
│   │   └── page.tsx                — Monitor tim: partisipasi, progress
│   └── team/
│       ├── page.tsx                — List anak buah + status
│       └── [userId]/
│           └── page.tsx            — Detail anak buah
│
└── (admin)/                        — Route Group: Super Admin
    ├── layout.tsx                  — Sidebar + header layout
    ├── dashboard/
    │   └── page.tsx                — Overview seluruh sistem
    ├── users/
    │   ├── page.tsx
    │   └── create/
    │       └── page.tsx
    ├── units/
    │   └── page.tsx                — CRUD unit, divisi, shift
    ├── settings/
    │   └── page.tsx                — Konfigurasi sistem
    └── audit/
        └── page.tsx                — Audit log semua aksi

components/
├── auth/
│   ├── login-form.tsx              — Login form component ('use client')
│   ├── register-form.tsx           — Register form component ('use client')
│   └── logout-button.tsx           — Logout button ('use client')
├── users/
│   ├── user-list.tsx               — User list dengan pagination ('use client')
│   ├── user-table.tsx              — User table dengan inline edit ('use client')
│   ├── user-edit-dialog.tsx        — Edit user modal ('use client')
│   ├── user-delete-dialog.tsx      — Delete confirmation ('use client')
│   └── create-user-form.tsx        — Create user form ('use client')
├── admin/
│   ├── admin-panel.tsx             — Admin dashboard overview ('use client')
│   └── user-management-page.tsx    — User management page wrapper ('use client')
└── ui/                             — shadcn/ui components

lib/
├── auth.ts                         — NextAuth config, helpers
├── db.ts                           — Prisma client singleton
├── role-guard.ts                   — Role-based access control
├── types.ts                        — Type definitions
└── validations.ts                  — Zod schemas

prisma/
├── schema.prisma                   — Database schema
├── migrations/                     — Migration history
└── seed.ts                         — Seed data script
```

## Key Principles

1. **Pages are Server Components** - No `'use client'` in page.tsx files
2. **Client Components in Components Folder** - Separate client logic into components/ folder
3. **Server Actions for CRUD** - All business logic in app/actions/
4. **API Routes for Uploads** - Only multipart/form-data and file streaming
5. **Route Groups for Role Separation** - (auth), (worker), (hse), (reward), (supervisor), (admin)
6. **Clear Separation of Concerns** - UI logic separate from business logic

## Roles & Permissions

- **SUPER_ADMIN** - Full system access, user management, settings, audit logs
- **HSE_ADMIN** - Manage K3 content: materi, soal, quiz, monitoring
- **REWARD_ADMIN** - Manage rewards: katalog, penukaran, hadiah, approval
- **SUPERVISOR** - All admin features (HSE + Reward) untuk tim mereka
- **WORKER** - Belajar materi, jawab kuis, kumpul poin, tukar reward
