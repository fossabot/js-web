#!/bin/bash
echo "Setting up Postgres DB";

cp docker/.env.example docker/.env
docker-compose -f docker/docker-compose.yml up -d

# Copy env files in all packages (if exist)
for package in packages/*/; do
    if test -f "${package}/.env.example"; then 
        cp "${package}/.env.example" "${package}/.env"
        echo "env file copied in $package"
    fi
done

echo "Setup done";