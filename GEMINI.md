# Project Context: Fulltime Academia

This file provides the foundational context, architectural overview, and development guidelines for the Fulltime Academia project. It serves as a primary reference for AI agents to ensure alignment with project standards and goals.

## Project Overview
Fulltime Academia is a modern web application for a gym franchise, featuring a high-performance landing page, an integrated supplement store, and a custom administrative panel (CMS). The project prioritizes simplicity, performance, and a "Mobile-First" approach, now evolved into a robust Single Page Application (SPA).

### Core Stack
- **Frontend:** React (TypeScript), Vite, and Tailwind CSS. Modern UI components with glassmorphism effects.
- **Roteamento:** React Router DOM (SPA) for seamless transitions between Home, Store, and Checkout.
- **Backend:** Vercel Serverless Functions (Node.js) located in the `/api` directory.
- **Database:** Vercel KV (Upstash Redis) for persistence (products, categories, orders).
- **Media:** Cloudinary for image storage and delivery, managed via the admin panel.
- **Payments:** Mercado Pago Core API (Custom Checkout) for secure and native transactions.
- **Hosting & Deployment:** Vercel with SPA rewrite rules.

## Directory Structure
- `/api`: Serverless functions (backend routes).
  - `categorias.js`: CRUD for product categories.
  - `process_payment.js`: Mercado Pago payment processing.
  - `webhook.js`: Payment status update notifications.
  - `produtos.js`: CRUD for products stored in Vercel KV.
  - `upload.js`: Image upload integration with Cloudinary.
- `/src`: Application source code (React).
  - `/pages`: Main views (Home.tsx, Loja.tsx, Checkout.tsx, Admin.tsx).
  - `/components/ui`: Reusable UI components (GlassCard, CartSidebar, AnimatedBackground).
  - `/lib`: Utility functions (utils.ts with `cn` helper).
  - `App.tsx`: Main routing and layout wrapper.
- `/public`: Static assets and legacy files.
- `agent.md`: Critical synchronization file for AI agents (MUST be read before any task).
- `package.json`: Project dependencies and scripts (`dev`, `build`).
- `vercel.json`: Vercel configuration for functions and SPA rewrites.

## Building and Running
### Local Development
- **Vite (Frontend Dev):**
  ```bash
  npm run dev
  ```
- **Vercel Dev (Full Stack Dev):**
  To test API routes and environment variables locally, use the Vercel CLI:
  ```bash
  vercel dev
  ```

### Production Build
```bash
npm run build
```

## Development Conventions & Rules
1. **Instructional Priority:** Always read `agent.md` before starting a task and update its "## Últimas Atualizações" section after structural changes.
2. **Componentization React:** Prioritize the separation of responsibilities creating reusable components in `src/components/ui/`.
3. **Mobile-First Design:** All UI components must be optimized for mobile first. Use Tailwind utility classes for responsiveness.
4. **Design Fluido (Glassmorphism):** Maintain sections with semi-transparent backgrounds (`bg-slate-900/30`, `backdrop-blur`) to keep the `AnimatedBackground` canvas visible.
5. **Security:** Never expose API keys (Mercado Pago, Cloudinary, KV) in the frontend. All sensitive operations must happen in `/api` functions.
6. **UI/UX Consistency:**
   - Use the horizontal Flexbox navbar (no hamburger menus).
   - Use the `Inter Tight` font family throughout.
   - Use the `cn` utility for dynamic tailwind class merging.

## Current Objectives
- Validate the Mercado Pago webhook processing for automatic order status updates.
- Maintain UI consistency across the Landing Page (Home) and the Store (Loja).
- Ensure the logistics queue in the Admin panel correctly reflects payment status changes.
