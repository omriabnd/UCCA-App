# Settings from running the Backend in a Docker container
import os

BASE_DIR = '/src/backend'
OUTER_BASE_DIR = '/src'
LOG_DIR = '/logs'

ALLOWED_HOSTS = ['*']  # Host name is configured outside

DATABASES = {
        'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ucca',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'ucca-db',
        'PORT': '5432',
    }
}


STATIC_ROOT = '/static'
MEDIA_ROOT = '/media'
STATICFILES_DIRS = ()
