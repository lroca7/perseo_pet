'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  ArrowLeft,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Trash2,
  Edit,
  Calendar,
  Scale,
  FileText,
  AlertCircle,
  Syringe,
  PawPrint,
  Clock,
  X,
  Plus,
} from 'lucide-react';
import styles from './petDetail.module.css';
import CustomTable from '@/components/CustomTable/CustomTable';
import ModalParasiteControl from './ModalParasiteControl';

export default function PetDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [species, setSpecies] = useState([]);
  const [showNewSpeciesInput, setShowNewSpeciesInput] = useState(false);

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

  // Estados para vacunas
  const [isModalOpenVaccine, setIsModalOpenVaccine] = useState(false);
  const [isEditingVaccine, setIsEditingVaccine] = useState(false);
  const [submittingVaccine, setSubmittingVaccine] = useState(false);
  const [modalErrorVaccine, setModalErrorVaccine] = useState('');

  const [availableVaccines, setAvailableVaccines] = useState([]);

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchPetDetail();
      fetchSpecies();
    }
  }, [status, params.id]);

  /** Estados para vacunas */
  const [formDataVaccines, setFormDataVaccines] = useState({
    vaccineId: '', // Aquí guardaremos el ObjectId de la vacuna elegida
    appliedAt: new Date().toISOString().split('T')[0], // Fecha actual por defecto YYYY-MM-DD
    lotNumber: ''
  });

  /** Estados para control de parasitos */
  const [formDataParasites, setFormDataParasites] = useState({
    type: '',
    productName: '',
    durationMonths: 1,
    appliedAt: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchPetDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pets/${params.id}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al obtener la mascota.');
      }
      const petData = await res.json();
      setPet(petData);

      // Cargar catálogo de vacunas
      const vaccinesRes = await fetch('/api/vaccines');
      if (!vaccinesRes.ok) throw new Error('Error al obtener el catálogo de vacunas.');
      const vaccinesData = await vaccinesRes.json();
      setAvailableVaccines(vaccinesData);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecies = async () => {
    try {
      const res = await fetch('/api/species');
      if (res.ok) {
        const data = await res.json();
        setSpecies(data);
      }
    } catch (err) {
      console.error('Error al cargar especies:', err);
    }
  };

  // Helper para calcular la edad detallada
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

    if (years < 0) return null;

    if (years === 0) {
      if (months === 0) return 'Menos de un mes';
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    if (months === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  // Formatear fecha legible
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Icono dinámico según la especie
  const getSpeciesIcon = (speciesName, size = 24) => {
    if (!speciesName) return <Dog size={size} />;
    const normalized = speciesName.toLowerCase();
    if (normalized.includes('perro')) return <Dog size={size} />;
    if (normalized.includes('gato')) return <Cat size={size} />;
    if (normalized.includes('ave') || normalized.includes('pájaro')) return <Bird size={size} />;
    if (normalized.includes('conejo')) return <Rabbit size={size} />;
    return <Heart size={size} fill="var(--primary)" />;
  };

  // ===== Modal de edición =====
  const handleOpenEditModal = () => {
    if (!pet) return;

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
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpeciesChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, speciesId: value }));
    setShowNewSpeciesInput(value === 'new');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      let finalSpeciesId = formData.speciesId;

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

        setSpecies((prev) => {
          const exists = prev.some((s) => s._id === specData._id);
          if (exists) return prev;
          return [...prev, specData].sort((a, b) => a.name.localeCompare(b.name));
        });
      }

      const petPayload = {
        name: formData.name,
        species: finalSpeciesId,
        breed: formData.breed,
        gender: formData.gender,
        birthDate: formData.birthDate || null,
        weight: formData.weight || null,
        notes: formData.notes,
      };

      const petRes = await fetch(`/api/pets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petPayload),
      });

      const petData = await petRes.json();
      if (!petRes.ok) {
        throw new Error(petData.error || 'Error al actualizar la mascota.');
      }

      setPet(petData);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    if (!pet) return;
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${pet.name}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/pets/${params.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar la mascota.');
      }
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo eliminar la mascota.');
    }
  };


  const handleOpenAddModalVaccine = () => {
    setFormDataVaccines({
      vaccineId: '',
      appliedAt: new Date().toISOString().split('T')[0],
      lotNumber: ''
    });
    setIsEditingVaccine(false);
    setModalErrorVaccine('');
    setIsModalOpenVaccine(true);
  };

  const handleInputChangeVaccines = (e) => {
    const { name, value } = e.target;
    setFormDataVaccines((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModalVaccine = () => {
    setIsModalOpenVaccine(false);
  };

  const handleSubmitVaccine = async (e) => {
    e.preventDefault();
    setModalErrorVaccine('');
    setSubmittingVaccine(true);

    try {
      debugger
      const res = await fetch(`/api/pets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataVaccines),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la vacuna.');
      }

      setPet(data);
      setIsModalOpenVaccine(false);
    } catch (error) {
      console.error(error);
      alert(error.message || 'No se pudo guardar la vacuna.');
    } finally {
      setSubmittingVaccine(false);
    }
  };

  const vaccineColumns = [
    { header: 'Vacuna', key: 'vaccineId.name', type: 'string', isPrimary: true },
    { header: 'Número de Lote', key: 'lotNumber', type: 'badge-blue' },
    { header: 'Fecha de Aplicación', key: 'appliedAt', type: 'date' }
  ];

  const handleDeleteVaccine = (id) => {
    console.log("Eliminar vacuna con ID:", id);
  };

  // Estado para controlar la apertura del modal antiparasitario
  const [isParasiteModalOpen, setIsParasiteModalOpen] = useState(false);

  const parasiteColumns = [
    { header: 'Producto', key: 'productName', type: 'string' },
    { header: 'Tipo', key: 'type', type: 'string' },
    { header: 'Duración', key: 'durationMonths', type: 'number' },
    { header: 'Fecha de Aplicación', key: 'appliedAt', type: 'date' }
  ];

  const handleOpenParasiteModal = () => {
    setIsParasiteModalOpen(true);
  }
  // Función que se ejecuta cuando el modal guarda con éxito
  const handleParasiteSuccess = (updatedPetData) => {
    // Al hacer setPet con la nueva mascota devuelta por el backend,
    // la CustomTable se actualizará sola instantáneamente.
    setPet(updatedPetData);
  };

  const handleDeleteParasite = async (parasiteId) => {
    // Aquí pones tu lógica futura para eliminar de la colección independiente
    console.log("Eliminar registro id:", parasiteId);
  };

  // ===== Render states =====
  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando información de la mascota...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <h2>No se pudo cargar la información</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  const age = calculateAge(pet.birthDate);

  return (
    <div className={styles.container}>
      {/* Top navigation bar */}
      <header className={styles.header}>
        <button onClick={() => router.push('/dashboard')} className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>Mis Mascotas</span>
        </button>
        <div className={styles.headerActions}>
          <button onClick={handleOpenEditModal} className={styles.editButton}>
            <Edit size={16} />
            Editar
          </button>
          <button onClick={handleDeletePet} className={styles.deleteButton}>
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section className={styles.heroSection}>
        <div className={styles.heroAvatar}>
          {getSpeciesIcon(pet.species?.name, 48)}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{pet.name}</h1>
          <div className={styles.heroMeta}>
            <span className={styles.speciesBadge}>
              <PawPrint size={14} />
              {pet.species?.name || 'Desconocido'}
            </span>
            {pet.breed && (
              <span className={styles.breedBadge}>{pet.breed}</span>
            )}
            <span className={styles.genderBadge} data-gender={pet.gender}>
              {pet.gender === 'macho' ? '♂ Macho' : '♀ Hembra'}
            </span>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <section className={styles.statsGrid}>
        {age && (
          <div className={styles.statCard}>
            <div className={styles.statIcon} data-color="blue">
              <Calendar size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Edad</span>
              <span className={styles.statValue}>{age}</span>
            </div>
          </div>
        )}

        {pet.birthDate && (
          <div className={styles.statCard}>
            <div className={styles.statIcon} data-color="purple">
              <Clock size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Fecha de nacimiento</span>
              <span className={styles.statValue}>{formatDate(pet.birthDate)}</span>
            </div>
          </div>
        )}

        {pet.weight && (
          <div className={styles.statCard}>
            <div className={styles.statIcon} data-color="green">
              <Scale size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Peso</span>
              <span className={styles.statValue}>{pet.weight} kg</span>
            </div>
          </div>
        )}

        <div className={styles.statCard}>
          <div className={styles.statIcon} data-color="orange">
            <Syringe size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Vacunas</span>
            <span className={styles.statValue}>Próximamente</span>
          </div>
        </div>
      </section>

      {/* Notes section */}
      {pet.notes && (
        <section className={styles.notesSection}>
          <h2 className={styles.sectionTitle}>
            <FileText size={18} />
            Notas y cuidados especiales
          </h2>
          <div className={styles.notesContent}>
            <p>{pet.notes}</p>
          </div>
        </section>
      )}

      {/* Sección del Historial de Vacunación en formato de Tabla */}
      <section className={styles.vaccionesSection}>
        <section className={styles.sectionTitle}>
          <h2><Syringe size={18} />
            Historial de Vacunación
          </h2>
          <button
            className={styles.addPetBtn}

            onClick={handleOpenAddModalVaccine}
          >
            <Plus size={14} /> Aplicar Vacuna
          </button>

        </section>
        <div className={styles.vaccinesContent}>

          {!pet.vaccinesApplied || pet.vaccinesApplied.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p style={{ margin: 0 }}>Esta mascota aún no tiene vacunas registradas en su historial.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}> {/* Contenedor para hacer la tabla responsiva */}
              <CustomTable
                data={pet.vaccinesApplied}
                columns={vaccineColumns}
                onDelete={handleDeleteVaccine}
                emptyMessage="No hay vacunas registradas para esta mascota"
              />
            </div>
          )}
        </div>




      </section>

      {/* Sección Control parasitos */}
      <section className={styles.vaccionesSection}>
        <section className={styles.sectionTitle}>
          <h2><Syringe size={18} />
            Control parasitos
          </h2>
          <button
            className={styles.addPetBtn}

            onClick={handleOpenParasiteModal}
          >
            <Plus size={14} /> Aplicar Vacuna
          </button>

        </section>
        <div className={styles.vaccinesContent}>

          {!pet.parasitesControl || pet.parasitesControl.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p style={{ margin: 0 }}>Esta mascota aún no tiene antiparasitarios registrados en su historial.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}> {/* Contenedor para hacer la tabla responsiva */}
              <CustomTable
                data={pet.parasitesControl}
                columns={parasiteColumns}
                onDelete={handleDeleteParasite}
                emptyMessage="No hay vacunas registradas para esta mascota"
              />
            </div>
          )}
        </div>




      </section>

      {/* Timestamps */}
      <section className={styles.timestampsSection}>
        <div className={styles.timestamp}>
          <span className={styles.timestampLabel}>Registrado:</span>
          <span>{formatDate(pet.createdAt)}</span>
        </div>
        {pet.updatedAt && pet.updatedAt !== pet.createdAt && (
          <div className={styles.timestamp}>
            <span className={styles.timestampLabel}>Última actualización:</span>
            <span>{formatDate(pet.updatedAt)}</span>
          </div>
        )}
      </section>

      {/* ===== Modal de Edición ===== */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Mascota</h2>
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
                <label htmlFor="edit-name" className={styles.label}>Nombre completo *</label>
                <input
                  type="text"
                  id="edit-name"
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
                <label htmlFor="edit-speciesId" className={styles.label}>Especie *</label>
                <select
                  id="edit-speciesId"
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
                    <label htmlFor="edit-newSpeciesName" className={styles.label} style={{ fontSize: '0.8rem' }}>
                      Nombre de la nueva especie *
                    </label>
                    <input
                      type="text"
                      id="edit-newSpeciesName"
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
                <label htmlFor="edit-breed" className={styles.label}>Raza</label>
                <input
                  type="text"
                  id="edit-breed"
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
                <label htmlFor="edit-birthDate" className={styles.label}>Fecha de nacimiento</label>
                <input
                  type="date"
                  id="edit-birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={submitting}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-weight" className={styles.label}>Peso (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="edit-weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Ej. 12.5"
                  className={styles.input}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-notes" className={styles.label}>Notas especiales o cuidados</label>
                <textarea
                  id="edit-notes"
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
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vacunas */}
      {isModalOpenVaccine && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEditingVaccine ? 'Editar Aplicación de Vacuna' : 'Registrar Vacuna Aplicada'}
              </h2>
              <button onClick={handleCloseModalVaccine} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </header>

            {modalErrorVaccine && <div className={styles.errorMsg}>{modalErrorVaccine}</div>}

            <form onSubmit={handleSubmitVaccine} className={styles.form}>

              {/* CAMBIO AQUÍ: Selección de la vacuna desde el catálogo */}
              <div className={styles.formGroup}>
                <label htmlFor="vaccineId" className={styles.label}>Selecciona la Vacuna</label>
                <select
                  id="vaccineId"
                  name="vaccineId"
                  value={formDataVaccines.vaccineId}
                  onChange={handleInputChangeVaccines}
                  className={styles.input}
                  required
                  disabled={submittingVaccine}
                >
                  <option value="" disabled>-- Selecciona una vacuna del catálogo --</option>
                  {availableVaccines.map((vaccine) => (
                    <option key={vaccine._id} value={vaccine._id}>
                      {vaccine.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Fecha de Aplicación */}
              <div className={styles.formGroup}>
                <label htmlFor="appliedAt" className={styles.label}>Fecha de Aplicación</label>
                <input
                  type="date"
                  id="appliedAt"
                  name="appliedAt"
                  value={formDataVaccines.appliedAt}
                  onChange={handleInputChangeVaccines}
                  className={styles.input}
                  required
                  disabled={submittingVaccine}
                />
              </div>

              {/* Campo: Número de Lote */}
              <div className={styles.formGroup}>
                <label htmlFor="lotNumber" className={styles.label}>Número de Lote</label>
                <input
                  type="text"
                  id="lotNumber"
                  name="lotNumber"
                  value={formDataVaccines.lotNumber}
                  onChange={handleInputChangeVaccines}
                  placeholder="Ej. LOT-12345 (Opcional)"
                  className={styles.input}
                  disabled={submittingVaccine}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModalVaccine}
                  className={styles.cancelBtn}
                  disabled={submittingVaccine}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submittingVaccine}
                >
                  {submittingVaccine ? 'Guardando...' : 'Guardar Vacuna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalParasiteControl
        petId={pet._id}
        isOpen={isParasiteModalOpen}
        onClose={() => setIsParasiteModalOpen(false)}
        onSuccess={handleParasiteSuccess} // Recibe la info actualizada
      />
    </div>
  );
}
