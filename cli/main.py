"""Main CLI entry point for Analytics Platform."""

import click
import sys
import os
from pathlib import Path
from .config import Config
from .docker_manager import DockerManager


@click.group()
@click.version_option(version='1.0.0')
@click.pass_context
def cli(ctx):
    """Analytics Platform CLI - Manage your analytics infrastructure.
    
    This CLI tool helps you manage the Analytics Platform, supporting both
    local Docker deployments and connections to hosted instances.
    """
    ctx.ensure_object(dict)
    ctx.obj['config'] = Config()


@cli.command()
@click.option('--wait/--no-wait', default=True, help='Wait for services to be ready')
@click.option('--services', '-s', multiple=True, help='Specific services to start')
@click.pass_context
def up(ctx, wait, services):
    """Start the Analytics Platform locally.
    
    Brings up all containers for the analytics platform using docker-compose.
    This is the default way to run the platform on your local machine.
    
    Examples:
        analytics-platform up
        analytics-platform up --no-wait
        analytics-platform up -s kafka -s postgres
    """
    config = ctx.obj['config']
    
    if config.get_environment() != 'local':
        click.echo(f"Current environment is set to '{config.get_environment()}'")
        click.echo("Switching to 'local' environment for this command...")
    
    # Find docker-compose.yml
    compose_path = config.get_docker_compose_path()
    if not compose_path:
        click.echo("Error: docker-compose.yml not found!", err=True)
        click.echo("Please run this command from the analytics.platform directory", err=True)
        sys.exit(1)
    
    click.echo(f"Using docker-compose file: {compose_path}")
    
    try:
        docker = DockerManager(compose_path)
        click.echo("Starting Analytics Platform services...")
        
        service_list = list(services) if services else None
        if docker.up(detached=True, services=service_list):
            click.echo("✓ Services started successfully!")
            
            if wait:
                if docker.wait_for_services():
                    click.echo("\n" + "="*60)
                    click.echo("Analytics Platform is ready! 🚀")
                    click.echo("="*60)
                    click.echo("\nAccess your services at:")
                    click.echo("  • Demo Website:    http://localhost:8080")
                    click.echo("  • Grafana:         http://localhost:3000 (admin/admin)")
                    click.echo("  • Analytics API:   http://localhost:3001")
                    click.echo("  • MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)")
                    click.echo("\nRun 'analytics-platform status' to check service health")
                    click.echo("Run 'analytics-platform logs' to view logs")
                else:
                    click.echo("\n⚠ Services started but may not be fully ready yet")
                    click.echo("Run 'analytics-platform status' to check service health")
        else:
            click.echo("✗ Failed to start services", err=True)
            sys.exit(1)
    except FileNotFoundError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"Unexpected error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--volumes', '-v', is_flag=True, help='Also remove volumes (deletes all data)')
@click.pass_context
def down(ctx, volumes):
    """Stop the Analytics Platform.
    
    Stops and removes all containers. Use --volumes to also delete data.
    
    Examples:
        analytics-platform down
        analytics-platform down --volumes  # Clean slate
    """
    config = ctx.obj['config']
    compose_path = config.get_docker_compose_path()
    
    if not compose_path:
        click.echo("Error: docker-compose.yml not found!", err=True)
        sys.exit(1)
    
    try:
        docker = DockerManager(compose_path)
        
        if volumes:
            if click.confirm('⚠ This will delete all data. Are you sure?'):
                click.echo("Stopping services and removing volumes...")
                docker.down(volumes=True)
                click.echo("✓ Services stopped and data removed")
            else:
                click.echo("Cancelled")
        else:
            click.echo("Stopping services...")
            docker.down(volumes=False)
            click.echo("✓ Services stopped")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--services', '-s', multiple=True, help='Specific services to restart')
@click.pass_context
def restart(ctx, services):
    """Restart services.
    
    Restarts all services or specific services if specified.
    
    Examples:
        analytics-platform restart
        analytics-platform restart -s analytics-api -s bento
    """
    config = ctx.obj['config']
    compose_path = config.get_docker_compose_path()
    
    if not compose_path:
        click.echo("Error: docker-compose.yml not found!", err=True)
        sys.exit(1)
    
    try:
        docker = DockerManager(compose_path)
        service_list = list(services) if services else None
        
        if service_list:
            click.echo(f"Restarting services: {', '.join(service_list)}...")
        else:
            click.echo("Restarting all services...")
        
        docker.restart(services=service_list)
        click.echo("✓ Services restarted")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.pass_context
