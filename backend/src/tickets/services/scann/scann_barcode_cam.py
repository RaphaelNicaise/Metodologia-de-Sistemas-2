import cv2
from pyzbar.pyzbar import decode
from collections import deque

def scann_code():
    cap = cv2.VideoCapture(0)
    historial = deque(maxlen=20)  # guarda las últimas 20 lecturas
    cap.set(3, 640)
    cap.set(4, 480)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Decodifica en ambas imágenes y combina resultados
        barcodes = decode(frame) + decode(thresh)
        vistos = set()  # Para evitar duplicados en el mismo frame

        for barcode in barcodes:
            codigo = barcode.data.decode('utf-8')
            if codigo in vistos:
                continue
            vistos.add(codigo)
            historial.append(codigo)
            print(codigo)
            ultimas = list(historial)[-15:]
            if ultimas.count(codigo) >= 5:
                print("Confirmado:", codigo)
                historial = deque([x for x in historial if x != codigo], maxlen=20)
                cap.release()
                cv2.destroyAllWindows()
                return codigo

            x, y, w, h = barcode.rect
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, codigo, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        cv2.imshow("Escáner EAN13", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return None

if __name__ == "__main__":
    scann_code()