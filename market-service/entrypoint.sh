#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until pg_isready -h ${DB_HOST:-market-db} -p ${DB_PORT:-5432} -U ${DB_USER:-market_user} -d ${DB_NAME:-market_db} -t 1
do
  sleep 1
done

echo "Database is ready!"

# Only run db push if no migrations exist
if [ ! -d "prisma/migrations" ]; then
  echo "Initializing database schema..."
  npx prisma db push --accept-data-loss
else
  echo "Running migrations..."
  npx prisma migrate deploy
fi

echo "Running seeds..."
npm run seed:all

echo "Starting application..."
exec "$@"