import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Calculator, ArrowRight, Info, DollarSign, Target, Percent, Lock, Unlock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { solveDeal, getCalculationError } from '../utils/calculations'
import { formatCurrency, formatPercentage } from '../utils/formatting.js'

// Debug logging utility
const debugLog = (action, field, data) => {
  // Only log important events to reduce console spam
  const importantEvents = ['TOGGLE_STATIC_ATTEMPT', 'TOGGLE_STATIC_FAILED', 'SOLO_MODE_ATTEMPT', 'SOLO_MODE_FAILED', 'CLEAR_ALL_ATTEMPT', 'CLEAR_ALL_SUCCESS'];
  if (importantEvents.includes(action)) {
    console.log(`🔒 LOCK DEBUG: ${action}`, {
      field,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

const InputField = React.memo(({ label, value, onChange, field, prefix = '', suffix = '', icon: Icon, color = 'primary', isStatic = false, onToggleStatic = null, isLockDisabled = false, onSoloMode = null }) => {
  const [lastClickTime, setLastClickTime] = useState(0);
  const DEBOUNCE_TIME = 300; // 300ms between clicks
  
  const handleLockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_TIME) {
      return; // Ignore rapid clicks
    }
    setLastClickTime(now);
    
    if (onToggleStatic) {
      onToggleStatic();
    }
  };
  
  const handleSoloClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_TIME) {
      return; // Ignore rapid clicks
    }
    setLastClickTime(now);
    
    if (onSoloMode) {
      onSoloMode();
    }
  };

  return (
    <div className={`card transition-all duration-300 ${isStatic ? 'ring-2 ring-yellow-500 bg-yellow-900/20' : ''}`}>
      <label className="label flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 text-${color}-500`} />}
          {label}
        </div>
        <div className="flex items-center gap-3">
          {onSoloMode && (
            <button
              onClick={handleSoloClick}
              className="p-2 rounded transition-colors bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500"
              title={`Solo mode: Lock all others except ${label}`}
            >
              <Eye className="h-3 w-3" />
            </button>
          )}
          {onToggleStatic && (
            <button
              onClick={handleLockClick}
              disabled={isLockDisabled && !isStatic}
              className={`p-2 rounded transition-colors border ${
                isStatic 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-500' 
                  : isLockDisabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-gray-600'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500 border-gray-500'
              }`}
              title={
                isLockDisabled && !isStatic 
                  ? `Cannot lock ${label} - would create unsolvable state`
                  : isStatic 
                  ? `Unlock ${label}` 
                  : `Lock ${label}`
              }
            >
              {isStatic ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </button>
          )}
        </div>
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
  );
});

const MarginControl = React.memo(({ inputValues, handleInputChange, handleSliderChange, staticValues, toggleStatic, isLockDisabled, onSoloMode }) => {
  const [lastClickTime, setLastClickTime] = useState(0);
  const DEBOUNCE_TIME = 300; // 300ms between clicks
  
  const handleLockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_TIME) {
      return; // Ignore rapid clicks
    }
    setLastClickTime(now);
    
    toggleStatic('margin');
  };
  
  const handleSoloClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_TIME) {
      return; // Ignore rapid clicks
    }
    setLastClickTime(now);
    
    onSoloMode();
  };

  return (
    <div className={`card transition-all duration-300 ${staticValues.margin ? 'ring-2 ring-yellow-500 bg-yellow-900/20' : ''}`}>
      <label className="label flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-green-500" />
          Your Margin
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSoloClick}
            className="p-2 rounded transition-colors bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500"
            title="Solo mode: Lock all others except Margin"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={handleLockClick}
            disabled={isLockDisabled && !staticValues.margin}
            className={`p-2 rounded transition-colors border ${
              staticValues.margin 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-500' 
                : isLockDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-gray-600'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500 border-gray-500'
            }`}
            title={
              isLockDisabled && !staticValues.margin
                ? 'Cannot lock Margin - would create unsolvable state'
                : staticValues.margin 
                ? 'Unlock Margin' 
                : 'Lock Margin'
            }
          >
            {staticValues.margin ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        </div>
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
  );
});

const DealCalculator = () => {
  const [values, setValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    affiliateCPL: 100,
    margin: 20,
    brokerEffective: 120,
    affiliateEffective: 100
  });

  const [inputValues, setInputValues] = useState({
    brokerCPA: 1200,
    brokerCRG: 10,
    affiliateCPA: 1000,
    affiliateCRG: 10,
    affiliateCPL: 100, // CPL = CPA × (CRG / 100) = 1000 × 0.1 = 100
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
  const [lockAttemptError, setLockAttemptError] = useState('');
  const [autoCalculate, setAutoCalculate] = useState(true);

  useEffect(() => {
    // Sync inputs on initial load
    const initialValues = solveDeal(inputValues, staticValues);
    // Calculate initial CPL
    const initialCPL = initialValues.affiliateCPA && initialValues.affiliateCRG 
      ? (initialValues.affiliateCPA * (initialValues.affiliateCRG / 100)) 
      : 100;
    
    const completeInitialValues = {
      ...initialValues,
      affiliateCPL: Math.round(initialCPL * 100) / 100
    };
    
    setValues(completeInitialValues);
    setInputValues(completeInitialValues);
    debugLog('INITIAL_LOAD', 'all', { initialValues: completeInitialValues, staticValues });
  }, []);

  // Auto-calculate when inputs or static values change (debounced)
  useEffect(() => {
    if (!autoCalculate) return;
    
    const timeoutId = setTimeout(() => {
      debugLog('AUTO_CALCULATE_TRIGGER', 'auto', { inputValues, staticValues, autoCalculate });
      
      const error = getCalculationError(staticValues);
      if (error) {
        setCalculationError(error);
        return;
      }
      
      setCalculationError('');
      const newValues = solveDeal(inputValues, staticValues);
      
      // Calculate CPL for the new values
      const newCPL = newValues.affiliateCPA && newValues.affiliateCRG 
        ? (newValues.affiliateCPA * (newValues.affiliateCRG / 100)) 
        : inputValues.affiliateCPL || 0;
      
      const completeNewValues = {
        ...newValues,
        affiliateCPL: Math.round(newCPL * 100) / 100
      };
      
      // Only update if values actually changed to prevent infinite loops
      setValues(prevValues => {
        const hasChanges = Object.keys(completeNewValues).some(key => 
          Math.abs((prevValues[key] || 0) - (completeNewValues[key] || 0)) > 0.001
        );
        
        if (hasChanges) {
          debugLog('AUTO_CALCULATE_RESULT', 'auto', { newValues: completeNewValues, changes: true });
          return completeNewValues;
        } else {
          debugLog('AUTO_CALCULATE_RESULT', 'auto', { newValues: completeNewValues, changes: false });
          return prevValues;
        }
      });
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [inputValues, staticValues, autoCalculate]);

  const handleInputChange = useCallback((field, value) => {
    debugLog('INPUT_CHANGE', field, { newValue: value });
    const numValue = value === '' ? '' : parseFloat(value);
    setInputValues(prev => ({
      ...prev,
      [field]: numValue
    }));
  }, []);

  const handleSliderChange = useCallback((field, value) => {
    debugLog('SLIDER_CHANGE', field, { newValue: value });
    setInputValues(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  }, []);

  // Specialized handler for affiliate CRG that syncs with CPL
  const handleAffiliateCRGChange = useCallback((field, value) => {
    debugLog('AFFILIATE_CRG_CHANGE', field, { newValue: value });
    const numValue = value === '' ? '' : parseFloat(value);
    setInputValues(prev => {
      const newCPL = prev.affiliateCPA && numValue ? (prev.affiliateCPA * (numValue / 100)) : 0;
      return {
        ...prev,
        affiliateCRG: numValue,
        affiliateCPL: Math.round(newCPL * 100) / 100 // Round to 2 decimal places
      };
    });
  }, []);

  // Specialized handler for affiliate CPL that syncs with CRG
  const handleAffiliateCPLChange = useCallback((field, value) => {
    debugLog('AFFILIATE_CPL_CHANGE', field, { newValue: value });
    const numValue = value === '' ? '' : parseFloat(value);
    setInputValues(prev => {
      const newCRG = prev.affiliateCPA && numValue ? ((numValue / prev.affiliateCPA) * 100) : 0;
      return {
        ...prev,
        affiliateCPL: numValue,
        affiliateCRG: Math.round(newCRG * 100) / 100 // Round to 2 decimal places
      };
    });
  }, []);

  // Specialized handler for affiliate CPA that syncs CPL when CRG is set
  const handleAffiliateCPAChange = useCallback((field, value) => {
    debugLog('AFFILIATE_CPA_CHANGE', field, { newValue: value });
    const numValue = value === '' ? '' : parseFloat(value);
    setInputValues(prev => {
      const newCPL = numValue && prev.affiliateCRG ? (numValue * (prev.affiliateCRG / 100)) : prev.affiliateCPL;
      return {
        ...prev,
        affiliateCPA: numValue,
        affiliateCPL: Math.round(newCPL * 100) / 100 // Round to 2 decimal places
      };
    });
  }, []);
  
  // Memoized lock allowance state to prevent infinite re-renders
  const lockAllowanceState = useMemo(() => {
    const state = {};
    const fields = ['brokerTerms', 'affiliateTerms', 'brokerCPA', 'brokerCRG', 'affiliateCPA', 'affiliateCRG', 'margin'];
    
    fields.forEach(field => {
      const newStatic = { ...staticValues };
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
      state[field] = !error;
    });
    
    return state;
  }, [staticValues]);
  
  // Helper function to check if a lock would be allowed
  const isLockAllowed = useCallback((field) => {
    return lockAllowanceState[field];
  }, [lockAllowanceState]);

  // Solo mode function - lock all others except the specified field
  const handleSoloMode = useCallback((keepField) => {
    debugLog('SOLO_MODE_ATTEMPT', keepField, { currentStatic: staticValues });
    
    const newStatic = {
      brokerTerms: false,
      affiliateTerms: false,
      brokerCPA: keepField !== 'brokerCPA',
      brokerCRG: keepField !== 'brokerCRG',
      affiliateCPA: keepField !== 'affiliateCPA',
      affiliateCRG: keepField !== 'affiliateCRG',
      margin: keepField !== 'margin'
    };

    const error = getCalculationError(newStatic);
    if (error) {
      debugLog('SOLO_MODE_FAILED', keepField, { newStatic, error });
      setLockAttemptError(`Cannot enter solo mode for ${keepField}: ${error}`);
      setTimeout(() => setLockAttemptError(''), 4000);
      return;
    }

    debugLog('SOLO_MODE_SUCCESS', keepField, { newStatic });
    setStaticValues(newStatic);
    setCalculationError('');
    setLockAttemptError('');
  }, [staticValues]);

  // Count how many fields are currently locked
  const lockedFieldsCount = useMemo(() => {
    return Object.values(staticValues).filter(Boolean).length;
  }, [staticValues]);

  // Clear all locks function
  const handleClearAll = useCallback(() => {
    debugLog('CLEAR_ALL_ATTEMPT', 'all', { currentStatic: staticValues });
    
    const clearedStatic = {
      brokerTerms: false,
      affiliateTerms: false,
      brokerCPA: false,
      brokerCRG: false,
      affiliateCPA: false,
      affiliateCRG: false,
      margin: false
    };

    debugLog('CLEAR_ALL_SUCCESS', 'all', { clearedStatic });
    setStaticValues(clearedStatic);
    setCalculationError('');
    setLockAttemptError('');
  }, [staticValues]);
  
  const toggleStatic = useCallback((field) => {
    debugLog('TOGGLE_STATIC_ATTEMPT', field, { 
      currentValue: staticValues[field],
      currentStatic: staticValues 
    });
    
    // Clear any previous lock attempt errors
    setLockAttemptError('');
    
    setStaticValues(prev => {
      const newStatic = { ...prev };
      const isGroup = field.endsWith('Terms');
      const oldValue = newStatic[field];
      
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
      
      debugLog('TOGGLE_STATIC_PROCESSING', field, {
        oldValue,
        newValue: newStatic[field],
        oldStatic: prev,
        newStatic
      });
      
      const error = getCalculationError(newStatic);
      if (error) {
        debugLog('TOGGLE_STATIC_FAILED', field, { error, revertingTo: prev });
        // Show specific error message for lock attempt
        setLockAttemptError(`Cannot lock this field: ${error}`);
        // Auto-clear the error after 4 seconds
        setTimeout(() => setLockAttemptError(''), 4000);
        return prev; // Revert change if it's invalid
      }
      
      debugLog('TOGGLE_STATIC_SUCCESS', field, { 
        finalStatic: newStatic,
        changedFrom: oldValue,
        changedTo: newStatic[field]
      });
      
      setCalculationError('');
      return newStatic;
    });
  }, []);

  const performCalculation = useCallback(() => {
    debugLog('CALCULATE_START', 'manual', { inputValues, staticValues });
    
    setIsCalculating(true);
    setLockAttemptError(''); // Clear lock errors when calculating

    const error = getCalculationError(staticValues);
    if (error) {
      debugLog('CALCULATE_FAILED', 'validation', { error });
      setCalculationError(error);
      setIsCalculating(false);
      return;
    }
    
    setCalculationError('');

    const newValues = solveDeal(inputValues, staticValues);
    
    // Calculate CPL for the new values
    const newCPL = newValues.affiliateCPA && newValues.affiliateCRG 
      ? (newValues.affiliateCPA * (newValues.affiliateCRG / 100)) 
      : inputValues.affiliateCPL || 0;
    
    const completeNewValues = {
      ...newValues,
      affiliateCPL: Math.round(newCPL * 100) / 100
    };
    
    debugLog('CALCULATE_SUCCESS', 'result', { 
      inputValues, 
      staticValues, 
      newValues: completeNewValues,
      differences: Object.keys(completeNewValues).reduce((acc, key) => {
        if (values[key] !== completeNewValues[key]) {
          acc[key] = { old: values[key], new: completeNewValues[key] };
        }
        return acc;
      }, {})
    });
    
    setValues(completeNewValues);
    setInputValues(completeNewValues);
    
    setTimeout(() => setIsCalculating(false), 200);
  }, [inputValues, staticValues, values]);

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
      {lockAttemptError && (
        <div className="card bg-yellow-900/50 border-yellow-700">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-200">{lockAttemptError}</p>
          </div>
        </div>
      )}
      {lockAttemptError && (
        <div className="card bg-yellow-900/50 border-yellow-700">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-200">{lockAttemptError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">Broker Terms</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStatic('brokerTerms');
              }}
              disabled={!isLockAllowed('brokerTerms') && !staticValues.brokerTerms}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors border ${
                staticValues.brokerTerms 
                  ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white' 
                  : !isLockAllowed('brokerTerms')
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-gray-600'
                  : 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-white'
              }`}
              title={
                !isLockAllowed('brokerTerms') && !staticValues.brokerTerms
                  ? 'Cannot lock Broker Terms - would create unsolvable state'
                  : staticValues.brokerTerms
                  ? 'Unlock Broker Terms'
                  : 'Lock Broker Terms'
              }
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
            isLockDisabled={!isLockAllowed('brokerCPA')}
            onSoloMode={() => handleSoloMode('brokerCPA')}
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
            isLockDisabled={!isLockAllowed('brokerCRG')}
            onSoloMode={() => handleSoloMode('brokerCRG')}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 flex-1">Affiliate Terms</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStatic('affiliateTerms');
              }}
              disabled={!isLockAllowed('affiliateTerms') && !staticValues.affiliateTerms}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors border ${
                staticValues.affiliateTerms 
                  ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white' 
                  : !isLockAllowed('affiliateTerms')
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-gray-600'
                  : 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-white'
              }`}
              title={
                !isLockAllowed('affiliateTerms') && !staticValues.affiliateTerms
                  ? 'Cannot lock Affiliate Terms - would create unsolvable state'
                  : staticValues.affiliateTerms
                  ? 'Unlock Affiliate Terms'
                  : 'Lock Affiliate Terms'
              }
            >
              {staticValues.affiliateTerms ? 'Static' : 'Keep Static'}
            </button>
          </div>
          <InputField
            label="Affiliate CPA"
            value={inputValues.affiliateCPA}
            onChange={handleAffiliateCPAChange}
            field="affiliateCPA"
            prefix="$"
            icon={DollarSign}
            color="purple"
            isStatic={staticValues.affiliateTerms || staticValues.affiliateCPA}
            onToggleStatic={() => toggleStatic('affiliateCPA')}
            isLockDisabled={!isLockAllowed('affiliateCPA')}
            onSoloMode={() => handleSoloMode('affiliateCPA')}
          />
          <div className="space-y-4">
            <InputField
              label="Affiliate CRG"
              value={typeof inputValues.affiliateCRG === 'number' ? inputValues.affiliateCRG.toFixed(2) : inputValues.affiliateCRG}
              onChange={handleAffiliateCRGChange}
              field="affiliateCRG"
              suffix="%"
              icon={Target}
              color="purple"
              isStatic={staticValues.affiliateTerms || staticValues.affiliateCRG}
              onToggleStatic={() => toggleStatic('affiliateCRG')}
              isLockDisabled={!isLockAllowed('affiliateCRG')}
              onSoloMode={() => handleSoloMode('affiliateCRG')}
            />
            <InputField
              label="Affiliate CPL"
              value={inputValues.affiliateCPL}
              onChange={handleAffiliateCPLChange}
              field="affiliateCPL"
              prefix="$"
              icon={Target}
              color="purple"
              isStatic={staticValues.affiliateTerms || staticValues.affiliateCRG} // CPL follows CRG static state
              onToggleStatic={null} // CPL doesn't have its own lock, follows CRG
              isLockDisabled={false}
              onSoloMode={null} // CPL doesn't have solo mode
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">Target Margin</h3>
          <MarginControl 
            inputValues={inputValues}
            handleInputChange={handleInputChange}
            handleSliderChange={handleSliderChange}
            staticValues={staticValues}
            toggleStatic={toggleStatic}
            isLockDisabled={!isLockAllowed('margin')}
            onSoloMode={() => handleSoloMode('margin')}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={performCalculation}
            disabled={isCalculating}
            className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${isCalculating ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-2xl'}`}
          >
            <Calculator className={`h-6 w-6 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Calculate Deal'}
          </button>

          <button
            onClick={handleClearAll}
            disabled={lockedFieldsCount === 0}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${
              lockedFieldsCount === 0 
                ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-2xl'
            }`}
            title={
              lockedFieldsCount === 0 
                ? 'No fields are currently locked' 
                : `Unlock all ${lockedFieldsCount} locked field${lockedFieldsCount > 1 ? 's' : ''}`
            }
          >
            <Unlock className="h-5 w-5" />
            Clear All Locks {lockedFieldsCount > 0 && `(${lockedFieldsCount})`}
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="autoCalculate"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
            />
            <label htmlFor="autoCalculate" className="text-gray-300 cursor-pointer">
              Auto-calculate on input change
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info className="h-4 w-4" />
          <span>Check console (F12) for detailed debug logs when lock buttons don't work</span>
        </div>
      </div>

      <div className="space-y-6">
        <ResultsPanel />
        <CalculationDisplay />
      </div>
    </div>
  )
}

export default DealCalculator 