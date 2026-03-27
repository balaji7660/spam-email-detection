# Defensor AI - Spam Email Detection System

An advanced Machine Learning and NLP-powered security dashboard that detects scam, phishing, and spam messaging using highly sophisticated Python models (Scikit-Learn Naive Bayes) alongside a responsive, modern glassmorphism frontend.

## 🚀 1-Click Deployment (Cloud)

You can instantly deploy this full-stack application (both the HTML frontend and Python backend) for free by clicking the button below:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Because of the `render.yaml` blueprint included in this repository, Render will automatically:
1. Provision a lightweight Python cloud machine.
2. Install all machine learning requirements.
3. Train the model (`train_model.py`).
4. Serve the Web API and UI via `gunicorn`.

## 💻 Local Development
If you prefer to run it locally, follow these steps:

1. Create a Python Virtual Environment:
```bash
python -m venv venv
venv\Scripts\activate
```
2. Install Requirements:
```bash
pip install -r requirements.txt
```
3. Run the complete service:
```bash
run.bat
```
