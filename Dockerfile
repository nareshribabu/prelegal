FROM node:24-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/app ./app
RUN uv sync --frozen --no-dev
COPY --from=frontend-build /frontend/out ./static

ENV PRELEGAL_DB_PATH=/app/data/prelegal.db
ENV PRELEGAL_FRONTEND_DIST=/app/static

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
