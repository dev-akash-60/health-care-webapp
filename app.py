from flask import Flask, render_template, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("disease_model.pkl")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict_ajax', methods=['POST'])
def predict_ajax():
    try:
        features = [
            int(request.form.get('fever', 0)),
            int(request.form.get('headache', 0)),
            int(request.form.get('nausea', 0)),
            int(request.form.get('vomiting', 0)),
            int(request.form.get('fatigue', 0)),
            int(request.form.get('joint_pain', 0)),
            int(request.form.get('skin_rash', 0)),
            int(request.form.get('cough', 0)),
            int(request.form.get('weight_loss', 0)),
            int(request.form.get('yellow_eyes', 0)),
        ]
        pred = model.predict([features])[0]
        return jsonify({'result': str(pred)})
    except Exception as e:
        return jsonify({'result': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
