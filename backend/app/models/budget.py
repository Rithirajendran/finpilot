from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)