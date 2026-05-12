import { useState, useEffect } from 'react';
import { Header } from '../components/Header';

interface PagoArancelProps {
  userId: number;
  setVista: (v: string) => void;
}

interface HistorialPago {
  fecha: string;
  monto: string | number;
}

export const PagoArancel = ({ userId, setVista }: PagoArancelProps) => {
  const [finanzas, setFinanzas] = useState({ arancel_bruto: 0, beneficios_validados: 0, saldo_neto: 0 });
  const [historial, setHistorial] = useState<HistorialPago[]>([]);
  const [montoAbono, setMontoAbono] = useState<number | ''>('');
  const [cargando, setCargando] = useState(true);
  
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);

  const mesesAcademicos = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const cargarDatos = () => {
    Promise.all([
      fetch(`http://localhost:3000/api/finanzas/${userId}`).then(res => res.json()),
      fetch(`http://localhost:3000/api/finanzas/historial/${userId}`).then(res => res.json())
    ])
    .then(([datosFinanzas, datosHistorial]) => {
      if (!datosFinanzas.error) setFinanzas(datosFinanzas);
      if (!datosHistorial.error && Array.isArray(datosHistorial)) setHistorial(datosHistorial);
      setCargando(false);
    })
    .catch(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  const esMontoValido = typeof montoAbono === 'number' && montoAbono > 0 && montoAbono <= finanzas.saldo_neto;
  const cuotaSugerida = finanzas.saldo_neto > 0 ? Math.ceil(finanzas.saldo_neto / 10) : 0;

  const procesarPago = async (montoAPagar: number) => {
    if (montoAPagar <= 0 || montoAPagar > finanzas.saldo_neto) return;
    
    try {
      const res = await fetch('http://localhost:3000/api/finanzas/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_estudiante: userId, monto_abono: montoAPagar })
      });
      
      if (res.ok) {
        alert(`Pago de $${montoAPagar} procesado con éxito.`);
        setMontoAbono('');
        setShowPlanModal(false);
        cargarDatos(); 
      }
    } catch (error) {
      alert('Error al conectar con la pasarela de pago');
    }
  };

  const perfilGuardado = localStorage.getItem('user');
  const tipoPerfil = perfilGuardado ? JSON.parse(perfilGuardado).perfil : '';

  if (cargando) return <div className="loader">Cargando estado financiero...</div>;

  return (
    <div className="modulo-contenedor">
      <Header setVista={setVista} perfil={tipoPerfil} />

      <div className="modulo-pago">
        <div className="modulo-header">
          <h2>Gestión de Aranceles</h2>
          <p>Revisa tu estado de cuenta y realiza abonos en línea.</p>
        </div>

        <div className="finanzas-dashboard">
          <div className="tarjetas-resumen">
            <div className="tarjeta base">
              <span className="tarjeta-titulo">Arancel Anual</span>
              <span className="tarjeta-monto">${finanzas.arancel_bruto.toLocaleString()}</span>
            </div>
            <div className="tarjeta descuento">
              <span className="tarjeta-titulo">Beneficios Aplicados</span>
              <span className="tarjeta-monto">-${finanzas.beneficios_validados.toLocaleString()}</span>
            </div>
            <div className="tarjeta total">
              <span className="tarjeta-titulo">Saldo Pendiente</span>
              <span className="tarjeta-monto">${finanzas.saldo_neto.toLocaleString()}</span>
            </div>
          </div>

          <div className="acciones-financieras">
            {finanzas.saldo_neto > 0 && (
              <button className="btn-accion-modal" onClick={() => setShowPlanModal(true)}>
                Ver Plan de Pago Sugerido
              </button>
            )}
            <button className="btn-accion-modal secundario" onClick={() => setShowHistorialModal(true)}>
              Ver Historial de Transacciones
            </button>
          </div>
        </div>

        <div className="pago-interfaz">
          <div className="panel-formulario">
            <h3>Realizar Abono Personalizado</h3>
            <div className="form-group">
              <label>Monto a abonar:</label>
              <input 
                type="number" 
                className="input-monto"
                value={montoAbono} 
                onChange={(e) => setMontoAbono(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej: 50000"
              />
            </div>
            <button 
              className={`btn-pagar ${esMontoValido ? 'valido' : 'invalido'}`}
              onClick={() => procesarPago(Number(montoAbono))} 
              disabled={!esMontoValido}
            >
              {esMontoValido ? `Pagar $${montoAbono.toLocaleString()}` : 'Ingresa un monto válido'}
            </button>
          </div>
        </div>

        {showPlanModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <header className="modal-header">
                <h3>Plan de Cuotas Sugerido</h3>
                <button className="btn-cerrar-icono" onClick={() => setShowPlanModal(false)}>X</button>
              </header>
              
              <div className="modal-body">
                <p className="texto-sugerencia">Basado en los meses académicos restantes para saldar tu deuda de <strong>${finanzas.saldo_neto.toLocaleString()}</strong>.</p>
                <div className="tabla-scroll-container">
                  <table className="tabla-modal">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Cuota Sugerida</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mesesAcademicos.map((mes, index) => (
                        <tr key={index}>
                          <td>{mes}</td>
                          <td>${cuotaSugerida.toLocaleString()}</td>
                          <td>
                            <button className="btn-pago-cuota" onClick={() => procesarPago(cuotaSugerida)}>Pagar Mes</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <footer className="modal-actions">
                <button className="btn-cerrar-modal" onClick={() => setShowPlanModal(false)}>Cerrar Plan</button>
              </footer>
            </div>
          </div>
        )}

        {showHistorialModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <header className="modal-header">
                <h3>Historial de Pagos Realizados</h3>
                <button className="btn-cerrar-icono" onClick={() => setShowHistorialModal(false)}>X</button>
              </header>
              
              <div className="modal-body">
                {historial.length === 0 ? (
                  <p className="sin-datos">No hay pagos registrados en el sistema.</p>
                ) : (
                  <div className="tabla-scroll-container">
                    <table className="tabla-modal">
                      <thead>
                        <tr>
                          <th>Fecha del Pago</th>
                          <th>Monto Abonado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((pago, index) => (
                          <tr key={index}>
                            <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                            <td className="monto-positivo">+ ${Number(pago.monto).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <footer className="modal-actions">
                <button className="btn-cerrar-modal" onClick={() => setShowHistorialModal(false)}>Cerrar Historial</button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};