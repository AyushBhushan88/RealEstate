# Real Estate Management System (REMS)

## What This Is

A centralized digital platform for real estate agencies to efficiently manage property listings, clients, rentals, sales, and transactions. It serves multiple roles (Admins, Agents, Owners, Buyers, Tenants, Account Managers) and covers the full deal lifecycle from listing to closing.

## Core Value

A one-stop-shop for real estate transactions, from listing to close, with a focus on ease of use for the end-user.

## Requirements

### Validated
- [x] [AUTH-01]: User can create account with email/password and optional Google OAuth.
- [x] [AUTH-02]: User can log in and stay logged in across sessions.
- [x] [LIST-01]: Admins/Agents can manage property listings (create, edit, delete).
- [x] [SEARCH-01]: Buyers/Tenants can search and filter properties.
- [x] [BOOK-01]: Buyers/Tenants can book properties and schedule appointments.
- [x] [MEDIA-01]: Manage property images and media.
- [x] [NOTIF-01]: Handle notifications and inquiries.
- [x] [SRCH-02]: Personalization (Favorites & Saved Searches).
- [x] [DOC-01]: Integrated e-signatures and document template generation.
- [x] [PAY-01]: Real-time payment processing (Rent, Deposits, Fees, Commissions).

### Active
- [ ] [RENT-03]: Tracking lease start/end dates and renewal status.
- [ ] [SALE-03]: Commission split calculation and tracking for Agents/Account Managers.
- [ ] [ANLY-01]: Analytics dashboards for property performance and sales reports.
- [ ] [ANLY-02]: Agent performance tracking.

### Out of Scope
- (None yet defined)

## Context
- **Technical Environment**: React/Next.js frontend, Node.js/Express backend, SQLite (Development) / PostgreSQL (Production).
- **Ecosystem**: Stripe for payments, Cloudinary for media, Native E-signatures.

## Constraints
- **Tech Stack**: React/Next.js, Node/Express, Prisma ORM.
- **Authentication**: Email/Password + JWT.
- **Security**: Role-based access control (RBAC).

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Transaction Mgmt | Full deal lifecycle (Contracts, commissions, legal steps) | [x] Completed |
| Seamless UX | Speed and self-service for clients | [x] Completed |
| E-Sign Ready | Integrated e-signatures and template generation | [x] Completed |
| Live Payments | Real-time payment processing (Rent, Deposits, Fees) | [x] Completed |

---
*Last updated: 2026-03-10 after Phase 4 completion*
