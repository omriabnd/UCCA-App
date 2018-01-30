DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'ucca',
        'USER': 'postgres',
        'PASSWORD': 'flamingo1980',
        'HOST': '127.0.0.1',
        'PORT': '5432',
        'OPTIONS': {
            'options': '-c search_path=ucca'
        },
    }
}
