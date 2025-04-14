## 6. MVP Prioritization Suggestions

To achieve an MVP quickly while laying the foundation for future features, focus on the core evaluation workflow first. Defer complex administrative, analytical, and collaborative features.

**Core MVP Features (Focus On These):**

*   **Authentication (1.1, 1.2, 1.4):** Basic email/password login, registration, password recovery. (Defer MFA, advanced reCAPTCHA initially).
*   **Tenant Creation/Membership (Implicit):** A basic mechanism for a user to belong to a tenant (e.g., auto-create on signup or simple invite). Define `tenant_id_admin` and `tenant_id_user` roles via `tenant_memberships`. RLS is CRITICAL here from the start.
*   **Project Management (2.1, 2.2, 2.5, 2.6):** Create, view list, edit basic details, set status (draft, active, completed).
*   **Supplier Management (3.1, 3.3):** Add suppliers to a project, store basic info (name).
*   **Criteria & Weighting (4.1-4.5):** Define categories, criteria within them, set weights (category & criteria), basic reordering.
*   **Evaluation Engine (5.1, 5.2, 5.3, 5.4, 5.5, 5.7):** Simple scoring interface (e.g., fixed 1-5 scale), add comments, auto-calculate weighted scores, save progress, allow score changes before locking.
*   **Price Assessment (6.1, 6.2, 6.5):** Input price, basic lowest-price calculation, include price weight in total score.
*   **Results & Analysis (7.1, 7.2, 7.3):** Ranked list, basic comparison table, simple bar chart of total scores.
*   **Basic Tenant Admin (11.3 subset):** Allow `tenant_id_admin` to invite users (`inviteUserByEmail`) to their *own* tenant.
*   **Basic Security (RLS, 13.1 subset):** Implement core RLS for data isolation from day one. Basic MFA setup via Supabase UI is relatively easy if needed early.
*   **Core Admin Panel (0.1 subset):** Ability for Platform Admins (identified by metadata) to log in and see a distinct admin view (even if initially empty). Impersonation *logic* (Edge Function) can be built, but UI might be deferred slightly if needed.

**Defer/Simplify for Post-MVP:**

*   **Advanced Admin Panel Features (0.2-0.6):** Full license management UI, Stripe integration (handle manually initially if necessary, or just one-time payments first), cross-tenant user management UI, pricing changes UI. Focus on getting the *webhook* logic right first.
*   **Advanced Auth (1.6, 1.8, 1.9, 1.10 advanced):** Profile pictures, complex reCAPTCHA/Honeypot (use basic Supabase captcha), advanced invite flows beyond simple email.
*   **Advanced Project Management (2.7, 2.8):** Search/filtering, duplication/templates.
*   **Advanced Evaluation (5.6, 5.8):** Normalization, explicit locking mechanism (can rely on project 'completed' status initially).
*   **Advanced Pricing (6.3, 6.4):** Complex formulas, multi-currency support (stick to one default).
*   **Advanced Analysis (7.4, 7.5, 7.6):** Radar charts, strengths/weaknesses text generation, sensitivity analysis.
*   **Advanced Export/Reporting (8.1, 8.2, 8.3, 8.4, 8.5):** PDF/Excel export (can add later), configurable reports, sharing, print views.
*   **Collaboration Features (9.2-9.6):** Specific evaluator assignments per project, commenting system, activity log, detailed status tracking per evaluator.
*   **Internationalization (10.1):** Build with English first, add Norwegian later using a library like `i18next`.
*   **Advanced Tenant/User Settings (11.1, 11.2, 11.4, 11.5):** Detailed profile settings, subscription management view (link to Stripe portal later), theme settings, notifications.
*   **Mobile Optimization (12.1-12.3):** Ensure basic responsiveness, but deep optimization can follow.
*   **Advanced Security/Privacy (13.2, 13.4):** Formal GDPR audit/features like data deletion requests (build with good practices, formalize later).

By focusing on the core create -> define -> evaluate -> rank workflow within a single tenant context (plus the essential RLS and basic admin login), you can achieve a valuable MVP faster.
