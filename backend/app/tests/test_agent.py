"""
Tests for LangGraph agent cycle, autonomous actions, and demo runner.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.agent.graph import execute_agent_workflow
from app.agent.decisions import evaluate_deterministic_decision


@pytest.mark.asyncio
async def test_langgraph_agent_workflow():
    """Verify the 6-stage LangGraph workflow executes cleanly and returns structured results."""
    await init_db()
    async with AsyncSessionLocal() as session:
        result = await execute_agent_workflow(
            session=session,
            trigger="Pytest test trigger",
        )
        assert result["status"] == "COMPLETED"
        assert "observed" in result
        assert "analysis" in result
        assert "decision" in result
        assert "action" in result
        assert "confidence" in result
        assert result["durationMs"] >= 0


@pytest.mark.asyncio
async def test_agent_run_endpoint():
    """Verify POST /api/agent/run executes agent and returns updated state."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/agent/run", json={"trigger": "Routine sweep test"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "state" in data
        assert "result" in data


@pytest.mark.asyncio
async def test_demo_scenario_execution():
    """Verify POST /api/agent/demo runs full autonomous mitigation scenario."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/agent/demo")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["state"]["demoState"]["currentStep"] == 6

        # Confirm paneer menu items were marked LIMITED
        menu = data["state"]["menuItems"]
        pbm = next((m for m in menu if m["id"] == "menu-pbm"), None)
        assert pbm is not None
        assert pbm["availabilityStatus"] == "LIMITED"


@pytest.mark.asyncio
async def test_deterministic_decision_fallback():
    """Verify deterministic fallback logic generates safe, structured operational decisions."""
    mock_risks = [
        {
            "riskLevel": "CRITICAL",
            "ingredientId": "ing-paneer",
            "ingredientName": "Paneer (Cottage Cheese)",
            "currentStock": 2.1,
            "unit": "kg",
            "runoutMinutes": 45,
            "consumptionRate": 1.6,
            "normalRate": 0.8,
        }
    ]
    mock_menu = [
        {"id": "menu-pbm", "name": "Paneer Butter Masala", "availabilityStatus": "AVAILABLE"},
        {"id": "menu-pt", "name": "Paneer Tikka", "availabilityStatus": "AVAILABLE"},
    ]
    permissions = {"limitMenuItems": True, "restoreMenuItems": True}

    decision = evaluate_deterministic_decision(
        active_risks=mock_risks,
        inventory=[],
        menu_items=mock_menu,
        permissions=permissions,
    )
    assert decision.recommended_action == "LIMIT_MENU_ITEM"
    assert decision.severity == "CRITICAL"
    assert len(decision.target_menu_item_ids) > 0
    assert "Paneer" in decision.decision_title
