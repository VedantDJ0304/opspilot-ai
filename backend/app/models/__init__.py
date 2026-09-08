"""Import all models so SQLAlchemy registers them with Base.metadata."""

from app.models.base import Base  # noqa: F401
from app.models.restaurant import Restaurant  # noqa: F401
from app.models.ingredient import Ingredient  # noqa: F401
from app.models.inventory import InventoryItem, InventoryTransaction  # noqa: F401
from app.models.menu import MenuItem, RecipeIngredient  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.agent import AgentEvent, AgentDecision  # noqa: F401
from app.models.risk import OperationalRisk  # noqa: F401
from app.models.notification import AppNotification  # noqa: F401
from app.models.settings import AgentSettings  # noqa: F401
from app.models.demo import DemoState, OperationalIncident  # noqa: F401
