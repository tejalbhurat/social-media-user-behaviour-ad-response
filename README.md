# Social Network Ads Purchase/Click Prediction

## Project Overview

This project focuses on predicting whether a user will purchase a product after viewing a social network advertisement. Using **machine learning classification models**, we aim to identify patterns based on **user age** and **estimated salary**, helping to understand which users are more likely to convert.

The key goal is to build, evaluate, and compare different classification algorithms to determine the most effective model for this task.

---

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

---

## Conclusion

The **Support Vector Machine (SVM)** model outperformed others with the **highest F1 score and accuracy**, making it the most suitable model for this classification task. It is recommended for **further tuning or deployment** in production settings.

---
