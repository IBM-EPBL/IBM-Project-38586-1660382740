from keras.models import load_model
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import base64
from PIL import Image
import numpy as np

app = Flask(__name__)
socketio = SocketIO(app)
model = load_model('Models/HandGestureModel1.h5')

def detectHandGesture(img):
    img = np.array(img)
    img = img.reshape(1, 64, 64, 1)
    img = img/255.0
    res = model.predict([img])[0]
    print("RES:", res)
    return np.argmax(res), max(res)

@app.route('/')
def home():
    return render_template("Home.html")

@socketio.on("image")
def predictImage(data_image):
    encoded_data = data_image.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resizedImage = cv2.resize(gray, (64, 64), interpolation = cv2.INTER_AREA)
    result = detectHandGesture(resizedImage)
    print(result)
    emit('response_back', {"result":int(result[0])})


if __name__ == '__main__':
    print("Server is up")
    socketio.run(app, host='0.0.0.0', port=5000)
    #app.run(debug = True)