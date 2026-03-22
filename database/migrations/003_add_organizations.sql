-- ================================================================
-- TABLA: organizations
-- ================================================================

CREATE TABLE `organizations` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id`  INT UNSIGNED NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `address`     TEXT DEFAULT NULL,
  `phone`       VARCHAR(50) DEFAULT NULL,
  `phone_ext`   VARCHAR(20) DEFAULT NULL,
  `website`     VARCHAR(255) DEFAULT NULL,
  `notes`       TEXT DEFAULT NULL,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_org_empresa` (`empresa_id`),
  CONSTRAINT `fk_org_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Organizaciones/empresas clientes agrupadas por tenant';

-- ================================================================
-- ALTER TABLE users: agregar organization_id
-- ================================================================

ALTER TABLE `users`
  ADD COLUMN `organization_id` INT UNSIGNED DEFAULT NULL
    COMMENT 'Organización a la que pertenece (nullable)',
  ADD KEY `idx_users_org` (`organization_id`),
  ADD CONSTRAINT `fk_users_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
    ON DELETE SET NULL;
```

---

Y los endpoints completos para que fluya exactamente como describiste:
```
GET    /api/admin/organizations                         → Listar orgs de la empresa
POST   /api/admin/organizations                         → Crear organización
GET    /api/admin/organizations/:id                     → Ver org + sus usuarios
GET    /api/admin/organizations/:id/tickets             → Tickets de todos sus usuarios
PATCH  /api/admin/organizations/:id                     → Editar organización
DELETE /api/admin/organizations/:id                     → Eliminar (users quedan libres)

POST   /api/admin/organizations/:id/users               → Vincular usuario a org
DELETE /api/admin/organizations/:id/users/:userId       → Desvincular usuario

PATCH  /api/staff/users/:id/organization                → Asignar/cambiar org a un usuario