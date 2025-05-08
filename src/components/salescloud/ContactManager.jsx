'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, RefreshCw, Plus, Edit, Trash } from "lucide-react";

const initialContactState = {
  FirstName: '',
  LastName: '',
  Email: '',
  Phone: '',
  Title: '',
  AccountId: ''
};

// Contact salutation options
const salutationOptions = [
  'Mr.',
  'Ms.',
  'Mrs.',
  'Dr.',
  'Prof.'
];

const ContactManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactForm, setContactForm] = useState(initialContactState);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContactId, setCurrentContactId] = useState('');
  const [salutation, setSalutation] = useState('');

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
      fetchContacts();
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

  const fetchContacts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await executeQuery(
        'SELECT Id, FirstName, LastName, Email, Phone, Title, AccountId, Account.Name, Salutation FROM Contact ORDER BY LastName, FirstName ASC LIMIT 50'
      );
      setContacts(records);
    } catch (err) {
      setError(`Failed to fetch contacts: ${err.message}`);
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
      setError(`Failed to fetch accounts: ${err.message}`);
    }
  };

  const createContactRecord = async (data) => {
    setIsLoading(true);
    try {
      // Add salutation if it was selected
      const contactData = { ...data };
      if (salutation) {
        contactData.Salutation = salutation;
      }
      
      await executeDML('create', 'Contact', contactData);
      alert("Contact created successfully");
      fetchContacts();
      setContactForm(initialContactState);
      setSalutation('');
      setIsContactDialogOpen(false);
    } catch (err) {
      setError(`Failed to create contact: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (id, data) => {
    setIsLoading(true);
    try {
      // Add salutation if it was selected
      const contactData = { ...data };
      if (salutation) {
        contactData.Salutation = salutation;
      }
      
      await executeDML('update', 'Contact', contactData, id);
      alert("Contact updated successfully");
      fetchContacts();
      setContactForm(initialContactState);
      setSalutation('');
      setIsContactDialogOpen(false);
      setIsEditMode(false);
    } catch (err) {
      setError(`Failed to update contact: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setIsLoading(true);
    try {
      await executeDML('delete', 'Contact', {}, id);
      alert("Contact deleted successfully");
      fetchContacts();
    } catch (err) {
      setError(`Failed to delete contact: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentContactId) {
      updateContact(currentContactId, contactForm);
    } else {
      createContactRecord(contactForm);
    }
  };

  const editContact = (contact) => {
    setContactForm({
      FirstName: contact.FirstName || '',
      LastName: contact.LastName || '',
      Email: contact.Email || '',
      Phone: contact.Phone || '',
      Title: contact.Title || '',
      AccountId: contact.AccountId || ''
    });
    setSalutation(contact.Salutation || '');
    setCurrentContactId(contact.Id);
    setIsEditMode(true);
    setIsContactDialogOpen(true);
  };

  const resetContactForm = () => {
    setContactForm(initialContactState);
    setSalutation('');
    setCurrentContactId('');
    setIsEditMode(false);
  };

  const getFullName = (contact) => {
    const prefix = contact.Salutation ? `${contact.Salutation} ` : '';
    const firstName = contact.FirstName || '';
    const lastName = contact.LastName || '';
    return `${prefix}${firstName} ${lastName}`.trim();
  };

  if (!token || !instanceUrl) {
    return <div className="p-5">Please connect to Salesforce first.</div>;
  }

  return (
    <div className="p-5 bg-white border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6">Contacts Manager</h2>
      
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold"></h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchContacts} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
              <Dialog open={isContactDialogOpen} onOpenChange={(open) => {
                setIsContactDialogOpen(open);
                if (!open) resetContactForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsContactDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Contact' : 'Create New Contact'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <label htmlFor="salutation" className="block text-sm font-medium mb-1">Salutation</label>
                        <Select 
                          value={salutation} 
                          onValueChange={(value) => setSalutation(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select salutation" />
                          </SelectTrigger>
                          <SelectContent>
                            {salutationOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                        <Input
                          id="firstName"
                          value={contactForm.FirstName}
                          onChange={(e) => handleContactFormChange('FirstName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name *</label>
                        <Input
                          id="lastName"
                          value={contactForm.LastName}
                          onChange={(e) => handleContactFormChange('LastName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                        <Input
                          id="title"
                          value={contactForm.Title}
                          onChange={(e) => handleContactFormChange('Title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="account" className="block text-sm font-medium mb-1">Account</label>
                        <Select 
                          value={contactForm.AccountId} 
                          onValueChange={(value) => handleContactFormChange('AccountId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- None --</SelectItem>
                            {accounts.map(acc => (
                              <SelectItem key={acc.Id} value={acc.Id}>{acc.Name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.Email}
                          onChange={(e) => handleContactFormChange('Email', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                        <Input
                          id="phone"
                          value={contactForm.Phone}
                          onChange={(e) => handleContactFormChange('Phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsContactDialogOpen(false)}>
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
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No contacts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Title</th>
                    <th className="border px-4 py-2 text-left">Account</th>
                    <th className="border px-4 py-2 text-left">Email</th>
                    <th className="border px-4 py-2 text-left">Phone</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.Id}>
                      <td className="border px-4 py-2">{getFullName(contact)}</td>
                      <td className="border px-4 py-2">{contact.Title || 'N/A'}</td>
                      <td className="border px-4 py-2">{contact.Account?.Name || 'N/A'}</td>
                      <td className="border px-4 py-2">{contact.Email || 'N/A'}</td>
                      <td className="border px-4 py-2">{contact.Phone || 'N/A'}</td>
                      <td className="border px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => editContact(contact)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteContact(contact.Id)}>
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

export default ContactManager;