"""Configuration management for the Analytics Platform CLI."""

import os
import yaml
from pathlib import Path

DEFAULT_CONFIG = {
    'environment': 'local',  # local or hosted
    'local': {
        'docker_compose_file': 'docker-compose.yml',
        'services': [
            'zookeeper',
            'kafka',
            'postgres',
            'minio',
            'minio-init',
            'bento',
            'delta-writer',
            'grafana',
            'analytics-api',
            'website',
        ]
    },
    'hosted': {
        'api_url': '',
        'grafana_url': '',
        'api_key': '',
    }
}

class Config:
    """Configuration manager for Analytics Platform CLI."""
    
    def __init__(self, config_path=None):
        """Initialize configuration.
        
        Args:
            config_path: Path to configuration file. If None, uses default location.
        """
        if config_path is None:
            config_path = self._get_default_config_path()
        self.config_path = Path(config_path)
        self.config = self._load_config()
    
    def _get_default_config_path(self):
        """Get the default configuration file path."""
        home = Path.home()
        config_dir = home / '.analytics-platform'
        config_dir.mkdir(exist_ok=True)
        return config_dir / 'config.yaml'
    
    def _load_config(self):
        """Load configuration from file or create default."""
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
                # Merge with defaults to ensure all keys exist
                return {**DEFAULT_CONFIG, **config}
        else:
            self._save_config(DEFAULT_CONFIG)
            return DEFAULT_CONFIG.copy()
    
    def _save_config(self, config):
        """Save configuration to file."""
        self.config_path.parent.mkdir(exist_ok=True, parents=True)
        with open(self.config_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    
    def get(self, key, default=None):
        """Get configuration value."""
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        return value
    
    def set(self, key, value):
        """Set configuration value."""
        keys = key.split('.')
        config = self.config
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value
        self._save_config(self.config)
    
    def get_environment(self):
        """Get the current environment (local or hosted)."""
        return self.config.get('environment', 'local')
    
    def set_environment(self, env):
        """Set the environment."""
        if env not in ['local', 'hosted']:
            raise ValueError("Environment must be 'local' or 'hosted'")
        self.set('environment', env)
    
    def get_docker_compose_path(self):
        """Get the path to docker-compose.yml file."""
        # Look for docker-compose.yml in current directory
        compose_file = Path(self.config['local']['docker_compose_file'])
        if compose_file.exists():
            return compose_file
        
        # Try to find it relative to this script
        script_dir = Path(__file__).parent.parent
        compose_file = script_dir / self.config['local']['docker_compose_file']
        if compose_file.exists():
            return compose_file
        
        return None
