# User Management Features Documentation

## Overview
Implementasi lengkap fitur user management meliputi profil user, change password, dan reset password oleh admin.

## Fitur 1: User Profile (My Profile)

### Lokasi
- **Route:** `/worker/profile`
- **Component:** `components/users/user-profile.tsx`
- **Page:** `app/(worker)/profile/page.tsx`

### Deskripsi
Halaman profile user menampilkan informasi lengkap profil dengan fitur change password.

### Informasi yang Ditampilkan
- **Profile Picture:** Foto profil (atau default icon jika tidak ada)
- **Basic Info:**
  - Full Name
  - Email
  - Role (badge)
  - Status (Active/Inactive/Suspended)

- **Personal Information:**
  - Full Name
  - Email
  - NIP
  - Role

- **Organization:**
  - Unit
  - Division
  - Shift

- **Account Information:**
  - Account Created Date
  - Last Login

### Action Buttons
- **Change Password:** Membuka dialog untuk mengubah password

### Flow Diagram
```
User opens /worker/profile
         ↓
Load getUserProfile(userId)
         ↓
Display profile information
         ↓
Click "Change Password" button
         ↓
Open change password dialog
         ↓
Enter old password + new password
         ↓
Validate & submit changePassword()
         ↓
Success message → Close dialog
```

## Fitur 2: Change Password (User)

### Backend Action
**Function:** `changePassword(userId, oldPassword, newPassword)`
**Location:** `app/actions/users.ts`

### Validation
- ✅ Old password must match current password
- ✅ New password must be at least 8 characters
- ✅ Must contain uppercase letter (A-Z)
- ✅ Must contain lowercase letter (a-z)
- ✅ Must contain number (0-9)
- ✅ New password must match confirmation

### Implementation Details
```typescript
async changePassword(userId, oldPassword, newPassword) {
  1. Verify user exists
  2. Get current password hash
  3. Verify oldPassword matches
  4. Validate newPassword strength
  5. Hash newPassword
  6. Update in database
  7. Return success message
}
```

### Error Handling
- User not found
- Current password is incorrect
- New password doesn't meet requirements
- Passwords don't match
- Database errors

---

## Fitur 3: Reset Password (Admin Only)

### Lokasi
- **Component:** `components/users/reset-password-dialog.tsx`
- **Used in:** `components/users/user-table.tsx`
- **Backend Action:** `app/actions/users.ts`

### Authorization
Only SUPER_ADMIN and HSE_ADMIN can reset passwords.

### Deskripsi
Admin dapat mereset password user dengan cara:
1. Pilih user dari list
2. Klik tombol "Reset Password" (Key icon)
3. Dialog terbuka dengan konfirmasi
4. Klik "Reset Password" untuk generate password baru
5. Password baru ditampilkan → Copy → Bagikan ke user

### Backend Action
**Function:** `resetPassword(userId)`
**Location:** `app/actions/users.ts`

