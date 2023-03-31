from trace_utils import trace_function

@trace_function
def some_function():
    for i in range(1000):
        pass