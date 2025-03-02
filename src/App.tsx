import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InputSection } from './components/InputSection';
import { CostsInput } from './components/CostsInput';
import { MarketingInput } from './components/MarketingInput';
import { OperationalInput } from './components/OperationalInput';
import { ShippingInput } from './components/ShippingInput';
import { MiscInput } from './components/MiscInput';
import { Dashboard } from './components/Dashboard';
import { ExportButtons } from './components/ExportButtons';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthButtons } from './components/AuthButtons';
import { ModelSelector } from './components/ModelSelector';
import { calculateMetrics } from './utils/calculations';
import { supabase } from './utils/supabase';
import type { FinancialInputs } from './types';
import { Pencil, PlusCircle } from 'lucide-react';

const defaultInputs: FinancialInputs = {
  modelName: 'Untitled Model',
  modelDescription: 'Describe your model',
  pricePerUnit: 65,
  unitsSoldYear1: 8000,
  annualGrowthRate: 50,
  initialInvestment: 100000,
  costs: {
    productBox: 2.00,
    bottleSprayer: 3.50,
    concentrate: 5.00,
    nfcChip: 1.00,
    printMaterials: 0.75,
    shippingBox: 1.50,
    manufacturingLabor: 1.50,
    customCosts: []
  },
  marketing: {
    paidAds: 10000,
    influencerBudget: 2500,
    contentBudget: 1000,
    acquisitionPercent: 70,
    budgetAllocation: {
      totalBudget: 10000,
      sources: {
        meta: { percentage: 30, cpc: 1.50, conversionRate: 2.0 },
        google: { percentage: 25, cpc: 2.50, conversionRate: 3.5 },
        tiktok: { percentage: 20, cpc: 1.00, conversionRate: 1.5 },
        influencer: { percentage: 15, cpc: 2.00, conversionRate: 4.0 },
        retargeting: { percentage: 10, cpc: 0.50, conversionRate: 8.0 }
      }
    }
  },
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
  },
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
  },
  misc: {
    paymentProcessingFee: 1.0,
    taxRate: 20,
    returnsRefundsPercent: 2.0,
    monthlyChurnRate: 5,
    legalCompliance: 5000,
    researchDevelopment: 20000
  },
  darkMode: false
};

function App() {
  const [inputs, setInputs] = useState<FinancialInputs>(() => {
    // Try to load saved inputs from localStorage
    const savedInputs = localStorage.getItem('financialInputs');
    return savedInputs ? JSON.parse(savedInputs) : defaultInputs;
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const metrics = useMemo(() => calculateMetrics(inputs), [inputs]);

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save inputs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financialInputs', JSON.stringify(inputs));
  }, [inputs]);

  const handleAuthChange = () => {
    // Refresh authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  };

  const handleNewModel = () => {
    if (confirm('Are you sure you want to start a new model? This will reset all values to defaults.')) {
      setInputs(defaultInputs);
      setCurrentModelId(null); // Reset the current model ID when creating a new model
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="font-press-start text-xs text-gray-400 dark:text-gray-600 opacity-70">
                  Project Code Myrrh
                </h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleNewModel}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Model
                  </button>
                  <ModelSelector 
                    currentModel={{
                      name: inputs.modelName,
                      description: inputs.modelDescription
                    }}
                    inputs={inputs}
                    onLoadModel={setInputs}
                    isAuthenticated={isAuthenticated}
                    currentModelId={currentModelId}
                    onModelIdChange={setCurrentModelId}
                  />
                  <AuthButtons 
                    isAuthenticated={isAuthenticated}
                    onAuthChange={handleAuthChange}
                  />
                  <ThemeToggle
                    darkMode={inputs.darkMode}
                    onChange={(darkMode) => setInputs(prev => ({ ...prev, darkMode }))}
                  />
                </div>
              </div>
              
              <header className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    {isEditingName ? (
                      <input
                        type="text"
                        value={inputs.modelName}
                        onChange={(e) => setInputs(prev => ({ ...prev, modelName: e.target.value }))}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                        className="text-2xl font-medium bg-transparent border-b-2 border-gray-500 focus:outline-none text-gray-900 dark:text-white"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                          {inputs.modelName}
                        </h2>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <ExportButtons
                      data={{
                        inputs,
                        metrics,
                        scenario: 'base'
                      }}
                    />
                  </div>
                </div>
                {isEditingDescription ? (
                  <input
                    type="text"
                    value={inputs.modelDescription}
                    onChange={(e) => setInputs(prev => ({ ...prev, modelDescription: e.target.value }))}
                    onBlur={() => setIsEditingDescription(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingDescription(false)}
                    className="text-base bg-transparent border-b-2 border-gray-500 focus:outline-none text-gray-600 dark:text-gray-400 w-full"
                    autoFocus
                  />
                ) : (
                  <div className="group relative inline-block">
                    <p 
                      onClick={() => setIsEditingDescription(true)}
                      className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                      {inputs.modelDescription}
                    </p>
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Pencil className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="card">
                    <InputSection
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                  <div className="card">
                    <CostsInput
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                  <div className="card">
                    <ShippingInput
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                  <div className="card">
                    <OperationalInput
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                  <div className="card">
                    <MarketingInput
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                  <div className="card">
                    <MiscInput
                      inputs={inputs}
                      onChange={setInputs}
                    />
                  </div>
                </div>
                <div className="lg:sticky lg:top-8 lg:self-start">
                  <Dashboard metrics={metrics} darkMode={inputs.darkMode} inputs={inputs} />
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;