import React from 'react';
import SystemsDisplay from './SystemsDisplay';
import type { Systems } from './types';

interface SystemsTabProps {
  systems: Systems;
}

const SystemsTab: React.FC<SystemsTabProps> = ({ systems }) => (
  <div className="p-4">
    <SystemsDisplay systems={systems} />
  </div>
);

export default SystemsTab;