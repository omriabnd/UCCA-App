#!/bin/bash
pg_restore --username=postgres --dbname=ucca --schema=ucca -Fc /restore.backup || true
