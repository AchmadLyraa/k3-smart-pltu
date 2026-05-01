# User Management - CRUD Operations

## Overview

Complete CRUD (Create, Read, Update, Delete) user management system for K3-SMART application with role-based access control and comprehensive validation.

## Features

- Create new users with role assignment
- View all users with pagination and search
- Update user profile and organizational assignment
- Change user role and status
- Delete users (SUPER_ADMIN only)
- Real-time role and status updates
- Comprehensive error handling

## Directory Structure

```
components/users/
├── user-list.tsx              # Main user list component with pagination
├── user-table.tsx             # User table with inline role/status editing
├── user-edit-dialog.tsx       # Edit user profile modal
├── user-delete-dialog.tsx     # Delete confirmation dialog
└── create-user-form.tsx       # Create new user form

app/
├── actions/
│   └── users.ts              # Server actions for CRUD operations
├── api/
│   └── users/
│       ├── route.ts          # GET all users, POST create user
│       └── [id]/route.ts     # GET, PUT, DELETE single user
└── dashboard/
    └── admin/
        └── page.tsx          # Admin dashboard with user management
```

## API Endpoints

### GET /api/users
Get all users with pagination (admin only)

**Query Parameters:**
- `page` (number): Page number, default 1
- `limit` (number): Items per page, default 10

**Response:**
```json
{
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "WORKER",
      "status": "ACTIVE",
      "lastLogin": "2024-05-01T10:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### POST /api/users
Create new user (admin only)

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "nip": "12345678",
  "role": "WORKER"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "WORKER"
}
```

### GET /api/users/[id]
Get single user details

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "nip": "12345678",
  "role": "WORKER",
  "status": "ACTIVE",
  "unitId": "unit-id",
  "divisionId": "division-id",
  "shiftId": "shift-id",
  "unit": { "id": "unit-id", "name": "Unit A" },
  "division": { "id": "div-id", "name": "Division A" },
  "shift": { "id": "shift-id", "name": "Shift A" }
}
```

### PUT /api/users/[id]
Update user (admin only)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "nip": "87654321",
  "role": "SUPERVISOR",
  "status": "ACTIVE",
  "unitId": "unit-id",
  "divisionId": "division-id",
  "shiftId": "shift-id"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "role": "SUPERVISOR",
  "status": "ACTIVE"
}
```

### DELETE /api/users/[id]
Delete user (SUPER_ADMIN only)

**Response:**
```json
{
  "message": "User deleted"
}
```

## Server Actions

### createUser(data)
Create new user with validation

**Parameters:**
```typescript
{
  email: string;
  name: string;
  password: string;
  nip?: string;
  role?: UserRole;
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: User;
  error?: string;
}
```

### getAllUsers(page, limit)
Get paginated user list

**Returns:**
```typescript
{
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}
```

### getUser(userId)
Get single user with full details

**Returns:**
```typescript
{
  success: boolean;
  data: User;
  error?: string;
}
```

### updateUserProfile(userId, data)
Update user profile information

**Parameters:**
```typescript
{
  name?: string;
  email?: string;
  nip?: string;
  unitId?: string;
  divisionId?: string;
  shiftId?: string;
}
```

### updateUserRole(userId, role)
Update user role

**Parameters:**
- `userId`: string
- `role`: 'WORKER' | 'SUPERVISOR' | 'HSE_ADMIN' | 'SUPER_ADMIN'

### updateUserStatus(userId, status)
Update user status

**Parameters:**
- `userId`: string
- `status`: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

### deleteUser(userId)
Delete user (SUPER_ADMIN only)

## Component Usage

### Create User Form
```tsx
import CreateUserForm from '@/components/users/create-user-form';

export default function Page() {
  return (
    <CreateUserForm
      onSuccess={() => {
        // Handle success
      }}
    />
  );
}
```

### User List
```tsx
import UserList from '@/components/users/user-list';

export default function Page() {
  return <UserList />;
}
```

## Validation Rules

