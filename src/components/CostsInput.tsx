import React, { useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { FinancialInputs, CostItem } from '../types';
import { Tooltip } from './Tooltip';

interface CostsInputProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const CostsInput: React.FC<CostsInputProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleBasicCostChange = (field: keyof typeof inputs.costs, value: number) => {
    onChange({
      ...inputs,
      costs: {
        ...inputs.costs,
        [field]: value,
      },
    });
  };

  const addCustomCost = () => {
    onChange({
      ...inputs,
      costs: {
        ...inputs.costs,
        customCosts: [...inputs.costs.customCosts, { name: '', amount: 0 }],
      },
    });
  };

  const updateCustomCost = (index: number, field: keyof CostItem, value: string | number) => {
    const newCustomCosts = [...inputs.costs.customCosts];
    newCustomCosts[index] = {
      ...newCustomCosts[index],
      [field]: value,
    };
    onChange({
      ...inputs,
      costs: {
        ...inputs.costs,
        customCosts: newCustomCosts,
      },
    });
  };

  const removeCustomCost = (index: number) => {
    onChange({
      ...inputs,
      costs: {
        ...inputs.costs,
        customCosts: inputs.costs.customCosts.filter((_, i) => i !== index),
      },
    });
  };

  const handleReset = () => {
    onChange({
      ...inputs,
      costs: {
        productBox: 0,
        bottleSprayer: 0,
        concentrate: 0,
        nfcChip: 0,
        printMaterials: 0,
        shippingBox: 0,
        manufacturingLabor: 0,
        customCosts: []
      }
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...inputs,
      costs: {
        productBox: 5,
        bottleSprayer: 8,
        concentrate: 10,
        nfcChip: 3,
        printMaterials: 2,
        shippingBox: 3,
        manufacturingLabor: 4,
        customCosts: []
      }
    });
  };

  const totalProductCost = useMemo(() => {
    const { costs } = inputs;
    return costs.productBox + 
           costs.bottleSprayer + 
           costs.concentrate + 
           costs.nfcChip +
           costs.printMaterials +
           costs.shippingBox +
           costs.manufacturingLabor +
           costs.customCosts.reduce((sum, cost) => sum + cost.amount, 0);
  }, [inputs.costs]);

  const totalAnnualCost = totalProductCost * inputs.unitsSoldYear1;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Cost</h3>
            <Tooltip content="Direct costs associated with producing each unit of your product (part of COGS)" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(totalProductCost)} Production Cost per Unit
            </span>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manufacturing Labor ($)
                </label>
                <Tooltip content="Direct labor cost per unit for manufacturing and assembly" />
              </div>
              <input
                type="number"
                value={inputs.costs.manufacturingLabor}
                onChange={(e) => handleBasicCostChange('manufacturingLabor', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Box ($)
                </label>
                <Tooltip content="Cost per unit for the main product packaging" />
              </div>
              <input
                type="number"
                value={inputs.costs.productBox}
                onChange={(e) => handleBasicCostChange('productBox', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bottle & Sprayer ($)
                </label>
                <Tooltip content="Cost per unit for the bottle and spray mechanism" />
              </div>
              <input
                type="number"
                value={inputs.costs.bottleSprayer}
                onChange={(e) => handleBasicCostChange('bottleSprayer', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Concentrate ($)
                </label>
                <Tooltip content="Cost per unit for the perfume concentrate" />
              </div>
              <input
                type="number"
                value={inputs.costs.concentrate}
                onChange={(e) => handleBasicCostChange('concentrate', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  NFC Chip ($)
                </label>
                <Tooltip content="Cost per unit for NFC authentication technology" />
              </div>
              <input
                type="number"
                value={inputs.costs.nfcChip}
                onChange={(e) => handleBasicCostChange('nfcChip', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Print Materials ($)
                </label>
                <Tooltip content="Cost per unit for labels, inserts, and other printed materials" />
              </div>
              <input
                type="number"
                value={inputs.costs.printMaterials}
                onChange={(e) => handleBasicCostChange('printMaterials', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shipping Box ($)
                </label>
                <Tooltip content="Cost per unit for the outer shipping container" />
              </div>
              <input
                type="number"
                value={inputs.costs.shippingBox}
                onChange={(e) => handleBasicCostChange('shippingBox', Number(e.target.value))}
                className="input-base"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Additional Costs</h4>
                <Tooltip content="Any other direct costs related to producing each unit" />
              </div>
              <button
                onClick={addCustomCost}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Cost
              </button>
            </div>

            {inputs.costs.customCosts.map((cost, index) => (
              <div key={index} className="flex items-center gap-4">
                <input
                  type="text"
                  value={cost.name}
                  onChange={(e) => updateCustomCost(index, 'name', e.target.value)}
                  placeholder="Cost name"
                  className="flex-1 input-base"
                />
                <input
                  type="number"
                  value={cost.amount}
                  onChange={(e) => updateCustomCost(index, 'amount', Number(e.target.value))}
                  placeholder="Amount"
                  className="w-32 input-base"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={() => removeCustomCost(index)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Product Cost per Unit
                </span>
                <Tooltip content="Total cost to produce one unit, including materials, labor, and packaging (part of COGS)" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalProductCost)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year-1 Product Cost
                </span>
                <Tooltip content="Total production costs for all units in the first year" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalAnnualCost)}
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Based on {inputs.unitsSoldYear1.toLocaleString()} units/year
                </div>
              </div>
            </div>
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