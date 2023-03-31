#!/usr/bin/env bash

export LS_SERVICE_NAME=hello-server2
export LS_ACCESS_TOKEN=6FTjYBFuvKftJCAyzzOqgsK6o5wH5DOIa/7wa3lFhc5jdAjvwgh/inl33mJ8/barjhxwGdH1MkuAvJkBZfNtv2UHMIauCO0/HmQwCyA5
export FLASK_DEBUG=FALSE

export OTEL_EXPORTER_OTLP_TRACES_HEADERS="lightstep-access-token=6FTjYBFuvKftJCAyzzOqgsK6o5wH5DOIa/7wa3lFhc5jdAjvwgh/inl33mJ8/barjhxwGdH1MkuAvJkBZfNtv2UHMIauCO0/HmQwCyA5"

opentelemetry-instrument \
    --traces_exporter console,otlp_proto_grpc \
    --metrics_exporter console,otlp_proto_grpc \
    --service_name hello-server2 \
    --exporter_otlp_endpoint "http://0.0.0.0:4318" \
    --exporter_otlp_insecure true \
    flask run
