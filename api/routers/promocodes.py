from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import promocodes as controller
from ..schemas import promocodes as schema
from ..dependencies.database import get_db

router = APIRouter(
    tags=["PromoCodes"],
    prefix="/promocodes"
)

@router.post("/", response_model=schema.PromoCode)
def create(request: schema.PromoCodeCreate, db: Session = Depends(get_db)):
    return controller.create(db=db, request=request)

@router.get("/", response_model=list[schema.PromoCode])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

@router.get("/{item_id}", response_model=schema.PromoCode)
def read_one(item_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, item_id)

@router.put("/{item_id}", response_model=schema.PromoCode)
def update(item_id: int, request: schema.PromoCodeUpdate, db: Session = Depends(get_db)):
    return controller.update(db=db, item_id=item_id, request=request)

@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    return controller.delete(db=db, item_id=item_id)
