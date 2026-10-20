-- -------------------Estructura Base de Datos----------------------
-- Script de inicialización de esquema y datos para PostgreSQL
-- Plataforma: Portal de Autoservicio Institucional (UTFSM)
-- -----------------------------------------------------------------

-- --------------------Tabla SQL--------------------
--   Nombre: usuarios
--   Descripción:
--       Almacena los datos maestros de cuentas institucionales,
--       incluyendo perfiles académicos, datos de contacto y
--       cuenta bancaria registrada para transferencias.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador secuencial del usuario.
--       - rut (UNIQUE): Identificador tributario nacional.
--       - password: Clave institucional de acceso.
--       - perfil: Rol asignado (Estudiante Regular, Admin, etc).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL,
    nombre VARCHAR(100),
    carrera VARCHAR(100),
    situacion_academica VARCHAR(50),
    email VARCHAR(100),
    email_personal VARCHAR(100),
    email_apoderado VARCHAR(100),
    telefono VARCHAR(15),
    direccion VARCHAR(255),
    banco VARCHAR(50),
    tipo_cuenta VARCHAR(50),
    numero_cuenta VARCHAR(20),
    rut_titular VARCHAR(20)
);

-- --------------------Tabla SQL--------------------
--   Nombre: cuenta_estudiante
--   Descripción:
--       Registra la consolidación arancelaria del estudiante,
--       desglosando arancel bruto, cobertura de becas, saldo
--       neto y estado financiero (Al Día, Moroso, etc).
-- ---------------Columnas principales--------------
--       - id (PK): Identificador primario de la cuenta.
--       - id_estudiante (FK -> usuarios.id): Alumno titular.
--       - arancel_bruto: Monto anual sin descuentos aplicados.
--       - beneficios_validados: Suma de becas vigentes.
--       - saldo_neto: Deuda final pendiente de cobro.
--       - estado_financiero: Clasificación de morosidad.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS cuenta_estudiante (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    arancel_bruto NUMERIC(10, 2) NOT NULL,
    beneficios_validados NUMERIC(10, 2) DEFAULT 0,
    saldo_neto NUMERIC(10, 2) NOT NULL,
    estado_financiero VARCHAR(50) DEFAULT 'Al Día'
);

-- --------------------Tabla SQL--------------------
--   Nombre: matriculas
--   Descripción:
--       Controla el pago del derecho de matrícula semestral
--       o anual, su vigencia y fecha límite de pago.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador único de la matrícula.
--       - id_estudiante (FK -> usuarios.id): Estudiante.
--       - periodo_academico: Periodo lectivo (ej: 2026-1).
--       - monto_matricula: Costo fijado para el arancel básico.
--       - estado_matricula: Situación (Pagada, Pendiente).
--       - fecha_limite: Fecha máxima para regularizar pago.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS matriculas (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    periodo_academico VARCHAR(20) NOT NULL,
    monto_matricula NUMERIC(10, 2) NOT NULL,
    estado_matricula VARCHAR(50) DEFAULT 'Pendiente',
    fecha_limite DATE NOT NULL
);

-- --------------------Tabla SQL--------------------
--   Nombre: cuotas
--   Descripción:
--       Desglosa el saldo neto de arancel en cuotas mensuales
--       con fechas de vencimiento y estado individual de pago.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador primario de la cuota.
--       - id_cuenta (FK -> cuenta_estudiante.id): Cuenta padre.
--       - numero_cuota: Número ordinal de la cuota (1 a 10).
--       - monto: Valor monetario asignado a la mensualidad.
--       - fecha_vencimiento: Plazo límite de pago sin mora.
--       - estado: Estado de la cuota (Pendiente, Pagada).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS cuotas (
    id SERIAL PRIMARY KEY,
    id_cuenta INTEGER REFERENCES cuenta_estudiante(id) ON DELETE CASCADE,
    numero_cuota INTEGER NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente'
);

-- --------------------Tabla SQL--------------------
--   Nombre: catalogo_certificados
--   Descripción:
--       Catálogo oficial de documentos y certificados
--       académicos disponibles para emisión y sus costos.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador del certificado en catálogo.
--       - nombre_certificado: Título oficial del documento.
--       - descripcion: Detalle y alcance del certificado.
--       - arancel_costo: Valor monetario del trámite.
--       - destinado_a: Perfil habilitado (Alumno, Exalumno).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogo_certificados (
    id SERIAL PRIMARY KEY,
    nombre_certificado VARCHAR(100) NOT NULL,
    descripcion TEXT,
    arancel_costo NUMERIC(10, 2) NOT NULL,
    destinado_a VARCHAR(50) NOT NULL
);

