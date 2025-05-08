'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, RefreshCw, Plus, Edit, Trash, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Initial state for cases
const initialCaseState = {
  Subject: '',
  Description: '',
  Status: 'New',
  Priority: 'Medium',
  Origin: 'Web',
  ContactId: null, // Changed from empty string to null
  AccountId: null  // Changed from empty string to null
};

// Case priority options
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

// Case status options
const statusOptions = ['New', 'Working', 'Escalated', 'Closed', 'On Hold'];

// Case origin options
const originOptions = ['Email', 'Phone', 'Web', 'Social Media', 'Chat'];

const CaseManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  
  // Data states
  const [cases, setCases] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseForm, setCaseForm] = useState(initialCaseState);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('open');

  // Load auth data on component mount
  useEffect(() => {
    const savedAuthData = localStorage.getItem('sfAuthData');
    if (savedAuthData) {
      const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
      setToken(accessToken);
      setInstanceUrl(instanceUrl);
    }
  }, []);

  // Fetch data when auth is available
  useEffect(() => {
    if (token && instanceUrl) {
      fetchCases();
      fetchContacts();
      fetchAccounts();
    }
  }, [token, instanceUrl]);

  // Generic function to execute SOQL queries
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

  // Generic function for DML operations (create, update, delete)
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

  // Fetch cases based on active tab
  const fetchCases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const whereClause = activeTab === 'open' 
        ? "Status != 'Closed'" 
        : "Status = 'Closed'";
        
      const records = await executeQuery(
        `SELECT Id, CaseNumber, Subject, Status, Priority, Origin, CreatedDate, 
         ContactId, Contact.Name, AccountId, Account.Name, Description, 
         LastModifiedDate
         FROM Case 
         WHERE ${whereClause}
         ORDER BY LastModifiedDate DESC LIMIT 50`
      );
      setCases(records);
    } catch (err) {
      setError(`Failed to fetch cases: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts for case assignment
  const fetchContacts = async () => {
    try {
      const records = await executeQuery(
        'SELECT Id, Name, AccountId FROM Contact ORDER BY Name ASC LIMIT 100'
      );
      setContacts(records);
    } catch (err) {
      setError(`Failed to fetch contacts: ${err.message}`);
    }
  };

  // Fetch accounts for case assignment
  const fetchAccounts = async () => {
    try {
      const records = await executeQuery(
        'SELECT Id, Name FROM Account ORDER BY Name ASC LIMIT 100'
      );
      setAccounts(records);
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
    }
  };

  // Create a new case
  const createCase = async (data) => {
    setIsLoading(true);
    try {
      // Convert null values to empty strings for API compatibility if needed
      const apiData = {...data};
      if (apiData.ContactId === null) apiData.ContactId = '';
      if (apiData.AccountId === null) apiData.AccountId = '';
      
      const result = await executeDML('create', 'Case', apiData);
      alert("Case created successfully");
      fetchCases();
      setCaseForm(initialCaseState);
      setIsCaseDialogOpen(false);
    } catch (err) {
      setError(`Failed to create case: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing case
  const updateCase = async (id, data) => {
    setIsLoading(true);
    try {
      // Convert null values to empty strings for API compatibility if needed
      const apiData = {...data};
      if (apiData.ContactId === null) apiData.ContactId = '';
      if (apiData.AccountId === null) apiData.AccountId = '';
      
      await executeDML('update', 'Case', apiData, id);
      alert("Case updated successfully");
      fetchCases();
      setCaseForm(initialCaseState);
      setIsCaseDialogOpen(false);
      setIsEditMode(false);
      
      // If the case details dialog is open, refresh the case details
      if (isCaseDetailsOpen && selectedCase && selectedCase.Id === id) {
        const updatedCase = await fetchCaseDetails(id);
        setSelectedCase(updatedCase);
      }
    } catch (err) {
      setError(`Failed to update case: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a case
  const deleteCase = async (id) => {
    if (!confirm("Are you sure you want to delete this case?")) return;

    setIsLoading(true);
    try {
      await executeDML('delete', 'Case', {}, id);
      alert("Case deleted successfully");
      
      // If the deleted case is currently being viewed, close the details dialog
      if (isCaseDetailsOpen && selectedCase && selectedCase.Id === id) {
        setIsCaseDetailsOpen(false);
      }
      
      fetchCases();
    } catch (err) {
      setError(`Failed to delete case: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed information for a specific case
  const fetchCaseDetails = async (caseId) => {
    setIsLoading(true);
    try {
      const records = await executeQuery(
        `SELECT Id, CaseNumber, Subject, Description, Status, Priority, 
         Origin, CreatedDate, LastModifiedDate, 
         ContactId, Contact.Name, Contact.Email, Contact.Phone,
         AccountId, Account.Name
         FROM Case 
         WHERE Id = '${caseId}'`
      );
      
      if (records.length > 0) {
        return records[0];
      }
      throw new Error('Case not found');
    } catch (err) {
      setError(`Failed to fetch case details: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // View case details
  const viewCaseDetails = async (caseId) => {
    const caseDetails = await fetchCaseDetails(caseId);
    if (caseDetails) {
      setSelectedCase(caseDetails);
      setIsCaseDetailsOpen(true);
    }
  };

  // Handle case form changes
  const handleCaseFormChange = (field, value) => {
    setCaseForm(prev => ({ ...prev, [field]: value }));
  };

  // Update ContactId when AccountId changes (optional relationship enforcement)
  const handleAccountChange = (accountId) => {
    handleCaseFormChange('AccountId', accountId);
    
    // If account changes, filter contacts to only show those related to selected account
    // or clear ContactId if no matching contacts
    if (accountId) {
      const relatedContacts = contacts.filter(c => c.AccountId === accountId);
      if (relatedContacts.length === 0) {
        handleCaseFormChange('ContactId', null); // Changed from empty string to null
      } else if (caseForm.ContactId) {
        const currentContact = contacts.find(c => c.Id === caseForm.ContactId);
        if (!currentContact || currentContact.AccountId !== accountId) {
          handleCaseFormChange('ContactId', null); // Changed from empty string to null
        }
      }
    }
  };

  // Handle case form submission
  const handleCaseSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentCaseId) {
      updateCase(currentCaseId, caseForm);
    } else {
      createCase(caseForm);
    }
  };

  // Edit an existing case
  const editCase = (caseRecord) => {
    setCaseForm({
      Subject: caseRecord.Subject || '',
      Description: caseRecord.Description || '',
      Status: caseRecord.Status || 'New',
      Priority: caseRecord.Priority || 'Medium',
      Origin: caseRecord.Origin || 'Web',
      ContactId: caseRecord.ContactId || null, // Changed from empty string to null
      AccountId: caseRecord.AccountId || null  // Changed from empty string to null
    });
    setCurrentCaseId(caseRecord.Id);
    setIsEditMode(true);
    setIsCaseDialogOpen(true);
  };

  // Reset case form
  const resetCaseForm = () => {
    setCaseForm(initialCaseState);
    setCurrentCaseId('');
    setIsEditMode(false);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  // Get available contacts based on selected account
  const getAvailableContacts = () => {
    if (!caseForm.AccountId) return contacts;
    return contacts.filter(contact => contact.AccountId === caseForm.AccountId);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Refresh cases when tab changes
  useEffect(() => {
    if (token && instanceUrl) {
      fetchCases();
    }
  }, [activeTab]);

  if (!token || !instanceUrl) {
    return <div className="p-5">Please connect to Salesforce first.</div>;
  }

  return (
    <div className="p-5 bg-white border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6">Service Cloud Manager</h2>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList>
              <TabsTrigger value="open">Open Cases</TabsTrigger>
              <TabsTrigger value="closed">Closed Cases</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {activeTab === 'open' ? 'Open Cases' : 'Closed Cases'}
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchCases} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
              <Dialog open={isCaseDialogOpen} onOpenChange={(open) => {
                setIsCaseDialogOpen(open);
                if (!open) resetCaseForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCaseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Case' : 'Create New Case'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCaseSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject *</label>
                        <Input
                          id="subject"
                          value={caseForm.Subject}
                          onChange={(e) => handleCaseFormChange('Subject', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                          id="description"
                          value={caseForm.Description}
                          onChange={(e) => handleCaseFormChange('Description', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                        <Select 
                          value={caseForm.Status} 
                          onValueChange={(value) => handleCaseFormChange('Status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                        <Select 
                          value={caseForm.Priority} 
                          onValueChange={(value) => handleCaseFormChange('Priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map(priority => (
                              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="origin" className="block text-sm font-medium mb-1">Origin</label>
                        <Select 
                          value={caseForm.Origin} 
                          onValueChange={(value) => handleCaseFormChange('Origin', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin" />
                          </SelectTrigger>
                          <SelectContent>
                            {originOptions.map(origin => (
                              <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="account" className="block text-sm font-medium mb-1">Account</label>
                        <Select 
                          value={caseForm.AccountId} 
                          onValueChange={(value) => handleAccountChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {accounts.map(acc => (
                              <SelectItem key={acc.Id} value={acc.Id}>{acc.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="contact" className="block text-sm font-medium mb-1">Contact</label>
                        <Select 
                          value={caseForm.ContactId} 
                          onValueChange={(value) => handleCaseFormChange('ContactId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {getAvailableContacts().map(contact => (
                              <SelectItem key={contact.Id} value={contact.Id}>{contact.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsCaseDialogOpen(false)}>
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No cases found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">Case Number</th>
                    <th className="border px-4 py-2 text-left">Subject</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Priority</th>
                    <th className="border px-4 py-2 text-left">Contact</th>
                    <th className="border px-4 py-2 text-left">Account</th>
                    <th className="border px-4 py-2 text-left">Last Modified</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseRecord) => (
                    <tr key={caseRecord.Id}>
                      <td className="border px-4 py-2">{caseRecord.CaseNumber}</td>
                      <td className="border px-4 py-2">{caseRecord.Subject}</td>
                      <td className="border px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          caseRecord.Status === 'New' ? 'bg-blue-100 text-blue-800' :
                          caseRecord.Status === 'Working' ? 'bg-yellow-100 text-yellow-800' :
                          caseRecord.Status === 'Escalated' ? 'bg-red-100 text-red-800' :
                          caseRecord.Status === 'Closed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caseRecord.Status}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          caseRecord.Priority === 'High' || caseRecord.Priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          caseRecord.Priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caseRecord.Priority}
                        </span>
                      </td>
                      <td className="border px-4 py-2">{caseRecord.Contact?.Name || 'N/A'}</td>
                      <td className="border px-4 py-2">{caseRecord.Account?.Name || 'N/A'}</td>
                      <td className="border px-4 py-2">{formatDate(caseRecord.LastModifiedDate)}</td>
                      <td className="border px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => viewCaseDetails(caseRecord.Id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editCase(caseRecord)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteCase(caseRecord.Id)}>
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

      {/* Case Details Dialog */}
      <Dialog open={isCaseDetailsOpen} onOpenChange={setIsCaseDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Case: {selectedCase?.CaseNumber} - {selectedCase?.Subject}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCase && (
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-base">{selectedCase.Status}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                  <p className="text-base">{selectedCase.Priority}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Origin</h4>
                  <p className="text-base">{selectedCase.Origin || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created Date</h4>
                  <p className="text-base">{formatDate(selectedCase.CreatedDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Modified</h4>
                  <p className="text-base">{formatDate(selectedCase.LastModifiedDate)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Account</h4>
                  <p className="text-base">{selectedCase.Account?.Name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                  <p className="text-base">{selectedCase.Contact?.Name || 'N/A'}</p>
                </div>
                {selectedCase.Contact?.Email && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
                    <p className="text-base">{selectedCase.Contact.Email}</p>
                  </div>
                )}
                {selectedCase.Contact?.Phone && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Phone</h4>
                    <p className="text-base">{selectedCase.Contact.Phone}</p>
                  </div>
                )}
              </div>
              
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-base whitespace-pre-wrap">{selectedCase.Description || 'No description provided.'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button 
                variant="outline" 
                onClick={() => setIsCaseDetailsOpen(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setIsCaseDetailsOpen(false);
                  editCase(selectedCase);
                }}
              >
                Edit Case
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseManager;