# LearnSphere - eLearning Platform

Full-stack eLearning platform with course management, progress tracking, quizzes, and gamification | Odoo x SNS Hackathon '26

## 🚀 Features

- **Role-Based Access Control**: Three user roles (Admin, Instructor, Learner) with specific permissions
- **Secure Authentication**: Clerk authentication with role selection during onboarding
- **Admin Dashboard**: Complete platform management and user administration
- **Instructor Dashboard**: Course creation, student progress tracking, and grading
- **Learner Dashboard**: Course enrollment, assignment completion, and progress tracking
- **Beautiful UI**: Odoo-themed design with purple accents and modern components

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Supabase
- **UI Components**: Shadcn UI + Radix
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Inter (body) + Poppins (headings)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Clerk account (for authentication)
- Supabase account (for database)

### Installation

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and update with your keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 👥 User Roles & Registration

### Role Selection Flow

After signing up, users choose their role:

1. **Learner** (Default) - Course enrollment and progress tracking
2. **Instructor** - Course creation and student management
3. **Admin** - Full platform access (requires admin code: `ADMIN2026`)

## � API Routes

### User Management (Admin Only)

All user management endpoints require admin authentication. Include the Clerk session token in requests.

#### List Users

```http
GET /api/users?limit=20&offset=0
```

**Query Parameters:**

- `limit` (optional): Number of users to return (default: 20)
- `offset` (optional): Number of users to skip (default: 0)

**Response:**

```json
{
  "users": [
    {
      "id": "user_xxx",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "learner",
      "imageUrl": "https://...",
      "createdAt": 1234567890,
      "lastSignInAt": 1234567890
    }
  ],
  "totalCount": 100,
  "limit": 20,
  "offset": 0
}
```

#### Create User

```http
POST /api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "securePassword123",
  "role": "learner"
}
```

#### Get Single User

```http
GET /api/users/[id]
```

#### Update User

```http
PUT /api/users/[id]
Content-Type: application/json

{
  "firstName": "UpdatedName",
  "lastName": "UpdatedLastName",
  "password": "newPassword123"
}
```

#### Delete User

```http
DELETE /api/users/[id]
```

**Note:** Admins cannot delete their own account.

#### Update User Role

```http
PUT /api/users/[id]/role
Content-Type: application/json

{
  "role": "instructor"
}
```

**Valid roles:** `learner`, `instructor`, `admin`

### Current User

#### Update Own Role (During Onboarding)

```http
POST /api/user/role
Content-Type: application/json

{
  "role": "instructor",
  "adminCode": "ADMIN2026"
}
```

**Note:** `adminCode` required only when selecting admin role.

## 📁 Project Structure

```
learnsphere/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── admin/               # Admin dashboard
│   │   └── dashboard/
│   ├── instructor/          # Instructor dashboard
│   │   └── dashboard/
│   ├── learner/             # Learner dashboard
│   │   └── my-courses/
│   ├── api/                 # Backend API routes
│   │   ├── user/
│   │   │   └── role/        # Current user role update
│   │   └── users/           # User management (Admin)
│   │       ├── route.ts     # List/Create users
│   │       └── [id]/
│   │           ├── route.ts       # Get/Update/Delete user
│   │           └── role/
│   │               └── route.ts   # Update user role
│   ├── dashboard/           # Role-based router
│   ├── select-role/         # Role selection page
│   └── layout.tsx           # Root layout with Clerk
├── components/
│   ├── dashboard/           # Dashboard components
│   ├── shared/              # Shared components (RoleGate)
│   └── ui/                  # Shadcn UI components
├── lib/
│   └── clerk/               # Clerk utilities
│       └── utils.ts         # Role management functions
├── types/
│   └── roles.ts             # Role types and constants
├── middleware.ts            # Route protection
└── .env.example             # Environment variables template
```

## 🔐 Authentication & Authorization

### Route Protection

The middleware (`middleware.ts`) handles:

- **Public routes:** `/`, `/sign-in`, `/sign-up`, `/select-role`
- **Admin routes:** `/admin/*`, `/api/users/*` (Admin only)
- **Instructor routes:** `/instructor/*` (Admin + Instructor)
- **Learner routes:** `/learner/*` (All authenticated users)

### Role Management

Role utilities in `lib/clerk/utils.ts`:

- `getUserRole()`: Get user's role from session
- `hasRole()`: Check if user has specific role
- `canAccessRoute()`: Verify route access permissions

## 📝 License

MIT License - Built for Odoo x SNS Hackathon 2026