### Password Generation
- Length: 12 characters
- Contains: Uppercase, Lowercase, Numbers, Special characters (!@#$%^&*)
- Randomized order untuk security

### Dialog States

#### Before Reset
- Show user info (Name, Email)
- Warning message
- Two buttons: Cancel / Reset Password

#### After Reset
- ✅ Success message
- Display generated password in input field
- Show/Hide password toggle
- Copy button with feedback
- Warning to save password securely

### Implementation Details
```typescript
async resetPassword(userId) {
  1. Verify admin authorization
  2. Find user by ID
  3. Generate random strong password (12 char)
  4. Hash password
  5. Update user.password in database
  6. Return newPassword (plain text - one time only!)
}

function generateRandomPassword() {
  - Min 1 uppercase
  - Min 1 lowercase
  - Min 1 number
  - Min 1 special char
  - Total 12 characters
  - Randomized order
}
```

### Error Handling
- User not found
- Unauthorized (not admin)
- Database errors

### Security Notes
⚠️ **Important:**
- Password ditampilkan hanya sekali di modal
- Admin harus copy dan share melalui secure channel
- User **harus** ubah password saat login pertama
- Tidak disimpan di audit log (hanya password hash)

---

## Database Schema

### User Model (prisma/schema.prisma)
```prisma
model User {
  id              String     @id @default(cuid())
  email           String     @unique
  name            String?
  image           String?    // Profile picture
  password        String?    // Hashed password
  nip             String?    @unique
  role            UserRole   @default(WORKER)
  status          UserStatus @default(ACTIVE)
  unitId          String?
  divisionId      String?
  shiftId         String?
  lastLogin       DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  // Relations
  unit            Unit?       @relation(fields: [unitId], references: [id])
  division        Division?   @relation(fields: [divisionId], references: [id])
  shift           Shift?      @relation(fields: [shiftId], references: [id])
}
```

---

## API Endpoints

### 1. Get User Profile
```
GET /api/users/profile
Authorization: Required
Params: userId (from session)
Response: {
  success: boolean
  data: {
    id, email, name, image, nip, role, status,
    unit, division, shift, createdAt, lastLogin
  }
}
```

### 2. Change Password
```
POST /api/users/change-password
Authorization: Required (own user)
Body: {
  oldPassword: string
  newPassword: string
}
Response: {
  success: boolean
  message: string
  error: string (if failed)
}
```

### 3. Reset Password (Admin)
```
POST /api/users/reset-password/:userId
Authorization: SUPER_ADMIN, HSE_ADMIN
Response: {
  success: boolean
  data: {
    userId: string
    email: string
    name: string
    newPassword: string
  }
  message: string
}
```

---

## Usage Examples

### User Changing Password
```typescript
import { changePassword } from "@/app/actions/users";

const result = await changePassword(
  userId,
  "oldPassword123",
  "NewPassword123"
);

if (result.success) {
  console.log("Password changed successfully");
} else {
  console.error(result.error);
}
```

### Admin Resetting Password
```typescript
import { resetPassword } from "@/app/actions/users";

const result = await resetPassword(userIdToReset);

if (result.success) {
  const newPassword = result.data.newPassword;
  // Copy dan bagikan ke user
  navigator.clipboard.writeText(newPassword);
}
```

---

## Components Relationship

```
UserProfile (user-profile.tsx)
├── displays profile info
└── "Change Password" button
    └── opens modal
        └── calls changePassword()

UserTable (user-table.tsx)
├── displays user list
└── Actions column
    └── "Reset Password" button (Key icon)
        └── opens ResetPasswordDialog
            └── calls resetPassword()

ResetPasswordDialog (reset-password-dialog.tsx)
├── before reset: show user info
├── after reset: show generated password
└── Copy button with feedback
```

---

## Testing Checklist

- [ ] User dapat melihat profil lengkap di `/worker/profile`
- [ ] User dapat change password dengan validasi benar
- [ ] Old password harus benar untuk change password
- [ ] New password harus memenuhi requirements
- [ ] Admin dapat reset password user
- [ ] Password baru ter-generate random
- [ ] Admin dapat copy password
- [ ] Dialog menutup setelah success

---

## Security Considerations

1. **Password Hashing:** Semua password di-hash dengan bcrypt (salt 10)
2. **Authorization:** Change password hanya boleh untuk user sendiri
3. **Reset Password:** Hanya admin yang bisa reset
4. **Password Requirements:**
   - Minimum 8 characters
   - Must include uppercase, lowercase, numbers
   - Optional: special characters untuk generated password
5. **No Audit Trail:** Password reset tidak disimpan di log (hanya hash)
6. **Session Security:** Menggunakan NextAuth.js dengan JWT

---

## Troubleshooting

### Password change failed - "Current password is incorrect"
- User memasukkan old password yang salah
- Pastikan caps lock tidak aktif

### Reset password button tidak muncul
- Periksa authorization level user
- Hanya SUPER_ADMIN dan HSE_ADMIN yang bisa lihat tombol

### Generated password tidak bisa di-copy
- Gunakan button "Copy" di dialog
- Chrome/Firefox: automatic clipboard access
- Safari: might need manual copy

---

## Future Enhancements
- [ ] Two-factor authentication (2FA)
- [ ] Password history (prevent reuse)
- [ ] Password expiration policy
- [ ] Login attempt tracking
- [ ] IP whitelist for admin accounts
- [ ] Email confirmation untuk password reset
