'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash, RefreshCw } from "lucide-react";
import { executeDML } from '@/services/salesforceService';

const OpportunityList = ({ 
  opportunities, 
  isLoading, 
  onRefresh, 
  onEdit, 
  token, 
  instanceUrl, 
  setError 
}) => {
  // Delete opportunity handler
  const deleteOpportunity = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      await executeDML(token, instanceUrl, 'delete', 'Opportunity', {}, id);
      alert("Opportunity deleted successfully");
      onRefresh(); // Refresh the opportunity list
    } catch (err) {
      setError(`Failed to delete opportunity: ${err.message}`);
    }
  };

  return (
    <div>
      <div>
        <h3>Opportunities</h3>
        <div>
          <Button onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 /> : <RefreshCw />}
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : opportunities.length === 0 ? (
        <div>No opportunities found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stage</th>
              <th>Close Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.Id}>
                <td>{opp.Name}</td>
                <td>{opp.StageName}</td>
                <td>{opp.CloseDate}</td>
                <td>${parseFloat(opp.Amount || '0').toLocaleString()}</td>
                <td>
                  <div>
                    <Button onClick={() => onEdit(opp)}>
                      <Edit />
                    </Button>
                    <Button onClick={() => deleteOpportunity(opp.Id)}>
                      <Trash />
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

export default OpportunityList;
