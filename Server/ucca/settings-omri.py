import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        #'NAME': 'ucca_development',
        'NAME': 'ucca_staging_oct6',
        'USER': 'postgres',
        'PASSWORD': 'flamingo1980',
        'HOST': '127.0.0.1',
        'PORT': '5432',
        'OPTIONS': {
            'options': '-c search_path=ucca'
        },
    }
}


# Place for log files. This is a sensible default, you can hard code the actual directory if you want, as this is a
# settings file
# Also, make sure the directory actually exists with the proper permissions - pr_ucca should have write permissions.
LOG_DIR = r'C:\Users\user\Documents\GitHub\UCCA-App\Server\logs'
#os.path.join(BASE_DIR, 'logs')  # Make sure this is the right folder, hard-code the right log folder if not

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(asctime)s [%(levelname)s] {%(module)s} {%(funcName)s} %(message)s'
        },
        'simple': {
            'format': '%(asctime)s [%(levelname)s] %(message)s'
        },
    },
    'handlers': {
        'django_log': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'django.log'),
            'formatter': 'verbose',
        },
        'error_log': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'all-errors.log'),
            'formatter': 'verbose',
        },
        'api_log': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'api.log'),
            'formatter': 'verbose',
        },
        'db_log': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'db.log'),
            'formatter': 'verbose',
        }
    },
    'loggers': {
        'django': {
            'handlers': ['django_log'],
            'level': 'INFO',
            },
        'django.server': {
            'handlers': ['django_log'],
            'level': 'INFO',
            'propagate': False,
            },
        'ucca.api': {
            'handlers': ['api_log'],
            'level': 'DEBUG',
            'propagate': True,
            },
        'django.db.backends': {
            'handlers': ['db_log'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'root': {
            'level': 'ERROR',
            'handlers': ['error_log'],
            },
        }
    }


