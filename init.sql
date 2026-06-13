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

CREATE TABLE IF NOT EXISTS cuenta_estudiante (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id),
    arancel_bruto NUMERIC(10, 2) NOT NULL,
    beneficios_validados NUMERIC(10, 2) DEFAULT 0,
    saldo_neto NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER REFERENCES usuarios(id),
    monto NUMERIC(10, 2) NOT NULL,
    mes_referencia VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (rut, password, perfil, nombre, carrera, situacion_academica, email, email_personal, email_apoderado, telefono, direccion) VALUES
('12345678-9', '1234', 'Estudiante Regular', 'Estudiante Prueba', 'Ingeniería Civil Informática', 'Regular', 'estudiante.prueba@usm.cl', 'personal@gmail.com', 'apoderado@gmail.com', '+56 9 1234 5678', 'Av. España 1680, Valparaíso'),
('98765432-1', '1234', 'Exalumno', 'Exalumno Prueba', 'Arquitectura', 'Titulado', 'exalumno@usm.cl', 'arq.pruebas@gmail.com', '', '+56 9 8765 4321', 'Calle Falsa 123'),
('11111111-1', '1234', 'Alumno Nuevo', 'Alumno Nuevo Prueba', 'Ingeniería Civil Industrial', 'Matriculado', 'nuevo@usm.cl', 'nuevo.ingreso@hotmail.com', 'padre.ingreso@gmail.com', '+56 9 0000 0000', 'Santa Maria 123')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO cuenta_estudiante (id_estudiante, arancel_bruto, beneficios_validados, saldo_neto) 
VALUES (1, 3500000, 1500000, 2000000);

INSERT INTO pagos (id_estudiante, monto) 
VALUES (1, 500000);



INSERT INTO usuarios (rut, password, perfil, nombre, carrera, situacion_academica, email, email_personal, telefono, direccion) 
VALUES ('22222222-2', '1234', 'Exalumno', 'Ana Titulada', 'Arquitectura', 'Titulado', 'ana.titulada@usm.cl', 'ana.t@gmail.com', '+56 9 2222 2222', 'Av. Valparaíso 123');

-- Le creamos un estado de cuenta con saldo_neto = 0
INSERT INTO cuenta_estudiante (id_estudiante, arancel_bruto, beneficios_validados, saldo_neto) 
VALUES (
    (SELECT id FROM usuarios WHERE rut = '22222222-2'), 
    3000000, 
    3000000, 
    0 
);




INSERT INTO usuarios (rut, password, perfil, nombre, carrera, situacion_academica, email, email_personal, telefono, direccion) 
VALUES ('33333333-3', '1234', 'Exalumno', 'Carlos Retirado', 'Ingeniería Civil', 'Retirado', 'carlos.retirado@usm.cl', 'carlos.r@gmail.com', '+56 9 3333 3333', 'Av. España 456');

-- Le creamos un estado de cuenta con una deuda pendiente (saldo_neto > 0)
INSERT INTO cuenta_estudiante (id_estudiante, arancel_bruto, beneficios_validados, saldo_neto) 
VALUES (
    (SELECT id FROM usuarios WHERE rut = '33333333-3'), 
    3500000, 
    0, 
    150000  
);

-- =========================================================================
-- TABLA DE CONSULTAS (Módulo Administrador)
-- =========================================================================
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente', -- 'Pendiente' o 'Respondida'
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================================================
-- 3. USUARIO ADMINISTRADOR DE PRUEBAS
-- Escenario: Cuenta con rol administrativo para gestionar consultas académicas.
-- =========================================================================
INSERT INTO usuarios (rut, password, perfil, nombre, carrera, situacion_academica, email) 
VALUES (
    '99999999-9', 
    'admin123', 
    'Administrador', 
    'Profesor Administrador', 
    'Casa Central', 
    'Activo', 
    'admin.autoservicio@usm.cl'
)
ON CONFLICT (rut) DO NOTHING;



-- DATOS DE PRUEBA (Para validar el orden cronológico del CA 1)
-- Consulta 1: La más antigua (10 de Junio)
INSERT INTO consultas (id_usuario, asunto, mensaje, fecha)
VALUES (1, 'Problema carga de notas', 'Hola, no puedo visualizar mis calificaciones en Aula desde SIGA.', '2026-06-10 09:15:00');

-- Consulta 2: La más reciente (11 de Junio)
INSERT INTO consultas (id_usuario, asunto, mensaje, fecha)
VALUES (1, 'Desfase validación CAE', 'Estimados, ingresé mi pagaré del CAE pero mi saldo neto no disminuye.', '2026-06-11 14:30:00');
