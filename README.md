# BankCampains (MERN) — Getting Started

Proyecto académico con **frontend (React)** y **backend (Node.js/Express)** en carpetas separadas.

---

## Requisitos
- Node.js 18 o superior (recomendado 20)
- npm

Verificación rápida:
```bash
node -v
npm -v
```

---

## Estructura del repositorio
```
BankCampains/
  backend/
  frontend/
```

---

## Instalación y ejecución rápida

### Backend
En una terminal:
```bash
cd backend
npm install
npm run start
```

### Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run start
```

Orden recomendado: iniciar primero el backend y luego el frontend.

---

## Available Scripts (frontend)

En el directorio `frontend/` se pueden ejecutar los siguientes comandos si están definidos en `package.json`:

### `npm start`
Ejecuta la aplicación en modo desarrollo.
Abra `http://localhost` en el navegador.
La página recargará cuando haya cambios y se verán errores de lint en la consola si aplican.

### `npm test`
Lanza el runner de pruebas en modo interactivo (si está configurado).
Consulte la documentación de su entorno de pruebas para detalles adicionales.

### `npm run build`
Genera una compilación de producción en la carpeta `build/`.
Los archivos quedan minificados y con hash en el nombre para caché.

### `npm run eject`
Operación de una sola vía. Copia las configuraciones (Webpack, Babel, ESLint, etc.) en el proyecto para control total.
Una vez ejecutado, no hay vuelta atrás. Úsese solo si se necesita personalización avanzada.

---

## Available Scripts (backend)

En el directorio `backend/`:

### `npm run start`
Inicia el servidor (por ejemplo, Express). La URL y el puerto dependen de la configuración del proyecto.

*(Opcional, si existe)* `npm run dev` ejecuta el servidor en modo de desarrollo con recarga (por ejemplo, nodemon).

---

## Variables de entorno (backend)

Si el backend requiere configuración, crear un archivo `.env` en `backend/` con valores apropiados. Ejemplo:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bankcampains
CORS_ORIGIN=http://localhost
```

- `PORT` define el puerto del servidor backend.
- `MONGO_URI` apunta a la base de datos MongoDB.
- `CORS_ORIGIN` debe coincidir con el origen del frontend en desarrollo.

**No** subir `.env` a GitHub. Añadirlo al `.gitignore`.

---

## Notas de desarrollo

- Si un puerto está ocupado (EADDRINUSE), ajustar `PORT` o cerrar el proceso en uso.
- Verificar que MongoDB esté accesible si el backend depende de la base de datos.
- Confirmar que el `CORS_ORIGIN` del backend coincida con la URL del frontend.

---

## Learn More

- React: https://react.dev/
- Create React App: https://create-react-app.dev/docs/getting-started/
- Node.js: https://nodejs.org/en/docs
- Express: https://expressjs.com/
- MongoDB: https://www.mongodb.com/docs/

---

## Licencia

Proyecto académico. Uso libre para fines educativos.
