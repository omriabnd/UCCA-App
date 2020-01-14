DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ucca', #new
        'OPTIONS': {
            'options': '-c search_path=django,ucca'
        },
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': '127.0.0.1',
        'PORT': '15433',
    }
}

AUTH_PASSWORD_VALIDATORS = [
]
