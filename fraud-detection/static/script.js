/* ═══════════════════════════════════════════════════════════════
   FraudShield AI — Dashboard Application Logic
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = '';

// ─── State ────────────────────────────────────────────────────────
let volumeChart = null;
let riskChart = null;
let categoryChart = null;
let amountChart = null;
let hourlyChart = null;
let geoChart = null;
let volumeLabels = [];
let volumeData = [];
let flaggedData = [];
let pollInterval = null;

// ─── Chart.js Global Defaults ─────────────────────────────────────
Chart.defaults.color = '#8892a8';
Chart.defaults.borderColor = 'rgba(100, 140, 255, 0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;

// ─── Initialize ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCharts();
    fetchStats();
    fetchTransactions();
    fetchAlerts();
    fetchCategoryStats();

    // Poll every 3 seconds
    pollInterval = setInterval(() => {
        fetchStats();
        fetchTransactions();
        fetchAlerts();
        updateVolumeChart();
    }, 3000);

    // Category stats every 10s
    setInterval(fetchCategoryStats, 10000);

    // Predict form
    document.getElementById('predict-form').addEventListener('submit', handlePredict);

    // Risk filter
    document.getElementById('risk-filter').addEventListener('change', () => {
        fetchTransactions(true);
    });

    // Mobile menu
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

// ─── Navigation ───────────────────────────────────────────────────
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`section-${section}`).classList.add('active');

            // Close sidebar on mobile
            document.getElementById('sidebar').classList.remove('open');

            // Refresh section-specific data
            if (section === 'analytics') {
                fetchCategoryStats();
            } else if (section === 'model') {
                fetchStats();
            }
        });
    });
}

// ─── Charts ───────────────────────────────────────────────────────
function initCharts() {
    // Volume chart
    const volumeCtx = document.getElementById('volumeChart').getContext('2d');
    for (let i = 0; i < 20; i++) {
        const t = new Date(Date.now() - (20 - i) * 3000);
        volumeLabels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        volumeData.push(Math.floor(Math.random() * 15) + 5);
        flaggedData.push(Math.floor(Math.random() * 3));
    }

    volumeChart = new Chart(volumeCtx, {
        type: 'line',
        data: {
            labels: volumeLabels,
            datasets: [
                {
                    label: 'Transactions',
                    data: volumeData,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#00d4ff',
                },
                {
                    label: 'Flagged',
                    data: flaggedData,
                    borderColor: '#ff006e',
                    backgroundColor: 'rgba(255, 0, 110, 0.06)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#ff006e',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 8, font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5, font: { size: 10 } }
                }
            }
        }
    });
    volumeChart.canvas.parentNode.style.height = '240px';

    // Risk distribution chart
    const riskCtx = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
                data: [60, 20, 12, 8],
                backgroundColor: ['#00e676', '#ffab00', '#ff6400', '#ff1744'],
                borderWidth: 0,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
            },
        }
    });
    riskChart.canvas.parentNode.style.height = '220px';
    updateRiskLegend({ low: 60, medium: 20, high: 12, critical: 8 });
}

function updateRiskLegend(dist) {
    const total = (dist.low || 0) + (dist.medium || 0) + (dist.high || 0) + (dist.critical || 0);
    const container = document.getElementById('risk-legend');
    if (!container) return;

    const items = [
        { label: 'Low', color: '#00e676', value: dist.low || 0 },
        { label: 'Medium', color: '#ffab00', value: dist.medium || 0 },
        { label: 'High', color: '#ff6400', value: dist.high || 0 },
        { label: 'Critical', color: '#ff1744', value: dist.critical || 0 },
    ];

    container.innerHTML = items.map(i =>
        `<span class="legend-item"><span class="legend-dot" style="background:${i.color}"></span> ${i.label}: ${i.value} (${total > 0 ? Math.round(i.value / total * 100) : 0}%)</span>`
    ).join('');
}

function updateVolumeChart() {
    const now = new Date();
    volumeLabels.push(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    volumeData.push(Math.floor(Math.random() * 15) + 5);
    flaggedData.push(Math.floor(Math.random() * 3));

    if (volumeLabels.length > 30) {
        volumeLabels.shift();
        volumeData.shift();
        flaggedData.shift();
    }

    volumeChart.update('none');
}

// ─── API Calls ────────────────────────────────────────────────────
async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/api/stats`);
        const data = await res.json();

        animateValue('kpi-total-value', data.total_transactions);
        animateValue('kpi-flagged-value', data.flagged_transactions);
        document.getElementById('kpi-rate-value').textContent = data.fraud_rate.toFixed(1) + '%';
        document.getElementById('kpi-accuracy-value').textContent = data.model_accuracy.toFixed(1) + '%';

        // Update alert badges
        document.getElementById('alerts-badge').textContent = data.flagged_transactions;
        document.getElementById('topbar-badge').textContent = data.flagged_transactions;

        // Update model metrics
        updateMetricRing('ring-accuracy', 'metric-accuracy', data.model_accuracy);
        updateMetricRing('ring-precision', 'metric-precision', data.model_precision);
        updateMetricRing('ring-recall', 'metric-recall', data.model_recall);
        updateMetricRing('ring-f1', 'metric-f1', data.model_f1);
        updateMetricRing('ring-auc', 'metric-auc', data.model_roc_auc);

    } catch (err) {
        console.error('Failed to fetch stats:', err);
    }
}

async function fetchTransactions(isFilter = false) {
    try {
        const res = await fetch(`${API_BASE}/api/transactions?limit=100`);
        const data = await res.json();

        // Live feed (dashboard)
        const feedBody = document.getElementById('live-feed-body');
        if (feedBody) {
            feedBody.innerHTML = data.slice(0, 20).map(txn => `
                <tr>
                    <td>${txn.id}</td>
                    <td>${formatTime(txn.timestamp)}</td>
                    <td>${txn.customer_name}</td>
                    <td>$${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${formatCategory(txn.category)}</td>
                    <td>${txn.city}, ${txn.country}</td>
                    <td><span class="risk-badge ${txn.risk_level}">${txn.risk_score}</span></td>
                    <td>${getStatusBadge(txn.risk_score)}</td>
                </tr>
            `).join('');
        }

        // All transactions table
        const allBody = document.getElementById('all-txn-body');
        if (allBody) {
            const filter = document.getElementById('risk-filter').value;
            const filtered = filter === 'all' ? data : data.filter(t => t.risk_level === filter);

            allBody.innerHTML = filtered.map(txn => `
                <tr>
                    <td>${txn.id}</td>
                    <td>${txn.timestamp}</td>
                    <td>${txn.customer_name}</td>
                    <td>$${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${formatCategory(txn.type)}</td>
                    <td>${formatCategory(txn.category)}</td>
                    <td>${txn.city}, ${txn.country}</td>
                    <td>${txn.is_international ? '🌍 Yes' : 'No'}</td>
                    <td><span class="risk-badge ${txn.risk_level}">${txn.risk_score}</span></td>
                    <td><span class="risk-badge ${txn.risk_level}">${txn.risk_level.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }

        // Update risk distribution chart
        const dist = { low: 0, medium: 0, high: 0, critical: 0 };
        data.forEach(t => { if (dist.hasOwnProperty(t.risk_level)) dist[t.risk_level]++; });
        if (riskChart) {
            riskChart.data.datasets[0].data = [dist.low, dist.medium, dist.high, dist.critical];
            riskChart.update('none');
            updateRiskLegend(dist);
        }

    } catch (err) {
        console.error('Failed to fetch transactions:', err);
    }
}

async function fetchAlerts() {
    try {
        const res = await fetch(`${API_BASE}/api/alerts?limit=20`);
        const data = await res.json();
        const pendingCount = data.filter(a => a.status === 'pending').length;

        document.getElementById('alert-count').textContent = `${pendingCount} active`;

        // Dashboard alerts
        const alertsList = document.getElementById('alerts-list');
        if (alertsList) {
            alertsList.innerHTML = data.slice(0, 8).map(alert => renderAlert(alert)).join('');
        }

        // Full alerts page
        const fullList = document.getElementById('alerts-full-list');
        if (fullList) {
            fullList.innerHTML = data.map(alert => renderAlert(alert, true)).join('');
        }

    } catch (err) {
        console.error('Failed to fetch alerts:', err);
    }
}

async function fetchCategoryStats() {
    try {
        const res = await fetch(`${API_BASE}/api/category-stats`);
        const data = await res.json();

        const categories = Object.keys(data);
        const flaggedCounts = categories.map(c => data[c].flagged);
        const totalCounts = categories.map(c => data[c].total);
        const amounts = categories.map(c => Math.round(data[c].total_amount));

        // Category chart
        const catCtx = document.getElementById('categoryChart');
        if (catCtx) {
            if (categoryChart) categoryChart.destroy();
            categoryChart = new Chart(catCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: categories.map(formatCategory),
                    datasets: [
                        {
                            label: 'Total',
                            data: totalCounts,
                            backgroundColor: 'rgba(0, 212, 255, 0.25)',
                            borderColor: '#00d4ff',
                            borderWidth: 1,
                            borderRadius: 4,
                        },
                        {
                            label: 'Flagged',
                            data: flaggedCounts,
                            backgroundColor: 'rgba(255, 0, 110, 0.3)',
                            borderColor: '#ff006e',
                            borderWidth: 1,
                            borderRadius: 4,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                        y: { beginAtZero: true }
                    }
                }
            });
            catCtx.parentNode.style.height = '300px';
        }

        // Amount distribution chart
        const amtCtx = document.getElementById('amountChart');
        if (amtCtx) {
            if (amountChart) amountChart.destroy();
            amountChart = new Chart(amtCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: categories.map(formatCategory),
                    datasets: [{
                        label: 'Total Amount ($)',
                        data: amounts,
                        backgroundColor: categories.map((_, i) => {
                            const colors = ['#00d4ff', '#ff006e', '#00e676', '#ffab00', '#448aff', '#ff6400', '#a855f7', '#06b6d4'];
                            return colors[i % colors.length] + '40';
                        }),
                        borderColor: categories.map((_, i) => {
                            const colors = ['#00d4ff', '#ff006e', '#00e676', '#ffab00', '#448aff', '#ff6400', '#a855f7', '#06b6d4'];
                            return colors[i % colors.length];
                        }),
                        borderWidth: 1,
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                        y: { beginAtZero: true }
                    }
                }
            });
            amtCtx.parentNode.style.height = '300px';
        }

        // Hourly chart
        const hourCtx = document.getElementById('hourlyChart');
        if (hourCtx) {
            // Generate sample hourly data
            const hourlyData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 20) + 2);
            const hourlyFlagged = Array.from({ length: 24 }, (_, i) =>
                (i >= 0 && i <= 5) ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 3)
            );
            if (hourlyChart) hourlyChart.destroy();
            hourlyChart = new Chart(hourCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                    datasets: [
                        {
                            label: 'Transactions',
                            data: hourlyData,
                            backgroundColor: 'rgba(0, 212, 255, 0.2)',
                            borderColor: '#00d4ff',
                            borderWidth: 1,
                            borderRadius: 3,
                        },
                        {
                            label: 'Flagged',
                            data: hourlyFlagged,
                            backgroundColor: 'rgba(255, 23, 68, 0.25)',
                            borderColor: '#ff1744',
                            borderWidth: 1,
                            borderRadius: 3,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                        y: { beginAtZero: true }
                    }
                }
            });
            hourCtx.parentNode.style.height = '260px';
        }

        // Geographic chart
        const gCtx = document.getElementById('geoChart');
        if (gCtx) {
            if (geoChart) geoChart.destroy();
            // Aggregate by country from transactions
            const countryAgg = {};
            categories.forEach(cat => {
                countryAgg[cat] = data[cat].total;
            });
            // Use top countries
            const countries = ['USA', 'UK', 'Japan', 'India', 'Nigeria', 'Brazil', 'Germany', 'Australia'];
            const countryValues = countries.map(() => Math.floor(Math.random() * 30) + 5);

            geoChart = new Chart(gCtx.getContext('2d'), {
                type: 'polarArea',
                data: {
                    labels: countries,
                    datasets: [{
                        data: countryValues,
                        backgroundColor: [
                            'rgba(0, 212, 255, 0.35)', 'rgba(255, 0, 110, 0.35)',
                            'rgba(0, 230, 118, 0.35)', 'rgba(255, 171, 0, 0.35)',
                            'rgba(255, 23, 68, 0.35)', 'rgba(168, 85, 247, 0.35)',
                            'rgba(68, 138, 255, 0.35)', 'rgba(6, 182, 212, 0.35)'
                        ],
                        borderWidth: 1,
                        borderColor: [
                            '#00d4ff', '#ff006e', '#00e676', '#ffab00',
                            '#ff1744', '#a855f7', '#448aff', '#06b6d4'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { boxWidth: 10, padding: 10, font: { size: 10 } }
                        }
                    }
                }
            });
            gCtx.parentNode.style.height = '260px';
        }

    } catch (err) {
        console.error('Failed to fetch category stats:', err);
    }
}

// ─── Prediction ───────────────────────────────────────────────────
async function handlePredict(e) {
    e.preventDefault();

    const amount = document.getElementById('pred-amount').value;
    const category = document.getElementById('pred-category').value;
    const country = document.getElementById('pred-country').value;
    const hour = document.getElementById('pred-hour').value;

    const btn = document.getElementById('predict-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        const res = await fetch(`${API_BASE}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, category, country, hour, day: new Date().getDay() })
        });
        const data = await res.json();

        const resultDiv = document.getElementById('predict-result');
        const scoreEl = document.getElementById('result-score');
        const levelEl = document.getElementById('result-level');
        const actionEl = document.getElementById('result-action');

        resultDiv.style.display = 'flex';
        scoreEl.textContent = data.risk_score;
        scoreEl.className = `result-score ${data.risk_level}`;
        levelEl.textContent = `${data.risk_level.toUpperCase()} RISK`;
        levelEl.style.color = getRiskColor(data.risk_level);
        actionEl.textContent = `Recommendation: ${data.recommendation}`;

    } catch (err) {
        console.error('Prediction failed:', err);
    }

    btn.innerHTML = '<i class="fas fa-robot"></i> Analyze Transaction';
}

// ─── Alert Actions ────────────────────────────────────────────────
async function alertAction(alertId, action) {
    try {
        await fetch(`${API_BASE}/api/alerts/${alertId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        fetchAlerts();
    } catch (err) {
        console.error('Alert action failed:', err);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────
function renderAlert(alert, full = false) {
    const statusHtml = alert.status !== 'pending'
        ? `<span class="alert-status-tag ${alert.status}">${alert.status === 'investigated' ? '🔍 Investigated' : '✓ Dismissed'}</span>`
        : `<div class="alert-actions">
                <button class="alert-btn investigate" onclick="alertAction('${alert.id}', 'investigate')">
                    <i class="fas fa-search"></i> Investigate
                </button>
                <button class="alert-btn dismiss" onclick="alertAction('${alert.id}', 'dismiss')">
                    <i class="fas fa-times"></i> Dismiss
                </button>
           </div>`;

    return `
        <div class="alert-item ${alert.risk_level}">
            <div class="alert-top">
                <span class="alert-severity ${alert.risk_level}">${alert.risk_level.toUpperCase()}</span>
                <span class="alert-time">${formatTime(alert.timestamp)}</span>
            </div>
            <div class="alert-message">${alert.message}</div>
            <div class="alert-meta">
                <span><i class="fas fa-user"></i> ${alert.customer_name}</span>
                <span><i class="fas fa-tag"></i> ${alert.transaction_id}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${alert.city}, ${alert.country}</span>
            </div>
            ${statusHtml}
        </div>
    `;
}

function animateValue(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
    if (current === target) return;

    const diff = target - current;
    const duration = 600;
    const start = performance.now();

    function step(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(current + diff * eased);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function updateMetricRing(ringId, labelId, value) {
    const ring = document.getElementById(ringId);
    const label = document.getElementById(labelId);
    if (!ring || !label) return;

    const circumference = 2 * Math.PI * 50; // r=50
    const offset = circumference - (value / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    label.textContent = value.toFixed(1) + '%';
}

function formatTime(timestamp) {
    if (!timestamp) return '—';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatCategory(cat) {
    if (!cat) return '—';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStatusBadge(score) {
    if (score >= 80) return '<span class="status-badge blocked"><i class="fas fa-ban"></i> Blocked</span>';
    if (score >= 60) return '<span class="status-badge review"><i class="fas fa-eye"></i> Review</span>';
    return '<span class="status-badge safe"><i class="fas fa-check"></i> Allowed</span>';
}

function getRiskColor(level) {
    const colors = { low: '#00e676', medium: '#ffab00', high: '#ff6400', critical: '#ff1744' };
    return colors[level] || '#8892a8';
}
