from sqlmodel import Field, SQLModel, Relationship
from pydantic import BaseModel, EmailStr


# --- TOKEN MODELS ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


# --- USER MODELS ---
class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    email: EmailStr = Field(unique=True, index=True)


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    teams: list["Team"] = Relationship(back_populates="owner")


class UserCreate(UserBase):
    password: str


class UserPublic(UserBase):
    id: int


class UserPublicWithTeams(UserPublic):
    teams: list["TeamPublic"] = []


# --- POKEMON MODELS ---
class PokemonBase(SQLModel):
    name: str
    # can add other info later, like moves, abilities, items, etc.


class Pokemon(PokemonBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_id: int | None = Field(default=None, foreign_key="team.id")
    team: "Team | None" = Relationship(back_populates="pokemon")


class PokemonCreate(PokemonBase):
    pass


class PokemonPublic(PokemonBase):
    id: int


# --- TEAM MODELS ---
class TeamBase(SQLModel):
    name: str


class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id")
    owner: User | None = Relationship(back_populates="teams")
    pokemon: list[Pokemon] = Relationship(back_populates="team")


class TeamCreate(TeamBase):
    pokemon: list[PokemonCreate]


class TeamPublic(TeamBase):
    id: int
    owner_id: int


class TeamPublicWithPokemon(TeamPublic):
    pokemon: list[PokemonPublic]
