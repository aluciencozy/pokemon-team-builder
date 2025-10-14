from fastapi import FastAPI
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup event: Application is starting...")
    # create_db_and_tables()
    yield
    print("Shutdown event: Application is closing.")


app = FastAPI(lifespan=lifespan)


# Include routers for later
# app.include_router(auth.router)
# app.include_router(teams.router)


# Confirm the API is running
@app.get("/")
def read_root():
    return {"message": "Welcome to the Pokémon Team Builder API!"}
