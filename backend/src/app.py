from flask import Flask, render_template

from minio_storage import minio_service


app = Flask(__name__)

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0",port=5000)