-- =============================================
-- ROLES Y PERMISOS · Clínica Veterinaria · Corte 3
-- =============================================

-- -----------------------------------------------
-- 1. Crear los roles base
-- -----------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_veterinario') THEN
        CREATE ROLE rol_veterinario;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_recepcion') THEN
        CREATE ROLE rol_recepcion;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_admin') THEN
        CREATE ROLE rol_admin;
    END IF;
END
$$;

-- -----------------------------------------------
-- 2. Permisos para rol_veterinario
-- Puede ver y operar solo sobre lo médico
-- que le corresponde (RLS filtra el resto)
-- -----------------------------------------------
GRANT CONNECT ON DATABASE clinica_vet TO rol_veterinario;
GRANT USAGE ON SCHEMA public TO rol_veterinario;

GRANT SELECT ON mascotas TO rol_veterinario;
GRANT SELECT ON duenos TO rol_veterinario;
GRANT SELECT, INSERT ON citas TO rol_veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO rol_veterinario;
GRANT SELECT ON inventario_vacunas TO rol_veterinario;
GRANT SELECT ON veterinarios TO rol_veterinario;
GRANT SELECT ON vet_atiende_mascota TO rol_veterinario;
GRANT SELECT ON historial_movimientos TO rol_veterinario;

-- Necesita usar las secuencias para INSERT
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO rol_veterinario;
GRANT USAGE, SELECT ON SEQUENCE vacunas_aplicadas_id_seq TO rol_veterinario;

-- -----------------------------------------------
-- 3. Permisos para rol_recepcion
-- Ve datos de contacto, agenda citas
-- NO ve información médica (vacunas, historial)
-- -----------------------------------------------
GRANT CONNECT ON DATABASE clinica_vet TO rol_recepcion;
GRANT USAGE ON SCHEMA public TO rol_recepcion;

GRANT SELECT ON mascotas TO rol_recepcion;
GRANT SELECT ON duenos TO rol_recepcion;
GRANT SELECT, INSERT ON citas TO rol_recepcion;
GRANT SELECT ON inventario_vacunas TO rol_recepcion;
GRANT SELECT ON veterinarios TO rol_recepcion;
GRANT SELECT ON vet_atiende_mascota TO rol_recepcion;

-- Necesita usar la secuencia para INSERT en citas
GRANT USAGE, SELECT ON SEQUENCE citas_id_seq TO rol_recepcion;

-- -----------------------------------------------
-- 4. Permisos para rol_admin
-- Ve y hace todo
-- -----------------------------------------------
GRANT CONNECT ON DATABASE clinica_vet TO rol_admin;
GRANT USAGE ON SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- -----------------------------------------------
-- 5. Crear usuarios y asignarles su rol
-- -----------------------------------------------

-- Veterinarios
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_lopez') THEN
        CREATE USER vet_lopez WITH PASSWORD 'vet123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_garcia') THEN
        CREATE USER vet_garcia WITH PASSWORD 'vet123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vet_mendez') THEN
        CREATE USER vet_mendez WITH PASSWORD 'vet123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'recepcion1') THEN
        CREATE USER recepcion1 WITH PASSWORD 'rec123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin1') THEN
        CREATE USER admin1 WITH PASSWORD 'admin123';
    END IF;
END
$$;

-- Asignar roles a usuarios
GRANT rol_veterinario TO vet_lopez;
GRANT rol_veterinario TO vet_garcia;
GRANT rol_veterinario TO vet_mendez;
GRANT rol_recepcion TO recepcion1;
GRANT rol_admin TO admin1;



-- -----------------------------------------------
-- 6. Usuario de aplicación (para la capa API)
-- Conecta como este usuario, cambia de rol via SET LOCAL ROLE
-- No es superusuario, por eso respeta RLS
-- -----------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE USER app_user WITH PASSWORD 'app123';
    END IF;
END
$$;

GRANT rol_veterinario TO app_user;
GRANT rol_recepcion TO app_user;
GRANT rol_admin TO app_user;
GRANT CONNECT ON DATABASE clinica_vet TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;