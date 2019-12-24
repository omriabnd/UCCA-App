# This is a docker file for deploying the UCCA server.
# At some point we should upload this to the Docker hub from github directly.
FROM python:3.5-alpine as builder

RUN apk --no-cache add postgresql-libs && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev postgresql-client

# Copy the files we need - requirements.txt and the entire Backend folder
COPY . /src

RUN pip install -r src/requirements.txt 
COPY docker-helpers/settings_ucca_docker.py /src/ucca/local_settings.py

RUN pip install gunicorn

RUN mkdir /logs

# Clean up before creating the final stage
# RUN apk del --purge git openssh-client build-deps

# The gunicorn environment variables
ENV DJANGO_SETTINGS_MODULE ucca.settings
ENV PYTHONPATH $PYTHONPATH:/src
CMD ["/bin/sh", "/src/docker-helpers/start-backend.sh"]