import { Planet, House, Aspect, Asteroid, Angle } from '@cosmichub/types';
export interface ChartLike {
    planets?: unknown;
    houses?: unknown;
    aspects?: unknown;
    asteroids?: unknown;
    angles?: unknown;
    points?: unknown;
    [key: string]: unknown;
}
export declare function isChartLike(obj: unknown): obj is ChartLike;
export declare function hasChartContent(chart: ChartLike): boolean;
export declare const getAspectOrb: (aspectType: string, currentOrb?: number) => number;
export declare function normalizeChart(raw: ChartLike): {
    planets: Planet[];
    points: Planet[];
    asteroids: Asteroid[];
    angles: Angle[];
    houses: House[];
    aspects: Aspect[];
};
//# sourceMappingURL=normalizeChart.d.ts.map