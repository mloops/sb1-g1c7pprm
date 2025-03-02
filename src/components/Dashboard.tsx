import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Tooltip } from './Tooltip';
import { BarChartIcon as ChartIcon, PieChartIcon } from 'lucide-react';
import type { CalculatedMetrics, FinancialInputs } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
);

interface DashboardProps {
  metrics: CalculatedMetrics;
  darkMode: boolean;
  inputs: FinancialInputs;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, darkMode, inputs }) => {
  const [activeChart, setActiveChart] = useState<'projection' | 'costs'>('projection');

  // Add gross and net profit calculations for Year 1
  const yearOneGrossProfit = metrics.grossProfit[0];
  const yearOneNetProfit = metrics.netProfit[0];
  const yearOneRevenue = metrics.revenue[0];

  // Calculate margins directly here to ensure consistency
  const grossMargin = (yearOneGrossProfit / yearOneRevenue) * 100;
  const netMargin = (yearOneNetProfit / yearOneRevenue) * 100;

  const financialData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Revenue',
        data: metrics.revenue,
        borderColor: darkMode ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          if (darkMode) {
            gradient.addColorStop(0, 'rgba(147, 197, 253, 0.5)');
            gradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: darkMode ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)',
      },
      {
        label: 'Gross Profit',
        data: metrics.grossProfit,
        borderColor: darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          if (darkMode) {
            gradient.addColorStop(0, 'rgba(251, 146, 60, 0.5)');
            gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(249, 115, 22, 0.5)');
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)',
      },
      {
        label: 'Net Profit',
        data: metrics.netProfit,
        borderColor: darkMode ? 'rgb(134, 239, 172)' : 'rgb(34, 197, 94)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          if (darkMode) {
            gradient.addColorStop(0, 'rgba(134, 239, 172, 0.5)');
            gradient.addColorStop(1, 'rgba(134, 239, 172, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: darkMode ? 'rgb(134, 239, 172)' : 'rgb(34, 197, 94)',
      },
    ],
  };

  const costData = {
    labels: ['Product Materials', 'Shipping & Logistics', 'Marketing', 'Operational', 'Misc'],
    datasets: [{
      data: [
        metrics.expenseBreakdown.productMaterials,
        metrics.expenseBreakdown.shipping,
        metrics.expenseBreakdown.marketing,
        metrics.expenseBreakdown.operational,
        metrics.expenseBreakdown.misc,
      ],
      backgroundColor: darkMode ? [
        'rgba(147, 197, 253, 0.8)',
        'rgba(167, 139, 250, 0.8)',
        'rgba(134, 239, 172, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(248, 113, 113, 0.8)',
      ] : [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    }],
  };

  const projectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? '#e5e7eb' : '#111827',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#111827',
        padding: 16,
        borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.dataset.label} : ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#111827',
          padding: 10,
        },
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#111827',
          padding: 10,
          callback: (value: number) => formatCurrency(value),
        },
      },
    },
  };

  const costOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: darkMode ? '#e5e7eb' : '#111827',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#111827',
        padding: 16,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-orange-400/10 to-orange-500/10 dark:from-orange-400/20 dark:to-orange-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Revenue (Y1)</h3>
            <Tooltip content="Total sales before any deductions" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(yearOneRevenue)}
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-400/10 to-blue-500/10 dark:from-blue-400/20 dark:to-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Gross Profit (Y1)</h3>
            <Tooltip content="Revenue minus cost of goods sold (COGS)" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(yearOneGrossProfit)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {grossMargin.toFixed(1)}% margin
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-400/10 to-green-500/10 dark:from-green-400/20 dark:to-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Net Profit (Y1)</h3>
            <Tooltip content="Profit after all expenses and taxes" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(yearOneNetProfit)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {netMargin.toFixed(1)}% margin
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeChart === 'projection' ? '5-Year Financial Projection' : 'Cost Breakdown'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChart('projection')}
              className={`p-2 rounded-lg transition-colors ${
                activeChart === 'projection'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Financial Projection"
            >
              <ChartIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveChart('costs')}
              className={`p-2 rounded-lg transition-colors ${
                activeChart === 'costs'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title="Cost Breakdown"
            >
              <PieChartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          {activeChart === 'projection' ? (
            <Line options={projectionOptions} data={financialData} />
          ) : (
            <Doughnut options={costOptions} data={costData} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marketing Metrics</h3>
            <Tooltip content="Key metrics to evaluate marketing efficiency and customer value." />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">Customer Acquisition Cost (CAC)</p>
                <Tooltip content="Total marketing spend divided by number of new customers. Lower is better." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(metrics.marketingMetrics.cac)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">Customer Lifetime Value (LTV)</p>
                <Tooltip content="Predicted total revenue from an average customer over their lifetime." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(metrics.marketingMetrics.ltv)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">LTV:CAC Ratio</p>
                <Tooltip content="LTV divided by CAC. A ratio above 3:1 is considered good, above 5:1 is excellent." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{metrics.ltvCacRatio.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cost Structure</h3>
            <Tooltip content="Breakdown of costs associated with producing and selling your product." />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">COGS per Unit</p>
                <Tooltip content="Total cost to produce and ship one unit, including materials, packaging, and shipping." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(metrics.cogs.perUnit)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">Total COGS (Year 1)</p>
                <Tooltip content="Total production and shipping costs for all units in the first year." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(metrics.cogs.total)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">Net Profit per Unit</p>
                <Tooltip content="Average net profit earned per unit after all costs, expenses, and taxes." />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(yearOneNetProfit / metrics.revenue[0] * inputs.pricePerUnit)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};