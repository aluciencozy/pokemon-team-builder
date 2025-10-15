from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_teams():
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
