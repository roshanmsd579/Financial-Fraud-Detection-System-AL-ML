"""
Synthetic Financial Transaction Data Generator
Generates ~10,000 realistic transactions with fraud labels (~5% fraud rate).
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

np.random.seed(42)

NUM_TRANSACTIONS = 10000
FRAUD_RATE = 0.05

# Merchant categories
CATEGORIES = [
    'grocery', 'electronics', 'restaurant', 'gas_station', 'online_shopping',
    'travel', 'entertainment', 'healthcare', 'clothing', 'utilities',
    'atm_withdrawal', 'wire_transfer', 'cryptocurrency', 'gambling'
]

TRANSACTION_TYPES = ['purchase', 'withdrawal', 'transfer', 'payment', 'refund']

CITIES = [
    ('New York', 'USA'), ('London', 'UK'), ('Tokyo', 'Japan'),
    ('Mumbai', 'India'), ('Lagos', 'Nigeria'), ('São Paulo', 'Brazil'),
    ('Berlin', 'Germany'), ('Sydney', 'Australia'), ('Dubai', 'UAE'),
    ('Moscow', 'Russia'), ('Toronto', 'Canada'), ('Paris', 'France'),
    ('Seoul', 'South Korea'), ('Shanghai', 'China'), ('Mexico City', 'Mexico')
]


def generate_transactions():
    print("🏦 Generating synthetic financial transaction data...")

    data = {
        'transaction_id': [f'TXN-{i:06d}' for i in range(NUM_TRANSACTIONS)],
        'timestamp': [],
        'amount': [],
        'merchant_category': [],
        'transaction_type': [],
        'hour_of_day': [],
        'day_of_week': [],
        'is_international': [],
        'customer_age': [],
        'account_age_days': [],
        'distance_from_home': [],
        'city': [],
        'country': [],
        'num_transactions_last_hour': [],
        'avg_amount_last_24h': [],
        'is_fraud': []
    }

    base_date = datetime(2026, 1, 1)

    for i in range(NUM_TRANSACTIONS):
        # Timestamp
        ts = base_date + timedelta(
            days=np.random.randint(0, 60),
            hours=np.random.randint(0, 24),
            minutes=np.random.randint(0, 60),
            seconds=np.random.randint(0, 60)
        )
        data['timestamp'].append(ts.strftime('%Y-%m-%d %H:%M:%S'))

        hour = ts.hour
        data['hour_of_day'].append(hour)
        data['day_of_week'].append(ts.weekday())

        # Customer demographics
        age = int(np.clip(np.random.normal(38, 14), 18, 85))
        data['customer_age'].append(age)
        data['account_age_days'].append(np.random.randint(1, 3650))

        # Transaction details
        category = np.random.choice(CATEGORIES, p=[
            0.15, 0.10, 0.12, 0.08, 0.15,
            0.05, 0.06, 0.05, 0.08, 0.04,
            0.04, 0.03, 0.02, 0.03
        ])
        data['merchant_category'].append(category)

        txn_type = np.random.choice(TRANSACTION_TYPES, p=[0.45, 0.15, 0.15, 0.15, 0.10])
        data['transaction_type'].append(txn_type)

        # Amount based on category
        amount_map = {
            'grocery': (15, 200), 'electronics': (50, 2500), 'restaurant': (10, 150),
            'gas_station': (20, 100), 'online_shopping': (5, 1500), 'travel': (100, 5000),
            'entertainment': (10, 300), 'healthcare': (20, 3000), 'clothing': (20, 500),
            'utilities': (30, 300), 'atm_withdrawal': (20, 1000), 'wire_transfer': (100, 10000),
            'cryptocurrency': (50, 15000), 'gambling': (10, 5000)
        }
        low, high = amount_map[category]
        amount = round(np.random.lognormal(np.log((low + high) / 3), 0.7), 2)
        amount = min(amount, high * 3)
        data['amount'].append(amount)

        # Location
        city, country = CITIES[np.random.randint(0, len(CITIES))]
        data['city'].append(city)
        data['country'].append(country)
        data['is_international'].append(1 if country != 'USA' else 0)
        data['distance_from_home'].append(round(np.random.exponential(150), 1))

        # Activity patterns
        data['num_transactions_last_hour'].append(np.random.poisson(2))
        data['avg_amount_last_24h'].append(round(np.random.lognormal(4, 1), 2))

        # Fraud labeling with realistic rules
        fraud_score = 0
        if amount > 3000:
            fraud_score += 3
        if amount > 8000:
            fraud_score += 4
        if hour >= 0 and hour <= 5:
            fraud_score += 2
        if category in ['cryptocurrency', 'gambling', 'wire_transfer']:
            fraud_score += 2
        if data['num_transactions_last_hour'][-1] > 5:
            fraud_score += 3
        if data['distance_from_home'][-1] > 500:
            fraud_score += 2
        if data['account_age_days'][-1] < 30:
            fraud_score += 2
        if data['is_international'][-1] and amount > 1000:
            fraud_score += 2

        # Probability of fraud based on score
        fraud_prob = min(fraud_score / 20, 0.85)
        fraud_prob = max(fraud_prob, 0.005)
        is_fraud = 1 if np.random.random() < fraud_prob else 0
        data['is_fraud'].append(is_fraud)

    df = pd.DataFrame(data)

    # Ensure ~5% fraud rate overall by adjusting
    current_fraud_rate = df['is_fraud'].mean()
    if current_fraud_rate > FRAUD_RATE * 1.5:
        fraud_indices = df[df['is_fraud'] == 1].index
        keep_n = int(FRAUD_RATE * NUM_TRANSACTIONS)
        drop_indices = np.random.choice(fraud_indices, size=len(fraud_indices) - keep_n, replace=False)
        df.loc[drop_indices, 'is_fraud'] = 0

    os.makedirs('data', exist_ok=True)
    df.to_csv('data/transactions.csv', index=False)

    fraud_count = df['is_fraud'].sum()
    print(f"✅ Generated {len(df)} transactions")
    print(f"   Fraudulent: {fraud_count} ({fraud_count/len(df)*100:.1f}%)")
    print(f"   Legitimate: {len(df) - fraud_count} ({(len(df)-fraud_count)/len(df)*100:.1f}%)")
    print(f"   Saved to data/transactions.csv")


if __name__ == '__main__':
    generate_transactions()
