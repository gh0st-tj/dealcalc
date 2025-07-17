import React, { useState, useEffect, useCallback } from 'react'
import { Calculator, ArrowRight, Info, DollarSign, Target, Percent, Lock, Unlock, AlertCircle } from 'lucide-react'
import { solveDeal, getCalculationError } from '../utils/calculations'
import { formatCurrency, formatPercentage } from '../utils/formatting.js'

const InputField = React.memo(({ label, value, onChange, field, prefix = '', suffix = '', icon: Icon, color = 'primary', isStatic = false, onToggleStatic = null }) => (
  <div className={`card transition-all duration-300 ${isStatic ? 'ring-2 ring-yellow-500 bg-yellow-900/20' : ''}`}>
    <label className="label flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 text-${color}-500`} />}
        {label}
      </div>
      {onToggleStatic && (
        <button
          onClick={onToggleStatic}
          className={`p-1 rounded transition-colors ${
            isStatic 
              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
          title={isStatic ? `Unlock ${label}` : `Lock ${label}`}
        >
          {isStatic ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </button>
      )}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${isStatic ? 'bg-yellow-900/30 border-yellow-600 text-gray-500' : ''}`}
        step="0.01"
        min="0"
        disabled={isStatic}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono">
          {suffix}
        </span>
      )}
    </div>
  </div>
));

