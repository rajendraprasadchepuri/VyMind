from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from backend.database_config import get_db
from backend.models import schemas, core
from backend.crud import base
from backend.auth import get_current_user
from backend.websockets import manager
import json

router = APIRouter(
    prefix="/restaurant",
    tags=["restaurant"],
)

# --- Tables ---

@router.get("/tables", response_model=List[schemas.RestaurantTable])
def read_tables(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return base.get_tables(db, account_id=current_user.account_id)

@router.post("/tables", response_model=schemas.RestaurantTable)
def create_table(
    table: schemas.RestaurantTableBase,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    table_create = schemas.RestaurantTableCreate(**table.model_dump(), account_id=current_user.account_id)
    return base.create_table(db, table_create)

@router.put("/tables/{table_id}/position")
def update_position(
    table_id: str,
    x: int,
    y: int,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    table = base.update_table_position(db, table_id, x, y, current_user.account_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

# --- Kitchen Orders ---

@router.post("/orders", response_model=schemas.KitchenOrder)
async def create_kitchen_order(
    order: schemas.KitchenOrderBase,
    table_id: str,
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    order_create = schemas.KitchenOrderCreate(
        **order.model_dump(), 
        table_id=table_id, 
        account_id=current_user.account_id
    )
    db_order = base.create_kitchen_order(db, order_create)
    
    # Broadcast to KDS
    await manager.broadcast(json.dumps({
        "type": "NEW_ORDER",
        "data": {
            "id": db_order.id,
            "table_id": db_order.table_id,
            "items": db_order.items_json,
            "status": db_order.status,
            "timestamp": str(db_order.created_at)
        }
    }))
    
    return db_order

@router.get("/orders/active", response_model=List[schemas.KitchenOrder])
def read_active_orders(
    db: Session = Depends(get_db),
    current_user: core.User = Depends(get_current_user)
):
    return base.get_active_orders(db, current_user.account_id)

# --- WebSockets ---

@router.websocket("/ws/kds/{account_id}")
async def websocket_endpoint(websocket: WebSocket, account_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages (e.g. status updates from KDS)
            await manager.broadcast(f"Message text was: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
