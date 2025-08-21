// Temporary migration wrapper: re-export shared helpers from config package.
// TODO: Remove this file after two green cycles using direct imports from '@cosmichub/config/api-result'.
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
  mapFailure
} from '@cosmichub/config';
export type { ApiResult, ApiSuccess, ApiFailure } from '@cosmichub/config';
