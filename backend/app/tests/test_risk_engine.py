"""
Tests for deterministic risk engine calculations.
"""

import pytest
from app.risk_engine.calculator import (
    calculate_runout_minutes,
    evaluate_ingredient_risk,
    forecast_stock,
    calculate_demand_anomaly_ratio,
)


def test_calculate_runout_minutes():
    """Verify runout time calculation: (stock / rate) * 60."""
    # 2.0 kg at 1.0 kg/hr = 120 minutes
    assert calculate_runout_minutes(2.0, 1.0) == 120
    # 2.1 kg at 1.6 kg/hr = ~79 minutes
    assert calculate_runout_minutes(2.1, 1.6) == 79
    # 0 stock = 0 minutes
    assert calculate_runout_minutes(0.0, 1.5) == 0
    # 0 rate = 999 (infinite / safe)
    assert calculate_runout_minutes(5.0, 0.0) == 999


def test_evaluate_ingredient_risk_critical():
    """Verify critical threshold triggers CRITICAL risk."""
    risk_level, message = evaluate_ingredient_risk(
        estimated_stock=2.1,
        estimated_runout_minutes=45,
        consumption_rate_per_hour=1.6,
        normal_rate_per_hour=0.8,
        min_threshold=3.0,
        ingredient_name="Paneer",
        sensitivity="balanced",
    )
    assert risk_level == "CRITICAL"
    assert "Paneer may run out" in message
    assert "2.0× normal" in message


def test_evaluate_ingredient_risk_normal():
    """Verify healthy stock triggers NORMAL status."""
    risk_level, message = evaluate_ingredient_risk(
        estimated_stock=15.0,
        estimated_runout_minutes=400,
        consumption_rate_per_hour=1.0,
        normal_rate_per_hour=1.0,
        min_threshold=3.0,
        ingredient_name="Rice",
        sensitivity="balanced",
    )
    assert risk_level == "NORMAL"
    assert "healthy" in message.lower()


def test_forecast_stock():
    """Verify stock projection: current - (rate * hours)."""
    projected = forecast_stock(current_stock=10.0, consumption_rate_per_hour=1.5, hours_ahead=2.0)
    assert projected == 7.0


def test_demand_anomaly_ratio():
    """Verify anomaly ratio computation."""
    assert calculate_demand_anomaly_ratio(1.6, 0.8) == 2.0
    assert calculate_demand_anomaly_ratio(0.8, 0.8) == 1.0
