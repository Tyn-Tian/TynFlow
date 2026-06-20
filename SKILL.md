---
name: TynFlow
description: Core guidelines and instructions for working on the TynFlow Next.js application
---

# TynFlow

These are the primary instructions and guardrails for any agent or assistant working on the TynFlow codebase.

## Tech Stack & Architecture

- **Framework**: Next.js 16+ (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS v4
- **Database / Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **State Management**: React Query (`@tanstack/react-query`)
- **Forms**: React Hook Form (`react-hook-form`) + Zod
- **UI Components**: Radix UI, Framer Motion (`motion`), Tabler Icons / Lucide React
- **Charts / Data Viz**: Recharts, `@visx/*`

## General Guidelines

1. **Next.js Conventions**: 
   - Use App Router features and structure.
   - Use Server Components by default; only add `"use client"` when interactivity or React hooks are required.

2. **Styling & UI**:
   - Use Tailwind CSS for styling.
   - Components should be responsive and accessible.
   - Ensure consistency with Radix UI components where applicable.

3. **Data Fetching**:
   - For client-side data fetching and mutations, use `@tanstack/react-query`.
   - Use Supabase SSR for server-side auth and data fetching.

4. **Code Quality**:
   - Write strict TypeScript.
   - Use Zod for schema validation on forms and API inputs.
   - Preserve existing imports, clean up unused variables, and maintain modularity (e.g. separating UI components from page logic).
