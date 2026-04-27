# Publicar Patient Viewer en Docker Hub

Repositorio: `camposbj/ohif-patient-viewer`

> El servidor de produccion corre Linux AMD64. El build debe hacerse para esa plataforma usando `docker buildx`.

---

## Requisitos previos

- Node >= 18
- Yarn >= 1.20.0
- Docker instalado y corriendo
- Sesion activa en Docker Hub (`docker login`)
- Builder multiarch configurado (solo la primera vez):

```bash
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap
```

---

## Flujo completo

### 1. Build de la app

Desde la raiz del monorepo, navega a `platform/app`:

```bash
cd platform/app
```

Ejecuta el build de produccion:

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

### 3. Build y push de la imagen Docker

Reemplaza `X.Y.Z` con la version que vas a publicar (e.g. `2.0.0`).

Este comando construye para AMD64 (plataforma del servidor) y hace push directamente a Docker Hub:

```bash
docker buildx build \
  --platform linux/amd64 \
  -f Dockerfile.patient \
  -t camposbj/ohif-patient-viewer:X.Y.Z \
  -t camposbj/ohif-patient-viewer:latest \
  --push \
  .
```

> El flag `--push` sube la imagen directamente. No es necesario correr `docker push` por separado.

---

## Despliegue en el servidor

Edita el `docker-compose.yml` y actualiza la version:

```yaml
ohif:
  image: camposbj/ohif-patient-viewer:X.Y.Z
```

Luego descarga la nueva imagen y reinicia solo el contenedor `ohif`:

```bash
docker compose pull ohif
docker compose up -d ohif
```

Verifica que quedo corriendo:

```bash
docker compose ps ohif
docker compose logs ohif --tail=50
```

---

## Historial de versiones

| Version | Descripcion                  | Fecha      |
|---------|------------------------------|------------|
| 1.0.0   | Version inicial              | 2026-03-30 |
| 2.0.0   | (en progreso)                |            |

---

## Archivos relevantes

| Archivo                                  | Descripcion                                    |
|------------------------------------------|------------------------------------------------|
| `Dockerfile.patient`                     | Imagen basada en `nginxinc/nginx-unprivileged` |
| `nginx.patient.conf`                     | Config de nginx para SPA (history fallback)    |
| `platform/app/public/config/default.js`  | Config del viewer (DICOM server, etc.)         |

---

## Notas

- El `Dockerfile.patient` copia el contenido de `platform/app/dist/` — el build debe existir antes del `docker buildx build`.
- La imagen corre en el puerto `80` internamente. El docker-compose lo expone en el `3010`.
- El nginx tiene comentado un proxy hacia dcm4chee para HTTPS. Ver `nginx.patient.conf` si necesitas activarlo.
- No incluir la linea `version:` en el `docker-compose.yml` — es obsoleta en versiones modernas de Docker Compose y genera warnings.
