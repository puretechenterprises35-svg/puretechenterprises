## Admin Portal – Implementation Plan

Build a role-gated admin area at `/admin/*` that reuses the existing portal shell, TanStack Query patterns, Supabase RLS, and PureTech branding. No changes to public-facing site or existing client portal behavior.

### Routes (all under `src/routes/admin.*.tsx`)
- `admin.tsx` — layout wrapper (`ssr:false`). Loads session + roles via `usePortalSession`; redirects non-admins to `/portal/dashboard`. Renders inside existing `DashboardLayout` with an admin-scoped sidebar variant.
- `admin.index.tsx` → redirect to `/admin/dashboard`
- `admin.dashboard.tsx` — live stats + charts scaffolding
- `admin.clients.tsx` — client management table
- `admin.projects.tsx` — projects table with search/filter/sort
- `admin.projects.new.tsx` — create project form
- `admin.projects.$projectId.tsx` — admin project details + quick edit
- `admin.project-updates.tsx` — publish/manage updates
- `admin.settings.tsx` — settings placeholder

### Reusable components (`src/components/admin/`)
`AdminTable`, `StatisticsCards`, `ClientForm`, `ProjectForm`, `StatusSelector`, `ProjectEditor`, `UpdateEditor`, `ApprovalDialog`, `DeleteDialog`, `AdminSidebar`.

### Data layer (`src/lib/admin/`)
TanStack Query hooks + Supabase calls:
- `useAdminStats` — counts across clients, projects, updates
- `useAdminClients`, `useApproveClient`, `useRejectClient`, `useSuspendClient`, `useReactivateClient`
- `useAdminProjects`, `useCreateProject`, `useUpdateProject`, `useArchiveProject`, `useDeleteProject`
- `useProjectUpdates`, `useCreateUpdate`, `useDeleteUpdate`
Every mutation invalidates the right query keys and the existing `portal/*` keys so client dashboards refresh in real time (already wired through `usePortalRealtime`).

### Database migration
One migration that:
- Adds admin RLS policies for `SELECT/INSERT/UPDATE/DELETE` on `projects`, `project_updates`, `clients`, `profiles` gated by `has_role(auth.uid(),'admin')` (idempotent `DROP POLICY IF EXISTS` then create).
- Adds `archived_at TIMESTAMPTZ NULL` to `projects` for soft-archive.
- Ensures admin can read all `user_roles` (needed for approvals).
- Adds staff-role read policies where the same policy scopes (`has_role(...,'staff')`) so future staff work needs no schema change.

Client-only policies remain unchanged; clients still cannot see admin data.

### Security
- Route-level: `admin.tsx` gate on role.
- Data-level: Supabase RLS on every touched table.
- Destructive actions go through `DeleteDialog` / `ApprovalDialog` confirmation.
- All admin mutations run through the browser Supabase client under the signed-in admin user; RLS enforces authorization.

### UI/UX
- Reuse existing `DashboardLayout`, `ProjectStatusBadge`, `StatCard`, shadcn `Table`, `Dialog`, `Select`, `Input`, `Button`, `Badge`, `Sonner` toasts.
- Charts: lightweight `recharts` line/bar on the dashboard (already available via shadcn or add if missing).
- Empty, loading, and error states everywhere; skeletons for tables.

### Out of scope (kept as placeholders)
- Monthly Revenue / Outstanding Payments cards render placeholder values (no payments schema yet).
- Settings page renders a "Coming soon" scaffold.
- Activity log is derived from `project_updates` (no separate audit table).

### Order of execution
1. Migration (RLS + `archived_at`).
2. Data hooks under `src/lib/admin/`.
3. Reusable admin components.
4. Route files.
5. Add "Admin" link in `DashboardLayout` visible only via `RoleGuard`.

Total: ~1 migration + ~18 new files, 1 small edit to `DashboardLayout`.