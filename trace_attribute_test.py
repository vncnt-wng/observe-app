from app import Example
import inspect 
import os
import json

# dumps a class object to json (shallow)
def dump(obj):
    data = {}
    data["name"] = type(obj).__name__
    values = obj.__dict__
    for key in values.keys():
        typeObj = type(values[key])
        # if attribute is an object, just record the class name 
        if '__dict__' in typeObj.__dict__:
            values[key] = {"class": typeObj.__name__}
    data['values'] = values
    return json.dumps(data)

def trace_test(func):
    print("here")
    def wrapper(*args, **kwargs):
        print("in wrapper")
        absolute_path = os.path.abspath(inspect.getfile(func))
        # span.set_attribute(f"file", absolute_path.replace(git_root, ''))
        qualname = func.__qualname__
        # span.set_attribute(f"qualName", qualname)

        # If function in a class, don't add 'self' arg to trace attributes
        arg_start = 0
        if len(qualname.split('.')) > 1:
            arg_start = 1
            
        args_data = {}
        
        print(args)
        print(kwargs)
        func_args = list(inspect.signature(func).parameters.keys())
        print(func_args)
        
        for n in range(arg_start, len(args)):
            print()
            print(args[n])
            print(type(args[n]))
            print(type(args[n]).__dict__)
            print('__dict__' in type(args[n]).__dict__)
            if '__dict__' in type(args[n]).__dict__:
                args_data[func_args[n]] = dump(args[n])
            elif type(args[n]).__name__ == 'dict':
                args_data[func_args[n]] = json.dumps(args[n])
            else:
                args_data[func_args[n]] = args[n]
        # if branch: 
        #     span.set_attribute("commit_id", commit_id)
        #     span.set_attribute("branch", branch)
        #     span.set_attribute("message", message)
        print(args_data)
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper


@trace_test
def parameter_called(s, l, d, o):
    print("here")
    return 

print("hello")

parameter_called("hello", [1,2,3], {"a": 1, "b": 2}, Example())