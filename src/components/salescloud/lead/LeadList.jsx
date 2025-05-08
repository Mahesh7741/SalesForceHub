// src\components\salescloud\lead\LeadList.tsx
'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash, ArrowRightLeft, RefreshCw } from "lucide-react";
import { executeDML } from '@/services/salesforceService';

interface LeadListProps {
  leads: Array<{
    Id: string;
    FirstName: string;
    LastName: string;
    Company: string;
    Email: string;
    Phone: string;
    Status: string;
  }>;
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (lead: { Id: string; FirstName: string; LastName: string; Company: string; Email: string; Phone: string; Status: string; }) => void;
  onConvert: (lead: { Id: string; FirstName: string; LastName: string; Company: string; Email: string; Phone: string; Status: string; }) => void;
  token: string;
  instanceUrl: string;
  setError: (message: string) => void;
}

const LeadList: React.FC<LeadListProps> = ({ 
  leads, 
  isLoading, 
  onRefresh, 
  onEdit, 
  onConvert, 
  token, 
  instanceUrl,
  setError 
}) => {
  // Delete lead handler
  interface DeleteLeadParams {
    id: string;
  }

  const deleteLead = async ({ id }: DeleteLeadParams): Promise<void> => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      await executeDML(token, instanceUrl, 'delete', 'Lead', {}, id);
      alert("Lead deleted successfully");
      onRefresh(); // Refresh the lead list
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to delete lead: ${err.message}`);
      } else {
        setError("Failed to delete lead: An unknown error occurred.");
      }
    }
  };

  return (
    <div>
      <div>
        <h3>Leads</h3>
        <div>
          <Button onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 /> : <RefreshCw />}
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : leads.length === 0 ? (
        <div>No leads found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.Id}>
                <td>{lead.FirstName} {lead.LastName}</td>
                <td>{lead.Company}</td>
                <td>{lead.Email}</td>
                <td>{lead.Phone}</td>
                <td>{lead.Status}</td>
                <td>
                  <div>
                    <Button onClick={() => onEdit(lead)}>
                      <Edit />
                    </Button>
                    <Button onClick={() => deleteLead({ id: lead.Id })}>
                      <Trash />
                    </Button>
                    <Button 
                      onClick={() => onConvert(lead)}
                      disabled={lead.Status === 'Closed - Converted'}
                    >
                      <ArrowRightLeft />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeadList;