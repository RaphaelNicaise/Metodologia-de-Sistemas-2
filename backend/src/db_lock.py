# backend/src/db_lock.py
import threading

# Usamos un RLock (Reentrant Lock) porque algunas de tus funciones de servicio
# llaman a otras funciones del mismo servicio (ej. get_daily_comparison -> get_daily_report)
# y el mismo hilo necesitará adquirir el candado varias veces.
db_lock = threading.RLock()