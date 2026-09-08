"""
OpsPilot AI — Risk Engine Rules & Thresholds
Deterministic risk assessment rules. No AI involved here.
"""

# Risk sensitivity thresholds in minutes
THRESHOLDS = {
    "conservative": {
        "critical_minutes": 45,
        "warning_minutes": 120,
    },
    "balanced": {
        "critical_minutes": 60,
        "warning_minutes": 180,
    },
    "aggressive": {
        "critical_minutes": 90,
        "warning_minutes": 240,
    },
}

# Rate ratio thresholds for warning/critical escalation
WARNING_RATE_RATIO = 1.4   # 40% above normal triggers WARNING
CRITICAL_RATE_RATIO = 1.5  # 50% above normal AND below min → CRITICAL
LOW_RATE_RATIO = 1.15      # 15% above normal triggers LOW

# Low runout boundary (hours)
LOW_RUNOUT_HOURS = 6
