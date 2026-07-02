# Historias de Usuario: Rastreador de Actividades para Mascotas

Este documento detalla las historias de usuario necesarias para construir el MVP de la aplicación de gestión de actividades de mascotas.

---

### HU1: Registro e Inicio de Sesión de Usuario
**Como** dueño de mascotas  
**Quiero** poder registrarme e iniciar sesión con mi correo y contraseña  
**Para** que la información de mis mascotas esté segura y sea accesible solo para mí.

#### Criterios de Aceptación:
- [ ] Debe haber una interfaz limpia para registrarse (nombre, correo y contraseña).
- [ ] Debe haber una interfaz para iniciar sesión.
- [ ] Al iniciar sesión correctamente, el usuario debe ser redirigido al Dashboard.
- [ ] Las páginas del Dashboard y perfiles de mascotas deben ser privadas; si un usuario no autenticado intenta acceder, debe ser redirigido al login.
- [ ] Las contraseñas deben guardarse encriptadas en la base de datos (usando `bcrypt`).

---

### HU2: Gestión de Perfiles de Mascotas
**Como** dueño de mascotas  
**Quiero** poder registrar, editar y eliminar los perfiles de mis mascotas (nombre, tipo, raza, fecha de nacimiento y foto)  
**Para** tener un espacio dedicado para cada una de ellas.

#### Criterios de Aceptación:
- [ ] Formulario de creación con campos requeridos: Nombre, Tipo de mascota (ej. Perro, Gato, Ave) y Fecha de nacimiento. Campos opcionales: Raza y URL de foto.
- [ ] Cada mascota guardada en MongoDB debe estar vinculada al `userId` del usuario logueado.
- [ ] Los usuarios deben poder editar la información de la mascota.
- [ ] Los usuarios deben poder eliminar una mascota (esto debe eliminar en cascada todas sus actividades asociadas).

---

### HU3: Registro de Actividades
**Como** dueño de mascotas  
**Quiero** registrar actividades específicas para una mascota (vacunas, desparasitación, visitas al veterinario, etc.) con sus respectivas fechas e indicaciones  
**Para** mantener un registro detallado de su salud y cuidados.

#### Criterios de Aceptación:
- [ ] Formulario accesible desde el detalle de la mascota para agregar una actividad.
- [ ] Categorías seleccionables: `Vacuna`, `Desparasitación`, `Cita Médica`, `Alimentación`, `Higiene`, `Notas`.
- [ ] Campos requeridos: Tipo de actividad, Fecha de realización y Descripción.
- [ ] Campos opcionales: Veterinario, Costo y Fecha de próximo recordatorio (para programar la siguiente dosis/cita).

---

### HU4: Historial / Línea de Tiempo de Actividades
**Como** dueño de mascotas  
**Quiero** visualizar una línea de tiempo ordenada cronológicamente de todas las actividades de mi mascota  
**Para** revisar fácilmente su historial médico y de cuidados en cualquier momento.

#### Criterios de Aceptación:
- [ ] En la página de detalle de cada mascota, debe mostrarse una línea de tiempo descendente (la actividad más reciente primero).
- [ ] Debe ser posible filtrar las actividades por tipo (ej. ver solo "Vacunas" o solo "Citas Médicas").
- [ ] Cada elemento de la línea de tiempo debe indicar claramente la fecha, el tipo de actividad y las notas asociadas.

---

### HU5: Panel de Alertas y Recordatorios
**Como** dueño de mascotas  
**Quiero** ver un listado de recordatorios y alertas en mi Dashboard principal para las actividades que están próximas a vencer  
**Para** asegurarme de no olvidar ninguna vacuna o cita médica importante.

#### Criterios de Aceptación:
- [ ] El Dashboard debe escanear las actividades que tengan una "Fecha de próximo recordatorio" en un rango de los próximos 7 días o que ya estén vencidas.
- [ ] Se debe mostrar una tarjeta de alerta con el nombre de la mascota, el tipo de actividad pendiente y los días restantes.
- [ ] Debe haber una opción visual para marcar el recordatorio como "completado" o "realizado" (lo que creará un nuevo registro de actividad).

---

### HU6: Esquema de Vacunación de Mascotas
**Como** dueño de mascotas  
**Quiero** registrar y consultar el esquema de vacunación de cada una de mis mascotas por separado  
**Para** mantener un registro detallado de las vacunas recibidas y programar las próximas dosis.

#### Criterios de Aceptación:
- [ ] Debe existir una pestaña o sección dedicada al "Esquema de Vacunación" en el detalle de cada mascota.
- [ ] Formulario de creación y edición de vacuna con los campos: Nombre de la vacuna (ej. Antirrábica), Fecha de aplicación, Próxima dosis (opcional), Nombre del veterinario (opcional), Lote/Marca (opcional) y Notas (opcional).
- [ ] Listado cronológico de vacunas aplicadas para la mascota.
- [ ] Posibilidad de editar o eliminar cualquier registro de vacunación.

---

### HU7: Registro de Desparasitaciones de Mascotas
**Como** dueño de mascotas  
**Quiero** registrar y consultar el historial de desparasitaciones de cada mascota por separado (tanto internas como externas)  
**Para** proteger la salud de mi mascota contra parásitos y saber cuándo toca la siguiente aplicación.

#### Criterios de Aceptación:
- [ ] Debe existir una pestaña o sección dedicada a "Desparasitaciones" en el detalle de la mascota.
- [ ] Formulario de creación y edición de desparasitación con los campos: Tipo (Interna / Externa), Producto/Marca, Fecha de aplicación, Próxima aplicación (opcional), Peso al momento (opcional) y Notas (opcional).
- [ ] Listado ordenado de las desparasitaciones realizadas.
- [ ] Posibilidad de editar o eliminar cualquier registro de desparasitación.

