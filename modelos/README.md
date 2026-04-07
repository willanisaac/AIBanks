# Al-Bank mAiles Backend API

Este proyecto contiene el servicio Backend en FastAPI encargado de recibir predicciones de victorias entre dos equipos de fútbol utilizando un modelo de Machine Learning y devolver la recomendación de gamificación en *mAiles*.

## Requisitos Previos

Asegúrate de tener instalado Python 3.9 o superior en tu sistema.

### Instalación de dependencias

Es altamente recomendable usar un entorno virtual (Virtual Environment). Para instalar todas las bibliotecas necesarias (`fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `pydantic`), abre la terminal en esta misma carpeta y ejecuta:

```bash
pip install -r requirements.txt
```

## Ejecución del Servidor Local

Para arrancar el servicio de forma local, debes ejecutar _Uvicorn_ apuntando al archivo `main.py`. Ejecuta esto en tu terminal:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
> Nota: Asegúrate de mantener abierta la ventana de la terminal para que la API siga recibiendo solicitudes.

## ¿Cómo probar el Endpoint?

FastAPI posee una documentación interactiva nativa. Es la forma más sencilla y visual de probar la API sin instalar herramientas adicionales.

### 1. Usando la interfaz `/docs` (Recomendado)
1. Abre tu navegador web (Google Chrome, Edge, etc.).
2. Dirígete a la URL temporal generada: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. Selecciona la pestaña que dice **`POST /predict`**.
4. Dale al botón transparente que dice **Try it out** a la derecha.
5. Edita el Request body y escribe:
   ```json
   {
     "home_team": "México",
     "away_team": "RSA"
   }
   ```
6. Haz clic en **Execute** y desplázate abajo para ver el resultado y el *Status 200*.

### 2. Usando Postman
1. Abre tu aplicación Postman y haz clic en el botón `+` para abrir una pestaña limpia.
2. Selecciona **POST** en el desplegable (suele venir como `GET` por defecto).
3. Introduce la URL original (¡sin barra `/` al final!): `http://127.0.0.1:8000/predict`
4. Selecciona la solapa **Body**, elige la opción **raw**, y en la esquina confirma que quieres **JSON**.
5. Pega el ejemplo anterior.
6. Pulsa **Send**.

## Estructura de la Respuesta JSON

Al enviar correctamente la solicitud, la API te devolverá las probabilidades porcentuales basadas en el modelo de Machine Learning junto con los factores de recompensas mAiles para Front-End:

```json
{
    "equipo_local": "México",
    "equipo_visitante": "RSA",
    "probabilidades_victoria": {
        "México": 75.21,
        "RSA": 24.79
    },
    "gamificacion": {
        "equipo_favorito": "México",
        "equipo_sorpresa": "RSA",
        "recomendacion": "Si apuestas por 'México' (probabilidad más alta), la recompensa es 1.5x mAiles. Si te arriesgas por 'RSA', ganas 3.0x mAiles.",
        "multiplicadores": {
            "México": 1.5,
            "RSA": 3.0
        }
    }
}
```

---

## Endpoint de Segmentación Financiera (`/predict_segmento`)

Este segundo servicio recibe 7 variables financieras obligatorias y realiza una inferencia y normalización en base a un modelo K-Means pre-entrenado para segmentar e identificar al cliente en Categorías (A, B, C o D).

### Cómo probarlo (JSON Petición):
Realiza una petición POST a **`http://127.0.0.1:8000/predict_segmento`** con el siguiente Body:

```json
{
  "saldo_por_vencer": 1500.50,
  "saldo_vencido": 0.0,
  "saldo_no_devenga": 0.0,
  "cartera_total": 1500.50,
  "cartera_en_riesgo": 0.0,
  "saldo_mora": 0.0,
  "dias_mora": 0
}
```

### Respuesta del Modelo Financiero
El sistema transformará (Scaling) los valores automáticamente y entregará el clúster exacto mapeado:

```json
{
    "status": "success",
    "segmento_asignado": "B",
    "cluster_id": 1
}
```
