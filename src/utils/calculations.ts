import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinancialInputs, CalculatedMetrics, MarketingMetrics } from '../types';

const MONTHS_IN_YEAR = 12;

export function calculateMetrics(inputs: FinancialInputs): CalculatedMetrics {
  // Calculate product materials cost per unit
  const productMaterialsPerUnit = calculateProductMaterialsPerUnit(inputs);
  
  // Calculate shipping costs per unit
  const shippingCostsPerUnit = calculateShippingCostsPerUnit(inputs);
  
  // Total COGS per unit is product materials + shipping
  const cogsPerUnit = productMaterialsPerUnit + shippingCostsPerUnit;
  
  // Calculate Year 1 revenue
  const yearOneRevenue = inputs.pricePerUnit * inputs.unitsSoldYear1;
  
  // Calculate Year 1 COGS
  const yearOneCOGS = cogsPerUnit * inputs.unitsSoldYear1;
  
  // Calculate returns/refunds (deducted from revenue)
  const yearOneReturns = yearOneRevenue * (inputs.misc.returnsRefundsPercent / 100);
  
  // Calculate Gross Profit (Revenue - COGS - Returns)
  const yearOneGrossProfit = yearOneRevenue - yearOneCOGS - yearOneReturns;
  
  // Calculate monthly data
  const monthlyData = calculateMonthlyData(inputs, cogsPerUnit);
  
  // Calculate marketing metrics
  const marketingMetrics = calculateMarketingMetrics(inputs, monthlyData.revenue, cogsPerUnit);
  
  // Calculate annual metrics for all years
  const annualMetrics = calculateAnnualMetrics(inputs, cogsPerUnit);
  
  // Calculate expense breakdown
  const expenseBreakdown = calculateExpenseBreakdown(inputs, yearOneRevenue, yearOneCOGS);
  
  // Calculate break-even point
  const breakEvenMonth = calculateBreakEvenMonth(
    inputs.initialInvestment,
    monthlyData.cumulativeProfit
  );

  // Calculate margins
  const grossMargin = (yearOneGrossProfit / yearOneRevenue) * 100;
  const netMargin = (annualMetrics.netProfit[0] / yearOneRevenue) * 100;

  return {
    ...annualMetrics,
    breakEvenMonth,
    monthlyData,
    cogs: {
      perUnit: cogsPerUnit,
      total: yearOneCOGS
    },
    marketingMetrics,
    ltvCacRatio: marketingMetrics.cac > 0 ? marketingMetrics.ltv / marketingMetrics.cac : 0,
    margins: {
      gross: isNaN(grossMargin) ? 0 : grossMargin,
      net: isNaN(netMargin) ? 0 : netMargin
    },
    expenseBreakdown
  };
}

function calculateProductMaterialsPerUnit(inputs: FinancialInputs): number {
  const { costs } = inputs;
  return costs.productBox + 
         costs.bottleSprayer + 
         costs.concentrate + 
         costs.nfcChip +
         costs.printMaterials +
         costs.shippingBox +
         costs.manufacturingLabor +
         costs.customCosts.reduce((sum, cost) => sum + cost.amount, 0);
}

function calculateShippingCostsPerUnit(inputs: FinancialInputs): number {
  const { shipping } = inputs;
  const monthlyUnits = inputs.unitsSoldYear1 / MONTHS_IN_YEAR;
  
  // Calculate inbound shipping cost per unit
  const unitsPerContainer = 5000;
  const inboundCosts = 
    (shipping.inbound.containerCost / unitsPerContainer) +
    (inputs.pricePerUnit * (shipping.inbound.customsDuty / 100)) +
    (shipping.inbound.freightForwarding / unitsPerContainer) +
    (shipping.inbound.portHandling / unitsPerContainer);
  
  // Calculate outbound shipping cost per unit
  const outboundCosts = shipping.fulfillmentType === 'thirdParty'
    ? shipping.thirdParty.pickAndPack +
      shipping.thirdParty.storage +
      shipping.thirdParty.postage
    : shipping.inHouse.labor +
      shipping.inHouse.postage +
      (shipping.inHouse.warehouseRent / monthlyUnits);
  
  return inboundCosts + outboundCosts;
}

