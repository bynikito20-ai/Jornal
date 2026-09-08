# PLAN.md — App de partes de trabajo y nómina

**v2 · Reescrito tras la Fase 0.** La v1 asumía que 40 empleados fichaban desde el móvil. No es así: los 3 jefes apuntan cada día quién ha trabajado y en qué obra.

**Empresa:** constructora, ~40 trabajadores, 3 jefes
**Usuarios de la app:** 4 (los 3 jefes y tú), todos admin
**Stack:** Next.js (App Router) + MongoDB Atlas + Mongoose · Auth.js · Vercel
**Dedicación:** < 5 h/semana · **Horizonte:** 25 semanas
**Entregable v1:** parte diario en menos de 60 segundos + informe mensual en XLS por correo

**Documentos hermanos:** `ANALISIS-Y-REGLAS.md` (el porqué) · `MODELO-DATOS.md` (el cómo) · `DECISIONES.md` (el registro)

---

## El criterio de éxito, en una frase

> A final de mes se genera un XLS correcto con los días, horas e importe de cada trabajador, **y nadie ha sumado nada a mano**.

Hoy eso son 30 minutos diarios de un CEO más el lío del cierre. Si lo consigues, lo demás sobra.

---

## Cómo trabajar con menos de 5 h a la semana

Con poco tiempo el enemigo no es la dificultad: es el coste de volver a situarte.

- [ ] **Sesión mínima de 90 minutos.** Mejor 3 h el sábado que cuatro ratos de 45 min.
- [ ] **Cierra escribiendo el siguiente paso** en `SIGUIENTE.md`, con esa concreción: *"falta que POST /api/jornadas devuelva 409 si ya existe una vigente para ese trabajador y fecha"*.
- [ ] **Commit al cerrar, siempre**, aunque no funcione. Rama `wip/`.
- [ ] **Una cosa por sesión.** Lo que se te ocurra, a `IDEAS.md`.
- [ ] **Despliega desde la semana 3.**
- [ ] **`DECISIONES.md` al día.** Tres líneas por decisión.

---

## Fase 0 · Entender el problema — ✅ COMPLETADA

- [x] Reunión con los jefes y respuestas por escrito
- [x] Reglas de negocio numeradas (RN-01 a RN-22)
- [x] Contradicciones detectadas (C-1, C-2)
- [x] Modelo de datos diseñado
- [ ] **Segunda ronda: los 5 huecos bloqueantes** (horas, horarios de temporada, cargos y tarifas, dos obras el mismo día, domingos)
- [ ] Decidir si el IBAN entra o no en la aplicación
- [ ] Enseñarles el prototipo del parte diario y confirmar que les vale
- [ ] Resumen escrito de lo acordado, confirmado por los tres

> Los 5 huecos bloquean la Fase 4, no la 1. Puedes empezar a programar mientras los resuelves.

---

## Fase 1 · Esqueleto en producción (semanas 3-5)

El objetivo no es que haga nada útil. Es que exista, en internet.

- [ ] `create-next-app` con App Router y TypeScript
- [ ] Entender Server vs Client Components antes de seguir — es *el* concepto de Next.js
- [ ] Conectar Atlas con Mongoose **cacheando la conexión** (en serverless se reconecta en cada petición si no lo haces)
- [ ] Modelos `Cargo` y `Trabajador`, y una página que lista trabajadores
- [ ] Desplegar en Vercel, variables de entorno en el panel y nunca en el repo

**Entregable:** una URL pública que lista trabajadores de prueba.

---

## Fase 2 · Acceso (semanas 6-7)

Mucho más corta que en la v1: son 4 usuarios creados a mano, no 40 registrándose.

- [ ] Auth.js (NextAuth v5) con proveedor de credenciales
- [ ] `bcrypt`. Nunca texto plano, nunca en un log
- [ ] Script de creación de los 4 usuarios
- [ ] Middleware que protege todo salvo el login
- [ ] Cambio de contraseña desde dentro

**Entregable:** los cuatro entráis con vuestra cuenta y nadie más pasa del login.

> No construyas recuperación por correo todavía. Sois 4 y os conocéis: si alguien la pierde, se la reseteas tú.

---

## Fase 3 · Los maestros (semanas 8-10)

Datos que casi no cambian pero de los que depende todo lo demás.

- [ ] CRUD de **cargos**
- [ ] CRUD de **tarifas** con vigencia — la parte con miga, léete la decisión 2 del modelo
- [ ] CRUD de **trabajadores**: alta, edición, baja lógica (`activo: false`, nunca borrar)
- [ ] CRUD de **obras** con estado activa/finalizada
- [ ] Carga inicial de los 40 trabajadores reales

**Entregable:** los 40 trabajadores, sus cargos y las obras activas, dentro del sistema.

> Aquí se vuelve real por primera vez. También es donde entran datos personales: a partir de esta fase, la base de datos ya no es un juguete.

---

## Fase 4 · El parte diario (semanas 11-14)

La pantalla estrella. Si esta falla, el proyecto muere aunque todo lo demás sea perfecto.

