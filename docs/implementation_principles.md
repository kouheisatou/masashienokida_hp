# Implementation Principles: Theater Style Renewal

## 1. Project Overview
This project is a complete renewal of the Masashi Enokida official website. The goal is to create a "Theater Style" experience that mimics the atmosphere of a grand opera or symphony concert.

## 2. Design Philosophy
**"Grand Stage" (幕開けの緊張)**
- **Concept**: The view from the audience seat. Deep reds, heavy shadows, and elegant framing.
- **Reference**: `docs/design_guide_stage.md`
- **Key Elements**:
    - Deep Bordeaux/Black background.
    - Serif typography (Noto Serif JP).
    - Double borders and framing.
    - "Vignette" lighting effects.

## 3. Technical Stack
- **Architecture**: Monorepo (Frontend + Backend).
- **Infrastructure**: Docker Compose (One-command startup).
- **Frontend**: Next.js (React).
- **Backend**: Node.js (Hono or Express).
- **Database**: PostgreSQL (via Docker).
- **Storage**: MinIO (via Docker) for images.
- **Authentication**: Google OAuth 2.0.
- **Payments**: Stripe (Membership).

## 4. Functional Requirements
### Public Facing
- **Home**: Hero section with theater atmosphere.
- **Concerts**: List of upcoming and past concerts (Theater program style).
- **News**: Latest information.
- **Blog**: Articles by the artist.
- **Profile**: Biography.
- **Membership**: Sign up/Login for exclusive content.

### Admin / Management
- **Dashboard**: Overview.
- **CMS**:
    - Create/Edit/Delete Concerts.
    - Create/Edit/Delete News.
    - Create/Edit/Delete Blog Posts.
- **User Management**: View members.

## 5. Development Guidelines
- **Reset**: All existing code (except `docs`) will be archived/deleted.
- **Docs First**: Update documentation before code.
- **UI First**: Implement the Design System (Tokens, Components) before logic.
