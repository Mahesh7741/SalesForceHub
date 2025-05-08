'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  fetchLeads, 
  fetchOpportunities, 
  fetchAccounts, 
  fetchContacts 
} from '@/services/salesforceService';

// Import components
import LeadList from './lead/LeadList';
import LeadForm from './lead/LeadForm';
import LeadConversion from './lead/LeadConversion';
import OpportunityList from './opportunity/OpportunityList';
import OpportunityForm from './opportunity/OpportunityForm';

const SalesCloudManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  
  // Data state
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  // const [accounts, setAccounts] = useState([]);
  // const [contacts, setContacts] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  
  // Form state
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isOpportunityFormOpen, setIsOpportunityFormOpen] = useState(false);
  const [isLeadConversionOpen, setIsLeadConversionOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [convertLeadData, setConvertLeadData] = useState(null);

  // Load auth data from local storage
  useEffect(() => {
    const savedAuthData = localStorage.getItem('sfAuthData');
    if (savedAuthData) {
      const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
      setToken(accessToken);
      setInstanceUrl(instanceUrl);
    }
  }, []);

  // Load data when auth is available
  useEffect(() => {
    if (token && instanceUrl) {
      handleFetchLeads();
      handleFetchOpportunities();
      // handleFetchAccounts();
      // handleFetchContacts();
    }
  }, [token, instanceUrl]);

  // Data fetching handlers
  const handleFetchLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await fetchLeads(token, instanceUrl);
      setLeads(records);
    } catch (err) {
      setError(`Failed to fetch leads: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchOpportunities = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await fetchOpportunities(token, instanceUrl);
      setOpportunities(records);
    } catch (err) {
      setError(`Failed to fetch opportunities: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleFetchAccounts = async () => {
  //   try {
  //     const records = await fetchAccounts(token, instanceUrl);
  //     setAccounts(records);
  //   } catch (err) {
  //     console.error("Failed to fetch accounts:", err.message);
  //   }
  // };

  // const handleFetchContacts = async () => {
  //   try {
  //     const records = await fetchContacts(token, instanceUrl);
  //     setContacts(records);
  //   } catch (err) {
  //     console.error("Failed to fetch contacts:", err.message);
  //   }
  // };

  // Lead handlers
  const handleAddLead = () => {
    setIsEditMode(false);
    setCurrentLead(null);
    setIsLeadFormOpen(true);
  };

  const handleEditLead = (lead) => {
    setIsEditMode(true);
    setCurrentLead(lead);
    setIsLeadFormOpen(true);
  };

  const handleLeadFormSuccess = () => {
    handleFetchLeads();
    setIsLeadFormOpen(false);
    setCurrentLead(null);
    setIsEditMode(false);
  };

  const handleConvertLead = (lead) => {
    setConvertLeadData(lead);
    setIsLeadConversionOpen(true);
  };

  const handleLeadConversionSuccess = () => {
    handleFetchLeads();
    handleFetchOpportunities();
    handleFetchAccounts();
    handleFetchContacts();
    setIsLeadConversionOpen(false);
    setConvertLeadData(null);
  };

  // Opportunity handlers
  const handleAddOpportunity = () => {
    setIsEditMode(false);
    setCurrentOpportunity(null);
    setIsOpportunityFormOpen(true);
  };

  const handleEditOpportunity = (opportunity) => {
    setIsEditMode(true);
    setCurrentOpportunity(opportunity);
    setIsOpportunityFormOpen(true);
  };

  const handleOpportunityFormSuccess = () => {
    handleFetchOpportunities();
    setIsOpportunityFormOpen(false);
    setCurrentOpportunity(null);
    setIsEditMode(false);
  };

  if (!token || !instanceUrl) {
    return <div>Please connect to Salesforce first.</div>;
  }

  return (
    <div className="sales-cloud-container">
      <h2 className="text-xl font-bold mb-4">Sales Cloud Manager</h2>
      
      {error && <div className="error-message bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">{error}</div>}
      
      <div className="tabs">
        <div className="tab-list flex mb-4 border-b">
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'leads' ? 'active bg-blue-100 border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Leads
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'opportunities' ? 'active bg-blue-100 border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            Opportunities
          </button>
        </div>
        
        <div className="tab-content">
          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="tab-pane">
              <div className="mb-4 flex justify-end">
                <Button onClick={handleAddLead}>
                  <Plus className="mr-1" />
                  Add Lead
                </Button>
              </div>
              
              <LeadList 
                leads={leads}
                isLoading={isLoading}
                onRefresh={handleFetchLeads}
                onEdit={handleEditLead}
                onConvert={handleConvertLead}
                token={token}
                instanceUrl={instanceUrl}
                setError={setError}
              />
            </div>
          )}
          
          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div className="tab-pane">
              <div className="mb-4 flex justify-end">
                <Button onClick={handleAddOpportunity}>
                  <Plus className="mr-1" />
                  Add Opportunity
                </Button>
              </div>
              
              <OpportunityList 
                opportunities={opportunities}
                isLoading={isLoading}
                onRefresh={handleFetchOpportunities}
                onEdit={handleEditOpportunity}
                token={token}
                instanceUrl={instanceUrl}
                setError={setError}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Forms and Modals */}
      <LeadForm 
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        isEditMode={isEditMode}
        currentLead={currentLead}
        onSuccess={handleLeadFormSuccess}
        token={token}
        instanceUrl={instanceUrl}
        setError={setError}
      />
      
      <LeadConversion 
        isOpen={isLeadConversionOpen}
        onClose={() => setIsLeadConversionOpen(false)}
        lead={convertLeadData}
        onSuccess={handleLeadConversionSuccess}
        token={token}
        instanceUrl={instanceUrl}
        setError={setError}
      />
      
      <OpportunityForm 
        isOpen={isOpportunityFormOpen}
        onClose={() => setIsOpportunityFormOpen(false)}
        isEditMode={isEditMode}
        currentOpportunity={currentOpportunity}
        onSuccess={handleOpportunityFormSuccess}
        token={token}
        instanceUrl={instanceUrl}
        setError={setError}
      />
    </div>
  );
};

export default SalesCloudManager;