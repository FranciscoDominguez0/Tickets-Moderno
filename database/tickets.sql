-- ============================================================
-- HELPDESK SAAS - BASE DE DATOS OPTIMIZADA
-- Motor: MySQL 8 / MariaDB 10.6+
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Versión: 2.0 - Multitenant SaaS
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================================
-- DOMINIO 1: SAAS — Empresas y Pagos
-- ============================================================

CREATE TABLE `empresas` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`               VARCHAR(255) NOT NULL,
  `subdomain`            VARCHAR(100) NOT NULL,
  `estado`               ENUM('activa','suspendida','bloqueada') NOT NULL DEFAULT 'activa',
  `precio_mensual`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `fecha_inicio_servicio` DATE DEFAULT NULL,
  `fecha_vencimiento`    DATE DEFAULT NULL,
  `dias_gracia`          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `estado_pago`          ENUM('al_dia','vencido','suspendido') NOT NULL DEFAULT 'al_dia',
  `bloqueada`            TINYINT(1) NOT NULL DEFAULT 0,
  `motivo_bloqueo`       VARCHAR(255) DEFAULT NULL,
  `created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_empresas_subdomain` (`subdomain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Empresas del SaaS (multitenant root)';

-- ----------------------------------------------------------------

CREATE TABLE `pagos_empresas` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`    INT UNSIGNED NOT NULL,
  `monto`         DECIMAL(10,2) NOT NULL,
  `fecha_pago`    DATE NOT NULL,
  `fecha_inicio`  DATE DEFAULT NULL,
  `fecha_fin`     DATE DEFAULT NULL,
  `metodo`        VARCHAR(50) DEFAULT NULL COMMENT 'yappy, transferencia, efectivo...',
  `referencia`    VARCHAR(100) DEFAULT NULL,
  `notas`         TEXT DEFAULT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pagos_empresa` (`empresa_id`),
  CONSTRAINT `fk_pagos_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de pagos por empresa';

-- ----------------------------------------------------------------

CREATE TABLE `billing_notice_log` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`        INT UNSIGNED NOT NULL,
  `days_before`       TINYINT NOT NULL,
  `fecha_vencimiento` DATE NOT NULL,
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_billing_empresa` (`empresa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Log de avisos de vencimiento enviados (evitar duplicados)';

-- ============================================================
-- DOMINIO 2: USUARIOS (clientes que crean tickets)
-- ============================================================

CREATE TABLE `users` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `firstname`   VARCHAR(100) NOT NULL,
  `lastname`    VARCHAR(100) NOT NULL,
  `email`       VARCHAR(255) NOT NULL,
  `password`    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  `phone`       VARCHAR(30) DEFAULT NULL,
  `status`      ENUM('active','banned','inactive') NOT NULL DEFAULT 'active',
  `timezone`    VARCHAR(60) DEFAULT 'America/Panama',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email_empresa` (`empresa_id`, `email`),
  KEY `idx_users_empresa` (`empresa_id`),
  CONSTRAINT `fk_users_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios/clientes del helpdesk';

ALTER TABLE users 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

ALTER TABLE users ADD COLUMN last_login DATETIME NULL;
-- ----------------------------------------------------------------

