# Memoria del Proyecto

## Contexto del Proyecto
Estamos desarrollando el proyecto en el marco de la asignatura de Ingeniería de Software de la Universidad Técnica Federico Santa María (UTFSM). Como equipo constituimos la startup **MEJORA**, encargada de continuar y evolucionar el desarrollo del **Portal Autoservicio USM**.

La plataforma busca transformar la gestión administrativa y financiera de la comunidad universitaria mediante:
- Transparencia financiera (estado de cuenta, aranceles, beneficios y becas).
- Gestión de pagos y abonos flexibles.
- Emisión digital de certificados académicos para alumnos y exalumnos.
- Canal de soporte centralizado y bandeja de notificaciones.
- Consulta de remuneraciones por ayudantías y estado de transferencias.

---

## Reglas de Estilo y Gobierno Técnico

### 1. Convenciones de Nombres
- **JavaScript / TypeScript (Frontend y Backend):**
  - **Variables y Atributos:** `camelCase` y en minúsculas (ej: `saldo_neto` en DB se mapea a `saldoNeto` en JS/TS).
  - **Funciones y Hooks:** `camelCase` con la primera letra minúscula (ej: `calcularSaldoNeto()`, `useEstadoCuenta()`).
  - **Componentes React, Clases, Interfaces y Tipos:** `PascalCase` con la primera letra mayúscula (ej: `TarjetaEstadoCuenta`, `UsuarioInterface`).
  - **Constantes Globales:** `UPPER_SNAKE_CASE` (ej: `MAX_REINTENTOS_API`, `PORT_BACKEND`).
- **PostgreSQL (Base de Datos):**
  - **Tablas y Columnas:** `snake_case` completamente en minúsculas (ej: `cuenta_estudiante`, `arancel_bruto`).

### 2. Formato Visual y Límites
- **Límite de caracteres:** Máximo **115 caracteres** por línea de código o comentario.
- **Separadores visuales:** Se utiliza la estructura: 
`// -------------------[Título]----------------------` 
para delimitar secciones en JS/TS y 
`-- -------------------[Título]----------------------` 
en archivos SQL.

---

## Formato de Documentación y Comentarios

### A. Funciones y Métodos (Backend Node.js y Utilidades JS/TS)
Todas las funciones deben documentar su propósito, parámetros y valor de retorno:

```javascript
// -------------------Función----------------------
//   calcularSaldoNeto:
//       Calcula el saldo neto a pagar restando la cobertura de
//       beneficios validados al arancel bruto total.
// ------------------Parámetros-------------------
//   @param {number} arancelBruto - Monto total de colegiatura anual.
//   @param {number} beneficiosValidados - Suma de becas aplicadas.
// ------------------Retorno-----------------------
//   @returns {number} Saldo neto final pendiente de cobro (>= 0).
// -----------------------------------------------
function calcularSaldoNeto(arancelBruto, beneficiosValidados) {
  const saldo = arancelBruto - beneficiosValidados;
  return saldo > 0 ? saldo : 0;
}
```

### B. Componentes de React y Custom Hooks (TypeScript / TSX)
Los componentes e interfaces deben documentar su responsabilidad visual y sus Props:
```Typescript
interface TarjetaEstadoCuentaProps {
  arancelBruto: number;
  saldoNeto: number;
  cargando: boolean;
}

// ------------------Componente React-------------------
//   TarjetaEstadoCuenta:
//       Despliega el resumen de la situacion financiera del
//       estudiante, mostrando arancel, descuentos y saldo neto.
// ---------------------Props---------------------------
//   @param {TarjetaEstadoCuentaProps} props - Props del componente.
// ------------------Retorno----------------------------
//   @returns {JSX.Element} Componente renderizado en pantalla.
// -----------------------------------------------------
export const TarjetaEstadoCuenta: React.FC<TarjetaEstadoCuentaProps> = ({
  arancelBruto,
  saldoNeto,
  cargando,
}) => {
  if (cargando) return <Spinner/>;
  return (
    <div className="tarjeta-finanzas">
      <h3>Estado Financiero</h3>
      <p>Arancel Bruto: ${arancelBruto}</p>
      <p>Saldo Neto a Pagar: ${saldoNeto}</p>
    </div>
  );
};
```

### C. Endpoints de la API REST (Node.js / Express)
Cada ruta expuesta en el Backend debe documentar su método, URL, cuerpo esperado y códigos de respuesta:
```javascript
// --------------------Endpoint REST--------------------
//   POST /api/v1/pagos/abono
//   Descripción:
//       Procesa un abono flexible ingresado por un estudiante para
//       descontar de su saldo insoluto de arancel.
// -----------------Parámetros Body (JSON)---------------
//       - idEstudiante {number}: Identificador del alumno.
//       - montoAbono {number}: Valor monetario a abonar (> 0).
// ------------------Respuestas HTTP---------------------
//       - 200 OK: Abono aplicado exitosamente.
//       - 400 Bad Request: Monto inválido o excede la deuda.
//       - 500 Internal Error: Fallo de conexión con la base de datos.
// -----------------------------------------------------
router.post('/abono', async (req, res) => {
  // Lógica del endpoint
});
```

