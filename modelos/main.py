import os
import joblib
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Global variables for models
modelo_ia = None
columnas_modelo = None
fifa_mapper = None

# Variables para modelo financiero
SCALER = None
MODEL_KMEANS = None
MAPPING_SEGMENTOS = None
FEATURES = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global modelo_ia, columnas_modelo, fifa_mapper
    global SCALER, MODEL_KMEANS, MAPPING_SEGMENTOS, FEATURES
    base_path = "dataFutbol"
    base_path_fin = "Archivos_Modelo"
    
    try:
        modelo_ia = joblib.load(os.path.join(base_path, "modelo_albank_ia.pkl"))
        columnas_modelo = joblib.load(os.path.join(base_path, "columnas_modelo.pkl"))
        fifa_mapper = joblib.load(os.path.join(base_path, "fifa_mapper.pkl"))
        print(f"Model loaded. Classes: {modelo_ia.classes_}")
        
        SCALER = joblib.load(os.path.join(base_path_fin, 'escalador_quantile.pkl'))
        MODEL_KMEANS = joblib.load(os.path.join(base_path_fin, 'modelo_kmeans.pkl'))
        MAPPING_SEGMENTOS = joblib.load(os.path.join(base_path_fin, 'mapa_segmentos.pkl'))
        FEATURES = joblib.load(os.path.join(base_path_fin, 'columnas_features.pkl'))
        print("Modelos financieros cargados.")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise e
        
    yield
    # Cleanup if necessary

app = FastAPI(title="Al-Bank mAiles Prediction API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestPayload(BaseModel):
    home_team: str
    away_team: str

@app.post("/predict")
def predict_match(payload: RequestPayload):
    if modelo_ia is None or columnas_modelo is None or fifa_mapper is None:
        raise HTTPException(status_code=500, detail="Los modelos no están cargados correctamente.")

    # 1. Translate team names
    home_team_mapped = fifa_mapper.get(payload.home_team, payload.home_team)
    away_team_mapped = fifa_mapper.get(payload.away_team, payload.away_team)

    # 2. DataFrame inicializado a 0 con una sola fila
    # Using the columns loaded from the pickle
    df = pd.DataFrame(0, index=[0], columns=columnas_modelo)

    # 3. Column names to mark
    home_col = f"home_team_{home_team_mapped}"
    away_col = f"away_team_{away_team_mapped}"
    
    # 4. Error handling: check if teams exist in columns
    missing_teams = []
    if home_col not in df.columns:
        missing_teams.append(payload.home_team)
    if away_col not in df.columns:
        missing_teams.append(payload.away_team)
        
    if missing_teams:
        raise HTTPException(
            status_code=400, 
            detail=f"Equipo(s) no soportado(s) en el modelo: {', '.join(missing_teams)}"
        )

    # 5. Assign 1s
    df.loc[0, home_col] = 1
    df.loc[0, away_col] = 1
    if "neutral" in df.columns:
        df.loc[0, "neutral"] = 1

    # 6. Predict probabilities
    try:
        probs = modelo_ia.predict_proba(df)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la predicción: {e}")

    # Mapeo de clases (asumiendo 1 = Local/Home, 0 = Visitante o Empate/Away)
    nombres_legibles = {
        "1": payload.home_team,
        "0": payload.away_team
    }
    
    classes = modelo_ia.classes_
    prob_dict = {nombres_legibles.get(str(cls), f"Clase {cls}"): round(prob * 100, 2) for cls, prob in zip(classes, probs)}
    
    # Extract the probabilities for gamification logic
    # Assume we sort by max probability.
    sorted_probs = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)
    favorite = sorted_probs[0][0]
    sorpresa = sorted_probs[1][0] if len(sorted_probs) > 1 else "Otro"
    
    return {
        "equipo_local": payload.home_team,
        "equipo_visitante": payload.away_team,
        "probabilidades_victoria": prob_dict,
        "gamificacion": {
            "equipo_favorito": favorite,
            "equipo_sorpresa": sorpresa,
            "recomendacion": f"Si apuestas por '{favorite}' (probabilidad más alta), la recompensa es 1.5x mAiles. Si te arriesgas por '{sorpresa}', ganas 3.0x mAiles.",
            "multiplicadores": {
                favorite: 1.5,
                sorpresa: 3.0
            }
        }
    }


class FinancialRequest(BaseModel):
    saldo_por_vencer: float
    saldo_vencido: float
    saldo_no_devenga: float
    cartera_total: float
    cartera_en_riesgo: float
    saldo_mora: float
    dias_mora: int

@app.post("/predict_segmento")
def predict_segmento(payload: FinancialRequest):
    if SCALER is None or MODEL_KMEANS is None or MAPPING_SEGMENTOS is None or FEATURES is None:
        raise HTTPException(status_code=500, detail="Los modelos financieros no están cargados correctamente.")

    # Convertir a DataFrame en el orden esperado
    # payload.model_dump() es para Pydantic v2, dict() para compatibilidad
    input_data = payload.dict() if hasattr(payload, 'dict') else payload.model_dump()
    df_input = pd.DataFrame([input_data])[FEATURES]
    
    # Escalar
    X_scaled = SCALER.transform(df_input)
    
    # Predecir Cluster
    cluster_id = MODEL_KMEANS.predict(X_scaled)[0]
    
    # Mapear a letra (A, B, C, D)
    segmento_final = MAPPING_SEGMENTOS.get(cluster_id, "Desconocido")
    
    return {
        "status": "success",
        "segmento_asignado": segmento_final,
        "cluster_id": int(cluster_id)
    }
