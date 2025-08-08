import React from 'react';
export interface ReportGeneratorProps { type?: string; }
export const ReportGenerator: React.FC<ReportGeneratorProps> = () => (
  <div className="p-4"><h3 className="text-lg font-semibold mb-4">Report Generator</h3><div className="text-center py-8 text-gray-500">Report generator placeholder</div></div>
);
export default ReportGenerator;
