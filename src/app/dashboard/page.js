'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Plus,
  LogOut,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Trash2,
  Edit,
  Eye,
  X,
  Calendar,
  Scale,
  FileText,
  AlertCircle
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Estados para Mascotas y Catálogo de Especies
  const [pets, setPets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPetId, setCurrentPetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Formulario reactivo
  const [formData, setFormData] = useState({
    name: '',
    speciesId: '',
    breed: '',
    gender: 'macho',
    birthDate: '',
    weight: '',
    notes: '',
    newSpeciesName: '',
  });

  const [showNewSpeciesInput, setShowNewSpeciesInput] = useState(false);

  // Cargar datos al montar la página
  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Cargar mascotas
      const petsRes = await fetch('/api/pets');

      if (!petsRes.ok) throw new Error('Error al obtener la lista de mascotas.');
      const petsData = await petsRes.json();
      setPets(petsData);

      // Cargar catálogo de especies      
      const speciesRes = await fetch('/api/species');
      if (!speciesRes.ok) throw new Error('Error al obtener el catálogo de especies.');
      const speciesData = await speciesRes.json();
      setSpecies(speciesData);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Helper para calcular la edad detallada de la mascota
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years < 0) return null; // Fecha futura inválida

    if (years === 0) {
      if (months === 0) {
        return 'Menos de un mes';
      }
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    if (months === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  // Icono dinámico según la especie
  const getSpeciesIcon = (speciesName) => {
    if (!speciesName) return <Dog size={24} />;
    const normalized = speciesName.toLowerCase();
    if (normalized.includes('perro')) return <Dog size={24} />;
    if (normalized.includes('gato')) return <Cat size={24} />;
    if (normalized.includes('ave') || normalized.includes('pájaro')) return <Bird size={24} />;
    if (normalized.includes('conejo')) return <Rabbit size={24} />;
    return <Heart size={20} fill="var(--primary)" />;
  };

  // Manejadores del Formulario y Modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpeciesChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, speciesId: value }));
    if (value === 'new') {
      setShowNewSpeciesInput(true);
    } else {
      setShowNewSpeciesInput(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      speciesId: species[0]?._id || '',
      breed: '',
      gender: 'macho',
      birthDate: '',
      weight: '',
      notes: '',
      newSpeciesName: '',
    });
    setShowNewSpeciesInput(false);
    setIsEditing(false);
    setCurrentPetId(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pet) => {
    // Formatear la fecha para el input type="date" (YYYY-MM-DD)
    let formattedDate = '';
    if (pet.birthDate) {
      formattedDate = new Date(pet.birthDate).toISOString().split('T')[0];
    }

    setFormData({
      name: pet.name,
      speciesId: pet.species?._id || pet.species || '',
      breed: pet.breed || '',
      gender: pet.gender,
      birthDate: formattedDate,
      weight: pet.weight || '',
      notes: pet.notes || '',
      newSpeciesName: '',
    });
    setShowNewSpeciesInput(false);
    setIsEditing(true);
    setCurrentPetId(pet._id);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      let finalSpeciesId = formData.speciesId;

      // 1. Si se va a registrar una nueva especie primero
      if (formData.speciesId === 'new') {
        if (!formData.newSpeciesName || formData.newSpeciesName.trim() === '') {
          throw new Error('Por favor, ingresa el nombre de la nueva especie.');
        }

        const specRes = await fetch('/api/species', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.newSpeciesName }),
        });

        const specData = await specRes.json();
        if (!specRes.ok) {
          throw new Error(specData.error || 'Error al registrar la nueva especie.');
        }

        finalSpeciesId = specData._id;

        // Actualizar el catálogo local de especies
        setSpecies((prev) => {
          const exists = prev.some((s) => s._id === specData._id);
          if (exists) return prev;
          return [...prev, specData].sort((a, b) => a.name.localeCompare(b.name));
        });
      }

      // 2. Guardar o actualizar mascota
      const petPayload = {
        name: formData.name,
        species: finalSpeciesId,
        breed: formData.breed,
        gender: formData.gender,
        birthDate: formData.birthDate || null,
        weight: formData.weight || null,
        notes: formData.notes,
      };

      const url = isEditing ? `/api/pets/${currentPetId}` : '/api/pets';
      const method = isEditing ? 'PUT' : 'POST';

      const petRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petPayload),
      });

      const petData = await petRes.json();
      if (!petRes.ok) {
        throw new Error(petData.error || 'Error al registrar la mascota.');
      }

      // 3. Actualizar estado local de mascotas
      if (isEditing) {
        setPets((prev) => prev.map((p) => (p._id === currentPetId ? petData : p)));
      } else {
        setPets((prev) => [petData, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async (petId, petName) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${petName}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar la mascota.');
      }

      // Remover del estado local
      setPets((prev) => prev.filter((p) => p._id !== petId));
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo eliminar la mascota.');
    }
  };

  // Renderizar estados de carga y errores del Dashboard principal
  if (status === 'loading') {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redireccionado por proxy.js
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Heart size={20} fill="var(--primary)" />
          <span>Perseo Pet</span>
        </div>
        <div className={styles.userMenu}>
          <span className={styles.welcomeText}>Hola, {session?.user?.name || 'Usuario'}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutButton}>
            <LogOut size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleSection}>
          <div>
            <h1 className={styles.title}>Mis Mascotas</h1>
            <p className={styles.subtitle}>Gestiona tus mascotas y sus próximos cuidados</p>
          </div>
          <button onClick={handleOpenAddModal} className={styles.addPetBtn}>
            <Plus size={16} />
            Agregar Mascota
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert} style={{ margin: '1rem 0' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Cargando tus mascotas...</p>
          </div>
        ) : pets.length === 0 ? (
          /* Empty state */
          <div className={styles.emptyState}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
              <Dog size={48} />
            </div>
            <h2 className={styles.emptyTitle}>No tienes mascotas registradas</h2>
            <p className={styles.emptyDescription}>
              Para comenzar a registrar vacunas, desparasitaciones o citas, primero agrega a tu mejor amigo.
            </p>
            <button onClick={handleOpenAddModal} className={styles.addPetBtn}>
              <Plus size={16} />
              Registrar mi primera mascota
            </button>
          </div>
        ) : (
          /* Grid de Mascotas */
          <div className={styles.petGrid}>
            {pets.map((pet) => (
              <article key={pet._id} className={styles.petCard}>
                <Link href={`/pets/${pet._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <header className={styles.petCardHeader}>
                    <div className={styles.petAvatar}>
                      {getSpeciesIcon(pet.species?.name)}
                    </div>
                    <div className={styles.petInfo}>
                      <h3 className={styles.petName}>{pet.name}</h3>
                      <span className={styles.petSpecies}>{pet.species?.name || 'Desconocido'}</span>
                    </div>
                  </header>

                  <div className={styles.petCardBody}>
                    {pet.breed && (
                      <div className={styles.petMetaItem}>
                        <strong>Raza:</strong> <span>{pet.breed}</span>
                      </div>
                    )}
                    <div className={styles.petMetaItem}>
                      <strong>Género:</strong> <span style={{ textTransform: 'capitalize' }}>{pet.gender}</span>
                    </div>
                    {pet.birthDate && (
                      <div className={styles.petMetaItem}>
                        <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                        <span>Edad: {calculateAge(pet.birthDate) || 'Fecha inválida'}</span>
                      </div>
                    )}
                    {pet.weight && (
                      <div className={styles.petMetaItem}>
                        <Scale size={14} style={{ color: 'var(--text-light)' }} />
                        <span>Peso: {pet.weight} kg</span>
                      </div>
                    )}
                    {pet.notes && (
                      <div className={styles.petNotes} title={pet.notes}>
                        {pet.notes}
                      </div>
                    )}
                  </div>
                </Link>

                <footer className={styles.petCardFooter}>
                  <Link
                    href={`/pets/${pet._id}`}
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    title="Ver Detalle"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => handleOpenEditModal(pet)}
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    title="Editar Mascota"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet._id, pet.name)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Eliminar Mascota"
                  >
                    <Trash2 size={16} />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}

      </main>

      {/* Modal de Crear / Editar */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditing ? 'Editar Mascota' : 'Agregar Mascota'}
              </h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              {modalError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nombre completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Toby, Max"
                  className={styles.input}
                  required
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="speciesId" className={styles.label}>Especie *</label>
                <select
                  id="speciesId"
                  name="speciesId"
                  value={formData.speciesId}
                  onChange={handleSpeciesChange}
                  className={styles.select}
                  required
                  disabled={submitting}
                >
                  <option value="" disabled>Selecciona una especie</option>
                  {species.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                  <option value="new">+ Agregar nueva especie...</option>
                </select>

                {showNewSpeciesInput && (
                  <div className={styles.newSpeciesGroup}>
                    <label htmlFor="newSpeciesName" className={styles.label} style={{ fontSize: '0.8rem' }}>
                      Nombre de la nueva especie *
                    </label>
                    <input
                      type="text"
                      id="newSpeciesName"
                      name="newSpeciesName"
                      value={formData.newSpeciesName}
                      onChange={handleInputChange}
                      placeholder="Ej. Hurón, Hamster"
                      className={styles.input}
                      required={showNewSpeciesInput}
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="breed" className={styles.label}>Raza</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="Ej. Golden Retriever, Mestizo"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Género *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="macho"
                      checked={formData.gender === 'macho'}
                      onChange={handleInputChange}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    Macho
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="hembra"
                      checked={formData.gender === 'hembra'}
                      onChange={handleInputChange}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    Hembra
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="birthDate" className={styles.label}>Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={submitting}
                  max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="weight" className={styles.label}>Peso (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Ej. 12.5"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>Notas especiales o cuidados</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej. Alérgico a la penicilina, requiere dieta especial..."
                  className={styles.textarea}
                  rows="3"
                  disabled={submitting}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar Mascota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
