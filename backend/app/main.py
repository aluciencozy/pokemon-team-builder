from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from routers import teams, auth
from database import create_db_and_tables

origins = [
    "http://localhost5173",
    # "https://pokemon-team-builder.vercel.app", tweak this later
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup event: Application is starting...")
    create_db_and_tables()
    yield
    print("Shutdown event: Application is closing.")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(teams.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Pokémon Team Builder API!"}
