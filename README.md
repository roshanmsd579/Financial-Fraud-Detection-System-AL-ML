<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Active-00e676?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

<h1 align="center">🛡️ FraudShield AI</h1>
<h3 align="center">AI-Powered Financial Fraud Detection System</h3>

<p align="center">
  A full-stack machine learning application that detects fraudulent financial transactions in real time using a Random Forest classifier, served through a Flask REST API, and visualized on a premium dark-mode analytics dashboard.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Dashboard](#-dashboard)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

FraudShield AI is an end-to-end financial fraud detection platform designed to monitor, flag, and analyze suspicious transactions. The system combines a trained machine learning model with a real-time simulation engine and an interactive analytics dashboard to provide a comprehensive fraud detection experience.

### Problem Statement

Financial fraud costs institutions billions of dollars annually. Traditional rule-based systems fail to adapt to evolving fraud patterns. FraudShield AI addresses this by leveraging machine learning to identify complex fraud indicators across multiple transaction features.

### Solution

- A **Random Forest classifier** trained on 18 engineered features captures non-linear fraud patterns
- A **real-time simulation engine** generates live transactions and scores them against the trained model
- A **premium dashboard** provides instant visibility into transaction risk, alerts, and model performance

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **ML-Powered Detection** | Random Forest model with 94%+ accuracy, trained on 18 engineered features |
| 📊 **Real-Time Monitoring** | Live transaction feed updating every 2–4 seconds with AI risk scoring |
| 🚨 **Alert Management** | Automated alerts for high-risk transactions with investigate/dismiss workflows |
| 📈 **Interactive Analytics** | Charts for volume trends, risk distribution, category breakdown, and hourly patterns |
| 🧪 **Prediction Tester** | Submit custom transactions to test the model's fraud probability output |
| 🌍 **Geographic Analysis** | Polar area chart showing transaction distribution by country |
| 🎨 **Premium Dark UI** | Glassmorphism design with smooth animations and responsive layout |
| 🔌 **REST API** | Full API for integration with external systems |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Python 3.10+ |
| **ML Framework** | scikit-learn 1.6 (Random Forest, StandardScaler, LabelEncoder) |
| **Data Processing** | Pandas 2.2, NumPy 2.2 |
| **Web Framework** | Flask 3.1 |
| **Model Persistence** | Joblib 1.4 |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Charts** | Chart.js 4.4 (via CDN) |
| **Icons** | Font Awesome 6.5 (via CDN) |
| **Typography** | Google Fonts — Inter |

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │Dashboard │  │  Alerts  │  │Analytics │  │  AI Model Test │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘   │
│       └─────────────┴─────────────┴────────────────┘            │
│                          ▼ HTTP / JSON                          │
├─────────────────────────────────────────────────────────────────┤
│                     FLASK REST API (app.py)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ /api/    │  │/api/     │  │/api/     │  │  /api/predict  │   │
│  │  stats   │  │ txns     │  │ alerts   │  │  (POST)        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘   │
│       └─────────────┴─────────────┴────────────────┘            │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            ML Model (fraud_model.pkl)                   │    │
│  │   Random Forest · StandardScaler · Label Encoders       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ▲                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │      Simulation Engine (Background Thread)              │    │
│  │   Generates transactions every 2-4s · Scores via model  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- Python 3.10 or later
- pip (Python package manager)

### Steps

```bash
# 1. Clone or navigate to the project
cd fraud-detection

# 2. (Optional) Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate synthetic training data
python generate_data.py

# 5. Train the ML model
python train_model.py

# 6. Start the application
python app.py
```

The dashboard will be available at **http://127.0.0.1:5000**

---

## 💡 Usage

### Running the Dashboard

```bash
python app.py
```

On startup the server will:
1. Load the trained model and preprocessing artifacts
2. Seed 30 initial transactions into memory
3. Start a background thread that generates new transactions every 2–4 seconds
4. Serve the dashboard at `http://127.0.0.1:5000`

### Re-Training the Model

If you modify `generate_data.py` or want to retrain:

```bash
python generate_data.py   # Regenerate dataset
python train_model.py     # Retrain & save model
python app.py             # Restart server
```

---

## 📡 API Reference

### `GET /api/stats`

Returns global KPIs and model performance metrics.

```json
{
  "total_transactions": 142,
  "flagged_transactions": 8,
  "fraud_rate": 5.63,
  "model_accuracy": 94.3,
  "model_precision": 87.5,
  "model_recall": 84.2,
  "model_f1": 85.8,
  "model_roc_auc": 96.1,
  "total_amount": 185420.55,
  "blocked_amount": 42300.10
}
```

### `GET /api/transactions?limit=50`

Returns the most recent transactions with AI risk scores.

### `GET /api/alerts?limit=20`

Returns high-risk transaction alerts with status (`pending` / `investigated` / `dismissed`).

### `POST /api/alerts/<alert_id>/action`

Update an alert's status.

```json
{ "action": "investigate" }
```

### `POST /api/predict`

Score a custom transaction against the model.

**Request:**
```json
{
  "amount": 9500,
  "category": "wire_transfer",
  "country": "Nigeria",
  "hour": 3,
  "day": 6
}
```

**Response:**
```json
{
  "risk_score": 87,
  "fraud_probability": 0.8724,
  "risk_level": "critical",
  "recommendation": "BLOCK"
}
```

### `GET /api/risk-distribution`

Returns transaction counts by risk level (`low`, `medium`, `high`, `critical`).

### `GET /api/category-stats`

Returns per-category aggregates (total count, flagged count, total amount).

---

## 🧠 Machine Learning Pipeline

### Data Generation (`generate_data.py`)

- **10,000 synthetic transactions** with realistic distributions
- **14 merchant categories** with category-appropriate amount ranges
- **15 global cities** across multiple countries
- **Rule-based fraud labeling** (~5% fraud rate) using indicators such as:
  - High amounts (> $3,000) during odd hours (12 AM – 5 AM)
  - Rapid transaction velocity (> 5 transactions/hour)
  - High-risk categories (cryptocurrency, gambling, wire transfer)
  - Large international purchases
  - New accounts (< 30 days)

### Feature Engineering (`train_model.py`)

| # | Feature | Type | Description |
|---|---|---|---|
| 1 | `amount` | Numeric | Transaction amount in USD |
| 2 | `amount_log` | Numeric | Log-transformed amount |
| 3 | `hour_of_day` | Numeric | Hour (0–23) |
| 4 | `day_of_week` | Numeric | Day (0=Mon, 6=Sun) |
| 5 | `is_international` | Binary | International transaction flag |
| 6 | `customer_age` | Numeric | Customer age |
| 7 | `account_age_days` | Numeric | Days since account creation |
| 8 | `distance_from_home` | Numeric | Distance from customer's home |
| 9 | `num_transactions_last_hour` | Numeric | Velocity indicator |
| 10 | `avg_amount_last_24h` | Numeric | Spending pattern baseline |
| 11 | `merchant_category_enc` | Encoded | Label-encoded category |
| 12 | `transaction_type_enc` | Encoded | Label-encoded transaction type |
| 13 | `country_enc` | Encoded | Label-encoded country |
| 14 | `is_night` | Binary | Night-time flag (12 AM – 5 AM) |
| 15 | `is_weekend` | Binary | Weekend flag |
| 16 | `high_risk_category` | Binary | Crypto / gambling / wire transfer |
| 17 | `amount_to_avg_ratio` | Numeric | Amount vs. 24h average ratio |
| 18 | `new_account` | Binary | Account age < 30 days |

### Model Configuration

```python
RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
```

### Performance (Test Set — 20% Holdout)

| Metric | Score |
|---|---|
| **Accuracy** | 94.3% |
| **Precision** | ~87% |
| **Recall** | ~84% |
| **F1 Score** | ~85% |
| **ROC AUC** | ~96% |

---

## 🖥️ Dashboard

### Sections

| Tab | Contents |
|---|---|
| **Dashboard** | KPI cards, transaction volume timeline, risk donut chart, live feed, alert sidebar |
| **Transactions** | Full transaction log with risk-level filter dropdown |
| **Alerts** | Alert cards with severity badges, investigate/dismiss actions |
| **Analytics** | Category bar chart, amount distribution, hourly risk pattern, geographic polar chart |
| **AI Model** | Animated metric rings (Accuracy, Precision, Recall, F1, AUC) + prediction test form |

### Design System

- **Theme:** Dark mode with deep navy (#0a0e1a) background
- **Accents:** Cyan (#00d4ff), Magenta (#ff006e), Emerald (#00e676), Amber (#ffab00)
- **Cards:** Glassmorphism with backdrop blur and subtle borders
- **Typography:** Inter (Google Fonts) with clear weight hierarchy
- **Animations:** Pulse on alerts, smooth counter animation, hover lifts, row slide-in

---

## 📁 Project Structure

```
fraud-detection/
│
├── generate_data.py          # Synthetic dataset generator
├── train_model.py            # ML model training pipeline
├── app.py                    # Flask application & REST API
├── requirements.txt          # Python dependencies
├── README.md                 # This file
│
├── data/
│   └── transactions.csv      # Generated training dataset (10,000 rows)
│
├── models/
│   ├── fraud_model.pkl       # Trained Random Forest model
│   ├── scaler.pkl            # StandardScaler instance
│   ├── le_category.pkl       # Category label encoder
│   ├── le_txn_type.pkl       # Transaction type label encoder
│   ├── le_country.pkl        # Country label encoder
│   ├── feature_cols.pkl      # Feature column order
│   └── metrics.pkl           # Model evaluation metrics
│
├── templates/
│   └── index.html            # Dashboard HTML template
│
└── static/
    ├── styles.css            # Dark-mode glassmorphism stylesheet
    └── script.js             # Frontend application logic
```

---

## ⚙️ Configuration

Key parameters can be adjusted in the source files:

| Parameter | File | Default | Description |
|---|---|---|---|
| `NUM_TRANSACTIONS` | `generate_data.py` | 10,000 | Training dataset size |
| `FRAUD_RATE` | `generate_data.py` | 0.05 | Target fraud ratio |
| `n_estimators` | `train_model.py` | 200 | Number of trees in the forest |
| `max_depth` | `train_model.py` | 15 | Max tree depth |
| `test_size` | `train_model.py` | 0.2 | Train/test split ratio |
| Simulation interval | `app.py` | 2–4 sec | Time between generated transactions |
| Server port | `app.py` | 5000 | Flask server port |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Add docstrings to new functions
- Update this README if adding new features or API endpoints
- Test model changes by verifying metrics don't regress

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using Python, scikit-learn & Flask
</p>
