# @cosmichub/types Changelog

## Unreleased

### Added

- Validation in `parseTextBirthData` (format checking, calendar validation, leap year support, trimming)
- Edge case test coverage (in Astro app test suite)
- `safeParseTextBirthData` non-throwing helper returning discriminated union

### Changed

- Parsing now throws descriptive errors instead of silently producing invalid data

### Notes

- Downstream consumers relying on permissive parsing should migrate to `safeParseTextBirthData` or wrap calls in try/catch.
