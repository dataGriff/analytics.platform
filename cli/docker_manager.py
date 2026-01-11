"""Docker Compose management for Analytics Platform CLI."""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path


class DockerManager:
    """Manages Docker Compose operations for the Analytics Platform."""
    
    def __init__(self, compose_file_path):
        """Initialize Docker manager.
        
        Args:
            compose_file_path: Path to docker-compose.yml file
        """
        self.compose_file = Path(compose_file_path)
        if not self.compose_file.exists():
            raise FileNotFoundError(f"Docker compose file not found: {compose_file_path}")
        self.compose_dir = self.compose_file.parent
    
    def _run_compose_command(self, args, capture_output=False):
        """Run docker compose command.
        
        Args:
            args: List of arguments to pass to docker compose
            capture_output: Whether to capture and return output
            
        Returns:
            subprocess.CompletedProcess if capture_output is True, otherwise None
        """
        cmd = ['docker', 'compose', '-f', str(self.compose_file)] + args
        
        if capture_output:
            result = subprocess.run(
                cmd,
                cwd=self.compose_dir,
                capture_output=True,
                text=True
            )
            return result
        else:
            subprocess.run(cmd, cwd=self.compose_dir)
    
    def up(self, detached=True, services=None):
        """Start services.
        
        Args:
            detached: Run in detached mode
            services: List of specific services to start, or None for all
            
        Returns:
            True if successful, False otherwise
        """
        args = ['up']
        if detached:
            args.append('-d')
        if services:
            args.extend(services)
        
        try:
            self._run_compose_command(args)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error starting services: {e}", file=sys.stderr)
            return False
    
    def down(self, volumes=False):
        """Stop and remove services.
        
        Args:
            volumes: Also remove volumes
            
        Returns:
            True if successful, False otherwise
        """
        args = ['down']
        if volumes:
            args.append('-v')
        
        try:
            self._run_compose_command(args)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error stopping services: {e}", file=sys.stderr)
            return False
    
    def restart(self, services=None):
        """Restart services.
        
        Args:
            services: List of specific services to restart, or None for all
            
        Returns:
            True if successful, False otherwise
        """
        args = ['restart']
        if services:
            args.extend(services)
        
        try:
            self._run_compose_command(args)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error restarting services: {e}", file=sys.stderr)
            return False
    
    def status(self):
        """Get status of all services.
        
        Returns:
            subprocess.CompletedProcess with status information
        """
        return self._run_compose_command(['ps'], capture_output=True)
    
    def logs(self, services=None, follow=False, tail=None):
        """Show logs for services.
        
        Args:
            services: List of specific services, or None for all
            follow: Follow log output
            tail: Number of lines to show from end
        """
        args = ['logs']
        if follow:
            args.append('-f')
        if tail:
            args.extend(['--tail', str(tail)])
        if services:
            args.extend(services)
        
        try:
            self._run_compose_command(args)
        except KeyboardInterrupt:
            # User pressed Ctrl+C to stop following logs
            pass
    
    def check_health(self):
        """Check health of key services.
        
        Returns:
            dict: Health status of services
        """
        health = {}
        
        # Check if containers are running
        result = self.status()
        if result.returncode != 0:
            return {'error': 'Could not get container status'}
        
        # Check Analytics API health endpoint
        try:
            response = requests.get('http://localhost:3001/health', timeout=5)
            health['analytics-api'] = 'healthy' if response.status_code == 200 else 'unhealthy'
        except requests.exceptions.RequestException:
            health['analytics-api'] = 'not responding'
        
        # Check Grafana
        try:
            response = requests.get('http://localhost:3000/api/health', timeout=5)
            health['grafana'] = 'healthy' if response.status_code == 200 else 'unhealthy'
        except requests.exceptions.RequestException:
            health['grafana'] = 'not responding'
        
        # Check MinIO
        try:
            response = requests.get('http://localhost:9000/minio/health/live', timeout=5)
            health['minio'] = 'healthy' if response.status_code == 200 else 'unhealthy'
        except requests.exceptions.RequestException:
            health['minio'] = 'not responding'
        
        return health
    
    def wait_for_services(self, timeout=120):
        """Wait for services to be ready.
        
        Args:
            timeout: Maximum time to wait in seconds
            
        Returns:
            bool: True if services are ready, False if timeout
        """
        start_time = time.time()
        print("Waiting for services to be ready...")
        
        while time.time() - start_time < timeout:
            try:
                # Check Analytics API
                response = requests.get('http://localhost:3001/health', timeout=2)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'ok' and data.get('kafkaReady'):
                        print("✓ Services are ready!")
                        return True
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(3)
            print(".", end="", flush=True)
        
        print("\n✗ Timeout waiting for services")
        return False
