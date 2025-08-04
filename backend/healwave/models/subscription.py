
from pydantic import BaseModel

class CheckoutSession(BaseModel):
    price_id: str