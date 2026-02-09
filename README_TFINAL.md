# SGM-DALCT Market — Tarea Final

**Universidad Politécnica Salesiana, Sede Quito**  
**Carrera de Ingeniería en Ciencias de la Computación**  

**Grupo base:** Grupo 06  

**Integrantes:**
- Barahona Guzmán, Damian Joshua
- Cayambe Endara, Kenin Adrian
- Chasipanta Ango, Sthalin Fabian
- Licto Freire, Cristian Alexis
- Tandazo Pineda, Juan Francisco

---

## 1. Introducción
Este documento corresponde a la **Tarea Final**, consolidando el frontend y el backend del sistema **SGM-DALCT Market**.  
El backend fue desarrollado en la Tarea 02.03 y el frontend consume dichos servicios para brindar una interfaz funcional a Administradores, Cajeros y Bodegueros.

Repositorio: `https://github.com/Damian2044/TFINAL_DALCTMarket_Grupo06.git`

---

## 2. Tecnologías y librerías usadas (con propósito)
**Backend:**
- Lenguaje: **Python 3.12+**
- Framework: **FastAPI**
- Persistencia: **SQLAlchemy** + **Pydantic**
- Base de datos: **PostgreSQL 17**
- Contenerización: **Docker**
- Documentación: **Swagger** (en `/docs`) para probar y validar endpoints.

**Frontend:**
- **React 19** + **Vite**: interfaz de usuario y entorno de desarrollo rápido.
- **React Router**: enrutamiento interno de vistas.
- **Axios**: consumo de la API REST del backend.
- **Tailwind CSS**: estilos utilitarios y diseño responsivo.
- **React Data Table Component**: tablas con paginación y ordenamiento.
- **MUI (DataGrid y componentes)**: grids y componentes avanzados.
- **React Hook Form**: manejo de formularios y validación.

**Contenerización (proyecto completo):**
- **Docker Compose** para orquestar backend, frontend y base de datos.

---

## 4. Clonación y uso
1. Clonar el repositorio y acceder:
```bash
git clone https://github.com/Damian2044/TFINAL_DALCTMarket_Grupo06.git
cd TFINAL_DALCTMarket_Grupo06
```

2. Ejecutar con Docker Compose (recomendado):
```bash
docker compose up --build
# o en segundo plano:
# docker compose up -d --build
```

Servicios:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

3. Ejecución local sin Docker (opcional):

Backend:
```bash
pip install -r backend/requerimientos.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd frontend/app-frontend
npm install
npm run dev
```

---

## 5. Variables de entorno (ejemplo)
**Backend (`backend/.env`):**
```
DATABASE_URL=postgresql://usuario:password@host:5432/dalctmarket
SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
TZ=America/Guayaquil
```

**Frontend (`frontend/app-frontend/.env`):**
```
VITE_API_URL=https://tfinal-dalctmarket-grupo06.onrender.com
```

---

