from fastapi import FastAPI

app = FastAPI(
    title="FinPilot API",
    description="Personal Finance Decision Support Agent",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "service": "FinPilot Backend",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "FinPilot Backend"
    }