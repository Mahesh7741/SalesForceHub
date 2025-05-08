'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const FETCH_TIMEOUT = 30000; // 30 seconds

// Sample data for testing when API is unavailable
const SAMPLE_DATA = [
  {
    Id: 'sample-1',
    UserId: '005xx000001XxxXXAAX',
    LoginTime: new Date().toISOString(),
    SourceIp: '192.168.1.1',
    LoginType: 'Application',
    Status: 'Success',
    Browser: 'Chrome',
    Application: 'Salesforce for Web',
    Platform: 'Windows',
    ApiType: 'N/A',
    ApiVersion: 'N/A',
    LoginUrl: 'https://login.salesforce.com'
  },
  {
    Id: 'sample-2',
    UserId: '005xx000001XxxXXAAY',
    LoginTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    SourceIp: '10.0.0.1',
    LoginType: 'Application',
    Status: 'Failed',
    Browser: 'Firefox',
    Application: 'Salesforce for Web',
    Platform: 'MacOS',
    ApiType: 'N/A',
    ApiVersion: 'N/A',
    LoginUrl: 'https://login.salesforce.com'
  }
];

const LoginHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  const [useSampleData, setUseSampleData] = useState(false);

  // Function to fetch data through a proxy if available, or directly if not
  const fetchData = useCallback(async (retryAttempt = 0) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Get auth data with more detailed error reporting
      let auth;
      try {
        const rawAuth = localStorage.getItem('sfAuthData');
        setDebugInfo(prev => ({ ...prev, rawAuth: rawAuth ? '(exists)' : '(missing)' }));
        
        if (!rawAuth) {
          throw new Error('No Salesforce authentication data found in local storage');
        }
        
        auth = JSON.parse(rawAuth);
        
        if (!auth) {
          throw new Error('Failed to parse Salesforce authentication data');
        }
      } catch (parseError) {
        throw new Error(`Authentication error: ${parseError.message}`);
      }

      // Validate auth data
      if (!auth?.accessToken) {
        throw new Error('Missing Salesforce access token. Please log in again.');
      }
      
      if (!auth?.instanceUrl) {
        throw new Error('Missing Salesforce instance URL. Please log in again.');
      }

      const { instanceUrl, accessToken } = auth;

      // Debug logging
      console.log('Attempting connection to Salesforce...');
      console.log('Instance URL:', instanceUrl);
      console.log('Access Token exists:', !!accessToken);
      
      setDebugInfo(prev => ({
        ...prev,
        instanceUrl,
        hasAccessToken: !!accessToken,
        timestamp: new Date().toISOString()
      }));

      const query = `
        SELECT Id, UserId, LoginTime, SourceIp, LoginType, Status, Browser, LoginUrl,
               Application, Platform, ApiType, ApiVersion
        FROM LoginHistory
        WHERE LoginTime >= LAST_N_DAYS:30
        ORDER BY LoginTime DESC
        LIMIT 100
      `;

      // Attempt the API call with detailed logging
      setDebugInfo(prev => ({ ...prev, fetchStarted: true }));
      
      // Use proxy server approach to avoid CORS
      const proxyUrl = '/api/salesforce-proxy'; // This should be your Next.js API route
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceUrl,
          accessToken,
          query: query
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        responseStatus: response.status,
        responseStatusText: response.statusText,
        fetchCompleted: true 
      }));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Salesforce API Error (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();
      
      setDebugInfo(prev => ({ 
        ...prev, 
        hasRecords: !!data.records,
        recordCount: data.records ? data.records.length : 0
      }));
      
      if (!data.records) {
        throw new Error('Invalid response format from Salesforce API');
      }

      setRecords(data.records);
      setError('');
      setRetryCount(0);

    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      setDebugInfo(prev => ({ 
        ...prev, 
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack
      }));

      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please try again.');
      }

      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryAttempt + 1} of ${MAX_RETRIES}`);
        setTimeout(() => {
          fetchData(retryAttempt + 1);
        }, RETRY_DELAY * (retryAttempt + 1)); // Exponential backoff
        return;
      }

      setError(
        `Failed to fetch login history. ${err.message}. Please verify your network connection and Salesforce authentication.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useSampleData) {
      setRecords(SAMPLE_DATA);
      setLoading(false);
      setError('');
    } else {
      fetchData();
    }
    
    // Set initial debug info
    setDebugInfo({
      initialized: true,
      timestamp: new Date().toISOString()
    });
  }, [fetchData, useSampleData]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    setRetryCount(prev => prev + 1);
    fetchData();
  }, [fetchData]);

  const toggleSampleData = useCallback(() => {
    setUseSampleData(prev => !prev);
  }, []);

  const downloadCSV = useCallback(() => {
    if (!records.length) {
      alert('No data available to download');
      return;
    }

    const formattedRecords = records.map(record => ({
      ...record,
      LoginTime: new Date(record.LoginTime).toLocaleString()
    }));

    const csvData = unparse(formattedRecords);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const fileName = `salesforce_login_history_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  }, [records]);

  // Function to check authentication
  const checkAuth = useCallback(() => {
    try {
      const rawAuth = localStorage.getItem('sfAuthData');
      if (!rawAuth) {
        alert("No Salesforce authentication data found in local storage.");
        return;
      }
      
      const auth = JSON.parse(rawAuth);
      alert(`Auth data found:\nInstance URL: ${auth.instanceUrl}\nAccess Token: ${auth.accessToken ? '(exists)' : '(missing)'}`);
    } catch (err) {
      alert(`Error checking auth: ${err.message}`);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p>Loading login history...</p>
        {retryCount > 0 && (
          <p style={{ color: '#666' }}>Retry attempt {retryCount} of {MAX_RETRIES}</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        backgroundColor: '#ffebee'
      }}>
        <h2 style={{ color: '#c62828', marginBottom: '10px' }}>Connection Error</h2>
        <p style={{ marginBottom: '15px' }}>{error}</p>
        <div style={{ marginBottom: '15px' }}>
          <strong>Troubleshooting steps:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>Check your internet connection</li>
            <li>Verify your Salesforce credentials</li>
            <li>Try logging out and logging back in</li>
            <li>Check if you have properly set up the proxy API route</li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleRetry} style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Retry Connection
          </button>
          <button onClick={checkAuth} style={{
            padding: '8px 16px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Check Auth Data
          </button>
          <button onClick={toggleSampleData} style={{
            padding: '8px 16px',
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {useSampleData ? 'Try Real API' : 'Use Sample Data'}
          </button>
        </div>
        
        {debugInfo && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Information</summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto' 
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1>Salesforce Login History {useSampleData && '(Sample Data)'}</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={downloadCSV}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download CSV
          </button>
          <button 
            onClick={checkAuth}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Check Auth
          </button>
          <button 
            onClick={toggleSampleData}
            style={{
              padding: '8px 16px',
              backgroundColor: useSampleData ? '#f44336' : '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {useSampleData ? 'Use Real Data' : 'Use Sample Data'}
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#e1f5fe',
          borderRadius: '4px'
        }}>
          <p>No login history records found for the last 30 days.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={tableHeaderStyle}>Login Time</th>
                <th style={tableHeaderStyle}>User ID</th>
                <th style={tableHeaderStyle}>Application</th>
                <th style={tableHeaderStyle}>IP Address</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Browser</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.Id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tableCellStyle}>{new Date(record.LoginTime).toLocaleString()}</td>
                  <td style={tableCellStyle}>{record.UserId}</td>
                  <td style={tableCellStyle}>{record.Application || 'N/A'}</td>
                  <td style={tableCellStyle}>{record.SourceIp}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: record.Status === 'Success' ? '#e8f5e9' : '#ffebee',
                      color: record.Status === 'Success' ? '#2e7d32' : '#c62828'
                    }}>
                      {record.Status}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{record.Browser || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  fontWeight: '600'
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left'
};

export default LoginHistory;