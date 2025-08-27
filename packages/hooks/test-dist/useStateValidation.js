/**
 * useStateValidation Hook - Comprehensive State Validation Management
 *
 * Provides enterprise-grade state validation with:
 * - Centralized validation logic for birth data, chart data, and user inputs
 * - Type guards with detailed error messages
 * - Validation caching to prevent redundant checks
 * - Progressive validation patterns for complex forms
 * - Real-time validation feedback
 * - Custom validation rules and business logic
 *
 * This hook consolidates all validation logic that was previously
 * scattered across contexts and components.
 */
import { useState, useCallback, useMemo, useRef } from 'react';
/**
 * Comprehensive State Validation Hook
 */
export function useStateValidation(options = {}) {
    const { enableCache = true, cacheExpiry = 5 * 60 * 1000, // 5 minutes
    enableAsyncValidation = true, strictMode = false, customRules = [], } = options;
    const [validationState, setValidationState] = useState({
        isValidating: false,
        lastValidation: 0,
        validationCount: 0,
    });
    const cacheRef = useRef({});
    // Generate cache key for validation
    const getCacheKey = useCallback((data, rules) => {
        const dataHash = JSON.stringify(data);
        const rulesHash = rules.map(r => r.name).join(',');
        return `${dataHash}-${rulesHash}`;
    }, []);
    // Get cached validation result
    const getCachedResult = useCallback((cacheKey) => {
        if (!enableCache)
            return null;
        const cached = cacheRef.current[cacheKey];
        if (cached && cached.expiry > Date.now()) {
            return cached.result;
        }
        // Clean expired cache entries
        if (cached && cached.expiry <= Date.now()) {
            delete cacheRef.current[cacheKey];
        }
        return null;
    }, [enableCache]);
    // Set cached validation result
    const setCachedResult = useCallback((cacheKey, result) => {
        if (!enableCache)
            return;
        cacheRef.current[cacheKey] = {
            result,
            timestamp: Date.now(),
            expiry: Date.now() + cacheExpiry,
        };
    }, [enableCache, cacheExpiry]);
    // Core validation engine
    const validateWithRules = useCallback(async (data, rules, fieldName = 'data') => {
        const errors = [];
        const warnings = [];
        const info = [];
        for (const rule of rules) {
            try {
                let isValid;
                if (rule.async && enableAsyncValidation) {
                    isValid = await rule.validator(data);
                }
                else {
                    isValid = rule.validator(data);
                }
                if (!isValid) {
                    const error = {
                        field: fieldName,
                        rule: rule.name,
                        message: rule.message,
                        severity: rule.severity,
                        value: data,
                    };
                    switch (rule.severity) {
                        case 'error':
                            errors.push(error);
                            break;
                        case 'warning':
                            warnings.push(error);
                            break;
                        case 'info':
                            info.push(error);
                            break;
                    }
                }
            }
            catch (error) {
                errors.push({
                    field: fieldName,
                    rule: rule.name,
                    message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error',
                    value: data,
                });
            }
        }
        return {
            isValid: errors.length === 0 && (strictMode ? warnings.length === 0 : true),
            errors,
            warnings,
            info,
        };
    }, [enableAsyncValidation, strictMode]);
    // Birth data validation rules
    const birthDataRules = useMemo(() => [
        {
            name: 'required_fields',
            validator: data => {
                return !!(data &&
                    typeof data.year === 'number' &&
                    typeof data.month === 'number' &&
                    typeof data.day === 'number' &&
                    typeof data.hour === 'number' &&
                    typeof data.minute === 'number' &&
                    typeof data.city === 'string' &&
                    data.city.trim().length > 0);
            },
            message: 'All required fields must be provided (year, month, day, hour, minute, city)',
            severity: 'error',
        },
        {
            name: 'valid_year',
            validator: data => {
                if (!data || typeof data.year !== 'number')
                    return false;
                const currentYear = new Date().getFullYear();
                return data.year >= 1900 && data.year <= currentYear + 1;
            },
            message: 'Year must be between 1900 and current year + 1',
            severity: 'error',
        },
        {
            name: 'valid_month',
            validator: data => {
                if (!data || typeof data.month !== 'number')
                    return false;
                return data.month >= 1 && data.month <= 12;
            },
            message: 'Month must be between 1 and 12',
            severity: 'error',
        },
        {
            name: 'valid_day',
            validator: data => {
                if (!data ||
                    typeof data.day !== 'number' ||
                    typeof data.month !== 'number' ||
                    typeof data.year !== 'number') {
                    return false;
                }
                // Check day range based on month and year
                const daysInMonth = new Date(data.year, data.month, 0).getDate();
                return data.day >= 1 && data.day <= daysInMonth;
            },
            message: 'Day must be valid for the given month and year',
            severity: 'error',
        },
        {
            name: 'valid_hour',
            validator: data => {
                if (!data || typeof data.hour !== 'number')
                    return false;
                return data.hour >= 0 && data.hour <= 23;
            },
            message: 'Hour must be between 0 and 23',
            severity: 'error',
        },
        {
            name: 'valid_minute',
            validator: data => {
                if (!data || typeof data.minute !== 'number')
                    return false;
                return data.minute >= 0 && data.minute <= 59;
            },
            message: 'Minute must be between 0 and 59',
            severity: 'error',
        },
        {
            name: 'valid_coordinates',
            validator: data => {
                if (!data)
                    return true; // Optional coordinates
                const hasLat = typeof data.lat === 'number';
                const hasLon = typeof data.lon === 'number';
                // Both or neither
                if (hasLat !== hasLon)
                    return false;
                if (hasLat && hasLon) {
                    return (data.lat >= -90 &&
                        data.lat <= 90 &&
                        data.lon >= -180 &&
                        data.lon <= 180);
                }
                return true;
            },
            message: 'Coordinates must be valid latitude (-90 to 90) and longitude (-180 to 180)',
            severity: 'warning',
        },
        {
            name: 'city_length',
            validator: data => {
                if (!data || typeof data.city !== 'string')
                    return false;
                return data.city.trim().length >= 2 && data.city.trim().length <= 100;
            },
            message: 'City name must be between 2 and 100 characters',
            severity: 'error',
        },
        {
            name: 'future_date_warning',
            validator: data => {
                if (!data ||
                    typeof data.year !== 'number' ||
                    typeof data.month !== 'number' ||
                    typeof data.day !== 'number') {
                    return true;
                }
                const birthDate = new Date(data.year, data.month - 1, data.day);
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today
                return birthDate <= today;
            },
            message: 'Birth date appears to be in the future',
            severity: 'warning',
        },
        ...customRules.filter(rule => rule.name.startsWith('birth_')),
    ], [customRules]);
    // Chart data validation rules
    const chartDataRules = useMemo(() => [
        {
            name: 'has_planets',
            validator: data => {
                return !!(data &&
                    data.planets &&
                    typeof data.planets === 'object' &&
                    Object.keys(data.planets).length > 0);
            },
            message: 'Chart data must contain planets information',
            severity: 'error',
        },
        {
            name: 'has_houses',
            validator: data => {
                return !!(data &&
                    data.houses &&
                    Array.isArray(data.houses) &&
                    data.houses.length > 0);
            },
            message: 'Chart data must contain houses information',
            severity: 'error',
        },
        {
            name: 'valid_planet_data',
            validator: data => {
                if (!data || !data.planets)
                    return false;
                return Object.values(data.planets).every(planet => {
                    if (!planet || typeof planet !== 'object')
                        return false;
                    return (typeof planet.position === 'number' &&
                        planet.position >= 0 &&
                        planet.position < 360);
                });
            },
            message: 'All planets must have valid position data (0-360 degrees)',
            severity: 'error',
        },
        {
            name: 'sufficient_houses',
            validator: data => {
                if (!data || !data.houses || !Array.isArray(data.houses))
                    return false;
                return data.houses.length >= 12;
            },
            message: 'Chart should have at least 12 houses',
            severity: 'warning',
        },
        {
            name: 'has_aspects',
            validator: data => {
                return !!(data && data.aspects && Array.isArray(data.aspects));
            },
            message: 'Chart data should contain aspects information',
            severity: 'info',
        },
        ...customRules.filter(rule => rule.name.startsWith('chart_')),
    ], [customRules]);
    // Generic validation function
    const validateData = useCallback(async (data, rules, fieldName = 'data') => {
        setValidationState(prev => ({
            ...prev,
            isValidating: true,
            validationCount: prev.validationCount + 1,
        }));
        try {
            // Check cache first
            const cacheKey = getCacheKey(data, rules);
            const cachedResult = getCachedResult(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            // Perform validation
            const result = await validateWithRules(data, rules, fieldName);
            // Cache result
            setCachedResult(cacheKey, result);
            return result;
        }
        finally {
            setValidationState(prev => ({
                ...prev,
                isValidating: false,
                lastValidation: Date.now(),
            }));
        }
    }, [getCacheKey, getCachedResult, setCachedResult, validateWithRules]);
    // Specific validation methods
    const validateBirthData = useCallback(async (data) => {
        return validateData(data, birthDataRules, 'birthData');
    }, [validateData, birthDataRules]);
    const validateChartData = useCallback(async (data) => {
        return validateData(data, chartDataRules, 'chartData');
    }, [validateData, chartDataRules]);
    // Progressive validation for forms
    const validateField = useCallback(async (fieldName, value, fieldRules) => {
        return validateData(value, fieldRules, fieldName);
    }, [validateData]);
    // Type guards
    const isBirthData = useCallback((data) => {
        if (!data || typeof data !== 'object')
            return false;
        const obj = data;
        return (typeof obj.year === 'number' &&
            typeof obj.month === 'number' &&
            typeof obj.day === 'number' &&
            typeof obj.hour === 'number' &&
            typeof obj.minute === 'number' &&
            typeof obj.city === 'string');
    }, []);
    const isChartData = useCallback((data) => {
        if (!data || typeof data !== 'object')
            return false;
        const obj = data;
        return (obj.planets !== undefined ||
            obj.houses !== undefined ||
            obj.aspects !== undefined ||
            obj.asteroids !== undefined);
    }, []);
    // Cache management
    const clearValidationCache = useCallback(() => {
        cacheRef.current = {};
    }, []);
    const getCacheStats = useCallback(() => {
        const entries = Object.entries(cacheRef.current);
        const activeEntries = entries.filter(([, value]) => value.expiry > Date.now());
        const expiredEntries = entries.length - activeEntries.length;
        return {
            totalEntries: entries.length,
            activeEntries: activeEntries.length,
            expiredEntries,
            cacheHitRatio: validationState.validationCount > 0
                ? (validationState.validationCount - activeEntries.length) /
                    validationState.validationCount
                : 0,
        };
    }, [validationState.validationCount]);
    // Validation summary helper
    const getValidationSummary = useCallback((result) => {
        const parts = [];
        if (result.errors.length > 0) {
            parts.push(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`);
        }
        if (result.warnings.length > 0) {
            parts.push(`${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`);
        }
        if (result.info.length > 0) {
            parts.push(`${result.info.length} info message${result.info.length !== 1 ? 's' : ''}`);
        }
        if (parts.length === 0) {
            return 'All validations passed';
        }
        return parts.join(', ');
    }, []);
    return {
        // Core validation methods
        validateData,
        validateBirthData,
        validateChartData,
        validateField,
        // Type guards
        isBirthData,
        isChartData,
        // State
        isValidating: validationState.isValidating,
        lastValidation: validationState.lastValidation,
        validationCount: validationState.validationCount,
        // Cache management
        clearValidationCache,
        getCacheStats,
        // Utilities
        getValidationSummary,
        // Available rules (for custom validation)
        birthDataRules,
        chartDataRules,
    };
}
//# sourceMappingURL=useStateValidation.js.map