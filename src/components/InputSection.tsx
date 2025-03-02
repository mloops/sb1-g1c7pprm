import React from 'react';
import { Tooltip } from './Tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FinancialInputs } from '../types';
import { SliderInput } from './SliderInput';

interface InputSectionProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleInputChange = (field: string, value: number) => {
    // Create a new object with the updated field
    const updatedInputs = {
      ...inputs,
      [field]: value,
    };
    
    // Call onChange with the new object
    onChange(updatedInputs);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  const monthlyUnits = Math.round(inputs.unitsSoldYear1 / 12);
  const monthlyRevenue = monthlyUnits * inputs.pricePerUnit;

  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Metrics</h3>
            <Tooltip content="Core financial metrics that define your business model" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(monthlyUnits)} Units/Month at {formatCurrency(inputs.pricePerUnit)} Retail Price
            </span>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <SliderInput
              label="Retail Price"
              tooltip="The price at which you sell each unit to customers"
              value={inputs.pricePerUnit}
              onChange={(value) => handleInputChange('pricePerUnit', value)}
              min={0}
              max={1000}
              step={10}
              formatValue={formatCurrency}
            />

            <SliderInput
              label="Year-1 Units Sold"
              tooltip="Total number of units you expect to sell in the first year"
              value={inputs.unitsSoldYear1}
              onChange={(value) => handleInputChange('unitsSoldYear1', value)}
              min={0}
              max={50000}
              step={100}
              formatValue={formatNumber}
            />

            <SliderInput
              label="Annual Growth Rate"
              tooltip="Expected percentage growth in sales each year after Year 1"
              value={inputs.annualGrowthRate}
              onChange={(value) => handleInputChange('annualGrowthRate', value)}
              min={0}
              max={500}
              step={10}
              formatValue={formatPercent}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Revenue
                </span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  @ {formatCurrency(inputs.pricePerUnit)} retail price
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(monthlyRevenue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(monthlyUnits)} units sold per month
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};