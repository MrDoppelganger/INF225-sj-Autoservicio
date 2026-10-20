// -------------------Enrutador Principal----------------------------
// Definición de rutas base del portal mediante React Router DOM
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ObtenerCertificados } from './pages/ObtenerCertificados';

// ------------------Componente React-------------------
//   App:
//       Enrutador principal de la aplicación cliente, definiendo
//       las rutas públicas y privadas del portal institucional.
// ---------------------Props---------------------------
//   Ninguna.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Árbol de navegación con BrowserRouter.
// -----------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/obtenercertificado" element={<ObtenerCertificados />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
