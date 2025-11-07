# GitHub Codespaces Setup

This project is configured to run in GitHub Codespaces, which provides a cloud-based development environment with Node.js pre-installed.

## How to Use

1. **Open in Codespaces:**
   - Go to your GitHub repository
   - Click the green "Code" button
   - Select "Codespaces" tab
   - Click "Create codespace on main"

2. **Wait for setup:**
   - Codespaces will automatically:
     - Install Node.js 20
     - Run `npm install`
     - Set up the development environment

3. **Run the application:**
   ```bash
   npm run dev
   ```
   - The Electron app will open in the Codespaces browser preview
   - Port 5173 will be forwarded automatically

4. **Build the application:**
   ```bash
   npm run build
   npm run dist
   ```

## Benefits

- ✅ No need to install Node.js locally
- ✅ Consistent environment across machines
- ✅ Pre-configured with all dependencies
- ✅ Can access from any device with a browser

## Port Forwarding

The dev server runs on port 5173, which is automatically forwarded in Codespaces. You can access it via the "Ports" tab in VS Code.

