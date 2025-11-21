import threading

# Usamos RLock (Reentrant Lock) para que el mismo hilo 
# pueda adquirir el bloqueo varias veces sin quedarse congelado.
db_lock = threading.RLock()