def status(ctx):
    """Check status and health of services.
    
    Shows which containers are running and checks the health of key services.
    """
    config = ctx.obj['config']
    
    if config.get_environment() == 'hosted':
        click.echo("Current environment: hosted")
        click.echo(f"API URL: {config.get('hosted.api_url', 'not configured')}")
        # Could add health check for hosted environment here
        return
    
    compose_path = config.get_docker_compose_path()
    if not compose_path:
        click.echo("Error: docker-compose.yml not found!", err=True)
        sys.exit(1)
    
    try:
        docker = DockerManager(compose_path)
        
        # Show container status
        click.echo("Container Status:")
        click.echo("-" * 60)
        result = docker.status()
        click.echo(result.stdout)
        
        # Check health endpoints
        click.echo("\nService Health:")
        click.echo("-" * 60)
        health = docker.check_health()
        
        for service, status in health.items():
            icon = "✓" if status == "healthy" else "✗"
            color = "green" if status == "healthy" else "red"
            click.echo(f"{icon} {service}: ", nl=False)
            click.secho(status, fg=color)
        
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--follow', '-f', is_flag=True, help='Follow log output')
@click.option('--tail', '-t', default=100, help='Number of lines to show from end')
@click.argument('services', nargs=-1)
@click.pass_context
def logs(ctx, follow, tail, services):
    """View logs from services.
    
    Shows logs from all services or specific services if specified.
    
    Examples:
        analytics-platform logs
        analytics-platform logs -f  # Follow logs
        analytics-platform logs analytics-api kafka
        analytics-platform logs -f -t 50 bento
    """
    config = ctx.obj['config']
    compose_path = config.get_docker_compose_path()
    
    if not compose_path:
        click.echo("Error: docker-compose.yml not found!", err=True)
        sys.exit(1)
    
    try:
        docker = DockerManager(compose_path)
        service_list = list(services) if services else None
        docker.logs(services=service_list, follow=follow, tail=tail)
    except KeyboardInterrupt:
        click.echo("\nStopped following logs")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.group()
def config():
    """Manage CLI configuration.
    
    Configure environment (local/hosted), API endpoints, and other settings.
    """
    pass


@config.command('show')
@click.pass_context
def config_show(ctx):
    """Show current configuration."""
    config = ctx.obj['config']
    click.echo("Current Configuration:")
    click.echo("-" * 60)
    click.echo(f"Environment: {config.get_environment()}")
    click.echo(f"Config file: {config.config_path}")
    click.echo("\nLocal settings:")
    click.echo(f"  Docker Compose: {config.get('local.docker_compose_file')}")
    click.echo("\nHosted settings:")
    click.echo(f"  API URL: {config.get('hosted.api_url', 'not set')}")
    click.echo(f"  Grafana URL: {config.get('hosted.grafana_url', 'not set')}")


@config.command('set-environment')
@click.argument('environment', type=click.Choice(['local', 'hosted']))
@click.pass_context
def config_set_env(ctx, environment):
    """Set the active environment (local or hosted).
    
    Examples:
        analytics-platform config set-environment local
        analytics-platform config set-environment hosted
    """
    config = ctx.obj['config']
    config.set_environment(environment)
    click.echo(f"✓ Environment set to: {environment}")


@config.command('set-hosted')
@click.option('--api-url', help='API URL for hosted platform')
@click.option('--grafana-url', help='Grafana URL for hosted platform')
@click.option('--api-key', help='API key for authentication')
@click.pass_context
def config_set_hosted(ctx, api_url, grafana_url, api_key):
    """Configure hosted platform connection.
    
    Examples:
        analytics-platform config set-hosted --api-url https://api.example.com
        analytics-platform config set-hosted --api-url https://api.example.com --api-key abc123
    """
    config = ctx.obj['config']
    
    if api_url:
        config.set('hosted.api_url', api_url)
        click.echo(f"✓ API URL set to: {api_url}")
    
    if grafana_url:
        config.set('hosted.grafana_url', grafana_url)
        click.echo(f"✓ Grafana URL set to: {grafana_url}")
    
    if api_key:
        config.set('hosted.api_key', api_key)
        click.echo("✓ API key configured")
    
    if not any([api_url, grafana_url, api_key]):
        click.echo("No options provided. Use --help to see available options.")


if __name__ == '__main__':
    cli()
