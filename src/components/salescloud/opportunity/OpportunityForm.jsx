'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { executeDML } from '@/services/salesforceService';

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

// Initial form state
const initialOpportunityState = {
  Name: '',
  StageName: 'Prospecting',
  CloseDate: new Date().toISOString().split('T')[0],
  Amount: '0'
};

const OpportunityForm = ({ 
  isOpen, 
  onClose, 
  isEditMode, 
  currentOpportunity, 
  onSuccess, 
  token, 
  instanceUrl,
  setError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [opportunityForm, setOpportunityForm] = useState(
    currentOpportunity ? {
      Name: currentOpportunity.Name || '',
      StageName: currentOpportunity.StageName || 'Prospecting',
      CloseDate: currentOpportunity.CloseDate || new Date().toISOString().split('T')[0],
      Amount: currentOpportunity.Amount || '0'
    } : initialOpportunityState
  );

  const handleOpportunityFormChange = (field, value) => {
    setOpportunityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpportunitySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && currentOpportunity) {
        await executeDML(token, instanceUrl, 'update', 'Opportunity', opportunityForm, currentOpportunity.Id || null);
        alert("Opportunity updated successfully");
      } else {
        await executeDML(token, instanceUrl, 'create', 'Opportunity', opportunityForm);
        alert("Opportunity created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} opportunity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}</h2>
        
        <form onSubmit={handleOpportunitySubmit}>
          <div>
            <label htmlFor="name">Name *</label>
            <Input
              id="name"
              value={opportunityForm.Name}
              onChange={(e) => handleOpportunityFormChange('Name', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="stage">Stage</label>
            <select
              id="stage"
              value={opportunityForm.StageName}
              onChange={(e) => handleOpportunityFormChange('StageName', e.target.value)}
            >
              {opportunityStageOptions.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="closeDate">Close Date</label>
            <Input
              id="closeDate"
              type="date"
              value={opportunityForm.CloseDate}
              onChange={(e) => handleOpportunityFormChange('CloseDate', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="amount">Amount</label>
            <Input
              id="amount"
              type="number"
              value={opportunityForm.Amount}
              onChange={(e) => handleOpportunityFormChange('Amount', e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm;
