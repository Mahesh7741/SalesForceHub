'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, RefreshCw, Plus, Edit, Trash } from "lucide-react";

const initialAccountState = {
  Name: '',
  Industry: '',
  Phone: '',
  Website: '',
  Type: 'Prospect'
};

// Account industry options
const accountIndustryOptions = [
  'Agriculture',
  'Apparel',
  'Banking',
  'Biotechnology',
  'Chemicals',
  'Communications',
  'Construction',
  'Consulting',
  'Education',
  'Electronics',
  'Energy',
  'Engineering',
  'Entertainment',
  'Environmental',
  'Finance',
  'Food & Beverage',
  'Government',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Machinery',
  'Manufacturing',
  'Media',
  'Not For Profit',
  'Recreation',
  'Retail',
  'Shipping',
  'Technology',
  'Telecommunications',
  'Transportation',
  'Utilities',
  'Other'
];

// Account type options
const accountTypeOptions = [
  'Analyst',
  'Competitor',
  'Customer',
  'Integrator',
  'Investor',
  'Partner',
  'Press',
  'Prospect',
  'Reseller',
  'Other'
];

const AccountManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountForm, setAccountForm] = useState(initialAccountState);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState('');

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
      fetchAccounts();
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

  const fetchAccounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await executeQuery(
        'SELECT Id, Name, Industry, Phone, Website, Type FROM Account ORDER BY Name ASC LIMIT 50'
      );
      setAccounts(records);
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createAccountRecord = async (data) => {
    setIsLoading(true);
    try {
      await executeDML('create', 'Account', data);
      alert("Account created successfully");
      fetchAccounts();
      setAccountForm(initialAccountState);
      setIsAccountDialogOpen(false);
    } catch (err) {
      setError(`Failed to create account: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccount = async (id, data) => {
    setIsLoading(true);
    try {
      await executeDML('update', 'Account', data, id);
      alert("Account updated successfully");
      fetchAccounts();
      setAccountForm(initialAccountState);
      setIsAccountDialogOpen(false);
      setIsEditMode(false);
    } catch (err) {
      setError(`Failed to update account: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    setIsLoading(true);
    try {
      await executeDML('delete', 'Account', {}, id);
      alert("Account deleted successfully");
      fetchAccounts();
    } catch (err) {
      setError(`Failed to delete account: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountFormChange = (field, value) => {
    setAccountForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentAccountId) {
      updateAccount(currentAccountId, accountForm);
    } else {
      createAccountRecord(accountForm);
    }
  };

  const editAccount = (acc) => {
    setAccountForm({
      Name: acc.Name || '',
      Industry: acc.Industry || '',
      Phone: acc.Phone || '',
      Website: acc.Website || '',
      Type: acc.Type || 'Prospect'
    });
    setCurrentAccountId(acc.Id);
    setIsEditMode(true);
    setIsAccountDialogOpen(true);
  };

  const resetAccountForm = () => {
    setAccountForm(initialAccountState);
    setCurrentAccountId('');
    setIsEditMode(false);
  };

  if (!token || !instanceUrl) {
    return <div className="p-5">Please connect to Salesforce first.</div>;
  }

  return (
    <div className="p-5 bg-white border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6">Accounts Manager</h2>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold"></h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchAccounts} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
              <Dialog open={isAccountDialogOpen} onOpenChange={(open) => {
                setIsAccountDialogOpen(open);
                if (!open) resetAccountForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAccountDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Account' : 'Create New Account'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAccountSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
                        <Input
                          id="name"
                          value={accountForm.Name}
                          onChange={(e) => handleAccountFormChange('Name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium mb-1">Industry</label>
                        <Select 
                          value={accountForm.Industry} 
                          onValueChange={(value) => handleAccountFormChange('Industry', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountIndustryOptions.map(industry => (
                              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
                        <Select 
                          value={accountForm.Type} 
                          onValueChange={(value) => handleAccountFormChange('Type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypeOptions.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                        <Input
                          id="phone"
                          value={accountForm.Phone}
                          onChange={(e) => handleAccountFormChange('Phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
                        <Input
                          id="website"
                          value={accountForm.Website}
                          onChange={(e) => handleAccountFormChange('Website', e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsAccountDialogOpen(false)}>
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
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Industry</th>
                    <th className="border px-4 py-2 text-left">Type</th>
                    <th className="border px-4 py-2 text-left">Phone</th>
                    <th className="border px-4 py-2 text-left">Website</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.Id}>
                      <td className="border px-4 py-2">{acc.Name}</td>
                      <td className="border px-4 py-2">{acc.Industry || 'N/A'}</td>
                      <td className="border px-4 py-2">{acc.Type || 'N/A'}</td>
                      <td className="border px-4 py-2">{acc.Phone || 'N/A'}</td>
                      <td className="border px-4 py-2">{acc.Website || 'N/A'}</td>
                      <td className="border px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => editAccount(acc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteAccount(acc.Id)}>
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

export default AccountManager;