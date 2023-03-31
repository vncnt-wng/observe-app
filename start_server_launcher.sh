#!/usr/bin/env bash

export LS_SERVICE_NAME=hello-server2
export LS_ACCESS_TOKEN=6FTjYBFuvKftJCAyzzOqgsK6o5wH5DOIa/7wa3lFhc5jdAjvwgh/inl33mJ8/barjhxwGdH1MkuAvJkBZfNtv2UHMIauCO0/HmQwCyA5
export FLASK_DEBUG=FALSE


opentelemetry-instrument \
    --service_name hello-server2 \
    python app.py