function calculateMonthlyData(inputs: FinancialInputs, cogsPerUnit: number) {
  const monthlyRevenue: number[] = [];
  const cumulativeProfit: number[] = [];
  const cashFlow: number[] = [];
  
  // Calculate monthly growth rate from annual rate
  const monthlyGrowthRate = Math.pow(1 + inputs.annualGrowthRate / 100, 1/12) - 1;
  
  // Base monthly units (Year 1 total divided by 12)
  const baseMonthlyUnits = inputs.unitsSoldYear1 / MONTHS_IN_YEAR;
  
  let cumulativeProfitTotal = -inputs.initialInvestment;
  
  // Calculate monthly fixed costs
  const monthlyFixedCosts = 
    (inputs.operational.labor / 12) +
    (inputs.operational.rentUtilities / 12) +
    (inputs.operational.officeExpenses / 12) +  // Added office expenses
    (inputs.operational.workTools / 12) +       // Added work tools
    (inputs.operational.techFees / 12) +        // Added tech fees
    (inputs.operational.travel / 12) +          // Added travel
    (inputs.misc.legalCompliance / 12) +
    (inputs.misc.researchDevelopment / 12);

  // Calculate monthly software costs
  const monthlySoftwareCosts = 
    inputs.operational.software.shopify +
    inputs.operational.software.klaviyo +
    inputs.operational.software.quickbooks +
    inputs.operational.software.tidio +
    inputs.operational.software.customSoftware.reduce((sum, software) => sum + software.cost, 0);

  // Use the total budget from budgetAllocation for marketing costs
  const monthlyMarketingCosts = inputs.marketing.budgetAllocation.totalBudget;
  
  for (let month = 0; month < MONTHS_IN_YEAR * 5; month++) {
    // Calculate units for this month with growth
    const monthlyUnits = baseMonthlyUnits * Math.pow(1 + monthlyGrowthRate, month);
    
    // Calculate revenue for this month
    const revenue = monthlyUnits * inputs.pricePerUnit;
    
    // Calculate all monthly expenses
    const cogs = monthlyUnits * cogsPerUnit;
    const processingFees = revenue * (inputs.misc.paymentProcessingFee / 100);
    const returnsRefunds = revenue * (inputs.misc.returnsRefundsPercent / 100);
    
    const totalMonthlyExpenses = 
      cogs + 
      processingFees + 
      returnsRefunds +
      monthlyFixedCosts + 
      monthlySoftwareCosts +
      monthlyMarketingCosts;
    
    const monthlyProfit = revenue - totalMonthlyExpenses;
    
    monthlyRevenue.push(revenue);
    cumulativeProfitTotal += monthlyProfit;
    cumulativeProfit.push(cumulativeProfitTotal);
    cashFlow.push(monthlyProfit);
  }
  
  return { revenue: monthlyRevenue, cumulativeProfit, cashFlow };
}

function calculateMarketingMetrics(
  inputs: FinancialInputs, 
  monthlyRevenue: number[],
  cogsPerUnit: number
): MarketingMetrics {
  const monthlyUnits = inputs.unitsSoldYear1 / MONTHS_IN_YEAR;
  
  // Use the total budget from budgetAllocation
  const totalMonthlyMarketingSpend = inputs.marketing.budgetAllocation.totalBudget;
    
  const acquisitionSpend = totalMonthlyMarketingSpend * (inputs.marketing.acquisitionPercent / 100);
  const retentionSpend = totalMonthlyMarketingSpend - acquisitionSpend;

  // Calculate how many sales we can support with our ad budget
  const profitPerUnit = inputs.pricePerUnit - cogsPerUnit;
  const targetPoas = 1.5; // Target Profit on Ad Spend ratio
  const potentialPaidSales = (totalMonthlyMarketingSpend * targetPoas) / profitPerUnit;
  
  // If our ad budget can support all sales, organic is 0
  // If our ad budget can't support any sales, organic is 100%
  // Otherwise, it's the percentage we can't support with ads
  const paidSales = Math.min(monthlyUnits, potentialPaidSales);
  const organicSales = Math.max(0, monthlyUnits - paidSales);
  const organicPercentage = (organicSales / monthlyUnits) * 100;
  
  const cac = paidSales > 0 ? acquisitionSpend / paidSales : 0;
  
  const monthlyChurnRate = inputs.misc.monthlyChurnRate / 100;
  const customerLifespan = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : 0;
  
  const revenuePerCustomer = inputs.pricePerUnit;
  const grossMarginPerCustomer = revenuePerCustomer - cogsPerUnit;
  
  const ltv = grossMarginPerCustomer * customerLifespan;
  
  return {
    cac,
    ltv,
    monthlyChurn: monthlyChurnRate * 100,
    organicSales,
    paidSales,
    acquisitionSpend,
    retentionSpend,
    customerLifespan,
    organicPercentage
  };
}

