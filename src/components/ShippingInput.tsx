import React, { useMemo } from 'react';
import type { FinancialInputs } from '../types';
import { Tooltip } from './Tooltip';
import { Truck, Home, Ship, ChevronDown, ChevronRight } from 'lucide-react';

interface ShippingInputProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const ShippingInput: React.FC<ShippingInputProps> = ({ inputs, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleFulfillmentTypeChange = (type: 'thirdParty' | 'inHouse') => {
    onChange({
      ...inputs,
      shipping: {
        ...inputs.shipping,
        fulfillmentType: type
      }
    });
  };

  const handleInboundChange = (field: keyof typeof inputs.shipping.inbound, value: number) => {
    onChange({
      ...inputs,
      shipping: {
        ...inputs.shipping,
        inbound: {
          ...inputs.shipping.inbound,
          [field]: value
        }
      }
    });
  };

  const handleThirdPartyChange = (field: keyof typeof inputs.shipping.thirdParty, value: number) => {
    onChange({
      ...inputs,
      shipping: {
        ...inputs.shipping,
        thirdParty: {
          ...inputs.shipping.thirdParty,
          [field]: value
        }
      }
    });
  };

  const handleInHouseChange = (field: keyof typeof inputs.shipping.inHouse, value: number) => {
    onChange({
      ...inputs,
      shipping: {
        ...inputs.shipping,
        inHouse: {
          ...inputs.shipping.inHouse,
          [field]: value
        }
      }
    });
  };

  const handleReset = () => {
    onChange({
      ...inputs,
      shipping: {
        fulfillmentType: 'thirdParty',
        inbound: {
          containerCost: 0,
          customsDuty: 0,
          freightForwarding: 0,
          portHandling: 0
        },
        thirdParty: {
          pickAndPack: 0,
          storage: 0,
          postage: 0
        },
        inHouse: {
          labor: 0,
          postage: 0,
          warehouseRent: 0
        }
      }
    });
  };

  const handleResetToDefault = () => {
    onChange({
      ...inputs,
      shipping: {
        fulfillmentType: 'thirdParty',
        inbound: {
          containerCost: 3000,
          customsDuty: 5,
          freightForwarding: 500,
          portHandling: 250
        },
        thirdParty: {
          pickAndPack: 2.5,
          storage: 0.5,
          postage: 2.5
        },
        inHouse: {
          labor: 0.75,
          postage: 4.5,
          warehouseRent: 2000
        }
      }
    });
  };

  const monthlyUnits = inputs.unitsSoldYear1 / 12;
  const inboundCostPerUnit = useMemo(() => {
    const { inbound } = inputs.shipping;
    // Assuming one container holds 5000 units
    const unitsPerContainer = 5000;
    const containerCostPerUnit = inbound.containerCost / unitsPerContainer;
    const dutyPerUnit = (inputs.pricePerUnit * (inbound.customsDuty / 100));
    const forwardingPerUnit = inbound.freightForwarding / unitsPerContainer;
    const portHandlingPerUnit = inbound.portHandling / unitsPerContainer;
    
    return containerCostPerUnit + dutyPerUnit + forwardingPerUnit + portHandlingPerUnit;
  }, [inputs.shipping.inbound, inputs.pricePerUnit]);

  const outboundCostPerOrder = useMemo(() => {
    if (inputs.shipping.fulfillmentType === 'thirdParty') {
      return (
        inputs.shipping.thirdParty.pickAndPack +
        inputs.shipping.thirdParty.storage +
        inputs.shipping.thirdParty.postage
      );
    } else {
      return (
        inputs.shipping.inHouse.labor +
        inputs.shipping.inHouse.postage +
        (inputs.shipping.inHouse.warehouseRent / monthlyUnits)
      );
    }
  }, [inputs.shipping, monthlyUnits]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping & Logistics</h3>
            <Tooltip content="Shipping and logistics costs (part of COGS) for both inbound and outbound operations" />
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        
        {!isExpanded && (
          <div className="mt-1 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(inboundCostPerUnit)} Inbound per Unit | {formatCurrency(outboundCostPerOrder)} Outbound per Unit
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-8">
          {/* Inbound Shipping Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-500" />
              <h4 className="text-base font-medium text-gray-900 dark:text-white">Inbound Shipping</h4>
              <Tooltip content="Costs associated with importing products from manufacturers (part of COGS)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Container Cost ($)
                  </label>
                  <Tooltip content="Cost per shipping container" />
                </div>
                <input
                  type="number"
                  value={inputs.shipping.inbound.containerCost}
                  onChange={(e) => handleInboundChange('containerCost', Number(e.target.value))}
                  className="input-base"
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customs Duty (%)
                  </label>
                  <Tooltip content="Import duty as a percentage of product value" />
                </div>
                <input
                  type="number"
                  value={inputs.shipping.inbound.customsDuty}
                  onChange={(e) => handleInboundChange('customsDuty', Number(e.target.value))}
                  className="input-base"
                  min="0"
                  max="30"
                  step="0.5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Freight Forwarding ($)
                  </label>
                  <Tooltip content="Cost for freight forwarding services per shipment" />
                </div>
                <input
                  type="number"
                  value={inputs.shipping.inbound.freightForwarding}
                  onChange={(e) => handleInboundChange('freightForwarding', Number(e.target.value))}
                  className="input-base"
                  min="0"
                  step="50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Port Handling ($)
                  </label>
                  <Tooltip content="Port fees and handling charges per shipment" />
                </div>
                <input
                  type="number"
                  value={inputs.shipping.inbound.portHandling}
                  onChange={(e) => handleInboundChange('portHandling', Number(e.target.value))}
                  className="input-base"
                  min="0"
                  step="50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inbound Cost per Unit
                  </span>
                  <Tooltip content="Total inbound shipping cost per unit (part of COGS)" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(inboundCostPerUnit)}
                </span>
              </div>
            </div>
          </div>

          {/* Outbound Shipping Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              <h4 className="text-base font-medium text-gray-900 dark:text-white">Outbound Shipping</h4>
              <Tooltip content="Costs for shipping products to customers (part of COGS)" />
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleFulfillmentTypeChange('thirdParty')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  inputs.shipping.fulfillmentType === 'thirdParty'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <Truck className={`h-5 w-5 ${
                  inputs.shipping.fulfillmentType === 'thirdParty'
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  inputs.shipping.fulfillmentType === 'thirdParty'
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>Third-Party Logistics (3PL)</span>
              </button>
              <button
                onClick={() => handleFulfillmentTypeChange('inHouse')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  inputs.shipping.fulfillmentType === 'inHouse'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <Home className={`h-5 w-5 ${
                  inputs.shipping.fulfillmentType === 'inHouse'
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  inputs.shipping.fulfillmentType === 'inHouse'
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>Self-Fulfillment</span>
              </button>
            </div>

            {inputs.shipping.fulfillmentType === 'thirdParty' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pick & Pack ($)
                      </label>
                      <Tooltip content="Cost per unit for picking and packing orders" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.thirdParty.pickAndPack}
                      onChange={(e) => handleThirdPartyChange('pickAndPack', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Storage ($)
                      </label>
                      <Tooltip content="Monthly storage cost per unit" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.thirdParty.storage}
                      onChange={(e) => handleThirdPartyChange('storage', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postage ($)
                      </label>
                      <Tooltip content="Average shipping cost per order" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.thirdParty.postage}
                      onChange={(e) => handleThirdPartyChange('postage', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Labor ($)
                      </label>
                      <Tooltip content="Cost per order for picking, packing, and handling" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.inHouse.labor}
                      onChange={(e) => handleInHouseChange('labor', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postage ($)
                      </label>
                      <Tooltip content="Average shipping cost per order" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.inHouse.postage}
                      onChange={(e) => handleInHouseChange('postage', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Warehouse Rent ($)
                      </label>
                      <Tooltip content="Monthly warehouse rental cost" />
                    </div>
                    <input
                      type="number"
                      value={inputs.shipping.inHouse.warehouseRent}
                      onChange={(e) => handleInHouseChange('warehouseRent', Number(e.target.value))}
                      className="input-base"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Outbound Cost per Order
                    </span>
                    <Tooltip content="Total outbound shipping cost per order (part of COGS)" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Based on {Math.round(monthlyUnits).toLocaleString()} orders per month
                  </p>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(outboundCostPerOrder)}
                </span>
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
          </div>
        </div>
      )}
    </div>
  );
};