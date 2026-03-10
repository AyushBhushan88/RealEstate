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
- [x] **[P1-M5-03] Notification System**
  - Real-time or email notifications for new inquiries, signed contracts, and payments.

# Phase 2: Transactions & Digital Contracts

**Goal:** Enable secure digital transactions and legally binding e-signatures for lease and sales agreements.

- [x] **Stripe Integration**: Real-time payment processing for rent and deposits.
- [x] **Native E-signatures**: Built-in document signing flow.
- [x] **Contracts Dashboard**: Centralized view for managing all agreements.

# Phase 3: Property Owner & Account Management

**Goal:** Provide specialized dashboards for property owners and account managers.

- [x] **Owner Portal**: Allow owners to track property performance and revenue.
- [x] **Financial Overview**: Platform-wide transaction tracking for Account Managers.
- [x] **Identity Verification**: Robust verification flow for high-value transactions.

# Phase 4: Customer Relationship & Experience

**Goal:** Enhance the platform for buyers/tenants with saved searches, favorites, and an integrated booking system for viewings.

## Milestone 1: Viewing Booking System [LEAD-02]
- [x] **[P4-M1-01] Booking API**
  - Endpoints to request, confirm, and cancel property viewings.
- [x] **[P4-M1-02] Viewing UI**
  - Integrated booking form on property detail pages and a management dashboard for both agents and clients.
- [x] **[P4-M1-03] Notifications for Bookings**
  - Real-time notifications when a viewing is requested or its status changes.

## Milestone 2: Personalization & Favorites [SRCH-02]
- [x] **[P4-M2-01] Favorite Properties**
  - Allow registered users to "heart" properties and view them in a dedicated dashboard section.
- [x] **[P4-M2-02] Saved Searches & Alerts**
  - Enable users to save their search criteria and receive alerts when matching properties are listed.

# Phase 5: Advanced Analytics & Financials

**Goal:** Deepen financial insights with commission split tracking, lease renewal monitoring, and agent performance analytics.

## Milestone 1: Enhanced Transaction Management [SALE-03]
- [ ] **[P5-M1-01] Commission Split Logic**
  - Backend support for automated commission calculation and multi-party splits.
- [ ] **[P5-M1-02] Split Transaction UI**
  - Visualizing splits in the Transaction feed.

## Milestone 2: Lease Lifecycle Management [RENT-03]
- [ ] **[P5-M2-01] Lease Expiry Tracking**
  - Automated tracking of lease dates and status updates.
- [ ] **[P5-M2-02] Renewal Notifications**
  - System alerts for upcoming lease expirations (30/60/90 days).

## Milestone 3: Advanced Analytics [ANLY-01, ANLY-02]
- [ ] **[P5-M3-01] Enhanced Admin Dashboard**
  - Visual charts for volume, revenue, and market trends.
- [ ] **[P5-M3-02] Agent Performance Metrics**
  - Tracking conversion rates, total sales, and active listings per agent.

## Success Criteria for Phase 5
1. Admins can see detailed commission splits for every transaction.
2. Agents are notified automatically of upcoming lease expirations.
3. Dashboards include visual data representations (charts/graphs).

