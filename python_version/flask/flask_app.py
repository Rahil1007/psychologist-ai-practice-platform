import os
from flask import Flask, render_template, redirect
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env if present

app = Flask(__name__)

@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/chat/<therapist>")
def chat_redirect(therapist):
    # Build Chainlit URL from environment variable or default
    chainlit_host = os.getenv("CHAINLIT_HOST", "http://localhost:8000")
    return redirect(f"{chainlit_host}/?therapist={therapist}")

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(port=port, debug=True) 