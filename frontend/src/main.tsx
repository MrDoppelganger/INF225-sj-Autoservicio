// -------------------Punto de Entrada------------------------------
// Inicialización del árbol de renderizado React 19 y montaje en DOM
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';

// Montaje del componente raíz en el elemento contenedor con id 'root'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