function calculateAnnualMetrics(inputs: FinancialInputs, cogsPerUnit: number) {
  const revenue: number[] = [];
  const grossProfit: number[] = [];
  const netProfit: number[] = [];
  
  for (let year = 0; year < 5; year++) {
    // Calculate yearly units with growth
    const yearlyUnits = inputs.unitsSoldYear1 * Math.pow(1 + inputs.annualGrowthRate / 100, year);
    
    // Calculate yearly revenue
    const yearlyRevenue = yearlyUnits * inputs.pricePerUnit;
    
    // Calculate yearly COGS
    const yearlyCOGS = yearlyUnits * cogsPerUnit;
    
    // Calculate returns/refunds (deducted from revenue)
    const yearlyReturns = yearlyRevenue * (inputs.misc.returnsRefundsPercent / 100);
    
    // Calculate Gross Profit (Revenue - COGS - Returns)
    const yearlyGrossProfit = yearlyRevenue - yearlyCOGS - yearlyReturns;
    
    // Calculate yearly operational costs
    const yearlyFixedCosts = 
      inputs.operational.labor + 
      inputs.operational.rentUtilities +
      inputs.operational.officeExpenses +  // Added office expenses
      inputs.operational.workTools +       // Added work tools
      inputs.operational.techFees +        // Added tech fees
      inputs.operational.travel +          // Added travel
      inputs.misc.legalCompliance +
      inputs.misc.researchDevelopment;

    // Use the total budget from budgetAllocation for marketing costs
    const yearlyMarketingCosts = inputs.marketing.budgetAllocation.totalBudget * MONTHS_IN_YEAR;

    const yearlySoftwareCosts = 
      (inputs.operational.software.shopify +
       inputs.operational.software.klaviyo +
       inputs.operational.software.quickbooks +
       inputs.operational.software.tidio +
       inputs.operational.software.customSoftware.reduce((sum, software) => sum + software.cost, 0)) * MONTHS_IN_YEAR;

    // Calculate payment processing fees
    const yearlyProcessingFees = yearlyRevenue * (inputs.misc.paymentProcessingFee / 100);

    // Calculate pre-tax profit
    const yearlyPreTaxProfit = yearlyGrossProfit - 
      yearlyProcessingFees - 
      yearlyFixedCosts - 
      yearlyMarketingCosts - 
      yearlySoftwareCosts;

    // Calculate taxes
    const yearlyTaxes = Math.max(0, yearlyPreTaxProfit * (inputs.misc.taxRate / 100));

    // Calculate Net Profit (Pre-tax profit - Taxes)
    const yearlyNetProfit = yearlyPreTaxProfit - yearlyTaxes;
    
    revenue.push(yearlyRevenue);
    grossProfit.push(yearlyGrossProfit);
    netProfit.push(yearlyNetProfit);
  }
  
  return { revenue, grossProfit, netProfit };
}

function calculateBreakEvenMonth(initialInvestment: number, cumulativeProfit: number[]): number {
  const breakEvenIndex = cumulativeProfit.findIndex(profit => profit >= 0);
  return breakEvenIndex === -1 ? 60 : breakEvenIndex + 1;
}

function calculateExpenseBreakdown(inputs: FinancialInputs, yearlyRevenue: number, yearlyTotalCOGS: number) {
  const yearlyUnits = inputs.unitsSoldYear1;
  
  // Product Materials (part of COGS)
  const productMaterials = calculateProductMaterialsPerUnit(inputs) * yearlyUnits;
  
  // Shipping & Logistics (part of COGS)
  const shipping = calculateShippingCostsPerUnit(inputs) * yearlyUnits;
  
  // Marketing costs - use the total budget from budgetAllocation
  const marketing = inputs.marketing.budgetAllocation.totalBudget * MONTHS_IN_YEAR;

  // Operational costs
  const operational = 
    inputs.operational.labor +
    inputs.operational.rentUtilities +
    inputs.operational.officeExpenses +  // Added office expenses
    inputs.operational.workTools +       // Added work tools
    inputs.operational.techFees +        // Added tech fees
    inputs.operational.travel +          // Added travel
    (inputs.operational.software.shopify +
     inputs.operational.software.klaviyo +
     inputs.operational.software.quickbooks +
     inputs.operational.software.tidio +
     inputs.operational.software.customSoftware.reduce((sum, software) => sum + software.cost, 0)) * MONTHS_IN_YEAR;

  // Misc costs (including taxes, payment processing, returns)
  const processingFees = yearlyRevenue * (inputs.misc.paymentProcessingFee / 100);
  const returnsRefunds = yearlyRevenue * (inputs.misc.returnsRefundsPercent / 100);
  const preTaxProfit = yearlyRevenue - yearlyTotalCOGS - marketing - operational - processingFees - returnsRefunds;
  const taxes = Math.max(0, preTaxProfit * (inputs.misc.taxRate / 100));
  const misc = taxes + processingFees + returnsRefunds + inputs.misc.legalCompliance + inputs.misc.researchDevelopment;

  return {
    productMaterials,
    shipping,
    marketing,
    operational,
    misc
  };
}