import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import '../styles/pagoArancel.css';

interface PagoArancelProps {
  userId: number;
  setVista: (v: string) => void;
}

interface HistorialPago {
  fecha: string;
  monto: string | number;
  mes_referencia?: string; 
  emisor?: string; // CA3: Agregamos el origen del abono
}

export const PagoArancel = ({ userId, setVista }: PagoArancelProps) => {
  const [finanzas, setFinanzas] = useState({ arancel_bruto: 0, beneficios_validados: 0, saldo_neto: 0, tiene_pendientes: false });
  const [historial, setHistorial] = useState<HistorialPago[]>([]);
  const [montoAbono, setMontoAbono] = useState<number | ''>('');
  const [cargando, setCargando] = useState(true);
  
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);

  const [mesInicio, setMesInicio] = useState('Marzo');
  const [mesFin, setMesFin] = useState('Julio');

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

  const procesarPago = async (montoAPagar: number, referencia?: string) => {
    if (montoAPagar <= 0 || montoAPagar > finanzas.saldo_neto) return;
    
    try {
      const res = await fetch('http://localhost:3000/api/finanzas/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_estudiante: userId, 
          monto_abono: montoAPagar,
          ...(referencia && { mes_referencia: referencia })
        })
      });
      
      if (res.ok) {
        alert(`Pago de $${montoAPagar.toLocaleString()} procesado con éxito.`);
        setMontoAbono('');
        setShowPlanModal(false);
        cargarDatos(); 
      }
    } catch (error) {
      alert('Error al conectar con la pasarela de pago');
    }
  };

  const idxInicio = mesesAcademicos.indexOf(mesInicio);
  const idxFin = mesesAcademicos.indexOf(mesFin);
  const cantidadMesesPeriodo = idxFin - idxInicio + 1;
  const montoPeriodoSugerido = cantidadMesesPeriodo > 0 ? cuotaSugerida * cantidadMesesPeriodo : 0;

  const perfilGuardado = localStorage.getItem('user');
  const tipoPerfil = perfilGuardado ? JSON.parse(perfilGuardado).perfil : '';

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Cargando estado financiero...</p>
      </div>
    );
  }

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
              <span className="tarjeta-titulo">Arancel Anual Bruto</span>
              <span className="tarjeta-monto">${finanzas.arancel_bruto.toLocaleString()}</span>
            </div>
            <div className="tarjeta descuento">
              <span className="tarjeta-titulo">Beneficios Aplicados</span>
              <span className="tarjeta-monto">-${finanzas.beneficios_validados.toLocaleString()}</span>
            </div>
            <div className="tarjeta total">
              <span className="tarjeta-titulo">Saldo Pendiente Neto</span>
              <span className="tarjeta-monto">${finanzas.saldo_neto.toLocaleString()}</span>
            </div>
          </div>

          {finanzas.tiene_pendientes && (
            <div className="alerta-bloqueo" style={{ marginBottom: '20px', backgroundColor: '#fffbeb', borderLeft: '4px solid #F1B929', color: '#92400e' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <strong>Nota Aclaratoria:</strong> Tienes beneficios en estado "Pendiente de validación" que aún no se restan de tu deuda. Tu saldo neto podría variar y disminuir a tu favor una vez que se complete la validación administrativa de la entidad correspondiente.
                </div>
              </div>
            </div>
          )}
          
          <div className="acciones-financieras">
            {finanzas.saldo_neto > 0 && (
              <button className="btn-accion-modal primario" onClick={() => setShowPlanModal(true)}>
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
              <label>Monto a abonar (Abono Global):</label>
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
            <div className="modal-container plan-modal">
              <header className="modal-header">
                <h3>Plan de Cuotas Sugerido</h3>
                <button className="btn-cerrar-icono" onClick={() => setShowPlanModal(false)}>×</button>
              </header>
              
              <div className="modal-body">
                <p className="texto-sugerencia">Basado en los meses académicos restantes para saldar tu deuda de <strong>${finanzas.saldo_neto.toLocaleString()}</strong>.</p>
                
                <div className="panel-periodo">
                  <h4>Pagar cuotas por Período</h4>
                  <div className="periodo-selectores">
                    <select value={mesInicio} onChange={e => setMesInicio(e.target.value)} className="periodo-select">
                      {mesesAcademicos.map(m => <option key={`ini-${m}`} value={m}>{m}</option>)}
                    </select>
                    <span className="periodo-separador">hasta</span>
                    <select value={mesFin} onChange={e => setMesFin(e.target.value)} className="periodo-select">
                      {mesesAcademicos.map(m => <option key={`fin-${m}`} value={m}>{m}</option>)}
                    </select>
                  </div>
                  
                  {cantidadMesesPeriodo > 0 ? (
                    <div className="periodo-sugerido">
                      <p>Monto sugerido ({cantidadMesesPeriodo} meses): <strong>${montoPeriodoSugerido.toLocaleString()}</strong></p>
                      <button 
                        className="btn-pago-cuota destacado" 
                        onClick={() => procesarPago(montoPeriodoSugerido, `${mesInicio}-${mesFin}`)}
                      >
                        Pagar Período
                      </button>
                    </div>
                  ) : (
                    <p className="error-periodo">El mes de término debe ser posterior o igual al mes de inicio.</p>
                  )}
                </div>

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
                          <td className="monto-cuota">${cuotaSugerida.toLocaleString()}</td>
                          <td>
                            <button className="btn-pago-cuota" onClick={() => procesarPago(cuotaSugerida, mes)}>Pagar Mes</button>
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
                <button className="btn-cerrar-icono" onClick={() => setShowHistorialModal(false)}>×</button>
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
                          <th>Emisor / Origen</th> {/* CA3: Columna de Emisor insertada */}
                          <th>Monto Abonado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((pago, index) => (
                          <tr key={index}>
                            <td>
                              {new Date(pago.fecha).toLocaleDateString()}{' '}
                              {pago.mes_referencia && <span className="mes-referencia-historial">({pago.mes_referencia})</span>}
                            </td>
                            {/* CA3: Mostramos el origen del pago de forma limpia */}
                            <td style={{ color: '#475569', fontSize: '0.95em' }}>{pago.emisor || 'Abono Estudiante'}</td>
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