// -------------------Módulo de Soporte (Visión Estudiante)-----------
// Generación de tickets de consulta hacia el personal de soporte
// Plataforma: Portal de Autoservicio Institucional (UTFSM)
// -------------------------------------------------------------------

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Header } from '../components/Header';
import '../styles/soporte.css';

// ---------------------Interfaces-----------------------------------
// Definición de las propiedades recibidas y del ticket registrado
// -------------------------------------------------------------------
interface SoporteProps {
  userId: number;
  perfil: string;
  setVista: (v: string) => void;
}

interface TicketCreado {
  id: number;
  asunto: string;
  estado: string;
  fecha: string;
}

// ---------------------Constantes-----------------------------------
// Límites de largo para los campos del ticket (iguales al backend)
// -------------------------------------------------------------------
const LIMITES = {
  asuntoMin: 5,
  asuntoMax: 100,
  mensajeMin: 10,
  mensajeMax: 2000,
};

// ------------------Componente React-------------------
//   Soporte:
//       Despliega el formulario para que el estudiante redacte
//       y envíe un ticket de consulta al personal de soporte.
// ---------------------Props---------------------------
//   @param {SoporteProps} props - ID del usuario, perfil y setVista.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Vista del módulo de soporte.
// -----------------------------------------------------
export const Soporte = ({ userId, perfil, setVista }: SoporteProps) => {
  const [asunto, setAsunto] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [ticketCreado, setTicketCreado] = useState<TicketCreado | null>(null);

  const largoAsunto = asunto.trim().length;
  const largoMensaje = mensaje.trim().length;
  const asuntoValido = largoAsunto >= LIMITES.asuntoMin && largoAsunto <= LIMITES.asuntoMax;
  const mensajeValido = largoMensaje >= LIMITES.mensajeMin && largoMensaje <= LIMITES.mensajeMax;
  const formularioValido = asuntoValido && mensajeValido;

  // -------------------Función----------------------
  //   handleSubmit:
  //       Envía el ticket al endpoint de consultas, muestra el
  //       número asignado en caso de éxito o el error recibido.
  // ------------------Parámetros-------------------
  //   @param {FormEvent<HTMLFormElement>} e - Evento de envío.
  // ------------------Retorno-----------------------
  //   @returns {Promise<void>}
  // -----------------------------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formularioValido || enviando) return;

    setEnviando(true);
    setError('');
    setTicketCreado(null);

    try {
      const respuesta = await fetch('http://localhost:3000/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          asunto: asunto.trim(),
          mensaje: mensaje.trim(),
        }),
      });
      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        setTicketCreado(datos.consulta);
        setAsunto('');
        setMensaje('');
      } else {
        setError(datos.message || 'No fue posible enviar tu consulta');
      }
    } catch {
      setError('Error al conectar con el servidor institucional');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="layout-principal">
      <Header setVista={setVista} perfil={perfil} />

      <main className="main-content soporte-main">
        <section className="soporte-header">
          <h2>Soporte</h2>
          <p>Envía tu consulta al equipo de soporte y te responderemos a la brevedad.</p>
        </section>

        <form className="soporte-form" onSubmit={handleSubmit} noValidate>
          <div className="soporte-campo">
            <label htmlFor="soporte-asunto">Asunto</label>
            <input
              id="soporte-asunto"
              type="text"
              value={asunto}
              maxLength={LIMITES.asuntoMax}
              placeholder="Ej: Problema con el pago de mi arancel"
              onChange={(e) => setAsunto(e.target.value)}
              disabled={enviando}
            />
            <span className={`soporte-contador ${asunto && !asuntoValido ? 'invalido' : ''}`}>
              {largoAsunto}/{LIMITES.asuntoMax} (mínimo {LIMITES.asuntoMin})
            </span>
          </div>

          <div className="soporte-campo">
            <label htmlFor="soporte-mensaje">Mensaje</label>
            <textarea
              id="soporte-mensaje"
              value={mensaje}
              maxLength={LIMITES.mensajeMax}
              rows={8}
              placeholder="Describe tu solicitud con el mayor detalle posible"
              onChange={(e) => setMensaje(e.target.value)}
              disabled={enviando}
            />
            <span className={`soporte-contador ${mensaje && !mensajeValido ? 'invalido' : ''}`}>
              {largoMensaje}/{LIMITES.mensajeMax} (mínimo {LIMITES.mensajeMin})
            </span>
          </div>

          <div aria-live="polite">
            {error && <p className="soporte-alerta error">{error}</p>}
            {ticketCreado && (
              <p className="soporte-alerta exito">
                Ticket N° {ticketCreado.id} enviado correctamente
                ({new Date(ticketCreado.fecha).toLocaleString('es-CL')}).
                Estado: <strong>{ticketCreado.estado}</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-enviar-ticket"
            disabled={!formularioValido || enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar consulta'}
          </button>
        </form>

      </main>
    </div>
  );
};