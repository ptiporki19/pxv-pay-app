# PXV Pay MVP Development Task Checklist

Use this checklist to track your progress while building the PXV Pay Minimum Viable Product. This list follows the progressive roadmap and includes the key features for each step. Mark items as complete ([x]) as you implement and test them.

**Status Key**: - [ ] To Do, - [~] In Progress, - [x] Done

## 1. Phase 0: Project Foundation and Core Setup

- [ ] **Complete Project Setup & Architecture Definition**
  - [ ] Set up Next.js project (App Router, TS, Tailwind).
  - [ ] Initialize Supabase project (Auth, Database, Storage).
  - [ ] Integrate Supabase client into Next.js app.
  - [ ] Configure basic Supabase authentication.
  - [ ] Implement initial protected route structure (for admin).
  - [ ] Configure TailwindCSS and Shadcn UI.
  - [ ] Initialize Zustand store.
  - [ ] Create and commit project to version control (Git).

- [ ] **Complete Application Theme Setup**
  - [ ] Place provided CSS variables in a global stylesheet.
  - [ ] Import global stylesheet in root layout.
  - [ ] Configure TailwindCSS and Shadcn UI to use CSS variables.
  - [ ] Ensure theme variables are applied correctly for light and dark modes.
  - [ ] Configure specified fonts for use.
  - [ ] Integrate radius and shadow variables.

- [ ] **Complete Environment Management Setup**
  - [ ] Implement use of environment variables (.env.local, .env.development, .env.production).
  - [ ] Ensure environment-specific configurations use these variables.
  - [ ] Implement conditional logic based on environment (NODE_ENV).
  - [ ] Ensure strict data isolation between environments is enforced.
  - [ ] Confine mocking/stubbing code only to test files/environments.
  - [ ] Outline/document deployment configuration for environment variables (Vercel, Supabase).

- [ ] **Complete Combined RBAC Setup (Database, Super Admin User Management, Conditional Rendering)**
  - [ ] Update users table schema with role enum column in Supabase (MVP focus: 'super_admin', 'registered_user').
  - [ ] Define initial Supabase RLS policies based on roles (MVP focus: 'super_admin', 'registered_user').
  - [ ] Build Super Admin User Management page (app/(admin)/users).
  - [ ] Implement table to view users (Shadcn UI).
  - [ ] Implement activate/deactivate user functionality.
  - [ ] Implement change user role functionality (excluding Super Admin role).
  - [ ] Secure User Management page strictly for Super Admins (route protection, RLS).
  - [ ] Implement frontend conditional rendering logic based on user roles (MVP focus: 'super_admin', 'registered_user') (e.g., for admin menus).
  - [ ] Ensure backend operations for user management are secured by RLS and role checks.

## 2. Phase 1: Core MVP - Entry Points, Admin Setup, and Basic Flows