-- --------------------Tabla SQL--------------------
--   Nombre: solicitudes_certificados
--   Descripción:
--       Registro histórico de solicitudes de certificados con
--       código de verificación único para validación pública.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador del trámite de solicitud.
--       - id_estudiante (FK -> usuarios.id): Alumno solicitante.
--       - id_certificado (FK -> catalogo_certificados.id).
--       - codigo_verificacion (UNIQUE): Código alfanumérico.
--       - fecha_solicitud: Momento en que se emitió el trámite.
--       - estado: Estado de tramitación (Emitido, Pendiente).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS solicitudes_certificados (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    id_certificado INTEGER REFERENCES catalogo_certificados(id) ON DELETE RESTRICT,
    codigo_verificacion VARCHAR(50) UNIQUE NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Emitido'
);

-- --------------------Tabla SQL--------------------
--   Nombre: pagos
--   Descripción:
--       Registro polimórfico de pagos financieros aplicables
--       a cuotas, matrícula o certificados con método de pago.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador de la transacción.
--       - id_estudiante (FK -> usuarios.id): Alumno pagador.
--       - id_cuota (FK -> cuotas.id): Cuota pagada (opcional).
--       - id_matricula (FK -> matriculas.id): Matrícula pagada.
--       - id_solicitud_cert (FK -> solicitudes_certificados.id).
--       - monto: Valor abonado en la transacción.
--       - tipo_pago: Clasificación (Arancel, Certificado, etc).
--       - metodo_pago: Medio de pago (WebPay, Transferencia).
--       - mes_referencia: Mes imputado al abono.
--       - emisor: Entidad o titular origen del abono.
--       - fecha: Marca temporal de la transacción.
--       - estado: Resultado del pago (Aprobado, Rechazado).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    id_cuota INTEGER REFERENCES cuotas(id) ON DELETE SET NULL,
    id_matricula INTEGER REFERENCES matriculas(id) ON DELETE SET NULL,
    id_solicitud_cert INTEGER REFERENCES solicitudes_certificados(id) ON DELETE SET NULL,
    monto NUMERIC(10, 2) NOT NULL,
    tipo_pago VARCHAR(50) DEFAULT 'Arancel',
    metodo_pago VARCHAR(50) DEFAULT 'WebPay',
    mes_referencia VARCHAR(50),
    emisor VARCHAR(100) DEFAULT 'Abono Estudiante',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Aprobado'
);

-- --------------------Tabla SQL--------------------
--   Nombre: beneficios_estudiante
--   Descripción:
--       Gestiona las becas y créditos estatales o internos
--       asignados a cada estudiante con su estado de validación.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador del beneficio asignado.
--       - id_estudiante (FK -> usuarios.id): Beneficiario.
--       - nombre_beca: Nombre formal de la beca asignada.
--       - monto_cobertura: Monto total anual cubierto.
--       - vigencia: Rango de periodos de cobertura de la beca.
--       - estado: Estado administrativo (Validado, Pendiente).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS beneficios_estudiante (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_beca VARCHAR(100) NOT NULL,
    monto_cobertura NUMERIC(10, 2) NOT NULL,
    vigencia VARCHAR(50) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Validado'
);

-- --------------------Tabla SQL--------------------
--   Nombre: remuneraciones_ayudantia
--   Descripción:
--       Registro de compensaciones y bonos económicos para
--       estudiantes que ejercen labores de ayudantía docente.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador de la remuneración.
--       - id_estudiante (FK -> usuarios.id): Alumno ayudante.
--       - asignatura: Asignatura donde prestó colaboración.
--       - concepto_bono: Tipo de ayudantía (Cátedra, Lab).
--       - monto: Monto a percibir por la labor.
--       - mes_periodo: Mes al cual corresponde el pago.
--       - fecha_pago_estimada: Fecha proyectada de depósito.
--       - estado_transferencia: Estado (Pendiente, Transferido).
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS remuneraciones_ayudantia (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    asignatura VARCHAR(100) NOT NULL,
    concepto_bono VARCHAR(100) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    mes_periodo VARCHAR(50) NOT NULL,
    fecha_pago_estimada DATE NOT NULL,
    estado_transferencia VARCHAR(50) DEFAULT 'Pendiente'
);

