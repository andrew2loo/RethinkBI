# Building RethinkBI in Docker Windows Container

This guide explains how to build the RethinkBI Electron application inside a Windows Docker container.

## Prerequisites

1. **Docker Desktop for Windows** with Windows containers enabled
   - Download from: https://www.docker.com/products/docker-desktop
   - Enable Windows containers: Right-click Docker icon → "Switch to Windows containers"

2. **Verify Windows containers are enabled:**
   ```powershell
   docker version
   # Should show "OS/Arch: windows/amd64"
   ```

## Quick Start

### Option 1: Build using Dockerfile directly

```powershell
# Build the image
docker build -f Dockerfile.windows -t rethinkbi:windows .

# Run the build inside the container
docker run --rm `
  -v ${PWD}:C:\app `
  -v ${PWD}\dist:C:\app\dist `
  -v ${PWD}\out:C:\app\out `
  rethinkbi:windows `
  powershell -Command "npm run build; npm run dist"
```

### Option 2: Build using Docker Compose

```powershell
# Build and run
docker-compose -f docker-compose.windows.yml up --build

# The build artifacts will be in .\dist and .\out directories
```

## Step-by-Step Build Process

### 1. Switch to Windows Containers

```powershell
# If not already on Windows containers
docker context use default
# Or right-click Docker Desktop icon → "Switch to Windows containers"
```

### 2. Build the Docker Image

```powershell
docker build -f Dockerfile.windows -t rethinkbi:windows .
```

This will:
- Pull the Windows Server Core (ltsc2019) base image
- Install Node.js 20 LTS
- Install Git for Windows
- Copy your code
- Install npm dependencies

### 3. Run the Build

```powershell
# Create output directories
New-Item -ItemType Directory -Force -Path dist,out

# Run build in container
docker run --rm `
  -v ${PWD}:C:\app `
  -v ${PWD}\dist:C:\app\dist `
  -v ${PWD}\out:C:\app\out `
  rethinkbi:windows `
  powershell -Command "npm run build; npm run dist"
```

### 4. Access Build Artifacts

After the build completes, you'll find:

- **`dist/`** - Compiled JavaScript files
- **`out/`** - Packaged Electron app
  - `RethinkBI Setup X.X.X.exe` - Windows installer

## Advanced Usage

### Interactive Container (for debugging)

```powershell
# Run interactive container
docker run -it --rm `
  -v ${PWD}:C:\app `
  -w C:\app `
  rethinkbi:windows `
  powershell

# Inside container, you can run:
npm install
npm run build
npm run dev  # (won't work without display, but you can test build)
```

### Build Only (without packaging)

```powershell
docker run --rm `
  -v ${PWD}:C:\app `
  -w C:\app `
  rethinkbi:windows `
  npm run build
```

### Clean Build (remove node_modules first)

```powershell
docker run --rm `
  -v ${PWD}:C:\app `
  -w C:\app `
  rethinkbi:windows `
  powershell -Command "Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; npm ci; npm run build; npm run dist"
```

## Troubleshooting

### Issue: "This node does not support Windows containers"

**Solution:** Switch to Windows containers mode in Docker Desktop

### Issue: Build fails with "native module" errors

**Solution:** Some native modules (like DuckDB) may need to be built in the container:
```powershell
docker run --rm -v ${PWD}:C:\app rethinkbi:windows npm rebuild
```

### Issue: Out of disk space

**Solution:** Clean up Docker images:
```powershell
docker system prune -a
```

### Issue: Slow builds

**Solution:** Use Docker BuildKit for faster builds:
```powershell
$env:DOCKER_BUILDKIT=1
docker build -f Dockerfile.windows -t rethinkbi:windows .
```

## Build Time Estimates

- **First build:** 15-20 minutes (downloads base image, installs Node.js)
- **Subsequent builds:** 5-10 minutes (uses cached layers)
- **Incremental builds:** 2-5 minutes (only changed files)

## Output Locations

After successful build:

```
RethinkBI/
├── dist/              # Compiled TypeScript
│   ├── main/
│   ├── preload/
│   └── renderer/
└── out/               # Packaged application
    └── win-unpacked/  # Unpacked app
    └── *.exe         # Installer
```

## Alternative: Multi-stage Build (Optimized)

For a smaller final image, you can use a multi-stage build:

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/windows/servercore:ltsc2022 AS builder
# ... (build steps)

# Stage 2: Runtime (if needed)
FROM mcr.microsoft.com/windows/servercore:ltsc2022
COPY --from=builder /app/dist /app/dist
# ... (runtime steps)
```

## Notes

- **Windows containers are required** for building Windows Electron apps
- The container includes Node.js 20 LTS
- Build artifacts are saved to mounted volumes
- The container is ~5-6GB (includes Windows Server Core + Node.js)
- Native modules are compiled during `npm ci`

## Comparison with Other Methods

| Method | Pros | Cons |
|--------|------|------|
| **Docker Windows** | Isolated, reproducible | Large image, Windows containers only |
| **GitHub Codespaces** | No local setup, cloud-based | Requires internet, GitHub account |
| **GitHub Actions** | Automated, free for public repos | CI/CD only, not interactive |
| **Local Build** | Fastest, full control | Requires Node.js installation |

Choose Docker Windows containers if you want a reproducible build environment without installing Node.js locally.

