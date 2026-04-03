# WORKSPRINT Backend

Production-ready backend scaffold for the WORKSPRINT attendance management system.

## Tech stack
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- bcrypt password hashing
- express-validator validation
- nodemailer email
- multer file uploads
- winston logging
- node-cron for scheduled absent marking

## Quick setup
1. `cd backend`
2. `npm install`
3. Set `.env` values (see `.env` file)
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. Start: `npm run dev`

## API routes
- `/api/v1/auth` - login/logout/refresh/change-password/forgot/reset
- `/api/v1/super-admin` - super admin management
- `/api/v1/hr-admin` - hr admin operations
- `/api/v1/employee` - employee operations

## Notes
- Create `SuperAdmin` record manually or via seeding (not included):
  - `npx prisma studio` -> create super admin with hashed password from bcrypt.

- Cron job triggers at 19:00 daily to mark absent for missing employees.
