-- =============================================
-- PROCEDURES · Clínica Veterinaria · Corte 3
-- =============================================

CREATE OR REPLACE PROCEDURE sp_agendar_cita(
    p_mascota_id     INT,
    p_veterinario_id INT,
    p_fecha_hora     TIMESTAMP,
    p_motivo         TEXT,
    OUT p_cita_id    INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_vet_activo     BOOLEAN;
    v_mascota_existe BOOLEAN;
    v_conflicto      BOOLEAN;
BEGIN
    -- 1. Verificar que la mascota existe
    SELECT EXISTS (
        SELECT 1 FROM mascotas WHERE id = p_mascota_id
    ) INTO v_mascota_existe;

    IF NOT v_mascota_existe THEN
        RAISE EXCEPTION 'La mascota con id % no existe', p_mascota_id;
    END IF;

    -- 2. Verificar que el veterinario existe y está activo
    SELECT activo INTO v_vet_activo
    FROM veterinarios
    WHERE id = p_veterinario_id;

    IF v_vet_activo IS NULL THEN
        RAISE EXCEPTION 'El veterinario con id % no existe', p_veterinario_id;
    END IF;

    IF NOT v_vet_activo THEN
        RAISE EXCEPTION 'El veterinario con id % no está activo', p_veterinario_id;
    END IF;

    -- 3. Verificar que no haya conflicto de horario
    SELECT EXISTS (
        SELECT 1 FROM citas
        WHERE veterinario_id = p_veterinario_id
        AND fecha_hora = p_fecha_hora
        AND estado != 'CANCELADA'
    ) INTO v_conflicto;

    IF v_conflicto THEN
        RAISE EXCEPTION 'El veterinario ya tiene una cita agendada para esa fecha y hora';
    END IF;

    -- 4. Insertar la cita
    INSERT INTO citas (mascota_id, veterinario_id, fecha_hora, motivo, estado)
    VALUES (p_mascota_id, p_veterinario_id, p_fecha_hora, p_motivo, 'AGENDADA')
    RETURNING id INTO p_cita_id;

END;
$$;