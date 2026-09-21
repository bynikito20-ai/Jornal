# Modelo de datos — MongoDB

Derivado de `ANALISIS-Y-REGLAS.md`. Cada decisión referencia la regla que la justifica.

> **Provisional en dos puntos**: el cálculo de horas (hueco 1) y si un trabajador puede estar en dos obras el mismo día (hueco 4). El resto se puede dar por bueno.

---

## Las tres decisiones estructurales

Estas tres son las caras de cambiar después. Todo lo demás es ajustable.

### 1 · La fecha del día natural se guarda como texto, no como Date

```js
fecha: "2026-03-29"   // ✅ string ISO
fecha: new Date(...)  // ❌
```

Parece un capricho y es justo lo contrario. Un `Date` en MongoDB es un instante en UTC; "el día 29 de marzo" no es un instante, es un día natural. En cuanto mezclas las dos cosas aparecen los bugs de "el parte del lunes sale guardado en domingo" cada vez que cambia la hora o el servidor está en otra zona.

Como aquí nadie cruza la medianoche (RN-09), el día natural es todo lo que necesitas. Guardándolo como `"YYYY-MM-DD"` los bugs de zona horaria **desaparecen por completo**, y sigue ordenando y filtrando por rango perfectamente porque el orden alfabético coincide con el cronológico.

Las horas, igual: `"07:00"` y `"15:00"` como texto local. La resta es trivial y no hay zona horaria implicada.

Los `createdAt` de auditoría sí son `Date` reales: ahí sí quieres el instante exacto.

### 2 · El precio se congela, no se consulta

Si en marzo un oficial cobra 95 €/día y en junio pasa a 100, **el informe de marzo debe seguir diciendo 95** aunque lo reimprimas en diciembre. Si el informe consulta el precio actual, cada subida de sueldo reescribe la historia y descuadra con lo que ya se pagó.

Doble protección:

- La colección `tarifas` guarda precios **con vigencia** (`vigenteDesde` / `vigenteHasta`).
- Al **cerrar** un mes, el importe calculado se congela dentro del documento de cierre.

### 3 · Un parte se anula, nunca se borra

RN-21. Corregir es crear un registro nuevo y marcar el anterior como anulado, dejando en `auditoria` quién, cuándo y por qué. Es lo que exige la normativa y lo que te permite responder a "yo ese día sí trabajé".

---

## Colecciones

### `usuarios` — los 4 admins

```js
{
  _id: ObjectId,
  nombre: "Antonio",
  email: "antonio@empresa.com",
  passwordHash: String,        // bcrypt
  rol: "admin",                // RN-01. 'encargado' queda para el futuro
  activo: true,
  ultimoAcceso: Date,
  createdAt: Date
}
```

No hay registro público (RN-02): las 4 cuentas se crean a mano. Es un caso donde lo simple es lo correcto.

---

### `cargos` — categorías profesionales

```js
{
  _id: ObjectId,
  nombre: "Oficial de 1ª",
  orden: 2,                    // para listarlos con sentido
  activo: true
}
```

---

### `tarifas` — precio por día, con historial

```js
{
  _id: ObjectId,
  cargoId: ObjectId,
  precioDia: 95.00,
  vigenteDesde: "2026-01-01",
  vigenteHasta: null,          // null = tarifa actual
  createdAt: Date,
  creadoPor: ObjectId
}
```

Índice: `{ cargoId: 1, vigenteDesde: -1 }`

Separar la tarifa del cargo es lo que hace posible subir un sueldo sin reescribir el pasado. Es la decisión menos obvia del modelo y la que más te va a agradecer tu yo del mes 8.

---

### `trabajadores` — datos, no usuarios

```js
{
  _id: ObjectId,
  nombre: "Juan",
  apellidos: "Pérez Gómez",
  dni: "12345678A",
  cargoId: ObjectId,           // RN-04
  telefono: String,
  iban: String,                // ⚠️ CIFRADO. Ver nota abajo
  activo: true,
  fechaAlta: "2024-03-01",
  fechaBaja: null,
  notas: String
}
```

Índices: `{ activo: 1, apellidos: 1 }`, `{ dni: 1 }` único

**Sobre el IBAN** (hueco 11, pendiente de decidir): si finalmente se guarda, va cifrado a nivel de aplicación, nunca se incluye en listados ni logs, y solo se descifra al generar el informe. Si consiguen que la gestoría lo aporte, **quita el campo**: es menos riesgo, menos trabajo y menos responsabilidad para ti.

**Nunca borres un trabajador.** Se marca `activo: false` con `fechaBaja`. Si lo borras, los partes históricos se quedan huérfanos y los informes de meses pasados dejan de cuadrar.

---

### `obras`

```js
{
  _id: ObjectId,
  codigo: "OB-2026-014",
  nombre: "Reforma C/ Mayor 12",
  cliente: String,
  direccion: String,
  estado: "activa",            // 'activa' | 'finalizada'
  fechaInicio: "2026-02-01",
  fechaFin: null,
  responsableId: ObjectId      // qué jefe la lleva (hueco 7)
}
```

Índice: `{ estado: 1, nombre: 1 }`

---

### `jornadas` — el núcleo del sistema

Un documento por **trabajador y día**. Es la colección que crece: unos 40 × 22 = **880 documentos al mes**, ~10.500 al año. El nivel gratuito de Atlas (512 MB) aguanta más de una década.

```js
{
  _id: ObjectId,
  trabajadorId: ObjectId,
  fecha: "2026-03-16",         // string ISO, decisión 1
  obraId: ObjectId,            // RN-10

  horaEntrada: "07:00",        // prellenadas con el horario de temporada
  horaSalida:  "15:00",        // editables (RN-06)
  horasCalculadas: 8.0,        // derivado, guardado para no recalcular en cada informe

  estado: "vigente",           // 'vigente' | 'anulada'  (decisión 3)

  registradoPor: ObjectId,     // qué admin lo apuntó (RN-22)
  createdAt: Date,             // instante real, del servidor
  observaciones: String
}
```

