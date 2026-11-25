import mongoose, {Schema, Model, Types, SchemaTypeOptions } from "mongoose";


export interface ITrabajador {
    nombre: string;
    apellidos: string;
    dni: string;
    empresaId: Types.ObjectId;
    cargoId:Types.ObjectId;
    telefono?: string;
    activo: boolean;
    fechaAlta: string;    // 'YYYY-MM-DD' como Texto
    fechaBaja: string | null;
    notas?: string;
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const TrabajadorSchema = new Schema<ITrabajador>(
    {
        nombre: { type: String, required: true, trim: true },
        apellidos: { type: String, required: true, trim: true },
        dni: { type: String, required: true, unique: true, uppercase: true, trim: true},
        empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
        cargoId: { type: Schema.Types.ObjectId, ref: 'Cargo', requiered: true},
        telefono: { type: String, trim: true},
        activo: { type: Boolean, default: true},
        fechaAlta: { type: String, requiered: true, match: FECHA_ISO },
        fechaBaja: { type: String, requiered: null, match: FECHA_ISO },
        notas: { type: String, trim: true},
    },
    { timestamps: true, collection: 'trabajadores'}
);

// Indice para el listado habitual: activos ordenados por apellido
TrabajadorSchema.index({ activo: 1, apellidos: 1 });


export const Trabajador: Model<ITrabajador> =
  mongoose.models.Trabajador || mongoose.model<ITrabajador>('Trabajador', TrabajadorSchema);