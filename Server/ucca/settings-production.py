import os

# Place settings relevant to the prodcution environment
REGISTRATION_LINK = "http://ucca-demo.cs.huji.ac.il/#/reg"

ALLOWED_HOSTS = [
	'ucca-demo',
	'ucca-demo.cs.huji.ac.il',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'options': '-c search_path=ucca'
        },
        'NAME': 'ucca_production',
        #'USER': 'pr_ucca',
        #'PASSWORD': '',
        'HOST': 'pgserver',
        'PORT': '5432',
    }
}


# Place for log files. This is a sensible default, you can hard code the actual directory if you want, as this is a
# settings file
# Also, make sure the directory actually exists with the proper permissions - pr_ucca should have write permissions.
LOG_DIR = '/cs/labs/oabend/webserver/ucca-zigit/production/Server/logs'

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
	'django': {
		'handlers': ['error_log'],
		'level': 'INFO',
	},
	'django.server': {
		'handlers': ['error_log'],
		'level': 'INFO',
		'propagate': False,
	},
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

