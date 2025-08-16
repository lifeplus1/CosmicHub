import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const payload = JSON.stringify({
    year: 1990, month: 6, day: 15, hour: 10, minute: 30, city: 'London', timezone: 'Europe/London'
  });
  const res = http.post(`${__ENV.BASE_URL || 'http://localhost:8000'}/calculate`, payload, { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'status 200': r => r.status === 200 });
  sleep(0.3);
}
