"""
ML Model Training Pipeline
Trains a Random Forest classifier for fraud detection and saves the model.
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)


def load_and_prepare_data():
    print("📊 Loading transaction data...")
    df = pd.read_csv('data/transactions.csv')

    # Encode categorical features
    le_category = LabelEncoder()
    le_txn_type = LabelEncoder()
    le_country = LabelEncoder()

    df['merchant_category_enc'] = le_category.fit_transform(df['merchant_category'])
    df['transaction_type_enc'] = le_txn_type.fit_transform(df['transaction_type'])
    df['country_enc'] = le_country.fit_transform(df['country'])

    # Feature engineering
    df['amount_log'] = np.log1p(df['amount'])
    df['is_night'] = ((df['hour_of_day'] >= 0) & (df['hour_of_day'] <= 5)).astype(int)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['high_risk_category'] = df['merchant_category'].isin(
        ['cryptocurrency', 'gambling', 'wire_transfer']
    ).astype(int)
    df['amount_to_avg_ratio'] = df['amount'] / (df['avg_amount_last_24h'] + 1)
    df['new_account'] = (df['account_age_days'] < 30).astype(int)

    feature_cols = [
        'amount', 'amount_log', 'hour_of_day', 'day_of_week',
        'is_international', 'customer_age', 'account_age_days',
        'distance_from_home', 'num_transactions_last_hour',
        'avg_amount_last_24h', 'merchant_category_enc',
        'transaction_type_enc', 'country_enc',
        'is_night', 'is_weekend', 'high_risk_category',
        'amount_to_avg_ratio', 'new_account'
    ]

    X = df[feature_cols]
    y = df['is_fraud']

    return X, y, le_category, le_txn_type, le_country, feature_cols


def train_model():
    X, y, le_category, le_txn_type, le_country, feature_cols = load_and_prepare_data()

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("🤖 Training Random Forest classifier...")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)

    print("\n" + "=" * 50)
    print("📈 MODEL PERFORMANCE METRICS")
    print("=" * 50)
    print(f"  Accuracy:  {accuracy:.4f}  ({accuracy*100:.1f}%)")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  ROC AUC:   {roc_auc:.4f}")

    print(f"\n📋 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  TN: {cm[0][0]:5d}  |  FP: {cm[0][1]:5d}")
    print(f"  FN: {cm[1][0]:5d}  |  TP: {cm[1][1]:5d}")

    print(f"\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud']))

    # Feature importance
    importances = model.feature_importances_
    feature_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    print("🔍 Top 10 Feature Importances:")
    for feat, imp in feature_imp[:10]:
        bar = "█" * int(imp * 100)
        print(f"  {feat:30s} {imp:.4f} {bar}")

    # Save model artifacts
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/fraud_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(le_category, 'models/le_category.pkl')
    joblib.dump(le_txn_type, 'models/le_txn_type.pkl')
    joblib.dump(le_country, 'models/le_country.pkl')
    joblib.dump(feature_cols, 'models/feature_cols.pkl')

    # Save metrics for dashboard
    metrics = {
        'accuracy': round(accuracy, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1': round(f1, 4),
        'roc_auc': round(roc_auc, 4)
    }
    joblib.dump(metrics, 'models/metrics.pkl')

    print(f"\n✅ Model saved to models/fraud_model.pkl")
    print(f"✅ Scaler saved to models/scaler.pkl")
    print(f"✅ Metrics saved to models/metrics.pkl")

    return model, scaler, metrics


if __name__ == '__main__':
    train_model()
