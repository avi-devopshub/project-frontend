import React from 'react';
import './App.css';

function App() {
  return (
    <main className="container">
      <h1>Medical ERP Application</h1>
      <h2>Welcome to DevOps Deployment Demo</h2>
      <p>Environment: {import.meta.env.VITE_ENV || 'Local'}</p>
      <p>Deployed successfully using Jenkins, Amazon S3 and CloudFront.</p>
    </main>
  );
}

export default App;
