import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ObtenerCertificados } from './pages/ObtenerCertificados';

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