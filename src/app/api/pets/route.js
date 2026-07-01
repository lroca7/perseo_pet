import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Pet from '@/models/Pet';
// Importamos Species para asegurar que Mongoose registre el modelo antes del populate
import Species from '@/models/Species';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    await dbConnect();

    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    // Buscar mascotas del usuario autenticado y popular la especie
    const pets = await Pet.find({ owner: session.user.id })
      .populate('species')
      .sort({ createdAt: -1 });

    return NextResponse.json(pets);
  } catch (error) {
    console.error('Error en GET /api/pets:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al obtener las mascotas.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { name, species, breed, gender, birthDate, weight, notes } = await req.json();

    // Validaciones
    if (!name || !species || !gender) {
      return NextResponse.json(
        { error: 'Por favor, completa todos los campos obligatorios (Nombre, Especie, Género).' },
        { status: 400 }
      );
    }

    if (!['macho', 'hembra'].includes(gender)) {
      return NextResponse.json(
        { error: 'El género debe ser macho o hembra.' },
        { status: 400 }
      );
    }

    // Verificar que la especie exista
    const speciesExists = await Species.findById(species);
    if (!speciesExists) {
      return NextResponse.json(
        { error: 'La especie seleccionada no es válida.' },
        { status: 400 }
      );
    }

    // Crear la mascota vinculada al usuario
    const newPet = await Pet.create({
      owner: session.user.id,
      name,
      species,
      breed: breed || '',
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes || '',
    });

    // Cargar la relación para devolver la mascota completa con especie poblada
    const populatedPet = await Pet.findById(newPet._id).populate('species');

    return NextResponse.json(populatedPet, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/pets:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al registrar la mascota.' },
      { status: 500 }
    );
  }
}
