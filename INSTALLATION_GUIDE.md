# UCCA installation Guide (UCCA v1.3)
Updated May 26th, 2019

## Introduction
This document explains how to install the UCCA system. There are several ways to install UCCA, depending on your needs.

## Docker Compose - Installation for Evaluation
If you just wnat to evaluate UCCA, the easiest way to install it is with Docker Compose. In the `./deployment` folder you will find a `docker-compose.yml` file. To use it simply run

    cd ./deployment
    docker-compose up

After settings everything up you will have a working UCCA system, listening on [`http://localhost:6080`](http://localhost:6080).

## Installation for Frontend Development
If you want to develop the UCCA Frontend, the easiest way to do it so that have the Backend and Database run in Docker. So, start Docker Compose as explained in the previous section. The backend will be listening on port 8085.

### Setting up Frontend development
Once you have the backend running, you can set up your development environment like so:

    cd ./Client
    yarn install


Run `gulp serve` to start the development server.

## Installation for Backend Development

To develop the UCCA Backend, it is recommended you use Docker to run the Postgres database, which already comes preloaded with the necessary tables and data. There is a different Docker Compose file for this:

    cd ./deployment
    docker-compose --file docker-compose-db.yml up

This will only run Postgres and make it available on port 15432.

### Setting up Backend development
To set up Backend development, once you have the database running, switch to the `./Server` directory. Create a Virtual Environment (with Python 3.5 or higher), activate it and install the requirements in `./Server/requirements.txt` .

The Backend is written in Django, so use the ordinary Django management commands to start the backend.

The Django settings are in `./Server/ucca` . You can create a `local_settings.py` file to override these settings. The file `./Server/docker-helpers/settings_ucca_docker.py` contains information on how to connect to the Docker based Postgres database.

## Installation without Docker

If you want to install everything yourself, you should start by installing Postgres and creating a database called `ucca`.

Set up your backend as explained in the previous section, then run the following management commands:

    python manage.py migrate
    python manage.py loaddata tabs
    python manage.py loaddata roles
    python manage.py loaddata roles_tabs
    python manage.py loaddata permissions
    python manage.py loaddata groups_permissions_admin
    python manage.py loaddata groups_permissions_guest
    python manage.py loaddata groups_permissions_project_manager
    python manage.py loaddata groups_permissions_annotator

For loading some pseudo data execute:
    
    python manage.py loaddata categories
    python manage.py loaddata layers
    python manage.py loaddata layers_categories
    python manage.py loaddata sources
    python manage.py loaddata passages


### Load Initial superuser to database
You can edit the user parameters before loading in the file (do not change the initial password!!):
/Server/uccaApp/fixures/superuser.json
Make sure to change the password after the installation via the admin GUI

The initial user is: admin.ucca2@cs.huji.ac.il
password: adminucca 

execute:

    python manage.py loaddata superuser

Then continue by setting up the frontend as explained above.
