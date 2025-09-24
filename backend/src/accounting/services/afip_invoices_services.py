# src/accounting/services/afip_invoices.py

from src.accounting.models.afip_invoices import AFIPInvoice
from src.db import Database
from datetime import datetime, timedelta

class AFIPInvoiceService:
    def __init__(self):
        self.db = Database()

    def get_all_invoices(self, limit=50, offset=0):
        """Obtiene todas las facturas AFIP con información de la venta"""
        query = """
        SELECT ai.*, s.total_amount, s.sale_date, s.payment_method
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        ORDER BY ai.id DESC
        LIMIT %s OFFSET %s
        """
        results = self.db.execute(query, (limit, offset))
        invoices = []
        for row in results:
            invoice = AFIPInvoice(**{k: v for k, v in row.items() 
                                   if k in ['id', 'sale_id', 'cae', 'cae_expiration', 'invoice_type', 'invoice_number']})
            invoice_dict = invoice.to_dict()
            invoice_dict.update({
                'total_amount': row.get('total_amount'),
                'sale_date': row.get('sale_date'),
                'payment_method': row.get('payment_method')
            })
            invoices.append(invoice_dict)
        return invoices

    def get_invoice_by_id(self, invoice_id):
        """Obtiene una factura específica por ID"""
        query = """
        SELECT ai.*, s.total_amount, s.sale_date, s.payment_method
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        WHERE ai.id = %s
        """
        cursor = self.db.execute(query, (invoice_id,))
        row = cursor.fetchone()
        if row:
            invoice = AFIPInvoice(**{k: v for k, v in row.items() 
                if k in ['id', 'sale_id', 'cae', 'cae_expiration', 'invoice_type', 'invoice_number']})
            invoice_dict = invoice.to_dict()
            invoice_dict.update({
                'total_amount': row.get('total_amount'),
                'sale_date': row.get('sale_date'),
                'payment_method': row.get('payment_method')
            })
            return invoice_dict
        return None

    def create_invoice(self, data):
        """Crea una factura AFIP y marca la venta como facturada"""
        # Validaciones
        if not self._validate_invoice_data(data):
            return None
        
        # Verificar que la venta existe y está pendiente
        if not self._sale_can_be_invoiced(data.get("sale_id")):
            print(f"Error: La venta {data.get('sale_id')} no puede ser facturada")
            return None

        try:
            # Iniciar transacción
            self.db.connection.start_transaction()
            
            # Crear la factura AFIP
            query = """
            INSERT INTO afip_invoices (sale_id, cae, cae_expiration, invoice_type, invoice_number)
            VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                data.get("sale_id"),
                data.get("cae"),
                data.get("cae_expiration"),
                data.get("invoice_type"),
                data.get("invoice_number")
            )
            
            cursor = self.db.execute(query, params)
            invoice_id = cursor.lastrowid
            
            # Marcar la venta como facturada
            update_query = "UPDATE sales SET invoice_state = 'facturado' WHERE id = %s"
            self.db.execute(update_query, (data.get("sale_id"),))
            
            # Confirmar transacción
            self.db.connection.commit()
            
            return self.get_invoice_by_id(invoice_id)
            
        except Exception as e:
            self.db.connection.rollback()
            print(f"Error creando factura AFIP: {e}")
            return None

    def get_pending_sales(self):
        """Obtiene todas las ventas pendientes de facturación"""
        query = """
        SELECT s.*, 
            GROUP_CONCAT(CONCAT(p.name, ' (', sp.quantity, ')') SEPARATOR ', ') as products
        FROM sales s
        LEFT JOIN sale_product sp ON s.id = sp.sale_id
        LEFT JOIN products p ON sp.product_id = p.id
        WHERE s.invoice_state = 'pendiente'
        GROUP BY s.id
        ORDER BY s.sale_date ASC
        """
        results = self.db.execute(query)
        return [dict(row) for row in results]

    def get_invoices_by_date_range(self, start_date, end_date):
        """Obtiene facturas en un rango de fechas"""
        query = """
        SELECT ai.*, s.total_amount, s.sale_date, s.payment_method
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        WHERE DATE(s.sale_date) BETWEEN %s AND %s
        ORDER BY s.sale_date DESC
        """
        results = self.db.execute(query, (start_date, end_date))
        invoices = []
        for row in results:
            invoice = AFIPInvoice(**{k: v for k, v in row.items() 
                    if k in ['id', 'sale_id', 'cae', 'cae_expiration', 'invoice_type', 'invoice_number']})
            invoice_dict = invoice.to_dict()
            invoice_dict.update({
                'total_amount': row.get('total_amount'),
                'sale_date': row.get('sale_date'),
                'payment_method': row.get('payment_method')
            })
            invoices.append(invoice_dict)
        return invoices

    def get_invoices_by_type(self, invoice_type):
        """Obtiene facturas por tipo (A, B, C, etc.)"""
        query = """
        SELECT ai.*, s.total_amount, s.sale_date, s.payment_method
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        WHERE ai.invoice_type = %s
        ORDER BY ai.invoice_number DESC
        """
        results = self.db.execute(query, (invoice_type,))
        invoices = []
        for row in results:
            invoice = AFIPInvoice(**{k: v for k, v in row.items() 
                            if k in ['id', 'sale_id', 'cae', 'cae_expiration', 'invoice_type', 'invoice_number']})
            invoice_dict = invoice.to_dict()
            invoice_dict.update({
                'total_amount': row.get('total_amount'),
                'sale_date': row.get('sale_date'),
                'payment_method': row.get('payment_method')
            })
            invoices.append(invoice_dict)
        return invoices

    def get_expired_caes(self):
        """Obtiene facturas con CAE vencido o por vencer"""
        query = """
        SELECT ai.*, s.total_amount, s.sale_date, s.payment_method
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        WHERE ai.cae_expiration <= %s
        ORDER BY ai.cae_expiration ASC
        """
        expiration_limit = datetime.now().date() + timedelta(days=7)  # Próximos 7 días
        results = self.db.execute(query, (expiration_limit,))
        invoices = []
        for row in results:
            invoice = AFIPInvoice(**{k: v for k, v in row.items() 
                if k in ['id', 'sale_id', 'cae', 'cae_expiration', 'invoice_type', 'invoice_number']})
            invoice_dict = invoice.to_dict()
            invoice_dict.update({
                'total_amount': row.get('total_amount'),
                'sale_date': row.get('sale_date'),
                'payment_method': row.get('payment_method')
            })
            invoices.append(invoice_dict)
        return invoices

    def bulk_create_invoices(self, invoices_data):
        """Crea múltiples facturas en lote"""
        created_invoices = []
        failed_invoices = []
        
        for invoice_data in invoices_data:
            invoice = self.create_invoice(invoice_data)
            if invoice:
                created_invoices.append(invoice)
            else:
                failed_invoices.append({
                    "sale_id": invoice_data.get("sale_id"),
                    "error": "Failed to create invoice"
                })
        
        return {
            "created": created_invoices,
            "failed": failed_invoices,
            "total_created": len(created_invoices),
            "total_failed": len(failed_invoices)
        }

    def get_invoicing_stats(self):
        """Obtiene estadísticas de facturación"""
        # Total de ventas pendientes
        query = "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM sales WHERE invoice_state = 'pendiente'"
        cursor = self.db.execute(query)
        pending_result = cursor.fetchone()
        
        # Total de ventas facturadas
        query = "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM sales WHERE invoice_state = 'facturado'"
        cursor = self.db.execute(query)
        invoiced_result = cursor.fetchone()
        
        # Facturas por tipo
        query = """
        SELECT invoice_type, COUNT(*) as count, COALESCE(SUM(s.total_amount), 0) as total
        FROM afip_invoices ai
        LEFT JOIN sales s ON ai.sale_id = s.id
        GROUP BY invoice_type
        ORDER BY count DESC
        """
        results = self.db.execute(query)
        by_type = [dict(row) for row in results]
        
        return {
            "pending_invoices": {
                "count": pending_result["count"] if pending_result else 0,
                "total_amount": float(pending_result["total"]) if pending_result else 0.0
            },
            "processed_invoices": {
                "count": invoiced_result["count"] if invoiced_result else 0,
                "total_amount": float(invoiced_result["total"]) if invoiced_result else 0.0
            },
            "invoices_by_type": by_type
        }

    def _validate_invoice_data(self, data):
        """Valida los datos de la factura"""
        required_fields = ["sale_id", "cae", "cae_expiration", "invoice_type", "invoice_number"]
        for field in required_fields:
            if not data.get(field):
                print(f"Error: Campo requerido '{field}' faltante")
                return False
        
        # Validar formato de fecha CAE
        try:
            datetime.strptime(str(data.get("cae_expiration")), '%Y-%m-%d')
        except ValueError:
            print("Error: cae_expiration debe tener formato YYYY-MM-DD")
            return False
        
        return True

    def _sale_can_be_invoiced(self, sale_id):
        """Verifica si una venta puede ser facturada"""
        query = "SELECT invoice_state FROM sales WHERE id = %s"
        cursor = self.db.execute(query, (sale_id,))
        result = cursor.fetchone()
        
        if not result:
            return False  # Venta no existe
        
        return result["invoice_state"] == "pendiente"

    def get_next_invoice_number(self, invoice_type):
        """Obtiene el próximo número de factura para un tipo específico"""
        query = """
        SELECT MAX(CAST(invoice_number AS UNSIGNED)) as max_number 
        FROM afip_invoices 
        WHERE invoice_type = %s
        """
        cursor = self.db.execute(query, (invoice_type,))
        result = cursor.fetchone()
        
        max_number = result["max_number"] if result and result["max_number"] else 0
        return str(max_number + 1).zfill(8)  # Formato: 00000001