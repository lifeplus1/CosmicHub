import http from 'k6/http';
import { check, sleep, Trend } from 'k6';

export const options = {
  scenarios: {
    baseline: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1200'],
  },
};

const calcTrend = new Trend('calculate_latency');

export default function () {
  const payload = JSON.stringify({
    year: 1990,
    month: 6,
    day: 15,
    hour: 10,
    minute: 30,
    city: 'London',
    timezone: 'Europe/London',
  });
  const res = http.post(`${__ENV.BASE_URL || 'http://localhost:8000'}/calculate`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  calcTrend.add(res.timings.duration);
  check(res, {
    'status 200': (r) => r.status === 200,
    'has planets': (r) => !!r.json('planets'),
  });
  sleep(1);
}
