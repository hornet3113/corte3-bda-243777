# Sistema de Clínica Veterinaria — Corte 3
**Base de Datos Avanzadas · Universidad Politécnica de Chiapas**  
**Alumno:** Alix Montesinos Grajales 
**Matrícula:** 243777  
**Stack:** Next.js (TypeScript) · PostgreSQL 15 · Redis 7 · Docker

---

## ¿Qué hace este sistema?

Sistema full-stack de gestión para una clínica veterinaria con tres tipos de
usuario (veterinario, recepción, administrador), seguridad por roles y
Row-Level Security en PostgreSQL, caché con Redis, y hardening contra
SQL Injection en toda la capa HTTP.

---

## Stack y estructura

- **Frontend + API:** Next.js 15 con TypeScript (Pages Router + API Routes)
- **Base de datos:** PostgreSQL 15
- **Caché:** Redis 7
- **Contenedores:** Docker Compose

```
corte3-bda-{matricula}/
├── README.md
├── cuaderno_ataques.md
├── schema_corte3.sql
├── docker-compose.yml
├── backend/
│   ├── 01_procedures.sql
│   ├── 02_triggers.sql
│   ├── 03_views.sql
│   ├── 04_roles_y_permisos.sql
│   └── 05_rls.sql
└── app/  ← proyecto Next.js
    ├── pages/
    │   ├── index.tsx        (login)
    │   ├── mascotas.tsx     (búsqueda)
    │   └── vacunacion.tsx   (vacunación pendiente)
    └── pages/api/
        ├── mascotas.ts
        ├── vacunacion.ts
        ├── citas.ts
        └── vacunas.ts
```

---

## Cómo levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/corte3-bda-{matricula}
cd corte3-bda-{matricula}

# 2. Levantar PostgreSQL y Redis
docker-compose up -d postgres redis

# 3. Cargar los archivos SQL en orden
docker exec -i clinica_postgres psql -U admin -d clinica_vet < backend/01_procedures.sql
docker exec -i clinica_postgres psql -U admin -d clinica_vet < backend/02_triggers.sql
docker exec -i clinica_postgres psql -U admin -d clinica_vet < backend/03_views.sql
docker exec -i clinica_postgres psql -U admin -d clinica_vet < backend/04_roles_y_permisos.sql
docker exec -i clinica_postgres psql -U admin -d clinica_vet < backend/05_rls.sql

# 4. Instalar dependencias y correr la app
cd app
npm install
npm run dev
```

---

## Decisiones de diseño

### Pregunta 1 — ¿Qué política RLS aplicaste a la tabla mascotas?

La política aplicada es:

```sql
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
```

Lo que hace: cuando un usuario con `rol_veterinario` consulta la tabla
`mascotas`, PostgreSQL evalúa la cláusula `USING` por cada fila antes
de devolverla. Solo devuelve las filas donde el `id` de la mascota aparece
en `vet_atiende_mascota` asociado al veterinario actual. El veterinario
actual se identifica mediante la variable de sesión `app.current_vet_id`,
que la API establece al inicio de cada transacción con `set_config`.
Recepción y admin tienen políticas separadas con `USING (true)` — ven todo.

---

### Pregunta 2 — Vector de ataque del mecanismo de identificación de veterinario

El mecanismo usado es `set_config('app.current_vet_id', valor, false)`.
El vector de ataque posible es que un cliente malintencionado mande un
`vet_id` diferente al suyo en el query string — por ejemplo, siendo el
veterinario 2, mandar `vet_id=1` para ver las mascotas del Dr. López.

Mi sistema lo previene parcialmente porque la API toma el `vet_id` del
query string. En un sistema de producción real esto se resolvería con
un token JWT firmado que contenga el `vet_id` y que el servidor valide
antes de usarlo. Para esta evaluación, la demostración de RLS es funcional
y el vector está documentado conscientemente.

---

### Pregunta 3 — SECURITY DEFINER

No se usó `SECURITY DEFINER` en ningún procedure. No fue necesario porque
todos los procedures (`sp_agendar_cita`) operan sobre tablas a las que
el usuario que los llama ya tiene permisos directos mediante GRANT.
`SECURITY DEFINER` se necesitaría si un usuario de bajo privilegio
necesitara ejecutar operaciones sobre tablas a las que normalmente
no tiene acceso — ese no es el caso en este sistema. Evitarlo elimina
el vector de escalada de privilegios por manipulación del `search_path`.

---

### Pregunta 4 — TTL del caché Redis

Se eligió un TTL de **300 segundos (5 minutos)** para la clave
`vacunacion_pendiente`.

La justificación es que esta consulta recorre todas las mascotas y todas
las vacunas del inventario — en los datos de prueba tarda ~68ms, pero
en producción con miles de registros podría tardar varios segundos.
Se estima que se consulta unas 20-30 veces por hora en un turno normal.
5 minutos balancea frescura de datos vs carga en la BD.

Si fuera demasiado bajo (ej. 10 segundos): el caché casi nunca ayudaría,
la BD recibiría casi todas las consultas igual que sin caché.

Si fuera demasiado alto (ej. 1 hora): si se aplica una vacuna a una
mascota, esa mascota seguiría apareciendo en la lista de pendientes
durante hasta una hora, mostrando datos desactualizados. Por eso se
implementó invalidación explícita — cuando se registra una vacuna
aplicada, el endpoint `POST /api/vacunas` llama a `redis.del(CACHE_KEY)`
inmediatamente, forzando un MISS en la siguiente consulta.

---

### Pregunta 5 — Línea exacta de hardening en endpoint crítico

Endpoint: `GET /api/mascotas` — archivo `pages/api/mascotas.ts`, línea 30.

```typescript
result = await client.query(
  `SELECT m.id, m.nombre, m.especie, m.fecha_nacimiento,
          d.nombre AS dueno, d.telefono
   FROM mascotas m
   JOIN duenos d ON d.id = m.dueno_id
   WHERE m.nombre ILIKE $1
   ORDER BY m.nombre`,
  [`%${nombre.trim()}%`]  // línea 30 — input del usuario parametrizado
);
```

Lo que protege esta línea: el input del usuario nunca se concatena
al string SQL. El driver `pg` envía el valor como un parámetro separado
al servidor PostgreSQL, quien lo trata siempre como un valor de texto,
nunca como código SQL ejecutable. Esto previene todos los ataques de
SQL Injection clásicos: quote-escape, stacked queries, y UNION-based.
Probado con `' OR '1'='1`, `'; DROP TABLE mascotas; --`, y
`' UNION SELECT ... FROM veterinarios --` — los tres devolvieron
0 resultados sin afectar la base de datos.

---

### Pregunta 6 — ¿Qué se rompe si revocas todo excepto SELECT en mascotas?

Si se revoca todo al `rol_veterinario` excepto `SELECT` en `mascotas`,
estas tres operaciones dejarían de funcionar:

1. **Registrar nuevas citas** — requiere `INSERT` en la tabla `citas`,
   que quedaría revocado. El endpoint `POST /api/citas` devolvería
   `permission denied for table citas`.

2. **Aplicar vacunas** — requiere `INSERT` en `vacunas_aplicadas`.
   El endpoint `POST /api/vacunas` fallaría con error de permisos,
   impidiendo registrar cualquier vacuna aplicada.

3. **Ver su historial de citas** — requiere `SELECT` en `citas`.
   Sin ese permiso, el veterinario no podría consultar las citas
   agendadas para sus mascotas, rompiendo cualquier vista de agenda.