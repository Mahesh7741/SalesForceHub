'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { executeDML } from '@/services/salesforceService';
import { toast } from 'sonner';

// Lead status options
const leadStatusOptions = [
  'Open - Not Contacted',
  'Working - Contacted',
  'Closed - Converted',
  'Closed - Not Converted'
];

// Initial lead form state
const initialLeadState = {
  FirstName: '',
  LastName: '',
  Company: '',
  Email: '',
  Phone: '',
  Status: 'Open - Not Contacted'
};

function LeadForm({
  isOpen,
  onClose,
  isEditMode,
  currentLead = null,
  onSuccess,
  token,
  instanceUrl,
  setError
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [leadForm, setLeadForm] = useState(
    currentLead ? {
      FirstName: currentLead.FirstName || '',
      LastName: currentLead.LastName || '',
      Company: currentLead.Company || '',
      Email: currentLead.Email || '',
      Phone: currentLead.Phone || '',
      Status: currentLead.Status || 'Open - Not Contacted'
    } : initialLeadState
  );

  const handleLeadFormChange = (field, value) => {
    setLeadForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && currentLead) {
        await executeDML(token, instanceUrl, 'update', 'Lead', {
          ...leadForm,
          Id: currentLead.Id,
        });
        toast.success("Lead updated successfully");
      } else {
        await executeDML(token, instanceUrl, 'create', 'Lead', leadForm);
        toast.success("Lead created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorText = `Failed to ${isEditMode ? 'update' : 'create'} lead: ${errorMessage}`;
      toast.error(errorText);
      setError(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditMode ? 'Edit Lead' : 'Create New Lead'}</h2>

        <form onSubmit={handleLeadSubmit}>
          <div>
            <div>
              <label htmlFor="firstName">First Name</label>
              <Input
                id="firstName"
                value={leadForm.FirstName}
                onChange={(e) => handleLeadFormChange('FirstName', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="lastName">Last Name *</label>
              <Input
                id="lastName"
                value={leadForm.LastName}
                onChange={(e) => handleLeadFormChange('LastName', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="company">Company *</label>
              <Input
                id="company"
                value={leadForm.Company}
                onChange={(e) => handleLeadFormChange('Company', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={leadForm.Email}
                onChange={(e) => handleLeadFormChange('Email', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone">Phone</label>
              <Input
                id="phone"
                value={leadForm.Phone}
                onChange={(e) => handleLeadFormChange('Phone', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={leadForm.Status}
                onChange={(e) => handleLeadFormChange('Status', e.target.value)}
              >
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin mr-2" />}
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;
