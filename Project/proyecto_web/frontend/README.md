# EcoCity Buenaventura — Documentación Técnica

Este documento explica la estructura, lógica y funcionamiento de los componentes del proyecto.

## 📂 1. Estructura de Carpetas

```
/proyecto_web
├── frontend/        # Cliente Web (HTML, CSS, JS)
│   ├── assets/      # Imágenes y recursos estáticos
│   ├── css/         # Hojas de estilo
│   ├── js/          # Lógica de la aplicación
│   └── index.html   # Punto de entrada
├── backend/         # (Futuro) Servidor y API
└── legacy/          # Archivos de respaldo
```

---

## 💻 2. Frontend: Funcionamiento Detallado

### A. `index.html` (Estructura)
Es el punto de entrada. Utiliza HTML5 semántico.
- **`<nav>`**: Barra de navegación con enlaces de desplazamiento suave.
- **`.hero`**: Sección principal con imagen destacada.
- **`#rutas`**: Mapa Leaflet (`#mapRutas`) y lista de selección.
- **`#reportes`**: Formulario y mapa secundario (`#mapReporte`).
- **Overlays**: Modales para **Login** y **Registro**.

### B. `js/app.js` (Lógica Principal)
Este archivo es el "cerebro" de la aplicación. Módulos principales:

1.  **Seguridad y Autenticación**
    - **Login Estricto**: No permite acceso sin usuario.
    - **Almacenamiento Híbrido**: Al registrarse, los datos se guardan en:
        1.  **LocalStorage**: Para permitir el inicio de sesión inmediato (offline).
        2.  **GitHub (Nube)**: Se envía un backup al repositorio `JaviMercad/Base-de-datos` usando la API de GitHub Actions (requiere Token configurado).

2.  **Sistema de Mapas (Leaflet.js)**
    - `initMaps()`: Inicializa mapas con capas de OpenStreetMap.
    - **Rutas de Precisión**: Coordenadas ajustadas manualmente para seguir las calzadas de Av. Simón Bolívar y La Independencia.

3.  **Simulación Inteligente**
    - **Seguimiento**: La cámara del mapa sigue al camión automáticamente.
    - **Notificación de Proximidad**: El sistema calcula la distancia entre el camión y una "Casa Simulada" (mitad de ruta). Si la distancia es < 150m, lanza una alerta visual: *"¡Saca la basura!"*.

4.  **Gestión de Reportes**
    - Guarda incidentes (descripción, foto, ubicación) en el navegador del usuario.

### C. `css/styles.css` (Estilos)
- **Variables CSS**: Colores corporativos (`--green`, `--blue`).
- **Diseño Responsivo**: Adaptable a móviles y escritorio.

---

## ☁️ 3. Integración con GitHub
El archivo `app.js` contiene una constante `GITHUB_TOKEN` donde se debe pegar un **Personal Access Token** válido.
- Esto permite que la función `enviarRegistroAGitHub()` dispare un evento `repository_dispatch` hacia el repositorio configurado.
- Si el token falta o es inválido, el sistema funcionará solo en modo local.

## 🚀 Cómo ejecutar
Simplemente abre el archivo `frontend/index.html` en tu navegador.