- [ ] **Complete Landing Page & Blog (Public View) Development**
  - [ ] Create Landing Page route (app/page.tsx).
  - [ ] Build Header and Footer components.
  - [ ] Implement Hero section with CTA.
  - [ ] Add sections for features/benefits.
  - [ ] Add Blog section to Landing Page (displaying recent posts).
  - [ ] Create Public Blog list page (app/blog/page.tsx).
  - [ ] Create dynamic route for individual blog posts (app/blog/[slug]/page.tsx).
  - [ ] Implement frontend logic to fetch published blog posts.
  - [ ] Implement pagination for blog list.
  - [ ] Configure backend API/RLS for public read access to blog_posts.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete User Account Creation Flow**
  - [ ] Create Signup page route (app/signup/page.tsx).
  - [ ] Build Signup form UI (email, password, phone number) (Shadcn UI).
  - [ ] Implement frontend validation (React Hook Form + Zod).
  - [ ] Implement frontend logic for form submission to Supabase Auth.
  - [ ] Implement backend logic to assign 'registered_user' role after signup.
  - [ ] Redirect user to Admin Dashboard (/admin) upon successful signup.
  - [ ] Implement error handling and display for signup.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Admin Dashboard Layout**
  - [ ] Create Admin Dashboard layout (app/(admin)/layout.tsx).
  - [ ] Build responsive sidebar navigation (Shadcn UI).
  - [ ] Add header bar.
  - [ ] Add navigation links for MVP sections.
  - [ ] Create placeholder pages/components for admin section routes.
  - [ ] Set up Zustand for active navigation state.
  - [ ] Implement basic route protection (authenticated users only).
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Admin CRUD Operations (Countries, Currencies, Manual Methods)**
  - [ ] Create admin pages for Countries, Currencies, Manual Payment Methods.
  - [ ] Implement tables to display entities (Shadcn UI Table).
  - [ ] Implement "Add New", "Edit", "Delete" actions.
  - [ ] Build modal forms for Add/Edit (Shadcn UI Dialog).
  - [ ] Implement frontend form validation (React Hook Form + Zod).
  - [ ] Implement frontend data fetching and table refresh logic.
  - [ ] Implement backend API/RLS for CRUD on countries, currencies, payment_methods.
  - [ ] Set up Supabase Storage and handling for payment method icons.
  - [ ] Implement deletion checks for linked entities.
  - [ ] Configure RLS for admin write access.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Admin Country-Currency-Payment Method Linking Matrix**
  - [ ] Create admin page for Payment Linking.
  - [ ] Build UI to display Country -> Currency -> Linked Methods (Shadcn UI).
  - [ ] Implement interface to link/unlink manual methods.
  - [ ] Implement interface to set/update display order.
  - [ ] Implement frontend state management for linking.
  - [ ] Implement backend API/RLS for managing currency_payment_method_links.
  - [ ] Configure RLS for admin write access.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Basic Admin Blog Management UI**
  - [ ] Create admin page for Blog Posts.
  - [ ] Implement table displaying blog posts (Shadcn UI Table).
  - [ ] Implement "Add New", "Edit", "Delete" actions.
  - [ ] Build form for adding/editing blog posts.
  - [ ] Integrate Markdown editor component.
  - [ ] Implement frontend form validation (React Hook Form + Zod).
  - [ ] Implement backend API/RLS for CRUD on blog_posts.
  - [ ] Configure RLS for admin write access.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

## 3. Phase 2: Checkout Flow & Verification

