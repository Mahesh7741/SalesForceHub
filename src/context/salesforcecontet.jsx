// "use client";

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Define types
// type SalesforceUserInfo = {
//   display_name: string;
//   username: string;
//   email: string;
//   user_id: string;
//   organization_id: string;
//   instance_url?: string;
//   org_name?: string;
// };

// type SalesforceCredentials = {
//   username: string;
//   password: string;
//   securityToken: string;
// };

// type SalesforceContextType = {
//   isConnected: boolean;
//   isLoading: boolean;
//   error: string;
//   sfUserInfo: SalesforceUserInfo | null;
//   credentials: SalesforceCredentials;
//   connectToSalesforce: (credentials: SalesforceCredentials) => Promise<void>;
//   disconnectFromSalesforce: () => void;
//   reconnectToSalesforce: () => Promise<boolean>;
//   setCredentials: (credentials: SalesforceCredentials) => void;
// };

// // Create context
// const SalesforceContext = createContext<SalesforceContextType | undefined>(undefined);

// // Provider component
// export function SalesforceProvider({ children }: { children: ReactNode }) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [sfUserInfo, setSfUserInfo] = useState<SalesforceUserInfo | null>(null);
//   const [credentials, setCredentials] = useState<SalesforceCredentials>({
//     username: '',
//     password: '',
//     securityToken: '',
//   });

//   // Load saved connection data on initial render
//   useEffect(() => {
//     const savedUserInfo = localStorage.getItem('sfUserInfo');
//     const savedCredentials = localStorage.getItem('sfCredentials');
    
//     if (savedUserInfo) {
//       setSfUserInfo(JSON.parse(savedUserInfo));
//       setIsConnected(true);
//     }
    
//     if (savedCredentials) {
//       // Only restore username and securityToken, never password from localStorage
//       const parsedCreds = JSON.parse(savedCredentials);
//       setCredentials(prev => ({
//         ...prev,
//         username: parsedCreds.username || '',
//         securityToken: parsedCreds.securityToken || '',
//       }));
//     }
//   }, []);

//   // Save credentials and user info when they change
//   useEffect(() => {
//     if (isConnected && sfUserInfo) {
//       localStorage.setItem('sfUserInfo', JSON.stringify(sfUserInfo));
      
//       // Only save username and securityToken, never save password
//       localStorage.setItem('sfCredentials', JSON.stringify({
//         username: credentials.username,
//         securityToken: credentials.securityToken,
//       }));
//     }
//   }, [isConnected, sfUserInfo, credentials]);

//   const connectToSalesforce = async (loginCredentials: SalesforceCredentials) => {
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/salesforce', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginCredentials),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to connect to Salesforce');
//       }

//       setSfUserInfo(data.userInfo);
//       setCredentials(loginCredentials);
//       setIsConnected(true);
//       return data;
//     } catch (error) {
//       console.error('Salesforce login failed:', error);
//       if (error instanceof Error) {
//         setError(error.message || 'Connection failed');
//       } else {
//         setError('Connection failed');      throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const disconnectFromSalesforce = () => {
//     setIsConnected(false);
//     setSfUserInfo(null);
//     setCredentials({ username: '', password: '', securityToken: '' });
//     localStorage.removeItem('sfUserInfo');
//     localStorage.removeItem('sfCredentials');
//   };

//   const reconnectToSalesforce = async () => {
//     // If we don't have credentials, we can't reconnect
//     if (!credentials.username || (!credentials.password && !localStorage.getItem('sfUserInfo'))) {
//       return false;
//     }

//     try {
//       // If we already have user info but need to make a new API call
//       if (localStorage.getItem('sfUserInfo') && !credentials.password) {
//         // Just use the cached info - in a real app you might want to verify the session
//         return true;
//       }

//       // Otherwise try to reconnect with stored credentials
//       await connectToSalesforce(credentials);
//       return true;
//     } catch (error) {
//       console.error('Failed to reconnect:', error);
//       return false;
//     }
//   };

//   const contextValue = {
//     isConnected,
//     isLoading,
//     error,
//     sfUserInfo,
//     credentials,
//     connectToSalesforce,
//     disconnectFromSalesforce,
//     reconnectToSalesforce,
//     setCredentials: (newCredentials: SalesforceCredentials) => 
//       setCredentials(prev => ({ ...prev, ...newCredentials })),
//   };

