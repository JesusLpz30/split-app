# Documentación de Counter Wizard

### Visión y Objetivos de Counter Wizard

**Nombre de la Aplicación:** Counter Wizard

**1. Visión a Largo Plazo:**
Counter Wizard aspira a ser una herramienta integral y accesible para la gestión financiera personal y grupal. Su objetivo es simplificar el control de gastos, ingresos y deudas en diversos contextos, como el familiar, entre amigos, durante viajes, e incluso para la administración de tarjetas bancarias y funciones básicas de CRM. La aplicación busca empoderar a los usuarios para mantener sus finanzas claras y organizadas, promoviendo la transparencia y la confianza en las relaciones, bajo el principio de "cuentas claras, amistades largas".

**2. Público Objetivo:**
Inicialmente, Counter Wizard está diseñada para parejas y núcleos familiares que gestionan gastos e ingresos de forma compartida. Sin embargo, se proyecta expandir su alcance para servir como una herramienta de CRM para vendedores y pequeñas empresas, así como una solución para individuos que buscan un control más riguroso de sus finanzas personales, particularmente en la administración de tarjetas de crédito.

**3. Propuesta de Valor y Diferenciación:**
La propuesta de valor central de Counter Wizard radica en su capacidad para unificar y simplificar el seguimiento de todos los movimientos financieros, tanto de entrada como de salida. A diferencia de otras soluciones que ofrecen funcionalidades limitadas (como solo registro de gastos o divisiones fijas), Counter Wizard se distingue por su flexibilidad, adaptándose a las diversas realidades financieras de los usuarios. Permite registrar desde transacciones cotidianas y deudas entre amigos, hasta inversiones y la gestión de múltiples fuentes de fondos, ofreciendo un control integral y personalizado.

**4. Flexibilidad y Accesibilidad Técnica:**
Se aspira a que Counter Wizard sea una aplicación 'líquida' en su adaptabilidad: completamente responsiva para cualquier tamaño de pantalla, compatible con todos los navegadores modernos y diseñada para ser accesible a usuarios con diversas capacidades. Además, se contempla la posibilidad de ofrecer opciones avanzadas de privacidad y seguridad, como la capacidad de descargar y gestionar la base de datos localmente, con funcionalidades de sincronización opcionales (similar al modelo de Obsidian), para aquellos usuarios que prioricen la soberanía de sus datos.

**5. Estrategia de Comercialización y Distribución:**
En cuanto a la comercialización, se prevé que Counter Wizard esté disponible en las principales tiendas de aplicaciones (Google Play Store y Apple App Store), así como mediante descarga directa desde la web. Se explorarán modelos de negocio basados en suscripción para el acceso a funcionalidades premium.

**6. Internacionalización:**
La aplicación tendrá soporte completo para la internacionalización, con el objetivo de estar disponible en la mayor cantidad de idiomas posible.

**7. Manejo de Errores:**
La estrategia de manejo de errores y bugs aún está por definirse en detalle.

**8. Etapa de Desarrollo:**
El proyecto se encuentra en una etapa temprana de desarrollo.

---

## 1. Introducción
Counter Wizard es una aplicación web diseñada para simplificar la gestión de finanzas compartidas entre amigos, parejas o cualquier grupo de personas. El objetivo principal es permitir a los usuarios llevar un registro claro y transparente de los gastos, ingresos y deudas dentro de un grupo, calculando automáticamente los saldos individuales para que todos sepan cuánto deben o cuánto se les debe en tiempo real. La aplicación busca eliminar la confusión y los cálculos manuales asociados a los gastos compartidos.

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

### 3.0. Visión General de la Arquitectura

La aplicación Counter Wizard se construye sobre una arquitectura moderna de aplicación web, utilizando un enfoque de frontend-backend desacoplado para maximizar la flexibilidad y escalabilidad.

*   **Frontend (Interfaz de Usuario):** Desarrollado con **React**, una biblioteca de JavaScript líder para construir interfaces de usuario interactivas y dinámicas. Se utiliza **Vite** como herramienta de construcción y servidor de desarrollo, proporcionando una experiencia de desarrollo rápida y optimizada. La interfaz de usuario se estiliza y compone utilizando **Chakra UI**, un sistema de componentes modular, accesible y altamente personalizable, que asegura una experiencia de usuario consistente y atractiva. La navegación y el enrutamiento dentro de la aplicación son gestionados eficientemente por **React Router**.
*   **Backend (Servicios y Datos):** Se apoya íntegramente en **Firebase**, la plataforma de desarrollo de Google, para todos los servicios de backend, lo que permite un desarrollo ágil y una infraestructura escalable sin necesidad de gestionar servidores propios.
    *   **Firestore:** Actúa como la base de datos NoSQL principal, ofreciendo almacenamiento en la nube y sincronización de datos en tiempo real para usuarios, grupos y transacciones, lo cual es crucial para la naturaleza colaborativa de la aplicación.
    *   **Firebase Authentication:** Gestiona de forma segura la autenticación de usuarios, incluyendo el inicio de sesión simplificado a través de cuentas de Google.
    *   **Firebase Storage:** Se utiliza para el almacenamiento de archivos de usuario, como las imágenes de perfil, garantizando un acceso rápido y seguro.
*   **Gestión de Estado:** Actualmente, el estado global de la aplicación se maneja a través de **React Context**, proporcionando una solución ligera para la inyección de dependencias y el estado compartido. Se ha planificado la migración a **Redux Toolkit** para una gestión de estado más robusta, escalable y predecible, lo que permitirá centralizar la lógica de negocio compleja y el estado de la aplicación de manera más eficiente a medida que el proyecto crezca.
*   **Despliegue:** La aplicación está diseñada para ser desplegada en **Hostinger**, una plataforma de alojamiento web que ofrecerá la disponibilidad pública y el rendimiento necesarios para la aplicación en producción.

Esta arquitectura busca proporcionar una base sólida y mantenible, facilitando el desarrollo continuo y la adición de nuevas funcionalidades, mientras se adhiere a las mejores prácticas de desarrollo web moderno.

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

