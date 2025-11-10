# Building RethinkBI

This document explains how to build RethinkBI without installing Node.js locally.

## 🚀 Option 1: GitHub Codespaces (Easiest)

GitHub Codespaces provides a cloud-based development environment with Node.js pre-installed.

### Steps:

1. **Push your code to GitHub** (if not already there)
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Open in Codespaces:**
   - Go to your GitHub repository
   - Click the green **"Code"** button
   - Select the **"Codespaces"** tab
   - Click **"Create codespace on main"**
   - Wait 2-3 minutes for the environment to initialize

3. **The environment automatically:**
   - Installs Node.js 20
   - Runs `npm install`
   - Sets up VS Code with extensions

4. **Run the application:**
   ```bash
   npm run dev
   ```
   - The Electron window will open in the browser preview
   - Port 5173 is automatically forwarded

5. **Build for production:**
   ```bash
   npm run build
   npm run dist
   ```

## 🔨 Option 2: GitHub Actions (CI/CD)

GitHub Actions can build your app automatically on every push.

### How it works:

1. **Push to GitHub** - The workflow runs automatically
2. **Check Actions tab** - See build progress
3. **Download artifacts** - Get built binaries from the Actions run

### Manual trigger:

- Go to **Actions** tab in GitHub
- Select **"Build and Test"** workflow
- Click **"Run workflow"**

## 🐳 Option 3: Docker Windows Container

Build in an isolated Windows container without installing Node.js locally.

### Prerequisites:
- Docker Desktop for Windows with **Windows containers enabled**
- Right-click Docker icon → "Switch to Windows containers"

### Quick Build:

```powershell
# Build the image (Windows container, ltsc2019 base)
docker build -f Dockerfile.windows -t rethinkbi:windows .

# Run the build inside the container
docker run --rm `
  -v ${PWD}:C:\app `
  -v ${PWD}\dist:C:\app\dist `
  -v ${PWD}\out:C:\app\out `
  rethinkbi:windows `
  powershell -Command "npm run build; npm run dist"
```

### Using Docker Compose:

```powershell
docker-compose -f docker-compose.windows.yml up --build
```

**See [docs/docker-build.md](docs/docker-build.md) for detailed instructions.**

## 📦 Build Outputs

After building, you'll find:

- **`dist/`** - Compiled JavaScript files
- **`out/`** - Packaged Electron app (after `npm run dist`)
  - Windows: `.exe` installer
  - macOS: `.dmg` or `.app`
  - Linux: `.AppImage`

## ✅ Recommended: GitHub Codespaces

For the best experience without local Node.js installation, use **GitHub Codespaces**. It's free for personal accounts (with monthly hours limit) and provides:

- ✅ No local Node.js installation needed
- ✅ Consistent environment
- ✅ Access from any device
- ✅ Pre-configured VS Code
- ✅ Automatic port forwarding

