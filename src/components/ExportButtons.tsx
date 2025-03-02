import React from 'react';
import { FileDown } from 'lucide-react';
import { exportToPDF, exportToCSV } from '../utils/export';
import type { ExportData } from '../types';

interface ExportButtonsProps {
  data: ExportData;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={() => exportToPDF(data)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </button>
      
      <button
        onClick={() => exportToCSV(data)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export CSV
      </button>
    </div>
  );
};