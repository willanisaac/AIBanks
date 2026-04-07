import urllib.request
import json
import traceback

try:
    data = json.dumps({"home_team": "México", "away_team": "RSA"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8000/predict", method="POST", data=data)
    req.add_header('Content-Type', 'application/json')
    
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    traceback.print_exc()
