# DECISIONES.md

Registro de decisiones técnicas y su porqué. Una entrada por decisión, nunca se borran: si algo cambia, se añade una entrada nueva que revoca la anterior.

**Para qué sirve esto:** dentro de tres meses no te acordarás de por qué las fechas son texto. Y en una entrevista de trabajo, este archivo demuestra criterio mejor que el código.

**Formato:** contexto → decisión → alternativas descartadas → consecuencias.

---

## D-001 · Stack: Next.js + MongoDB + Vercel

**Fecha:** 2026-08 · **Estado:** vigente

**Contexto.** Proyecto real para la empresa familiar y a la vez pieza central de portfolio de alguien que acaba de terminar DAW y dispone de menos de 5 h semanales.

**Decisión.** Next.js (App Router) con TypeScript, MongoDB Atlas vía Mongoose, desplegado en Vercel.

**Alternativas descartadas.**
- *PHP/Laravel o Java*: se avanzaría más rápido al ser lo cursado, pero luce menos en un portfolio web y aporta menos aprendizaje.
- *React + Express + MySQL separados*: más aprendizaje de backend, pero duplica el despliegue y el mantenimiento para una persona con 5 h semanales.
- *SQL en vez de Mongo*: el modelo es relacional y PostgreSQL encajaría igual o mejor. Se elige Mongo por preferencia explícita y porque a esta escala (~10.500 documentos al año) la diferencia es irrelevante.

**Consecuencias.** Un solo despliegue. Coste inicial 0 €. Al pasar a producción, unos 20-30 €/mes entre Atlas, dominio y correo.

---

## D-002 · La app es para 4 admins, no para 40 trabajadores

**Fecha:** 2026-08 · **Estado:** vigente · **Sustituye al planteamiento inicial**

**Contexto.** El plan original asumía fichaje individual desde el móvil. La Fase 0 reveló que los trabajadores no usan ni usarán la aplicación: los 3 jefes apuntan cada día quién ha trabajado y en qué obra.

**Decisión.** Cuatro usuarios, todos `admin`. Los trabajadores son datos, no usuarios (RN-03).

**Consecuencias.** Desaparecen autenticación masiva, PWA para plantilla, geolocalización y el riesgo de adopción de 40 personas. Aparecen obras y cálculo de nómina. El proyecto es técnicamente más simple y empresarialmente más valioso.

**Lo que enseña.** Dos semanas de preguntas evitaron meses construyendo lo que no era.

---

## D-003 · Un documento por trabajador y día, no eventos de fichaje

**Fecha:** 2026-08 · **Estado:** vigente · **Revoca la regla "guarda eventos, no horas" del plan v1**

**Contexto.** Con fichaje real, lo correcto es guardar eventos de entrada/salida y calcular. Aquí no hay fichaje: hay un parte que un jefe rellena una vez al día.

**Decisión.** La colección `jornadas` guarda un documento por trabajador y día, con obra, hora de entrada y hora de salida.

**Alternativa descartada.** Eventos entrada/salida: añade complejidad (emparejado, turnos abiertos, medianoche) sin representar mejor una realidad donde nadie ficha.

**Consecuencias.** Modelo mucho más simple. Se paga por día (RN-14), así que contar documentos ya es contar días pagados.

**Nota honesta.** La regla del plan v1 era correcta *para el problema que creíamos tener*. Cambió el problema, cambió la regla. Eso es Fase 0 funcionando, no un error.

---

## D-004 · La fecha del día natural se guarda como texto `"YYYY-MM-DD"`

**Fecha:** 2026-08 · **Estado:** vigente

**Contexto.** Un `Date` es un instante en UTC. "El 29 de marzo" no es un instante, es un día natural. Mezclarlos produce bugs de desfase con el cambio de hora o con la zona del servidor.

**Decisión.** `fecha` es un string ISO. Las horas, `"HH:MM"` en local. Los `createdAt` de auditoría sí son `Date` reales.

**Alternativa descartada.** `Date` a medianoche UTC: funciona si nadie se equivoca nunca, y alguien se equivoca siempre.

**Consecuencias.** Los bugs de zona horaria desaparecen. Sigue ordenando y filtrando por rango porque el orden alfabético coincide con el cronológico. El cálculo de horas cabe en 8 líneas. Contrapartida: hay que validar el formato al escribir.

**Habilitado por.** RN-09: nadie cruza la medianoche.

---

## D-005 · Las tarifas tienen vigencia y el importe se congela al cerrar el mes

**Fecha:** 2026-08 · **Estado:** vigente

**Contexto.** Se cobra por día trabajado a un precio que depende del cargo (RN-15). Los precios suben. Si el informe consultara el precio actual, cada subida reescribiría los meses ya pagados.

**Decisión.** Colección `tarifas` separada de `cargos`, con `vigenteDesde` / `vigenteHasta`. Y al cerrar un mes, el importe queda congelado en `cierres`.

**Consecuencias.** Reimprimir el informe de marzo en diciembre da lo mismo que dio en marzo. Los documentos de cierre copian nombre, cargo y precio en vez de referenciarlos.

---

## D-006 · Un parte se anula, nunca se borra ni se edita en sitio

**Fecha:** 2026-08 · **Estado:** vigente

**Contexto.** RN-21 y RN-22. Ha habido conflictos con trabajadores por descuadres de días y horas. La normativa de registro horario exige rastro inmutable.

**Decisión.** Corregir = marcar la jornada como `anulada` y crear una nueva, dejando en `auditoria` quién, cuándo, qué había antes, qué hay ahora y por qué. Motivo obligatorio.

**Consecuencias.** El índice único que impide duplicados debe ser **parcial** (solo sobre `estado: "vigente"`), o una jornada anulada bloquearía su sustituta.

---

## D-007 · Las horas van prellenadas con el horario de temporada

**Fecha:** 2026-08 · **Estado:** vigente

**Contexto.** Para la nómina bastarían los días (RN-14), pero el art. 34.9 del Estatuto de los Trabajadores exige registrar hora de inicio y fin de cada trabajador y día. Marcar solo "vino / no vino" no cumple. Además, si apuntar el parte cuesta más que la agenda de papel, los jefes vuelven a la agenda.

**Decisión.** El parte prellena entrada y salida con el horario estándar de la temporada (RN-05, RN-06), editables si algún día cambian.

**Consecuencias.** Mismo número de clics para el jefe y registro horario válido. Obliga a configurar los horarios de invierno y verano y sus fechas de cambio — hueco bloqueante 2.

**Lo que enseña.** Cumplimiento y usabilidad no siempre están enfrentados: aquí la misma decisión resuelve los dos.

---

## D-008 · El IBAN, pendiente de decisión

**Fecha:** 2026-08 · **Estado:** ⏳ ABIERTA — hueco bloqueante 11

**Contexto.** El informe mensual debe incluir el IBAN de ingreso (RN-18). Guardar 40 IBAN eleva de golpe el riesgo y la responsabilidad legal de una base de datos administrada por una persona.

**Opciones.**
- **A** — No guardarlos. El informe lleva nombre y DNI; el IBAN lo aporta quien hace la transferencia o ya lo tiene la gestoría. *Menos riesgo, menos trabajo.*
- **B** — Guardarlos cifrados a nivel de aplicación, descifrados solo al generar el informe, nunca en listados ni logs.

**Recomendación:** A, salvo que la gestoría no los tenga.

**Pendiente:** preguntarlo. Es decisión de negocio, no técnica.

---

## D-009 · Cuatro cosas fuera de alcance en la v1

**Fecha:** 2026-08 · **Estado:** vigente

**Decisión.** Quedan fuera: vacaciones y ausencias (RN-17), app para trabajadores, geolocalización, horas extra (RN-08) y rol de encargado (RN-01).

**Por qué se escribe.** Para poder decir que no una vez y no volver a discutirlo. Un alcance que no está escrito no existe.

**Nota.** El **coste de mano de obra por obra** también queda fuera de la v1, pero saldrá casi gratis de los mismos datos (`jornadas` ya tiene `obraId`). Debería ser lo primero de la v2.

---

## Plantilla para nuevas entradas

```markdown
## D-0XX · Título en una línea

**Fecha:** · **Estado:** vigente | revocada por D-0YY | ⏳ abierta

**Contexto.** Qué problema había.
**Decisión.** Qué se hizo.
**Alternativas descartadas.** Qué más se consideró y por qué no.
**Consecuencias.** Qué gana y qué cuesta.
```
