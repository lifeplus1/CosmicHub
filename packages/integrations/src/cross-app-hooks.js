import { useState, useCallback } from 'react';
export const useCrossAppStore = () => {
    const [notifications, setNotifications] = useState([]);
    const addNotification = useCallback((notification) => {
        console.log('Cross-app notification:', notification);
        setNotifications((prev) => [...prev, notification]);
    }, []);
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);
    return { addNotification, notifications, clearNotifications };
};
//# sourceMappingURL=cross-app-hooks.js.map