import React, { useMemo } from 'react';
import type { FinancialInputs } from '../types';
import { Tooltip } from './Tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SliderInput } from './SliderInput';

interface MiscInputProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const MiscInput: React.FC<MiscInputProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleMiscChange = (field: keyof typeof inputs.misc, value: number) => {
    onChange({
      ...inputs,
      misc: {
        ...inputs.misc,
        [field]: value
      }
    });
  };

  const handleReset = () => {
    onChange({
      ...inputs,
      misc: {
        paymentProcessingFee: 0,
        taxRate: 0,
        returnsRefundsPercent: 0,
        monthlyChurnRate: 2, // Minimum value
        legalCompliance: 0,
        researchDevelopment: 0
      }
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...inputs,
      misc: {
        paymentProcessingFee: 2.9,
        taxRate: 25,
        returnsRefundsPercent: 3,
        monthlyChurnRate: 5,
        legalCompliance: 5000,
        researchDevelopment: 24000
      }
    });
  };

  // Calculate total monthly misc expenses
  const totalMonthlyMiscExpenses = useMemo(() => {
    const { misc } = inputs;
    const monthlyLegalCompliance = misc.legalCompliance / 12;
    const monthlyRD = misc.researchDevelopment / 12;
    
    // We don't include payment processing, tax rate, returns/refunds, or churn rate
    // as these are calculated as percentages of revenue or other metrics
    return monthlyLegalCompliance + monthlyRD;
  }, [inputs.misc]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Miscellaneous Expenses</h3>
            <Tooltip content="Other business expenses including taxes, returns, and legal costs" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(totalMonthlyMiscExpenses)} per Month
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1 */}
            <SliderInput
              label="Payment Processing"
              tooltip="Credit card processing fees as a percentage of revenue"
              value={inputs.misc.paymentProcessingFee}
              onChange={(value) => handleMiscChange('paymentProcessingFee', value)}
              min={0}
              max={4}
              step={0.1}
              formatValue={(value) => `${value}%`}
            />

            <SliderInput
              label="Tax Rate"
              tooltip="Estimated tax rate as a percentage of net income"
              value={inputs.misc.taxRate}
              onChange={(value) => handleMiscChange('taxRate', value)}
              min={0}
              max={30}
              step={0.5}
              formatValue={(value) => `${value}%`}
            />

            {/* Row 2 */}
            <SliderInput
              label="Returns/Refunds"
              tooltip="Expected percentage of sales that will be returned or refunded"
              value={inputs.misc.returnsRefundsPercent}
              onChange={(value) => handleMiscChange('returnsRefundsPercent', value)}
              min={0}
              max={10}
              step={0.1}
              formatValue={(value) => `${value}%`}
            />

            <SliderInput
              label="Monthly Churn"
              tooltip="Percentage of customers who stop purchasing each month"
              value={inputs.misc.monthlyChurnRate}
              onChange={(value) => handleMiscChange('monthlyChurnRate', value)}
              min={2}
              max={10}
              step={0.5}
              formatValue={(value) => `${value}%`}
            />

            {/* Row 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Legal & Compliance ($)
                </label>
                <Tooltip content="Annual legal fees and regulatory compliance costs" />
              </div>
              <input
                type="number"
                value={inputs.misc.legalCompliance}
                onChange={(e) => handleMiscChange('legalCompliance', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Research & Development ($)
                </label>
                <Tooltip content="Annual budget for product research, development, and innovation" />
              </div>
              <input
                type="number"
                value={inputs.misc.researchDevelopment}
                onChange={(e) => handleMiscChange('researchDevelopment', Number(e.target.value))}
                className="input-base"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                Zero Values
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                Reset Default Values
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};