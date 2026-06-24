'use client';

import { useSession, signOut } from 'next-auth/react';
import { Heart, Plus, LogOut, Dog } from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Cargando panel...</p>
      </div>
    );
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
          <button className={styles.addPetBtn}>
            <Plus size={16} />
            Agregar Mascota
          </button>
        </div>

        {/* Empty state placeholder for now */}
        <div className={styles.emptyState}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Dog size={48} />
          </div>
          <h2 className={styles.emptyTitle}>No tienes mascotas registradas</h2>
          <p className={styles.emptyDescription}>
            Para comenzar a registrar vacunas, desparasitaciones o citas, primero agrega a tu mejor amigo.
          </p>
          <button className={styles.addPetBtn}>
            <Plus size={16} />
            Registrar mi primera mascota
          </button>
        </div>
      </main>
    </div>
  );
}
