import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.mnda_chat import router as mnda_chat_router

load_dotenv()

DB_PATH = Path(os.environ.get("PRELEGAL_DB_PATH", "data/prelegal.db"))
FRONTEND_DIST = Path(os.environ.get("PRELEGAL_FRONTEND_DIST", "static"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(DB_PATH)
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(mnda_chat_router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
