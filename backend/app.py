from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import os

# Configure Flask to serve static files from the parent directory
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
app = Flask(__name__, static_folder=root_dir, static_url_path='')
CORS(app)  # Enable CORS for all routes

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'spam_model.pkl')

# Ensure model exists
if not os.path.exists(MODEL_PATH):
    print("Warning: spam_model.pkl not found. Please run train_model.py first.")
    model = None
else:
    model = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    if model:
        prediction = model.predict([text])[0]
        proba = model.predict_proba([text])[0]
        
        # Determine labels index
        labels = model.classes_
        spam_index = list(labels).index('Spam') if 'Spam' in labels else 0
        ham_index = list(labels).index('Ham') if 'Ham' in labels else 1
        
        # Provide logic for confidence
        if prediction == "Spam":
            confidence = float(proba[spam_index]) * 100
        else:
            confidence = float(proba[ham_index]) * 100
    else:
        # Fallback if no model
        confidence = 0
        prediction = "Ham"

    risk_level = "High" if confidence > 75 else ("Medium" if confidence > 40 else "Low")
    detected_type = "Not Spam" if prediction == "Ham" else "Spam Filter Match"
    
    # We always report risk relative to spam likelihood
    if prediction == "Ham" and confidence > 50:
        spam_confidence = 100 - confidence
    else:
        spam_confidence = confidence

    return jsonify({
        "type": detected_type,
        "confidence": min(round(spam_confidence), 99),
        "risk_label": risk_level,
        "backend": "Python Scikit-Learn Model"
    })

@app.route('/')
def index():
    # Serve the main HTML dashboard
    return send_from_directory(root_dir, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