CREATE TABLE `user_login_attempts` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`   INT UNSIGNED NOT NULL,
  `email`        VARCHAR(255) NOT NULL,
  `ip`           VARCHAR(45) DEFAULT NULL,
  `attempts`     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ula_empresa_email` (`empresa_id`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------

CREATE TABLE `user_password_resets` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `user_id`     INT UNSIGNED NOT NULL,
  `token_hash`  CHAR(64) NOT NULL,
  `expires_at`  DATETIME NOT NULL,
  `used_at`     DATETIME DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_upr_token` (`token_hash`),
  CONSTRAINT `fk_upr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- DOMINIO 3: STAFF (agentes, supervisores, admins, superadmins)
-- ================================================================

CREATE TABLE `staff` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `username`    VARCHAR(100) NOT NULL,
  `email`       VARCHAR(255) NOT NULL,
  `password`    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  `firstname`   VARCHAR(100) NOT NULL,
  `lastname`    VARCHAR(100) NOT NULL,
  `dept_id`     INT UNSIGNED DEFAULT NULL,
  `role`        ENUM('agent','supervisor','admin','superadmin') NOT NULL DEFAULT 'agent',
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `signature`   TEXT DEFAULT NULL,
  `last_login`  DATETIME DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_username` (`empresa_id`, `username`),
  UNIQUE KEY `uq_staff_email` (`empresa_id`, `email`),
  KEY `idx_staff_empresa` (`empresa_id`),
  KEY `idx_staff_dept` (`dept_id`),
  CONSTRAINT `fk_staff_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Personal del helpdesk (agentes, admins, superadmins)';

-- ----------------------------------------------------------------

CREATE TABLE `staff_login_attempts` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`   INT UNSIGNED NOT NULL,
  `username`     VARCHAR(100) NOT NULL,
  `ip`           VARCHAR(45) DEFAULT NULL,
  `attempts`     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sla_empresa_user` (`empresa_id`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------

CREATE TABLE `staff_password_resets` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `staff_id`    INT UNSIGNED NOT NULL,
  `token_hash`  CHAR(64) NOT NULL,
  `expires_at`  DATETIME NOT NULL,
  `used_at`     DATETIME DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_spr_token` (`token_hash`),
  CONSTRAINT `fk_spr_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- DOMINIO 4: ESTRUCTURA ORGANIZACIONAL
-- ================================================================

CREATE TABLE `departments` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`       INT UNSIGNED NOT NULL,
  `name`             VARCHAR(100) NOT NULL,
  `description`      TEXT DEFAULT NULL,
  `default_staff_id` INT UNSIGNED DEFAULT NULL COMMENT 'Agente por defecto al abrir ticket',
  `is_active`        TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dept_empresa` (`empresa_id`),
  CONSTRAINT `fk_dept_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Departamentos de soporte por empresa';

-- ----------------------------------------------------------------

CREATE TABLE `help_topics` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `dept_id`     INT UNSIGNED DEFAULT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_topics_empresa` (`empresa_id`),
  KEY `idx_topics_dept` (`dept_id`),
  CONSTRAINT `fk_topics_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_topics_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Temas/categorías de tickets';

-- ----------------------------------------------------------------

CREATE TABLE `priorities` (
  `id`    TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(50) NOT NULL,
  `level` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=baja 2=normal 3=alta 4=urgente',
  `color` VARCHAR(20) NOT NULL DEFAULT '#3498db',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Prioridades (globales, sin empresa_id - son fijas)';

INSERT INTO `priorities` (`id`, `name`, `level`, `color`) VALUES
(1, 'Baja',    1, '#3498db'),
(2, 'Normal',  2, '#2ecc71'),
(3, 'Alta',    3, '#f39c12'),
(4, 'Urgente', 4, '#e74c3c');

-- ----------------------------------------------------------------

CREATE TABLE `ticket_status` (
  `id`          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50) NOT NULL,
  `state`       ENUM('open','pending','resolved','closed') NOT NULL,
  `color`       VARCHAR(20) DEFAULT '#888888',
  `sort_order`  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados posibles de un ticket (globales)';

INSERT INTO `ticket_status` (`id`, `name`, `state`, `color`, `sort_order`) VALUES
(1, 'Abierto',    'open',     '#e74c3c', 1),
(2, 'Pendiente',  'pending',  '#f39c12', 2),
(3, 'Resuelto',   'resolved', '#2ecc71', 3),
(4, 'Cerrado',    'closed',   '#95a5a6', 4),
(5, 'Cancelado',  'closed',   '#bdc3c7', 5);

-- ================================================================
-- DOMINIO 5: ROLES Y PERMISOS
-- ================================================================

CREATE TABLE `roles` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `is_enabled`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_roles_empresa` (`empresa_id`),
  CONSTRAINT `fk_roles_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------

CREATE TABLE `role_permissions` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `role_name`   VARCHAR(100) NOT NULL,
  `perm_key`    VARCHAR(120) NOT NULL COMMENT 'ej: ticket.reply, task.assign',
  `is_enabled`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_perm` (`empresa_id`, `role_name`, `perm_key`),
  KEY `idx_rp_empresa_role` (`empresa_id`, `role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos granulares por rol y empresa';

-- ================================================================
-- DOMINIO 6: TICKETS (núcleo del sistema)
-- ================================================================

CREATE TABLE `sequences` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `next`        BIGINT UNSIGNED NOT NULL DEFAULT 1,
  `increment`   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `padding`     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_seq_empresa` (`empresa_id`),
  CONSTRAINT `fk_seq_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Secuencias para numeración de tickets y tareas';

-- ----------------------------------------------------------------

CREATE TABLE `tickets` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(20) NOT NULL,
  `empresa_id`    INT UNSIGNED NOT NULL,
  `user_id`       INT UNSIGNED NOT NULL,
  `staff_id`      INT UNSIGNED DEFAULT NULL COMMENT 'Agente asignado',
  `dept_id`       INT UNSIGNED NOT NULL,
  `topic_id`      INT UNSIGNED DEFAULT NULL,
  `priority_id`   TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `status_id`     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `subject`       VARCHAR(255) NOT NULL,
  `source`        ENUM('web','email','api','phone') NOT NULL DEFAULT 'web',
  `ip_address`    VARCHAR(45) DEFAULT NULL,
  `closed_at`     DATETIME DEFAULT NULL,
  `due_at`        DATETIME DEFAULT NULL COMMENT 'SLA deadline',
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_number_empresa` (`empresa_id`, `ticket_number`),
  KEY `idx_tickets_empresa`  (`empresa_id`),
  KEY `idx_tickets_user`     (`user_id`),
  KEY `idx_tickets_staff`    (`staff_id`),
  KEY `idx_tickets_dept`     (`dept_id`),
  KEY `idx_tickets_status`   (`status_id`),
  KEY `idx_tickets_priority` (`priority_id`),
  CONSTRAINT `fk_tickets_empresa`  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user`     FOREIGN KEY (`user_id`)    REFERENCES `users`        (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_staff`    FOREIGN KEY (`staff_id`)   REFERENCES `staff`        (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tickets_dept`     FOREIGN KEY (`dept_id`)    REFERENCES `departments`  (`id`),
  CONSTRAINT `fk_tickets_topic`    FOREIGN KEY (`topic_id`)   REFERENCES `help_topics`  (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tickets_priority` FOREIGN KEY (`priority_id`) REFERENCES `priorities`  (`id`),
  CONSTRAINT `fk_tickets_status`   FOREIGN KEY (`status_id`)  REFERENCES `ticket_status`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tickets del helpdesk';

-- ----------------------------------------------------------------

CREATE TABLE `threads` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id`   INT UNSIGNED NOT NULL,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_thread_ticket` (`ticket_id`),
  KEY `idx_threads_empresa` (`empresa_id`),
  CONSTRAINT `fk_threads_ticket`  FOREIGN KEY (`ticket_id`)  REFERENCES `tickets`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_threads_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Hilo de conversación por ticket (1 a 1)';

-- ----------------------------------------------------------------

CREATE TABLE `thread_entries` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id`   INT UNSIGNED NOT NULL,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `user_id`     INT UNSIGNED DEFAULT NULL COMMENT 'NULL si escribió un agente',
  `staff_id`    INT UNSIGNED DEFAULT NULL COMMENT 'NULL si escribió un usuario',
  `body`        LONGTEXT NOT NULL,
  `is_internal` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=nota interna, solo visible para staff',
  `is_read`     TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Leída por el destinatario',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_te_thread`   (`thread_id`),
  KEY `idx_te_empresa`  (`empresa_id`),
  KEY `idx_te_user`     (`user_id`),
  KEY `idx_te_staff`    (`staff_id`),
  CONSTRAINT `fk_te_thread`   FOREIGN KEY (`thread_id`)  REFERENCES `threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_te_empresa`  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_te_user`     FOREIGN KEY (`user_id`)    REFERENCES `users`   (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_te_staff`    FOREIGN KEY (`staff_id`)   REFERENCES `staff`   (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mensajes dentro de un ticket';

-- ----------------------------------------------------------------

CREATE TABLE `attachments` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_entry_id`  INT UNSIGNED NOT NULL,
  `empresa_id`       INT UNSIGNED NOT NULL,
  `filename`         VARCHAR(255) NOT NULL COMMENT 'Nombre generado en servidor',
  `original_filename` VARCHAR(255) DEFAULT NULL,
  `mimetype`         VARCHAR(100) DEFAULT NULL,
  `size`             INT UNSIGNED DEFAULT NULL COMMENT 'Bytes',
  `path`             VARCHAR(500) DEFAULT NULL,
  `hash`             VARCHAR(64) DEFAULT NULL COMMENT 'SHA-256 para deduplicación',
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_attach_entry`   (`thread_entry_id`),
  KEY `idx_attach_empresa` (`empresa_id`),
  CONSTRAINT `fk_attach_entry`  FOREIGN KEY (`thread_entry_id`) REFERENCES `thread_entries`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attach_empresa` FOREIGN KEY (`empresa_id`)     REFERENCES `empresas`      (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Archivos adjuntos de mensajes';

-- ----------------------------------------------------------------

CREATE TABLE `staff_ticket_seen` (
  `staff_id`  INT UNSIGNED NOT NULL,
  `ticket_id` INT UNSIGNED NOT NULL,
  `seen_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_id`, `ticket_id`),
  KEY `idx_seen_ticket` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de tickets vistos por agentes (badge unread)';

-- ================================================================
-- DOMINIO 7: NOTAS DE USUARIO
-- ================================================================

CREATE TABLE `user_notes` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `user_id`     INT UNSIGNED NOT NULL,
  `staff_id`    INT UNSIGNED DEFAULT NULL,
  `note`        TEXT NOT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notes_empresa` (`empresa_id`),
  KEY `idx_notes_user`    (`user_id`),
  CONSTRAINT `fk_notes_user`  FOREIGN KEY (`user_id`)  REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notas internas sobre un usuario (visibles solo para staff)';

-- ================================================================
-- DOMINIO 8: TAREAS INTERNAS
-- ================================================================

CREATE TABLE `tasks` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_number`  VARCHAR(20) DEFAULT NULL,
  `empresa_id`   INT UNSIGNED NOT NULL,
  `dept_id`      INT UNSIGNED NOT NULL,
  `created_by`   INT UNSIGNED DEFAULT NULL,
  `assigned_to`  INT UNSIGNED DEFAULT NULL,
  `title`        VARCHAR(255) NOT NULL,
  `description`  TEXT DEFAULT NULL,
  `status`       ENUM('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `priority`     ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `due_date`     DATETIME DEFAULT NULL,
  `closed_at`    DATETIME DEFAULT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_empresa`      (`empresa_id`),
  KEY `idx_tasks_dept`         (`dept_id`),
  KEY `idx_tasks_assigned`     (`assigned_to`),
  KEY `idx_tasks_created_by`   (`created_by`),
  CONSTRAINT `fk_tasks_empresa`     FOREIGN KEY (`empresa_id`) REFERENCES `empresas`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_dept`        FOREIGN KEY (`dept_id`)    REFERENCES `departments` (`id`),
  CONSTRAINT `fk_tasks_assigned`    FOREIGN KEY (`assigned_to`) REFERENCES `staff`      (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_created_by`  FOREIGN KEY (`created_by`) REFERENCES `staff`       (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tareas internas del equipo';

-- ================================================================
-- DOMINIO 9: NOTIFICACIONES
-- ================================================================

CREATE TABLE `user_notifications` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`      INT UNSIGNED NOT NULL,
  `user_id`         INT UNSIGNED NOT NULL,
  `type`            VARCHAR(60) NOT NULL COMMENT 'ticket_created, ticket_replied...',
  `message`         TEXT NOT NULL,
  `ticket_id`       INT UNSIGNED DEFAULT NULL,
  `thread_entry_id` INT UNSIGNED DEFAULT NULL,
  `is_read`         TINYINT(1) NOT NULL DEFAULT 0,
  `read_at`         DATETIME DEFAULT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_unotif_user`    (`user_id`),
  KEY `idx_unotif_empresa` (`empresa_id`),
  KEY `idx_unotif_unread`  (`user_id`, `is_read`),
  CONSTRAINT `fk_unotif_user`    FOREIGN KEY (`user_id`)   REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_unotif_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notificaciones para usuarios (clientes)';

-- ----------------------------------------------------------------

CREATE TABLE `staff_notifications` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `staff_id`    INT UNSIGNED NOT NULL,
  `type`        VARCHAR(60) NOT NULL,
  `message`     TEXT NOT NULL,
  `ticket_id`   INT UNSIGNED DEFAULT NULL,
  `task_id`     INT UNSIGNED DEFAULT NULL,
  `is_read`     TINYINT(1) NOT NULL DEFAULT 0,
  `read_at`     DATETIME DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_snotif_staff`   (`staff_id`),
  KEY `idx_snotif_empresa` (`empresa_id`),
  KEY `idx_snotif_unread`  (`staff_id`, `is_read`),
  CONSTRAINT `fk_snotif_staff`   FOREIGN KEY (`staff_id`)  REFERENCES `staff`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_snotif_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notificaciones para agentes/staff';

-- ================================================================
-- DOMINIO 10: CONFIGURACIÓN DE CORREO
-- ================================================================

CREATE TABLE `email_accounts` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`   INT UNSIGNED NOT NULL,
  `name`         VARCHAR(100) DEFAULT NULL,
  `email`        VARCHAR(255) NOT NULL,
  `dept_id`      INT UNSIGNED DEFAULT NULL,
  `priority`     ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
  `is_default`   TINYINT(1) NOT NULL DEFAULT 0,
  `smtp_host`    VARCHAR(255) DEFAULT NULL,
  `smtp_port`    SMALLINT UNSIGNED DEFAULT NULL,
  `smtp_secure`  ENUM('ssl','tls','') DEFAULT NULL,
  `smtp_user`    VARCHAR(255) DEFAULT NULL,
  `smtp_pass`    VARCHAR(255) DEFAULT NULL COMMENT 'Encrypted at application level',
  `is_active`    TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_accounts_empresa` (`empresa_id`),
  CONSTRAINT `fk_email_accounts_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_email_accounts_dept`    FOREIGN KEY (`dept_id`)    REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cuentas SMTP por empresa';

-- ================================================================
-- DOMINIO 11: SEGURIDAD / BANLIST
-- ================================================================

CREATE TABLE `banlist` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `email`       VARCHAR(255) DEFAULT NULL,
  `domain`      VARCHAR(255) DEFAULT NULL,
  `notes`       TEXT DEFAULT NULL,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banlist_empresa` (`empresa_id`),
  KEY `idx_banlist_email`   (`email`),
  CONSTRAINT `fk_banlist_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Emails y dominios bloqueados por empresa';

-- ================================================================
-- DOMINIO 12: CONFIGURACIÓN GENERAL
-- ================================================================

CREATE TABLE `app_settings` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `key`         VARCHAR(191) NOT NULL,
  `value`       LONGTEXT DEFAULT NULL,
  `updated_at`  DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_empresa_key` (`empresa_id`, `key`),
  KEY `idx_settings_empresa` (`empresa_id`),
  CONSTRAINT `fk_settings_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración clave-valor por empresa';

-- ================================================================
-- DOMINIO 13: LOGS DE ACTIVIDAD
-- ================================================================

CREATE TABLE `logs` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `object_type` VARCHAR(50) DEFAULT NULL,
  `object_id`   INT UNSIGNED DEFAULT NULL,
  `user_type`   ENUM('user','staff') DEFAULT NULL,
  `user_id`     INT UNSIGNED DEFAULT NULL,
  `details`     TEXT DEFAULT NULL,
  `ip_address`  VARCHAR(45) DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_empresa`     (`empresa_id`),
  KEY `idx_logs_user`        (`user_type`, `user_id`),
  KEY `idx_logs_object`      (`object_type`, `object_id`),
  KEY `idx_logs_created`     (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Auditoría de acciones del sistema';

-- ================================================================
-- DATOS SEMILLA (seed)
-- ================================================================

-- Empresa demo
INSERT INTO `empresas` (`id`, `nombre`, `subdomain`, `estado`, `precio_mensual`, `fecha_inicio_servicio`, `fecha_vencimiento`, `estado_pago`)
VALUES (1, 'Demo Company', 'demo', 'activa', 0.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'al_dia');

-- Departamentos demo
INSERT INTO `departments` (`id`, `empresa_id`, `name`, `description`) VALUES
(1, 1, 'Soporte Técnico',  'Problemas técnicos y troubleshooting'),
(2, 1, 'Ventas',           'Información sobre productos y presupuestos'),
(3, 1, 'Facturación',      'Facturas, pagos y cobros'),
(4, 1, 'Recursos Humanos', 'Consultas internas de RRHH'),
(5, 1, 'General',          'Otros asuntos');

-- Temas demo
INSERT INTO `help_topics` (`id`, `empresa_id`, `dept_id`, `name`) VALUES
(1, 1, 1, 'Problemas técnicos'),
(2, 1, 2, 'Consulta de ventas'),
(3, 1, 3, 'Pagos y facturas'),
(4, 1, 4, 'Recursos Humanos'),
(5, 1, 5, 'Otro');

-- Roles demo
INSERT INTO `roles` (`id`, `empresa_id`, `name`) VALUES
(1, 1, 'admin'),
(2, 1, 'agent');

-- Secuencia de tickets
INSERT INTO `sequences` (`empresa_id`, `name`, `next`, `increment`, `padding`, `created_at`) VALUES
(1, 'Tickets', 1, 1, 6, NOW());

-- Admin superadmin (password: Admin123 — cambiar en producción)
INSERT INTO `staff` (`empresa_id`, `username`, `email`, `password`, `firstname`, `lastname`, `role`, `dept_id`) VALUES
(1, 'superadmin', 'superadmin@demo.local', '$2b$12$placeholder_change_in_prod', 'Super', 'Admin', 'superadmin', NULL);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================