const MarginControl = React.memo(({ inputValues, handleInputChange, handleSliderChange, staticValues, toggleStatic }) => (
  <div className={`card transition-all duration-300 ${staticValues.margin ? 'ring-2 ring-yellow-500 bg-yellow-900/20' : ''}`}>
    <label className="label flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <Percent className="h-4 w-4 text-green-500" />
        Your Margin
      </div>
      <button
        onClick={() => toggleStatic('margin')}
        className={`p-1 rounded transition-colors ${
          staticValues.margin 
            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
        }`}
        title={staticValues.margin ? 'Unlock Margin' : 'Lock Margin'}
      >
        {staticValues.margin ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
      </button>
    </label>
    <div className="space-y-4">
      <div className="relative">
        <input
          type="number"
          value={inputValues.margin}
          onChange={(e) => handleInputChange('margin', e.target.value)}
          className={`input-field pr-8 ${staticValues.margin ? 'bg-yellow-900/30 border-yellow-600 text-gray-500' : ''}`}
          step="0.01"
          min="0"
          max="100"
          disabled={staticValues.margin}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono">%</span>
      </div>
      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={inputValues.margin}
          onChange={(e) => handleSliderChange('margin', e.target.value)}
          disabled={staticValues.margin}
          className="slider w-full"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">0%</span>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{formatPercentage(inputValues.margin)}</div>
          </div>
          <span className="text-sm text-gray-400">100%</span>
        </div>
      </div>
    </div>
  </div>
));

const DealCalculator = () => {
  const [values, setValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    margin: 20,
    brokerEffective: 120,
    affiliateEffective: 100
  });

  const [inputValues, setInputValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    margin: 20
  });

  const [staticValues, setStaticValues] = useState({
    brokerTerms: false,
    affiliateTerms: false,
    brokerCPA: false,
    brokerCRG: false,
    affiliateCPA: false,
    affiliateCRG: false,
    margin: false
  });

  const [showCalculations, setShowCalculations] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState('');

  useEffect(() => {
    // Sync inputs on initial load
    const initialValues = solveDeal(inputValues, staticValues);
    setValues(initialValues);
    setInputValues(initialValues);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setInputValues(prev => ({
      ...prev,
      [field]: numValue
    }));
  }, []);

  const handleSliderChange = useCallback((field, value) => {
    setInputValues(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  }, []);
  
  const toggleStatic = useCallback((field) => {
    setStaticValues(prev => {
      const newStatic = { ...prev };
      const isGroup = field.endsWith('Terms');
      
      if (isGroup) {
        newStatic[field] = !newStatic[field];
      } else {
        newStatic[field] = !newStatic[field];
        // If we unlock an individual field, unlock its parent group too
        if (!newStatic[field]) {
          if (field.startsWith('broker') && newStatic.brokerTerms) {
            newStatic.brokerTerms = false;
          }
          if (field.startsWith('affiliate') && newStatic.affiliateTerms) {
            newStatic.affiliateTerms = false;
          }
        }
      }
      
      const error = getCalculationError(newStatic);
      if (error) {
        setCalculationError(error);
        return prev; // Revert change if it's invalid
      }
      
      setCalculationError('');
      return newStatic;
    });
  }, []);

  const performCalculation = useCallback(() => {
    setIsCalculating(true);

    const error = getCalculationError(staticValues);
    if (error) {
      setCalculationError(error);
      setIsCalculating(false);
      return;
    }
    
    setCalculationError('');

    const newValues = solveDeal(inputValues, staticValues);
    
    setValues(newValues);
    setInputValues(newValues);
    
    setTimeout(() => setIsCalculating(false), 200);
  }, [inputValues, staticValues]);

  const CalculationDisplay = () => (
    <div className="card bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calculator className={`h-5 w-5 text-blue-400 ${isCalculating ? 'animate-pulse' : ''}`} />
          Live Calculations
        </h3>
        <button
          onClick={() => setShowCalculations(!showCalculations)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {showCalculations ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {showCalculations && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="calculation-display">
              <h4 className="font-medium text-gray-200 mb-2">Broker Effective Value</h4>
              <p className="font-mono text-lg text-white">
                {formatCurrency(values.brokerCPA)} × {values.brokerCRG}% = {formatCurrency(values.brokerEffective)}
              </p>
            </div>
            
            <div className="calculation-display">
              <h4 className="font-medium text-gray-200 mb-2">Affiliate Effective Value</h4>
              <p className="font-mono text-lg text-white">
                {formatCurrency(values.affiliateCPA)} × {values.affiliateCRG}% = {formatCurrency(values.affiliateEffective)}
              </p>
            </div>
          </div>
          
          <div className="calculation-display bg-green-900/50 border-green-700">
            <h4 className="font-medium text-gray-200 mb-2">Margin Calculation</h4>
            <p className="font-mono text-lg text-white">
              ({formatCurrency(values.brokerEffective)} - {formatCurrency(values.affiliateEffective)}) ÷ {formatCurrency(values.brokerEffective)} × 100 = {formatPercentage(values.margin)}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const ResultsPanel = () => (
    <div className="card bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Target className="h-5 w-5 text-green-400" />
        Deal Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{formatPercentage(values.margin)}</div>
          <div className="text-sm text-gray-300">Your Margin</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{formatCurrency(values.brokerEffective)}</div>
          <div className="text-sm text-gray-300">Broker Effective</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">{formatCurrency(values.affiliateEffective)}</div>
          <div className="text-sm text-gray-300">Affiliate Effective</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {calculationError && (
        <div className="card bg-red-900/50 border-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-200">{calculationError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">Broker Terms</h3>
            <button
              onClick={() => toggleStatic('brokerTerms')}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${staticValues.brokerTerms ? 'bg-yellow-600' : 'bg-gray-600'}`}
            >
              {staticValues.brokerTerms ? 'Static' : 'Keep Static'}
            </button>
          </div>
          <InputField
            label="Broker CPA"
            value={inputValues.brokerCPA}
            onChange={handleInputChange}
            field="brokerCPA"
            prefix="$"
            icon={DollarSign}
            color="blue"
            isStatic={staticValues.brokerTerms || staticValues.brokerCPA}
            onToggleStatic={() => toggleStatic('brokerCPA')}
          />
          <InputField
            label="Broker CRG"
            value={inputValues.brokerCRG}
            onChange={handleInputChange}
            field="brokerCRG"
            suffix="%"
            icon={Target}
            color="blue"
            isStatic={staticValues.brokerTerms || staticValues.brokerCRG}
            onToggleStatic={() => toggleStatic('brokerCRG')}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">Affiliate Terms</h3>
            <button
              onClick={() => toggleStatic('affiliateTerms')}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${staticValues.affiliateTerms ? 'bg-yellow-600' : 'bg-gray-600'}`}
            >
              {staticValues.affiliateTerms ? 'Static' : 'Keep Static'}
            </button>
          </div>
          <InputField
            label="Affiliate CPA"
            value={inputValues.affiliateCPA}
            onChange={handleInputChange}
            field="affiliateCPA"
            prefix="$"
            icon={DollarSign}
            color="purple"
            isStatic={staticValues.affiliateTerms || staticValues.affiliateCPA}
            onToggleStatic={() => toggleStatic('affiliateCPA')}
          />
          <InputField
            label="Affiliate CRG"
            value={inputValues.affiliateCRG}
            onChange={handleInputChange}
            field="affiliateCRG"
            suffix="%"
            icon={Target}
            color="purple"
            isStatic={staticValues.affiliateTerms || staticValues.affiliateCRG}
            onToggleStatic={() => toggleStatic('affiliateCRG')}
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Target Margin</h3>
          <MarginControl 
            inputValues={inputValues}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
            staticValues={staticValues}
            toggleStatic={toggleStatic}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={performCalculation}
          disabled={isCalculating}
          className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${isCalculating ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-2xl'}`}
        >
          <Calculator className={`h-6 w-6 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculating...' : 'Calculate Deal'}
        </button>
      </div>

      <div className="space-y-6">
        <ResultsPanel />
        <CalculationDisplay />
      </div>
    </div>
  )
}

export default DealCalculator 