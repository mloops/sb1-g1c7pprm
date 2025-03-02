import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportData } from '../types';

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();
  const { inputs, metrics, scenario } = data;

  // Title and Model Name
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.text(inputs.modelName, 20, 20);
  
  // Description
  doc.setFontSize(12);
  doc.setTextColor(127, 140, 141);
  doc.text(inputs.modelDescription, 20, 30);
  
  // Report Type and Scenario
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.text('Financial Projection Report', 20, 45);
  doc.text(`Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`, 20, 55);

  // Key Metrics
  autoTable(doc, {
    startY: 65,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    head: [['Key Metrics', 'Value']],
    body: [
      ['Price per Unit', `$${inputs.pricePerUnit.toLocaleString()}`],
      ['Year 1 Units', inputs.unitsSoldYear1.toLocaleString()],
      ['Growth Rate', `${inputs.annualGrowthRate}%`],
      ['Gross Margin', `${metrics.margins.gross.toFixed(1)}%`],
      ['Net Margin', `${metrics.margins.net.toFixed(1)}%`],
      ['Break-even Month', metrics.breakEvenMonth],
      ['LTV:CAC Ratio', metrics.ltvCacRatio.toFixed(2)],
    ],
  });

  // Financial Projections
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    head: [['5-Year Financial Projections', 'Revenue', 'Gross Profit', 'Net Profit']],
    body: Array(5).fill(0).map((_, i) => [
      `Year ${i + 1}`,
      `$${metrics.revenue[i].toLocaleString()}`,
      `$${metrics.grossProfit[i].toLocaleString()}`,
      `$${metrics.netProfit[i].toLocaleString()}`,
    ]),
  });

  // Cost Structure
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    head: [['Cost Structure', 'Amount per Unit']],
    body: [
      ['Product Box', `$${inputs.costs.productBox.toFixed(2)}`],
      ['Bottle & Sprayer', `$${inputs.costs.bottleSprayer.toFixed(2)}`],
      ['Concentrate', `$${inputs.costs.concentrate.toFixed(2)}`],
      ['NFC Chip', `$${inputs.costs.nfcChip.toFixed(2)}`],
      ['Print Materials', `$${inputs.costs.printMaterials.toFixed(2)}`],
      ['Shipping Box', `$${inputs.costs.shippingBox.toFixed(2)}`],
      ['Manufacturing Labor', `$${inputs.costs.manufacturingLabor.toFixed(2)}`],
      ...inputs.costs.customCosts.map(cost => [cost.name, `$${cost.amount.toFixed(2)}`]),
    ],
  });

  // Marketing Metrics
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
    },
    head: [['Marketing Metrics', 'Value']],
    body: [
      ['Customer Acquisition Cost', `$${metrics.marketingMetrics.cac.toFixed(2)}`],
      ['Customer Lifetime Value', `$${metrics.marketingMetrics.ltv.toFixed(2)}`],
      ['Monthly Churn Rate', `${metrics.marketingMetrics.monthlyChurn.toFixed(1)}%`],
      ['Organic Sales %', `${metrics.marketingMetrics.organicPercentage.toFixed(1)}%`],
      ['Monthly Marketing Budget', `$${inputs.marketing.budgetAllocation.totalBudget.toLocaleString()}`],
    ],
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(
      `Project Myrrh - Generated on ${new Date().toLocaleDateString()}`,
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  const fileName = `${inputs.modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${scenario}`.replace(/-+/g, '-');
  doc.save(`${fileName}.pdf`);
}

export function exportToCSV(data: ExportData) {
  const { inputs, metrics } = data;
  
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  
  const rows = [
    // Header
    ['Model Details'],
    ['Name', inputs.modelName],
    ['Description', inputs.modelDescription],
    ['Generated Date', new Date().toLocaleDateString()],
    [],
    
    // Key Metrics
    ['Key Metrics'],
    ['Metric', 'Value'],
    ['Price per Unit', formatCurrency(inputs.pricePerUnit)],
    ['Year 1 Units', inputs.unitsSoldYear1.toLocaleString()],
    ['Growth Rate', formatPercent(inputs.annualGrowthRate)],
    ['Gross Margin', formatPercent(metrics.margins.gross)],
    ['Net Margin', formatPercent(metrics.margins.net)],
    ['Break-even Month', metrics.breakEvenMonth],
    ['LTV:CAC Ratio', metrics.ltvCacRatio.toFixed(2)],
    [],
    
    // Financial Projections
    ['5-Year Financial Projections'],
    ['Year', 'Revenue', 'Gross Profit', 'Net Profit'],
    ...Array(5).fill(0).map((_, i) => [
      `Year ${i + 1}`,
      formatCurrency(metrics.revenue[i]),
      formatCurrency(metrics.grossProfit[i]),
      formatCurrency(metrics.netProfit[i]),
    ]),
    [],
    
    // Cost Structure
    ['Cost Structure'],
    ['Component', 'Cost per Unit'],
    ['Product Box', formatCurrency(inputs.costs.productBox)],
    ['Bottle & Sprayer', formatCurrency(inputs.costs.bottleSprayer)],
    ['Concentrate', formatCurrency(inputs.costs.concentrate)],
    ['NFC Chip', formatCurrency(inputs.costs.nfcChip)],
    ['Print Materials', formatCurrency(inputs.costs.printMaterials)],
    ['Shipping Box', formatCurrency(inputs.costs.shippingBox)],
    ['Manufacturing Labor', formatCurrency(inputs.costs.manufacturingLabor)],
    ...inputs.costs.customCosts.map(cost => [cost.name, formatCurrency(cost.amount)]),
    [],
    
    // Marketing Metrics
    ['Marketing Metrics'],
    ['Metric', 'Value'],
    ['Customer Acquisition Cost', formatCurrency(metrics.marketingMetrics.cac)],
    ['Customer Lifetime Value', formatCurrency(metrics.marketingMetrics.ltv)],
    ['Monthly Churn Rate', formatPercent(metrics.marketingMetrics.monthlyChurn)],
    ['Organic Sales %', formatPercent(metrics.marketingMetrics.organicPercentage)],
    ['Monthly Marketing Budget', formatCurrency(inputs.marketing.budgetAllocation.totalBudget)],
  ];

  const csvContent = rows.map(row => row.map(cell => 
    typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
  ).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  
  const fileName = `${inputs.modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+/g, '-');
  link.download = `${fileName}.csv`;
  link.click();
}