import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Pet from '@/models/Pet';
import Species from '@/models/Species';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    // Buscar mascota que pertenezca al usuario
    const pet = await Pet.findOne({ _id: id, owner: session.user.id }).populate('species');

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('Error en GET /api/pets/[id]:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al obtener la mascota.' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { name, species, breed, gender, birthDate, weight, notes } = await req.json();

    // Validaciones básicas
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

    // Buscar y actualizar si pertenece al dueño
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, owner: session.user.id },
      {
        name,
        species,
        breed: breed || '',
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || '',
      },
      { new: true, runValidators: true }
    ).populate('species');

    if (!updatedPet) {
      return NextResponse.json({ error: 'Mascota no encontrada o no tienes permisos.' }, { status: 404 });
    }

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error('Error en PUT /api/pets/[id]:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al actualizar la mascota.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    // Buscar y eliminar si pertenece al dueño
    const deletedPet = await Pet.findOneAndDelete({ _id: id, owner: session.user.id });

    if (!deletedPet) {
      return NextResponse.json({ error: 'Mascota no encontrada o no tienes permisos.' }, { status: 404 });
    }

    // TODO: Cuando exista la colección de actividades/historial, se deberían eliminar en cascada aquí.
    
    return NextResponse.json({ message: 'Mascota eliminada con éxito.' });
  } catch (error) {
    console.error('Error en DELETE /api/pets/[id]:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al eliminar la mascota.' },
      { status: 500 }
    );
  }
}
