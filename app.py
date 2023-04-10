
from flask import Flask, request
from time import sleep
from opentelemetry.trace.status import StatusCode
from other_file import some_function
from trace_utils import trace_function, trace
# from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
# # from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
# from opentelemetry.sdk.resources import SERVICE_NAME, Resource
# from opentelemetry.sdk.trace import TracerProvider
# from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter


# # resource = Resource(attributes={
# #     SERVICE_NAME: "service_name"
# # })


# # provider = TracerProvider(resource=resource)
# # # processor = BatchSpanProcessor(OTLPSpanExporter(
# # #     endpoint="http://127.0.0.1:8000/traces"))
# # processor = BatchSpanProcessor(ConsoleSpanExporter())
# # provider.add_span_processor(processor)
# # trace.set_tracer_provider(provider)

PORT = 8000

app = Flask(__name__)


@app.route("/err_uncaught")
def err_uncaught():
    x = 1 / 0
    return


@app.route("/err")
def err():
    try:
        1 / 0
    except ZeroDivisionError as error:
        span = trace.get_current_span()
        # record an exception
        span.record_exception(error)
        # fail the operation
        span.set_status(StatusCode.ERROR)


@app.route("/param", methods=['GET', 'POST'])
def param():
    arg1 = request.args.get('arg1', default=1, type=int)
    arg2 = request.args.get('arg2', default=1, type=int)
    print(request.data)
    for i in range(arg1):
        func2(arg1)
    return "okay"


@app.route("/hello")
def hello():
    span = trace.get_current_span()
    sleep(30 / 1000)

    span.set_attribute("set_attribute", "value")

    span.add_event("event message",
                   {"event_attributes": 1})

    # with tracer.start_as_current_span("in1") as span2:
    #     sleep(30 / 100)
    #     span.set_attribute("attribute", "value")
    #     with tracer.start_as_current_span("in2") as span3:
    #         sleep(30 / 100)
    #         span.set_attribute("set_attribute", "value")

    with tracer.start_as_current_span("caller") as caller:
        caller.set_attribute("set_attribute", "value")
        called(1, 2)

    return "Hello World\n"


class Test():
    @trace_function
    def func(self):
        return "aaa"


@app.route("/class_qualname")
@trace_function
def class_qualname():
    instance = Test()
    return instance.func()


@trace_function
def called(arg1, arg2):
    sleep(30 / 1000)
    span = trace.get_current_span()
    span.set_attribute("set_attribute", "value")
    # print(span2.spanId)
    return

@trace_function
@app.route("/trace_endpoint")
def endpoint():
    sleep(30/1000)
    return func1(1, 2)


@trace_function
def func1(arg1, arg2):
    sleep(30/1000)
    return func2(3)



@trace_function
def func2(arg1):
    sleep(30/1000)
    return "return"

@trace_function
@app.route("/accross_file")
def across_file():
    some_function()
    return "ok"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
