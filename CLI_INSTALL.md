# Analytics Platform CLI - Installation Guide

This guide will help you install the Analytics Platform CLI on your machine.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Docker and Docker Compose (for running the platform locally)
- Git (for cloning the repository)

## Installation Methods

### Method 1: Install Directly from GitHub (Recommended)

Install the latest version directly from the GitHub repository:

```bash
pip install git+https://github.com/dataGriff/analytics.platform.git
```

After installation, you may need to add pip's bin directory to your PATH:

```bash
# For Linux/Mac - add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"

# Apply immediately
source ~/.bashrc  # or source ~/.zshrc
```

Verify installation:
```bash
analytics-platform --version
analytics-platform --help
```

### Method 2: Install from Source (For Development)

If you want to contribute or modify the CLI:

1. **Clone the repository**
   ```bash
   git clone https://github.com/dataGriff/analytics.platform.git
   cd analytics.platform
   ```

2. **Install the CLI in development mode**
   ```bash
   pip install -e .
   ```

   This installs the CLI in "editable" mode, which means changes to the source code will be reflected immediately without reinstalling.

3. **Add to PATH if needed**
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

4. **Verify installation**
   ```bash
   analytics-platform --version
   analytics-platform --help
   ```

### Method 3: Install from PyPI (When Available)

Once published to PyPI:

```bash
pip install analytics-platform-cli
```

## Quick Start

Once installed, you can use the CLI to manage your Analytics Platform:

### 1. Start the Platform

```bash
analytics-platform up
```

This command:
- Starts all Docker containers
- Waits for services to be ready
- Displays connection URLs when ready

### 2. Check Status

```bash
analytics-platform status
```

View the health of all services and see which containers are running.

### 3. View Logs

```bash
# View logs from all services
analytics-platform logs

# Follow logs in real-time
analytics-platform logs -f

# View logs from specific services
analytics-platform logs analytics-api kafka
```

### 4. Stop the Platform

```bash
# Stop services (keeps data)
analytics-platform down

# Stop services and remove all data
analytics-platform down --volumes
```

## Configuration

The CLI stores its configuration in `~/.analytics-platform/config.yaml`.

### View Current Configuration

```bash
analytics-platform config show
```

### Configure for Local Development (Default)

```bash
analytics-platform config set-environment local
```

### Configure for Hosted Platform

```bash
analytics-platform config set-environment hosted
analytics-platform config set-hosted \
  --api-url https://api.example.com \
  --grafana-url https://grafana.example.com \
  --api-key your-api-key
```

## Common Commands

| Command | Description |
|---------|-------------|
| `analytics-platform up` | Start all services |
| `analytics-platform up --no-wait` | Start without waiting for readiness |
| `analytics-platform up -s kafka -s postgres` | Start specific services |
| `analytics-platform down` | Stop all services |
| `analytics-platform down -v` | Stop and remove all data |
| `analytics-platform restart` | Restart all services |
| `analytics-platform restart -s analytics-api` | Restart specific service |
| `analytics-platform status` | Check service health |
| `analytics-platform logs` | View logs |
| `analytics-platform logs -f` | Follow logs |
| `analytics-platform logs -t 50 bento` | Last 50 lines from bento |
| `analytics-platform config show` | Show configuration |
| `analytics-platform --help` | Show help |

## Troubleshooting

### Command Not Found

If you get a "command not found" error after installation:

1. **Check if the CLI is installed:**
   ```bash
   pip list | grep analytics-platform
   ```

2. **Ensure pip's bin directory is in your PATH:**
   ```bash
   # For Linux/Mac
   export PATH="$HOME/.local/bin:$PATH"
   
   # Add to your shell profile (~/.bashrc, ~/.zshrc) to make it permanent
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
   ```

3. **Try using the full path:**
   ```bash
   python -m cli.main --help
   ```

### Docker Not Running

If you get Docker-related errors:

1. **Check if Docker is running:**
   ```bash
   docker ps
   ```

2. **Start Docker:**
   - On macOS: Start Docker Desktop
   - On Linux: `sudo systemctl start docker`
   - On Windows: Start Docker Desktop

### Services Not Starting

If services fail to start:

1. **Check Docker resources:**
   - Ensure you have at least 6GB RAM allocated to Docker
   - Docker Desktop → Settings → Resources → Memory

2. **Check port conflicts:**
   ```bash
   # Check if required ports are in use
   netstat -tuln | grep -E '3000|3001|5432|8080|9092'
   ```

3. **View detailed logs:**
   ```bash
   analytics-platform logs -f
   ```

## Uninstalling

To uninstall the CLI:

```bash
pip uninstall analytics-platform-cli
```

To also remove configuration:

```bash
rm -rf ~/.analytics-platform
```

## Next Steps

- Read the [README.md](README.md) for platform documentation
- Check the [QUICKSTART.md](QUICKSTART.md) for a quick tutorial
- Explore [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

## Support

For issues and questions:
- Open an issue in the repository
- Check the troubleshooting section above
- Review the main documentation
