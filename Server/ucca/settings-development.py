# Place settings relevant to the development environment
ALLOWED_HOSTS = [
       'ucca.development',
       'ucca.development.cs.huji.ac.il',
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
        #'NAME': 'ucca_development',
        'NAME': 'ucca_production',        
        #'USER': 'pr_ucca',
        #'PASSWORD': '',
        'HOST': 'pgserver',
        'PORT': '5432',
    }
}