### Email
- Valid email format (RFC 5322 compliant)
- Must be unique in database

### Password
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### NIP (Employee ID)
- Optional
- Must be unique if provided

### Role
Valid values:
- `WORKER`: Regular employee
- `SUPERVISOR`: Team lead/supervisor
- `HSE_ADMIN`: Safety administrator
- `SUPER_ADMIN`: System administrator

### Status
Valid values:
- `ACTIVE`: User can login
- `INACTIVE`: User disabled
- `SUSPENDED`: User temporarily disabled

## Access Control

| Operation | SUPER_ADMIN | HSE_ADMIN | SUPERVISOR | WORKER |
|-----------|:-----------:|:---------:|:----------:|:------:|
| Create User | ✓ | ✓ | ✗ | ✗ |
| List Users | ✓ | ✓ | ✗ | ✗ |
| View User | ✓ | ✓ | Limited | Own |
| Edit User | ✓ | ✓ | Limited | Own |
| Change Role | ✓ | ✗ | ✗ | ✗ |
| Change Status | ✓ | ✓ | ✗ | ✗ |
| Delete User | ✓ | ✗ | ✗ | ✗ |

## Error Handling

### Common Errors

**400 Bad Request**
- Missing required fields
- Invalid field formats
- Validation failure

**401 Unauthorized**
- No authentication session
- Invalid token

**403 Forbidden**
- Insufficient permissions
- Invalid role for operation

**404 Not Found**
- User not found

**409 Conflict**
- Email already in use
- Duplicate NIP

**500 Internal Server Error**
- Database errors
- Unexpected exceptions

## Security Considerations

1. **Password Security**
   - Passwords are hashed with bcryptjs (10 salt rounds)
   - Never returned in API responses
   - Validated for strength requirements

2. **Session Management**
   - JWT tokens with 24-hour expiration
   - HTTP-only cookies (Auth.js)
   - Automatic refresh before expiration

3. **Authorization**
   - Role-based access control (RBAC)
   - Server-side validation on all operations
   - User cannot modify other users (except admins)

4. **Data Protection**
   - Sensitive fields filtered in responses
   - Audit logging for admin actions (future)
   - Rate limiting recommended (Upstash)

## Examples

### Creating a User Programmatically
```typescript
const result = await createUser({
  email: 'john@example.com',
  name: 'John Doe',
  password: 'SecurePass123',
  nip: '12345678',
  role: 'SUPERVISOR'
});

if (result.success) {
  console.log('User created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Fetching Users with Pagination
```typescript
const result = await getAllUsers(1, 20);

if (result.success) {
  console.log('Users:', result.data);
  console.log('Total pages:', result.pagination.pages);
}
```

### Updating User Status
```typescript
const result = await updateUserStatus('user-id', 'SUSPENDED');

if (result.success) {
  console.log('Status updated:', result.data);
}
```

## Performance Optimization

1. **Database Indexing**
   - Indexes on email, userId, role, status fields
   - Foreign key indexes for relationships

2. **Pagination**
   - Default limit of 10 items per page
   - Configurable via query parameters

3. **Caching** (future)
   - User profile cache invalidation on update
   - Session-based caching for auth checks

## Testing

### Unit Tests
```typescript
describe('User Management', () => {
  it('should create user with valid data', async () => {
    // Test implementation
  });

  it('should reject duplicate email', async () => {
    // Test implementation
  });

  it('should validate password strength', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('User API', () => {
  it('GET /api/users returns paginated list', async () => {
    // Test implementation
  });

  it('POST /api/users creates new user', async () => {
    // Test implementation
  });

  it('PUT /api/users/[id] updates user', async () => {
    // Test implementation
  });
});
```

## Future Enhancements

- [ ] Bulk user import (CSV)
- [ ] User role templates
- [ ] Custom permission sets
- [ ] Audit logging for all user changes
- [ ] User activity tracking
- [ ] Scheduled user deactivation
- [ ] SSO integration (LDAP/AD)
- [ ] Two-factor authentication
