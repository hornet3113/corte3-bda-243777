-- Primero eliminar las políticas existentes
DROP POLICY IF EXISTS pol_mascotas_veterinario ON mascotas;
DROP POLICY IF EXISTS pol_mascotas_recepcion ON mascotas;
DROP POLICY IF EXISTS pol_mascotas_admin ON mascotas;

DROP POLICY IF EXISTS pol_citas_veterinario ON citas;
DROP POLICY IF EXISTS pol_citas_recepcion ON citas;
DROP POLICY IF EXISTS pol_citas_admin ON citas;

DROP POLICY IF EXISTS pol_vacunas_veterinario ON vacunas_aplicadas;
DROP POLICY IF EXISTS pol_vacunas_admin ON vacunas_aplicadas;

-- -----------------------------------------------
-- TABLA: mascotas
-- -----------------------------------------------
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_mascotas_veterinario
    ON mascotas
    FOR SELECT
    TO rol_veterinario
    USING (
        NULLIF(current_setting('app.current_vet_id', true), '') IS NOT NULL
        AND
        id IN (
            SELECT mascota_id
            FROM vet_atiende_mascota
            WHERE vet_id = NULLIF(current_setting('app.current_vet_id', true), '')::INT
            AND activa = true
        )
    );

CREATE POLICY pol_mascotas_recepcion
    ON mascotas
    FOR SELECT
    TO rol_recepcion
    USING (true);

CREATE POLICY pol_mascotas_admin
    ON mascotas
    FOR ALL
    TO rol_admin
    USING (true);

-- -----------------------------------------------
-- TABLA: citas
-- -----------------------------------------------
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_citas_veterinario
    ON citas
    FOR ALL
    TO rol_veterinario
    USING (
        NULLIF(current_setting('app.current_vet_id', true), '') IS NOT NULL
        AND
        veterinario_id = NULLIF(current_setting('app.current_vet_id', true), '')::INT
    );

CREATE POLICY pol_citas_recepcion
    ON citas
    FOR ALL
    TO rol_recepcion
    USING (true)
    WITH CHECK (true);

CREATE POLICY pol_citas_admin
    ON citas
    FOR ALL
    TO rol_admin
    USING (true);

-- -----------------------------------------------
-- TABLA: vacunas_aplicadas
-- -----------------------------------------------
ALTER TABLE vacunas_aplicadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_vacunas_veterinario
    ON vacunas_aplicadas
    FOR ALL
    TO rol_veterinario
    USING (
        NULLIF(current_setting('app.current_vet_id', true), '') IS NOT NULL
        AND
        mascota_id IN (
            SELECT mascota_id
            FROM vet_atiende_mascota
            WHERE vet_id = NULLIF(current_setting('app.current_vet_id', true), '')::INT
            AND activa = true
        )
    );

CREATE POLICY pol_vacunas_admin
    ON vacunas_aplicadas
    FOR ALL
    TO rol_admin
    USING (true);