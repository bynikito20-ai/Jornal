# DIARIO.md

Cuaderno de bitácora del proyecto. Una entrada por sesión de trabajo.

**Para qué sirve.** Para ver que avanzas cuando trabajas a ratos sueltos y parece que no. Para acordarte de por qué hiciste algo. Y, cuando busques trabajo, para poder contar este proyecto con fechas y detalles reales en vez de "hice una app de control horario".

**Cómo se usa.** Dos minutos al final de cada sesión, antes de cerrar el portátil. No lo dejes para el día siguiente: los matices se pierden.


---

## 2026-11-23 · Lunes · ~2 h

**Hecho**
- Cuenta de MongoDB Atlas creada. Cluster gratuito M0 `jornal` en AWS, región París.
- Usuario de base de datos creado y contraseña rotada (la primera se me coló en una captura).
- Acceso de red abierto a `0.0.0.0/0` — necesario porque Vercel usa IPs dinámicas.
- `mongoose` instalado.
- `lib/mongodb.ts` con la conexión cacheada en el objeto global.
- `app/api/ping/route.ts` para comprobar la conexión.
- **Primera conexión correcta a Atlas**: `{"ok":true,"estado":1,"baseDeDatos":"jornal"}`.
- aplicación jornal-beta-kohl.vercel.app --> Es la direccion publica de mi app.

**Aprendido**
- La contraseña de Atlas solo se ve una vez. Si no la copias, toca generar otra.
- La cadena de conexión no trae el nombre de la base de datos: hay que escribirlo después de la última barra. Sin él se conecta a `test`.
- Los cambios en `.env.local` no se recargan solos — hay que parar y relanzar `npm run dev`.
- En serverless hay que cachear la conexión o se abre una nueva en cada petición.


---

## 2026-09-21 · lunes · ~2 h

**Hecho**
- Proyecto Next.js creado con TypeScript, App Router y Tailwind.
- Reorganizada la estructura: el proyecto estaba anidado en `my-app` dentro del repositorio. Todo subido a la raíz.
- Los cuatro documentos de la Fase 0 metidos en el repositorio.
- Repositorio en GitHub, todo subido.
- Cuenta de Vercel (plan Hobby) y **2FA activado**.
- **Primer despliegue en producción.**

**Aprendido**
- `git status` con rutas `../` significa que el repositorio está en una carpeta de más arriba.
- Git detecta los movimientos de archivos solo si haces `git add -A` antes de mirar: pasan de `deleted` a `renamed`.
- Windows no deja borrar una carpeta si VS Code la tiene abierta.
- El secreto del 2FA no debe salir en una captura.

---

## 2026-08-19 · martes · ~3 h

**Hecho**
- Respuestas de mi padre y los otros dos jefes al cuestionario.
- Análisis completo: 22 reglas de negocio numeradas, 2 contradicciones y 11 huecos.
- Modelo de datos de MongoDB diseñado: 7 colecciones.
- Plan reescrito a v2 (25 semanas) y `DECISIONES.md` arrancado.
- Prototipo del parte diario para enseñárselo a los jefes.

**El giro del proyecto**
Las respuestas invalidaron medio plan. Los trabajadores **no usan la aplicación**: los tres jefes apuntan cada día quién ha trabajado y en qué obra. Se cobra por días trabajados, no por horas. Y todo gira alrededor de las obras, que no estaban contempladas.

Desaparecieron las tres partes más difíciles (login de 40 personas, fichaje en movilidad, adopción de la plantilla) y aparecieron dos nuevas (obras y cálculo de nómina).

**Aprendido**
- Preguntar antes de programar vale meses. Dos semanas de Fase 0 evitaron construir lo que no era.
- Lo que más molesta del sistema actual es la mejor pista de cuál es la funcionalidad estrella.

---

## 2026-08-18 · lunes · ~1 h

**Hecho**
- Arranque del proyecto: buscar referencias y ejemplos con código.
- Revisados proyectos open source de control de asistencia.
- Elegido el stack: Next.js + MongoDB.
- Preparado el cuestionario para la reunión con los jefes.

---

## Plantilla para copiar

```markdown
## AAAA-MM-DD · día · ~X h

**Hecho**
-

**Aprendido**
-

**Atascado en**
-

**Pendiente**
-
```

> Lo de **Atascado en** no lo quites por vergüenza. Dentro de un año, leer en qué te atascabas y comprobar que ya no te atascas es la mejor forma de ver cuánto has aprendido. Y si alguna vez te vuelve a pasar lo mismo, aquí está la solución escrita.
