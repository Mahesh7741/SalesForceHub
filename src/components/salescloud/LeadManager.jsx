// "use client";
// import React, { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import { Button } from "../ui/button";
// import { Card, CardContent } from "../ui/card";
// import { Input } from "../ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../ui/dialog";
// import { Checkbox } from "../ui/checkbox";
// import {
//   Loader2,
//   RefreshCw,
//   Plus,
//   Edit,
//   Trash,
//   ArrowRightLeft,
// } from "lucide-react";

// // Initial form states
// const initialLeadState = {
//   FirstName: '',
//   LastName: '',
//   Company: '',
//   Email: '',
//   Phone: '',
//   Status: 'Open - Not Contacted',
// };

// // Lead status options
// const leadStatusOptions = [
//   'Open - Not Contacted',
//   'Working - Contacted',
//   'Closed - Converted',
//   'Closed - Not Converted',
// ];

// const LeadManager = () => {
//   // Auth state
//   const [instanceUrl, setInstanceUrl] = useState('');
//   const [token, setToken] = useState('');

//   // Data state
//   const [leads, setLeads] = useState([]);

//   // UI state
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('leads');

//   // Form state
//   const [leadForm, setLeadForm] = useState(initialLeadState);
//   const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [currentLeadId, setCurrentLeadId] = useState('');

//   // Convert lead state
//   const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
//   const [convertLeadId, setConvertLeadId] = useState('');
//   const [convertLeadData, setConvertLeadData] = useState(null);
//   const [createOpportunity, setCreateOpportunity] = useState(true);

//   // Load auth data from local storage
//   useEffect(() => {
//     const savedAuthData = localStorage.getItem('sfAuthData');
//     if (savedAuthData) {
//       const { accessToken, instanceUrl } = JSON.parse(savedAuthData);
//       setToken(accessToken);
//       setInstanceUrl(instanceUrl);
//     }
//   }, []);

//   // Load data when auth is available
//   useEffect(() => {
//     if (token && instanceUrl) {
//       fetchLeads();
//     }
//   }, [token, instanceUrl]);

//   // Query execution helper
//   const executeQuery = async (query) => {
//     try {
//       const response = await fetch('/api/salescloud', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ accessToken: token, instanceUrl, query }),
//       });

//       const result = await response.json();
//       if (!response.ok)
//         throw new Error(result.error || 'Query execution failed');
//       return result.records || [];
//     } catch (err) {
//       throw new Error(err.message || 'Unknown error');
//     }
//   };

//   // Execute DML operation
//   const executeDML = async (operation, objectType, data, id) => {
//     try {
//       const response = await fetch('/api/salescloud/dml', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           accessToken: token,
//           instanceUrl,
//           operation,
//           objectType,
//           data,
//           id,
//         }),
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || 'Operation failed');
//       return result;
//     } catch (err) {
//       throw new Error(err.message || 'Unknown error');
//     }
//   };

//   // Data fetching functions
//   const fetchLeads = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const records = await executeQuery(
//         'SELECT Id, FirstName, LastName, Company, Email, Phone, Status, IsConverted FROM Lead ORDER BY CreatedDate DESC LIMIT 50'
//       );
//       setLeads(records);
//     } catch (err) {
//       setError(`Failed to fetch leads: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // CRUD operations for Lead
//   const createLead = async (data) => {
//     setIsLoading(true);
//     try {
//       await executeDML('create', 'Lead', data);
//       alert("Lead created successfully");
//       fetchLeads();
//       setLeadForm(initialLeadState);
//       setIsLeadDialogOpen(false);
//     } catch (err) {
//       setError(`Failed to create lead: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateLead = async (id, data) => {
//     setIsLoading(true);
//     try {
//       await executeDML('update', 'Lead', data, id);
//       alert("Lead updated successfully");
//       fetchLeads();
//       setLeadForm(initialLeadState);
//       setIsLeadDialogOpen(false);
//       setIsEditMode(false);
//     } catch (err) {
//       setError(`Failed to update lead: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteLead = async (id) => {
//     if (!confirm("Are you sure you want to delete this lead?")) return;

//     setIsLoading(true);
//     try {
//       await executeDML('delete', 'Lead', {}, id);
//       alert("Lead deleted successfully");
//       fetchLeads();
//     } catch (err) {
//       setError(`Failed to delete lead: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Lead conversion
//   const openConvertLeadDialog = (lead) => {
//     setConvertLeadId(lead.Id);
//     setConvertLeadData(lead);
//     setIsConvertDialogOpen(true);
//   };

//   const convertLead = async () => {
//     if (!convertLeadId || !convertLeadData) return;

//     setIsLoading(true);
//     try {
//       const result = await fetch('/api/salescloud/convert', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           accessToken: token,
//           instanceUrl,
//           leadId: convertLeadId,
//           createOpportunity,
//         }),
//       });

