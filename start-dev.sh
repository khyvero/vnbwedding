#!/bin/bash

# Set the container name
CONTAINER_NAME="vnbwedding_db_dev"
export ADMIN_PASSWORD="123"
# Check if the container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=$CONTAINER_NAME)" ]; then
        # container is stopped, start it
        echo "Starting PostgreSQL container..."
        docker start $CONTAINER_NAME
    else
        # container does not exist, create it
        echo "PostgreSQL container not found, creating and starting it..."
        docker-compose -f docker-compose.db.yml up -d
    fi
    # Wait a few seconds for the database to be ready
    echo "Waiting for database to start..."
    sleep 5
else
    echo "PostgreSQL container is already running."
fi

# Apply migrations
echo "Applying database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the development server..."
npm run dev
