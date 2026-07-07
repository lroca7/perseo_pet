import mongoose from 'mongoose';

const ParasiteControlSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet', // Hace referencia al modelo Pet
        required: [true, 'La mascota es obligatoria.'],
    },
    type: {
        type: String,
        enum: ['externo', 'interno', 'combinado'], // Bravecto sería 'externo'
        required: true
    },
    productName: { type: String, required: true }, // Ej: "Bravecto", "NexGard"
    appliedAt: { type: Date, default: Date.now },
    durationMonths: { type: Number, default: 1 }, // ¡Bravecto dura 3 meses! Así puedes calcular la próxima dosis    
    notes: String
}, { timestamps: true, });

export default mongoose.models.ParasiteControl || mongoose.model('ParasiteControl', ParasiteControlSchema);
