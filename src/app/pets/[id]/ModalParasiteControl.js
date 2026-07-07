import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './petDetail.module.css';

export default function ModalParasiteControl({
  petId,
  isOpen,
  onClose,
  onSuccess
}) {
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Inicializamos el formulario respetando los tipos de tu modelo
  const [formData, setFormData] = useState({
    productName: '',
    type: '', // String enum: ['externo', 'interno', 'combinado']
    durationMonths: 1, // Number por defecto
    appliedAt: new Date().toISOString().split('T')[0], // Date formateado para input[type="date"]
    notes: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Si es durationMonths aseguramos que se guarde como un número entero
      [name]: name === 'durationMonths' ? parseInt(value, 10) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    debugger
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    // Validaciones básicas antes de enviar
    if (!formData.productName.trim() || !formData.type) {
      setModalError('Por favor, completa los campos obligatorios.');
      setSubmitting(false);
      return;
    }

    try {
      // Hacemos el PUT directo a la mascota (la estrategia unificada que armamos antes)
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 1. Primero creamos el registro por separado o enviamos los datos correspondientes para el Caso 2 del PUT
          // Nota: Si usas la estrategia del PUT que espera directamente el objeto o un parasiteControlId,
          // aquí mandamos las propiedades para que la API maneje la creación/vínculo.
          productName: formData.productName,
          type: formData.type,
          durationMonths: formData.durationMonths,
          appliedAt: formData.appliedAt,
          notes: formData.notes,
          isParasiteControl: true // Flag opcional para que tu PUT unificado sepa qué bloque ejecutar
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al guardar el registro antiparasitario.');
      }

      // Pasamos la mascota actualizada de vuelta al componente padre para que refresque la CustomTable
      if (onSuccess) {
        onSuccess(data);
      }

      // Reseteamos el formulario y cerramos el modal
      handleClose();
    } catch (error) {
      setModalError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productName: '',
      type: '',
      durationMonths: 1,
      appliedAt: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalError('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Agregar Registro Antiparasitario</h2>
          <button onClick={handleClose} className={styles.closeBtn} disabled={submitting}>
            <X size={20} />
          </button>
        </header>

        {modalError && <div className={styles.errorMsg}>{modalError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Campo: Nombre del Producto */}
          <div className={styles.formGroup}>
            <label htmlFor="productName" className={styles.label}>Nombre del Producto</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Ej. Bravecto, NexGard, Simparica"
              className={styles.input}
              required
              disabled={submitting}
            />
          </div>

          {/* Campo: Tipo (Enum de tu modelo) */}
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>Tipo de Parásito</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={styles.input}
              required
              disabled={submitting}
            >
              <option value="" disabled>-- Selecciona el tipo --</option>
              <option value="externo">Externo (Pulgas y Garrapatas)</option>
              <option value="interno">Interno (Lombrices y Gusanos)</option>
              <option value="combinado">Combinado (Ambos)</option>
            </select>
          </div>

          {/* Campo: Duración de la Protección (Number) */}
          <div className={styles.formGroup}>
            <label htmlFor="durationMonths" className={styles.label}>Duración de la protección (Meses)</label>
            <input
              type="number"
              id="durationMonths"
              name="durationMonths"
              min="1"
              max="12"
              value={formData.durationMonths}
              onChange={handleInputChange}
              placeholder="Ej. 3"
              className={styles.input}
              required
              disabled={submitting}
            />
          </div>

          {/* Campo: Fecha de Aplicación (Date) */}
          <div className={styles.formGroup}>
            <label htmlFor="appliedAt" className={styles.label}>Fecha de Aplicación</label>
            <input
              type="date"
              id="appliedAt"
              name="appliedAt"
              value={formData.appliedAt}
              onChange={handleInputChange}
              className={styles.input}
              required
              disabled={submitting}
            />
          </div>

          {/* Campo: Notas Adicionales */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Notas adicionales</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ej. Dosis completa ingerida con el alimento."
              className={styles.textarea}
              rows="3"
              disabled={submitting}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleClose}
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
              {submitting ? 'Guardando...' : 'Guardar Antiparasitario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}