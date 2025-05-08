// src/components/salescloud/lead/LeadConversion.jsx
'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { convertLead } from '@/services/salesforceService';

const LeadConversion = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
  token,
  instanceUrl,
  setError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createOpportunity, setCreateOpportunity] = useState(true);

  const handleConversion = async () => {
    if (!lead) return;

    setIsLoading(true);
    try {
      await convertLead(token, instanceUrl, lead.Id, createOpportunity);
      alert("Lead converted successfully");
      onSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to convert lead: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Convert Lead</h2>

        <div>
          <p>
            Converting lead: {lead.FirstName} {lead.LastName}, {lead.Company}
          </p>

          <div>
            <input
              type="checkbox"
              id="createOpp"
              checked={createOpportunity}
              onChange={(e) => setCreateOpportunity(e.target.checked)}
            />
            <label htmlFor="createOpp">Create opportunity during conversion</label>
          </div>

          <p>
            This will convert the lead into an account, contact, and optionally an opportunity.
          </p>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConversion} disabled={isLoading}>
            {isLoading && <Loader2 />}
            Convert Lead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadConversion;
