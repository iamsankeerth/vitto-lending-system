import React, { useState } from 'react';
import ApplicationForm from './features/application/ApplicationForm.jsx';
import DecisionResult from './features/application/DecisionResult.jsx';

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <header>
        <h1>Vitto Lending Decision System</h1>
        <p>MSME Loan Application & Credit Decision Engine</p>
      </header>

      <ApplicationForm onResult={setResult} />

      {result && <DecisionResult result={result} />}
    </div>
  );
}

export default App;
