# leer_hid.py
# esto funciona solo en terminal
import sys

print("Escaneá códigos (Ctrl+C para salir)...")
try:
    while True:
        code = sys.stdin.readline()
        if not code:
            break  # EOF
        code = code.strip()
        if code:
            print(f"[OK] Código leído: {code}")
except KeyboardInterrupt:
    pass
