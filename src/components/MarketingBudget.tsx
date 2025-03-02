import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, ChevronDown, ChevronRight, ArrowRight, AlertCircle } from 'lucide-react';
import type { FinancialInputs, TrafficSource, TrafficSourceAllocation, ConversionRateRange } from '../types';
import { Tooltip } from './Tooltip';
import { SliderInput } from './SliderInput';
import { GradientSlider } from './GradientSlider';

// Keep all the existing constant definitions (TRAFFIC_SOURCES, CONVERSION_RATES, etc.)
const TRAFFIC_SOURCES: Record<TrafficSource, { label: string; icon: React.ReactNode }> = {
  meta: {
    label: 'Meta Ads',
    icon: <span className="text-blue-500">FB</span>
  },
  google: {
    label: 'Google Search',
    icon: <span className="text-red-500">G</span>
  },
  tiktok: {
    label: 'TikTok Ads',
    icon: <span className="text-gray-900 dark:text-white">TT</span>
  },
  influencer: {
    label: 'Influencer/UGC',
    icon: <span className="text-purple-500">IF</span>
  },
  retargeting: {
    label: 'Retargeting',
    icon: <span className="text-green-500">RT</span>
  }
};

const CONVERSION_RATES: Record<TrafficSource, ConversionRateRange> = {
  meta: {
    belowAverage: [0.5, 1.5],
    average: [1.5, 3],
    good: [3, 5],
    great: 5
  },
  google: {
    belowAverage: [1, 3],
    average: [3, 5],
    good: [5, 8],
    great: 8
  },
  tiktok: {
    belowAverage: [0.2, 1],
    average: [1, 2.5],
    good: [2.5, 4],
    great: 4
  },
  influencer: {
    belowAverage: [1, 3],
    average: [3, 6],
    good: [6, 10],
    great: 10
  },
  retargeting: {
    belowAverage: [2, 5],
    average: [5, 10],
    good: [10, 15],
    great: 15
  }
};

const CONVERSION_RATE_LABELS = {
  belowAverage: {
    label: 'Below Average',
    color: 'bg-red-400 dark:bg-red-500',
    textColor: 'text-white'
  },
  average: {
    label: 'Average',
    color: 'bg-yellow-400 dark:bg-yellow-500',
    textColor: 'text-gray-900 dark:text-white'
  },
  good: {
    label: 'Good',
    color: 'bg-green-400 dark:bg-green-500',
    textColor: 'text-white'
  },
  great: {
    label: 'Great',
    color: 'bg-emerald-400 dark:bg-emerald-500',
    textColor: 'text-white'
  }
};

interface MarketingBudgetProps {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export const MarketingBudget: React.FC<MarketingBudgetProps> = ({ inputs, onChange }) => {
  const [expandedSources, setExpandedSources] = useState<Record<TrafficSource, boolean>>({
    meta: false,
    google: false,
    tiktok: false,
    influencer: false,
    retargeting: false
  });

