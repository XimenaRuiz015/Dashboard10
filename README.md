# GanttFlow Enterprise - Dashboard Interactivo de Implementación

Dashboard web empresarial, interactivo, moderno y profesional para la gestión, seguimiento y control de proyectos basado en **Diagrama de Gantt** y **Tabla de Actividades de Implementación**.

El sistema ha sido alimentado y calibrado a partir del archivo de actividades del proyecto de implementación de red Wi-Fi institucional (UniFi U7-Pro), respetando fielmente las 8 actividades originales, duraciones, dependencias, prioridades y responsables.

---

## 🚀 Características Principales

### 1. Panel de Control (Resumen Ejecutivo)
- **Indicadores Clave (KPIs)**: Total de actividades, actividades completadas, en proceso, pendientes y retrasadas.
- **Porcentaje de Avance General**: Cálculo automático ponderado por la duración de cada tarea.
- **Límites Temporales**: Fechas calculadas de inicio y fin estimado, duración total y días restantes.

### 2. Diagrama de Gantt Interactivo
- **Escala Temporal Dinámica**: Vistas por **Días**, **Semanas** y **Meses**.
- **Zoom y Navegación**: Botones de desplazamiento horizontal, zoom in/out y acceso directo a **Hoy**.
- **Líneas de Dependencia (SVG)**: Visualización de relaciones de precedencia con curvas suaves y flechas direccionadas.
- **Identificación de Estados por Color**:
  - 🟢 **Completada**: Verde esmeralda (`#10b981`)
  - 🔵 **En proceso**: Azul corporativo (`#2563eb`)
  - 🔴 **Atrasada**: Rojo carmesí (`#ef4444`)
  - ⚪ **Pendiente**: Gris neutro (`#94a3b8`)
- **Ruta Crítica (CPM)**: Detección automática del camino crítico que define la duración del proyecto.
- **Tooltips Enriquecidos**: Detalles completos al posar el cursor sobre cualquier barra de actividad.

### 3. Tabla Dinámica de Actividades
- **Búsqueda en Tiempo Real**: Filtra por ID, nombre, responsable u observaciones.
- **Filtros Múltiples**: Filtrado por estado, por responsable y por prioridad.
- **Ordenamiento Multicolumna**: Ordena ascendente/descendente por ID, actividad, duración, fechas o avance.
- **Edición en Línea**: Sliders para avance porcentual y selectores de estado directos.
- **Gestión Completa**: Crear nuevas actividades y eliminar con diálogo de confirmación.
- **Exportación a CSV / Excel**: Descarga de datos filtrados o completos con codificación UTF-8 BOM.

### 4. Gráficos Estadísticos (Chart.js)
- **Distribución por Estado**: Gráfico de dona con porcentaje global central.
- **Carga de Trabajo por Responsable**: Gráfico de barras comparando cantidad de tareas y días de esfuerzo asignados.
- **Curva S de Avance Acumulado**: Proyección temporal del avance acumulado a lo largo del cronograma.
- **Avance Individual por Actividad**: Gráfico de barras horizontales con progreso real vs meta del 100%.

### 5. Panel de Seguimiento, Control y Alertas
- **Categorización Automática**: Atrasadas, próximas a vencer (&le; 7 días), bajo avance y pendientes de inicio.
- **Cadena Visual de Ruta Crítica**: Secuencia de actividades indispensables para el cierre en fecha.
- **Acciones Rápidas**: Completar al 100% o iniciar tareas con un solo clic.

### 6. Persistencia y Configuración
- **LocalStorage**: Todo cambio (avance, estado, fechas, nuevas tareas) se almacena de forma persistente en el navegador.
- **Restablecer Original**: Permite volver en cualquier momento a las 8 actividades base del documento.
- **Importación / Exportación**: Soporte para archivos `.csv` y copias de seguridad en `.json`.
- **Configuración de Calendario**: Conmutador entre Días Hábiles (Lunes a Viernes) y Días Calendario continuos.

---

## 📋 Datos Originales del Proyecto

| # | Prioridad | Actividad | Responsable | Depende de | Duración | Estado |
|---|-----------|-----------|-------------|------------|----------|--------|
| **1** | Alta | Diagnosticar las zonas con saturación y definir cuántos AP se necesitan y dónde ubicarlos | Ingeniero de redes | Ninguna | 10 días | Pendiente |
| **2** | Alta | Adquirir los AP (UniFi U7-Pro), tender el cableado Cat6 y los switches PoE necesarios, instalar los equipos y configurar VLAN, QoS y firewall. | Proveedor contratado | 1 | 30 días | Pendiente |
| **3** | Alta | Probar la cobertura y la capacidad en las zonas intervenidas: velocidad, estabilidad y número de usuarios por AP. | Ingeniero de redes | 2 | 5 días | Pendiente |
| **4** | Alta | Auditar la seguridad de la red: revisar las reglas del firewall y hacer pruebas de acceso no autorizado | Responsable de seguridad de la información | 2 | 5 días | Pendiente |
| **5** | Alta | Configurar el monitoreo de capacidad y estabilidad en el controlador UniFi, con alertas cuando una zona se acerque a la saturación. | Ingeniero de redes | 3 | 5 días | Pendiente |
| **6** | Media | Capacitar a la mesa de servicio y al personal de TI en la administración de la nueva red | Ingeniero de redes | 3 | 5 días | Pendiente |
| **7** | Baja | Informar a la comunidad académica sobre las nuevas zonas con cobertura | Comunicaciones institucionales | 3 | 3 días | Pendiente |
| **8** | Media | Documentar la configuración, entregar el inventario de AP y firmar el acta de recibo | Coordinador de Recursos Informáticos | 4, 5, 6 | 5 días | Pendiente |

---

## 🛠️ Tecnologías Utilizadas

- **React 19 & TypeScript**: Componentes tipados, reactivos y modulares.
- **Vite 8**: Empaquetador ultrarrápido y optimizado para producción.
- **Tailwind CSS v4**: Estilos utilitarios modernos con tipografía empresarial Plus Jakarta Sans y JetBrains Mono.
- **Chart.js & React-Chartjs-2**: Gráficos interactivos de alta fidelidad.
- **Lucide React**: Iconografía técnica funcional.
- **LocalStorage API**: Almacenamiento local cliente sin dependencia de servidores externos.

---

## 📦 Instrucciones para Compilar y Publicar en GitHub Pages

La aplicación es 100% de cliente (Single Page Application sin dependencias de backend), ideal para **GitHub Pages**.

### 1. Ejecutar localmente en desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### 2. Compilar para producción
```bash
npm run build
```
Esto generará los archivos estáticos listos para producción dentro de la carpeta `dist/`.

### 3. Publicación automática en GitHub Pages

#### Opción A: Mediante GitHub Actions (Recomendado)
Crea el archivo `.github/workflows/deploy.yml` con el siguiente contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Nota para subdirectorios en GitHub Pages**:
> Si publicas en `https://<usuario>.github.io/<repositorio>/`, configura `base: './'` en `vite.config.ts`:
> ```typescript
> export default defineConfig({
>   base: './',
>   // ... resto de la configuración
> });
> ```

#### Opción B: Mediante gh-pages
```bash
npm install -D gh-pages
```
Agrega en tu `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
Y ejecuta:
```bash
npm run deploy
```
