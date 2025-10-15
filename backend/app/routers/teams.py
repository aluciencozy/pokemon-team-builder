from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.schemas import TeamCreate, TeamPublic, Team

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[TeamPublic])
async def get_teams(session: SessionDep, team: TeamCreate):
    # return session.exec(select(Team)).all
    pass


@router.get("/{team_id}")
async def get_team(team_id: int):
    pass


@router.post("/")
async def create_team():
    pass


@router.put("/{team_id}")
async def update_team(team_id: int):
    pass


@router.delete("/{team_id}")
async def delete_team(team_id: int):
    pass
