'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, RefreshCw, Plus, Edit, Trash } from "lucide-react";

const initialOpportunityState = {
  Name: '',
  StageName: 'Prospecting',
  CloseDate: new Date().toISOString().split('T')[0],
  Amount: '0'
};

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
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [opportunityForm, setOpportunityForm] = useState(initialOpportunityState);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOpportunityId, setCurrentOpportunityId] = useState('');
  useEffect(() => {
    const savedAuthData = localStorage.getItem('sfAuthData');
    if (savedAuthData) {
      const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
      setToken(accessToken);
      setInstanceUrl(instanceUrl);
    }
  }, []);
  useEffect(() => {
    if (token && instanceUrl) {
      fetchOpportunities();
    }
  }, [token, instanceUrl]);

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

  const handleOpportunityFormChange = (field, value) => {
    setOpportunityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpportunitySubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentOpportunityId) {
      updateOpportunity(currentOpportunityId, opportunityForm);
    } else {
      createOpportunityRecord(opportunityForm);
    }
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
      <h2 className="text-2xl font-bold mb-6">Opportunities Manager</h2>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold"></h3>
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
          
          {isLoading ? (
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
    </div>
  );
};

export default SalesCloudManager;