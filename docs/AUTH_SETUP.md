# K3-SMART Authentication Setup Guide

## Overview

K3-SMART menggunakan NextAuth v5 dengan Prisma adapter untuk manajemen autentikasi dan otorisasi berbasis peran (Role-Based Access Control).

## Architecture

### Authentication Strategy
- **Provider**: Credentials (username/password)
- **Session**: JWT-based
- **Adapter**: Prisma adapter untuk NextAuth
- **Storage**: Database PostgreSQL

### User Roles
1. **SUPER_ADMIN** - Akses penuh ke seluruh sistem
2. **HSE_ADMIN** - Admin keselamatan kerja
3. **SUPERVISOR** - Supervisor/pimpinan shift
4. **WORKER** - Pekerja reguler

## Database Schema

### User Model
```prisma
model User {
  id              String      @id @default(cuid())
  email           String      @unique
  emailVerified   DateTime?
  name            String?
  password        String?
  role            UserRole    @default(WORKER)
  status          UserStatus  @default(ACTIVE)
  lastLogin       DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  accounts        Account[]
  sessions        Session[]
  // ... relations
}
```

### Account & Session Models
- **Account**: Menyimpan informasi provider (untuk OAuth di masa depan)
- **Session**: Menyimpan session token dengan expiration
- **VerificationToken**: Untuk email verification dan password reset

## Setup Instructions

### 1. Environment Variables

Buat file `.env.local` dengan konfigurasi:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/k3_smart_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Untuk generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Database Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma:generate

# Create database and run migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio
pnpm prisma:studio
```

### 3. Create Initial User

Gunakan Prisma Studio atau buat script untuk menambah user pertama:

```bash
pnpm prisma:studio
```

Di Prisma Studio, tambahkan user baru dengan:
- Email: test@example.com
- Password: hashed password (gunakan bcrypt)
- Role: SUPER_ADMIN
- Status: ACTIVE

Atau gunakan script:
```ts
import { hashPassword } from '@/lib/auth';

const password = await hashPassword('YourPassword123');
await db.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
    password,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  },
});
```

## Authentication Flow

### Login Process

1. User submits credentials (email + password)
2. NextAuth CredentialsProvider meng-authorize user:
   - Validasi input dengan Zod schema
   - Cari user di database berdasarkan email
   - Validasi status user (harus ACTIVE)
   - Compare password dengan bcrypt
   - Update lastLogin timestamp
3. JWT token dibuat dan disimpan di session cookie
4. User diarahkan ke `/dashboard`

### Request dengan Session

Setiap request yang memerlukan autentikasi:

```tsx
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Akses user data
  const user = session.user as any;
  console.log(user.id, user.email, user.role);
}
```

## Role-Based Access Control (RBAC)

### Role Guard Utilities

File: `lib/role-guard.ts`

```ts
// Require authentication
await requireAuth();

// Require specific roles
await requireAuth(['SUPER_ADMIN', 'HSE_ADMIN']);

// Check role
const isAdmin = await hasRole(['SUPER_ADMIN', 'HSE_ADMIN']);

// Get current user
const user = await getCurrentUser();

// Helper functions
const admin = await isAdmin();
const supervisor = await isSupervisor();
```

### Middleware Protection

File: `middleware.ts`

Middleware secara otomatis:
- Validasi session untuk setiap request
- Redirect ke `/login` jika tidak authenticated
- Enforce role-based access:
  - `/dashboard/admin/*` → SUPER_ADMIN, HSE_ADMIN
  - `/dashboard/supervisor/*` → SUPER_ADMIN, HSE_ADMIN, SUPERVISOR
  - `/dashboard/*` → Semua authenticated users

### Server Action Protection

```ts
// app/actions/users.ts
export async function deleteUser(userId: string) {
  await requireAuth(['SUPER_ADMIN']); // Only SUPER_ADMIN
  // ... action logic
}
```

### API Route Protection

```ts
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Protected endpoint logic
}
```

## Pages & Routes

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (All Authenticated Users)
- `/dashboard` - Main dashboard
- `/dashboard/worker` - Worker dashboard

### Supervisor+ Routes
- `/dashboard/supervisor` - Supervisor dashboard

### Admin Routes
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/users` - User management

## Server Actions

### Authentication Actions

**File**: `app/actions/auth.ts`

- `registerUser(data)` - Register new worker account

### User Management Actions

**File**: `app/actions/users.ts`

- `getAllUsers(page, limit)` - Get all users (admin only)
- `getUser(userId)` - Get user details
- `updateUserProfile(userId, data)` - Update user profile
- `updateUserRole(userId, role)` - Change user role (admin only)
- `updateUserStatus(userId, status)` - Change user status (admin only)
- `deleteUser(userId)` - Delete user (SUPER_ADMIN only)

## Session Management

### Session Expiration
- Default: 24 hours (`maxAge: 24 * 60 * 60`)
- Configurable di `lib/auth.ts`

### Session Storage
- Strategy: JWT
- Storage: HTTP-only cookies (secure)
- Token location: Managed by NextAuth automatically

### Custom Session Extension

Untuk menambah custom claims ke session:

```ts
// lib/auth.ts
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.customField = 'value';
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).customField = token.customField;
    }
    return session;
  },
}
```

## Password Management

### Hashing
Menggunakan bcryptjs dengan salt rounds = 10

```ts
const hashedPassword = await hashPassword(rawPassword);
const isValid = await verifyPassword(rawPassword, hashedPassword);
```

### Password Strength Validation
Minimum requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

```ts
const strength = validatePasswordStrength(password);
if (!strength.isValid) {
  console.log(strength.errors); // Array of validation errors
}
```

## Common Issues & Solutions

### Session Not Persisting
- Periksa `NEXTAUTH_SECRET` di `.env.local`
- Pastikan `NEXTAUTH_URL` sesuai dengan domain
- Clear browser cookies dan coba lagi

### Login Fails
- Pastikan user ada di database dengan password yang benar
- Validasi password format (8 chars, 1 uppercase, 1 lowercase, 1 number)
- Check `user.status` harus 'ACTIVE'

### Unauthorized Access
- Periksa user role di database
- Validasi role requirements di route/action
- Check middleware configuration

### Database Connection Error
- Verify `DATABASE_URL` format
- Pastikan PostgreSQL database running
- Test connection: `pnpm prisma:studio`

## Testing

### Manual Testing

1. **Register User**
   ```
   POST /api/auth/callback/credentials
   Email: test@example.com
   Password: TestPass123
   ```

2. **Login**
   ```
   POST /api/auth/callback/credentials
   Email: test@example.com
   Password: TestPass123
   ```

3. **Access Protected Route**
   ```
   GET /dashboard
   (Should redirect if not authenticated)
   ```

### API Testing with curl

```bash
# Test protected endpoint
curl -X GET http://localhost:3000/api/users \
  -H "Cookie: sessionToken=<token>"
```

## Security Best Practices

1. **Never commit secrets**
   - Use `.env.local` (gitignored)
   - For production, use Vercel secrets

2. **HTTPS only in production**
   - Set `NEXTAUTH_URL="https://yourdomain.com"`

3. **Password hashing**
   - Selalu hash password dengan bcrypt
   - Never store plain text passwords

4. **Session security**
   - Use JWT strategy
   - HTTP-only cookies enabled by default
   - CSRF protection via NextAuth

5. **Database security**
   - Use parameterized queries (Prisma does this)
   - Validate all inputs (Zod schemas)
   - Implement proper error handling

## Next Steps

1. Create admin user via Prisma Studio
2. Test login flow
3. Test role-based access
4. Implement password reset (optional)
5. Setup email notifications (optional)
