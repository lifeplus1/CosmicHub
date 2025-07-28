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

# Install and verify dependencies with debug logging
RUN echo "Starting dependency installation..." \
    && pip3 cache purge \
    && echo "Installing pyswisseph==2.10.3.2..." \
    && pip3 install --no-cache-dir --force-reinstall --no-binary pyswisseph pyswisseph==2.10.3.2 -v 2>&1 | tee /app/pip_install_swisseph.log \
    && echo "Verifying swisseph import..." \
    && python3 -c "import swisseph; print('swisseph version: ' + swisseph.__version__)" 2>&1 | tee /app/swisseph_verify.log \
    && echo "Installing requirements.txt..." \
    && pip3 install --no-cache-dir -r requirements.txt -v 2>&1 | tee /app/pip_install_requirements.log \
    && echo "Dependency installation complete."

EXPOSE $PORT

CMD echo "Starting Uvicorn..." && uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120 2>&1 | tee /app/uvicorn.log