**Índices:**

```js
// Impide físicamente el duplicado de RN-13.
// Parcial: una jornada anulada no bloquea la nueva.
{ trabajadorId: 1, fecha: 1 }
  → unique, partialFilterExpression: { estado: "vigente" }

{ fecha: 1, obraId: 1 }        // cargar el parte de un día
{ trabajadorId: 1, fecha: 1 }  // informe mensual de un trabajador
{ obraId: 1, fecha: 1 }        // coste por obra (la oportunidad futura)
```

Ese índice único parcial es la traducción técnica de la preocupación de la pregunta 16: **la base de datos rechaza el duplicado**, no dependes de que la interfaz lo compruebe bien.

> **Pendiente del hueco 4.** Si un trabajador puede estar en dos obras el mismo día, el índice pasa a `{ trabajadorId, fecha, obraId }` y las horas se reparten entre las dos. Cambio pequeño si se decide ahora, molesto si se decide con datos dentro.

---

### `auditoria` — RN-21, RN-22

```js
{
  _id: ObjectId,
  jornadaId: ObjectId,
  accion: "modificacion",      // 'creacion' | 'modificacion' | 'anulacion'
  antes: { obraId, horaEntrada, horaSalida },   // null si es creación
  despues: { obraId, horaEntrada, horaSalida },
  motivo: "Cambio de obra a mitad de semana",   // obligatorio salvo en creación
  autorId: ObjectId,
  createdAt: Date
}
```

Índices: `{ jornadaId: 1, createdAt: -1 }`, `{ createdAt: -1 }`

---

### `cierres` — el mes congelado

```js
{
  _id: ObjectId,
  anio: 2026, mes: 3,
  estado: "cerrado",
  cerradoPor: ObjectId,
  cerradoEn: Date,

  lineas: [{
    trabajadorId: ObjectId,
    nombreCompleto: "Juan Pérez Gómez",   // copiado, no referenciado
    cargo: "Oficial de 1ª",               // copiado
    diasTrabajados: 21,
    horasTotales: 168.0,
    precioDiaAplicado: 95.00,             // congelado (decisión 2)
    importe: 1995.00
  }]
}
```

Índice: `{ anio: 1, mes: 1 }` único

Los nombres y cargos van **copiados, no referenciados**. Si un trabajador cambia de cargo en agosto, el cierre de marzo debe seguir diciendo lo que decía en marzo. Es el mismo principio que congelar el precio.

Una vez cerrado un mes, no se aceptan jornadas nuevas en él. Si aparece una corrección tardía, va como ajuste al mes siguiente — que es como funciona la contabilidad de verdad.

---

## Cómo encaja todo

```
cargos ──< tarifas            (precio por día, con vigencia)
   │
   └──< trabajadores ──< jornadas >── obras
                            │
                            ├──< auditoria
                            └──> cierres   (agregación mensual congelada)

usuarios ──> registra jornadas, firma auditoría, cierra meses
```

---

## Los cálculos

### Horas de una jornada

```js
const horas = (salida, entrada) => {
  const [he, me] = entrada.split(':').map(Number);
  const [hs, ms] = salida.split(':').map(Number);
  return ((hs * 60 + ms) - (he * 60 + me)) / 60;
};
```

Ocho líneas y sin zona horaria a la vista. Eso es lo que compra la decisión 1.

### Informe mensual (pipeline de agregación)

```js
db.jornadas.aggregate([
  { $match: { fecha: { $gte: "2026-03-01", $lte: "2026-03-31" },
              estado: "vigente" } },
  { $group: {
      _id: "$trabajadorId",
      diasTrabajados: { $sum: 1 },          // RN-14: un documento = un día pagado
      horasTotales:   { $sum: "$horasCalculadas" },
      detalle: { $push: { fecha: "$fecha", obraId: "$obraId",
                          horaEntrada: "$horaEntrada", horaSalida: "$horaSalida" } }
  }},
  { $lookup: { from: "trabajadores", localField: "_id",
               foreignField: "_id", as: "trabajador" } }
]);
```

El importe se calcula después, en JavaScript, aplicando la tarifa vigente en ese mes. Hacerlo fuera de la agregación te permite testearlo sin base de datos.

### Tests obligatorios (Fase 5)

Esta es la única parte del proyecto donde un fallo se traduce en dinero mal pagado. Sin excepción:

- Mes normal de 21 días laborables
- Trabajador que se incorpora a mitad de mes
- Trabajador dado de baja a mitad de mes
- Un domingo trabajado
- Una jornada anulada (no debe contar)
- Una jornada corregida (debe contar el valor nuevo, una sola vez)
- Cambio de tarifa a mitad de mes
- Cambio de horario invierno → verano dentro del mes
- Mes sin ninguna jornada

---

## Lo que NO está en el modelo, y por qué

| Ausente | Motivo |
|---|---|
| Vacaciones | RN-17, fuera de alcance |
| Tipos de ausencia (baja, permiso) | RN-16: o el día existe o no existe. No hace falta modelar el porqué |
| Horas extra | RN-08, no se hacen |
| Fichajes de entrada/salida como eventos | Nadie ficha. Un documento por día es más simple y más fiel a la realidad |
| Geolocalización | Los jefes apuntan desde donde sea. No aporta nada y añade carga de RGPD |
| Rol de encargado | RN-01, previsto pero no implementado |
| Departamentos | No existen. Existen obras |

Cada línea de esta tabla es trabajo que **no** vas a hacer. Vale tanto como el resto del documento.
