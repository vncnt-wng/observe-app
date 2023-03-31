from opentelemetry import trace
import os 
import inspect 

tracer = trace.get_tracer(__name__)

def trace_function(func):
    def wrapper(*args, **kw):
        with tracer.start_as_current_span(f"{func.__name__}") as span:
            span.set_attribute(f"file", os.path.abspath(inspect.getfile(func)))
            qualname = func.__qualname__
            span.set_attribute(f"qualName", qualname)

            # If function in a class, don't add 'self' arg to trace attributes
            arg_start = 0
            if len(qualname.split('.')) > 1:
                arg_start = 1
            for n in range(arg_start, len(args)):
                span.set_attribute(f"arg{n}", args[n])
            return func(*args, **kw)
    return wrapper