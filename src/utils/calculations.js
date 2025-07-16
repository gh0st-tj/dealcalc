// Core calculation functions for affiliate marketing deals

export const calculateEffectiveValue = (cpa, crg) => {
  return (cpa || 0) * ((crg || 0) / 100);
};

export const calculateMargin = (brokerEffective, affiliateEffective) => {
  if (brokerEffective === 0) return 0;
  return ((brokerEffective - affiliateEffective) / brokerEffective) * 100;
};

// Check if too many values are static (validation)
export const validateStaticValues = (staticValues) => {
  const total = Object.values(staticValues).length;
  const staticCount = Object.values(staticValues).filter(Boolean).length;
  // Need at least 2 dynamic (non-static) variables
  return staticCount <= total - 2;
};

// Calculate with static constraints
export const calculateWithStaticConstraints = (newMargin, currentValues, staticValues) => {
  const { brokerCPA, brokerCRG, affiliateCPA, affiliateCRG } = currentValues;
  
  // If affiliate terms are static, adjust broker terms
  if (staticValues.affiliateTerms) {
    const affiliateEffective = calculateEffectiveValue(affiliateCPA, affiliateCRG);
    const brokerEffective = affiliateEffective / (1 - newMargin / 100);
    
    // Determine which broker variable we can adjust
    if (staticValues.brokerCPA && !staticValues.brokerCRG) {
      // Broker CPA locked, adjust CRG
      const newBrokerCRG = brokerCPA > 0 ? (brokerEffective / brokerCPA) * 100 : 0;
      return {
        brokerCPA,
        brokerCRG: Math.round(newBrokerCRG * 100) / 100,
        affiliateCPA,
        affiliateCRG,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    } else if (!staticValues.brokerCPA && staticValues.brokerCRG) {
      // Broker CRG locked, adjust CPA
      const newBrokerCPA = brokerCRG > 0 ? brokerEffective / (brokerCRG / 100) : 0;
      return {
        brokerCPA: Math.round(newBrokerCPA * 100) / 100,
        brokerCRG,
        affiliateCPA,
        affiliateCRG,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    } else {
      // Neither brokerCPA nor brokerCRG individually locked → default: adjust CPA
      const newBrokerCPA = brokerCRG > 0 ? brokerEffective / (brokerCRG / 100) : 0;
      return {
        brokerCPA: Math.round(newBrokerCPA * 100) / 100,
        brokerCRG,
        affiliateCPA,
        affiliateCRG,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    }
  }
  
  // If broker terms are static, adjust affiliate terms
  if (staticValues.brokerTerms) {
    const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
    const affiliateEffective = brokerEffective * (1 - newMargin / 100);
    
    // Decide which affiliate variable to adjust
    if (staticValues.affiliateCPA && !staticValues.affiliateCRG) {
      // CPA locked, adjust CRG
      const newAffiliateCRG = affiliateCPA > 0 ? (affiliateEffective / affiliateCPA) * 100 : 0;
      return {
        brokerCPA,
        brokerCRG,
        affiliateCPA,
        affiliateCRG: Math.round(newAffiliateCRG * 100) / 100,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    } else if (!staticValues.affiliateCPA && staticValues.affiliateCRG) {
      // CRG locked, adjust CPA
      const newAffiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
      return {
        brokerCPA,
        brokerCRG,
        affiliateCPA: Math.round(newAffiliateCPA * 100) / 100,
        affiliateCRG,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    } else {
      // Neither locked, default adjust CPA
      const newAffiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
      return {
        brokerCPA,
        brokerCRG,
        affiliateCPA: Math.round(newAffiliateCPA * 100) / 100,
        affiliateCRG,
        margin: newMargin,
        brokerEffective: Math.round(brokerEffective * 100) / 100,
        affiliateEffective: Math.round(affiliateEffective * 100) / 100
      };
    }
  }
  
  // Default behavior: adjust affiliate CPA to maintain margin
  return recalculateFromMargin(brokerCPA, brokerCRG, affiliateCRG, newMargin);
};

// Bidirectional calculation functions
export const recalculateFromBrokerCPA = (brokerCPA, brokerCRG, affiliateCRG, targetMargin) => {
  const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
  const affiliateEffective = brokerEffective * (1 - targetMargin / 100);
  const affiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
  
  return {
    brokerCPA,
    brokerCRG,
    affiliateCPA: Math.round(affiliateCPA * 100) / 100,
    affiliateCRG,
    margin: targetMargin,
    brokerEffective: Math.round(brokerEffective * 100) / 100,
    affiliateEffective: Math.round(affiliateEffective * 100) / 100
  };
};

export const recalculateFromBrokerCRG = (brokerCPA, brokerCRG, affiliateCRG, targetMargin) => {
  const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
  const affiliateEffective = brokerEffective * (1 - targetMargin / 100);
  const affiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
  
  return {
    brokerCPA,
    brokerCRG,
    affiliateCPA: Math.round(affiliateCPA * 100) / 100,
    affiliateCRG,
    margin: targetMargin,
    brokerEffective: Math.round(brokerEffective * 100) / 100,
    affiliateEffective: Math.round(affiliateEffective * 100) / 100
  };
};

export const recalculateFromAffiliateCPA = (affiliateCPA, brokerCPA, brokerCRG, affiliateCRG, targetMargin) => {
  const affiliateEffective = calculateEffectiveValue(affiliateCPA, affiliateCRG);
  const brokerEffective = affiliateEffective / (1 - targetMargin / 100);
  const newBrokerCPA = brokerCRG > 0 ? brokerEffective / (brokerCRG / 100) : 0;
  
  return {
    brokerCPA: Math.round(newBrokerCPA * 100) / 100,
    brokerCRG,
    affiliateCPA,
    affiliateCRG,
    margin: targetMargin,
    brokerEffective: Math.round(brokerEffective * 100) / 100,
    affiliateEffective: Math.round(affiliateEffective * 100) / 100
  };
};

export const recalculateFromAffiliateCRG = (affiliateCPA, brokerCPA, brokerCRG, affiliateCRG, targetMargin) => {
  const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
  const affiliateEffective = brokerEffective * (1 - targetMargin / 100);
  const newAffiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
  
  return {
    brokerCPA,
    brokerCRG,
    affiliateCPA: Math.round(newAffiliateCPA * 100) / 100,
    affiliateCRG,
    margin: targetMargin,
    brokerEffective: Math.round(brokerEffective * 100) / 100,
    affiliateEffective: Math.round(affiliateEffective * 100) / 100
  };
};

export const recalculateFromMargin = (brokerCPA, brokerCRG, affiliateCRG, newMargin) => {
  const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
  const affiliateEffective = brokerEffective * (1 - newMargin / 100);
  const affiliateCPA = affiliateCRG > 0 ? affiliateEffective / (affiliateCRG / 100) : 0;
  
  return {
    brokerCPA,
    brokerCRG,
    affiliateCPA: Math.round(affiliateCPA * 100) / 100,
    affiliateCRG,
    margin: newMargin,
    brokerEffective: Math.round(brokerEffective * 100) / 100,
    affiliateEffective: Math.round(affiliateEffective * 100) / 100
  };
};

// Utility function to format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

// Utility function to format percentage
export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(2)}%`;
}; 