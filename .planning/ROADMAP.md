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

- [ ] **[P1-M3-01] Property CRUD API (Active)**
  - Endpoints to create, read, update, and delete property listings.
- [ ] **[P1-M3-02] Media Upload Integration**
  - Integrate a cloud provider (e.g., Cloudinary or AWS S3) for property images.
- [ ] **[P1-M3-03] Agent Dashboard (Core)**
  - A UI for Agents to manage their own listings.
- [ ] **[P1-M3-04] Public Property Gallery**
  - A landing page showing available properties with basic search/filtering [SRCH-01].

## Success Criteria for Phase 1
1.  Users can sign up and are assigned a specific role.
2.  Agents can successfully upload a property with images.
3.  Anonymous users can view all active listings on the home page.
4.  Database integrity is maintained for all property fields.
