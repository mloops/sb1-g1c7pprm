import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  return (
    <div className="group relative inline-block">
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help transition-colors" />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-lg dark:shadow-gray-900/20 text-sm w-48 -top-2 left-6 pointer-events-none border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">
        <div className="relative">
          {content}
          <div className="absolute -left-3 top-2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-100 dark:border-gray-700 transform -rotate-45" />
        </div>
      </div>
    </div>
  );
};