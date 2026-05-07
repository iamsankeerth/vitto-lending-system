const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function validatePan(pan) {
  if (!pan || !pan.trim()) return 'PAN is required';
  if (!PAN_REGEX.test(pan.trim().toUpperCase())) return 'PAN must match AAAAA9999A format';
  return null;
}

export function validateForm(values) {
  const errors = {};

  if (!values.ownerName?.trim()) errors.ownerName = 'Owner name is required';
  const panError = validatePan(values.pan);
  if (panError) errors.pan = panError;
  if (!values.businessType) errors.businessType = 'Business type is required';
  if (!values.monthlyRevenueRupees || values.monthlyRevenueRupees <= 0) errors.monthlyRevenueRupees = 'Monthly revenue must be positive';
  if (!values.requestedAmountRupees || values.requestedAmountRupees <= 0) errors.requestedAmountRupees = 'Loan amount must be positive';
  if (!values.tenureMonths || values.tenureMonths < 3 || values.tenureMonths > 60) errors.tenureMonths = 'Tenure must be between 3 and 60 months';
  if (!values.purpose?.trim()) errors.purpose = 'Purpose is required';

  return errors;
}
