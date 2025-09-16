# src/sales/services/sales_service.py
# Lógica de negocio: solo SQL crudo usando tu Database singleton.
# Todas las funciones devuelven dict/list "listos" para JSON en controllers.

from __future__ import annotations
from typing import Any, Dict, List
from decimal import Decimal

from ...db import Database

# ====================================================================
# function crearVenta(datosVenta)
# Crea una venta de forma atómica:
#  1) Inserta encabezado en sales (total=0 al inicio)
#  2) Para cada item: valida stock (FOR UPDATE), descuenta stock, inserta en sale_product
#  3) Recalcula y actualiza el total
#  4) Devuelve la venta creada (sin ítems, simple)
# ====================================================================
def crearVenta(datosVenta: Dict[str, Any]) -> Dict[str, Any]:
    items = datosVenta.get("items", [])
    if not items or not isinstance(items, list):
        raise ValueError("Debe enviar 'items' como lista con {product_id, quantity}.")

    payment_method = datosVenta.get("payment_method")
    ticket_url = datosVenta.get("ticket_url")

    # Obtenemos la conexión de tu singleton
    db = Database()
    conn = db.conn
    cur = conn.cursor(dictionary=True)

    try:
        # Iniciamos transacción manual (muy importante para atomicidad)
        conn.start_transaction()

        # 1) Insertamos el encabezado con total = 0.00
        cur.execute(
            """
            INSERT INTO sales (total_amount, payment_method, ticket_url)
            VALUES (%s, %s, %s)
            """,
            (Decimal("0.00"), payment_method, ticket_url),
        )
        sale_id = cur.lastrowid

        running_total = Decimal("0.00")

        # 2) Procesamos cada ítem
        for i, it in enumerate(items, start=1):
            # Validación básica de tipos
            try:
                pid = int(it["product_id"])
                qty = int(it["quantity"])
            except Exception:
                raise ValueError(f"Item #{i} inválido: se espera product_id(int) y quantity(int).")
            if qty <= 0:
                raise ValueError(f"quantity debe ser > 0 (item #{i}).")

            # Leemos precio/stock del producto y BLOQUEAMOS la fila para evitar carreras (FOR UPDATE)
            cur.execute(
                "SELECT price, stock FROM products WHERE id = %s FOR UPDATE",
                (pid,),
            )
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Producto id={pid} no existe.")

            price = Decimal(str(row["price"]))
            stock = int(row["stock"])

            if stock < qty:
                raise ValueError(
                    f"Stock insuficiente para product_id={pid} (disp={stock}, req={qty})."
                )

            # 3) Descontamos stock
            cur.execute(
                "UPDATE products SET stock = stock - %s WHERE id = %s",
                (qty, pid),
            )

            # 4) Insertamos en sale_product (detalle)
            cur.execute(
                """
                INSERT INTO sale_product (sale_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
                """,
                (sale_id, pid, qty, price),
            )

            # 5) Sumamos al total
            running_total += price * qty

        # 6) Actualizamos el total en sales
        cur.execute(
            "UPDATE sales SET total_amount = %s WHERE id = %s",
            (running_total, sale_id),
        )

        # 7) Confirmamos la transacción
        conn.commit()

        # 8) Leemos la venta para responder
        cur.execute(
            """
            SELECT id, sale_date, total_amount, payment_method, ticket_url, invoice_state
            FROM sales
            WHERE id = %s
            """,
            (sale_id,),
        )
        sale = cur.fetchone()

        return {
            "id": sale["id"],
            "sale_date": sale["sale_date"].isoformat() if sale["sale_date"] else None,
            "total_amount": float(sale["total_amount"]),
            "payment_method": sale["payment_method"],
            "ticket_url": sale["ticket_url"],
            "invoice_state": sale["invoice_state"],
        }

    except Exception as e:
        # Cualquier error → revertimos
        conn.rollback()
        # Si es validación, dejamos el mensaje claro; si no, mensaje genérico
        if isinstance(e, ValueError):
            raise
        raise ValueError("Error al crear la venta.") from e
    finally:
        # Cerramos SIEMPRE el cursor (la conexión queda abierta en el singleton)
        cur.close()


# ====================================================================