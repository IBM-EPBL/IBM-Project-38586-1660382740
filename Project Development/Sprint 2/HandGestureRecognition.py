from keras.models import load_model
import numpy as np
import cv2
from PIL import Image

model = load_model('Models/HandGestureModel1.h5')

def detectHandGesture(img):
    img = np.array(img)
    img = img.reshape(1, 64, 64, 1)
    img = img/255.0
    res = model.predict([img])[0]
    print("RES:", res)
    return np.argmax(res), max(res)

def captureImage(video):
    while True:
        ret, frame = video.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resizedImage = cv2.resize(gray, (64, 64), interpolation = cv2.INTER_AREA)
        print(detectHandGesture(resizedImage))
        cv2.imshow("Video Feed", resizedImage)
        if cv2.waitKey(30) == 27:break
    video.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    video = cv2.VideoCapture("http://192.168.213.25:8080/video")
    captureImage(video)
    
    
    
