'use client';

import { Share } from 'lucide-react';
import PanelDistribution from './PanelDistribution';

export default function DistributionTab() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Share className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
          Panel Distribution
        </h2>
        <p className="text-muted-foreground mt-1">Manage and schedule panel distributions to employees</p>
      </div>
      <PanelDistribution />
    </div>
  );
}
