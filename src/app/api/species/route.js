import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Species from '@/models/Species';
import { authOptions } from '../auth/[...nextauth]/route';

// Lista de especies iniciales para el auto-seeding
const DEFAULT_SPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Otro'];

export async function GET(req) {
  try {
    await dbConnect();

    // Validar sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    let speciesList = await Species.find({}).sort({ name: 1 });

    // Auto-seeding si la colección está vacía
    if (speciesList.length === 0) {
      const speciesToInsert = DEFAULT_SPECIES.map((name) => ({ name }));
      await Species.insertMany(speciesToInsert);
      speciesList = await Species.find({}).sort({ name: 1 });
    }

    return NextResponse.json(speciesList);
  } catch (error) {
    console.error('Error en GET /api/species:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al obtener el catálogo de especies.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Validar sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la especie es obligatorio.' },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();

    // Verificar si ya existe (insensible a mayúsculas/minúsculas)
    const existingSpecies = await Species.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
    });

    if (existingSpecies) {
      return NextResponse.json(existingSpecies, { status: 200 }); // Devolvemos la especie existente si ya existe
    }

    const newSpecies = await Species.create({ name: normalizedName });

    return NextResponse.json(newSpecies, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/species:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al registrar la especie.' },
      { status: 500 }
    );
  }
}
