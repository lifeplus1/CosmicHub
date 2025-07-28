FROM python:3.12.4

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    libssl-dev \
    libffi-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
COPY backend/ ./backend/
COPY main.py .
COPY cities.json .
COPY ephe/ ./ephe/

# Install and verify swisseph
RUN pip3 cache purge \
    && pip3 install --no-cache-dir --force-reinstall --no-binary pyswisseph pyswisseph==2.10.3.2 -v \
    && python3 -c "import swisseph; print('swisseph version:', swisseph.__version__)" \
    && pip3 install --no-cache-dir -r requirements.txt -v

EXPOSE $PORT

CMD uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120