  const toggleSource = (source: TrafficSource) => {
    setExpandedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const cogsPerUnit = useMemo(() => {
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

  const sourceMetrics = useMemo(() => {
    return Object.entries(inputs.marketing.budgetAllocation.sources).map(([source, allocation]) => {
      const budget = (allocation.percentage / 100) * inputs.marketing.budgetAllocation.totalBudget;
      const clicks = Math.floor(budget / allocation.cpc);
      const conversions = Math.floor(clicks * (allocation.conversionRate / 100));
      const revenue = conversions * inputs.pricePerUnit;
      const cps = conversions > 0 ? budget / conversions : 0;
      const roas = budget > 0 ? revenue / budget : 0;
      
      const grossRevenue = conversions * inputs.pricePerUnit;
      const cogs = conversions * cogsPerUnit;
      const operationalCosts = (inputs.operational.labor / 12 / inputs.unitsSoldYear1 * 12) * conversions;
      const processingFees = grossRevenue * (inputs.misc.paymentProcessingFee / 100);
      const returnsRefunds = grossRevenue * (inputs.misc.returnsRefundsPercent / 100);
      const profit = grossRevenue - cogs - operationalCosts - processingFees - returnsRefunds - budget;
      const poas = budget > 0 ? profit / budget : 0;
      
      return {
        source: source as TrafficSource,
        budget,
        clicks,
        conversions,
        revenue,
        cps,
        roas,
        poas,
        profit
      };
    });
  }, [inputs.marketing.budgetAllocation, inputs.pricePerUnit, cogsPerUnit, inputs.operational, inputs.misc, inputs.unitsSoldYear1]);

  const totalMetrics = useMemo(() => {
    const metrics = sourceMetrics.reduce((acc, curr) => ({
      budget: acc.budget + curr.budget,
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
      netProfit: acc.netProfit + curr.profit
    }), { budget: 0, clicks: 0, conversions: 0, revenue: 0, netProfit: 0 });

    // Calculate surplus (or 0 if there's no surplus)
    const monthlyTargetUnits = inputs.unitsSoldYear1 / 12;
    const surplus = Math.max(0, metrics.conversions - monthlyTargetUnits);

    return {
      ...metrics,
      surplus
    };
  }, [sourceMetrics, inputs.unitsSoldYear1]);

  const marketingMetrics = useMemo(() => {
    const monthlyUnits = inputs.unitsSoldYear1 / 12;
    const retargetingBudget = (inputs.marketing.budgetAllocation.sources.retargeting.percentage / 100) * 
                             inputs.marketing.budgetAllocation.totalBudget;
    const acquisitionBudget = inputs.marketing.budgetAllocation.totalBudget - retargetingBudget;
    
    const profitPerUnit = inputs.pricePerUnit - cogsPerUnit;
    const targetPoas = 1.5;
    const potentialPaidSales = (acquisitionBudget * targetPoas) / profitPerUnit;
    
    const paidSales = Math.min(monthlyUnits, potentialPaidSales);
    const organicSales = Math.max(0, monthlyUnits - paidSales);
    const organicPercentage = (organicSales / monthlyUnits) * 100;
    
    return {
      acquisition: acquisitionBudget,
      retargeting: retargetingBudget,
      total: inputs.marketing.budgetAllocation.totalBudget,
      organicSales,
      paidSales,
      organicPercentage,
      monthlyUnits
    };
  }, [inputs.unitsSoldYear1, inputs.pricePerUnit, inputs.marketing.budgetAllocation, cogsPerUnit]);

  const totalBudgetPercentage = useMemo(() => {
    return Object.values(inputs.marketing.budgetAllocation.sources)
      .reduce((sum, source) => sum + source.percentage, 0);
  }, [inputs.marketing.budgetAllocation.sources]);

  const getBudgetStatusInfo = (percentage: number) => {
    if (percentage > 100) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />,
        textColor: 'text-red-500 dark:text-red-400',
        tooltip: 'Total budget allocation exceeds 100%. Please reduce allocation percentages.'
      };
    }
    if (percentage < 100) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
        textColor: 'text-yellow-500 dark:text-yellow-400',
        tooltip: 'Total budget allocation is below 100%. Consider allocating the remaining budget.'
      };
    }
    return {
      textColor: 'text-gray-600 dark:text-gray-400',
      tooltip: 'Budget allocation is balanced at 100%'
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getConversionRateLabel = (source: TrafficSource, rate: number) => {
    const ranges = CONVERSION_RATES[source];
    
    if (rate >= ranges.great) {
      return {
        label: CONVERSION_RATE_LABELS.great.label,
        color: CONVERSION_RATE_LABELS.great.color,
        textColor: CONVERSION_RATE_LABELS.great.textColor
      };
    }
    if (rate >= ranges.good[0]) {
      return {
        label: CONVERSION_RATE_LABELS.good.label,
        color: CONVERSION_RATE_LABELS.good.color,
        textColor: CONVERSION_RATE_LABELS.good.textColor
      };
    }
    if (rate >= ranges.average[0]) {
      return {
        label: CONVERSION_RATE_LABELS.average.label,
        color: CONVERSION_RATE_LABELS.average.color,
        textColor: CONVERSION_RATE_LABELS.average.textColor
      };
    }
    return {
      label: CONVERSION_RATE_LABELS.belowAverage.label,
      color: CONVERSION_RATE_LABELS.belowAverage.color,
      textColor: CONVERSION_RATE_LABELS.belowAverage.textColor
    };
  };

  function calculateAcquisitionCost() {
    const nonRetargetingMetrics = sourceMetrics.filter(m => m.source !== 'retargeting');
    const totalBudget = nonRetargetingMetrics.reduce((sum, m) => sum + m.budget, 0);
    const totalConversions = nonRetargetingMetrics.reduce((sum, m) => sum + m.conversions, 0);
    return totalConversions > 0 ? totalBudget / totalConversions : 0;
  }

  const handleSourcePercentageChange = (source: TrafficSource, percentage: number) => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        budgetAllocation: {
          ...inputs.marketing.budgetAllocation,
          sources: {
            ...inputs.marketing.budgetAllocation.sources,
            [source]: {
              ...inputs.marketing.budgetAllocation.sources[source],
              percentage
            }
          }
        }
      }
    });
  };

  const handleSourceCpcChange = (source: TrafficSource, cpc: number) => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        budgetAllocation: {
          ...inputs.marketing.budgetAllocation,
          sources: {
            ...inputs.marketing.budgetAllocation.sources,
            [source]: {
              ...inputs.marketing.budgetAllocation.sources[source],
              cpc
            }
          }
        }
      }
    });
  };

  const handleSourceConversionRateChange = (source: TrafficSource, conversionRate: number) => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        budgetAllocation: {
          ...inputs.marketing.budgetAllocation,
          sources: {
            ...inputs.marketing.budgetAllocation.sources,
            [source]: {
              ...inputs.marketing.budgetAllocation.sources[source],
              conversionRate
            }
          }
        }
      }
    });
  };

  const handleTotalBudgetChange = (totalBudget: number) => {
    onChange({
      ...inputs,
      marketing: {
        ...inputs.marketing,
        paidAds: totalBudget,
        budgetAllocation: {
          ...inputs.marketing.budgetAllocation,
          totalBudget
        }
      }
    });
  };

  const statusInfo = getBudgetStatusInfo(totalBudgetPercentage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Marketing Budget Allocation</h4>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Monthly Budget
            </span>
            <Tooltip content="Total monthly budget for all marketing channels" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(inputs.marketing.budgetAllocation.totalBudget)}
          </span>
        </div>

        <SliderInput
          value={inputs.marketing.budgetAllocation.totalBudget}
          onChange={handleTotalBudgetChange}
          min={0}
          max={50000}
          step={500}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />

        <div className="flex items-center justify-between mt-6 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Allocation
            </span>
            <Tooltip content="Distribute your budget across different marketing channels" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${statusInfo.textColor}`}>
              Total: {totalBudgetPercentage}%
            </span>
            {statusInfo.icon && statusInfo.icon}
            {statusInfo.tooltip && <Tooltip content={statusInfo.tooltip} />}
          </div>
        </div>

        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          {Object.entries(TRAFFIC_SOURCES).map(([sourceKey, sourceInfo]) => {
            const source = sourceKey as TrafficSource;
            const allocation = inputs.marketing.budgetAllocation.sources[source];
            const isExpanded = expandedSources[source];
            const sourceBudget = (allocation.percentage / 100) * inputs.marketing.budgetAllocation.totalBudget;
            const sourceMetric = sourceMetrics.find(m => m.source === source);
            
            const conversionRateInfo = getConversionRateLabel(source, allocation.conversionRate);
            
            return (
              <div key={source} className="space-y-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSource(source)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                      {sourceInfo.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{sourceInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {allocation.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(sourceBudget)}
                      </div>
                    </div>
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="pl-10 space-y-4">
                    <SliderInput
                      label="Budget Percentage"
                      tooltip="Percentage of total budget allocated to this channel"
                      value={allocation.percentage}
                      onChange={(value) => handleSourcePercentageChange(source, value)}
                      min={0}
                      max={100}
                      step={1}
                      formatValue={(value) => `${value}%`}
                    />
                    
                    <SliderInput
                      label="Cost Per Click (CPC)"
                      tooltip="Average cost per click for this channel"
                      value={allocation.cpc}
                      onChange={(value) => handleSourceCpcChange(source, value)}
                      min={0.1}
                      max={10}
                      step={0.1}
                      formatValue={(value) => `$${value.toFixed(2)}`}
                    />
                    
                    <GradientSlider
                      label="Conversion Rate"
                      tooltip="Percentage of visitors who make a purchase"
                      value={allocation.conversionRate}
                      onChange={(value) => handleSourceConversionRateChange(source, value)}
                      min={CONVERSION_RATES[source].belowAverage[0]}
                      max={CONVERSION_RATES[source].great * 1.5}
                      step={0.1}
                      formatValue={(value) => `${value.toFixed(1)}%`}
                      colorLabel={conversionRateInfo.label}
                      colorClass={`${conversionRateInfo.color} ${conversionRateInfo.textColor}`}
                    />
                    
                    {sourceMetric && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Clicks</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {sourceMetric.clicks.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Sales</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {sourceMetric.conversions.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Cost Per Sale</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(sourceMetric.cps)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ROAS</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {sourceMetric.roas.toFixed(1)}x
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h5 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Total Marketing Performance
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalMetrics.clicks.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalMetrics.conversions.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalMetrics.revenue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Net Profit</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalMetrics.netProfit)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Acquisition Cost
                </span>
                <Tooltip content="Average cost to acquire a new customer through paid channels" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(calculateAcquisitionCost())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};