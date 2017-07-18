#UCCA installation Guide (ucca v1.0)
updated 18.7.2017

##Introduction
The UCCA web application is based on Django framework on the server side and AngularJS on the Client Side.
The server side provides a fully independent API.

All the Servers’ files are in the /Server directory.
All the Clients’ files are in the /Client directory.

In order to install the fully functional system, there is a need to clone the git, install the Django and then update the settings files according to the system’s settings.

##Libraries and Versions
Python - 3.4.2
Django - 1.10.1
PostgreSql -  >= 9.3
AngularJS - 1.4.12
JQuery - 2.1.4
Bootstrap - 3.3.7
Node -   >= 6.2.2 
npm -  >= v 3.9.5


##Clone GIT repository
from github server:
https://github.com/omriabnd/UCCA-App


##Create Postgres Database + Schema
in our example we used
database: ucca_development
schema: ucca

##Configure Django Application
there is a demo file of the settings - settings.demo.py
copy it to settings.py and edit it

edit the file /Server/ucca/settings.py

###Example parameters
update the parameters with as in the following example
In this example we used the following parameters:
host: http://ucca.app
database name: ucca_development
schema name: ucca
psql user: pr_ucca

You may need to comment user, password and host according to how your postgres is configured


~~~~
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'options': '-c search_path=ucca'
        },
        'NAME': 'ucca_development',
        'USER': 'pr_ucca',
        'PASSWORD': '', 
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}


ALLOWED_HOSTS = [
    'ucca.app','www.ucca.app',
    'localhost',
    '127.0.0.1',
]

EMAIL_HOST = "mailhost.cs.huji.ac.il"
EMAIL_PORT = 25
REGISTRATION_LINK = "http://ucca.app/api/v1/register"
~~~~



##Install django dependencies
If you are running the application via virtualenv make sure to run installation while you are in virtualenv

execute:
```
pip install django
pip install djangorestframework
pip install django-rest-auth
pip install django-allauth
pip install django psycopg2
pip install django-filter
pip install djangorestframework-filters
```

Run migration to create database
make sure you are in the path /Server

execute:
```
python manage.py makemigrations
python manage.py migrate
```

##Load initial Data to database
execute:
```
python manage.py loaddata tabs
python manage.py loaddata roles
python manage.py loaddata roles_tabs
python manage.py loaddata permissions
python manage.py loaddata groups_permissions_admin
python manage.py loaddata categories
python manage.py loaddata sources
python manage.py loaddata passages
```

##Load Initial superuser to database
You can edit the user parameters before loading in the file (do not change the initial password!!):
/Server/uccaApp/fixures/superuser.json
Make sure to change the password after the installation via the admin GUI

The initial user is: admin.ucca2@cs.huji.ac.il
password: adminucca 

execute:
```
python manage.py loaddata superuser
```
