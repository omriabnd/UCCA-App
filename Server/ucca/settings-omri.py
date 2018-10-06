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
