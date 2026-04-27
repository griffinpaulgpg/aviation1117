# Arunand's Aviation Academy Website

Production-ready Next.js 15 website for Arunand's Aviation Academy.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- ESLint
- Prettier

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Run quality checks:

   ```bash
   npm run lint
   npm run typecheck
   npm run format:check
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## Project Structure

```text
app/          Next.js App Router routes, layouts, and global styles
components/   Reusable UI components
lib/          Shared helpers and content adapters
types/        Shared TypeScript types
public/       Static assets
```

## Content Migration

The public content was migrated from `https://www.arunandsaviation.com`, including courses, services, testimonials, contact information, academy positioning, and AASSC messaging.
