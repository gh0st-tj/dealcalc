// Core calculation functions for affiliate marketing deals

export const calculateEffectiveValue = (cpa, crg) => (cpa || 0) * ((crg || 0) / 100);

export const calculateMargin = (brokerEffective, affiliateEffective) => {
  if (brokerEffective === 0) return 0;
  return ((brokerEffective - affiliateEffective) / brokerEffective) * 100;
};

export const getCalculationError = (statics) => {
    const { brokerTerms, affiliateTerms, brokerCPA, brokerCRG, affiliateCPA, affiliateCRG, margin } = statics;

    if (brokerTerms && affiliateTerms) {
        return "Cannot lock both Broker and Affiliate terms at the same time.";
    }
    
    const brokerSideLocked = brokerTerms || (brokerCPA && brokerCRG);
    const affiliateSideLocked = affiliateTerms || (affiliateCPA && affiliateCRG);

    if (brokerSideLocked && affiliateSideLocked && margin) {
        return "Cannot solve. All three sides (Broker, Affiliate, Margin) are locked.";
    }
    if (brokerSideLocked && affiliateSideLocked) {
        return "Cannot calculate margin. Both Broker and Affiliate terms are locked.";
    }
    
    const numLocked = [brokerCPA, brokerCRG, affiliateCPA, affiliateCRG, margin].filter(Boolean).length;
    if (numLocked >= 5) {
        return "Too many variables are locked. At least one must be dynamic.";
    }

    return null;
}