-- --------------------Tabla SQL--------------------
--   Nombre: notificaciones
--   Descripción:
--       Bandeja de avisos transaccionales, alertas de becas,
--       vencimientos de cuotas y respuestas de tickets.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador de la notificación.
--       - id_usuario (FK -> usuarios.id): Destinatario.
--       - titulo: Titular resumido de la notificación.
--       - mensaje: Contenido detallado del aviso.
--       - tipo: Categoría (Informativa, Alerta, Financiera).
--       - leida: Booleano indicador de lectura.
--       - fecha: Marca temporal de despacho de la alerta.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'Informativa',
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------Tabla SQL--------------------
--   Nombre: consultas
--   Descripción:
--       Mesa de ayuda y registro de tickets de soporte técnico
--       y administrativo emitidos por los alumnos al personal.
-- ---------------Columnas principales--------------
--       - id (PK): Identificador del ticket de consulta.
--       - id_usuario (FK -> usuarios.id): Usuario solicitante.
--       - asunto: Resumen o materia de la solicitud.
--       - mensaje: Detalle explicativo de la consulta.
--       - respuesta: Resolución provista por el administrador.
--       - estado: Estado de atención (Pendiente, Respondida).
--       - fecha: Fecha y hora de creación de la consulta.
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    respuesta TEXT,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------Inserción de Usuarios Base--------------------
-- Carga inicial de usuarios de prueba para distintos perfiles
-- -----------------------------------------------------------------
INSERT INTO usuarios (
    rut, password, perfil, nombre, carrera,
    situacion_academica, email, email_personal,
    email_apoderado, telefono, direccion,
    banco, tipo_cuenta, numero_cuenta, rut_titular
) 
VALUES 
(
    '12345678-9', '1234', 'Estudiante Regular',
    'Estudiante Prueba', 'Ingeniería Civil Informática',
    'Regular', 'estudiante.prueba@usm.cl',
    'personal@gmail.com', 'apoderado@gmail.com',
    '+56 9 1234 5678', 'Av. España 1680, Valparaíso',
    'Banco Santander', 'Cuenta Corriente', '84729104', '12345678-9'
),
(
    '98765432-1', '1234', 'Exalumno',
    'Exalumno Prueba', 'Arquitectura',
    'Titulado', 'exalumno@usm.cl',
    'arq.pruebas@gmail.com', '',
    '+56 9 8765 4321', 'Calle Falsa 123',
    'Banco de Chile', 'Cuenta Vista', '55291043', '98765432-1'
),
(
    '11111111-1', '1234', 'Alumno Nuevo',
    'Alumno Nuevo Prueba', 'Ingeniería Civil Industrial',
    'Matriculado', 'nuevo@usm.cl',
    'nuevo.ingreso@hotmail.com', 'padre.ingreso@gmail.com',
    '+56 9 0000 0000', 'Santa Maria 123',
    'Banco Estado', 'Cuenta RUT', '11111111', '11111111-1'
),
(
    '22222222-2', '1234', 'Exalumno',
    'Ana Titulada', 'Arquitectura',
    'Titulado', 'ana.titulada@usm.cl',
    'ana.t@gmail.com', '',
    '+56 9 2222 2222', 'Av. Valparaíso 123',
    'BCI', 'Cuenta Corriente', '19284756', '22222222-2'
),
(
    '33333333-3', '1234', 'Exalumno',
    'Carlos Retirado', 'Ingeniería Civil',
    'Retirado', 'carlos.retirado@usm.cl',
    'carlos.r@gmail.com', '',
    '+56 9 3333 3333', 'Av. España 456',
    'Banco Estado', 'Cuenta RUT', '33333333', '33333333-3'
),
(
    '99999999-9', 'admin123', 'Administrador',
    'Profesor Administrador', 'Casa Central',
    'Activo', 'admin.autoservicio@usm.cl',
    '', '', '', '',
    '', '', '', ''
)
ON CONFLICT (rut) DO NOTHING;

-- -------------------Datos Relacionales: Cuentas-------------------
-- Estado de cuenta y consolidación financiera
-- -----------------------------------------------------------------
INSERT INTO cuenta_estudiante (
    id_estudiante, arancel_bruto, beneficios_validados, saldo_neto, estado_financiero
) 
VALUES 
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    3500000, 1500000, 2000000, 'Al Día'
),
(
    (SELECT id FROM usuarios WHERE rut = '22222222-2'),
    3000000, 3000000, 0, 'Al Día'
),
(
    (SELECT id FROM usuarios WHERE rut = '33333333-3'),
    3500000, 0, 150000, 'Moroso'
),
(
    (SELECT id FROM usuarios WHERE rut = '11111111-1'),
    3200000, 0, 3200000, 'Al Día'
);

