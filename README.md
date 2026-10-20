# Proyecto Autoservicio

> **Universidad:** Universidad Técnica Federico Santa María (UTFSM)  
> **Curso:** Ingeníeria de Software(INF225) — 2° Semestre/2026  
> **Grupo:** 5
>
> **Integrantes:**
> * Vicente Rodríguez Rogers            | 202273503-1 
> * Isidora  Belén Riquelme Lemunao     | 202304680-9
> * Daniel Ricci                        | 202430513-1
> * Ariadna Andreina Marquez Gonzalez   | 202373527-2
> * Gabriel Alejandro Toro Varela       | 202204557-4
> * Javier Alonso Gana Muñoz            | 202373540-k       
>
> **Tutor:** Isidora Villegas

---

## Descripción del Proyecto
El **Portal de Autoservicio Institucional** es una plataforma web integral orientada a la comunidad universitaria de la UTFSM (alumnos regulares, alumnos nuevos, exalumnos y personal administrativo). Permite centralizar la gestión de datos académicos y bancarios, la consulta y pago de aranceles, la tramitación de becas y beneficios, la solicitud de certificados oficiales y la atención de requerimientos mediante una mesa de ayuda centralizada.

El proyecto es desarrollado bajo la metodología creación de una startup de software (**MEJORA**), en donde se retoma un proyecto en pleno desarrollo y se integran nuevos desarrolladores al equipo. Con esta nueva fuerza de trabajo, se debe colaborar para lograr implementar mejoras continuas, saneamiento de deuda técnica y desarrollar nuevas funcionalidades de alto impacto al proyecto del que esta encargada la startup.

## Wiki

### <u> **Acceso a la pagina:** </u> [HOME](https://github.com/MrDoppelganger/INF225-sj-Autoservicio/wiki)

###  Videos

* [Evidencia de avance de código INF236 | Gestión de Acceso y Sesión Unificada](https://youtu.be/nle3hsQuJ-g)
* [Prototipo | Hito 3](https://youtu.be/r0ktqbcTGLI)
* [Video Hito 5](https://youtu.be/c3bMjtekJhw)

## Aspectos Tecnicos

### Estructura del Repositorio

```bash
├── backend/                   # Código del servidor Node.js / Express
│   ├── Dockerfile             # Contenedor para el servicio backend
│   ├── index.js               # Servidor principal y endpoints de la API REST
│   └── package.json           # Dependencias y scripts del backend
├── frontend/                  # Aplicación cliente React + TypeScript + Vite
│   ├── src/
│   │   ├── assets/            # Logotipos y recursos gráficos institucionales
│   │   ├── components/        # Componentes reutilizables (Header, navegación)
│   │   ├── pages/             # Vistas de la aplicación (Dashboard, Pagos, etc.)
│   │   └── styles/            # Hojas de estilo CSS modulares
│   ├── Dockerfile             # Contenedor para el servicio frontend
│   └── package.json           # Dependencias y scripts de la interfaz
├── init.sql                   # Script DDL de base de datos y datos de prueba
├── docker-compose.yml         # Orquestación de contenedores (db, backend, frontend)
└── README.md                  # Documento principal de bienvenida y despliegue
```

### Arquitectura del Sistema
El sistema está construido bajo una **arquitectura desacoplada cliente-servidor de tres capas**:

1. **Frontend (Capa de Presentación):** Single Page Application (SPA) desarrollada con **React 19**, **TypeScript** y empaquetada con **Vite**. Diseño responsivo basado en CSS modular.
2. **Backend (Capa de Negocio y API):** Servidor API REST desarrollado en **Node.js** con **Express 5**, encargado de la lógica transaccional, autenticación y comunicación con la persistencia.
3. **Base de Datos (Capa de Persistencia):** Servidor relacional **PostgreSQL 15**, con integridad referencial y disparadores para la gestión de cuentas y pagos.
4. **Infraestructura:** Todos los servicios se encuentran orquestados y aislados mediante **Docker Compose**.

### <u> **Levantamiento**: </u>
*   Se recomienda asegurar que no se posee nada en los puertos ***3000***, ***5173*** y ***5432*** de localhost.
*   Se debe abrir una terminal ubicada en la carpeta raiz del proyecto
*   dentro de la terminal se levanta el proyecto ejecutando el comando: ***docker compose up --build***.
*   Acceder a los servicios desde el navegador:
    * **Portal Web (Frontend):** [http://localhost:5173](http://localhost:5173)
    * **Servidor API (Backend):** [http://localhost:3000](http://localhost:3000)
    * **Base de Datos:** `localhost:5432` (Base: `proyecto_db`, Usuario: `usuario_dev`)

### 🔑 Credenciales de Prueba Predefinidas

El sistema cuenta con usuarios semilla precargados en `init.sql` para validar diferentes perfiles y flujos:

| Perfil | RUT | Contraseña | Rol / Situación Académica |
| :--- | :--- | :--- | :--- |
| **Estudiante Regular** | `12345678-9` | `1234` | Estudiante con arancel neto, beneficios y consultas |
| **Alumno Nuevo** | `11111111-1` | `1234` | Estudiante de primer ingreso matriculado |
| **Exalumno (Titulado)** | `22222222-2` | `1234` | Titulado con saldo al día (acceso a Certificado de Título) |
| **Exalumno (Retirado)** | `33333333-3` | `1234` | Retirado con deuda pendiente (bloqueo de certificados) |
| **Administrador** | `99999999-9` | `admin123` | Docente/Admin con acceso a la Bandeja Central de Soporte |


## <u> **Consideraciones**: </u>
* N/N