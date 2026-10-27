"""Dataset loading and serialisation helpers for the Flask API."""

from pathlib import Path

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent
DATA_PATH = ROOT_DIR / "Social_Network_Ads.xls"
REQUIRED_COLUMNS = {"User ID", "Gender", "Age", "EstimatedSalary", "Purchased"}


def load_data(path: Path = DATA_PATH) -> pd.DataFrame:
    """Load the CSV-formatted dataset (whose historical filename ends in .xls)."""
    data = pd.read_csv(path)
    missing = REQUIRED_COLUMNS.difference(data.columns)
    if missing:
        raise ValueError(f"Dataset is missing columns: {', '.join(sorted(missing))}")
    data = data.copy()
    data["Purchased"] = pd.to_numeric(data["Purchased"], errors="raise").astype(int)
    data["Age"] = pd.to_numeric(data["Age"], errors="raise")
    data["EstimatedSalary"] = pd.to_numeric(data["EstimatedSalary"], errors="raise")
    return data


def records(data: pd.DataFrame) -> list[dict]:
    """Return records with NumPy scalar values converted to JSON-safe values."""
    return data.to_dict(orient="records")