### D. Tablas y Migraciones SQL (PostgreSQL)
Las tablas de base de datos deben documentar su rol en la persistencia, claves y relaciones:
```sql
-- --------------------Tabla SQL--------------------
--   Nombre: cuenta_estudiante
--   Descripción:
--       Almacena la consolidación financiera del alumno para
--       el periodo académico vigente.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador primario de la cuenta.
--       - id_estudiante (FK -> usuarios.id): Alumno asociado.
--       - arancel_bruto: Monto anual sin descuentos.
--       - saldo_neto: Monto real a pagar tras aplicar beneficios.
-- -------------------------------------------------
CREATE TABLE cuenta_estudiante (
    id SERIAL PRIMARY KEY,
    id_estudiante INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    arancel_bruto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    beneficios_validados NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    saldo_neto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estado_financiero VARCHAR(50) NOT NULL DEFAULT 'al_dia'
);
```

### E. Clases de Servicio o Modelos en Node.js
Si se utilizan clases para encapsular lógica de negocio o repositorios:
```javascript
// -------------------------Clase-------------------------
//   ServicioNotificaciones:
//       Módulo encargado de orquestar y despachar las alertas
//       automáticas del sistema hacia la base de datos.
//   Atributos:
//       - clienteDb: Instancia de conexión al pool de PostgreSQL.
// -------------------------------------------------------
class ServicioNotificaciones {
  constructor(clienteDb) {
    this.clienteDb = clienteDb;
  }

  // -------------------Función----------------------
  //   crearAvisoPago:
  //       Genera un registro de notificación cuando el pago
  //       es procesado con éxito.
  // -----------------------------------------------
  async crearAvisoPago(idUsuario, monto) {
    // Implementación
  }
}
```

## Backlog de Historias de Usuario y Requisitos

---

### Iteración 1: MVP Parcial (28 de Septiembre – 23 de Octubre)

#### HU-01: Visualización de Estado de Cuenta y Transparencia Financiera
- **Requisitos SRS Asociados:** RS-17, RS-20
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** estudiante de la universidad,  
  > **quiero** consultar un desglose claro de mi arancel bruto, los beneficios/becas aplicados y el saldo neto pendiente,  
  > **para** mantener una visión transparente de mi situación financiera con la institución.
- **Criterios de Aceptación:**
  - [x] El sistema debe mostrar el monto bruto de la colegiatura anual y destacar visualmente los descuentos por beneficios o becas activas.
  - [x] Debe mostrar con una etiqueta o indicador visual cuando un beneficio esté en estado *"Pendiente de validación"*.
  - [x] El saldo neto a pagar debe recalcularse automáticamente descontando los abonos y beneficios confirmados.

---

#### HU-02: Abonos Flexibles al Arancel y Pago de Matrícula
- **Requisitos SRS Asociados:** RS-17, RS-18, RS-19, RS-20
- **Perfil:** Alumno Regular
- **Historia de Usuario:**
  > **Como** estudiante,  
  > **quiero** ingresar un monto manual para abonar a mi arancel o seleccionar la cuota/matrícula a pagar,  
  > **para** tener flexibilidad de pago según mi capacidad económica del mes.
- **Criterios de Aceptación:**
  - [x] El usuario puede escribir una cantidad numérica libre (mayor a $0 y menor o igual al saldo pendiente).
  - [x] Al confirmar el abono o pago de matrícula, la solicitud es procesada por la API y valida que no supere la deuda insoluta.
  - [x] Tras un pago exitoso, la interfaz actualiza inmediatamente el saldo neto resultante.

---

#### HU-03: Consulta de Estado de Matrícula
- **Requisitos SRS Asociados:** RS-15, RS-16
- **Perfil:** Alumno Regular
- **Historia de Usuario:**
  > **Como** estudiante,  
  > **quiero** consultar el estado actual del cobro de mi matrícula para el periodo académico vigente,  
  > **para** verificar si me encuentro al día o si tengo cobros pendientes antes de la fecha límite.
- **Criterios de Aceptación:**
  - [x] La plataforma consulta la tabla `matriculas` en PostgreSQL y entrega el estado (`pendiente`, `pagada`) junto a la fecha límite.
  - [x] Si la matrícula está pagada, el botón de pago correspondiente se deshabilita visualmente.

---

#### HU-04: Bandeja y Generación de Notificaciones / Alertas
- **Requisitos SRS Asociados:** RS-10, RS-11, RS-12, RS-13, RS-14
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** usuario del portal,  
  > **quiero** disponer de una bandeja centralizada de notificaciones e indicadores de alertas,  
  > **para** estar informado sobre pagos realizados, becas pendientes de validación, errores de transferencia o bloqueos por morosidad.
