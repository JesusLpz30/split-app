# Documentación de Split App

## 1. Introducción

Split App es una aplicación web diseñada para simplificar la gestión de finanzas compartidas entre amigos, parejas o cualquier grupo de personas. El objetivo principal es permitir a los usuarios llevar un registro claro y transparente de los gastos, ingresos y deudas dentro de un grupo, calculando automáticamente los saldos individuales para que todos sepan cuánto deben o cuánto se les debe en tiempo real. La aplicación busca eliminar la confusión y los cálculos manuales asociados a los gastos compartidos.

## 2. Mapa del Sitio y Flujo de Usuario

El flujo de la aplicación está diseñado para ser intuitivo, guiando al usuario desde el inicio de sesión hasta la gestión de sus finanzas grupales.

1.  **Autenticación (`/login`)**
    *   El usuario llega a una página de inicio de sesión.
    *   La única opción de registro e inicio de sesión es a través de una cuenta de Google para simplificar el proceso.

2.  **Dashboard Principal (`/`)**
    *   Una vez autenticado, el usuario es dirigido al dashboard.
    *   Aquí puede ver una lista de todos los grupos a los que pertenece.
    *   Desde esta vista, puede:
        *   Crear un nuevo grupo.
        *   Acceder a un grupo existente para ver los detalles.
        *   Ver un resumen de su saldo (cuánto debe o le deben) en cada grupo.

3.  **Vista de Grupo (`/group/:groupId`)**
    *   Al entrar a un grupo, el usuario ve el historial de todas las transacciones.
    *   **Componentes clave:**
        *   **Lista de Transacciones:** Muestra cada gasto, ingreso o pago con detalles (quién pagó, concepto, fecha, monto).
        *   **Balance General:** Muestra el estado financiero de cada miembro dentro del grupo (ej. "Ana le debe $50 a Juan").
        *   **Botones de Acción:**
            *   **Agregar Gasto/Ingreso/Pago:** Abre un formulario para registrar una nueva transacción.
            *   **Añadir Miembro:** Permite invitar a otros usuarios al grupo.
            *   **Editar Grupo:** Cambia el nombre del grupo.

4.  **Perfil de Usuario (`/profile`)**
    *   Accesible desde la barra de navegación.
    *   El usuario puede:
        *   Ver y cambiar su foto de perfil.
        *   Editar su nombre de usuario (cómo se muestra en la app).
        *   Ver su lista de amigos.
        *   Encontrar su código o enlace para compartir su perfil.
        *   Eliminar su cuenta de forma permanente.

5.  **Configuración (`/settings`)**
    *   Accesible desde la barra de navegación.
    *   El usuario puede:
        *   Cambiar el tema de la aplicación (Claro, Oscuro, Matrix).
        *   Administrar las categorías de gastos e ingresos (crear, editar, eliminar).

## 3. Lógica del Código y Arquitectura

La aplicación está construida con **React** y **Vite**, utilizando **Firebase** como backend (Firestore, Authentication, Storage).

### 3.1. Estructura de Carpetas (Frontend)

*   `src/components`: Contiene todos los componentes reutilizables de React, organizados por funcionalidad (Auth, Dashboard, Groups, Layout, Profile, Settings).
*   `src/context`: Maneja el estado global de la aplicación a través de React Context (AuthContext, GroupContext, ThemeContext).
*   `src/firebase`: Centraliza toda la comunicación con Firebase.
    *   `config.js`: Inicialización de Firebase.
    *   `authService.js`: Lógica de autenticación (Google Sign-In, Sign-Out, gestión de perfiles de Auth).
    *   `firestoreService.js`: Operaciones CRUD para la base de datos Firestore (grupos, transacciones, usuarios).
    *   `storageService.js`: Lógica para subir y eliminar archivos (imágenes de perfil).
*   `src/router`: Define las rutas de la aplicación y protege aquellas que requieren autenticación.

### 3.2. Lógica de Transacciones (Core)

Esta es la parte más crítica de la aplicación.

1.  **Transacciones Personales:** Cada transacción (gasto, ingreso, pago) es registrada por el usuario que la realiza. No se puede registrar una transacción a nombre de otra persona.

2.  **Tipos de Transacciones:**
    *   **Gasto Compartido:** Un usuario paga por algo que se divide entre varios miembros del grupo (ej. cena). La división puede ser equitativa o por porcentajes específicos.
    *   **Préstamo:** Un usuario le da dinero a otro. Se genera una deuda directa del 100% del monto.
    *   **Ingreso Compartido:** Un ingreso de dinero que se divide entre los miembros del grupo (ej. devolución de un depósito).
    *   **Saldar Cuenta (Pago):** Un usuario le paga a otro para reducir o eliminar su deuda.

3.  **Confirmación de Pagos:** Cuando un usuario registra un pago (Préstamo o Saldar Cuenta) destinado a otro miembro, la transacción queda en estado **"pendiente"**. El usuario receptor debe **aceptarla** para que se refleje en los saldos. Esto evita discrepancias.

4.  **Cálculo de Balances:** Los saldos se calculan en tiempo real. Por cada transacción, el sistema determina cómo afecta la deuda entre los participantes y actualiza el balance general del grupo.

### 3.3. Estructura de Datos (Firestore)

*   **Colección `users`:**
    *   Documento por cada usuario (`uid`).
    *   Campos: `displayName`, `email`, `photoURL`, `groups` (array de IDs de grupo), `friends` (array de UIDs de amigos).

*   **Colección `groups`:**
    *   Documento por cada grupo.
    *   Campos: `name`, `members` (array de UIDs), `memberDetails` (array de objetos con uid, displayName, etc.), `createdBy`.
    *   **Subcolección `transactions`:**
        *   Documento por cada transacción.
        *   Campos: `type` (gasto, préstamo, etc.), `amount`, `description`, `createdBy` (uid), `date`, `participants` (quiénes están involucrados y cómo), `status` (ej. "pendiente", "completado").

