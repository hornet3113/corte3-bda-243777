-- =============================================
-- TRIGGERS · Clínica Veterinaria · Corte 3
-- =============================================

-- Función que ejecuta el trigger
CREATE OR REPLACE FUNCTION fn_registrar_historial_cita()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO historial_movimientos (tipo, referencia_id, descripcion, fecha)
    VALUES (
        'CITA_AGENDADA',
        NEW.id,
        FORMAT(
            'Cita agendada para mascota_id=%s con veterinario_id=%s el %s. Motivo: %s',
            NEW.mascota_id,
            NEW.veterinario_id,
            NEW.fecha_hora,
            COALESCE(NEW.motivo, 'Sin motivo especificado')
        ),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Trigger que llama a la función después de cada INSERT en citas
DROP TRIGGER IF EXISTS trg_historial_cita ON citas;

CREATE TRIGGER trg_historial_cita
    AFTER INSERT ON citas
    FOR EACH ROW
    EXECUTE FUNCTION fn_registrar_historial_cita();