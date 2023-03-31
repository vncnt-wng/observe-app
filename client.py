import requests

for i in range(1):
    r = requests.get("http://127.0.0.1:8000/param")
    print(r.text)
