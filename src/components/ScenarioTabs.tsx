import React from 'react';
import { Sparkles, Target, AlertTriangle } from 'lucide-react';
import type { Scenario } from '../types';

interface ScenarioTabsProps {
  activeScenario: Scenario;
  onChange: (scenario: Scenario) => void;
}

export const ScenarioTabs: React.FC<ScenarioTabsProps> = ({ activeScenario, onChange }) => {
  const scenarios: Array<{ id: Scenario; label: string; icon: React.ReactNode }> = [
    {
      id: 'best',
      label: 'Best Case',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'base',
      label: 'Base Case',
      icon: <Target className="h-4 w-4" />,
    },
    {
      id: 'worst',
      label: 'Worst Case',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
      {scenarios.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`
            flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium
            ${
              activeScenario === id
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};