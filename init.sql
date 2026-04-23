CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL
);

INSERT INTO usuarios (rut, password, perfil) VALUES
('12345678-9', '1234', 'Estudiante Regular'),
('98765432-1', '1234', 'Exalumno'),
('11111111-1', '1234', 'Alumno Nuevo');