import type { ReactNode } from 'react';

export interface FinancialInputs {
  modelName: string;
  modelDescription: string;
  pricePerUnit: number;
  unitsSoldYear1: number;
  annualGrowthRate: number;
  initialInvestment: number;
  costs: {
    productBox: number;
    bottleSprayer: number;
    concentrate: number;
    nfcChip: number;
    printMaterials: number;
    shippingBox: number;
    manufacturingLabor: number;
    customCosts: CostItem[];
  };
  marketing: {
    paidAds: number;
    influencerBudget: number;
    contentBudget: number;
    acquisitionPercent: number;
    budgetAllocation: {
      totalBudget: number;
      sources: Record<TrafficSource, TrafficSourceAllocation>;
    };
  };
  operational: {
    labor: number;
    rentUtilities: number;
    officeExpenses: number;
    workTools: number;
    techFees: number;
    travel: number;
    software: {
      shopify: number;
      klaviyo: number;
      quickbooks: number;
      tidio: number;
      customSoftware: Array<{ name: string; cost: number; }>;
    };
  };
  shipping: {
    fulfillmentType: 'thirdParty' | 'inHouse';
    inbound: {
      containerCost: number;
      customsDuty: number;
      freightForwarding: number;
      portHandling: number;
    };
    thirdParty: {
      pickAndPack: number;
      storage: number;
      postage: number;
    };
    inHouse: {
      labor: number;
      postage: number;
      warehouseRent: number;
    };
  };
  misc: {
    paymentProcessingFee: number;
    taxRate: number;
    returnsRefundsPercent: number;
    monthlyChurnRate: number;
    legalCompliance: number;
    researchDevelopment: number;
  };
  darkMode: boolean;
}

export type TrafficSource = 'meta' | 'google' | 'tiktok' | 'influencer' | 'retargeting';

export interface TrafficSourceAllocation {
  percentage: number;
  cpc: number;
  conversionRate: number;
}

export interface ConversionRateRange {
  belowAverage: [number, number];
  average: [number, number];
  good: [number, number];
  great: number;
}

export interface CostItem {
  name: string;
  amount: number;
}

export interface CalculatedMetrics {
  revenue: number[];
  grossProfit: number[];
  netProfit: number[];
  breakEvenMonth: number;
  monthlyData: {
    revenue: number[];
    cumulativeProfit: number[];
    cashFlow: number[];
  };
  cogs: {
    perUnit: number;
    total: number;
  };
  marketingMetrics: MarketingMetrics;
  ltvCacRatio: number;
  margins: {
    gross: number;
    net: number;
  };
  expenseBreakdown: {
    productMaterials: number;
    shipping: number;
    marketing: number;
    operational: number;
    misc: number;
  };
}

export interface MarketingMetrics {
  cac: number;
  ltv: number;
  monthlyChurn: number;
  organicSales: number;
  paidSales: number;
  acquisitionSpend: number;
  retentionSpend: number;
  customerLifespan: number;
  organicPercentage: number;
}

export interface ExportData {
  inputs: FinancialInputs;
  metrics: CalculatedMetrics;
  scenario: string;
}

export type Scenario = 'best' | 'base' | 'worst';

export interface SavedModel {
  id: string;
  name: string;
  description: string;
  data: FinancialInputs;
  created_at: string;
  updated_at: string;
}