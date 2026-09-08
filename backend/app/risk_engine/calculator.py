"""
OpsPilot AI — Deterministic Calculator Functions

MANDATE: These functions perform pure arithmetic. The LLM is NEVER
asked to calculate stock, runout times, or risk levels.
"""

from typing import Literal
from app.risk_engine.rules import THRESHOLDS, WARNING_RATE_RATIO, CRITICAL_RATE_RATIO, LOW_RATE_RATIO, LOW_RUNOUT_HOURS

RiskLevel = Literal["NORMAL", "LOW", "WARNING", "CRITICAL"]


def calculate_runout_minutes(estimated_stock: float, consumption_rate_per_hour: float) -> int:
    """
    Compute estimated inventory runout time in minutes.
    Formula: (stock / rate) * 60
    """
    if consumption_rate_per_hour <= 0:
        return 999
    if estimated_stock <= 0:
        return 0
    hours = estimated_stock / consumption_rate_per_hour
    return max(0, round(hours * 60))


def evaluate_ingredient_risk(
    estimated_stock: float,
    estimated_runout_minutes: int,
    consumption_rate_per_hour: float,
    normal_rate_per_hour: float,
    min_threshold: float,
    ingredient_name: str,
    sensitivity: str = "balanced",
) -> tuple[RiskLevel, str]:
    """
    Evaluate the risk level for a single ingredient deterministically.

    Returns:
        (risk_level, message) tuple
    """
    thresholds = THRESHOLDS.get(sensitivity, THRESHOLDS["balanced"])
    critical_minutes = thresholds["critical_minutes"]
    warning_minutes = thresholds["warning_minutes"]

    rate_ratio = (
        consumption_rate_per_hour / normal_rate_per_hour
        if normal_rate_per_hour > 0
        else 1.0
    )
    is_below_min = estimated_stock < min_threshold
    runout = estimated_runout_minutes

    # ── CRITICAL ──────────────────────────────────────────────────────────────
    if runout <= critical_minutes or (is_below_min and rate_ratio >= CRITICAL_RATE_RATIO):
        return (
            "CRITICAL",
            f"{ingredient_name} may run out in approximately {runout} minutes. "
            f"Consumption rate is {rate_ratio:.1f}× normal.",
        )

    # ── WARNING ───────────────────────────────────────────────────────────────
    if runout <= warning_minutes or rate_ratio >= WARNING_RATE_RATIO or is_below_min:
        h, m = divmod(runout, 60)
        return (
            "WARNING",
            f"{ingredient_name} consumption elevated ({rate_ratio:.1f}× baseline). "
            f"Estimated runout in {h}h {m}m.",
        )

    # ── LOW ───────────────────────────────────────────────────────────────────
    if runout <= LOW_RUNOUT_HOURS * 60 or rate_ratio >= LOW_RATE_RATIO:
        return (
            "LOW",
            f"{ingredient_name} stock stable but consumption mildly active ({rate_ratio:.1f}× baseline).",
        )

    # ── NORMAL ────────────────────────────────────────────────────────────────
    return (
        "NORMAL",
        f"{ingredient_name} inventory healthy. Adequate stock for current operations.",
    )


def forecast_stock(
    current_stock: float,
    consumption_rate_per_hour: float,
    hours_ahead: float = 4.0,
) -> float:
    """Project stock level N hours from now at current consumption rate."""
    projected = current_stock - (consumption_rate_per_hour * hours_ahead)
    return max(0.0, round(projected, 3))


def calculate_demand_anomaly_ratio(
    consumption_rate_per_hour: float,
    normal_rate_per_hour: float,
) -> float:
    """Returns ratio of current consumption to normal rate. 1.0 = normal."""
    if normal_rate_per_hour <= 0:
        return 1.0
    return round(consumption_rate_per_hour / normal_rate_per_hour, 2)
