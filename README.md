# Tickets-Moderno
 
 Sistema de mesa de ayuda (helpdesk) multi-empresa (tenant) con portales separados para **usuarios**, **agentes**, **administradores** y **superadmin**.
 
 El backend expone una API REST bajo `/api` y el frontend es una app con Next.js (App Router).
 
 ## Stack
 
 - **Backend**
   - Node.js 22
   - Express 5
   - TypeScript
   - MySQL (`mysql2/promise`) *(planificado: migración a PostgreSQL)*
   - JWT + bcrypt
   - Nodemailer (password reset)
 - **Frontend**
   - Next.js 15 (App Router)
   - React 19
   - TypeScript
   - TailwindCSS 4
   - Axios
   - TanStack Query
 
 ## Arquitectura (backend)
 
 El backend está organizado por módulos, cada uno con su capa HTTP y lógica:
 
 - **`backend/src/modules/<module>/`**
   - `*.routes.ts`: define endpoints
   - `*.controller.ts`: capa HTTP (req/res)
   - `*.service.ts`: lógica de negocio
   - `*.repository.ts`: queries a DB
   - `*.validation.ts`: validaciones de DTO
   - `*.types.ts`: interfaces/types
 
 Rutas principales:
 
 - **`backend/src/server.ts`**: bootstrapping (Express)
 - **`backend/src/routes/index.ts`**: registra routers de módulos
 - **`backend/src/middleware/tenant.middleware.ts`**: resuelve `empresa_id`
 - **`backend/src/middleware/auth.middleware.ts`**: `requireAuth`, `requireUser`, `requireStaff`
 
 ## Multi-tenant (empresa)
 
 Todas las rutas bajo `/api` pasan por `tenantMiddleware`. Puedes indicar la empresa con:
 
 - Header: `x-company-id: <id>`
 - (o subdominio cuando aplique)
 
 ## Requisitos
 
 - Node.js 22+
 - MySQL corriendo (local o docker)
 - (Opcional) SMTP para envío de correos
 
 ## Configuración de variables de entorno
 
 - Backend: copia `backend/.env.example` a `backend/.env`
 - Frontend: copia `frontend/.env.local.example` a `frontend/.env.local`
 
 **Importante:** los archivos `.env` no se suben al repo (están en `.gitignore`).
 
 ### Backend `.env` (mínimo)
 
 - `DB_HOST`
 - `DB_PORT`
 - `DB_USER`
 - `DB_PASSWORD`
 - `DB_NAME`
 - `JWT_SECRET`
 - `FRONTEND_URL`
 
 ### SMTP (para forgot-password)
 
 - `SMTP_HOST`
 - `SMTP_PORT`
 - `SMTP_SECURE` (`true`/`false`)
 - `SMTP_USER`
 - `SMTP_PASS`
 
 Si no configuras SMTP, el endpoint **no enviará correo** (por seguridad) y lo avisará por consola.
 
 ## Instalación
 
 ### Backend
 
 ```bash
 cd backend
 npm install
 npm run dev
 ```
 
 Backend corre en `http://localhost:3001`.
 
 ### Frontend
 
 ```bash
 cd frontend
 npm install
 npm run dev
 ```
 
 Frontend corre en `http://localhost:3000`.
 
 ## Health check
 
 - `GET /health` → `{ status: "ok" }`
 
 ## Endpoints clave (resumen)
 
 ### Auth
 
 - `POST /api/auth/login/user`
 - `POST /api/auth/login/staff`
 - `POST /api/auth/register`
 - `GET  /api/auth/me` *(requiere JWT)*
 
 ### Password reset
 
 - `POST /api/auth/forgot-password`
   - body: `{ "email": "..." }`
   - header: `x-company-id: 1`
   - responde 200 siempre (no revela si el email existe)
 
 ### Tickets
 
 El módulo `tickets` expone rutas para portal de usuario y staff (ver `backend/src/modules/tickets`).
 
 ## Probar con Postman
 
 Para endpoints bajo `/api` recuerda enviar:
 
 - `Content-Type: application/json`
 - `x-company-id: 1`
 - `Authorization: Bearer <token>` (para rutas protegidas)
 
 Ejemplo (forgot-password):
 
 - `POST http://localhost:3001/api/auth/forgot-password`
 - body:
 
 ```json
 { "email": "test@example.com" }
 ```
 
 ## Seguridad
 
 - No subas `.env` al repositorio.
 - Si un `.env` se publicó por error, rota inmediatamente:
   - `JWT_SECRET`
   - credenciales SMTP
   - credenciales de DB