- [ ] Modelo `Jornada` con el **índice único parcial** que impide duplicados (RN-13)
- [ ] `POST /api/jornadas`: valida, rechaza duplicado con 409, registra autor y `createdAt` del servidor
- [ ] Pantalla del parte: fecha → obra → lista de trabajadores con un toque para marcar presente
- [ ] **Horas prellenadas** con el horario de temporada, editables (RN-06 + cumplimiento legal)
- [ ] **Botón "copiar el parte de ayer"** — la función que decide la adopción
- [ ] Contador visible: "12 de 15 presentes"
- [ ] Vista de un día completo con todas las obras a la vez
- [ ] Cronometrarlo: **si completar un parte pasa de 60 segundos, rediséñalo**

**Entregable:** los tres jefes apuntando el parte de verdad durante una semana, en paralelo a la agenda.

---

## Fase 5 · El informe mensual (semanas 15-18)

Lo que te pidieron. Todo lo anterior existía para llegar aquí.

- [ ] Pipeline de agregación: días y horas por trabajador y mes
- [ ] Cálculo del importe aplicando la **tarifa vigente en ese mes**, no la actual
- [ ] **Tests unitarios** de los 9 casos listados en `MODELO-DATOS.md`. Sin excepción: aquí un bug es dinero mal pagado
- [ ] Pantalla de informe con resumen y **detalle día a día** (RN-19)
- [ ] Generación del **XLS** con `exceljs`
- [ ] Envío por correo a los tres jefes (Resend) en la fecha fijada, con Vercel Cron
- [ ] **Hoja mensual por trabajador**: su registro de días y horas, para entregar. Resuelve el conflicto de la pregunta 4 y el derecho de acceso

**Entregable:** el XLS de un mes real, cuadrado contra la agenda de tu padre.

> Durante un mes entero, agenda y app en paralelo. Cuando cuadren dos meses seguidos, se retira la agenda. Ni antes.

---

## Fase 6 · Correcciones, auditoría y cierre (semanas 19-21)

La fase que separa un proyecto de prácticas de algo que se usa de verdad.

- [ ] Anular y rehacer una jornada (nunca editar en sitio) con **motivo obligatorio**
- [ ] Colección `auditoria` alimentada en creación, modificación y anulación
- [ ] Historial visible en cada jornada tocada: quién, cuándo, por qué
- [ ] **Cierre de mes**: congela importes y bloquea cambios (RN-21)
- [ ] Correcciones posteriores a un cierre → ajuste al mes siguiente

**Entregable:** poder responder "¿quién cambió esto y por qué?" para cualquier día de cualquier trabajador.

---

## Fase 7 · Producción de verdad (semanas 22-25)

- [ ] Revisar el cumplimiento del registro horario: horas de inicio y fin de cada trabajador y día, exportables
- [ ] RGPD: informar por escrito a los trabajadores, política de tratamiento, conservación 4 años, derecho de acceso
- [ ] Cifrado del IBAN si finalmente entra
- [ ] Copias de seguridad automáticas **y una restauración de prueba** (un backup sin restaurar no es un backup)
- [ ] Plan de contingencia: qué hace un jefe si la app se cae un martes
- [ ] Hoja de instrucciones de una cara con capturas
- [ ] Acuerdo de mantenimiento: qué incluye, qué cuesta, cómo te avisan de una incidencia

**Entregable:** el sistema en producción, la agenda retirada y una nómina calculada con tus datos.

---

## En paralelo: el ángulo portfolio

- [ ] Commits descriptivos desde el primer día
- [ ] README con capturas y el porqué de cada decisión
- [ ] **Demo pública con datos inventados**, separada de la instalación real
- [ ] `DECISIONES.md` al día — en una entrevista vale oro
- [ ] Los tests del cálculo, visibles en el repo

> ⚠️ **Nunca** publiques datos reales: nombres, DNI, IBAN ni salarios de trabajadores concretos. La demo va siempre con datos inventados.

---

## Riesgos

| Riesgo | Cómo lo evitas |
|---|---|
| Los jefes vuelven a la agenda | El parte tiene que costar < 60 s. "Copiar el parte de ayer" en la Fase 4 |
| El informe no cuadra con la nómina | Dos meses en paralelo antes de retirar la agenda |
| Cambian los precios y se descuadra el histórico | Tarifas con vigencia + congelar el importe al cerrar |
| Fuga de datos personales (DNI, IBAN, salarios) | Fase 7 no es opcional. Y valorar dejar el IBAN fuera |
| Los huecos bloqueantes se quedan sin responder | Resuélvelos antes de la Fase 4. Antes de eso no molestan |
| Se acumulan semanas sin tocarlo | `SIGUIENTE.md`. Retomar debe costar 2 minutos, no 40 |
| Te pagan mantenimiento y no sabes qué incluye | Acuérdalo por escrito en la Fase 7, antes de cobrar el primer mes |

---

## Fuera de alcance en la v1

Escrito para poder decir que no sin discutirlo dos veces: vacaciones y ausencias, app para trabajadores, geolocalización, horas extra, rol de encargado, control de materiales o maquinaria, y **coste por obra** — aunque este último saldrá casi gratis de los mismos datos, y merece ser lo primero de la v2.
