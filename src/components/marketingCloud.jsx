'use client';

import React, { useState, useEffect } from 'react';

const MarketingCloud = () => {
  // State variables
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved auth data on initial render
  useEffect(() => {
    const loadSalesforceData = () => {
      const savedAuthData = localStorage.getItem('sfAuthData');
      console.log("savedorg", savedAuthData);
      if (savedAuthData) {
        const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
        setToken(accessToken);
        setInstanceUrl(instanceUrl);
      }
    };

    loadSalesforceData();
  }, []);

  // Fetch accounts when auth data is available
  useEffect(() => {
    if (token && instanceUrl) {
      fetchAccounts();
    }
  }, [token, instanceUrl]);

  // Function to fetch accounts from Salesforce
  const fetchAccounts = async () => {
    if (!token || !instanceUrl) {
      setError('No authentication data available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/marketcloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          instanceUrl: instanceUrl,
          query: 'SELECT Id, Name, Industry FROM Account LIMIT 100',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }

      setAccounts(data.records || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setError(error.message || 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!instanceUrl || !token) {
    return (
      <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-xl font-bold mb-3">Marketing Cloud</h2>
        <p className="mb-4">You need to connect to Salesforce first.</p>
      </div>
    );
  }

return (
  <div className="p-5 bg-white border rounded-md shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Marketing Cloud</h2>
      <button 
        onClick={fetchAccounts}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        disabled={isLoading}
      >
        {isLoading ? 'Refreshing...' : 'Refresh Accounts'}
      </button>
    </div>

    <div className="mb-4">
      <p><strong>Instance URL:</strong> {instanceUrl}</p>
      <p><strong>Access Token:</strong> {token?.slice(0, 10)}...</p>
    </div>

    {error && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
        <strong>Error:</strong> {error}
      </div>
    )}

    <h3 className="text-lg font-semibold mb-2">Accounts</h3>
    
    {isLoading ? (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ) : accounts.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.Id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{account.Name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{account.Industry || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.Id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500">No account data available.</p>
    )}
  </div>
);
}

export default MarketingCloud
