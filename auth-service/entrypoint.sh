#!/bin/sh

set -e

echo "Waiting for database to be ready..."

# Try multiple connection methods
until (nc -z ${DB_HOST:-auth-db} ${DB_PORT:-5432} || 
       pg_isready -h ${DB_HOST:-auth-db} -p ${DB_PORT:-5432} -U ${DB_USER:-auth_user} -d ${DB_NAME:-auth_db} -t 1) 
do
  sleep 1
done

echo "Database is ready!"

# Run migrations and seeds
echo "Running database migrations..."
npx prisma migrate deploy

echo "Running seeds..."
npm run seed:all

echo "Starting application..."
exec "$@"