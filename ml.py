"""Training, evaluation, and prediction utilities."""

from typing import Any

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier


FEATURES = ["Gender", "Age", "EstimatedSalary"]
TARGET = "Purchased"


def _preprocessor() -> ColumnTransformer:
    # ``sparse_output`` replaced ``sparse`` in newer sklearn releases.
    try:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:  # pragma: no cover - compatibility with sklearn < 1.2
        encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
    return ColumnTransformer(
        [("categorical", encoder, ["Gender"]), ("numeric", StandardScaler(), ["Age", "EstimatedSalary"])],
        remainder="drop",
    )


def train_models(data: pd.DataFrame) -> tuple[dict[str, Pipeline], dict[str, dict[str, Any]], str]:
    """Fit all requested models and return models, metrics, and the best F1 model."""
    x = data[FEATURES]
    y = data[TARGET]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )
    estimators = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "SVC": SVC(probability=True, random_state=42),
    }
    models: dict[str, Pipeline] = {}
    metrics: dict[str, dict[str, Any]] = {}
    for name, estimator in estimators.items():
        pipeline = Pipeline([("preprocessor", _preprocessor()), ("model", estimator)])
        pipeline.fit(x_train, y_train)
        predicted = pipeline.predict(x_test)
        matrix = confusion_matrix(y_test, predicted, labels=[0, 1])
        metrics[name] = {
            "accuracy": float(accuracy_score(y_test, predicted)),
            "precision": float(precision_score(y_test, predicted, zero_division=0)),
            "recall": float(recall_score(y_test, predicted, zero_division=0)),
            "f1": float(f1_score(y_test, predicted, zero_division=0)),
            "confusion_matrix": matrix.tolist(),
        }
        models[name] = pipeline
    best = max(metrics, key=lambda model_name: metrics[model_name]["f1"])
    return models, metrics, best
