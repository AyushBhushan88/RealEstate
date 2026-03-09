# Phase 1 Roadmap: Foundation & Core Listings

**Goal:** Establish the technical foundation, implement secure authentication with role-based access, and enable the core "Listing" lifecycle (Create, Read, Update, Delete).

## Milestone 1: Environment & Architecture
*Focus: Setting up the codebase and finalizing the data model.*

- [x] **[P1-M1-01] Decision: Database Finalization**
  - PostgreSQL selected for transaction integrity and relational data management.
- [x] **[P1-M1-02] Project Scaffolding**
  - Initialize Next.js (Frontend) and Express (Backend).
  - Configure TypeScript, ESLint, and Prettier across the workspace.
- [x] **[P1-M1-03] Database Schema Design**
  - Define schemas for `Users`, `Profiles`, `Properties`, and `Media`.

## Milestone 2: Identity & Access Management (IAM)
*Focus: Delivering [AUTH-01], [AUTH-02], and [AUTH-03].*

- [x] **[P1-M2-01] Backend Auth Service**
  - Email/Password registration and login with JWT.
  - Integration with Passport.js or NextAuth for Google OAuth.
- [x] **[P1-M2-02] RBAC Middleware**
  - Implement middleware to protect routes based on roles (Admin, Agent, Buyer, etc.).
- [x] **[P1-M2-03] Frontend Auth Integration**
  - Login/Signup pages.
  - Protected route handling in Next.js.

## Milestone 3: Property Listing Engine
*Focus: Delivering [LIST-01], [LIST-02], and [LIST-03].*

- [x] **[P1-M3-01] Property CRUD API**
  - Endpoints to create, read, update, and delete property listings.
- [x] **[P1-M3-02] Media Upload Integration**
  - Integrate Cloudinary for property images.
- [x] **[P1-M3-03] Agent Dashboard (Core)**
  - UI for Agents to create and manage their listings.
  - Integration with Media Upload UI.

## Milestone 4: Search & Discovery
*Focus: Delivering [SRCH-01] and [LIST-04].*

- [x] **[P1-M4-01] Public Property Gallery**
  - A landing page showing available properties with basic search/filtering.
- [x] **[P1-M4-02] Advanced Filtering System**
  - Search by location, price range, type, and features.
- [x] **[P1-M4-03] Property Detail Pages**
  - Individual pages for each property showing all details, images, and agent info.

## Milestone 5: Lead Management & Inquiries
*Focus: Delivering [BOOK-01] and [NOTIF-01].*

- [x] **[P1-M5-01] Inquiry System (Backend)**
  - Endpoints to submit property inquiries and contact requests.
- [x] **[P1-M5-02] Agent Lead Dashboard**
  - A view for agents to see incoming leads and messages.
- [ ] **[P1-M5-03] Notification System**
  - Real-time or email notifications for new inquiries.

# Phase 2: Transaction & Lease Management (Proposed)

**Goal:** Enable digital deal closing, document management, and transaction tracking.

## Milestone 1: Lease Agreements & Digital Signatures
- [x] **[P2-M1-01] Document Template Engine**
  - Generate PDF lease agreements and sales contracts.
- [x] **[P2-M1-02] E-Signature Integration**
  - Implemented Native Digital Signature Flow.
- [x] **[P2-M1-03] Tenant Onboarding Flow**
  - Profile verification and lease signing UI.

## Milestone 2: Payment Processing
- [x] **[P2-M2-01] Stripe Integration**
  - Process deposits, rent payments, and commissions.
- [x] **[P2-M2-02] Invoicing & Transaction System**
  - Automated tracking and Transactions Dashboard.

## Success Criteria for Phase 1
1.  Users can sign up and are assigned a specific role.
2.  Agents can successfully upload a property with images.
3.  Anonymous users can view all active listings on the home page.
4.  Database integrity is maintained for all property fields.