//       const data = await result.json();
//       if (!result.ok) throw new Error(data.error || 'Lead conversion failed');

//       alert("Lead converted successfully");

//       fetchLeads();
//       setIsConvertDialogOpen(false);
//     } catch (err) {
//       setError(`Failed to convert lead: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Form handling
//   const handleLeadFormChange = (field, value) => {
//     setLeadForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleLeadSubmit = (e) => {
//     e.preventDefault();
//     if (isEditMode && currentLeadId) {
//       updateLead(currentLeadId, leadForm);
//     } else {
//       createLead(leadForm);
//     }
//   };

//   const editLead = (lead) => {
//     // Check if lead is already converted
//     if (lead.IsConverted) {
//       alert("Cannot edit a converted lead.");
//       return;
//     }

//     setLeadForm({
//       FirstName: lead.FirstName || '',
//       LastName: lead.LastName || '',
//       Company: lead.Company || '',
//       Email: lead.Email || '',
//       Phone: lead.Phone || '',
//       Status: lead.Status || 'Open - Not Contacted',
//     });
//     setCurrentLeadId(lead.Id);
//     setIsEditMode(true);
//     setIsLeadDialogOpen(true);
//   };

//   // Reset forms
//   const resetLeadForm = () => {
//     setLeadForm(initialLeadState);
//     setCurrentLeadId('');
//     setIsEditMode(false);
//   };

//   if (!token || !instanceUrl) {
//     return <div className="p-5">Please connect to Salesforce first.</div>;
//   }

//   return (
//     <div className="p-5 bg-white border rounded-md shadow">
//       <h2 className="text-2xl font-bold mb-6">Sales Cloud Manager</h2>

//       {error && (
//         <div className="text-red-500 mb-4 p-3 bg-red-50 rounded flex justify-between items-center">
//           <span>{error}</span>
//           <Button variant="ghost" size="sm" onClick={() => setError('')}>
//             &times;
//           </Button>
//         </div>
//       )}

//       <Tabs defaultValue="leads" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="mb-4">
//           <TabsTrigger value="leads">Leads</TabsTrigger>
//         </TabsList>

//         {/* Leads Tab */}
//         <TabsContent value="leads">
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-semibold">Leads</h3>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={fetchLeads}
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <RefreshCw className="h-4 w-4" />
//                     )}
//                     <span className="ml-2">Refresh</span>
//                   </Button>
//                   <Dialog
//                     open={isLeadDialogOpen}
//                     onOpenChange={(open) => {
//                       setIsLeadDialogOpen(open);
//                       if (!open) resetLeadForm();
//                     }}
//                   >
//                     <DialogTrigger asChild>
//                       <Button onClick={() => setIsLeadDialogOpen(true)}>
//                         <Plus className="h-4 w-4 mr-2" />
//                         New Lead
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>
//                           {isEditMode ? 'Edit Lead' : 'Create New Lead'}
//                         </DialogTitle>
//                       </DialogHeader>
//                       <form onSubmit={handleLeadSubmit}>
//                         <div className="grid gap-4 py-4">
//                           <div className="grid grid-cols-2 gap-4">
//                             <div>
//                               <label
//                                 htmlFor="firstName"
//                                 className="block text-sm font-medium mb-1"
//                               >
//                                 First Name
//                               </label>
//                               <Input
//                                 id="firstName"
//                                 value={leadForm.FirstName}
//                                 onChange={(e) =>
//                                   handleLeadFormChange(
//                                     'FirstName',
//                                     e.target.value
//                                   )
//                                 }
//                               />
//                             </div>
//                             <div>
//                               <label
//                                 htmlFor="lastName"
//                                 className="block text-sm font-medium mb-1"
//                               >
//                                 Last Name *
//                               </label>
//                               <Input
//                                 id="lastName"
//                                 value={leadForm.LastName}
//                                 onChange={(e) =>
//                                   handleLeadFormChange(
//                                     'LastName',
//                                     e.target.value
//                                   )
//                                 }
//                                 required
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <label
//                               htmlFor="company"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Company *
//                             </label>
//                             <Input
//                               id="company"
//                               value={leadForm.Company}
//                               onChange={(e) =>
//                                 handleLeadFormChange('Company', e.target.value)
//                               }
//                               required
//                             />
//                           </div>
//                           <div>
//                             <label
//                               htmlFor="email"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Email
//                             </label>
//                             <Input
//                               id="email"
//                               type="email"
//                               value={leadForm.Email}
//                               onChange={(e) =>
//                                 handleLeadFormChange('Email', e.target.value)
//                               }
//                             />
//                           </div>
//                           <div>
//                             <label
//                               htmlFor="phone"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Phone
//                             </label>
//                             <Input
//                               id="phone"
//                               value={leadForm.Phone}
//                               onChange={(e) =>
//                                 handleLeadFormChange('Phone', e.target.value)
//                               }
//                             />
//                           </div>
//                           <div>
//                             <label
//                               htmlFor="status"
//                               className="block text-sm font-medium mb-1"
//                             >
//                               Status
//                             </label>
//                             <Select
//                               value={leadForm.Status}
//                               onValueChange={(value) =>
//                                 handleLeadFormChange('Status', value)
//                               }
//                             >
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select status" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {leadStatusOptions.map((status) => (
//                                   <SelectItem key={status} value={status}>
//                                     {status}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </div>
//                         </div>
//                         <DialogFooter>
//                           <Button
//                             variant="outline"
//                             type="button"
//                             onClick={() => setIsLeadDialogOpen(false)}
//                           >
//                             Cancel
//                           </Button>
//                           <Button type="submit" disabled={isLoading}>
//                             {isLoading && (
//                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                             )}
//                             {isEditMode ? 'Update' : 'Create'}
//                           </Button>
//                         </DialogFooter>
//                       </form>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </div>

