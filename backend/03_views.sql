-- =============================================
-- VIEWS Y FUNCTIONS · Clínica Veterinaria · Corte 3
-- =============================================

-- Function: total facturado por mascota en un año
CREATE OR REPLACE FUNCTION fn_total_facturado(
    p_mascota_id INT,
    p_anio       INT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(costo), 0)
    INTO v_total
    FROM citas
    WHERE mascota_id = p_mascota_id
    AND EXTRACT(YEAR FROM fecha_hora) = p_anio
    AND estado = 'COMPLETADA';

    RETURN v_total;
END;
$$;

-- Vista: mascotas con vacunación pendiente
CREATE OR REPLACE VIEW v_mascotas_vacunacion_pendiente AS
SELECT
    m.id            AS mascota_id,
    m.nombre        AS mascota_nombre,
    m.especie,
    d.nombre        AS dueno_nombre,
    d.telefono      AS dueno_telefono,
    iv.id           AS vacuna_id,
    iv.nombre       AS vacuna_nombre,
    iv.stock_actual
FROM mascotas m
JOIN duenos d ON d.id = m.dueno_id
JOIN inventario_vacunas iv ON iv.stock_actual > 0
WHERE NOT EXISTS (
    SELECT 1
    FROM vacunas_aplicadas va
    WHERE va.mascota_id = m.id
    AND va.vacuna_id = iv.id
    AND va.fecha_aplicacion >= CURRENT_DATE - INTERVAL '1 year'
)
ORDER BY m.nombre, iv.nombre;