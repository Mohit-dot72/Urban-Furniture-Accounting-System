# 🏢 Urban Furniture Accounting System

<div align="center">

![Urban Furniture Accounting System Banner](docs/hero-banner.jpg)

### Next-Gen Double-Entry ERP & Financial Management Engine
*Engineered during the Odoo Hackathon*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

[Key Features](#-key-features) •
[3D System Architecture](#-3d-system-architecture--flowchart) •
[Accounting Engine Flow](#-double-entry-accounting-engine-flow) •
[Database Schema](#-database-entity-relationship-schema) •
[Getting Started](#-getting-started)

</div>

<br/>

## 📖 Executive Overview

**Urban Furniture Accounting System** is an enterprise-grade ERP and financial accounting platform specifically architected for furniture manufacturing, trading, and inventory accounting. Built with **Next.js 16 (React 19)**, **Prisma ORM**, and **PostgreSQL**, the platform enforces strict **Double-Entry Bookkeeping Principles** across all transactions—ensuring asset-liability equilibrium, automated journal generation, and real-time financial reporting (Balance Sheet, Profit & Loss).

---

## 📐 3D System Architecture & Flowchart

The system operates across a multi-layered isometric topology, separating client presentation, API dispatching, domain business rules, double-entry transactional ledgers, and database persistence.

```mermaid
flowchart TD
    classDef clientLayer fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef apiLayer fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef domainLayer fill:#111827,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef ledgerLayer fill:#1e1b4b,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
    classDef dbLayer fill:#0284c7,stroke:#bae6fd,stroke-width:2px,color:#ffffff;

    subgraph LAYER_3D_1 ["🧊 LAYER 1: PRESENTATION & INTERACTION (UI/UX)"]
        UI_DASH["📊 Financial Dashboard<br/><i>(KPIs, Cash Flow, Expense Pies)</i>"]:::clientLayer
        UI_SALES["🛍️ Sales Order & Invoicing Module"]:::clientLayer
        UI_PURCHASE["📦 Purchase Order & Vendor Bills"]:::clientLayer
        UI_ACCOUNTS["🏛️ Chart of Accounts & Ledger Viewer"]:::clientLayer
        UI_REPORTS["📑 Balance Sheet & P&L Generator"]:::clientLayer
    end

    subgraph LAYER_3D_2 ["⚡ LAYER 2: ROUTING & AUTHENTICATION API GATEWAY"]
        NEXT_AUTH["🔐 NextAuth v5 Middleware<br/><i>(JWT & RBAC Guards)</i>"]:::apiLayer
        API_CONTACTS["🔌 /api/contacts"]:::apiLayer
        API_PRODUCTS["🔌 /api/products"]:::apiLayer
        API_ACCOUNTS["🔌 /api/accounts"]:::apiLayer
        API_JOURNALS["🔌 /api/journals"]:::apiLayer
        API_BUDGETS["🔌 /api/budgets"]:::apiLayer
    end

    subgraph LAYER_3D_3 ["⚙️ LAYER 3: BUSINESS LOGIC & WORKFLOW ENGINE"]
        WORKFLOW_SALES["📈 Sales Lifecycle Handler<br/><i>SO ➔ Invoice ➔ Payment</i>"]:::domainLayer
        WORKFLOW_PROCURE["🛒 Purchasing Handler<br/><i>PO ➔ Bill ➔ Payment</i>"]:::domainLayer
        BUDGET_ENGINE["🎯 Budget Variance & Analytics Engine"]:::domainLayer
    end

    subgraph LAYER_3D_4 ["💎 LAYER 4: DOUBLE-ENTRY LEDGER & RECONCILIATION ENGINE"]
        JOURNAL_POSTING["📒 Double-Entry Generator<br/><i>(Debit sum = Credit sum Validation)</i>"]:::ledgerLayer
        COA_MANAGER["🗂️ Account Balance Summarizer<br/><i>(Asset, Liability, Equity, Revenue, Expense)</i>"]:::ledgerLayer
    end

    subgraph LAYER_3D_5 ["🗄️ LAYER 5: PERSISTENCE & DATA STORAGE"]
        PRISMA["💎 Prisma ORM Client"]:::dbLayer
        POSTGRES[("🐘 PostgreSQL Container<br/><i>(Port 5432)</i>")]:::dbLayer
    end

    %% Flow Connections
    UI_DASH & UI_SALES & UI_PURCHASE & UI_ACCOUNTS & UI_REPORTS --> NEXT_AUTH
    NEXT_AUTH --> API_CONTACTS & API_PRODUCTS & API_ACCOUNTS & API_JOURNALS & API_BUDGETS

    API_SALES_GATEWAY["Sales & Purchases API"] --> WORKFLOW_SALES & WORKFLOW_PROCURE
    API_ACCOUNTS & API_JOURNALS --> JOURNAL_POSTING
    API_BUDGETS --> BUDGET_ENGINE

    WORKFLOW_SALES & WORKFLOW_PROCURE --> JOURNAL_POSTING
    JOURNAL_POSTING --> COA_MANAGER
    COA_MANAGER & BUDGET_ENGINE --> PRISMA
    PRISMA --> POSTGRES
```

---

## 🔄 Double-Entry Accounting Engine Flow

Every monetary event in the system is processed through a closed-loop financial validation cycle to preserve accounting equilibrium:

$$\sum \text{Debits} = \sum \text{Credits}$$

### 1. Sales Workflow Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor SalesUser as 👨‍💼 Sales Manager
    participant SO as 📄 Sales Order
    participant INV as 🧾 Customer Invoice
    participant RCPT as 💵 Payment Receipt
    participant GL as 📒 General Ledger Entry
    participant ACC as 🏛️ Accounts

    SalesUser->>SO: Create Sales Order (Status: Confirmed)
    SalesUser->>INV: Convert SO to Customer Invoice (Status: Open)
    Note over INV,GL: Triggers Accounting Entry
    INV->>GL: Post Journal Entry (Journal: Sales)
    GL->>ACC: Debit: Accounts Receivable (Asset ↑)
    GL->>ACC: Credit: Sales Revenue (Revenue ↑)
    SalesUser->>RCPT: Record Payment Receipt (HDFC Bank / Cash)
    RCPT->>GL: Post Receipt Entry (Journal: Bank/Cash)
    GL->>ACC: Debit: Bank/Cash Account (Asset ↑)
    GL->>ACC: Credit: Accounts Receivable (Asset ↓)
```

### 2. Purchasing Workflow Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as 👷 Procurement Officer
    participant PO as 📦 Purchase Order
    participant BILL as 📜 Vendor Bill
    participant PYMT as 💳 Payment Sent
    participant GL as 📒 General Ledger Entry
    participant ACC as 🏛️ Accounts

    Buyer->>PO: Issue Purchase Order (Status: Confirmed)
    Buyer->>BILL: Receive & Log Vendor Bill (Status: Open)
    Note over BILL,GL: Triggers Accounting Entry
    BILL->>GL: Post Journal Entry (Journal: Purchase)
    GL->>ACC: Debit: Purchase Expense / Inventory (Expense/Asset ↑)
    GL->>ACC: Credit: Accounts Payable (Liability ↑)
    Buyer->>PYMT: Process Payment Disbursement
    PYMT->>GL: Post Payment Entry (Journal: Bank/Cash)
    GL->>ACC: Debit: Accounts Payable (Liability ↓)
    GL->>ACC: Credit: Bank/Cash Account (Asset ↓)
```

---

## ✨ Key Features

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **Double-Entry Ledger** | Complete Chart of Accounts balancing assets, liabilities, equity, revenues, and expenses. | Custom Journal Entry validator enforcing balanced Debit/Credit postings |
| **Sales Management** | Seamless flow from Quotation/Sales Order to Invoice generation & Payment receipt. | Dynamic Next.js client forms with Zod validation and relational Prisma models |
| **Purchasing & AP** | Procurement management for stock/furniture raw materials, Vendor Bills, and Payments. | Integrated PO-to-Bill matching engine with Vendor master tracking |
| **Financial Analytics** | Interactive financial dashboard featuring Cash Flow trends, top expenses, and bank balances. | Recharts charting library with server-side aggregated datasets |
| **Financial Reporting** | Instant automated generation of Balance Sheets, Profit & Loss Statements, and Budgets. | Real-time analytical SQL aggregations via Prisma ORM |
| **RBAC Security** | Role-based authorization distinguishing `ADMIN`, `INVOICING_USER`, and `CONTACT`. | NextAuth v5 JWT session strategy with Edge middleware route guards |
| **Master Data Engine** | Comprehensive management for Contacts (Customers/Vendors) and Products (Goods/Services). | Full CRUD RESTful API routes with PostgreSQL database persistence |

---

## 🗄️ Database Entity Relationship Schema

The system's relational data model built on **Prisma** ensures strict relational integrity across accounting models:

```mermaid
erDiagram
    USER ||--o{ ROLE : assigns
    CONTACT ||--o{ SALES_ORDER : places
    CONTACT ||--o{ INVOICE : receives
    CONTACT ||--o{ PURCHASE_ORDER : supplies
    CONTACT ||--o{ BILL : sends
    CONTACT ||--o{ PAYMENT : executes

    PRODUCT ||--o{ SALES_ORDER_LINE : included_in
    PRODUCT ||--o{ INVOICE_LINE : included_in
    PRODUCT ||--o{ PURCHASE_ORDER_LINE : included_in
    PRODUCT ||--o{ BILL_LINE : included_in

    SALES_ORDER ||--o{ SALES_ORDER_LINE : contains
    SALES_ORDER ||--o{ INVOICE : generates

    PURCHASE_ORDER ||--o{ PURCHASE_ORDER_LINE : contains
    PURCHASE_ORDER ||--o{ BILL : generates

    INVOICE ||--o{ INVOICE_LINE : contains
    INVOICE ||--o{ PAYMENT : settled_by

    BILL ||--o{ BILL_LINE : contains
    BILL ||--o{ PAYMENT : settled_by

    JOURNAL ||--o{ JOURNAL_ENTRY : registers
    JOURNAL_ENTRY ||--o{ JOURNAL_LINE : contains
    ACCOUNT ||--o{ JOURNAL_LINE : records_in

    USER {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        Role role
    }

    CONTACT {
        string id PK
        string name
        ContactType type
        string email
        string mobile
        string gstNo
    }

    PRODUCT {
        string id PK
        string name
        string type
        float salesPrice
        float purchasePrice
    }

    ACCOUNT {
        string id PK
        string code UK
        string name
        AccountType type
    }

    JOURNAL_ENTRY {
        string id PK
        string entryNo UK
        DateTime date
        float totalDebit
        float totalCredit
    }
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend & App Framework**: [Next.js 16.3.4](https://nextjs.org/) (React 19, App Router)
- **Database & Persistence**: [PostgreSQL 15](https://www.postgresql.org/) running via Docker Container
- **Object Relational Mapper**: [Prisma ORM 5.11](https://www.prisma.io/)
- **Authentication**: [NextAuth (Auth.js) v5](https://authjs.dev/) with `bcryptjs` password hashing
- **Styling & UI**: Tailwind CSS v4, [Shadcn UI](https://ui.shadcn.com/), Lucide Icons
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack React Query v5](https://tanstack.com/query/latest)
- **Forms & Validation**: React Hook Form, [Zod](https://zod.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)

---

## ⚡ API Endpoint Matrix

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/callback/credentials` | User authentication & JWT issuance | ❌ |
| `POST` | `/api/register` | Register new system user | ❌ |
| `GET` / `POST` | `/api/contacts` | Fetch contact directory / Create new contact | ✅ |
| `PUT` / `DELETE`| `/api/contacts/[id]` | Modify or delete existing contact record | ✅ |
| `GET` / `POST` | `/api/products` | Fetch item catalog / Add new product/service | ✅ |
| `GET` / `POST` | `/api/accounts` | Fetch Chart of Accounts / Add ledger account | ✅ |
| `GET` / `POST` | `/api/journals` | Fetch journals / Post new double-entry journal | ✅ |
| `GET` / `POST` | `/api/budgets` | Retrieve budget targets / Create financial budget | ✅ |

---

## 🚀 Getting Started

Follow these steps to set up and run the Urban Furniture Accounting System on your local development machine.

### Prerequisites

- **Node.js**: `v20.0.0` or higher installed
- **npm**: `v9.0.0` or higher
- **Docker & Docker Compose**: Required for running the PostgreSQL database container

---

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Mohit-dot72/oddo-Urban-Furniture-Accounting-System.git
cd oddo-Urban-Furniture-Accounting-System
```

#### 2. Launch Database Service
Start the PostgreSQL container via Docker Compose:
```bash
docker-compose up -d
```
*This starts a PostgreSQL 15 instance on port `5432` with database name `accounting_db`.*

#### 3. Install Dependencies
Navigate into `MainProject` and install NPM packages:
```bash
cd MainProject
npm install
```

#### 4. Configure Environment Variables
Create a `.env` file inside `MainProject/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/accounting_db?schema=public"
AUTH_SECRET="your-super-secret-jwt-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

#### 5. Run Database Migrations
Push the Prisma schema to create database tables:
```bash
npm run db:push
```
*(Optional) Seed initial data:*
```bash
npm run db:seed
```

#### 6. Start Development Server
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 📂 Project Directory Structure

```
Urban-Furniture-Accounting-System/
├── 📁 docs/                         # Project visual assets & documentation
│   └── 🖼️ hero-banner.jpg           # Interactive README Hero Banner
├── 📄 docker-compose.yml            # PostgreSQL Docker setup
├── 📄 README.md                     # Root Interactive Documentation
└── 📁 MainProject/                  # Next.js Application Core
    ├── 📁 prisma/
    │   └── 📄 schema.prisma         # Database Models & Accounting Enums
    ├── 📁 src/
    │   ├── 📁 app/
    │   │   ├── 📁 (app)/            # Authenticated Application Routes
    │   │   │   ├── 📄 page.tsx      # Main Financial Dashboard
    │   │   │   ├── 📁 accounts/     # Chart of Accounts Page
    │   │   │   ├── 📁 budgets/      # Budget Allocation Page
    │   │   │   ├── 📁 contacts/     # Customers & Vendors Master
    │   │   │   ├── 📁 journals/     # Double-Entry Journals Page
    │   │   │   ├── 📁 payments/     # Receipts & Payments Page
    │   │   │   ├── 📁 products/     # Goods & Services Master
    │   │   │   ├── 📁 purchases/    # Purchase Orders & Bills Flow
    │   │   │   ├── 📁 reports/      # Balance Sheet & P&L Analytics
    │   │   │   ├── 📁 sales/        # Sales Orders & Invoicing Flow
    │   │   │   ├── 📁 settings/     # System Configuration Page
    │   │   │   └── 📁 transactions/ # Journal Entries Ledger View
    │   │   ├── 📁 api/              # RESTful Serverless API Routes
    │   │   └── 📁 auth/             # Login & Registration Pages
    │   ├── 📁 components/
    │   │   ├── 📁 layout/           # AppSidebar & TopHeader
    │   │   └── 📁 ui/               # Base UI & Shadcn Components
    │   ├── 📁 lib/                  # Auth configuration, Prisma client & Utilities
    │   └── 📄 middleware.ts         # Edge Route Protection Middleware
    ├── 📄 package.json
    ├── 📄 tailwind.config.ts
    └── 📄 tsconfig.json
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
Made with ❤️ by team <b>Urban Furniture</b> during the <b>Odoo Hackathon</b>.
</div>
