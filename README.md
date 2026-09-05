# Urban Furniture Accounting System

A comprehensive double-entry accounting and ERP system built specifically for Urban Furniture, developed during the Odoo Hackathon.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Database**: PostgreSQL (via Docker)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: NextAuth (Auth.js) & bcryptjs
- **Styling**: Tailwind CSS v4, Shadcn UI, Base UI
- **State Management**: Zustand, TanStack React Query
- **Forms & Validation**: React Hook Form, Zod

## ✨ Features

- **Double-Entry Accounting**: Full chart of accounts, journal entries, and general ledgers.
- **Role-Based Access Control**: Admin, Invoicing User, and Contact roles.
- **Sales Flow**: Manage Sales Orders, Invoices, and Payments (Receipts).
- **Purchase Flow**: Manage Purchase Orders, Bills, and Payments.
- **Contact Management**: Keep track of Customers and Vendors.
- **Product Management**: Manage Goods and Services with pricing.
- **Budgeting**: Plan and track budgets across accounts.

## 📦 Getting Started

### Prerequisites

- Node.js (v20+)
- Docker & Docker Compose (for PostgreSQL database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mohit-dot72/oddo-Urban-Furniture-Accounting-System.git
   cd oddo-Urban-Furniture-Accounting-System
   ```

2. **Start the Database**
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env.local` file in the `frontend` directory and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/accounting_db?schema=public"
   ```

5. **Run Prisma Migrations**
   ```bash
   npm run db:push
   # or
   npm run db:migrate
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

- `/docker-compose.yml` - PostgreSQL database container configuration.
- `/frontend` - Next.js application containing both the frontend UI and backend API routes.
  - `/frontend/prisma` - Prisma schema and database configuration.
  - `/frontend/src` - Application source code.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
