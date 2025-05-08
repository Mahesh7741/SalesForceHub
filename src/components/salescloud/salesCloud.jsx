// 'use client';

// import React, { useEffect, useState } from 'react';

// type Opportunity = {
//   Id: string;
//   Name: string;
//   StageName: string;
//   CloseDate: string;
//   [key: string]: any;
// };

// const SalesCloud = () => {
//   const [instanceUrl, setInstanceUrl] = useState<string>('');
//   const [token, setToken] = useState<string>('');
//   const [opps, setOpps] = useState<Opportunity[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     const savedAuthData = localStorage.getItem('sfAuthData');
//     if (savedAuthData) {
//       const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
//       setToken(accessToken);
//       setInstanceUrl(instanceUrl);
//     }
//   }, []);

//   useEffect(() => {
//     if (token && instanceUrl) {
//       fetchOpportunities();
//     }
//   }, [token, instanceUrl]);

//   const fetchOpportunities = async () => {
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/salescloud', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           accessToken: token,
//           instanceUrl: instanceUrl,
//           query: 'SELECT Id, Name, StageName, CloseDate FROM Opportunity ORDER BY CloseDate DESC LIMIT 50',
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to fetch opportunities');
//       setOpps(data.records || []);
//     } catch (err: any) {
//       setError(err.message || 'Unknown error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!token || !instanceUrl) {
//     return <div>Please connect to Salesforce first.</div>;
//   }

//   return (
//     <div className="p-5 bg-white border rounded-md shadow-sm">
//       <h2 className="text-xl font-bold mb-4">Sales Cloud – Opportunities</h2>
//       <button
//         onClick={fetchOpportunities}
//         disabled={isLoading}
//         className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//       >
//         {isLoading ? 'Loading...' : 'Refresh Opportunities'}
//       </button>

//       {error && <div className="text-red-500 mb-4">{error}</div>}

//       {isLoading ? (
//         <div>Loading opportunities...</div>
//       ) : opps.length === 0 ? (
//         <div>No data found.</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-4 py-2 text-left">Name</th>
//                 <th className="border px-4 py-2 text-left">Stage</th>
//                 <th className="border px-4 py-2 text-left">Close Date</th>
//                 <th className="border px-4 py-2 text-left">Id</th>
//               </tr>
//             </thead>
//             <tbody>
//               {opps.map((opportunity) => (
//                 <tr key={opportunity.Id}>
//                   <td className="border px-4 py-2">{opportunity.Name}</td>
//                   <td className="border px-4 py-2">{opportunity.StageName}</td>
//                   <td className="border px-4 py-2">{opportunity.CloseDate}</td>
//                   <td className="border px-4 py-2 text-gray-500">{opportunity.Id}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };




'use client';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

import { Loader2, RefreshCw, Plus, Edit, Trash, ArrowRightLeft } from "lucide-react";

// Initial form states
const initialLeadState = {
  FirstName: '',
  LastName: '',
  Company: '',
  Email: '',
  Phone: '',
  Status: 'Open - Not Contacted'
};

const initialOpportunityState = {
  Name: '',
  StageName: 'Prospecting',
  CloseDate: new Date().toISOString().split('T')[0],
  Amount: '0'
};

// Lead status options
const leadStatusOptions = [
  'Open - Not Contacted',
  'Working - Contacted',
  'Closed - Converted',
  'Closed - Not Converted'
];

// Opportunity stage options
const opportunityStageOptions = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Id. Decision Makers',
  'Perception Analysis',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won',
  'Closed Lost'
];

const SalesCloudManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  
  // Data state
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  
  // Form state
  const [leadForm, setLeadForm] = useState(initialLeadState);
  const [opportunityForm, setOpportunityForm] = useState(initialOpportunityState);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState('');
  const [currentOpportunityId, setCurrentOpportunityId] = useState('');
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [convertLeadId, setConvertLeadId] = useState('');
  const [convertLeadData, setConvertLeadData] = useState(null);
  const [createOpportunity, setCreateOpportunity] = useState(true);

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
      fetchLeads();
      fetchOpportunities();
      fetchAccounts();
      fetchContacts();
    }
  }, [token, instanceUrl]);

  // Query execution helper
  const executeQuery = async (query) => {
    try {
      const response = await fetch('/api/salescloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, instanceUrl, query }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Query execution failed');
      return result.records || [];
    } catch (err) {
      throw new Error(err.message || 'Unknown error');
    }
  };

  // Execute DML operation
  const executeDML = async (operation, objectType, data, id) => {
    try {
      const response = await fetch('/api/salescloud/dml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token,
          instanceUrl,
          operation,
          objectType,
          data,
          id
        }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Operation failed');
      return result;
    } catch (err) {
      throw new Error(err.message || 'Unknown error');
    }
  };

  // Data fetching functions
  const fetchLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await executeQuery(
        'SELECT Id, FirstName, LastName, Company, Email, Phone, Status FROM Lead ORDER BY CreatedDate DESC LIMIT 50'
      );
      setLeads(records);
    } catch (err) {
      setError(`Failed to fetch leads: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await executeQuery(
        'SELECT Id, Name, StageName, CloseDate, Amount FROM Opportunity ORDER BY CloseDate DESC LIMIT 50'
      );
      setOpportunities(records);
    } catch (err) {
      setError(`Failed to fetch opportunities: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const records = await executeQuery(
        'SELECT Id, Name FROM Account ORDER BY Name ASC LIMIT 100'
      );
      setAccounts(records);
    } catch (err) {
      console.error("Failed to fetch accounts:", err.message);
    }
  };

  const fetchContacts = async () => {
    try {
      const records = await executeQuery(
        'SELECT Id, FirstName, LastName FROM Contact ORDER BY LastName ASC LIMIT 100'
      );
      setContacts(records);
    } catch (err) {
      console.error("Failed to fetch contacts:", err.message);
    }
  };

  // CRUD operations for Lead
  const createLead = async (data) => {
    setIsLoading(true);
    try {
      await executeDML('create', 'Lead', data);
      alert("Lead created successfully");
      fetchLeads();
      setLeadForm(initialLeadState);
      setIsLeadDialogOpen(false);
    } catch (err) {
      setError(`Failed to create lead: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (id, data) => {
    setIsLoading(true);
    try {
      await executeDML('update', 'Lead', data, id);
      alert("Lead updated successfully");
      fetchLeads();
      setLeadForm(initialLeadState);
      setIsLeadDialogOpen(false);
      setIsEditMode(false);
    } catch (err) {
      setError(`Failed to update lead: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setIsLoading(true);
    try {
      await executeDML('delete', 'Lead', {}, id);
      alert("Lead deleted successfully");
      fetchLeads();
    } catch (err) {
      setError(`Failed to delete lead: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD operations for Opportunity
  const createOpportunityRecord = async (data) => {
    setIsLoading(true);
    try {
      await executeDML('create', 'Opportunity', data);
      alert("Opportunity created successfully");
      fetchOpportunities();
      setOpportunityForm(initialOpportunityState);
      setIsOpportunityDialogOpen(false);
    } catch (err) {
      setError(`Failed to create opportunity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOpportunity = async (id, data) => {
    setIsLoading(true);
    try {
      await executeDML('update', 'Opportunity', data, id);
      alert("Opportunity updated successfully");
      fetchOpportunities();
      setOpportunityForm(initialOpportunityState);
      setIsOpportunityDialogOpen(false);
      setIsEditMode(false);
    } catch (err) {
      setError(`Failed to update opportunity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOpportunity = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    setIsLoading(true);
    try {
      await executeDML('delete', 'Opportunity', {}, id);
      alert("Opportunity deleted successfully");
      fetchOpportunities();
    } catch (err) {
      setError(`Failed to delete opportunity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Lead conversion
  const openConvertLeadDialog = (lead) => {
    setConvertLeadId(lead.Id);
    setConvertLeadData(lead);
    setIsConvertDialogOpen(true);
  };

  const convertLead = async () => {
    if (!convertLeadId || !convertLeadData) return;

    setIsLoading(true);
    try {
      const result = await fetch('/api/salescloud/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token,
          instanceUrl,
          leadId: convertLeadId,
          createOpportunity
        }),
      });
      
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Lead conversion failed');
      
      alert("Lead converted successfully");
      
      fetchLeads();
      fetchOpportunities();
      fetchAccounts();
      fetchContacts();
      setIsConvertDialogOpen(false);
    } catch (err) {
      setError(`Failed to convert lead: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Form handling
  const handleLeadFormChange = (field, value) => {
    setLeadForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpportunityFormChange = (field, value) => {
    setOpportunityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentLeadId) {
      updateLead(currentLeadId, leadForm);
    } else {
      createLead(leadForm);
    }
  };

  const handleOpportunitySubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentOpportunityId) {
      updateOpportunity(currentOpportunityId, opportunityForm);
    } else {
      createOpportunityRecord(opportunityForm);
    }
  };

  const editLead = (lead) => {
    setLeadForm({
      FirstName: lead.FirstName || '',
      LastName: lead.LastName || '',
      Company: lead.Company || '',
      Email: lead.Email || '',
      Phone: lead.Phone || '',
      Status: lead.Status || 'Open - Not Contacted'
    });
    setCurrentLeadId(lead.Id);
    setIsEditMode(true);
    setIsLeadDialogOpen(true);
  };

  const editOpportunity = (opp) => {
    setOpportunityForm({
      Name: opp.Name || '',
      StageName: opp.StageName || 'Prospecting',
      CloseDate: opp.CloseDate || new Date().toISOString().split('T')[0],
      Amount: opp.Amount || '0'
    });
    setCurrentOpportunityId(opp.Id);
    setIsEditMode(true);
    setIsOpportunityDialogOpen(true);
  };

  // Reset forms
  const resetLeadForm = () => {
    setLeadForm(initialLeadState);
    setCurrentLeadId('');
    setIsEditMode(false);
  };

  const resetOpportunityForm = () => {
    setOpportunityForm(initialOpportunityState);
    setCurrentOpportunityId('');
    setIsEditMode(false);
  };

  if (!token || !instanceUrl) {
    return <div className="p-5">Please connect to Salesforce first.</div>;
  }

  return (
    <div className="p-5 bg-white border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6">Sales Cloud Manager</h2>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      
      <Tabs defaultValue="leads" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Leads</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchLeads} 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Refresh</span>
                  </Button>
                  <Dialog open={isLeadDialogOpen} onOpenChange={(open) => {
                    setIsLeadDialogOpen(open);
                    if (!open) resetLeadForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsLeadDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Lead
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLeadSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                              <Input
                                id="firstName"
                                value={leadForm.FirstName}
                                onChange={(e) => handleLeadFormChange('FirstName', e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name *</label>
                              <Input
                                id="lastName"
                                value={leadForm.LastName}
                                onChange={(e) => handleLeadFormChange('LastName', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="company" className="block text-sm font-medium mb-1">Company *</label>
                            <Input
                              id="company"
                              value={leadForm.Company}
                              onChange={(e) => handleLeadFormChange('Company', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                            <Input
                              id="email"
                              type="email"
                              value={leadForm.Email}
                              onChange={(e) => handleLeadFormChange('Email', e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                              id="phone"
                              value={leadForm.Phone}
                              onChange={(e) => handleLeadFormChange('Phone', e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                            <Select 
                              value={leadForm.Status} 
                              onValueChange={(value) => handleLeadFormChange('Status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {leadStatusOptions.map(status => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsLeadDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update' : 'Create'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {isLoading && activeTab === 'leads' ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No leads found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">Name</th>
                        <th className="border px-4 py-2 text-left">Company</th>
                        <th className="border px-4 py-2 text-left">Email</th>
                        <th className="border px-4 py-2 text-left">Phone</th>
                        <th className="border px-4 py-2 text-left">Status</th>
                        <th className="border px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.Id}>
                          <td className="border px-4 py-2">
                            {lead.FirstName} {lead.LastName}
                          </td>
                          <td className="border px-4 py-2">{lead.Company}</td>
                          <td className="border px-4 py-2">{lead.Email}</td>
                          <td className="border px-4 py-2">{lead.Phone}</td>
                          <td className="border px-4 py-2">{lead.Status}</td>
                          <td className="border px-4 py-2">
                            <div className="flex justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => editLead(lead)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteLead(lead.Id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => openConvertLeadDialog(lead)}
                                disabled={lead.Status === 'Closed - Converted'}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Opportunities</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchOpportunities} 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Refresh</span>
                  </Button>
                  <Dialog open={isOpportunityDialogOpen} onOpenChange={(open) => {
                    setIsOpportunityDialogOpen(open);
                    if (!open) resetOpportunityForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsOpportunityDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Opportunity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleOpportunitySubmit}>
                        <div className="grid gap-4 py-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
                            <Input
                              id="name"
                              value={opportunityForm.Name}
                              onChange={(e) => handleOpportunityFormChange('Name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="stage" className="block text-sm font-medium mb-1">Stage</label>
                            <Select 
                              value={opportunityForm.StageName} 
                              onValueChange={(value) => handleOpportunityFormChange('StageName', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {opportunityStageOptions.map(stage => (
                                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label htmlFor="closeDate" className="block text-sm font-medium mb-1">Close Date</label>
                            <Input
                              id="closeDate"
                              type="date"
                              value={opportunityForm.CloseDate}
                              onChange={(e) => handleOpportunityFormChange('CloseDate', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
                            <Input
                              id="amount"
                              type="number"
                              value={opportunityForm.Amount}
                              onChange={(e) => handleOpportunityFormChange('Amount', e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsOpportunityDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update' : 'Create'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {isLoading && activeTab === 'opportunities' ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No opportunities found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">Name</th>
                        <th className="border px-4 py-2 text-left">Stage</th>
                        <th className="border px-4 py-2 text-left">Close Date</th>
                        <th className="border px-4 py-2 text-left">Amount</th>
                        <th className="border px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.map((opp) => (
                        <tr key={opp.Id}>
                          <td className="border px-4 py-2">{opp.Name}</td>
                          <td className="border px-4 py-2">{opp.StageName}</td>
                          <td className="border px-4 py-2">{opp.CloseDate}</td>
                          <td className="border px-4 py-2">${parseFloat(opp.Amount || '0').toLocaleString()}</td>
                          <td className="border px-4 py-2">
                            <div className="flex justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => editOpportunity(opp)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteOpportunity(opp.Id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Conversion Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {convertLeadData && (
              <div className="mb-4">
                <p className="font-medium">
                  Converting lead: {convertLeadData.FirstName} {convertLeadData.LastName}, {convertLeadData.Company}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="createOpp"
                checked={createOpportunity}
                onChange={(e) => setCreateOpportunity(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="createOpp" className="text-sm">Create opportunity during conversion</label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              This will convert the lead into an account, contact, and optionally an opportunity.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={convertLead} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesCloudManager;