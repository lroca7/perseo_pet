import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El dueño de la mascota es obligatorio.'],
    },
    name: {
      type: String,
      required: [true, 'El nombre de la mascota es obligatorio.'],
      trim: true,
    },
    species: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Species',
      required: [true, 'La especie de la mascota es obligatoria.'],
    },
    breed: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      required: [true, 'El género es obligatorio.'],
      enum: {
        values: ['macho', 'hembra'],
        message: 'El género debe ser macho o hembra.',
      },
    },
    birthDate: {
      type: Date,
    },
    weight: {
      type: Number,
      min: [0, 'El peso no puede ser negativo.'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Aquí ocurre la relación Muchos a Muchos
    vaccinesApplied: [
      {
        vaccineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vaccine', // Debe coincidir exactamente con el nombre del modelo Vaccine
          required: true
        },
        appliedAt: { type: Date, default: Date.now },
        lotNumber: String
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Previene compilar el modelo más de una vez en Next.js hot reload
export default mongoose.models.Pet || mongoose.model('Pet', PetSchema);
