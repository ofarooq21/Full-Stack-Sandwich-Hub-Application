from .orders import router as orders_router
from .order_details import router as order_details_router
from .sandwiches import router as sandwiches_router
from .payments import router as payments_router
from .reviews import router as reviews_router
from .promocodes import router as promocodes_router

def load_routes(app):
    app.include_router(orders_router)
    app.include_router(order_details_router)
    app.include_router(sandwiches_router)
    app.include_router(payments_router)
    app.include_router(reviews_router)
    app.include_router(promocodes_router)
