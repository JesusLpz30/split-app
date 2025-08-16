# Guía para Contribuir a Split App

¡Gracias por tu interés en contribuir a Split App! Para asegurar un proceso de colaboración fluido y mantener la calidad del código, por favor, sigue estas directrices.

## 1. Configuración del Entorno de Desarrollo

1.  **Clona el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd split-app
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura Firebase:**
    *   Asegúrate de tener un proyecto Firebase configurado.
    *   Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase, siguiendo el formato de `src/firebase/config.js` (ej. `VITE_FIREBASE_API_KEY=tu_api_key`).
4.  **Inicia la aplicación en modo desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en tu navegador (normalmente en `http://localhost:5173`).

## 2. Directrices de Código

Para mantener la consistencia y la legibilidad del código, y asegurar la coherencia con la visión del proyecto, es fundamental adherirse a las siguientes directrices. Siempre consulta la `DOCUMENTACION.md` para entender la arquitectura y los objetivos generales.

Utilizamos ESLint y Prettier para el control de calidad del código.

*   **ESLint:** Para la calidad del código y las mejores prácticas.
*   **Prettier:** Para el formato automático del código.

### Ejecutar las herramientas:

*   **Lint y Corrección Automática:** Antes de hacer un commit, ejecuta este comando para corregir automáticamente los problemas de formato y estilo:
    ```bash
    npm run lint
    ```
*   **Solo Formatear (con Prettier):** Si solo quieres formatear el código sin ejecutar todas las reglas de linting:
    ```bash
    npm run format
    ```

## 3. Estructura del Proyecto

Familiarízate con la estructura de carpetas descrita en `DOCUMENTACION.md`. Mantén la coherencia con los patrones existentes.

## 4. Commits

*   **Mensajes de Commit:** Utiliza mensajes de commit claros y concisos. Se recomienda seguir la convención de Conventional Commits (ej. `feat: add new user profile page`, `fix: resolve login bug`).
*   **Commits Atómicos:** Intenta que cada commit sea una unidad de trabajo lógica y pequeña.

## 5. Ramas (Branches)

*   Trabaja siempre en una rama separada de `main`.
*   Nombra tus ramas de forma descriptiva (ej. `feature/nombre-de-la-funcionalidad`, `bugfix/descripcion-del-bug`).

## 6. Pull Requests (PRs)

1.  Abre un Pull Request a la rama `main`.
2.  Asegúrate de que tu código pasa todas las pruebas y no tiene errores de linting.
3.  Proporciona una descripción clara de los cambios realizados y el problema que resuelve.
4.  Si tu PR resuelve un issue, haz referencia a él (ej. `Closes #123`).

## 7. Pruebas

(Si el proyecto tiene pruebas unitarias o de integración, se añadirían aquí las instrucciones para ejecutarlas. Por ahora, lo dejaré como un placeholder si no hay pruebas evidentes en la estructura.)

---

¡Gracias de nuevo por tu contribución!
