# Reserva Hotelera — Frontend

SPA con las vistas públicas del sistema de reservas: registro, inicio de sesión y catálogo de habitaciones.

## Stack

- React 18 + Vite + TypeScript
- React Router v6
- Axios (instancia centralizada con interceptor de token)
- Tailwind CSS

## Requisitos

- Backend (`api/`) corriendo en `http://localhost:8000`
- Node.js 18+

## Configuración

1. Copia `.env.example` a `.env` si necesitas ajustar la URL del backend:
   ```
   VITE_API_URL=http://localhost:8000
   ```

2. Instala dependencias y levanta el dev server:
   ```
   npm install
   npm run dev
   ```

La app quedará en `http://localhost:5173` (origen ya permitido por el CORS del backend).

## Estructura

```
src/
├── api/client.ts            # Axios + interceptor Authorization
├── context/AuthContext.tsx  # user, token, login, register, logout
├── components/              # Navbar, RoomCard, Spinner
├── pages/                   # HomePage, LoginPage, RegisterPage, NotFoundPage
├── services/                # auth.ts, rooms.ts
└── types/api.ts             # Tipos compartidos con el backend
```

## Endpoints consumidos (públicos)

- `POST /auth/register`
- `POST /auth/login` (form-data)
- `GET /rooms`
- `GET /room_types`
- `GET /users/me` (para hidratar el contexto tras login)

## Build de producción

```
npm run build
npm run preview
```