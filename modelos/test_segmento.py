import urllib.request
import json
import traceback

try:
    data = json.dumps({
      "saldo_por_vencer": 1500.50,
      "saldo_vencido": 0.0,
      "saldo_no_devenga": 0.0,
      "cartera_total": 1500.50,
      "cartera_en_riesgo": 0.0,
      "saldo_mora": 0.0,
      "dias_mora": 0
    }).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8001/predict_segmento", method="POST", data=data)
    req.add_header('Content-Type', 'application/json')
    
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    traceback.print_exc()
