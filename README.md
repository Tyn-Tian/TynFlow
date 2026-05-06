# TynFlow

TynFlow is a web-based personal finance management and tracking application designed to help users manage transactions (Income, Expense, Investment), monitor budgets, and track portfolios and wallets centrally. This application also features additional modules for job/shipment management and live monitoring.

## 🏗️ Architecture & Folder Structure

This application uses an architectural pattern that separates the UI, state/business logic (*Services*), and data access layer (*Repository*). The main folder structure is as follows:

- **`app/`**: Contains the application routing using the Next.js App Router feature.
  - **`(auth)/`**: A protected route group (requires authentication) that houses all the main module pages of the application.
  - **`api/`**: Next.js internal API endpoints.
  - **`login/`**: User authentication page.
- **`components/`**: A collection of reusable UI components, including base components (built on Shadcn UI) and feature-specific components.
- **`services/`**: The layer that handles business logic, data aggregation, and data processing before it's displayed on the UI.
- **`repository/`**: The Data Access Layer that is fully responsible for performing CRUD operations directly to the database (Supabase).
- **`actions/`**: Contains Next.js Server Actions for server-side data mutations.
- **`hooks/`**: A collection of Custom React Hooks to encapsulate stateful logic (e.g., `useShipment`).
- **`lib/`**: General utility functions, configurations, and helpers (e.g., styling utilities, number formatters, etc.).

## 🧩 Available Modules

TynFlow has several main modules located within the `app/(auth)/` route:

1. **Dashboard (`/dashboard`)**: The main overview page that displays analytics and transaction charts (e.g., Stacked Bar Chart for Income vs. Expense).
2. **Transaction (`/transaction`)**: A module to record and manage financial activities such as Income, Expense, and Invest.
3. **Budget (`/budget`)**: A module to set and monitor expense budget targets. It includes daily analytic calculations like Daily Spending and Total Realization.
4. **Portfolio (`/portfolio`)**: A module to track the performance and allocation of users' investment assets.
5. **Wallet (`/wallet`)**: A wallet or account management module, tracking active balances from various sources that change with transactions.
6. **Job (`/job`)**: A module for tracking jobs or shipments (Shipment Tracker).
7. **Live (`/live`)**: A module for real-time data tracking or monitoring.

## 🚀 Tech Stack

This application is built using modern web technologies:

- **Framework:** Next.js (v16.1 - App Router)
- **UI Library:** React (v19)
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Backend & Database:** Supabase (using `@supabase/ssr` & `@supabase/supabase-js`)

### Supporting Libraries:
- **UI Primitives & Components:** Radix UI & Shadcn UI (assisted by `class-variance-authority`, `clsx`, `tailwind-merge`)
- **Form & Validation:** React Hook Form integrated with Zod
- **Data Table:** TanStack React Table (`@tanstack/react-table`)
- **Charts:** Recharts
- **Drag & Drop:** `@dnd-kit` (core, sortable, utilities)
- **Icons:** Lucide React & Tabler Icons
- **Notifications:** Sonner
- **Others:** `date-fns` (time manipulation), `next-themes` (Dark/Light mode)

## 🛠️ Setup Instructions

Follow these steps to run the project on your local machine:

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd tynflow
   ```

2. **Install Dependencies**
   Ensure you are using the latest version of Node.js (>= v20 recommended).
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root folder of the project, then insert your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Check the existing `.env` file for any other required keys).*

## ▶️ Running the Application

Once the setup is complete, you can start the development server with the following command:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running locally.

If you want to build for production, use:
```bash
npm run build
npm run start
```
