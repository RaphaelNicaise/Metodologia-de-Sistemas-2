import os
import time
from reportlab.lib.pagesizes import mm
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode import code128

def generar_ticket(lista_productos: list[tuple[str, float]]) -> str:
    # Crear carpeta si no existe
    output_dir = "tickets_pdf/"
    os.makedirs(output_dir, exist_ok=True)

    # Generar número de ticket único basado en timestamp
    nro_ticket = str(int(time.time() * 1000))

    # Nombre del archivo basado en el nro_ticket
    nombre_archivo = f"{output_dir}ticket{nro_ticket}.pdf"

    # Obtener fecha y hora actuales
    fecha_hora = time.strftime("%d/%m/%Y %H:%M:%S")

    c = canvas.Canvas(nombre_archivo, pagesize=(80*mm, 120*mm))

    # Encabezado
    c.setFont("Helvetica-Bold", 14)
    c.drawString(10*mm, 110*mm, "Kiosco Don Pepe")
    c.setFont("Helvetica", 10)
    c.drawString(10*mm, 100*mm, f"Ticket N°: {nro_ticket}")
    c.drawString(10*mm, 95*mm, f"Fecha/Hora: {fecha_hora}")

    # Posición inicial para productos
    y = 90*mm
    total = 0

    for producto, precio in lista_productos:
        c.drawString(10*mm, y, f"{producto}: ${precio:.2f}")
        total += precio
        y -= 5*mm  # bajar línea para siguiente producto

    # Total
    c.setFont("Helvetica-Bold", 10)
    c.drawString(10*mm, y-5*mm, f"Total: ${total:.2f}")

    # Código de barras 1D
    barcode = code128.Code128(nro_ticket, barHeight=15*mm, barWidth=0.5)
    barcode.drawOn(c, 10*mm, 10*mm)

    # Pie
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(10*mm, 5*mm, "¡Gracias por su compra!")

    c.showPage()
    c.save()

    return nro_ticket  # para guardar en DB o mostrar

# Ejemplo de uso
productos = [("Coca Cola 500ml", 850.00), ("Chips", 450.00), ("Agua 600ml", 300.00)]
ticket_id = generar_ticket(productos)
print("Ticket generado con N°:", ticket_id)
