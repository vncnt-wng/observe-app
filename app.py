from flask import Flask, request
from time import sleep

from opentelemetry.trace.status import StatusCode
from other_file import some_function

from trace_utils import trace_function, trace, get_trace_context_headers
import random
import requests

# from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

# from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter


resource = Resource(attributes={SERVICE_NAME: "service_name"})


provider = TracerProvider(resource=resource)

# processo = BatchSpanProcessor(
#     span_exporter=OTLPSpanExporter(endpoint="http://127.0.0.1:8000/v1/traces"),
#     # schedule_delay_millis=1000,
#     max_export_batch_size=512,
#     # max_queue_size=3000,
# )
processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

PORT = 5000

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


@app.route("/param", methods=["GET", "POST"])
def param():
    arg1 = request.args.get("arg1", default=1, type=int)
    arg2 = request.args.get("arg2", default=1, type=int)
    print(request.data)
    for i in range(arg1):
        func2(arg1)
    return "okay"


@app.route("/hello")
def hello():
    span = trace.get_current_span()
    sleep(30 / 1000)

    span.set_attribute("set_attribute", "value")

    span.add_event("event message", {"event_attributes": 1})

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


class Test:
    # @trace_function
    def func(self):
        return "aaa"


@app.route("/class_qualname")
# @trace_function
def class_qualname():
    instance = Test()
    return instance.func()


# @trace_function
def called(arg1, arg2):
    sleep(30 / 1000)
    span = trace.get_current_span()
    span.set_attribute("set_attribute", "value")
    # print(span2.spanId)
    return


@app.route("/trace_endpoint")
# @trace_function
def endpoint():
    sleep(30 / 1000)
    return func1(1, 2)


# @trace_function
def func1(arg1, arg2):
    sleep(30 / 1000)
    return func2(3)


# @trace_function
def func2(arg1):
    sleep(30 / 1000)
    return "return"


@app.route("/accross_file")
# @trace_function
def across_file():
    some_function()
    return "ok"


@app.route("/flame_test")
# @trace_function
def flame_test():
    sub1()
    sub2()
    return "ok"


# @trace_function
def sub1():
    subsub1()
    subsub2()


# @trace_function
def sub2():
    subsub3()


# @trace_function
def subsub1():
    sleep(8 / 1000)


# @trace_function
def subsub2():
    sleep(5 / 1000)


# @trace_function
def subsub3():
    sleep(10 / 1000)


@app.route("/multiple_execution_path")
# @trace_function
def multiple_execution_path():
    value = random.randint(0, 1)
    if value == 0:
        path1()
    else:
        path2()
    return str(value)


@app.route("/remote_request")
@trace_function
def remote_request():
    make_request("string value")
    return "ok", 200


@trace_function
def make_request(value):
    headers = get_trace_headers()
    r = requests.post(
        "http://remote_service_endpoint",
        headers=headers,
        json={"value": value},
    )
    return


# @trace_function
def path1():
    sleep(0.01)
    pass


# @trace_function
def path2():
    sleep(0.01)
    pass


class Example:
    def __init__(self):
        self.attr1 = 5
        self.attr2 = "string"
        self.attr3 = [1, 2, 3]
        self.attr4 = {"a": 1, "b": 2}
        self.attr5 = Example2()

    def func(self):
        pass


class Example2:
    def __init__(self):
        self.attr1 = "string"


@app.route("/parameter_test")
@trace_function
def parameter_test():
    return parameter_called(
        1, 0.1, "hello", [1, 2, 3], {1, 2}, {"a": 1, "b": 2}, Example2()
    )


@trace_function
def parameter_called(i, f, string, l, s, d, o):
    return string


# @app.route("/distributed")
# @trace_function
# def distributed():
#     return "ok"


@app.route("/caller")
@trace_function
def caller():
    headers = get_trace_context_headers({})
    r = requests.post("http://127.0.0.1:8000/v1/trace", headers=headers)
    return "ok"


@app.route("/callee")
@trace_function
def callee():
    return "ok"


# @app.route("/dist_trace")
# @trace_function
# def dist_trace():
#     headers = add_trace_headers({})
#     r = requests.get("http://127.0.0.1:3001/callee", headers=headers)
#     return "ok"


@app.route("/trace_test")
@trace_function
def trace_test():
    str = ""
    str += child1()
    str += child2()
    return str


@trace_function
def child1():
    return grandchild1()


@trace_function
def grandchild1():
    return "o"


@trace_function
def child2():
    return grandchild2()


@trace_function
def grandchild2():
    return "k"


if __name__ == "__main__":
    app.run(threaded=False, debug=False, host="0.0.0.0", port=PORT)
