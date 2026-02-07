# GitHub Copilot Instructions for LearnSphere eLearning Platform

## Project Context
You are working on LearnSphere, a production-grade eLearning platform built for the Odoo x SNS Coimbatore Hackathon '26. This is a full-stack application with instructor course management and learner engagement features.

## Tech Stack (STRICT - DO NOT DEVIATE)
- Framework: Next.js 14 with App Router (NOT Pages Router)
- Language: TypeScript with strict mode enabled
- Database: Supabase PostgreSQL with Row Level Security (RLS)
- Storage: Supabase Storage for files (videos, PDFs, images)
- Authentication: Clerk with role-based access (instructor, learner)
- UI Library: Shadcn UI components only
- Styling: Tailwind CSS with Odoo color theme
- Deployment: Vercel

## Code Style Standards

### TypeScript Rules
- Always use TypeScript, never plain JavaScript
- Use strict type checking
- Prefer interfaces over types for object shapes
- Export types from types/ directory
- Use Zod for runtime validation

### React and Next.js Rules
- Use Server Components by default
- Add 'use client' only when necessary (hooks, event handlers, browser APIs)
- Use Server Actions for mutations when possible
- Prefer async/await over .then() chains
- Use proper loading.tsx and error.tsx boundaries

### File Naming Conventions
- Components: PascalCase (CourseCard.tsx)
- Utilities: kebab-case (format-date.ts)
- API routes: lowercase (route.ts)
- Types: kebab-case (course-types.ts)

### Component Structure Pattern
Always follow this order:
1. Imports (grouped: react, next, external, internal, types)
2. Types and Interfaces
3. Component definition
4. Export statement

### API Route Pattern
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Always validate with Zod schemas
- Return proper status codes (200, 201, 400, 401, 404, 500)
- Use try-catch for error handling
- Check authentication with Clerk auth()

### Database Supabase Rules
- Use server-side client in API routes and Server Components
- Use client-side client only in Client Components
- Always handle errors from Supabase queries
- Use TypeScript types from types/database.ts
- Prefer joins over multiple queries

### Authentication and Authorization
- Use Clerk auth() in Server Components and API routes
- Use Clerk useAuth() in Client Components
- Check user roles from sessionClaims.metadata.role
- Protect routes in middleware.ts

### UI Component Rules
- Only use Shadcn UI components from components/ui/
- Use Lucide React for icons
- Apply Odoo theme colors from tailwind.config.ts
- Make all UI responsive (mobile-first approach)
- Use proper semantic HTML

### Form Handling
- Use react-hook-form for all forms
- Validate with Zod schemas
- Show proper error messages
- Disable submit during loading
- Reset form after successful submission

### Error Handling
- Always use try-catch in API routes
- Show user-friendly error messages
- Log errors to console in development
- Use toast notifications for user feedback

### Performance Best Practices
- Use Next.js Image component for images
- Lazy load heavy components
- Implement pagination for large lists
- Cache Supabase queries where appropriate
- Use Suspense boundaries for async components

## Folder Structure Rules
- /app/(instructor) - Instructor-only pages
- /app/(learner) - Learner-facing pages
- /app/api - Backend API routes
- /components/instructor - Instructor components
- /components/learner - Learner components
- /components/shared - Shared components
- /components/ui - Shadcn UI components only
- /lib - Utilities and configurations
- /types - TypeScript type definitions
- /hooks - Custom React hooks

## Role-Based Access Rules
- Instructor Role: Can create courses, manage lessons, view reports
- Learner Role: Can browse courses, learn content, take quizzes, earn badges
- Implement role checks in middleware and API routes
- Use RoleGate component for conditional UI rendering

## Feature Requirements

### Courses
- Support Draft/Published states
- Visibility: Everyone, Signed In
- Access: Open, On Invitation, On Payment
- Show course progress percentage

### Lessons
- Types: Video, Document, Image, Quiz
- Support external URLs and uploaded files
- Track completion status per learner
- Allow additional attachments

### Quizzes
- One question per page
- Support multiple attempts
- Award points based on attempt number (1st: 10pts, 2nd: 7pts, 3rd: 5pts, 4th+: 3pts)
- Track all attempts in database

### Progress Tracking
- Calculate percentage completion per course
- Mark lessons as completed
- Show progress in real-time using Supabase subscriptions
- Display in instructor reporting dashboard

### Badges and Points System
- Newbie: 20 points
- Explorer: 40 points
- Achiever: 60 points
- Specialist: 80 points
- Expert: 100 points
- Master: 120 points

### File Uploads
- Upload to Supabase Storage
- Generate signed URLs for private content
- Support videos, PDFs, images
- Implement download controls

## Odoo Color Theme
Use these exact colors in Tailwind classes:
- odoo-purple: #714B67
- odoo-pink: #875A7B
- odoo-dark: #2C1338
- odoo-light: #F0EEEF
- odoo-accent: #00A09D

## What NOT to Do
- Do NOT use Pages Router (only App Router)
- Do NOT use MongoDB (only Supabase PostgreSQL)
- Do NOT create separate Express backend
- Do NOT use Material UI or other UI libraries (only Shadcn)
- Do NOT use CSS modules or styled-components (only Tailwind)
- Do NOT use Redux or Zustand (use React state + Server Components)
- Do NOT add LLM/AI features unless explicitly requested
- Do NOT create inline styles (use Tailwind classes)

## Code Generation Guidelines
When generating code always include:
1. All necessary imports
2. TypeScript types and interfaces
3. Proper error handling
4. Comments only for complex logic
5. Production-ready code (no placeholders or TODOs)

## Priority Order
1. Correctness: Code must work without bugs
2. Type Safety: Proper TypeScript usage
3. Security: Validate inputs, check auth
4. Performance: Optimize queries and renders
5. UX: Responsive, accessible, intuitive
6. Code Quality: Clean, maintainable, documented

When in doubt, ask clarifying questions before generating code. Always prioritize working, production-ready code over experimental features.
