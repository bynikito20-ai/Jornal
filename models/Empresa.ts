import mongoose, { Schema, Model } from 'mongoose';

export interface IEmpresa {
  nombre: string;
  cif: string;
  activa: boolean;   // false cuando deje de tener trabajadores
}

const EmpresaSchema = new Schema<IEmpresa>(
  {
    nombre: { type: String, required: true, trim: true },
    cif:    { type: String, required: true, unique: true, uppercase: true, trim: true },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'empresas' }
);

export const Empresa: Model<IEmpresa> =
  mongoose.models.Empresa || mongoose.model<IEmpresa>('Empresa', EmpresaSchema);