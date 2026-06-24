import Link from 'next/link';
import { Heart, Calendar, ShieldAlert, FileText } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.nav}>
        <div className={styles.logo}>
          <Heart size={24} fill="var(--primary)" />
          <span>Perseo Pet</span>
        </div>
        <div className={styles.navButtons}>
          <Link href="/login" className={styles.navLink}>
            Iniciar Sesión
          </Link>
          <Link href="/register" className={styles.navButtonPrimary}>
            Regístrate
          </Link>
        </div>
      </header>

      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            El cuidado de tus mascotas *, <span className={styles.highlight}>en un solo lugar</span>
          </h1>
          <p className={styles.description}>
            Lleva el registro completo de vacunas, desparasitaciones, citas médicas y tareas
            diarias para tus mejores amigos. Recibe alertas y mantén su salud bajo control.
          </p>
          <div className={styles.ctas}>
            <Link href="/register" className={styles.btnPrimary}>
              Comenzar Gratis
            </Link>
            <Link href="/login" className={styles.btnSecondary}>
              Ver mi Panel
            </Link>
          </div>
        </div>
      </main>

      <section className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Calendar size={24} />
          </div>
          <h3 className={styles.featureTitle}>Línea de Tiempo</h3>
          <p className={styles.featureDescription}>
            Visualiza de forma cronológica el historial médico y de cuidados de cada una de tus mascotas.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <ShieldAlert size={24} />
          </div>
          <h3 className={styles.featureTitle}>Alertas Inteligentes</h3>
          <p className={styles.featureDescription}>
            Recibe recordatorios automáticos de las próximas vacunas y visitas médicas para no saltarte nada.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FileText size={24} />
          </div>
          <h3 className={styles.featureTitle}>Registro Detallado</h3>
          <p className={styles.featureDescription}>
            Registra tratamientos, dosis, médicos veterinarios tratantes y añade anotaciones importantes.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Perseo Pet. Hecho con amor para los consentidos de la casa.</p>
      </footer>
    </div>
  );
}
