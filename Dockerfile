FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
COPY firebase-adminsdk.json /app/firebase-adminsdk.json
COPY ephe /app/ephe
ENV FIREBASE_CREDENTIALS_PATH=/app/firebase-adminsdk.json
ENV API_KEY=c3a579e58484f1eb21bfc96966df9a25
ENV EPHE_PATH=/app/ephe
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]