UCCA SERVER - DJANGO
<!-- 
	Version:
	python		:
	django 		:
	postgres 	:
-->


pip install django
pip install djangorestframework
pip install django-rest-auth
pip install django-allauth
pip install django psycopg2
pip install django-filter
pip install djangorestframework-filters

python manage.py makemigrations
python manage.py migrate

// before running next lines –
//	1. Create postgres database for the applications e.e. 'ucca-a'
//	2. Create schema for the application, default is ucca_web_app - TODO **********************
//	3. edit your database credentials in “ucca/settings.py” line 113
// e.g. 

// DATABASES = {
//    'default': {
//         'ENGINE': 'django.db.backends.postgresql',
//         'NAME': 'ucca-a',
//         'USER': 'postgres',
//         'PASSWORD': 'Zigit1346',
//         'HOST': '127.0.0.1',
//         'PORT': '5432',
//    }
// }

python manage.py loaddata tabs
python manage.py loaddata roles
python manage.py loaddata roles_tabs
python manage.py loaddata permissions
python manage.py loaddata groups_permissions_admin


python manage.py loaddata superuser
// your loggin cred
// email: yarin@zigit.co.il
// pass: Zigit1346!
python manage.py loaddata guestuser

python manage.py loaddata categories
python manage.py loaddata layers
python manage.py loaddata layers_categories
python manage.py loaddata sources
python manage.py loaddata passages

// run the server
python manage.py runserver
