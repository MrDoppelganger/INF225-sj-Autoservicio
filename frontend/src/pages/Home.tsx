import { useState } from 'react';

// Cambiamos el nombre de la constante de Login a Home para que coincida con tu import en App.tsx
export const Home = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      FUNCIONA LA PAGINA
    </div>
  );
};