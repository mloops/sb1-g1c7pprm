import React, { useMemo } from 'react';
import type { FinancialInputs } from '../types';
import { Tooltip } from './Tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MarketingBudget } from './MarketingBudget';
import { SliderInput } from './SliderInput';

interface MarketingInputProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const MarketingInput: React.FC<MarketingInputProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleMarketingChange = (field: keyof typeof inputs.marketing, value: number) => {
    if (field === 'budgetAllocation') return;
    
    // When changing paidAds, also update the total budget
    if (field === 'paidAds') {
      // Ensure value stays within bounds
      const boundedValue = Math.min(Math.max(0, value), 1000000);
      onChange({
        ...inputs,
        marketing: {
          ...inputs.marketing,
          paidAds: boundedValue,
          budgetAllocation: {
            ...inputs.marketing.budgetAllocation,
            totalBudget: boundedValue
          }
        }
      });
      return;
    }

    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        [field]: value
      }
    });
  };

  const handleReset = () => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        paidAds: 0,
        budgetAllocation: {
          totalBudget: 0,
          sources: {
            meta: { percentage: 30, cpc: 1.50, conversionRate: 2.0 },
            google: { percentage: 25, cpc: 2.50, conversionRate: 3.5 },
            tiktok: { percentage: 20, cpc: 1.00, conversionRate: 1.5 },
            influencer: { percentage: 15, cpc: 2.00, conversionRate: 4.0 },
            retargeting: { percentage: 10, cpc: 0.50, conversionRate: 8.0 }
          }
        }
      }
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        paidAds: 3750,
        budgetAllocation: {
          totalBudget: 3750,
          sources: {
            meta: { percentage: 30, cpc: 1.50, conversionRate: 2.0 },
            google: { percentage: 25, cpc: 2.50, conversionRate: 3.5 },
            tiktok: { percentage: 20, cpc: 1.00, conversionRate: 1.5 },
            influencer: { percentage: 15, cpc: 2.00, conversionRate: 4.0 },
            retargeting: { percentage: 10, cpc: 0.50, conversionRate: 8.0 }
          }
        }
      }
    });
  };

  // Calculate total paid sales from all traffic sources
  const totalPaidSales = useMemo(() => {
    const { sources } = inputs.marketing.budgetAllocation;
    return Object.entries(sources).reduce((total, [source, allocation]) => {
      const budget = (allocation.percentage / 100) * inputs.marketing.budgetAllocation.totalBudget;
      const clicks = Math.floor(budget / allocation.cpc);
      const conversions = Math.floor(clicks * (allocation.conversionRate / 100));
      return total + conversions;
    }, 0);
  }, [inputs.marketing.budgetAllocation]);

  // Calculate monthly metrics
  const monthlyMetrics = useMemo(() => {
    const monthlyUnits = inputs.unitsSoldYear1 / 12;
    const monthlyPaidSales = totalPaidSales;
    const estimatedRevenue = monthlyPaidSales * inputs.pricePerUnit;

    return {
      monthlyUnits,
      monthlyPaidSales,
      estimatedRevenue
    };
  }, [inputs.unitsSoldYear1, totalPaidSales, inputs.pricePerUnit]);

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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marketing Expenses</h3>
            <Tooltip content="Monthly marketing costs including advertising and content creation" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(inputs.marketing.budgetAllocation.totalBudget)} per Month
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Monthly Paid Ad Budget
              </label>
              <Tooltip content="Monthly budget for paid advertising across all platforms" />
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={inputs.marketing.paidAds}
                onChange={(e) => handleMarketingChange('paidAds', Number(e.target.value))}
                className="w-48 input-base"
                min="0"
                max="1000000"
                step="1000"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(inputs.marketing.paidAds)}
              </span>
            </div>
            
            <SliderInput
              value={inputs.marketing.paidAds}
              onChange={(value) => handleMarketingChange('paidAds', value)}
              min={0}
              max={1000000}
              step={1000}
              formatValue={(value) => `$${value.toLocaleString()}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Sales from Paid Ads
              </label>
              <Tooltip content="Total monthly sales from all paid traffic sources" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(monthlyMetrics.monthlyPaidSales).toLocaleString()} Units/Month
              </div>
              <div className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                Est. Revenue: {formatCurrency(monthlyMetrics.estimatedRevenue)}/month
              </div>
            </div>
          </div>

          <MarketingBudget inputs={inputs} onChange={onChange} />

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
        </div>
      )}
    </div>
  );
};