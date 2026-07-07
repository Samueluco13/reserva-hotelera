import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { MyReservationsPage } from '@/pages/MyReservationsPage';
import { AllReservationsPage } from '@/pages/AllReservationsPage';
import { RoomTypesPage } from '@/pages/RoomTypesPage';
import { RoomsPage } from '@/pages/RoomsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/reservations" element={<AllReservationsPage />} />
            <Route path="/room-types" element={<RoomTypesPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Reserva Hotelera
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}