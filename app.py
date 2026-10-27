"""Flask backend for Social Media User Behaviour & Ad Response."""

from __future__ import annotations

import math
from typing import Any

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from data_utils import load_data, records
from ml import FEATURES, train_models


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    data = load_data()
    models, metrics, best_model = train_models(data)

    def error(message: str, status: int = 400):
        return jsonify({"error": message}), status

    def filtered_data() -> pd.DataFrame:
        result = data.copy()
        search = request.args.get("search", "").strip().lower()
        if search:
            text_mask = result.drop(columns=["Gender"]).astype(str).apply(
                lambda column: column.str.lower().str.contains(search, regex=False, na=False)
            ).any(axis=1)
            gender_mask = result["Gender"].str.casefold().eq(search)
            mask = text_mask | gender_mask
            result = result[mask]
        gender = request.args.get("gender")
        if gender:
            result = result[result["Gender"].str.casefold() == gender.casefold()]
        for parameter, column in (("purchased", "Purchased"),):
            value = request.args.get(parameter)
            if value is not None:
                if value not in {"0", "1"}:
                    raise ValueError(f"{parameter} must be 0 or 1")
                result = result[result[column] == int(value)]
        for parameter, column in (("age_min", "Age"), ("age_max", "Age")):
            value = request.args.get(parameter)
            if value is not None:
                try:
                    number = float(value)
                except ValueError as exc:
                    raise ValueError(f"{parameter} must be numeric") from exc
                result = result[result[column] >= number] if parameter.endswith("min") else result[result[column] <= number]
        sort_by = request.args.get("sort_by", "User ID")
        if sort_by not in data.columns:
            raise ValueError(f"sort_by must be one of: {', '.join(data.columns)}")
        order = request.args.get("sort_order", "asc").lower()
        if order not in {"asc", "desc"}:
            raise ValueError("sort_order must be asc or desc")
        return result.sort_values(sort_by, ascending=order == "asc", kind="stable")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "dataset_records": int(len(data)), "best_model": best_model})

    @app.get("/api/data")
    def get_data():
        try:
            result = filtered_data()
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))
            if page < 1 or per_page < 1 or per_page > 500:
                raise ValueError("page must be >= 1 and per_page must be between 1 and 500")
        except ValueError as exc:
            return error(str(exc))
        total = len(result)
        start = (page - 1) * per_page
        return jsonify({
            "data": records(result.iloc[start : start + per_page]),
            "pagination": {"page": page, "per_page": per_page, "total": total, "pages": (total + per_page - 1) // per_page},
        })

    @app.get("/api/analytics")
    def analytics():
        purchased = data["Purchased"] == 1
        age_groups = pd.cut(data["Age"], bins=[0, 24, 34, 44, 54, float("inf")], labels=["18-24", "25-34", "35-44", "45-54", "55+"])

        def rates(series: pd.Series) -> list[dict[str, Any]]:
            grouped = data.assign(_group=series).groupby("_group", observed=False)["Purchased"].agg(["count", "mean"])
            return [{"group": str(index), "count": int(row["count"]), "purchase_rate": float(row["mean"])} for index, row in grouped.iterrows()]

        return jsonify({
            "totals": {"users": int(len(data)), "purchases": int(purchased.sum()), "non_purchases": int((~purchased).sum()), "purchase_rate": float(purchased.mean())},
            "purchase_breakdown": [{"purchased": int(key), "count": int(value)} for key, value in data["Purchased"].value_counts().sort_index().items()],
            "averages": {"age": float(data["Age"].mean()), "estimated_salary": float(data["EstimatedSalary"].mean())},
            "age_group_purchase_rates": rates(age_groups),
            "gender_purchase_rates": rates(data["Gender"]),
            "scatter": records(data[["Age", "EstimatedSalary", "Purchased", "Gender"]]),
        })

    @app.get("/api/models/metrics")
    def model_metrics():
        return jsonify({"models": metrics, "best_model": best_model})

    @app.post("/api/predict")
    def predict():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return error("Request body must be a JSON object")
        missing = [field for field in FEATURES if field not in payload]
        if missing:
            return error(f"Missing required fields: {', '.join(missing)}")
        gender = payload["Gender"]
        if not isinstance(gender, str) or gender.casefold() not in {"male", "female"}:
            return error("Gender must be Male or Female")
        try:
            age, salary = float(payload["Age"]), float(payload["EstimatedSalary"])
        except (TypeError, ValueError):
            return error("Age and EstimatedSalary must be numeric")
        if not math.isfinite(age) or not math.isfinite(salary) or not 0 < age <= 120 or salary < 0:
            return error("Age must be between 0 and 120 and EstimatedSalary cannot be negative")
        model_name = payload.get("model", best_model)
        if model_name not in models:
            return error(f"Unknown model. Choose one of: {', '.join(models)}")
        features = pd.DataFrame([{"Gender": gender.title(), "Age": age, "EstimatedSalary": salary}])
        model = models[model_name]
        outcome = int(model.predict(features)[0])
        response: dict[str, Any] = {"outcome": outcome, "model": model_name, "explanation": f"{'Likely to purchase' if outcome else 'Unlikely to purchase'} based on the selected model."}
        if hasattr(model, "predict_proba"):
            response["probability"] = float(model.predict_proba(features)[0][1])
        return jsonify(response)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
