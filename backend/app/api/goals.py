from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.goal import Goal

router = APIRouter(
    prefix="/api/goals",
    tags=["Goals"]
)


@router.post("/")
def create_goal(
    name: str,
    goal_type: str,
    target_amount: float,
    current_amount: float = 0,
    deadline: str = None,
    db: Session = Depends(get_db)
):
    if target_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Target amount must be greater than zero."
        )

    if current_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot be negative."
        )

    if current_amount > target_amount:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot exceed target amount."
        )

    if deadline:
        try:
            datetime.strptime(deadline, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Deadline must be in YYYY-MM-DD format."
            )

    goal = Goal(
        name=name,
        goal_type=goal_type,
        target_amount=target_amount,
        current_amount=current_amount,
        deadline=deadline
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return {
        "status": "created",
        "message": "Savings goal created successfully.",
        "goal": {
            "id": goal.id,
            "name": goal.name,
            "goal_type": goal.goal_type,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "deadline": goal.deadline
        }
    }


@router.get("/")
def get_goals(
    db: Session = Depends(get_db)
):
    goals = (
        db.query(Goal)
        .order_by(Goal.id.desc())
        .all()
    )

    result = []

    for goal in goals:
        target = float(goal.target_amount or 0)
        current = float(goal.current_amount or 0)

        remaining = max(target - current, 0)

        progress = 0

        if target > 0:
            progress = (current / target) * 100

        progress = min(progress, 100)

        status = "In Progress"

        if current >= target:
            status = "Completed"
        elif progress >= 75:
            status = "Almost There"

        result.append({
            "id": goal.id,
            "name": goal.name,
            "goal_type": goal.goal_type,
            "target_amount": round(target, 2),
            "current_amount": round(current, 2),
            "remaining": round(remaining, 2),
            "progress_percentage": round(progress, 2),
            "deadline": goal.deadline,
            "status": status
        })

    return {
        "count": len(result),
        "goals": result
    }


@router.put("/{goal_id}")
def update_goal(
    goal_id: int,
    current_amount: float,
    db: Session = Depends(get_db)
):
    if current_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot be negative."
        )

    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id)
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    if current_amount > goal.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot exceed target amount."
        )

    goal.current_amount = current_amount

    db.commit()
    db.refresh(goal)

    return {
        "status": "updated",
        "message": "Savings goal updated successfully.",
        "goal": {
            "id": goal.id,
            "name": goal.name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "deadline": goal.deadline
        }
    }


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db)
):
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id)
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found."
        )

    db.delete(goal)
    db.commit()

    return {
        "status": "success",
        "message": "Savings goal deleted successfully."
    }