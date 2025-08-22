import type { ComponentType } from 'react';
export interface LazyLoadedModule<T = unknown> {
    default: ComponentType<T>;
    [key: string]: unknown;
}
export interface LazyComponentPropsMap {
    'astrology-chart': unknown;
    'frequency-visualizer': unknown;
    'transit-chart': unknown;
    'synastry-chart': unknown;
    'biofeedback-chart': unknown;
    'chart-modal': unknown;
    'settings-modal': unknown;
    'frequency-player-modal': unknown;
    'profile-modal': unknown;
    'share-modal': unknown;
    'advanced-form': unknown;
    'frequency-form': unknown;
    'birth-data-form': unknown;
    'analytics-panel': unknown;
    'report-generator': unknown;
    'export-tools': unknown;
    'ephemeris-calculator': unknown;
    'gene-keys-calculator': unknown;
    'frequency-calculator': unknown;
}
export type ComponentRegistryKeys = keyof LazyComponentPropsMap;
//# sourceMappingURL=component-registry.d.ts.map