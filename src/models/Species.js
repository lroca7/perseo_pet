import mongoose from 'mongoose';

const SpeciesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la especie es obligatorio.'],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Previene compilar el modelo más de una vez en Next.js hot reload
export default mongoose.models.Species || mongoose.model('Species', SpeciesSchema);
