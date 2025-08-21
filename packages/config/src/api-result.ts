// Stable re-export surface for ApiResult helpers (import via @cosmichub/config/api-result)
export {
  ok,
  fail,
  toFailure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  mapResult,
  mapSuccess,
  mapFailure,
  type ApiResult,
  type ApiSuccess,
  type ApiFailure
} from './utils/api/result';
