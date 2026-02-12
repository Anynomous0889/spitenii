#!/bin/bash
# Helper script to run Prisma commands through Docker
# Usage: ./prisma-docker.sh migrate dev --name init
#        ./prisma-docker.sh generate
#        ./prisma-docker.sh studio

COMMAND=$1
shift
ARGS="$@"

echo "Running Prisma $COMMAND through Docker..."

if [ "$COMMAND" = "studio" ]; then
    # Prisma Studio needs port mapping
    docker-compose run --rm -p 5555:5555 backend sh -c "npx prisma studio --port 5555 --hostname 0.0.0.0"
else
    # Other Prisma commands
    docker-compose run --rm backend sh -c "npx prisma $COMMAND $ARGS"
fi
