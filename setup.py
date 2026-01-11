#!/usr/bin/env python3
"""Setup configuration for Analytics Platform CLI."""

from setuptools import setup, find_packages
import os

# Read the README file for long description
def read_file(filename):
    filepath = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return ''

setup(
    name='analytics-platform-cli',
    version='1.0.0',
    description='CLI tool for managing the Analytics Platform',
    long_description=read_file('README.md'),
    long_description_content_type='text/markdown',
    author='Analytics Platform Contributors',
    python_requires='>=3.8',
    packages=find_packages(),
    install_requires=[
        'click>=8.0.0',
        'pyyaml>=6.0',
        'requests>=2.28.0',
    ],
    entry_points={
        'console_scripts': [
            'analytics-platform=cli.main:cli',
        ],
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
    ],
)
