FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
COPY ephe /app/ephe
ENV API_KEY=c3a579e58484f1eb21bfc96966df9a25
ENV EPHE_PATH=/app/ephe
ENV FIREBASE_CREDENTIALS_PATH=/app/firebase-adminsdk.json
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]