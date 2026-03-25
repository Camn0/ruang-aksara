# Security and Role-Based Access Control (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the security architecture, authorization matrices, and threat model protection strategies that secure the Ruang Aksara platform. It is designed for security auditors and senior maintainers.

## 1. The RBAC (Role-Based Access Control) Hierarchy

Ruang Aksara employs a three-tier permission model. This hierarchy is not merely a UI toggle but is enforced at the network, middleware, and application layers.

### 1.1 Role-Tier Definitions
- **admin (The "God Account")**:
    - **Access**: Unrestricted access to the `/admin` namespace.
    - **Permissions**: Can manage all users, update roles, delete any work (moderation), and access global platform financial/engagement analytics.
    - **Validation**: All sensitive mutations from an admin are logged in a server-side audit trail (Planned).
- **author (The "Moderator/Penulis")**:
    - **Access**: Access to the `/studio` namespace.
    - **Permissions**: Can create and manage their own works (`Karya`) and chapters. They can manage their personal social profile and respond to comments on their owned content.
    - **Restriction**: Authors **cannot** modify content uploaded by other authors or access global administrative tools.
- **user (The "Reader")**:
    - **Access**: Access to public discovery routes and the personal library.
    - **Permissions**: Can participate in social engagement (Comment, React, Rate) and manage their reading preferences and notifications.
    - **Restriction**: Absolute block from `/admin` and `/studio` routes.

## 2. Crisis Management: Security Breach Protocols

In a modern serverless environment, security is about "When," not "If." We maintain a set of hardening protocols for the secondary "Crisis" scenario.

### 2.1 Credential Rotation Logic (Secrets Leak)
If an environment variable (e.g., `DATABASE_URL`) is leaked:
1. **Supabase Barrier**: Immediately rotate the database password in the Supabase dashboard.
2. **Key Update**: Update the Vercel production environment variables.
3. **Re-Deployment**: Trigger a full platform re-deployment to clear any lingering environment state in serverless containers.
4. **Token Purge**: In extreme cases, we rotate the `NEXTAUTH_SECRET`, which effectively logs out every user on the platform, forcing a fresh, secure JWT generation cycle.

### 2.2 Role Escalation Denial
Should a malicious actor gain `author` role privileges, our secondary "Action Guards" (see Server Actions) ensure they still cannot modify another author's work. We enforce the "Double-Check" principle:
- **Check A (Middleware)**: Am I an author? (Pass).
- **Check B (Action)**: Am I the **owner** of this work ID? (Fail -> Block).

## 3. Zero-Database Authorization: The Edge Runtime Strategy

### 3.1 JWT (JSON Web Token) Claims Injection
During the authentication phase (`lib/auth.ts`), we extend the standard NextAuth token to include the user's role and ID.
```typescript
async jwt({ token, user }) {
    if (user) {
        token.role = user.role; // e.g., 'admin'
        token.id = user.id;
    }
    return token;
}
```
### 3.2 Edge Middleware Enforcement
The `middleware.ts` runs on the Vercel Edge Runtime. When a request hits a protected route like `/admin/dashboard`:
1. **Extraction**: The middleware extracts the signed JWT from the request cookie.
2. **Verification**: It verifies the signature using the `NEXTAUTH_SECRET`.
3. **Authorization**: It checks the `role` claim. If the role is not `admin`, it immediately returns a `403 Forbidden` response.
- **The Result**: Authorization takes <10ms and costs zero database resources. This ensures the site remains fast even under heavy load or brute-force attempts on administrative routes.

## 4. Authorization Matrices

| Route / Namespace | Authentication Required? | Role Requirement | Data Ownership Check? |
| --- | --- | --- | --- |
| `/novel/[id]` | No (Public) | None | N/A |
| `/library` | Yes | `user`, `author`, `admin` | Yes (User Context) |
| `/studio/novel/new` | Yes | `author`, `admin` | N/A (Creation) |
| `/studio/novel/edit`| Yes | `author`, `admin` | **Yes (Uploader ID Check)** |
| `/admin/*` | Yes | `admin` | N/A (Global) |

## 5. Server Action Security Protocols

Since Server Actions are public POST endpoints, they require a secondary layer of protection known as "Action-Level Hardening."

### 5.1 Identity Verification (Double-Gate)
Every sensitive mutation (e.g., `updateChapter`) re-verifies the user's identity on the server:
- **Step 1**: Get the session via `getServerSession(authOptions)`.
- **Step 2**: If no session, return `Unauthorized`.
- **Step 3**: Re-fetch the target object from the DB and verify that `object.uploader_id === session.user.id`.
- **Rationale**: This prevents "ID Guessing" attacks where a malicious user tries to edit another person's work by simply changing the `id` in the form data.

## 6. Security & Threat Model Protection

Ruang Aksara is engineered against several common web threats:

### 6.1 CSRF (Cross-Site Request Forgery)
By utilizing Next.js Server Actions, we benefit from the framework's internal CSRF protection. Actions are bound to the specific deployment origin, and requests from external origins are automatically rejected by the Next.js runtime.

### 6.2 DDoS Mitigation (Database Level)
- **Denormalization**: By caching trending and rating stats, we prevent expensive aggregate queries that could be used to slow down the database during a resource-exhaustion attack.
- **Redis Buffering**: High-frequency writes (views) are buffered in Redis, protecting the primary PostgreSQL instance from "Write Burst" saturation.

Document Version: 1.3.1 