#!/bin/sh

# Wait for Postgres to start
until PGPASSWORD="postgres" psql -h ucca-db -U postgres --db ucca -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 10
done

echo Postgres is ready.

# Get the backend ready
cd /src
python manage.py migrate --noinput
gunicorn --workers 3 --bind 0.0.0.0:8000 ucca.wsgi:application
