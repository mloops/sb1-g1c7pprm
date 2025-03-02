import React, { useMemo } from 'react';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import type { TrafficSource, ConversionRateRange } from '../types';
import { Tooltip } from './Tooltip';
import { GradientSlider } from './GradientSlider';
import { SliderInput } from './SliderInput';

interface CampaignCalculatorProps {
  trafficSource: TrafficSource;
  adSpend: number;
  conversionRate: number;
  onTrafficSourceChange: (source: TrafficSource) => void;
  onAdSpendChange: (spend: number) => void;
  onConversionRateChange: (rate: number) => void;
}

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

const TRAFFIC_SOURCE_LABELS: Record<TrafficSource, string> = {
  meta: 'Meta (Facebook/Instagram)',
  google: 'Google Search Ads',
  tiktok: 'TikTok Ads',
  influencer: 'Influencer/UGC',
  retargeting: 'Email & Retargeting'
};

const CPC_ESTIMATES: Record<TrafficSource, number> = {
  meta: 1.5,
  google: 2.5,
  tiktok: 1.0,
  influencer: 2.0,
  retargeting: 0.5
};

export const CampaignCalculator: React.FC<CampaignCalculatorProps> = ({
  trafficSource,
  adSpend,
  conversionRate,
  onTrafficSourceChange,
  onAdSpendChange,
  onConversionRateChange
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentRanges = CONVERSION_RATES[trafficSource];
  const cpc = CPC_ESTIMATES[trafficSource];
  const estimatedClicks = Math.round(adSpend / cpc);
  const estimatedConversions = Math.round(estimatedClicks * (conversionRate / 100));

  const conversionRateColor = useMemo(() => {
    if (conversionRate >= currentRanges.great) return 'bg-green-500 dark:bg-green-500';
    if (conversionRate >= currentRanges.good[0]) return 'bg-green-400 dark:bg-green-400';
    if (conversionRate >= currentRanges.average[0]) return 'bg-yellow-400 dark:bg-yellow-400';
    return 'bg-red-400 dark:bg-red-400';
  }, [conversionRate, currentRanges]);

  const conversionRateLabel = useMemo(() => {
    if (conversionRate >= currentRanges.great) return 'Great';
    if (conversionRate >= currentRanges.good[0]) return 'Good';
    if (conversionRate >= currentRanges.average[0]) return 'Average';
    return 'Below Average';
  }, [conversionRate, currentRanges]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Campaign Calculator</h4>
          <Tooltip content="Calculate estimated sales based on traffic source and conversion rates" />
        </div>
        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
      
      {isExpanded && (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Traffic Source
              </label>
              <Tooltip content="Select your primary traffic source for this campaign" />
            </div>
            <select
              value={trafficSource}
              onChange={(e) => onTrafficSourceChange(e.target.value as TrafficSource)}
              className="input-base"
            >
              {Object.entries(TRAFFIC_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <SliderInput
            label="Ad Spend Budget ($)"
            tooltip="Monthly budget for this campaign"
            value={adSpend}
            onChange={onAdSpendChange}
            min={0}
            max={10000}
            step={100}
            formatValue={(value) => `$${value.toLocaleString()}`}
          />

          <GradientSlider
            label="Conversion Rate"
            tooltip="Expected percentage of visitors who make a purchase"
            value={conversionRate}
            onChange={onConversionRateChange}
            min={currentRanges.belowAverage[0]}
            max={currentRanges.great * 1.5}
            step={0.1}
            formatValue={(value) => `${value.toFixed(1)}%`}
            colorLabel={conversionRateLabel}
            colorClass={`${conversionRateColor} text-white`}
          />

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Monthly</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedClicks.toLocaleString()} 
                <span className="text-base font-normal text-gray-500 dark:text-gray-400"> clicks</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                @ ${cpc.toFixed(2)} per click
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className="space-y-1 text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Sales</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedConversions.toLocaleString()}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400"> units</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                @ {conversionRate.toFixed(1)}% conversion
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};