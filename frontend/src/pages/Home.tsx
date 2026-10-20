// -------------------Componente de Prueba (Home)---------------------
// Componente de validación básica de renderizado de interfaz
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState } from 'react';

// ------------------Componente React-------------------
//   Home:
//       Componente de respaldo utilizado en etapas tempranas
//       para validar la inicialización del motor de vistas.
// ---------------------Props---------------------------
//   Ninguna.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Mensaje simple de comprobación.
// -----------------------------------------------------
export const Home = () => {
  const [rut, setRut] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // -------------------Función----------------------
  //   handleSubmit:
  //       Controlador de evento por defecto de formulario.
  // ------------------Parámetros-------------------
  //   @param {React.FormEvent} e - Evento de envío.
  // ------------------Retorno-----------------------
  //   @returns {void}
  // -----------------------------------------------
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Login test:', rut, password);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p>FUNCIONA LA PAGINA</p>
        <input 
          type="hidden" 
          value={rut} 
          onChange={(e) => setRut(e.target.value)} 
        />
        <input 
          type="hidden" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </form>
    </div>
  );
};
