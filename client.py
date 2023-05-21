import requests
from time import sleep

for i in range(1000):
    r = requests.get("http://127.0.0.1:5000/trace_endpoint")
    print(i)
    sleep(1200)
    
