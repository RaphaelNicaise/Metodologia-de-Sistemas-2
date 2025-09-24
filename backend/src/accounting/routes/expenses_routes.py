from flask import Blueprint, jsonify, request
from src.accounting.services.expenses_services import ExpenseService

expenses_bp = Blueprint("expenses", __name__)
service = ExpenseService()

@expenses_bp.route("/", methods=["GET"])
def get_expenses():
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    expenses = service.get_all_expenses(limit, offset)
    return jsonify([expense.to_dict() for expense in expenses]), 200

@expenses_bp.route("/<int:expense_id>", methods=["GET"])
def get_expense(expense_id):
    expense = service.get_expense_by_id(expense_id)
    if expense:
        return jsonify(expense.to_dict()), 200
    return jsonify({"error": "Expense not found"}), 404

@expenses_bp.route("/", methods=["POST"])
def create_expense():
    data = request.get_json()
    expense = service.create_expense(data)
    if expense:
        return jsonify(expense.to_dict()), 201
    return jsonify({"error": "Failed to create expense"}), 400

@expenses_bp.route("/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    data = request.get_json()
    expense = service.update_expense(expense_id, data)
    if expense:
        return jsonify(expense.to_dict()), 200
    return jsonify({"error": "Failed to update expense"}), 400

@expenses_bp.route("/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    if service.delete_expense(expense_id):
        return jsonify({"message": "Expense deleted successfully"}), 200
    return jsonify({"error": "Failed to delete expense"}), 400

@expenses_bp.route("/category/<string:category>", methods=["GET"])
def get_expenses_by_category(category):
    expenses = service.get_expenses_by_category(category)
    return jsonify([expense.to_dict() for expense in expenses]), 200

@expenses_bp.route("/day", methods=["GET"])
def get_expenses_by_date_range():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    expenses = service.get_expenses_by_date_range(start_date, end_date)
    return jsonify([expense.to_dict() for expense in expenses]), 200

@expenses_bp.route("/summary/category", methods=["GET"])
def get_summary_by_category():
    summary = service.get_expenses_summary_by_category()
    return jsonify(summary), 200

@expenses_bp.route("/summary/monthly/<int:year>", methods=["GET"])
def get_monthly_summary(year):
    summary = service.get_monthly_summary(year)
    return jsonify(summary), 200
