import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import Vaccines from '@/models/Vaccine';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
    try {
        await dbConnect();

        // Validar sesión del usuario
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
        }

        let vaccinesList = await Vaccines.find({}).sort({ name: 1 });

        // Auto-seeding si la colección está vacía
        if (vaccinesList.length === 0) {
            const vaccinesToInsert = DEFAULT_SPECIES.map((name) => ({ name }));
            await Vaccines.insertMany(vaccinesToInsert);
            vaccinesList = await Vaccines.find({}).sort({ name: 1 });
        }

        return NextResponse.json(vaccinesList);
    } catch (error) {
        console.error('Error en GET /api/vaccines:', error);
        return NextResponse.json(
            { error: 'Ocurrió un error al obtener el catálogo de vacunas.' },
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
                { error: 'El nombre de la vacuna es obligatorio.' },
                { status: 400 }
            );
        }

        const normalizedName = name.trim();

        // Verificar si ya existe (insensible a mayúsculas/minúsculas)
        const existingVaccine = await Vaccines.findOne({
            name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
        });

        if (existingVaccine) {
            return NextResponse.json(existingVaccine, { status: 200 }); // Devolvemos la especie existente si ya existe
        }

        const newVaccine = await Vaccines.create({ name: normalizedName });

        return NextResponse.json(newVaccine, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/vaccines:', error);
        return NextResponse.json(
            { error: 'Ocurrió un error al registrar la vacuna.' },
            { status: 500 }
        );
    }
}
