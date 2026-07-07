import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Pet from '@/models/Pet';
import Species from '@/models/Species';
import Vaccines from '@/models/Vaccine';
import ParasiteControl from '@/models/ParasiteControl';

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
    const pet = await Pet.findOne({ _id: id, owner: session.user.id })
      .populate('species')
      .populate('vaccinesApplied.vaccineId')
      .populate('parasitesControl');

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
    debugger
    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, species, breed, gender, birthDate, weight, notes,
      vaccineId, appliedAt, lotNumber,
      type, productName, durationMonths, isParasiteControl
    } = body;

    let updateData = {};

    // CASO 1: Se está vinculando una Vacuna (Viene del modal de vacunas)
    if (vaccineId) {
      updateData = {
        $push: {
          vaccinesApplied: {
            vaccineId,
            appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
            lotNumber: lotNumber || ''
          }
        }
      };
    }
    // CASO 2: Viene del Modal de Antiparasitarios
    else if (isParasiteControl) {
      // 1. Primero creamos el registro de manera independiente en su propia colección
      const newParasiteRecord = await ParasiteControl.create({
        petId: id, // El ID de la mascota que viene de los params de la URL
        type,
        productName,
        durationMonths,
        appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
        notes: notes || ''
      });

      // 2. Preparamos el $push usando el _id del registro recién creado para meterselo a la mascota
      updateData = {
        $push: {
          parasitesControl: newParasiteRecord._id
        }
      };
    }
    // CASO 3: Actualización normal de la mascota
    else {
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

      // Si pasa las validaciones, preparamos el objeto de actualización básico
      updateData = {
        name,
        species,
        breed: breed || '',
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || '',
      };

    }



    // Buscar, actualizar y aplicar Populates correspondientes
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, owner: session.user.id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('species')
      .populate('vaccinesApplied.vaccineId')
      .populate('parasitesControl');

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
