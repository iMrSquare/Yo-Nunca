# Yo Nunca

Web app del clásico juego "Yo nunca he...". Elige listas de preguntas (Amigos, Romántico, Trabajo, Cultura Pop, Fiesta, Picante +18), mézclalas y jugad pasando el móvil.

Incluye un panel de administración en `/adm` para crear tus propias listas, protegerlas con contraseña y ver estadísticas de partidas. Las listas y estadísticas se guardan en una base de datos SQLite en el servidor, así que se comparten entre dispositivos.

## Instalación con Docker (recomendado)

Requisitos: Docker y Docker Compose.

### Opción rápida: imagen publicada (sin clonar el repo)

Cada tag `vX.Y.Z` se publica automáticamente en GitHub Container Registry: `ghcr.io/imrsquare/yo-nunca`.

Crea un `docker-compose.yml`:

```yaml
services:
  yo-nunca:
    image: ghcr.io/imrsquare/yo-nunca:latest
    container_name: yo-nunca
    restart: unless-stopped
    environment:
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    ports:
      - "3015:3000"
    volumes:
      - ./data:/app/server/data
```

Y un `.env` en la misma carpeta con tu contraseña:

```bash
echo "ADMIN_PASSWORD=tu_contraseña" > .env
```

Levántalo:

```bash
docker compose up -d
```

### Opción alternativa: construir desde el código fuente

1. Clona el repositorio:

   ```bash
   git clone https://github.com/iMrSquare/Yo-Nunca.git
   cd Yo-Nunca
   ```

2. Crea un archivo `.env` en la raíz del proyecto con la contraseña de acceso al panel de administración (`/adm`):

   ```bash
   echo "ADMIN_PASSWORD=tu_contraseña" > .env
   ```

   Si no defines este archivo, se usará la contraseña por defecto `cambiame123`.

3. Levanta la app:

   ```bash
   docker compose up --build -d
   ```

### En ambos casos

Abre `http://localhost:3015` para jugar, o `http://localhost:3015/adm` para administrar las listas.

Los datos (listas y estadísticas) se guardan en `./data`, que persiste entre reinicios del contenedor.

> La contraseña se lee en tiempo de ejecución, así que para cambiarla basta con editar la variable `ADMIN_PASSWORD` y hacer `docker compose up -d` (no hace falta reconstruir ni volver a descargar la imagen).

## Desarrollo local (sin Docker)

Requisitos: Node.js 22.5+ (usa `node:sqlite`, incluido en el propio Node).

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`, sirviendo también la API sobre la misma base de datos SQLite. La contraseña de `/adm` se lee de `.env.local` (`ADMIN_PASSWORD=...`); si no existe, se usa `cambiame123`.

Para compilar y ejecutar en modo producción:

```bash
npm run build
ADMIN_PASSWORD=tu_contraseña npm start
```
