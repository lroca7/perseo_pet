# Plan de Implementación: Rastreador de Actividades para Mascotas (MongoDB & NextAuth)

Este proyecto tiene como objetivo crear una aplicación web moderna y responsive para registrar y gestionar las actividades de tus mascotas (vacunas, desparasitación, citas médicas, etc.) utilizando **React**, **Next.js (App Router)**, **MongoDB** como base de datos y **NextAuth.js** para la autenticación de usuarios.

---

## Decisiones de Diseño Confirmadas

- **Base de Datos:** MongoDB (utilizaremos la capa gratuita de MongoDB Atlas y `mongoose` para el modelado de datos en Next.js).
- **Autenticación:** Sí, utilizaremos **NextAuth.js (Auth.js)** para asegurar que cada usuario solo acceda a los datos de sus propias mascotas. Configuraremos inicio de sesión con credenciales (usuario/contraseña) o proveedores OAuth (por ejemplo, Google o GitHub).
- **Estilos:** **CSS Modules** para mantener estilos limpios, aislados y reutilizables con un diseño premium y responsive.
- **Notificaciones/Recordatorios:** Sí, implementaremos un sistema de notificaciones en la aplicación (avisos visuales sobre próximas vacunas o citas) y una sección de tareas pendientes/alertas en el Dashboard.

---

## Características de la Aplicación (MVP)

1. **Autenticación de Usuarios:**
   - Registro e inicio de sesión seguro.
2. **Gestión de Mascotas:**
   - Crear, editar y eliminar perfiles de mascotas (Nombre, tipo de mascota, raza, fecha de nacimiento, foto URL).
3. **Registro de Actividades (Historial):**
   - Categorías: Vacunas, Desparasitación, Citas Médicas, Alimentación, Higiene, Notas.
   - Campos: Fecha, mascota, tipo de actividad, descripción, veterinario (opcional), fecha del próximo recordatorio (opcional).
4. **Dashboard y Notificaciones:**
   - Panel principal interactivo.
   - Centro de notificaciones en la app para alertar cuando se acerque la fecha de una vacuna o cita.
5. **Calendario / Historial Visual:**
   - Una línea de tiempo clara y organizada por mascota.

---

## Arquitectura Tecnológica

- **Framework:** Next.js 14+ (App Router).
- **Base de Datos:** MongoDB Atlas (Mongoose como ODM).
- **Autenticación:** NextAuth.js con MongoDB Adapter.
- **Estilos:** CSS Modules + Variables CSS globales (tema claro/oscuro auto-detectado).
- **Iconos:** `lucide-react`.

---

## Cambios Propuestos

Dado que el directorio de trabajo `f:\projects\perseo_pet` está vacío, iniciaremos el proyecto desde cero y crearemos los archivos correspondientes.

### Estructura del Proyecto

#### [NEW] [Inicialización del Proyecto](file:///f:/projects/perseo_pet)
Ejecutaremos la inicialización de un proyecto Next.js en el workspace.

#### [NEW] [Configuración de Base de Datos](file:///f:/projects/perseo_pet/src/lib/mongodb.js)
Configuración de la conexión a MongoDB utilizando Mongoose, asegurando la reutilización de conexiones en entornos de desarrollo sin servidor (Serverless).

#### [NEW] [Modelos de Datos (Mongoose)](file:///f:/projects/perseo_pet/src/models)
- [User.js](file:///f:/projects/perseo_pet/src/models/User.js): Modelo de usuario para autenticación.
- [Pet.js](file:///f:/projects/perseo_pet/src/models/Pet.js): Información de las mascotas (asociadas a un `userId`).
- [Activity.js](file:///f:/projects/perseo_pet/src/models/Activity.js): Registro de actividades (vacunas, citas, etc.), asociadas a un `petId` and `userId`.

#### [NEW] [Configuración de Autenticación](file:///f:/projects/perseo_pet/src/app/api/auth/%5B...nextauth%5D/route.js)
Configuración de las rutas de API de NextAuth para manejar el login, registro y sesiones de usuario.

#### [NEW] [Sistema de Notificaciones](file:///f:/projects/perseo_pet/src/app/api/notifications/route.js)
Ruta de API para calcular y devolver notificaciones basadas en las actividades que tienen una fecha de próximo recordatorio cercana.

#### [NEW] [Estilos CSS Modules](file:///f:/projects/perseo_pet/src/app/globals.css)
Definición del sistema de diseño (colores modernos, tipografías premium, animaciones base) en archivos CSS Modules independientes por componente para aislamiento.

#### [NEW] [Componentes y Páginas UI](file:///f:/projects/perseo_pet/src/app)
- `app/layout.js`: Layout principal con el proveedor de sesión de NextAuth y barra de navegación.
- `app/page.js`: Landing page de bienvenida y acceso rápido.
- `app/dashboard/page.js`: Panel general del usuario con lista de mascotas y alertas/notificaciones activas.
- `app/pet/[id]/page.js`: Detalle de mascota, historial completo en formato línea de tiempo y formulario para agregar actividades.

---

## Plan de Verificación

### Pruebas de Desarrollo y Manuales
- **Autenticación:** Probar el registro de usuarios, login exitoso y bloqueo de rutas protegidas (ej. no se puede ver el dashboard sin haber iniciado sesión).
- **CRUD de Mascotas:** Verificar que las mascotas se guarden asociadas correctamente al ID del usuario logueado en MongoDB.
- **Registro y Alertas:** Crear una actividad con un recordatorio para mañana y verificar que aparezca una alerta en el centro de notificaciones.
- **Aislamiento de CSS:** Asegurar que los CSS Modules no colisionen entre componentes.
