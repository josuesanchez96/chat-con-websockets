# Chat WebSocket — Guía de instalación y ejecución

Chat en tiempo real tipo *Slack* con **Socket.IO**, **Node.js (Express)** y **Next.js**. Incluye alias simple, salas, presencia, e indicador “escribiendo…”.

---

## Requisitos
- **Node.js 18+** y **npm 9+**
- Dos terminales (una para `backend/` y otra para `frontend/`)

> **Nombre del proyecto:** funciona igual si tu carpeta raíz se llama `chat-websocket`, `chat-websocket2.0` u otro. La estructura interna es:
<img width="190" height="127" alt="image" src="https://github.com/user-attachments/assets/e033d2d3-9b48-4b01-9709-d5b03a9ff5d8" />


---

##  Estructura
<img width="560" height="568" alt="image" src="https://github.com/user-attachments/assets/ffcfd017-c998-4b1b-89d5-e058143feae5" />



---

## Variables de entorno

### 1 Backend (`backend/.env`)
Copia desde `.env.example` si lo tienes, o crea el archivo con:
```ini
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### 2 Frontend (`frontend/.env.local`)
Copia desde `.env.local.example` si lo tienes, o crea el archivo con:
```ini
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## Instalación

### 1 Backend
```bash
cd backend
npm install
```

### 2 Frontend
En otra terminal:
```bash
cd frontend
npm install
```

---

##  Ejecución en desarrollo

### 1 Levantar el backend
En `backend/`:
```bash
# con recarga en caliente (si package.json tiene "dev")
npm run dev
# o modo normal
npm start
```
El backend quedará en **http://localhost:4000**.

### 2 Levantar el frontend
En `frontend/`:
```bash
npm run dev
```
Abre **http://localhost:3000** en tu navegador.

---

##  Uso rápido 

1. En la página inicial, escribe un **alias** y continúa.
2. En **Salas**, verás las salas existentes y podrás **crear** una nueva.
3. Entra a una sala (ej. `general`) y envía mensajes.
4. Abre otra pestaña/incógnito con otro alias para ver:
   - **Mensajes en tiempo real**
   - **Presencia** (usuarios conectados por sala)
   - **Indicador “escribiendo…”**

> Los datos se guardan **en memoria local** para el ejercicio.

---

##  Solución de problemas

- **Puerto en uso (EADDRINUSE)**: cambia `PORT` (backend) o puerto de Next.js (`npm run dev -p 3001`).  
- **CORS bloqueado**: revisa `CORS_ORIGIN` en `backend/.env` y que el frontend use esa misma URL.  
- **“Alias requerido”**: el backend rechaza la conexión si no envías `auth.username`. El frontend lo gestiona desde el login.  
- **Desincronización de dependencias**: borra `node_modules` y `package-lock.json`, luego `npm install`.  

---