//               {isLoading && activeTab === 'leads' ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 </div>
//               ) : leads.length === 0 ? (
//                 <div className="text-center py-12 text-gray-500">
//                   No leads found.
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="border px-4 py-2 text-left">Name</th>
//                         <th className="border px-4 py-2 text-left">Company</th>
//                         <th className="border px-4 py-2 text-left">Email</th>
//                         <th className="border px-4 py-2 text-left">Phone</th>
//                         <th className="border px-4 py-2 text-left">Status</th>
//                         <th className="border px-4 py-2 text-center">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {leads.map((lead) => (
//                         <tr
//                           key={lead.Id}
//                           className={lead.IsConverted ? "bg-blue-50" : ""}
//                         >
//                           <td className="border px-4 py-2">
//                             {lead.FirstName} {lead.LastName}
//                             {lead.IsConverted && (
//                               <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                                 Converted
//                               </span>
//                             )}
//                           </td>
//                           <td className="border px-4 py-2">{lead.Company}</td>
//                           <td className="border px-4 py-2">{lead.Email}</td>
//                           <td className="border px-4 py-2">{lead.Phone}</td>
//                           <td className="border px-4 py-2">{lead.Status}</td>
//                           <td className="border px-4 py-2">
//                             <div className="flex justify-center gap-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => editLead(lead)}
//                                 disabled={lead.IsConverted}
//                                 title={
//                                   lead.IsConverted
//                                     ? "Cannot edit converted lead"
//                                     : "Edit lead"
//                                 }
//                               >
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => deleteLead(lead.Id)}
//                                 title="Delete lead"
//                               >
//                                 <Trash className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 className="bg-blue-600 hover:bg-blue-700 text-white"
//                                 onClick={() => openConvertLeadDialog(lead)}
//                                 disabled={lead.IsConverted}
//                                 title={
//                                   lead.IsConverted
//                                     ? "Lead already converted"
//                                     : "Convert lead"
//                                 }
//                               >
//                                 <ArrowRightLeft className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Lead Conversion Dialog */}
//       <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Convert Lead</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             {convertLeadData && (
//               <div className="mb-4">
//                 <p className="font-medium">
//                   Converting lead: {convertLeadData.FirstName}{" "}
//                   {convertLeadData.LastName}, {convertLeadData.Company}
//                 </p>
//               </div>
//             )}

//             <p className="text-sm text-gray-500 mb-4">
//               This will convert the lead into an account, contact, and
//               optionally an opportunity.
//             </p>

//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="createOpportunity"
//                 checked={createOpportunity}
//                 onCheckedChange={setCreateOpportunity}
//               />
//               <label
//                 htmlFor="createOpportunity"
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 Create Opportunity
//               </label>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsConvertDialogOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button onClick={convertLead} disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Convert Lead
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default LeadManager;




"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import {
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash,
  ArrowRightLeft,
} from "lucide-react";

// Initial form states
const initialLeadState = {
  FirstName: '',
  LastName: '',
  Company: '',
  Email: '',
  Phone: '',
  Status: 'Open - Not Contacted',
};

// Lead status options
const leadStatusOptions = [
  'Open - Not Contacted',
  'Working - Contacted',
  'Closed - Converted',
  'Closed - Not Converted',
];

const LeadManager = () => {
  // Auth state
  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');

  // Data state
  const [leads, setLeads] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [leadForm, setLeadForm] = useState(initialLeadState);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState('');

  // Convert lead state
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
      if (!response.ok)
        throw new Error(result.error || 'Query execution failed');
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
          id,
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
        'SELECT Id, FirstName, LastName, Company, Email, Phone, Status, IsConverted FROM Lead ORDER BY CreatedDate DESC LIMIT 50'
      );
      setLeads(records);
    } catch (err) {
      setError(`Failed to fetch leads: ${err.message}`);
    } finally {
      setIsLoading(false);
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
          createOpportunity,
        }),
      });

      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Lead conversion failed');

      alert("Lead converted successfully");

      fetchLeads();
      setIsConvertDialogOpen(false);
    } catch (err) {
      setError(`Failed to convert lead: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Form handling
  const handleLeadFormChange = (field, value) => {
    setLeadForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (isEditMode && currentLeadId) {
      updateLead(currentLeadId, leadForm);
    } else {
      createLead(leadForm);
    }
  };

  const editLead = (lead) => {
    // Check if lead is already converted
    if (lead.IsConverted) {
      alert("Cannot edit a converted lead.");
      return;
    }

    setLeadForm({
      FirstName: lead.FirstName || '',
      LastName: lead.LastName || '',
      Company: lead.Company || '',
      Email: lead.Email || '',
      Phone: lead.Phone || '',
      Status: lead.Status || 'Open - Not Contacted',
    });
    setCurrentLeadId(lead.Id);
    setIsEditMode(true);
    setIsLeadDialogOpen(true);
  };

  // Reset forms
  const resetLeadForm = () => {
    setLeadForm(initialLeadState);
    setCurrentLeadId('');
    setIsEditMode(false);
  };

  if (!token || !instanceUrl) {
    return <div className="p-5">Please connect to Salesforce first.</div>;
  }

  return (
    <div className="p-5 bg-white border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-6">Lead Manager</h2>

      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError('')}>
            &times;
          </Button>
        </div>
      )}

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
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
              <Dialog
                open={isLeadDialogOpen}
                onOpenChange={(open) => {
                  setIsLeadDialogOpen(open);
                  if (!open) resetLeadForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsLeadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Lead
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? 'Edit Lead' : 'Create New Lead'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLeadSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium mb-1"
                          >
                            First Name
                          </label>
                          <Input
                            id="firstName"
                            value={leadForm.FirstName}
                            onChange={(e) =>
                              handleLeadFormChange(
                                'FirstName',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium mb-1"
                          >
                            Last Name *
                          </label>
                          <Input
                            id="lastName"
                            value={leadForm.LastName}
                            onChange={(e) =>
                              handleLeadFormChange(
                                'LastName',
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium mb-1"
                        >
                          Company *
                        </label>
                        <Input
                          id="company"
                          value={leadForm.Company}
                          onChange={(e) =>
                            handleLeadFormChange('Company', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-1"
                        >
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={leadForm.Email}
                          onChange={(e) =>
                            handleLeadFormChange('Email', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium mb-1"
                        >
                          Phone
                        </label>
                        <Input
                          id="phone"
                          value={leadForm.Phone}
                          onChange={(e) =>
                            handleLeadFormChange('Phone', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium mb-1"
                        >
                          Status
                        </label>
                        <Select
                          value={leadForm.Status}
                          onValueChange={(value) =>
                            handleLeadFormChange('Status', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {leadStatusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsLeadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
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
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No leads found.
            </div>
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
                    <th className="border px-4 py-2 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.Id}
                      className={lead.IsConverted ? "bg-blue-50" : ""}
                    >
                      <td className="border px-4 py-2">
                        {lead.FirstName} {lead.LastName}
                        {lead.IsConverted && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Converted
                          </span>
                        )}
                      </td>
                      <td className="border px-4 py-2">{lead.Company}</td>
                      <td className="border px-4 py-2">{lead.Email}</td>
                      <td className="border px-4 py-2">{lead.Phone}</td>
                      <td className="border px-4 py-2">{lead.Status}</td>
                      <td className="border px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editLead(lead)}
                            disabled={lead.IsConverted}
                            title={
                              lead.IsConverted
                                ? "Cannot edit converted lead"
                                : "Edit lead"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLead(lead.Id)}
                            title="Delete lead"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => openConvertLeadDialog(lead)}
                            disabled={lead.IsConverted}
                            title={
                              lead.IsConverted
                                ? "Lead already converted"
                                : "Convert lead"
                            }
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
                  Converting lead: {convertLeadData.FirstName}{" "}
                  {convertLeadData.LastName}, {convertLeadData.Company}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              This will convert the lead into an account, contact, and
              optionally an opportunity.
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="createOpportunity"
                checked={createOpportunity}
                onCheckedChange={setCreateOpportunity}
              />
              <label
                htmlFor="createOpportunity"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create Opportunity
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConvertDialogOpen(false)}
            >
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

export default LeadManager;