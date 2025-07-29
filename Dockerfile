FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
COPY backend/ephe /app/ephe
ENV API_KEY=c3a579e58484f1eb21bfc96966df9a25
ENV EPHE_PATH=/app/ephe