- [ ] **Complete Dynamic Checkout Page (Pages 1 & 2)**
  - [ ] Implement merchant-specific shareable payment link leading to checkout flow.
  - [ ] Create Page 1 of checkout (invoked via merchant link) for Amount, Country, Name inputs (Shadcn UI).
  - [ ] Implement frontend validation for Page 1 (React Hook Form + Zod).
  - [ ] Implement logic to fetch countries and auto-display currency (based on merchant's settings for the linked country).
  - [ ] Implement "Proceed" button navigation to Page 2, passing data within merchant context.
  - [ ] Create Page 2 of checkout for displaying relevant payment methods and selection.
  - [ ] Implement Page 2 receiving data from Page 1 within merchant context.
  - [ ] Implement logic to fetch and display merchant-specific linked manual payment methods (ordered).
  - [ ] Implement UI displaying payment methods with names/icons (Shadcn UI).
  - [ ] Implement payment method selection logic.
  - [ ] Implement "Proceed" button navigation to proof upload page, passing data.
  - [ ] Implement "Back" button on Page 2.
  - [ ] Implement backend APIs/RLS for fetching public checkout data relevant to the merchant.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Payment Proof Upload (User Side)**
  - [ ] Create Proof upload page route (app/pay/upload-proof).
  - [ ] Implement page receiving payment details and method ID.
  - [ ] Display payment summary and instructions.
  - [ ] Implement file upload input with validation (Shadcn UI).
  - [ ] Implement optional email input with validation (Shadcn UI).
  - [ ] Implement "Submit Payment Proof" button.
  - [ ] Implement frontend logic for file upload and form submission.
  - [ ] Show loading indicator during submission.
  - [ ] Implement backend API for receiving data and file upload.
  - [ ] Ensure file is securely uploaded to Supabase Storage.
  - [ ] Create 'pending' payment record in payments table with proof link.
  - [ ] Store optional email with payment record.
  - [ ] Redirect user to status page after submission.
  - [ ] Implement error handling.
  - [ ] Configure Supabase Storage and RLS for uploads.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Confirmation Page & Notification System (Outline)**
  - [ ] Create dynamic status page route (app/pay/status/[paymentId]).
  - [ ] Implement frontend logic to fetch payment status by ID.
  - [ ] Implement UI for different status messages ('Pending', 'Confirmed', 'Rejected') (Shadcn UI).
  - [ ] Display payment ID and details on status page.
  - [ ] Implement backend API/RLS for fetching public payment status.
  - [ ] Outline backend logic for triggering email notifications (MVP: Supabase Functions) on status update.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

## 4. Phase 3: Analytics, Wizard, and Audit Logging

- [ ] **Complete Admin Manual Payment Verification UI**
  - [ ] Create admin page for Manual Payment Verification.
  - [ ] Implement table displaying 'pending' payments (Shadcn UI Table).
  - [ ] Display payment details in table.
  - [ ] Implement functionality to view/download uploaded proof (secured by RLS).
  - [ ] Implement buttons to confirm or reject payments.
  - [ ] Implement optional input for rejection reason.
  - [ ] Implement frontend logic for status updates.
  - [ ] Implement backend API/RLS for fetching pending payments and updating status.
  - [ ] Configure RLS for admin access to payments and uploads.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Basic Analytics Dashboard**
  - [ ] Create admin page for Analytics.
  - [ ] Implement UI to display key metrics (Total Volume, Number of Payments, Rates) (Shadcn UI).
  - [ ] Implement frontend logic for fetching aggregated payment data.
  - [ ] Implement logic to calculate and display metrics.
  - [ ] Implement backend API/RLS for fetching aggregated payment data.
  - [ ] Configure RLS for admin read access.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.
  - [ ] (Optional) Integrate basic chart.

- [ ] **Complete Audit Logs**
  - [ ] Implement backend logic to insert records into audit_logs for admin actions.
  - [ ] Create admin page for Audit Logs.
  - [ ] Implement table displaying audit log entries (Shadcn UI Table).
  - [ ] Display log details (timestamp, user, action, details).
  - [ ] Implement frontend logic for fetching audit logs.
  - [ ] Implement backend API/RLS for fetching audit logs.
  - [ ] Configure RLS for Super Admin only read access to audit_logs.
  - [ ] Secure Audit logs route strictly for Super Admins.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Setup Wizard**
  - [ ] Create admin page for Setup Wizard.
  - [ ] Implement wizard interface with step-by-step progression (Shadcn UI).
  - [ ] Integrate reusable form components into steps.
  - [ ] Implement tooltips and real-time validation.
  - [ ] Implement navigation buttons and progress indicator.
  - [ ] Implement frontend logic for state management and saving data via APIs.
  - [ ] Implement backend logic to mark setup as complete for a user.
  - [ ] Redirect user to dashboard upon completion.
  - [ ] Protect wizard route and restrict access appropriately.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

## 5. Phase 4: Admin Customization & Content

- [ ] **Complete Admin Checkout Page Content Management UI**
  - [ ] Create admin page for Checkout Content.
  - [ ] Implement form UI with fields for editable text elements (Shadcn UI).
  - [ ] Implement frontend validation (React Hook Form + Zod).
  - [ ] Implement frontend logic for fetching and saving content.
  - [ ] Implement backend API/RLS for CRUD on cms_content.
  - [ ] Configure RLS for Super Admin access.
  - [ ] Ensure public checkout pages fetch and display content from cms_content.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

- [ ] **Complete Admin Theme Customization UI**
  - [ ] Create admin page for Theme Settings.
  - [ ] Implement form UI with fields for basic theme variables (Shadcn UI).
  - [ ] Implement frontend validation (React Hook Form + Zod).
  - [ ] Implement frontend logic for fetching and saving theme settings.
  - [ ] Implement backend API/RLS for admin write access to settings.
  - [ ] Implement backend API/RLS for public read access to settings (by user/merchant ID).
  - [ ] Ensure public checkout pages fetch and apply theme settings dynamically.
  - [ ] Configure RLS for Super Admin write and public read access.
  - [ ] Ensure UI is responsive and uses theme/Shadcn UI.

## 6. Ongoing / Iterative Tasks

- [ ] Implement Unit Tests for key components/functions.
- [ ] Implement Integration Tests for API endpoints.
- [ ] Implement E2E Tests for critical user flows.
- [ ] Set up Continuous Deployment pipeline (Vercel, Supabase).
- [ ] Deploy frequently to staging environment.
- [ ] Address bugs and refine features based on testing and feedback. 