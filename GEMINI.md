# Project Context: Fulltime Academia

This file provides the foundational context, architectural overview, and development guidelines for the Fulltime Academia project. It serves as a primary reference for AI agents to ensure alignment with project standards and goals.

## Project Overview
Fulltime Academia is a modern web application for a gym franchise, featuring a high-performance landing page, an integrated supplement store, and a custom administrative panel (CMS). The project prioritizes simplicity, performance, and a "Mobile-First" approach.

### Core Stack
- **Frontend:** Vanilla JavaScript, HTML5, and Tailwind CSS (via CDN). No heavy frameworks (React/Vue/Angular) are used to maintain low overhead.
- **Backend:** Vercel Serverless Functions (Node.js) located in the `/api` directory.
- **Database:** Vercel KV (Upstash Redis) for persistence (products, categories).
- **Media:** Cloudinary for image storage and delivery, managed via the admin panel.
- **Payments:** Stripe Checkout for secure transactions.
- **Hosting & Deployment:** Vercel.

## Directory Structure
- `/api`: Serverless functions (backend routes).
  - `categorias.js`: CRUD for product categories.
  - `checkout.js`: Stripe Checkout session creation.
  - `produtos.js`: CRUD for products stored in Vercel KV.
  - `upload.js`: Image upload integration with Cloudinary.
- `/public`: Static web pages and assets.
  - `admin.html`: CMS for managing products and categories.
  - `suplementos.html`: The supplement store frontend.
  - `mobile-fix.css`: Specific CSS overrides for mobile responsiveness.
- `/src/assets`: Images and SVG icons used in the UI.
- `index.html`: The main landing page.
- `agent.md`: Critical synchronization file for AI agents (MUST be read before any task).
- `package.json`: Project dependencies and scripts.
- `vercel.json`: Vercel configuration for functions and environment.

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
2. **Mobile-First Design:** All UI components must be optimized for mobile first. Use Tailwind utility classes for responsiveness.
3. **Vanilla Strategy:** Avoid adding external libraries or bundlers unless absolutely necessary. Maintain the project's lightweight nature.
4. **Security:** Never expose API keys (Stripe, Cloudinary, KV) in the frontend. All sensitive operations must happen in `/api` functions.
5. **UI/UX Consistency:**
   - Use the horizontal Flexbox navbar (no hamburger menus).
   - Maintain the glassmorphism aesthetic (`backdrop-blur`, semi-transparent backgrounds).
   - Use the `Inter Tight` font family throughout.
6. **Persistence:** Use Vercel KV for all data persistence needs.

## Current Objectives
- Validate and integrate the `STRIPE_SECRET_KEY` in the local environment.
- Ensure the supplement store cart is correctly connected to the Stripe Checkout flow.
- Maintain UI consistency across the Landing Page and Store.
