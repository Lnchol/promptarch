/**
 * Payment State Machine
 * Handles all payment lifecycle states and valid transitions
 */

export const PaymentStates = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  REFUNDED: 'refunded'
};

// Valid state transitions
const PaymentTransitions = {
  [PaymentStates.PENDING]: [PaymentStates.PROCESSING, PaymentStates.TIMEOUT],
  [PaymentStates.PROCESSING]: [PaymentStates.SUCCESS, PaymentStates.FAILED],
  [PaymentStates.SUCCESS]: [PaymentStates.REFUNDED],
  [PaymentStates.FAILED]: [],
  [PaymentStates.TIMEOUT]: [PaymentStates.PROCESSING], // Allow retry
  [PaymentStates.REFUNDED]: []
};

/**
 * Check if a state transition is valid
 */
export function canTransition(currentState, newState) {
  return PaymentTransitions[currentState]?.includes(newState) || false;
}

/**
 * Calculate subscription end date based on type
 */
export function calculateEndDate(type) {
  const now = new Date();
  const endDate = new Date();
  
  if (type === 'monthly') {
    endDate.setDate(now.getDate() + 30);
  } else if (type === 'yearly') {
    endDate.setDate(now.getDate() + 365);
  }
  
  return endDate;
}
