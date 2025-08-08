import React from 'react';
export interface AnalyticsPanelProps { data?: any; }
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = () => (
  <div className="p-4"><h3 className="text-lg font-semibold mb-4">Analytics Panel</h3><div className="text-center py-8 text-gray-500">Analytics panel placeholder</div></div>
);
export default AnalyticsPanel;