//   return (
//     <SalesforceContext.Provider value={contextValue}>
//       {children}
//     </SalesforceContext.Provider>
//   );
// }

// // Custom hook to use the context
// export const useSalesforce = () => {
//   const context = useContext(SalesforceContext);
//   if (context === undefined) {
//     throw new Error('useSalesforce must be used within a SalesforceProvider');
//   }
//   return context;
// };
// src\context\salesforcecontet.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Create context
const SalesforceContext = createContext(undefined);

// Provider component
export function SalesforceProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sfUserInfo, setSfUserInfo] = useState(null);
  const [authData, setAuthData] = useState({
    accessToken: '',
    instanceUrl: '',
  });
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    securityToken: '',
  });

  // Load saved connection data on initial render
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('sfUserInfo');
    const savedCredentials = localStorage.getItem('sfCredentials');
    const savedAuthData = localStorage.getItem('sfAuthData');
    
    if (savedUserInfo) {
      setSfUserInfo(JSON.parse(savedUserInfo));
      setIsConnected(true);
    }
    
    if (savedCredentials) {
      const parsedCreds = JSON.parse(savedCredentials);
      setCredentials(prev => ({
        ...prev,
        username: parsedCreds.username || '',
        securityToken: parsedCreds.securityToken || '',
      }));
    }

    if (savedAuthData) {
      setAuthData(JSON.parse(savedAuthData));
    }
  }, []);

  // Save credentials, user info, and auth data when they change
  useEffect(() => {
    if (isConnected && sfUserInfo) {
      localStorage.setItem('sfUserInfo', JSON.stringify(sfUserInfo));
      
      localStorage.setItem('sfCredentials', JSON.stringify({
        username: credentials.username,
        securityToken: credentials.securityToken,
      }));

      if (authData.accessToken && authData.instanceUrl) {
        localStorage.setItem('sfAuthData', JSON.stringify(authData));
      }
    }
  }, [isConnected, sfUserInfo, credentials, authData]);

  const connectToSalesforce = async (loginCredentials) => {
    setIsLoading(true);
    setError('');
    localStorage.setItem('sfCredentials', JSON.stringify({
      username: loginCredentials.username,
      password: loginCredentials.password,
      securityToken: loginCredentials.securityToken
    }));
    
   console.log("loginCredentials", loginCredentials);
    try {
      const response = await fetch('/api/salesforce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginCredentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to Salesforce');
      }

      setSfUserInfo(data.userInfo);
      setAuthData({
        accessToken: data.accessToken,
        instanceUrl: data.instanceUrl
      });
      setCredentials(loginCredentials);
      setIsConnected(true);
      return data;
    } catch (error) {
      console.error('Salesforce login failed:', error);
      setError(error.message || 'Connection failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromSalesforce = () => {
    setIsConnected(false);
    setSfUserInfo(null);
    setCredentials({ username: '', password: '', securityToken: '' });
    setAuthData({ accessToken: '', instanceUrl: '' });
    localStorage.removeItem('sfUserInfo');
    localStorage.removeItem('sfCredentials');
    localStorage.removeItem('sfAuthData');
  };

  const reconnectToSalesforce = async () => {
    if (!credentials.username || (!credentials.password && !localStorage.getItem('sfUserInfo'))) {
      return false;
    }

    try {
      if (localStorage.getItem('sfUserInfo') && !credentials.password) {
        return true;
      }

      await connectToSalesforce(credentials);
      return true;
    } catch (error) {
      console.error('Failed to reconnect:', error);
      return false;
    }
  };

  const contextValue = {
    isConnected,
    isLoading,
    error,
    sfUserInfo,
    credentials,
    authData,
    connectToSalesforce,
    disconnectFromSalesforce,
    reconnectToSalesforce,
    setCredentials: (newCredentials) => 
      setCredentials(prev => ({ ...prev, ...newCredentials })),
  };

  return (
    <SalesforceContext.Provider value={contextValue}>
      {children}
    </SalesforceContext.Provider>
  );
}

// Custom hook to use the context
export const useSalesforce = () => {
  const context = useContext(SalesforceContext);
  if (context === undefined) {
    throw new Error('useSalesforce must be used within a SalesforceProvider');
  }
  return context;
};
