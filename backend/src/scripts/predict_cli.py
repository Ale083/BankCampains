import sys
import json
import joblib
import numpy as np
import pandas as pd
import os
from sklearn.inspection import permutation_importance


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTEFACT_PATH = os.path.join(BASE_DIR, "artefacto.pkl")
artefacto_cargado = joblib.load(ARTEFACT_PATH)

def get_original_value(feature_name, data_dict):

    if feature_name.startswith("cat__"):
        return 1.0
    elif feature_name.startswith("num__"):
        var_name = feature_name.replace("num__", "")
        if var_name in data_dict:
            return float(data_dict[var_name])
        var_name_dots = var_name.replace("_", ".")
        if var_name_dots in data_dict:
            return float(data_dict[var_name_dots])
        return 0.0
    else:
        return 1.0

def identificar_factores_influyentes(data_dict, probabilidad, nivel, artefacto):
    """
    Identifica los factores más influyentes para la predicción de un cliente específico
    usando perturbación de features.
    """
    try:
        model = artefacto["model"]
        
       
        fila_original = pd.DataFrame([data_dict])
        prob_original = model.predict_proba(fila_original)[0, 1]
        
        
        feature_names = model.named_steps["preprocessor"].get_feature_names_out()
        X_transformed = model.named_steps["preprocessor"].transform(fila_original)
        
        feature_impacts = []
        
        
        for i, feature_name in enumerate(feature_names):
            try:
                
                feature_value = X_transformed[0, i]
                
                if abs(feature_value) > 0.001: 
                   
                    X_perturbed = X_transformed.copy()
                    
                    # "Apagar" esta feature (poner en 0)
                    X_perturbed[0, i] = 0

                   
                    prob_perturbed = model.named_steps["model"].predict_proba(X_perturbed)[0, 1]
                    
                   
                    impact_raw = prob_original - prob_perturbed
                    impact_magnitude = abs(impact_raw)
                    
                   
                    # Si al "apagar" la feature la probabilidad baja, entonces la feature contribuye positivamente
                    # Si al "apagar" la feature la probabilidad sube, entonces la feature contribuye negativamente
                    impact_direction = "positive" if impact_raw > 0 else "negative"
                    
                    
                    original_raw_value = get_original_value(feature_name, data_dict)
                    
                    feature_impacts.append({
                        "feature_name": feature_name,
                        "importance": float(impact_magnitude),
                        "direction": impact_direction,
                        "impact_value": float(impact_raw),
                        "original_value": original_raw_value
                    })
                    
            except Exception as e:
                
                continue
        
        # top 10
        feature_impacts.sort(key=lambda x: x["importance"], reverse=True)
        top_features = feature_impacts[:10]
        
        # devolver las que tienen impacto significativo
        significant_features = [f for f in top_features if f["importance"] > 0.001]
        
        return significant_features
        
    except Exception as e:
        print(f"Error identificando factores: {e}")
        return []

def predict_from_values(
    artefacto,
    *,
    age,
    job,
    marital,
    education,
    default,
    housing,
    loan,
    contact,
    month,
    day_of_week,
    campaign,
    pdays,
    previous,
    poutcome,
    emp_var_rate,
    cons_price_idx,
    cons_conf_idx,
    euribor3m,
    nr_employed
):
    """
    Recibe el diccionario artefacto = {"model": ..., "threshold": ...}
    y los valores de un cliente, construye la fila y devuelve la predicción.
    
    Parámetros (todos obligatorios, van como keyword arguments):
      - age: Edad del cliente (int, ej. 42)
      - job: Tipo de trabajo (str, ej. "admin.", "technician", "blue-collar"...)
      - marital: Estado civil (str, ej. "married", "single", "divorced")
      - education: Nivel educativo (str, ej. "university.degree", "high.school", "basic.9y"...)
      - default: ¿Tiene crédito en default? ("yes", "no", "unknown")
      - housing: ¿Tiene préstamo de vivienda? ("yes", "no", "unknown")
      - loan: ¿Tiene préstamo personal? ("yes", "no", "unknown")
      - contact: Medio de contacto ("cellular" o "telephone")
      - month: Mes de la última campaña ("jan","feb",...,"dec")
      - day_of_week: Día de la semana ("mon","tue","wed","thu","fri")
      - campaign: Número de contactos realizados en esta campaña (int)
      - pdays: Días desde el último contacto en una campaña anterior (999 = nunca contactado)
      - previous: Nº de contactos previos antes de esta campaña (int)
      - poutcome: Resultado de la campaña anterior ("success","failure","nonexistent")
      - emp_var_rate: Tasa de variación del empleo (float, indicador macroeconómico)
      - cons_price_idx: Índice de precios al consumidor (float)
      - cons_conf_idx: Índice de confianza del consumidor (float)
      - euribor3m: Tipo Euribor a 3 meses (float)
      - nr_employed: Nº de empleados (indicador agregado bancario, float)
    """
    model = artefacto["model"]
    thr   = artefacto["threshold"]
    
    data_dict = {
        "age": age,
        "job": job,
        "marital": marital,
        "education": education,
        "default": default,
        "housing": housing,
        "loan": loan,
        "contact": contact,
        "month": month,
        "day_of_week": day_of_week,
        "campaign": campaign,
        "pdays": pdays,
        "previous": previous,
        "poutcome": poutcome,
        "emp.var.rate": emp_var_rate,
        "cons.price.idx": cons_price_idx,
        "cons.conf.idx": cons_conf_idx,
        "euribor3m": euribor3m,
        "nr.employed": nr_employed,
    }
    
    fila = pd.DataFrame([data_dict])
    proba = model.predict_proba(fila)[0, 1]
    clase = int(proba >= thr)
    
    # Clasificación de nivel según probabilidad (REQ-4)
    if proba < 0.5:
        nivel = "Baja"
    elif proba < 0.75:
        nivel = "Media"
    else:
        nivel = "Alta"
    
    # Identificar factores más influyentes usando importancia dinámica
    top_features = identificar_factores_influyentes(data_dict, proba, nivel, artefacto)
    
    return {
        "probabilidad": float(proba),
        "clase": clase,     
        "nivel": nivel,
        "threshold_usado": thr,
        "top_features": top_features
    }



if __name__ == "__main__":
    data = json.load(sys.stdin)

    resultado = predict_from_values(artefacto_cargado, **data)
    if isinstance(resultado.get("probabilidad"), np.generic):
        resultado["probabilidad"] = float(resultado["probabilidad"])
    if isinstance(resultado.get("threshold_usado"), np.generic):
        resultado["threshold_usado"] = float(resultado["threshold_usado"])

    print(json.dumps(resultado))
