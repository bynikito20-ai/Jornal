# Análisis de las respuestas y reglas de negocio

Fase 0 completada. Documento base del proyecto: todo lo demás se deriva de aquí.

---

## Lo que ha cambiado (y es mucho)

Las respuestas de tu padre invalidan la mitad del plan anterior. Esto no es un problema: **es exactamente para lo que servía la Fase 0**. Detectarlo ahora cuesta una tarde; detectarlo en el mes cuatro habría costado el proyecto.

| Lo que asumíamos | Lo que es en realidad |
|---|---|
| 40 empleados fichan desde su móvil | **Nadie ficha.** Los 3 jefes apuntan cada día quién ha trabajado |
| Login para 40 personas | 4 usuarios en total: los 3 jefes y tú |
| PWA instalable para la plantilla | Herramienta interna de escritorio y móvil para 4 personas |
| Se paga por horas | **Se paga por días trabajados**, a un precio que depende del cargo |
| El dato es el fichaje | El dato es el **parte diario: trabajador + obra + día** |
| Sin dimensión de proyecto | Es una **constructora**: todo gira alrededor de las obras |
| Riesgo alto de rechazo por 40 usuarios | Riesgo de adopción concentrado en 3 personas |

**Traducción:** el proyecto se ha vuelto técnicamente más sencillo y empresarialmente más valioso. Han desaparecido las tres partes más difíciles (autenticación masiva, fichaje en movilidad, adopción de 40 personas) y ha aparecido una que no estaba: obras y cálculo de nómina.

---

## El problema real que hay que resolver

De la pregunta 3, que era la importante:

> *"Es todo manual y se pierde tiempo. Además es un lío a final de mes porque con cada trabajador tiene que contar a mano los días trabajados para hacer la nómina, y esto puede dar fallos y dolores de cabeza."*

Y de la 4:

> *"Ha habido conflicto porque a los trabajadores no les cuadraban las horas y los días que la empresa tenía apuntados."*

Hay dos problemas distintos, y el segundo es el caro:

1. **Tiempo perdido.** 30 min/día recopilando + el cierre de mes. Son unas **11 horas al mes** de un CEO.
2. **Errores que generan conflicto con los trabajadores.** Contar días a mano en una agenda produce discrepancias, y esas discrepancias acaban en discusiones sobre la nómina.

Tu app no es "una app de fichaje". Es **la que convierte la agenda en la nómina sin que nadie cuente a mano**. Si al final del mes se genera un XLS correcto y nadie ha sumado nada, has ganado. Todo lo demás es accesorio.

---

## Reglas de negocio

Numeradas para poder referenciarlas desde el código y los tests.

### Personas y roles

- **RN-01** · Solo existen dos roles: `admin` y `trabajador`. No hay encargados (previsto para el futuro, no se implementa).
- **RN-02** · Los usuarios de la aplicación son 4: tu padre, su hermano, su cuñado y tú. Todos con rol `admin`.
- **RN-03** · Los trabajadores **no acceden a la aplicación**. Son datos, no usuarios. No tienen cuenta ni contraseña.
- **RN-04** · Cada trabajador pertenece a un **cargo**, y el cargo determina cuánto se le paga por día trabajado.

### Jornada

- **RN-05** · Todos los trabajadores tienen el **mismo horario**, matinal y continuo. No hay jornada partida ni turnos.
- **RN-06** · El horario **cambia en verano**: se empieza antes para evitar el calor. Son dos horarios estándar, invierno y verano.
- **RN-07** · No se trabaja sábados. **Los domingos se puede trabajar** de forma excepcional si la obra lo requiere.
- **RN-08** · No hay horas extra. Salir un rato a media mañana por un asunto personal no tiene consecuencias: el día cuenta igual.
- **RN-09** · Nadie cruza la medianoche. La jornada empieza y acaba el mismo día natural.

### El parte diario — el corazón del sistema

- **RN-10** · Cada día, un admin registra qué trabajadores han acudido y **a qué obra** ha ido cada uno.
- **RN-11** · La jornada empieza al llegar a la obra y termina al acabar el horario en la obra. No hay desplazamientos computables.
- **RN-12** · Si un trabajador olvida avisar o hay cualquier incidencia, la resuelve un admin editando el parte. No existe el concepto de "fichaje olvidado".
- **RN-13** · Un trabajador **no puede figurar dos veces el mismo día**. El sistema debe impedirlo, no confiar en que nadie se equivoque.

### Retribución

- **RN-14** · **Se cobra por día trabajado**, no por horas. Día trabajado = día presente en una obra.
- **RN-15** · El importe de un día = precio/día del **cargo** del trabajador.
- **RN-16** · Los días de baja médica, permiso o ausencia **no se pagan**. No hace falta modelar tipos de ausencia: o el día se trabajó o no existe.
- **RN-17** · Las vacaciones quedan **fuera del alcance**. No se registran ni se calculan.

### El informe mensual — el entregable

- **RN-18** · A final de mes, antes del pago de nóminas, se genera un informe **por trabajador** con: días trabajados, horas totales, importe a pagar e IBAN de ingreso.
- **RN-19** · El informe incluye además el **detalle día a día**.
- **RN-20** · Formato **XLS**, enviado **por correo a cada jefe** en una fecha fija del mes.

### Trazabilidad

- **RN-21** · Toda creación, modificación o anulación de un parte queda registrada con autor, momento y motivo. Nada se borra.
- **RN-22** · Se debe poder responder, para cualquier día y trabajador: quién lo apuntó, cuándo, y si se modificó después.

---

## Contradicciones detectadas

Dos respuestas chocan con el resto. Hay que resolverlas antes de programar.

