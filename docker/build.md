# The UCCA Docker Images

We have three images for the UCCA project - `ucca-db`, `ucca-backend` and `ucca-frontend`. All the images
are installed under the `uccaproject` Docker team on the Docker Hub.

## The ucca-db image
The `ucca-db` image contains a Postgres database complete with the basic UCCA data already installed.
It is not built automatically, as it never really changes. To build it, switch to ./docker/db and run

There is currently just one such image updated, called version 1.3 .

```
docker build -t uccaproject/ucca-db:<ver> .
docker tag uccaproject/ucca-db:<ver> uccaproject/ucca-db:latest
docker push uccaproject/ucca-db
```

## The ucca-backend image
The `ucca-backend` image contains our Backend. It should be updated automatically once we configure travis.ci.
For now, you update it like this:

```
cd ../Server
docker build -t uccaproject/ucca-backend:<ver> .
docker tag uccaproject/ucca-backend:<ver> uccaproject/ucca-backend:latest
docker push uccaproject/ucca-backend
```

## The ucca-frontend image
The `ucca-frontend` image contains our Backend. It should also be automatically updated once we configure travis.ci.
For now, you update it like this:

```
cd ../Client
docker build -t uccaproject/ucca-frontend:<ver> .
docker tag uccaproject/ucca-frontend:<ver> uccaproject/ucca-frontend:latest
docker push uccaproject/ucca-frontend
```
