# Social Network Ads Purchase/Click Prediction

## Project Overview

This project focuses on predicting whether a user will purchase a product after viewing a social network advertisement. Using **machine learning classification models**, we aim to identify patterns based on **user age** and **estimated salary**, helping to understand which users are more likely to convert.

The key goal is to build, evaluate, and compare different classification algorithms to determine the most effective model for this task.

---

## Web application

The repository now includes a Flask API and a Vite/React interface. The original
notebook and CSV-formatted `Social_Network_Ads.xls` file are preserved as-is.

### Prerequisites

* Python 3.9 or newer
* Node.js 18 or newer and npm

### Start the Flask backend

```bash
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API is available at `http://127.0.0.1:5000`. It loads the `.xls` file with
`pandas.read_csv()` because the file contains comma-separated values.

### Start the React frontend

In a second terminal:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).
Vite proxies `/api` requests to the Flask server. The interface includes live
dataset analytics, model evaluation, a searchable dataset explorer, and a
validated prediction form.

### Original notebook

The original analysis can be run with Jupyter after installing the notebook
dependencies:

```bash
pip install pandas numpy matplotlib seaborn scikit-learn jupyter
jupyter notebook social_ads_click_prediction.ipynb
```

### What this project can and cannot predict

The models estimate the `Purchased` outcome from gender, age, and estimated
salary. They do not measure actual social-media activity: the dataset contains
no likes, shares, comments, impressions, clickstream events, or time spent
viewing advertisements. Predictions describe patterns in this small sample and
are not guarantees of an individual's behaviour.

## Dataset Summary

* **Filename**: `Social_Network_Ads.xls`
* **Records**: 400
* **Features**:

  * `User ID`: Unique identifier *(not used in modeling)*
  * `Gender`: Male/Female
  * `Age`: Age of the user
  * `EstimatedSalary`: Estimated income of the user
  * `Purchased`: Target variable (0 = No, 1 = Yes)

---

## Key Tasks

* Exploratory Data Analysis (EDA)
* Data Cleaning and Preprocessing
* Feature Selection
* Model Training:

  * Logistic Regression
  * Decision Tree Classifier
  * Support Vector Machine (SVM)
* Model Evaluation:

  * Accuracy
  * F1 Score
  * Precision & Recall
  * Confusion Matrix
* Model Comparison via F1 Score Bar Chart

---

## Exploratory Data Analysis (EDA)

* Used **boxplots** and **pairplots** to visualize feature distributions
* Key Observations:

  * `Age` and `EstimatedSalary` show clear separation concerning purchase behavior
  * `Gender` does not significantly influence purchasing decisions

---

##  Modeling Approach

###  Features Used:

* `Age`
* `EstimatedSalary`

### Models Trained:

1. **Logistic Regression**
2. **Decision Tree Classifier**
3. **Support Vector Machine (SVM)**

All models were evaluated using an **80/20 train-test split**.

---

## Evaluation Metrics

| Model               | Accuracy  | F1 Score  |
| ------------------- | --------- | --------- |
| Logistic Regression | 86.3%     | 0.776     |
| Decision Tree       | 83.8%     | 0.764     |
| **SVM**             | **92.5%** | **0.900** |

Metrics used for evaluation:

* **Accuracy**
* **F1 Score**
* **Precision**
* **Recall**
* **Confusion Matrix**

A **bar chart** was generated to compare F1 scores across models visually.

The evaluation table above describes the preserved notebook analysis. The web
application retrains the three models with its own reproducible preprocessing
pipeline and displays the metrics returned by the live Flask API, rather than
assuming the notebook's reported values.

---

## Conclusion

The **Support Vector Machine (SVM)** model outperformed others with the **highest F1 score and accuracy**, making it the most suitable model for this classification task. It is recommended for **further tuning or deployment** in production settings.

---
