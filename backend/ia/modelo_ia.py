from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import random
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

app = Flask(__name__)
CORS(app)

# =================================================================
# 1. GENERACIÓN DE DATOS SINTÉTICOS (250 ALUMNOS)
# =================================================================
X_list = []
y_reg_list = []
y_clf_list = []

# Simulamos 250 historiales de estudiantes
for _ in range(250):
    horas = random.randint(10, 480)
    actividades = max(1, horas // random.randint(4, 15)) # Entre 4 y 15 hrs por actividad
    promedio = horas / actividades
    progreso = (horas / 480) * 100
    
    X_list.append([horas, actividades, promedio, progreso])
    
    # Semanas estimadas (asumiendo un ritmo de 15 hrs por semana)
    semanas = max(1, (480 - horas) / 15)
    y_reg_list.append(semanas)
    
    # Nivel de Riesgo (0=Bajo, 1=Medio, 2=Alto)
    # Metemos un poco de "ruido" aleatorio para simular la realidad
    if progreso < 30:
        riesgo = 2 if random.random() < 0.9 else 1
    elif progreso < 70:
        riesgo = 1 if random.random() < 0.85 else (2 if random.random() < 0.5 else 0)
    else:
        riesgo = 0 if random.random() < 0.95 else 1
        
    y_clf_list.append(riesgo)

X = np.array(X_list)
y_reg = np.array(y_reg_list)
y_clf = np.array(y_clf_list)

# =================================================================
# 2. ENTRENAMIENTO Y EVALUACIÓN PROFESIONAL
# =================================================================
# Separamos 80% para entrenar y 20% para examinar (el estándar de ML)
X_train, X_test, y_train, y_test = train_test_split(X, y_clf, test_size=0.2, random_state=42)

modelo_reg = LinearRegression()
modelo_reg.fit(X, y_reg) # La regresión usa todos para la tendencia

modelo_clf = RandomForestClassifier(n_estimators=100, random_state=42)
modelo_clf.fit(X_train, y_train) # El Random Forest solo entrena con el 80%

y_pred = modelo_clf.predict(X_test) # Lo examinamos con el 20% restante

print("\n" + "="*50)
print(" CALCULANDO MÉTRICAS DEL MODELO PARA EL COMITÉ")
print(" Tamaño de la muestra: 250 estudiantes simulados")
print("="*50)
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
print(f"Precision: {precision_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
print(f"Recall:    {recall_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
print(f"F1 Score:  {f1_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
print("="*50 + "\n")

# =================================================================
# 3. EL MICROSERVICIO WEB (LA CONEXIÓN CON REACT)
# =================================================================
@app.route('/predict', methods=['POST'])
def ia_prediccion():
    # Recibe los datos desde React
    datos = request.json
    horas = datos.get('horas', 0)
    num_actividades = datos.get('actividades', 0)
    
    # La misma matemática de tu amigo
    promedio = horas / num_actividades if num_actividades > 0 else 0
    progreso = (horas / 480) * 100 
    
    datos_modelo = [[horas, num_actividades, promedio, progreso]]
    
    semanas = round(modelo_reg.predict(datos_modelo)[0], 1)
    riesgo = modelo_clf.predict(datos_modelo)[0]

    # Interpretar riesgo
    if riesgo == 0:
        nivel, color = "Bajo", "success"
    elif riesgo == 1:
        nivel, color = "Medio", "warning"
    else:
        nivel, color = "Alto", "danger"

    recomendaciones = [
        "Participa más constantemente",
        "Organiza mejor tus actividades",
        "Consulta con tu encargado"
    ]

    # Envía todo de regreso a la pantalla
    return jsonify({
        "prediction": {
            "semanas": semanas,
            "riesgo": nivel,
            "color": color,
            "recomendaciones": recomendaciones
        }
    })

if __name__ == '__main__':
    print("🚀 Servidor Flask listo. Esperando a React en el puerto 5000...")
    app.run(port=5000, debug=True)