- **Criterios de Aceptación:**
  - [x] El estudiante visualiza una lista de notificaciones ordenadas cronológicamente con su estado (`leída` / `no leída`).
  - [x] El sistema genera alertas visuales de advertencia cuando existan becas no validadas o deuda en matrícula/arancel.
  - [x] Se emite una confirmación en la bandeja al procesar exitosamente un abono o pago.

---

#### HU-05: Generación y Seguimiento de Tickets de Soporte (Visión Estudiante)
- **Requisitos SRS Asociados:** RS-1, RS-2, RS-3, RS-4
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** usuario del portal,  
  > **quiero** enviar solicitudes de soporte a través de un formulario e historial personal,  
  > **para** resolver dudas sobre mis estados de cuenta, beneficios o problemas de pagos sin ir presencialmente.
- **Criterios de Aceptación:**
  - [x] Formulario con campos de *Asunto* y *Mensaje* para redactar la solicitud de soporte.
  - [x] El sistema guarda la consulta en la base de datos con estado inicial `'abierta'`/`'pendiente'`.
  - [x] Una vista de *"Mis Consultas"* despliega la lista de solicitudes enviadas y muestra la respuesta emitida por el personal de soporte cuando esta haya sido respondida.

---

#### HU-06: Módulo de Preguntas Frecuentes (FAQ Estático)
- **Requisitos SRS Asociados:** RS-26
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** usuario de la plataforma,  
  > **quiero** revisar una sección de Preguntas Frecuentes (FAQ),  
  > **para** resolver dudas comunes de trámites y pagos de forma inmediata sin necesidad de abrir un ticket.
- **Criterios de Aceptación:**
  - [x] Las preguntas y respuestas están precargadas como recurso estático en la capa de presentación (Frontend) para mayor velocidad.
  - [x] La interfaz despliega las FAQs organizadas por categorías de interés (Aranceles, Becas, Certificados, Soporte).

---

#### HU-07: Consulta de Remuneraciones por Ayudantías (Bonos)
- **Requisitos Hito 1:** Levantamiento Focus Group / Conceptos de Negocio
- **Perfil:** Alumno con rol Ayudante
- **Historia de Usuario:**
  > **Como** estudiante ayudante,  
  > **quiero** revisar la fecha estimada de depósito y monto de mis bonos por ayudantía,  
  > **para** verificar que la universidad haya procesado las transferencias a mi cuenta bancaria registrada.
- **Criterios de Aceptación:**
  - [x] El usuario accede a una pestaña con el listado de asignaturas donde ejerce ayudantía.
  - [x] Se muestran los montos, periodo mensual, fecha estimada de pago y el estado de la transferencia (`pendiente`, `transferido`, `error_cuenta`).

---

### Iteración 2: MVP Final (26 de Octubre – 27 de Noviembre)

#### HU-08: Panel Administrativo de Soporte (Visión Personal de Soporte)
- **Requisitos SRS Asociados:** RS-5, RS-6, RS-7, RS-8, RS-9
- **Perfil:** Personal de Soporte / Administrador
- **Historia de Usuario:**
  > **Como** encargado de soporte administrativo,  
  > **quiero** contar con una bandeja centralizada que me permita listar, ordenar y responder los tickets de los estudiantes,  
  > **para** gestionar la atención y resolver las dudas financieras o técnicas de la comunidad.
- **Criterios de Aceptación:**
  - [x] Una tabla administrativa despliega todas las solicitudes registradas por los estudiantes.
  - [x] La tabla permite ordenar las solicitudes por fecha de creación o estado de atención.
  - [x] El administrador cuenta con un cuadro de respuesta para ingresar la solución al ticket, actualizando su estado a `'respondida'` en la base de datos.

---

#### HU-09: Catálogo de Certificados Académicos
- **Requisitos SRS Asociados:** RS-21, RS-22
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** alumno o exalumno,  
  > **quiero** consultar un catálogo digital con los certificados disponibles para emisión,  
  > **para** conocer sus requisitos, costo asociado y tipo de documento disponible.
- **Criterios de Aceptación:**
  - [x] El sistema obtiene desde la tabla `catalogo_certificados` en la base de datos la lista de documentos oficiales (ej: *Certificado de Alumno Regular*, *Certificado de Título Professional*).
  - [x] Se despliega cada certificado con su descripción, arancel/costo y destinatario (*alumno* / *exalumno*).

---

#### HU-10: Solicitud y Pago Digital de Certificados
- **Requisitos SRS Asociados:** RS-23, RS-24, RS-25
- **Perfil:** Alumno Regular / Exalumno
- **Historia de Usuario:**
  > **Como** usuario del portal,  
  > **quiero** seleccionar un certificado del catálogo y procesar su solicitud de pago,  
  > **para** obtener la aprobación digital de la emisión del documento.
- **Criterios de Aceptación:**
  - [x] El usuario selecciona el certificado deseado y confirma la solicitud.
  - [x] El sistema procesa la transacción de pago requerida para el trámite.
  -