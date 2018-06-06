import os

ALLOWED_HOSTS = [
       'ucca.staging',
       'ucca.staging.cs.huji.ac.il',
       'ucca.cs.huji.ac.il',
       'caledonian',
       'e-webprojects.cs.huji.ac.il',
       'e-webprojects'
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'options': '-c search_path=ucca'
        },
        'NAME': 'ucca_staging',
        #'USER': 'pr_ucca',
        #'PASSWORD': '',
        'HOST': 'pgserver',
        'PORT': '5432',
    }
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Place for log files. This is a sensible default, you can hard code the actual directory if you want, as this is a
# settings file
# Also, make sure the directory actually exists with the proper permissions - pr_ucca should have write permissions.
LOG_DIR = '/cs/labs/oabend/webserver/ucca-zigit/staging/Server/logs'
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
    },
    'loggers': {
        'ucca.api': {
            'handlers': ['api_log'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'root': {
            'level': 'ERROR',
            'handlers': ['error_log'],
        },
    }
}


