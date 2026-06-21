# TynFlow 🚀

## 📖 About The Project

**TynFlow** is a modern *Personal Finance Management* application designed to give you full control over your assets, cash flow, and financial planning in one comprehensive dashboard.

This application was built to solve the problem of complex financial tracking that is often scattered across multiple platforms. TynFlow makes it easy for users to monitor their total net worth, plan budgets, manage investment portfolios, and track wishlists in a centralized and structured manner.

## 🏗️ System Architecture

TynFlow is developed using a **Modern Full-Stack** architecture with a clear separation of concerns between the user interface (Client) and data management (Server/Backend).

- **Client Layer:** Built modularly using a component-based architecture in Next.js, ensuring high performance and UI component reusability.
- **Backend-as-a-Service (BaaS):** We use Supabase as our centralized data center, authentication provider, and security layer (Row Level Security). This eliminates the need to manage a traditional backend server infrastructure.
- **State & Data Synchronization:** Communication between the Client and Backend is managed asynchronously with smart caching (using React Query), making the application feel snappy and highly responsive.

## 📦 Available Modules

TynFlow is equipped with various modules to support your financial ecosystem:

- 📊 **Dashboard:** Displays a comprehensive overview of your financial status, monthly cash flow, and total net worth.
- 💳 **Wallet:** A module for managing various digital wallets, bank accounts, and cash as your primary funding sources.
- 📝 **Transaction:** A module for recording cash flow (income, expenses, and transfers between wallets). This includes a **Scheduler** feature to automate recurring transactions.
- 🎯 **Budget:** Plan and limit your monthly spending to keep your finances healthy.
- 📈 **Portfolio:** An asset and investment management module for monitoring assets with fluctuating values.
- 🎁 **Wishlist:** A list of target achievements or items you wish to purchase, complete with savings estimates and priority tracking.

## 💻 Main Tech Stack

This application uses cutting-edge technology to ensure maximum performance and an excellent Developer Experience (DX):

- **Frontend Framework:** Next.js (React-based)
- **Styling:** Tailwind CSS (v4)
- **Backend, Database, & Authentication:** Supabase (PostgreSQL & Supabase Auth)
- **Data Fetching & Caching:** TanStack React Query

## 🧰 Additional Libraries

In addition to the main tech stack, we use various open-source libraries to enhance the application's features:

- **UI Components & Accessibility:** Radix UI, Vaul
- **Data Visualization:** Recharts, Visx
- **Form & Validation:** React Hook Form, Zod
- **Interactions & Animations:** dnd-kit (for drag & drop), Motion (for smooth animations)

---

## ⚙️ Setup & Installation Guide

Follow these steps to run TynFlow on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Tyn-Tian/TynFlow.git
cd tynflow
```

### 2. Install Dependencies
This application supports installation using various package managers (npm, yarn, pnpm, or bun). We highly recommend using `bun` or `npm`.
```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables
The application requires Supabase configuration to run. Create a new file named `.env.local` in the root directory of your project, then copy and fill in the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```
*(Note: You can check the `.env` file for references to other supporting variables if any)*

### 4. Running the Application

**Development Mode:**
Use this command when developing or modifying code.
```bash
npm run dev
# or
bun dev
```
The application will run locally. Open your browser at: `http://localhost:3000`

**Production Mode:**
Use this command to build and test the application's performance in a production-like environment.
```bash
npm run build
npm run start
# or
bun run build
bun run start
```
