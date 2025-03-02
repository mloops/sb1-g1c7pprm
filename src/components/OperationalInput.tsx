import React, { useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { FinancialInputs } from '../types';
import { Tooltip } from './Tooltip';

interface OperationalInputProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const OperationalInput: React.FC<OperationalInputProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleOperationalChange = (field: keyof typeof inputs.operational, value: number) => {
    if (field === 'software') return;
    onChange({
      ...inputs,
      operational: {
        ...inputs.operational,
        [field]: value
      }
    });
  };

  const handleSoftwareChange = (tool: keyof typeof inputs.operational.software, value: number) => {
    if (tool === 'customSoftware') return;
    onChange({
      ...inputs,
      operational: {
        ...inputs.operational,
        software: {
          ...inputs.operational.software,
          [tool]: value
        }
      }
    });
  };

  const addCustomSoftware = () => {
    onChange({
      ...inputs,
      operational: {
        ...inputs.operational,
        software: {
          ...inputs.operational.software,
          customSoftware: [
            ...inputs.operational.software.customSoftware,
            { name: '', cost: 0 }
          ]
        }
      }
    });
  };

  const updateCustomSoftware = (index: number, field: 'name' | 'cost', value: string | number) => {
    const newCustomSoftware = [...inputs.operational.software.customSoftware];
    newCustomSoftware[index] = {
      ...newCustomSoftware[index],
      [field]: field === 'cost' ? Number(value) : value
    };
    onChange({
      ...inputs,
      operational: {
        ...inputs.operational,
        software: {
          ...inputs.operational.software,
          customSoftware: newCustomSoftware
        }
      }
    });
  };

  const removeCustomSoftware = (index: number) => {
    onChange({
      ...inputs,
      operational: {
        ...inputs.operational,
        software: {
          ...inputs.operational.software,
          customSoftware: inputs.operational.software.customSoftware.filter((_, i) => i !== index)
        }
      }
    });
  };

  const handleReset = () => {
    onChange({
      ...inputs,
      operational: {
        labor: 0,
        rentUtilities: 0,
        officeExpenses: 0,
        workTools: 0,
        techFees: 0,
        travel: 0,
        software: {
          shopify: 0,
          klaviyo: 0,
          quickbooks: 0,
          tidio: 0,
          customSoftware: []
        }
      }
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...inputs,
      operational: {
        labor: 60000,
        rentUtilities: 24000,
        officeExpenses: 6000,
        workTools: 12000,
        techFees: 3600,
        travel: 12000,
        software: {
          shopify: 80,
          klaviyo: 80,
          quickbooks: 100,
          tidio: 100,
          customSoftware: []
        }
      }
    });
  };

  const totalMonthlyExpenses = useMemo(() => {
    const { operational } = inputs;
    return (operational.labor + 
            operational.rentUtilities + 
            operational.officeExpenses +
            operational.workTools +
            operational.techFees +
            operational.travel) / 12 +
           operational.software.shopify +
           operational.software.klaviyo +
           operational.software.quickbooks +
           operational.software.tidio +
           operational.software.customSoftware.reduce((sum, software) => sum + software.cost, 0);
  }, [inputs.operational]);

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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Operational Expenses</h3>
            <Tooltip content="Fixed and variable costs associated with running the business" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(totalMonthlyExpenses)} per Month
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Labor Costs ($)
                </label>
                <Tooltip content="Annual salaries, wages, and contractor payments" />
              </div>
              <input
                type="number"
                value={inputs.operational.labor}
                onChange={(e) => handleOperationalChange('labor', Number(e.target.value))}
                className="input-base"
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rent & Utilities ($)
                </label>
                <Tooltip content="Annual office/workspace rent and utility costs" />
              </div>
              <input
                type="number"
                value={inputs.operational.rentUtilities}
                onChange={(e) => handleOperationalChange('rentUtilities', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Office Expenses ($)
                </label>
                <Tooltip content="Annual costs for office supplies, printing, stationery, and general office materials" />
              </div>
              <input
                type="number"
                value={inputs.operational.officeExpenses}
                onChange={(e) => handleOperationalChange('officeExpenses', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Work Tools ($)
                </label>
                <Tooltip content="Annual budget for furniture, equipment, shelving, and other workspace tools" />
              </div>
              <input
                type="number"
                value={inputs.operational.workTools}
                onChange={(e) => handleOperationalChange('workTools', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tech Fees ($)
                </label>
                <Tooltip content="Annual costs for internet, phone services, and other technology infrastructure" />
              </div>
              <input
                type="number"
                value={inputs.operational.techFees}
                onChange={(e) => handleOperationalChange('techFees', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Travel ($)
                </label>
                <Tooltip content="Annual budget for business travel, including supplier visits, trade shows, and meetings" />
              </div>
              <input
                type="number"
                value={inputs.operational.travel}
                onChange={(e) => handleOperationalChange('travel', Number(e.target.value))}
                className="input-base"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Software Subscriptions</h4>
                <Tooltip content="Monthly costs for business software and tools" />
              </div>
              <button
                onClick={addCustomSoftware}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Software
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Shopify ($)
                    </label>
                    <Tooltip content="E-commerce platform for online store management, includes hosting, payment processing, and basic analytics" />
                  </div>
                  <input
                    type="number"
                    value={inputs.operational.software.shopify}
                    onChange={(e) => handleSoftwareChange('shopify', Number(e.target.value))}
                    className="input-base"
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Klaviyo ($)
                    </label>
                    <Tooltip content="Email marketing platform for automated campaigns, customer segmentation, and personalized communications" />
                  </div>
                  <input
                    type="number"
                    value={inputs.operational.software.klaviyo}
                    onChange={(e) => handleSoftwareChange('klaviyo', Number(e.target.value))}
                    className="input-base"
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      QuickBooks ($)
                    </label>
                    <Tooltip content="Accounting software for bookkeeping, invoicing, and financial reporting" />
                  </div>
                  <input
                    type="number"
                    value={inputs.operational.software.quickbooks}
                    onChange={(e) => handleSoftwareChange('quickbooks', Number(e.target.value))}
                    className="input-base"
                    min="0"
                    step="10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tidio ($)
                    </label>
                    <Tooltip content="Live chat and chatbot platform for customer support and sales automation" />
                  </div>
                  <input
                    type="number"
                    value={inputs.operational.software.tidio}
                    onChange={(e) => handleSoftwareChange('tidio', Number(e.target.value))}
                    className="input-base"
                    min="0"
                    step="10"
                  />
                </div>
              </div>

              {inputs.operational.software.customSoftware.map((software, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={software.name}
                    onChange={(e) => updateCustomSoftware(index, 'name', e.target.value)}
                    placeholder="Software name"
                    className="flex-1 input-base"
                  />
                  <input
                    type="number"
                    value={software.cost}
                    onChange={(e) => updateCustomSoftware(index, 'cost', Number(e.target.value))}
                    placeholder="Monthly cost"
                    className="w-32 input-base"
                    min="0"
                    step="10"
                  />
                  <button
                    onClick={() => removeCustomSoftware(index)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Monthly Operational Expenses</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">${totalMonthlyExpenses.toFixed(2)}</span>
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