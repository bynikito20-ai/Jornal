FASE 3 - Los maestros. Crear los modelos de Mongoose segun MODELO-DATOS.md.

1. models/Cargo.ts        -> nombre, orden, activo
2. models/Trabajador.ts   -> nombre, apellidos, dni, cargoId, activo,
                             fechaAlta, fechaBaja
3. Script de datos de prueba: 3 cargos y 5 trabajadores INVENTADOS
4. Pagina que liste los trabajadores leyendo de Atlas

Estado: Fase 1 terminada. App desplegada en jornal-beta-kohl.vercel.app
y conectada a Atlas en local y en produccion.

Regla: hasta que exista el login, en la base de datos solo datos
inventados. Ver D-011.