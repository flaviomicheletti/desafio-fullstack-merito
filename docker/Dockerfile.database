FROM postgres:15

COPY ./schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY ./schema-data.sql /docker-entrypoint-initdb.d/02-schema-data.sql

EXPOSE 5432