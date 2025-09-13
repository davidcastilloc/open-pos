-- Crear tabla de usuarios/cajeros
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text DEFAULT 'cashier' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índices únicos
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- Insertar usuario por defecto
INSERT OR IGNORE INTO `users` (
	`id`,
	`username`,
	`email`,
	`first_name`,
	`last_name`,
	`role`,
	`is_active`,
	`password_hash`,
	`created_at`,
	`updated_at`
) VALUES (
	'admin-user-001',
	'admin',
	'admin@pos.local',
	'Administrador',
	'Sistema',
	'admin',
	1,
	'default_hash',
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP
);
