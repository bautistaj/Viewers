# Publicar Patient Viewer en Docker Hub

Repositorio: `camposbj/ohif-patient-viewer`

---

## Requisitos previos

- Node >= 18
- Yarn >= 1.20.0
- Docker instalado y corriendo
- Sesión activa en Docker Hub (`docker login`)

---

## Flujo completo

### 1. Hacer el build de la app

Desde la raiz del monorepo, navega a `platform/app`:

```bash
cd platform/app
```

Ejecuta el build de producción:

```bash
yarn build:viewer
```

> **Importante:** No uses `yarn build` a secas — ese comando no setea `NODE_ENV=production` y falla con errores de HMR en CSS.

El output queda en `platform/app/dist/`.

---

### 2. Volver a la raiz del proyecto

```bash
cd ../..
```

Verifica que el directorio `platform/app/dist/` existe antes de continuar:

```bash
ls platform/app/dist/
```

---

### 3. Build de la imagen Docker

Reemplaza `X.Y.Z` con la version que vas a publicar (e.g. `2.0.0`):

```bash
docker build -f Dockerfile.patient -t camposbj/ohif-patient-viewer:X.Y.Z .
```

---

### 4. Agregar el tag `latest`

```bash
docker tag camposbj/ohif-patient-viewer:X.Y.Z camposbj/ohif-patient-viewer:latest
```

---

### 5. Push a Docker Hub

```bash
docker push camposbj/ohif-patient-viewer:X.Y.Z
docker push camposbj/ohif-patient-viewer:latest
```

---

## Historial de versiones

| Version | Descripcion                  | Fecha      |
|---------|------------------------------|------------|
| 1.0.0   | Version inicial              | 2026-03-30 |
| 2.0.0   | (en progreso)                |            |

---

## Archivos relevantes

| Archivo                  | Descripcion                                      |
|--------------------------|--------------------------------------------------|
| `Dockerfile.patient`     | Imagen basada en `nginxinc/nginx-unprivileged`   |
| `nginx.patient.conf`     | Config de nginx para SPA (history fallback)      |
| `platform/app/public/config/default.js` | Config del viewer (DICOM server, etc.) |

---

## Notas

- El `Dockerfile.patient` copia el contenido de `platform/app/dist/` — el build debe existir antes del `docker build`.
- La imagen corre en el puerto `80` internamente. Mapea segun necesites al hacer `docker run`.
- El nginx tiene comentado un proxy hacia dcm4chee para HTTPS. Ver `nginx.patient.conf` si necesitas activarlo.
