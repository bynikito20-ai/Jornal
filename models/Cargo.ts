import mongoose, { Schema, Model} from "mongoose";

// La forma de los Datos
export interface ICargo {
    nombre: string;
    orden: number;
    activo: boolean;
}

// Las reglas de Validadcion de Mongoose
const CargoSchema = new Schema<ICargo>(
    {
        nombre: { type: String, required: true, trim: true, unique: true},
        orden: { type: Number, required: true, default: 0}, 
        activo: { type: Boolean, default: true},
    },
    { timestamps: true, collection: 'Cargos' }
);

// El modelo en si.
export const Cargo: Model<ICargo> =
  mongoose.models.Cargo || mongoose.model<ICargo>('Cargo', CargoSchema);