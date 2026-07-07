import mongoose from 'mongoose';

const VaccineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre de la vacuna es obligatorio.'],
            unique: true,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Previene compilar el modelo más de una vez en Next.js hot reload
export default mongoose.models.Vaccine || mongoose.model('Vaccine', VaccineSchema);
