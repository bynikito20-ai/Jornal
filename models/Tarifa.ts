import mongoose, { Schema, Model, Types } from 'mongoose';

export interface ITarifa {
  cargoId: Types.ObjectId;
  precioDia: number;
  vigenteDesde: string;        // 'YYYY-MM-DD'
  vigenteHasta: string | null; // null = es la tarifa actual
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const TarifaSchema = new Schema<ITarifa>(
  {
    cargoId:      { type: Schema.Types.ObjectId, ref: 'Cargo', required: true },
    precioDia:    { type: Number, required: true, min: 0 },
    vigenteDesde: { type: String, required: true, match: FECHA_ISO },
    vigenteHasta: { type: String, default: null, match: FECHA_ISO },
  },
  { timestamps: true, collection: 'tarifas' }
);

TarifaSchema.index({ cargoId: 1, vigenteDesde: -1 });

export const Tarifa: Model<ITarifa> =
  mongoose.models.Tarifa || mongoose.model<ITarifa>('Tarifa', TarifaSchema);