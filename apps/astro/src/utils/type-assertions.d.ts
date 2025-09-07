/**
 * Type assertion utilities to bridge backend/frontend type gaps
 * Following Type Bridge System principles for gradual migration
 * TODO: Remove these once backend types are fully aligned with frontend
 */
import { Planet, Aspect, House } from '@cosmichub/types';
export declare function isPlanetLike(obj: unknown): obj is PlanetLike;
export declare function isAspectLike(obj: unknown): obj is AspectLike;
export declare function isHouseLike(obj: unknown): obj is HouseLike;
/**
 * Type guard for planet-like objects
 */
interface PlanetLike {
    name?: unknown;
    position?: unknown;
    degree?: unknown;
    sign?: unknown;
    house?: unknown;
    retrograde?: unknown;
    speed?: unknown;
    dignity?: unknown;
    essential_dignity?: unknown;
    aspects?: unknown;
    element?: unknown;
    modality?: unknown;
    house_position?: unknown;
}
/**
 * Safely convert any planet-like object to a valid Planet
 * Provides defaults for required fields that might be missing from backend
 * @throws {Error} If input cannot be converted to a valid Planet
 */
export declare function assertPlanetType(obj: unknown): Planet;
/**
 * Type guard for aspect-like objects
 */
interface AspectLike {
    aspect_type?: unknown;
    type?: unknown;
    planet1?: unknown;
    point1?: unknown;
    planet2?: unknown;
    point2?: unknown;
    orb?: unknown;
    applying?: unknown;
    exact?: unknown;
    power?: unknown;
    aspect_angle?: unknown;
    separating?: unknown;
    mutual_reception?: unknown;
    dignity_interaction?: unknown;
    timing?: unknown;
}
/**
 * Safely convert any aspect-like object to a valid Aspect
 * @throws {Error} If input cannot be converted to a valid Aspect
 */
export declare function assertAspectType(obj: unknown): Aspect;
/**
 * Type guard for house-like objects
 */
interface HouseLike {
    house?: unknown;
    number?: unknown;
    cusp?: unknown;
    degree?: unknown;
    sign?: unknown;
    ruler?: unknown;
    modern_ruler?: unknown;
    size?: unknown;
    contains_planets?: unknown;
}
/**
 * Safely convert any house-like object to a valid House
 * @throws {Error} If input cannot be converted to a valid House
 */
export declare function assertHouseType(obj: unknown): House;
export {};
//# sourceMappingURL=type-assertions.d.ts.map