### C-1 · "Un empleado no debería poder fichar por otro"

**El conflicto:** la pregunta 16 la respondió pensando en el modelo antiguo, donde los trabajadores usaban la app. Como no la usan, un empleado no puede fichar por nadie: no tiene acceso.

**Lo que creo que quiso decir:** que no se puedan manipular los datos. La preocupación es legítima y se traduce en otra cosa: **que un admin no pueda alterar un parte sin dejar rastro** (RN-21) y que el sistema impida duplicados (RN-13).

**Pregúntale:** ¿la preocupación es que alguien haga trampa, o que se cometan errores sin darse cuenta? Son problemas distintos con soluciones distintas.

### C-2 · "Debe ser muy fácil de usar porque no saben usar el móvil"

**El conflicto:** eso lo dijo de los trabajadores, que no van a tocar la app.

**Pero sigue siendo válido, apuntando a otro sitio:** los usuarios reales son tres personas que llevan años trabajando con una agenda de papel. La facilidad de uso importa **más** ahora, no menos, porque si apuntar el parte les cuesta más que abrir la agenda, volverán a la agenda y el proyecto muere.

**Objetivo de diseño concreto:** el parte de un día debe poder completarse en **menos de 60 segundos** desde que abren la app. Ahí está el botón "copiar el parte de ayer": la mayoría de días trabaja la misma cuadrilla en la misma obra.

---

## Huecos — segunda ronda de preguntas

Lo que falta por saber. Ninguna es opcional: todas condicionan el modelo de datos o el cálculo.

### Bloqueantes (sin esto no puedo cerrar el modelo)

1. **¿De dónde salen "las horas totales"?** Se cobra por días (RN-14) pero el informe pide horas (RN-18). ¿Las horas se calculan como días × horario estándar, o hay que poder anotar horas reales distintas algún día?
2. **¿Cuál es el horario exacto de invierno y el de verano, y en qué fechas se cambia?** Necesito las cuatro cifras y las dos fechas.
3. **¿Cuántos cargos hay y cuánto cobra cada uno por día?** (Peón, oficial de 2ª, oficial de 1ª, encargado...). No necesito los importes reales para diseñar, pero sí saber cuántos son.
4. **¿Un trabajador puede estar en dos obras el mismo día?** Si por la mañana está en una y por la tarde en otra, ¿cómo se apunta?
5. **¿Los domingos trabajados se pagan igual que un día normal, o llevan recargo?**

### Importantes

6. **¿Cuántas obras suele haber activas a la vez?** Cambia mucho la interfaz si son 3 o si son 15.
7. **¿Cada jefe lleva sus propias obras, o los tres apuntan de todo?** Si cada uno lleva las suyas, la pantalla debería filtrar por defecto.
8. **¿Qué pasa si dos jefes apuntan al mismo trabajador el mismo día en obras distintas?** Con RN-13 el sistema lo bloquea, pero alguien tiene que ver el aviso.
9. **¿Necesitan cargar el histórico de la agenda, o se empieza de cero el mes que se estrene?** Empezar de cero es mucho más barato.
10. **¿En qué día exacto del mes hay que enviar el informe?**

### Delicadas — el IBAN

11. **¿Hace falta de verdad que los IBAN estén en la aplicación?**

Merece un párrafo aparte. Un IBAN es un dato personal de categoría sensible en la práctica, y guardar 40 en una base de datos que administras tú desde tu portátil eleva de golpe la responsabilidad legal y el riesgo. Si la gestoría ya los tiene, quizá basta con que el informe lleve nombre y DNI, y el IBAN lo aporte quien hace la transferencia.

Si aun así lo quieren dentro, se guarda **cifrado**, se muestra solo en el informe final, y nunca aparece en un listado ni en un log. Coméntalo con ellos: es una decisión de negocio, no técnica.

---

## Aviso legal que debes trasladarles

No como abogado, sino porque afecta al diseño y es mejor saberlo ahora.

El registro de jornada del artículo 34.9 del Estatuto de los Trabajadores exige registrar **la hora concreta de inicio y fin de cada trabajador, cada día**. Un sistema donde solo se marca "vino / no vino" **no cumple**, aunque sea suficiente para calcular la nómina. Y la agenda de papel actual tampoco cumple: hay un Real Decreto en tramitación que prohíbe expresamente el registro en papel.

**La buena noticia es que la solución es gratis.** Como todos tienen el mismo horario (RN-05), el parte diario puede llevar las horas de entrada y salida **prellenadas** con el horario estándar de la temporada, editables si algún día cambian. El jefe hace exactamente los mismos clics, y el sistema genera un registro horario válido.

Es una de esas decisiones que no cuesta nada si la tomas ahora y es carísima si la tomas dentro de un año.

Y hay un segundo efecto, este de negocio: como los trabajadores tienen derecho a acceder a su registro, generar una hoja mensual por trabajador resuelve **exactamente el conflicto de la pregunta 4**. Se acabó el "a mí no me cuadran los días".

---

## Una oportunidad que no estaba en el plan

Al registrar **trabajador + obra + día**, la base de datos contiene automáticamente algo que hoy nadie tiene: **el coste de mano de obra de cada obra**. Días × precio/día, agrupado por obra en vez de por trabajador. Es la misma consulta, cambiando un campo.

Para una constructora eso es información de valor real: saber cuánto ha costado realmente una obra frente a lo presupuestado.

**No lo metas en la v1.** Pero cuando enseñes el informe mensual y funcione, enséñales también esa cifra. Es el tipo de cosa que hace que un proyecto interno pase de "lo que hizo el chaval" a algo que la empresa considera suyo.
