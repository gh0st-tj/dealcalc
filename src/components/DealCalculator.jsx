import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Calculator, ArrowRight, Info, DollarSign, Target, Percent, Lock, Unlock, AlertCircle } from 'lucide-react'
import {
  calculateEffectiveValue,
  calculateMargin,
  recalculateFromBrokerCPA,
  recalculateFromBrokerCRG,
  recalculateFromAffiliateCPA,
  recalculateFromAffiliateCRG,
  calculateWithStaticConstraints,
  validateStaticValues,
  formatCurrency,
  formatPercentage
} from '../utils/calculations'

const DealCalculator = () => {
  // Main calculated state
  const [values, setValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    margin: 20,
    brokerEffective: 120,
    affiliateEffective: 100
  })

  // Input state for form inputs
  const [inputValues, setInputValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    margin: 20
  })

  // Static values state
  const [staticValues, setStaticValues] = useState({
    brokerTerms: false,
    affiliateTerms: false,
    brokerCPA: false,
    affiliateCPA: false
  })

  const [showCalculations, setShowCalculations] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState('')
  const inputRefs = useRef({})

  // Initialize calculations on component mount
  useEffect(() => {
    const brokerEffective = calculateEffectiveValue(values.brokerCPA, values.brokerCRG)
    const affiliateEffective = calculateEffectiveValue(values.affiliateCPA, values.affiliateCRG)
    const currentMargin = calculateMargin(brokerEffective, affiliateEffective)
    
    setValues(prev => ({
      ...prev,
      brokerEffective: Math.round(brokerEffective * 100) / 100,
      affiliateEffective: Math.round(affiliateEffective * 100) / 100,
      margin: Math.round(currentMargin * 100) / 100
    }))
  }, [])

  // Handle input changes (no calculation)
  const handleInputChange = useCallback((field, value) => {
    const numValue = parseFloat(value) || 0
    setInputValues(prev => ({
      ...prev,
      [field]: numValue
    }))
    setCalculationError('')
  }, [])

  // Handle slider changes (sync with text input)
  const handleSliderChange = useCallback((field, value) => {
    const numValue = parseFloat(value) || 0
    setInputValues(prev => ({
      ...prev,
      [field]: numValue
    }))
    setCalculationError('')
  }, [])

  // Toggle static values
  const toggleStatic = useCallback((field) => {
    setStaticValues(prev => {
      const newStatic = {
        ...prev,
        [field]: !prev[field]
      }
      
      // Validate that not too many values are static
      if (!validateStaticValues(newStatic)) {
        setCalculationError("Cannot keep too many values static - need at least 2 free variables for calculations")
        return prev
      }
      
      setCalculationError('')
      return newStatic
    })
  }, [])

  // Main calculation function
  const performCalculation = useCallback(() => {
    setIsCalculating(true)
    setCalculationError('')

    try {
      // Validate static values
      if (!validateStaticValues(staticValues)) {
        setCalculationError("Cannot calculate - too many values are static")
        setIsCalculating(false)
        return
      }

      // If margin changed and we have static constraints, use special logic
      if (inputValues.margin !== values.margin && (staticValues.brokerTerms || staticValues.affiliateTerms)) {
        const newValues = calculateWithStaticConstraints(inputValues.margin, inputValues, staticValues)
        setValues(newValues)
        setInputValues(newValues)
      } else {
        // Standard recalculation based on most recently changed value
        // For now, we'll recalculate maintaining the current margin unless margin was specifically changed
        const brokerEffective = calculateEffectiveValue(inputValues.brokerCPA, inputValues.brokerCRG)
        const affiliateEffective = calculateEffectiveValue(inputValues.affiliateCPA, inputValues.affiliateCRG)
        const currentMargin = calculateMargin(brokerEffective, affiliateEffective)
        
        const newValues = {
          ...inputValues,
          margin: Math.round(currentMargin * 100) / 100,
          brokerEffective: Math.round(brokerEffective * 100) / 100,
          affiliateEffective: Math.round(affiliateEffective * 100) / 100
        }
        
        setValues(newValues)
        setInputValues(newValues)
      }
    } catch (error) {
      setCalculationError("Calculation error: " + error.message)
    }
    
    setTimeout(() => setIsCalculating(false), 200)
  }, [inputValues, values, staticValues])

  const InputField = ({ label, value, onChange, field, prefix = '', suffix = '', icon: Icon, color = 'primary', isStatic = false, onToggleStatic = null }) => (
    <div className={`card transition-all duration-300 ${isStatic ? 'ring-2 ring-yellow-500 bg-yellow-900/20' : ''}`}>
      <label className="label flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 text-${color}-500`} />}
          {label}
          {isStatic && <Lock className="h-3 w-3 text-yellow-500" />}
        </div>
        {onToggleStatic && (
          <button
            onClick={onToggleStatic}
            className={`p-1 rounded transition-colors ${
              isStatic 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            title={isStatic ? 'Click to make dynamic' : 'Click to keep static'}
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
          ref={(el) => inputRefs.current[field] = el}
          type="number"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${isStatic ? 'bg-yellow-900/30 border-yellow-600' : ''}`}
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
  )

  const MarginControl = () => (
    <div className="card">
      <label className="label flex items-center gap-2">
        <Percent className="h-4 w-4 text-green-500" />
        Your Margin
      </label>
      <div className="space-y-4">
        {/* Text Input */}
        <div className="relative">
          <input
            type="number"
            value={inputValues.margin}
            onChange={(e) => handleInputChange('margin', e.target.value)}
            className="input-field pr-8"
            step="0.01"
            min="0"
            max="100"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono">
            %
          </span>
        </div>
        
        {/* Slider */}
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={inputValues.margin}
            onChange={(e) => handleSliderChange('margin', e.target.value)}
            className="slider w-full"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">0%</span>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{formatPercentage(inputValues.margin)}</div>
              <div className="text-xs text-gray-400">Target Margin</div>
            </div>
            <span className="text-sm text-gray-400">100%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const CalculationDisplay = () => (
    <div className="card bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calculator className={`h-5 w-5 text-blue-400 ${isCalculating ? 'animate-pulse' : ''}`} />
          Live Calculations
          {isCalculating && (
            <span className="text-xs text-blue-400 animate-pulse">calculating...</span>
          )}
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
              <p className="text-sm text-gray-400 mb-2">
                CPA × Conversion Rate = Effective Value
              </p>
              <p className="font-mono text-lg text-white">
                {formatCurrency(values.brokerCPA)} × {values.brokerCRG}% = {formatCurrency(values.brokerEffective)}
              </p>
            </div>
            
            <div className="calculation-display">
              <h4 className="font-medium text-gray-200 mb-2">Affiliate Effective Value</h4>
              <p className="text-sm text-gray-400 mb-2">
                CPA × Conversion Rate = Effective Value
              </p>
              <p className="font-mono text-lg text-white">
                {formatCurrency(values.affiliateCPA)} × {values.affiliateCRG}% = {formatCurrency(values.affiliateEffective)}
              </p>
            </div>
          </div>
          
          <div className="calculation-display bg-green-900/50 border-green-700">
            <h4 className="font-medium text-gray-200 mb-2">Margin Calculation</h4>
            <p className="text-sm text-gray-400 mb-2">
              (Broker Effective - Affiliate Effective) ÷ Broker Effective × 100
            </p>
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
          <div className="text-3xl font-bold text-green-400 mb-1">
            {formatPercentage(values.margin)}
          </div>
          <div className="text-sm text-gray-300">Your Margin</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {formatCurrency(values.brokerEffective)}
          </div>
          <div className="text-sm text-gray-300">Broker Effective Value</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {formatCurrency(values.affiliateEffective)}
          </div>
          <div className="text-sm text-gray-300">Affiliate Effective Value</div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-green-700">
        <h4 className="font-medium text-gray-200 mb-2">Deal Structure</h4>
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Broker pays you: {formatCurrency(values.brokerCPA)} at {values.brokerCRG}% CRG</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span>You pay affiliate: {formatCurrency(values.affiliateCPA)} at {values.affiliateCRG}% CRG</span>
        </div>
        <div className="mt-2 text-center text-sm text-gray-300">
          Profit per effective conversion: {formatCurrency(values.brokerEffective - values.affiliateEffective)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Message */}
      {calculationError && (
        <div className="card bg-red-900/50 border-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-200">{calculationError}</p>
          </div>
        </div>
      )}

      {/* Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broker Terms */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">
              Broker Terms
            </h3>
            <button
              onClick={() => toggleStatic('brokerTerms')}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                staticValues.brokerTerms 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
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
            isStatic={staticValues.brokerTerms}
          />
        </div>

        {/* Affiliate Terms */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">
              Affiliate Terms
            </h3>
            <button
              onClick={() => toggleStatic('affiliateTerms')}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                staticValues.affiliateTerms 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
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
            isStatic={staticValues.affiliateTerms}
          />
        </div>

        {/* Margin Control */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">
            Target Margin
          </h3>
          <MarginControl />
          
          <div className="card bg-yellow-900/50 border-yellow-700">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Static Values:</p>
                <p>Use "Keep Static" buttons to lock values. When margin changes, other values adjust accordingly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button - Full Width */}
      <div className="flex justify-center">
        <button
          onClick={performCalculation}
          disabled={isCalculating}
          className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
            isCalculating
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          <Calculator className={`h-6 w-6 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculating...' : 'Calculate Deal'}
        </button>
      </div>

      {/* Results and Calculations */}
      <div className="space-y-6">
        <ResultsPanel />
        <CalculationDisplay />
      </div>

      {/* Example Scenarios */}
      <div className="card bg-gray-800/50 border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4">Example Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-medium text-gray-200 mb-2">Scenario A: Same CRG</h4>
            <p className="text-sm text-gray-300 mb-2">
              Broker: $1200 CPA @ 10% CRG → $120 effective
            </p>
            <p className="text-sm text-gray-300 mb-2">
              Affiliate: $960 CPA @ 10% CRG → $96 effective
            </p>
            <p className="text-sm font-medium text-green-400">
              Margin: 20% ({formatCurrency(24)} profit per effective conversion)
            </p>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-medium text-gray-200 mb-2">Scenario B: Different CRG</h4>
            <p className="text-sm text-gray-300 mb-2">
              Broker: $1200 CPA @ 10% CRG → $120 effective
            </p>
            <p className="text-sm text-gray-300 mb-2">
              Affiliate: $1200 CPA @ 8% CRG → $96 effective
            </p>
            <p className="text-sm font-medium text-green-400">
              Margin: 20% ({formatCurrency(24)} profit per effective conversion)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealCalculator 