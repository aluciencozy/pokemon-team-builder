from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.database import SessionDep
from app.schemas import (
    TeamCreate,
    TeamPublic,
    Team,
    User,
    TeamPublicWithPokemon,
    Pokemon,
)
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[TeamPublic])
async def get_teams(
    current_user: Annotated[User, Depends(get_current_user)], session: SessionDep
):
    teams = session.exec(select(Team).where(Team.owner_id == current_user.id)).all()
    return teams


@router.get("/{team_id}", response_model=TeamPublicWithPokemon)
async def get_team(
    team_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    team = session.exec(
        select(Team).where(Team.id == team_id, Team.owner_id == current_user.id)
    ).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TeamPublic)
async def create_team(
    team_data: TeamCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    db_team = Team(name=team_data.name, owner_id=current_user.id)

    for pokemon_to_create in team_data.pokemon:
        db_pokemon = Pokemon.model_validate(pokemon_to_create)
        db_team.pokemon.append(db_pokemon)

    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team


@router.put("/{team_id}", response_model=TeamPublic)
async def update_team(
    team_id: int,
    updated_team: TeamCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    db_team = session.exec(
        select(Team).where(Team.id == team_id, Team.owner_id == current_user.id)
    ).first()

    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")

    db_team.name = updated_team.name
    for pokemon in db_team.pokemon:
        session.delete(pokemon)

    for pokemon_data in updated_team.pokemon:
        db_pokemon = Pokemon.model_validate(pokemon_data)
        db_team.pokemon.append(db_pokemon)

    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team


@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> dict:
    team_to_delete = session.exec(
        select(Team).where(Team.id == team_id, Team.owner_id == current_user.id)
    ).first()

    if not team_to_delete:
        raise HTTPException(status_code=404, detail="Team not found")

    session.delete(team_to_delete)
    session.commit()
    return {"ok": True}