export const solveDeal = (inputs, statics) => {
    let { brokerCPA, brokerCRG, affiliateCPA, affiliateCRG, margin } = { ...inputs };
    const rnd = (num) => Math.round(num * 100) / 100;

    const brokerSideStatic = statics.brokerTerms || (statics.brokerCPA && statics.brokerCRG);
    const affiliateSideStatic = statics.affiliateTerms || (statics.affiliateCPA && statics.affiliateCRG);

    if (!statics.margin) {
        const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
        const affiliateEffective = calculateEffectiveValue(affiliateCPA, affiliateCRG);
        margin = calculateMargin(brokerEffective, affiliateEffective);
    } else {
        if (brokerSideStatic && !affiliateSideStatic) {
            const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
            let targetAffiliateEffective = brokerEffective * (1 - margin / 100);
            
            if (statics.affiliateCPA) {
                affiliateCRG = affiliateCPA > 0 ? (targetAffiliateEffective / affiliateCPA) * 100 : 0;
            } else {
                affiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
            }
        } else if (affiliateSideStatic && !brokerSideStatic) {
            const affiliateEffective = calculateEffectiveValue(affiliateCPA, affiliateCRG);
            const targetBrokerEffective = affiliateEffective / (1 - margin / 100);

            if (statics.brokerCPA) {
                brokerCRG = brokerCPA > 0 ? (targetBrokerEffective / brokerCPA) * 100 : 0;
            } else {
                brokerCPA = brokerCRG > 0 ? targetBrokerEffective / (brokerCRG / 100) : 0;
            }
        } else if (!brokerSideStatic && !affiliateSideStatic) {
            const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
            const targetAffiliateEffective = brokerEffective * (1 - margin / 100);
            if (!statics.affiliateCPA && !statics.affiliateCRG) {
                 affiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
            } else if (statics.affiliateCPA) {
                affiliateCRG = affiliateCPA > 0 ? (targetAffiliateEffective / affiliateCPA) * 100 : 0;
            } else { // affiliateCRG is static
                affiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
            }
        }
    }

    const finalBrokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
    const finalAffiliateEffective = calculateEffectiveValue(affiliateCPA, affiliateCRG);
    
    // Final margin sync, only if it wasn't locked
    if (!statics.margin) {
        margin = calculateMargin(finalBrokerEffective, finalAffiliateEffective);
    }

    return {
        brokerCPA: rnd(brokerCPA),
        brokerCRG: rnd(brokerCRG),
        affiliateCPA: rnd(affiliateCPA),
        affiliateCRG: rnd(affiliateCRG),
        margin: rnd(margin),
        brokerEffective: rnd(finalBrokerEffective),
        affiliateEffective: rnd(finalAffiliateEffective),
    };
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

// Calculate when margin is locked but other variables changed
export const recalcForLockedMargin = (currentValues, staticValues, lastChanged) => {
  const {
    brokerCPA,
    brokerCRG,
    affiliateCPA,
    affiliateCRG,
    margin
  } = currentValues;

  const brokerEffective = calculateEffectiveValue(brokerCPA, brokerCRG);
  const targetAffiliateEffective = brokerEffective * (1 - margin / 100);

  const brokerSideLocked = staticValues.brokerTerms || (staticValues.brokerCPA && staticValues.brokerCRG);
  const affiliateSideLocked = staticValues.affiliateTerms || (staticValues.affiliateCPA && staticValues.affiliateCRG);

  // Helper rounding
  const rnd = (num) => Math.round(num * 100) / 100;

  // Try adjusting affiliate side first if not fully locked
  if (!affiliateSideLocked) {
    // Decide which affiliate variable we can adjust
    if (staticValues.affiliateCPA && !staticValues.affiliateCRG) {
      // CPA locked, adjust CRG
      const newAffiliateCRG = affiliateCPA > 0 ? (targetAffiliateEffective / affiliateCPA) * 100 : 0;
      return {
        ...currentValues,
        affiliateCRG: rnd(newAffiliateCRG),
        brokerEffective: rnd(brokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    if (!staticValues.affiliateCPA && staticValues.affiliateCRG) {
      // CRG locked, adjust CPA
      const newAffiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
      return {
        ...currentValues,
        affiliateCPA: rnd(newAffiliateCPA),
        brokerEffective: rnd(brokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    // Neither individually locked → adjust the variable that was NOT last changed
    if (lastChanged === 'affiliateCPA' && !staticValues.affiliateCRG) {
      const newAffiliateCRG = affiliateCPA > 0 ? (targetAffiliateEffective / affiliateCPA) * 100 : 0;
      return {
        ...currentValues,
        affiliateCRG: rnd(newAffiliateCRG),
        brokerEffective: rnd(brokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    if (lastChanged === 'affiliateCRG' && !staticValues.affiliateCPA) {
      const newAffiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
      return {
        ...currentValues,
        affiliateCPA: rnd(newAffiliateCPA),
        brokerEffective: rnd(brokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    // default: adjust affiliateCPA
    const newAffiliateCPA = affiliateCRG > 0 ? targetAffiliateEffective / (affiliateCRG / 100) : 0;
    return {
      ...currentValues,
      affiliateCPA: rnd(newAffiliateCPA),
      brokerEffective: rnd(brokerEffective),
      affiliateEffective: rnd(targetAffiliateEffective)
    };
  }

  // Otherwise adjust broker side if available
  if (!brokerSideLocked) {
    // brokerEffective already computed, targetBrokerEffective = brokerEffective (since broker side is current), but we might adjust to match targetAffiliateEffective via margin formula.
    const targetBrokerEffective = targetAffiliateEffective / (1 - margin / 100);

    if (staticValues.brokerCPA && !staticValues.brokerCRG) {
      // CPA locked, adjust CRG
      const newBrokerCRG = brokerCPA > 0 ? (targetBrokerEffective / brokerCPA) * 100 : 0;
      return {
        ...currentValues,
        brokerCRG: rnd(newBrokerCRG),
        brokerEffective: rnd(targetBrokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    if (!staticValues.brokerCPA && staticValues.brokerCRG) {
      // CRG locked, adjust CPA
      const newBrokerCPA = brokerCRG > 0 ? targetBrokerEffective / (brokerCRG / 100) : 0;
      return {
        ...currentValues,
        brokerCPA: rnd(newBrokerCPA),
        brokerEffective: rnd(targetBrokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }

    // Neither individually locked → adjust the variable opposite to lastChanged if possible
    if (lastChanged === 'brokerCPA' && !staticValues.brokerCRG) {
      const newBrokerCRG = brokerCPA > 0 ? (targetBrokerEffective / brokerCPA) * 100 : 0;
      return {
        ...currentValues,
        brokerCRG: rnd(newBrokerCRG),
        brokerEffective: rnd(targetBrokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }
    if (lastChanged === 'brokerCRG' && !staticValues.brokerCPA) {
      const newBrokerCPA = brokerCRG > 0 ? targetBrokerEffective / (brokerCRG / 100) : 0;
      return {
        ...currentValues,
        brokerCPA: rnd(newBrokerCPA),
        brokerEffective: rnd(targetBrokerEffective),
        affiliateEffective: rnd(targetAffiliateEffective)
      };
    }

    // default adjust brokerCPA
    const newBrokerCPA = brokerCRG > 0 ? targetBrokerEffective / (brokerCRG / 100) : 0;
    return {
      ...currentValues,
      brokerCPA: rnd(newBrokerCPA),
      brokerEffective: rnd(targetBrokerEffective),
      affiliateEffective: rnd(targetAffiliateEffective)
    };
  }

  // If we reach here, unsolvable
  return currentValues;
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