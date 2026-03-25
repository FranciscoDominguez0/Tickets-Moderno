import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { tenantMiddleware } from "../../middleware/tenant.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

import {
  getTicketsForUserController,
  getTicketsForAgentController,
} from "./ticket.controller.js";

// ─────────────────────────────────────────────
// Router de USUARIOS
// ─────────────────────────────────────────────
export const ticketUserRouter = Router();

ticketUserRouter.use(
  tenantMiddleware,
  requireAuth,
  requireRole("user")
);

ticketUserRouter.get("/tickets", getTicketsForUserController);

// ─────────────────────────────────────────────
//  Router de AGENTES / ADMIN
// ─────────────────────────────────────────────
export const ticketAgentRouter = Router();

ticketAgentRouter.use(
  tenantMiddleware,
  requireAuth,
  requireRole("agent", "admin", "superadmin")
);

ticketAgentRouter.get("/tickets", getTicketsForAgentController);