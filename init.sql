CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL,
    nombre VARCHAR(100),
    email VARCHAR(100),
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
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (rut, password, perfil, nombre, email, telefono, direccion) VALUES
('12345678-9', '1234', 'Estudiante Regular', 'Estudiante Prueba', 'estudiante.prueba@usm.cl', '+56 9 1234 5678', 'Av. España 1680, Valparaíso'),
('98765432-1', '1234', 'Exalumno', 'Exalumno Prueba', 'exalumno@usm.cl', '+56 9 8765 4321', 'Calle Falsa 123'),
('11111111-1', '1234', 'Alumno Nuevo', 'Alumno Nuevo Prueba', 'nuevo@usm.cl', '+56 9 0000 0000', 'Santa Maria 123')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO cuenta_estudiante (id_estudiante, arancel_bruto, beneficios_validados, saldo_neto) 
VALUES (1, 3500000, 1500000, 2000000);

INSERT INTO pagos (id_estudiante, monto) 
VALUES (1, 500000);