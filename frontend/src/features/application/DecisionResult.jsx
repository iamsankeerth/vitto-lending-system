import React from 'react';

export default function DecisionResult({ result }) {
  const { decision } = result;
  const isApproved = decision.status === 'APPROVED';

  const metrics = [
    { label: 'Estimated EMI', value: `₹${decision.derivedMetrics.estimatedEmiRupees.toLocaleString()}` },
    { label: 'Revenue to EMI', value: `${decision.derivedMetrics.revenueToEmiRatio}x` },
    { label: 'Loan to Revenue', value: `${decision.derivedMetrics.loanToRevenueMultiple}x` },
    { label: 'Interest Rate', value: `${decision.derivedMetrics.annualInterestRatePct}%` },
  ];

  return (
    <div className="card">
      <h2>Decision Result</h2>

      <div className={`result-banner ${isApproved ? 'approved' : 'rejected'}`}>
        {isApproved ? 'APPROVED' : 'REJECTED'}
      </div>

      <div className={`score-circle ${isApproved ? 'approved' : 'rejected'}`}>
        {decision.creditScore}
      </div>

      <div className="chips">
        {decision.reasonCodes.map(code => (
          <span key={code} className="chip">{code.replace(/_/g, ' ')}</span>
        ))}
      </div>

      <div className="metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className="metric">
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