-- -------------------Datos Relacionales: Matrículas----------------
-- Registro del cobro de matrícula por periodo académico
-- -----------------------------------------------------------------
INSERT INTO matriculas (
    id_estudiante, periodo_academico, monto_matricula, estado_matricula, fecha_limite
)
VALUES
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    '2026-1', 150000, 'Pagada', '2026-03-31'
),
(
    (SELECT id FROM usuarios WHERE rut = '11111111-1'),
    '2026-1', 150000, 'Pagada', '2026-03-31'
),
(
    (SELECT id FROM usuarios WHERE rut = '33333333-3'),
    '2025-2', 140000, 'Pendiente', '2025-08-15'
);

-- -------------------Datos Relacionales: Cuotas--------------------
-- Desglose mensual de arancel para Estudiante Regular (10 cuotas)
-- -----------------------------------------------------------------
INSERT INTO cuotas (
    id_cuenta, numero_cuota, monto, fecha_vencimiento, estado
)
VALUES
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    1, 200000, '2026-03-31', 'Pagada'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    2, 200000, '2026-04-30', 'Pagada'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    3, 200000, '2026-05-31', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    4, 200000, '2026-06-30', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    5, 200000, '2026-07-31', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    6, 200000, '2026-08-31', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    7, 200000, '2026-09-30', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    8, 200000, '2026-10-31', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    9, 200000, '2026-11-30', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    10, 200000, '2026-12-31', 'Pendiente'
),
(
    (SELECT id FROM cuenta_estudiante WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '33333333-3')),
    1, 150000, '2025-10-31', 'Vencida'
);

-- -------------------Catálogo de Certificados----------------------
-- Catálogo oficial de certificados académicos y aranceles asociados
-- -----------------------------------------------------------------
INSERT INTO catalogo_certificados (
    nombre_certificado, descripcion, arancel_costo, destinado_a
)
VALUES
(
    'Certificado de Alumno Regular',
    'Acredita la calidad de alumno regular matriculado en el periodo académico vigente.',
    0.00,
    'Estudiante Regular'
),
(
    'Certificado de Matrícula',
    'Certifica formalmente la inscripción y matrícula académica en la carrera cursada.',
    0.00,
    'Estudiante Regular'
),
(
    'Concentración de Notas',
    'Detalle completo de calificaciones, asignaturas cursadas y promedio ponderado histórico.',
    3500.00,
    'Todos'
),
(
    'Certificado de Título',
    'Documento legal oficial que acredita la obtención de título universitario o grado académico.',
    5000.00,
    'Exalumno'
),
(
    'Certificado de Asignaturas Aprobadas',
    'Certificación académica de asignaturas efectivamente aprobadas en el plan de estudios.',
    3500.00,
    'Exalumno'
);

-- -------------------Solicitudes de Certificados-------------------
-- Registro de solicitudes y certificados generados con código
-- -----------------------------------------------------------------
INSERT INTO solicitudes_certificados (
    id_estudiante, id_certificado, codigo_verificacion, fecha_solicitud, estado
)
VALUES
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    (SELECT id FROM catalogo_certificados WHERE nombre_certificado = 'Certificado de Alumno Regular'),
    'USM-2026-AR-84729',
    '2026-04-10 10:30:00',
    'Emitido'
),
(
    (SELECT id FROM usuarios WHERE rut = '22222222-2'),
    (SELECT id FROM catalogo_certificados WHERE nombre_certificado = 'Certificado de Título'),
    'USM-2026-TIT-10928',
    '2026-05-15 16:45:00',
    'Emitido'
);

-- -------------------Datos Relacionales: Pagos---------------------
-- Registro de pagos y abonos realizados con trazabilidad completa
-- -----------------------------------------------------------------
INSERT INTO pagos (
    id_estudiante, id_cuota, id_matricula, id_solicitud_cert,
    monto, tipo_pago, metodo_pago, mes_referencia, emisor, fecha, estado
) 
VALUES 
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    (SELECT c.id FROM cuotas c JOIN cuenta_estudiante ce ON c.id_cuenta = ce.id 
     WHERE ce.id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9') AND c.numero_cuota = 1),
    NULL,
    NULL,
    200000,
    'Arancel Cuota',
    'WebPay',
    'Marzo',
    'Abono Estudiante',
    '2026-03-25 14:20:00',
    'Aprobado'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    (SELECT c.id FROM cuotas c JOIN cuenta_estudiante ce ON c.id_cuenta = ce.id 
     WHERE ce.id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9') AND c.numero_cuota = 2),
    NULL,
    NULL,
    200000,
    'Arancel Cuota',
    'WebPay',
    'Abril',
    'Abono Estudiante',
    '2026-04-20 11:15:00',
    'Aprobado'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    NULL,
    (SELECT id FROM matriculas WHERE id_estudiante = (SELECT id FROM usuarios WHERE rut = '12345678-9')),
    NULL,
    150000,
    'Matrícula',
    'WebPay',
    'Marzo',
    'Abono Estudiante',
    '2026-03-10 09:00:00',
    'Aprobado'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    NULL,
    NULL,
    NULL,
    1000000,
    'Beneficio',
    'Abono Estatal',
    'Anual',
    'Sistema de Beneficios: Beca Bicentenario',
    '2026-03-01 08:00:00',
    'Aprobado'
);

-- -------------------Beneficios y Becas----------------------------
-- Becas asignadas con vigencia y estado administrativo
-- -----------------------------------------------------------------
INSERT INTO beneficios_estudiante (
    id_estudiante, nombre_beca, monto_cobertura, vigencia, estado
) 
VALUES 
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Beca Bicentenario', 1000000,
    'Marzo 2026 - Diciembre 2026', 'Validado'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Crédito CAE (Aprobación en curso)', 1500000,
    'Marzo 2026 - Diciembre 2026', 'Pendiente'
);

-- -------------------Remuneraciones por Ayudantías-----------------
-- Pagos por docencia a estudiantes con cargo de ayudante
-- -----------------------------------------------------------------
INSERT INTO remuneraciones_ayudantia (
    id_estudiante, asignatura, concepto_bono, monto,
    mes_periodo, fecha_pago_estimada, estado_transferencia
)
VALUES
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'INF225 Ingeniería de Software',
    'Ayudantía de Cátedra',
    75000.00,
    'Mayo 2026',
    '2026-05-30',
    'Transferido'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'INF225 Ingeniería de Software',
    'Ayudantía de Cátedra',
    75000.00,
    'Junio 2026',
    '2026-06-30',
    'Pendiente'
);

-- -------------------Bandeja de Notificaciones---------------------
-- Registro de alertas informativas y financieras del alumno
-- -----------------------------------------------------------------
INSERT INTO notificaciones (
    id_usuario, titulo, mensaje, tipo, leida, fecha
)
VALUES
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Abono Recibido',
    'Se ha recibido conforme su pago de cuota por un valor de $200.000.',
    'Financiera',
    TRUE,
    '2026-03-25 14:21:00'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Validación de Beca en Trámite',
    'Su postulación a Crédito CAE se encuentra en estado Pendiente de validación.',
    'Alerta',
    FALSE,
    '2026-04-02 09:00:00'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Certificado Emitido',
    'Su Certificado de Alumno Regular ha sido emitido con código USM-2026-AR-84729.',
    'Informativa',
    TRUE,
    '2026-04-10 10:31:00'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Bono de Ayudantía Depositado',
    'La remuneración correspondiente a la ayudantía INF225 de Mayo ha sido transferida.',
    'Financiera',
    FALSE,
    '2026-05-30 18:00:00'
);

-- -------------------Consultas y Tickets de Soporte----------------
-- Solicitudes de asistencia para pruebas de bandeja de soporte
-- -----------------------------------------------------------------
INSERT INTO consultas (
    id_usuario, asunto, mensaje, respuesta, estado, fecha
)
VALUES 
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Problema carga de notas',
    'Hola, no puedo visualizar mis calificaciones en Aula desde SIGA.',
    'Estimado alumno, el departamento de registro académico ha resuelto la sincronización.',
    'Respondida',
    '2026-06-10 09:15:00'
),
(
    (SELECT id FROM usuarios WHERE rut = '12345678-9'),
    'Desfase validación CAE',
    'Estimados, ingresé mi pagaré del CAE pero mi saldo neto no disminuye.',
    NULL,
    'Pendiente',
    '2026-06-11 14:30:00'
);
