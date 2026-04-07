import joblib

model = joblib.load('dataFutbol/modelo_albank_ia.pkl')
cols = joblib.load('dataFutbol/columnas_modelo.pkl')
mapper = joblib.load('dataFutbol/fifa_mapper.pkl')

with open('model_meta.txt', 'w', encoding='utf-8') as f:
    f.write(f"Classes: {model.classes_}\n")
    f.write(f"Num columns: {len(cols)}\n")
    f.write(f"Some mapper: {list(mapper.items())[:5]}\n")
