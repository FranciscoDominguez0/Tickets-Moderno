BACKEND — Node.js 22 + Express 5 + TypeScript
================================================================
├── backend/
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env.example
│   │
│   └── src/
│       │
│       # ── PUNTO DE ENTRADA ──────────────────────────────────
│       ├── 📄 server.ts                    # Bootstrap: Express app + Socket.io
│       │
│       # ── CONFIGURACIÓN ─────────────────────────────────────
│       ├── config/
│       │   ├── 📄 database.ts              # Pool mysql2
│       │   ├── 📄 env.ts                   # Validación de variables de entorno
│       │   └── 📄 socket.ts                # Inicialización Socket.io
│       │
│       # ── RUTAS PRINCIPALES ─────────────────────────────────
│       ├── routes/
│       │   └── 📄 index.ts                 # Registra todas las rutas por módulo
│       │
│       # ── MIDDLEWARE GLOBAL ──────────────────────────────────
│       ├── middleware/
│       │   ├── 📄 auth.middleware.ts        # Verifica JWT (user o staff)
│       │   ├── 📄 role.middleware.ts        # Verifica rol: agent/admin/superadmin
│       │   ├── 📄 permission.middleware.ts  # Verifica permiso granular (role_permissions)
│       │   ├── 📄 tenant.middleware.ts      # Inyecta empresa_id en req desde JWT
│       │   ├── 📄 rateLimit.middleware.ts   # Rate limiting por IP
│       │   └── 📄 errorHandler.middleware.ts # Manejo global de errores
│       │
│       # ── MÓDULOS (Clean Architecture) ──────────────────────
│       ├── modules/
│       │   │
│       │   # ── AUTH ────────────────────────────────────────
│       │   ├── auth/
│       │   │   ├── 📄 auth.controller.ts    # POST /auth/login, /logout, /me
│       │   │   ├── 📄 auth.service.ts       # bcrypt compare, JWT sign
│       │   │   ├── 📄 auth.repository.ts    # findByEmail, updateLastLogin, logAttempt
│       │   │   ├── 📄 auth.routes.ts        # Rutas públicas de auth
│       │   │   ├── 📄 auth.validation.ts    # schemas: LoginDto
│       │   │   └── 📄 auth.types.ts         # interfaces JwtPayload, AuthUser
│       │   │
│       │   # ── PASSWORD RESET ──────────────────────────────
│       │   ├── passwordReset/
│       │   │   ├── 📄 passwordReset.controller.ts
│       │   │   ├── 📄 passwordReset.service.ts    # genera token, envía correo
│       │   │   ├── 📄 passwordReset.repository.ts
│       │   │   ├── 📄 passwordReset.routes.ts
│       │   │   └── 📄 passwordReset.validation.ts
│       │   │
│       │   # ── USERS (clientes) ────────────────────────────
│       │   ├── users/
│       │   │   ├── 📄 user.controller.ts    # CRUD usuarios, ban, perfil, org
│       │   │   ├── 📄 user.service.ts
│       │   │   ├── 📄 user.repository.ts
│       │   │   ├── 📄 user.routes.ts        # + PATCH /:id/organization  ← nuevo
│       │   │   ├── 📄 user.validation.ts
│       │   │   └── 📄 user.types.ts
│       │   │
│       │   # ── USER NOTES ──────────────────────────────────
│       │   ├── userNotes/
│       │   │   ├── 📄 userNote.controller.ts
│       │   │   ├── 📄 userNote.service.ts
│       │   │   ├── 📄 userNote.repository.ts
│       │   │   └── 📄 userNote.routes.ts
│       │   │
│       │   # ── STAFF (agentes/admins) ──────────────────────
│       │   ├── staff/
│       │   │   ├── 📄 staff.controller.ts   # CRUD agentes, perfil, toggle activo
│       │   │   ├── 📄 staff.service.ts
│       │   │   ├── 📄 staff.repository.ts
│       │   │   ├── 📄 staff.routes.ts
│       │   │   ├── 📄 staff.validation.ts
│       │   │   └── 📄 staff.types.ts
│       │   │
│       │   # ── DEPARTMENTS ─────────────────────────────────
│       │   ├── departments/
│       │   │   ├── 📄 department.controller.ts
│       │   │   ├── 📄 department.service.ts
│       │   │   ├── 📄 department.repository.ts
│       │   │   ├── 📄 department.routes.ts
│       │   │   └── 📄 department.validation.ts
│       │   │
│       │   # ── HELP TOPICS ─────────────────────────────────
│       │   ├── topics/
│       │   │   ├── 📄 topic.controller.ts
│       │   │   ├── 📄 topic.service.ts
│       │   │   ├── 📄 topic.repository.ts
│       │   │   └── 📄 topic.routes.ts
│       │   │
│       │   # ── ROLES & PERMISSIONS ─────────────────────────
│       │   ├── roles/
│       │   │   ├── 📄 role.controller.ts
│       │   │   ├── 📄 role.service.ts
│       │   │   ├── 📄 role.repository.ts
│       │   │   ├── 📄 role.routes.ts
│       │   │   └── 📄 role.types.ts
│       │   │
│       │   # ── ORGANIZATIONS ───────────────────────────────  ← nuevo módulo
│       │   ├── organizations/
│       │   │   ├── 📄 organization.controller.ts  # CRUD orgs, vincular/desvincular users, tickets de org
│       │   │   ├── 📄 organization.service.ts     # lógica: miembros, query tickets por org
│       │   │   ├── 📄 organization.repository.ts  # getById+users, getTicketsByOrg (JOIN users)
│       │   │   ├── 📄 organization.routes.ts      # /api/admin/organizations + sub-rutas
│       │   │   ├── 📄 organization.validation.ts  # CreateOrgDto, UpdateOrgDto
│       │   │   └── 📄 organization.types.ts       # Organization, OrgWithUsers, OrgDetail
│       │   │
│       │   # ── TICKETS ─────────────────────────────────────
│       │   ├── tickets/
│       │   │   ├── 📄 ticket.controller.ts  # Crear, listar, ver, asignar, cerrar
│       │   │   ├── 📄 ticket.service.ts     # Lógica: número, dept default, SLA
│       │   │   ├── 📄 ticket.repository.ts  # Queries SQL optimizadas con JOINs
│       │   │   ├── 📄 ticket.routes.ts
│       │   │   ├── 📄 ticket.validation.ts  # CreateTicketDto, UpdateTicketDto
│       │   │   └── 📄 ticket.types.ts
│       │   │
│       │   # ── THREAD ENTRIES (mensajes) ────────────────────
│       │   ├── threadEntries/
│       │   │   ├── 📄 thread.controller.ts  # POST reply, notas internas
│       │   │   ├── 📄 thread.service.ts     # Trigger notificaciones + email
│       │   │   ├── 📄 thread.repository.ts
│       │   │   ├── 📄 thread.routes.ts
│       │   │   └── 📄 thread.validation.ts
│       │   │
│       │   # ── ATTACHMENTS ─────────────────────────────────
│       │   ├── attachments/
│       │   │   ├── 📄 attachment.controller.ts  # Upload, download, delete
│       │   │   ├── 📄 attachment.service.ts     # Multer, hash, storage path
│       │   │   ├── 📄 attachment.repository.ts
│       │   │   ├── 📄 attachment.routes.ts
│       │   │   └── 📄 upload.middleware.ts      # Multer config + validación MIME
│       │   │
│       │   # ── TASKS ───────────────────────────────────────
│       │   ├── tasks/
│       │   │   ├── 📄 task.controller.ts
│       │   │   ├── 📄 task.service.ts
│       │   │   ├── 📄 task.repository.ts
│       │   │   ├── 📄 task.routes.ts
│       │   │   ├── 📄 task.validation.ts
│       │   │   └── 📄 task.types.ts
│       │   │
│       │   # ── NOTIFICATIONS ───────────────────────────────
│       │   ├── notifications/
│       │   │   ├── 📄 notification.controller.ts  # GET list, mark read, mark all read
│       │   │   ├── 📄 notification.service.ts     # createForUser, createForStaff, emit Socket
│       │   │   ├── 📄 notification.repository.ts
│       │   │   └── 📄 notification.routes.ts
│       │   │
│       │   # ── EMAIL ACCOUNTS ──────────────────────────────
│       │   ├── email/
│       │   │   ├── 📄 email.controller.ts   # CRUD cuentas SMTP, test conexión
│       │   │   ├── 📄 email.service.ts      # Nodemailer transport, send
│       │   │   ├── 📄 email.repository.ts
│       │   │   ├── 📄 email.routes.ts
│       │   │   └── 📄 email.validation.ts
│       │   │
│       │   # ── BANLIST ─────────────────────────────────────
│       │   ├── banlist/
│       │   │   ├── 📄 banlist.controller.ts
│       │   │   ├── 📄 banlist.service.ts
│       │   │   ├── 📄 banlist.repository.ts
│       │   │   └── 📄 banlist.routes.ts
│       │   │
│       │   # ── STATISTICS ──────────────────────────────────
│       │   ├── statistics/
│       │   │   ├── 📄 stats.controller.ts   # Dashboard KPIs, tickets por estado, agente...
│       │   │   ├── 📄 stats.service.ts
│       │   │   ├── 📄 stats.repository.ts   # Queries agregadas
│       │   │   └── 📄 stats.routes.ts
│       │   │
│       │   # ── SETTINGS ────────────────────────────────────
│       │   ├── settings/
│       │   │   ├── 📄 settings.controller.ts  # GET/PATCH company settings
│       │   │   ├── 📄 settings.service.ts
│       │   │   ├── 📄 settings.repository.ts  # upsert app_settings
│       │   │   └── 📄 settings.routes.ts
│       │   │
│       │   # ── LOGS ────────────────────────────────────────
│       │   ├── logs/
│       │   │   ├── 📄 log.controller.ts
│       │   │   ├── 📄 log.service.ts          # createLog helper
│       │   │   ├── 📄 log.repository.ts
│       │   │   └── 📄 log.routes.ts
│       │   │
│       │   # ── BILLING ─────────────────────────────────────
│       │   ├── billing/
│       │   │   ├── 📄 billing.controller.ts   # Pagos, estado empresa, historial
│       │   │   ├── 📄 billing.service.ts
│       │   │   ├── 📄 billing.repository.ts
│       │   │   └── 📄 billing.routes.ts
│       │   │
│       │   # ── SUPERADMIN ──────────────────────────────────
│       │   └── superadmin/
│       │       ├── 📄 superadmin.controller.ts  # Crear/bloquear empresas, stats globales
│       │       ├── 📄 superadmin.service.ts
│       │       ├── 📄 superadmin.repository.ts
│       │       └── 📄 superadmin.routes.ts
│       │
│       # ── SERVICIOS GLOBALES ────────────────────────────────
│       ├── services/
│       │   ├── 📄 email.service.ts          # Nodemailer: envío de correos
│       │   ├── 📄 notification.service.ts   # Socket.io emit por empresa/usuario
│       │   └── 📄 upload.service.ts         # Multer + storage local
│       │
│       # ── JOBS / TAREAS PROGRAMADAS ─────────────────────────
│       ├── jobs/
│       │   ├── 📄 billingReminder.ts        # node-cron: aviso vencimiento
│       │   └── 📄 cleanupLogs.ts            # node-cron: purgar logs antiguos
│       │
│       # ── UTILIDADES ────────────────────────────────────────
│       └── utils/
│           ├── 📄 pagination.ts             # Helper: page, limit, offset, total
│           ├── 📄 ticketNumber.ts           # Genera número con secuencia y padding
│           ├── 📄 hashToken.ts              # SHA-256 para tokens de reset
│           ├── 📄 apiResponse.ts            # Wrapper: success(), error(), paginated()
│           └── 📄 logger.ts                # Logger de consola/archivo
│
================================================================
FRONTEND — Next.js 15 + React 19 + TypeScript + Tailwind 4
================================================================
└── frontend/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.ts
├── 📄 tailwind.config.ts
├── 📄 .env.local.example
│
└── src/
│
# ── APP ROUTER (Next.js) ──────────────────────────────
├── app/
│   ├── 📄 layout.tsx               # Root layout: providers, fonts
│   ├── 📄 not-found.tsx
│   ├── 📄 error.tsx
│   │
│   # ── PORTAL USUARIO ──────────────────────────────
│   ├── (user)/
│   │   ├── login/
│   │   │   └── 📄 page.tsx
│   │   ├── register/
│   │   │   └── 📄 page.tsx
│   │   ├── forgot-password/
│   │   │   └── 📄 page.tsx
│   │   ├── reset-password/
│   │   │   └── 📄 page.tsx
│   │   └── portal/
│   │       ├── 📄 layout.tsx       # Sidebar usuario, header, notifs
│   │       ├── dashboard/
│   │       │   └── 📄 page.tsx     # Mis tickets recientes
│   │       ├── tickets/
│   │       │   ├── 📄 page.tsx     # Lista de mis tickets
│   │       │   ├── new/
│   │       │   │   └── 📄 page.tsx # Abrir nuevo ticket
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx # Ver ticket + responder
│   │       └── profile/
│   │           └── 📄 page.tsx
│   │
│   # ── PORTAL AGENTE ───────────────────────────────
│   ├── (agent)/
│   │   └── agent/
│   │       ├── 📄 layout.tsx       # Sidebar agente
│   │       ├── dashboard/
│   │       │   └── 📄 page.tsx     # Resumen: tickets asignados, tareas, stats
│   │       ├── tickets/
│   │       │   ├── 📄 page.tsx     # Cola de tickets con filtros
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx # Ticket completo: responder, asignar, notas internas
│   │       ├── users/
│   │       │   ├── 📄 page.tsx     # Lista de usuarios
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx # Perfil usuario + tickets + notas
│   │       ├── organizations/                              ← nuevo
│   │       │   ├── 📄 page.tsx     # Lista de organizaciones (solo lectura)
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx # Detalle org: datos, usuarios miembros, tickets
│   │       ├── tasks/
│   │       │   ├── 📄 page.tsx     # Mis tareas
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx
│   │       ├── statistics/
│   │       │   └── 📄 page.tsx     # Stats personales
│   │       └── profile/
│   │           └── 📄 page.tsx
│   │
│   # ── PORTAL ADMIN ────────────────────────────────
│   ├── (admin)/
│   │   └── admin/
│   │       ├── 📄 layout.tsx       # Sidebar admin
│   │       ├── dashboard/
│   │       │   └── 📄 page.tsx     # KPIs empresa
│   │       ├── agents/
│   │       │   ├── 📄 page.tsx     # Lista agentes
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx
│   │       ├── organizations/                              ← nuevo
│   │       │   ├── 📄 page.tsx     # Lista orgs + botón crear
│   │       │   └── [id]/
│   │       │       └── 📄 page.tsx # Detalle: datos, miembros, tickets + editar/eliminar/vincular
│   │       ├── departments/
│   │       │   └── 📄 page.tsx
│   │       ├── topics/
│   │       │   └── 📄 page.tsx
│   │       ├── roles/
│   │       │   └── 📄 page.tsx     # Roles + permisos
│   │       ├── email/
│   │       │   ├── 📄 page.tsx     # Cuentas SMTP
│   │       │   └── test/
│   │       │       └── 📄 page.tsx # Test de envío
│   │       ├── banlist/
│   │       │   └── 📄 page.tsx
│   │       ├── billing/
│   │       │   └── 📄 page.tsx     # Historial de pagos
│   │       ├── logs/
│   │       │   └── 📄 page.tsx     # Auditoría
│   │       └── settings/
│   │           ├── 📄 page.tsx     # Config general
│   │           ├── tickets/
│   │           │   └── 📄 page.tsx
│   │           └── agents/
│   │               └── 📄 page.tsx
│   │
│   # ── PORTAL SUPERADMIN ───────────────────────────
│   └── (superadmin)/
│       └── superadmin/
│           ├── 📄 layout.tsx
│           ├── dashboard/
│           │   └── 📄 page.tsx     # Stats globales SaaS
│           ├── companies/
│           │   ├── 📄 page.tsx     # Lista de empresas
│           │   └── [id]/
│           │       └── 📄 page.tsx # Ver empresa: staff, tickets, pagos
│           ├── billing/
│           │   └── 📄 page.tsx     # Todos los pagos del SaaS
│           └── admins/
│               └── 📄 page.tsx     # Gestionar superadmins
│
# ── COMPONENTES REUTILIZABLES ─────────────────────────
├── components/
│   ├── ui/                         # shadcn/ui base components
│   │   ├── 📄 button.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 table.tsx
│   │   ├── 📄 tabs.tsx
│   │   └── 📄 toast.tsx
│   │
│   ├── layout/
│   │   ├── 📄 Sidebar.tsx          # Sidebar con nav items por portal
│   │   ├── 📄 Header.tsx           # Header: notificaciones, avatar, menú
│   │   ├── 📄 NotificationsDropdown.tsx
│   │   └── 📄 PageTitle.tsx
│   │
│   ├── tickets/
│   │   ├── 📄 TicketCard.tsx       # Card ticket en lista
│   │   ├── 📄 TicketTable.tsx      # Tabla con filtros y paginación
│   │   ├── 📄 TicketStatusBadge.tsx
│   │   ├── 📄 TicketPriorityBadge.tsx
│   │   ├── 📄 TicketThread.tsx     # Conversación completa
│   │   ├── 📄 ReplyEditor.tsx      # Editor para responder
│   │   └── 📄 AttachmentList.tsx
│   │
│   ├── organizations/                                      ← nuevo
│   │   ├── 📄 OrganizationCard.tsx       # Card en la lista de orgs
│   │   ├── 📄 OrganizationForm.tsx        # Formulario crear/editar org
│   │   ├── 📄 OrganizationUsersList.tsx   # Tabla de usuarios miembros + vincular/desvincular
│   │   └── 📄 OrganizationTicketsTable.tsx # Tickets de la org (reutiliza TicketTable)
│   │
│   ├── forms/
│   │   ├── 📄 CreateTicketForm.tsx
│   │   ├── 📄 CreateAgentForm.tsx
│   │   ├── 📄 CreateDepartmentForm.tsx
│   │   └── 📄 EmailAccountForm.tsx
│   │
│   └── shared/
│       ├── 📄 DataTable.tsx        # Tabla genérica reutilizable
│       ├── 📄 Pagination.tsx
│       ├── 📄 SearchInput.tsx
│       ├── 📄 ConfirmDialog.tsx
│       ├── 📄 EmptyState.tsx
│       └── 📄 LoadingSpinner.tsx
│
# ── HOOKS ────────────────────────────────────────────
├── hooks/
│   ├── 📄 useAuth.ts               # useAuth() — user o staff autenticado
│   ├── 📄 useTickets.ts            # TanStack Query: lista y detalle
│   ├── 📄 useTasks.ts
│   ├── 📄 useOrganizations.ts      # TanStack Query: lista, detalle, mutations  ← nuevo
│   ├── 📄 useNotifications.ts      # Socket.io + queries
│   ├── 📄 useSocket.ts             # Conexión Socket.io global
│   └── 📄 usePermission.ts         # hasPermission('ticket.reply')
│
# ── SERVICIOS API ─────────────────────────────────────
├── services/
│   ├── 📄 api.ts                   # Axios instance con interceptors (JWT)
│   ├── 📄 auth.service.ts
│   ├── 📄 tickets.service.ts
│   ├── 📄 staff.service.ts
│   ├── 📄 users.service.ts
│   ├── 📄 organizations.service.ts # CRUD orgs, vincular users, tickets de org  ← nuevo
│   ├── 📄 tasks.service.ts
│   ├── 📄 departments.service.ts
│   ├── 📄 notifications.service.ts
│   ├── 📄 statistics.service.ts
│   └── 📄 settings.service.ts
│
# ── ESTADO GLOBAL (Zustand) ───────────────────────────
├── store/
│   ├── 📄 authStore.ts             # user/staff session, token
│   ├── 📄 notificationStore.ts     # badge count, lista
│   └── 📄 uiStore.ts              # sidebar collapsed, dark mode
│
# ── TIPOS GLOBALES ────────────────────────────────────
├── types/
│   ├── 📄 ticket.types.ts
│   ├── 📄 user.types.ts
│   ├── 📄 staff.types.ts
│   ├── 📄 organization.types.ts    # Organization, OrgWithUsers, OrgDetail  ← nuevo
│   ├── 📄 task.types.ts
│   ├── 📄 notification.types.ts
│   └── 📄 api.types.ts             # ApiResponse<T>, PaginatedResponse<T>
│
# ── UTILIDADES ────────────────────────────────────────
└── utils/
├── 📄 formatDate.ts
├── 📄 cn.ts                    # clsx + tailwind-merge
└── 📄 constants.ts             # Status colors, priority labels