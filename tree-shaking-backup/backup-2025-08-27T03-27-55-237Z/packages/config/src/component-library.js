import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Minimal stable component architecture exports.
 * Keep lean; extend via new modules (do not bloat this surface).
 */
import React, { createContext, useContext, useMemo, useRef, useCallback, memo } from 'react';
import { logger } from './utils/logger';
const defaultContext = { theme: 'cosmic', size: 'medium', variant: 'primary', disabled: false, readonly: false };
const Ctx = createContext(defaultContext);
export const ComponentProvider = ({ value = {}, children }) => {
    const merged = useMemo(() => ({ ...defaultContext, ...value }), [value]);
    return _jsx(Ctx.Provider, { value: merged, children: children });
};
export const useComponentContext = () => useContext(Ctx);
// -------------- Performance HOC --------------
export function withPerformanceTracking(Wrapped, name) {
    const Tracked = (props) => {
        const mountStart = useRef(performance.now());
        React.useEffect(() => {
            const ms = performance.now() - mountStart.current;
            logger.debug('component.mount', { component: name, ms });
            return () => { logger.debug('component.unmount', { component: name }); };
        }, []);
        const renderStart = performance.now();
        const element = _jsx(Wrapped, { ...props });
        logger.debug('component.render', { component: name, ms: performance.now() - renderStart });
        return element;
    };
    Tracked.displayName = `WithPerf(${Wrapped.displayName ?? Wrapped.name ?? 'Component'})`;
    return memo(Tracked);
}
export function createCompoundComponent(Base, name) {
    const Header = ({ children, className = '', ...rest }) => _jsx("div", { className: `compound-header ${className}`, ...rest, children: children });
    const Body = ({ children, className = '', ...rest }) => _jsx("div", { className: `compound-body ${className}`, ...rest, children: children });
    const Footer = ({ children, className = '', ...rest }) => _jsx("div", { className: `compound-footer ${className}`, ...rest, children: children });
    const Actions = ({ children, className = '', ...rest }) => _jsx("div", { className: `compound-actions ${className}`, ...rest, children: children });
    const PerfBase = withPerformanceTracking(Base, name);
    const Combined = PerfBase;
    Combined.Header = Header;
    Combined.Body = Body;
    Combined.Footer = Footer;
    Combined.Actions = Actions;
    return Combined;
}
export function createPolymorphicComponent(defaultTag, displayName) {
    // Define the inner component with proper generic typing
    const Inner = ({ as, ...rest }, ref) => {
        const Tag = as ?? defaultTag;
        return React.createElement(Tag, { ref, ...rest });
    };

    const Forward = React.forwardRef(Inner);
    Forward.displayName = displayName ?? `Poly(${String(defaultTag)})`;
    return Forward;
}
export class ComponentPerformanceAnalyzer {
    static instance = null;
    data = new Map();
    static getInstance() { return this.instance ?? (this.instance = new ComponentPerformanceAnalyzer()); }
    recordComponentMetric(component, metric, value) {
        const arr = this.data.get(component) ?? [];
        arr.push({ metric, value, t: performance.now() });
        if (arr.length > 200)
            arr.shift();
        this.data.set(component, arr);
    }
    getComponentAnalysis(component) {
        const rows = this.data.get(component) ?? [];
        const grouped = {};
        for (const r of rows)
            (grouped[r.metric] ||= []).push(r.value);
        const out = {};
        Object.entries(grouped).forEach(([metric, vals]) => {
            out[metric] = { count: vals.length, average: vals.reduce((a, b) => a + b, 0) / vals.length, min: Math.min(...vals), max: Math.max(...vals) };
        });
        return out;
    }
    generateRecommendations(component) {
        const a = this.getComponentAnalysis(component);
        const rec = [];
        if (a.ComponentRender?.average !== undefined && a.ComponentRender.average > 16)
            rec.push(`Optimize ${component} render time`);
        if (a.ComponentMount?.average !== undefined && a.ComponentMount.average > 100)
            rec.push(`${component} mount is slow`);
        return rec;
    }
}
export function useComponentAnalysis(name) {
    const analyzer = useMemo(() => ComponentPerformanceAnalyzer.getInstance(), []);
    const recordMetric = useCallback((metric, value) => analyzer.recordComponentMetric(name, metric, value), [analyzer, name]);
    return {
        recordMetric,
        getAnalysis: () => analyzer.getComponentAnalysis(name),
        getRecommendations: () => analyzer.generateRecommendations(name)
    };
}
export function createComponentFactory() {
    const reg = new Map();
    return {
        create(config) {
            const serialized = JSON.stringify(config);
            const Comp = () => _jsx("div", { "data-config": serialized });
            return Comp;
        },
        register(name, component) { reg.set(name, component); logger.debug('component.register', { name, size: reg.size }); },
        get: (name) => reg.get(name),
        list: () => [...reg.keys()]
    };
}
export function composeComponents(cfg) {
    const { components, strategy, fallback: Fallback } = cfg;
    const Composed = (props) => {
        if (strategy === 'sequential')
            return _jsx(_Fragment, { children: components.map((C, i) => _jsx(C, { ...props }, i)) });
        if (strategy === 'parallel')
            return _jsx("div", { className: "composition-parallel", children: components.map((C, i) => _jsx("div", { children: _jsx(C, { ...props }) }, i)) });
        if (strategy === 'conditional') {
            for (const C of components) {
                try {
                    return _jsx(C, { ...props });
                }
                catch { /* continue */ }
            }
            return Fallback ? _jsx(Fallback, { ...props }) : null;
        }
        return _jsx(_Fragment, { children: components.map((C, i) => _jsx(C, { ...props }, i)) });
    };
    Composed.displayName = 'ComposedComponents';
    return Composed;
}
    if (strategy.custom)
        return memo(Component, strategy.custom);
    if (strategy.deep === true)
        return memo(Component, (a, b) => JSON.stringify(a) === JSON.stringify(b));
    return memo(Component);
}
//# sourceMappingURL=component-library.js.map
