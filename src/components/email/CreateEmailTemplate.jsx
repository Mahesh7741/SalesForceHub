// // // import { useState } from 'react';

// // // const CreateEmailTemplate = () => {
// // //   const [name, setName] = useState('');
// // //   const [subject, setSubject] = useState('');
// // //   const [htmlContent, setHtmlContent] = useState('');
// // //   const [loading, setLoading] = useState(false);
// // //   const [responseMessage, setResponseMessage] = useState('');
// // //   const [errorMessage, setErrorMessage] = useState('');

// // //   const handleSubmit = async (event) => {
// // //     event.preventDefault();

// // //     if (!name || !subject || !htmlContent) {
// // //       setErrorMessage('All fields are required.');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     setErrorMessage('');
// // //     setResponseMessage('');

// // //     const body = {
// // //       sfAuthData: {
// // //         instanceUrl: 'https://yourInstance.salesforce.com', // Replace with actual Salesforce instance URL
// // //         accessToken: 'yourAccessToken' // Replace with actual Salesforce access token
// // //       },
// // //       emailTemplateData: {
// // //         name,
// // //         subject,
// // //         htmlContent
// // //       }
// // //     };

// // //     try {
// // //       const res = await fetch('/api/email', {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(body),
// // //       });

// // //       const data = await res.json();

// // //       if (data.success) {
// // //         setResponseMessage(`Email template created successfully! Template ID: ${data.emailTemplateId}`);
// // //       } else {
// // //         setErrorMessage(data.error || 'Failed to create the email template.');
// // //       }
// // //     } catch (error) {
// // //       setErrorMessage('An error occurred while creating the email template.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <h1>Create Email Template</h1>
// // //       <form onSubmit={handleSubmit}>
// // //         <div>
// // //           <label>
// // //             Template Name:
// // //             <input
// // //               type="text"
// // //               value={name}
// // //               onChange={(e) => setName(e.target.value)}
// // //               required
// // //             />
// // //           </label>
// // //         </div>
// // //         <div>
// // //           <label>
// // //             Subject:
// // //             <input
// // //               type="text"
// // //               value={subject}
// // //               onChange={(e) => setSubject(e.target.value)}
// // //               required
// // //             />
// // //           </label>
// // //         </div>
// // //         <div>
// // //           <label>
// // //             HTML Content:
// // //             <textarea
// // //               value={htmlContent}
// // //               onChange={(e) => setHtmlContent(e.target.value)}
// // //               rows={10}
// // //               required
// // //             />
// // //           </label>
// // //         </div>
// // //         <button type="submit" disabled={loading}>
// // //           {loading ? 'Creating...' : 'Create Template'}
// // //         </button>
// // //       </form>

// // //       {responseMessage && (
// // //         <div style={{ color: 'green', marginTop: '20px' }}>
// // //           <strong>{responseMessage}</strong>
// // //         </div>
// // //       )}

// // //       {errorMessage && (
// // //         <div style={{ color: 'red', marginTop: '20px' }}>
// // //           <strong>{errorMessage}</strong>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default CreateEmailTemplate;


// // "use client";

// // import { useState, useEffect } from "react";
// // import { Button } from "../../components/ui/button";
// // import { Input } from "../../components/ui/input";
// // import { Textarea } from "../../components/ui/textarea";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// // import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
// // import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
// // import { Check, Plus, Edit, Trash2, Save, AlertCircle, Loader2, CodeSquare } from "lucide-react";


// // const EmailTemplateManager = () => {
// //   // States for template management
// //   const [templates, setTemplates] = useState([]);
// //   const [selectedTemplate, setSelectedTemplate] = useState(null);
// //   const [activeTab, setActiveTab] = useState("existing");
  
// //   // States for form values
// //   const [name, setName] = useState("");
// //   const [subject, setSubject] = useState("");
// //   const [htmlContent, setHtmlContent] = useState("");
  
// //   // States for UI feedback
// //   const [loading, setLoading] = useState(false);
// //   const [fetchingTemplates, setFetchingTemplates] = useState(false);
// //   const [message, setMessage] = useState({ type: "", text: "" });

// //   // Fetch templates on component mount
// //   useEffect(() => {
// //     fetchTemplates();
// //   }, []);

// //   // Fetch all templates from Salesforce
// //   const fetchTemplates = async () => {
// //     setFetchingTemplates(true);
// //     setMessage({ type: "", text: "" });

// //     try {
// //       // Simulating fetch for now - replace with actual API call
// //       // const res = await fetch('/api/templates');
// //       // const data = await res.json();
      
// //       // Mocked data for demonstration
// //     //   setTimeout(() => {
// //     //     const mockTemplates = [
// //     //       { id: '1', name: 'Welcome Email', subject: 'Welcome to our service', htmlContent: '<h1>Welcome!</h1><p>Thank you for joining us.</p>' },
// //     //       { id: '2', name: 'Monthly Newsletter', subject: 'Your Monthly Update', htmlContent: '<h1>Monthly Newsletter</h1><p>Here are this month\'s updates...</p>' },
// //     //       { id: '3', name: 'Password Reset', subject: 'Reset Your Password', htmlContent: '<h1>Password Reset</h1><p>Click here to reset your password.</p>' }
// //     //     ];
        
// //     //     setTemplates(mockTemplates);
// //     //     setFetchingTemplates(false);
// //     //   }, 1000);

// //   const authdata=localStorage.getItem('sfAuthData')
// //   const {accessToken,instanceUrl}=JSON.parse(authdata)

// //     const res = await fetch('/api/email', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({
// //           sfAuthData: {
// //             instanceUrl: instanceUrl,
// //             accessToken: accessToken
// //           }
// //         })
// //       });
      
// //       const data = await res.json();
// //        console.log(data)
// //       if (res.ok && data.templates) {
// //         setTemplates(data.templates);
// //       } else {
// //         setMessage({ type: "error", text: data.error || "Failed to fetch templates." });
// //       }
// //       setFetchingTemplates(false);
      
      
// //     } catch (error) {
// //       setMessage({ 
// //         type: "error", 
// //         text: "Failed to fetch templates. Please try again."
// //       });
// //       setFetchingTemplates(false);
// //     }
// //   };

// //   // Select a template to edit
// //   const handleSelectTemplate = (templateId) => {
// //     const template = templates.find(t => t.id === templateId);
// //     if (template) {
// //       setSelectedTemplate(template);
// //       setName(template.name);
// //       setSubject(template.subject);
// //       setHtmlContent(template.htmlContent);
// //       setActiveTab("edit");
// //     }
// //   };

// //   // Reset form for creating a new template
// //   const handleCreateNew = () => {
// //     setSelectedTemplate(null);
// //     setName("");
// //     setSubject("");
// //     setHtmlContent("");
// //     setActiveTab("create");
// //   };

// //   // Submit form to create or update template
// //   const handleSubmit = async (event) => {
// //     if (event) event.preventDefault();
    
// //     if (!name || !subject || !htmlContent) {
// //       setMessage({ type: "error", text: "All fields are required." });
// //       return;
// //     }

// //     setLoading(true);
// //     setMessage({ type: "", text: "" });

// //     const body = {
// //       sfAuthData: {
// //         instanceUrl: 'https://yourInstance.salesforce.com', // Replace with actual Salesforce instance URL
// //         accessToken: 'yourAccessToken' // Replace with actual Salesforce access token
// //       },
// //       emailTemplateData: {
// //         name,
// //         subject,
// //         htmlContent,
// //         // If we're editing, include the template ID
// //         ...(selectedTemplate && { id: selectedTemplate.id }),
// //         // Specify the folder type as public
// //         folder: "public"
// //       }
// //     };

// //     try {
// //       // For creating new template
// //       let endpoint = '/api/email';
      
// //       // For updating existing template
// //       if (selectedTemplate) {
// //         endpoint = `/api/email/${selectedTemplate.id}`;
// //       }

// //       const res = await fetch(endpoint, {
// //         method: selectedTemplate ? 'PUT' : 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(body),
// //       });

// //       const data = await res.json();

// //       if (data.success) {
// //         // Update the templates list with the new or updated template
// //         if (selectedTemplate) {
// //           setTemplates(templates.map(t => 
// //             t.id === selectedTemplate.id 
// //               ? { ...t, name, subject, htmlContent } 
// //               : t
// //           ));
// //           setMessage({ type: "success", text: "Template updated successfully!" });
// //         } else {
// //           setTemplates([...templates, { id: data.emailTemplateId, name, subject, htmlContent }]);
// //           setMessage({ type: "success", text: "New template created successfully!" });
// //           // Reset form after creating
// //           setName("");
// //           setSubject("");
// //           setHtmlContent("");
// //         }
// //       } else {
// //         setMessage({ type: "error", text: data.error || "Operation failed." });
// //       }
// //     } catch (error) {
// //       setMessage({ 
// //         type: "error", 
// //         text: "An error occurred while processing your request."
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Delete a template
// //   const handleDeleteTemplate = async (templateId) => {
// //     setLoading(true);
    
// //     try {
// //       // In a real implementation, you would make an API call here
// //       // const res = await fetch(`/api/email/${templateId}`, { method: 'DELETE' });
// //       // const data = await res.json();
      
// //       // Simulate successful deletion
// //       setTimeout(() => {
// //         setTemplates(templates.filter(t => t.id !== templateId));
        
// //         // If we were editing this template, reset the form
// //         if (selectedTemplate && selectedTemplate.id === templateId) {
// //           setSelectedTemplate(null);
// //           setName("");
// //           setSubject("");
// //           setHtmlContent("");
// //           setActiveTab("existing");
// //         }
        
// //         setMessage({ type: "success", text: "Template deleted successfully!" });
// //         setLoading(false);
// //       }, 800);
      
// //     } catch (error) {
// //       setMessage({ type: "error", text: "Failed to delete template." });
// //       setLoading(false);
// //     }
// //   };

// //   // Preview the template HTML
// //   const previewTemplate = () => {
// //     const newWindow = window.open();
// //     newWindow.document.write(htmlContent);
// //     newWindow.document.close();
// //   };

// //   // Template form component for both create and edit
// //   const TemplateForm = ({ formType }) => {
// //     return (
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>{formType === "edit" ? "Edit Template" : "Create New Template"}</CardTitle>
// //           <CardDescription>
// //             {formType === "edit" 
// //               ? "Make changes to your template" 
// //               : "Fill in the details to create a new email template"}
// //           </CardDescription>
// //         </CardHeader>
// //         <CardContent className="space-y-4">
// //           <div className="space-y-2">
// //             <label htmlFor="name" className="text-sm font-medium">Template Name</label>
// //             <Input
// //               id="name"
// //               value={name}
// //               onChange={(e) => setName(e.target.value)}
// //               placeholder="Enter template name"
// //               required
// //             />
// //           </div>
          
// //           <div className="space-y-2">
// //             <label htmlFor="subject" className="text-sm font-medium">Subject Line</label>
// //             <Input
// //               id="subject"
// //               value={subject}
// //               onChange={(e) => setSubject(e.target.value)}
// //               placeholder="Enter email subject"
// //               required
// //             />
// //           </div>
          
// //           <div className="space-y-2">
// //             <label htmlFor="content" className="text-sm font-medium">HTML Content</label>
// //             <Textarea
// //               id="content"
// //               value={htmlContent}
// //               onChange={(e) => setHtmlContent(e.target.value)}
// //               placeholder="Enter HTML content for your email template"
// //               className="min-h-[250px] font-mono"
// //               required
// //             />
// //           </div>
// //         </CardContent>
// //         <CardFooter className="flex flex-col sm:flex-row gap-4">
// //           <Button 
// //             type="button" 
// //             variant="outline" 
// //             onClick={previewTemplate}
// //             className="w-full sm:w-auto"
// //             disabled={!htmlContent}
// //           >
// //             Preview Template
// //           </Button>
// //           <Button 
// //             type="button" 
// //             className="w-full sm:w-auto"
// //             disabled={loading || !name || !subject || !htmlContent}
// //             onClick={handleSubmit}
// //           >
// //             {loading ? (
// //               <>
// //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                 {formType === "edit" ? "Updating..." : "Creating..."}
// //               </>
// //             ) : (
// //               <>
// //                 <Save className="mr-2 h-4 w-4" />
// //                 {formType === "edit" ? "Update Template" : "Create Template"}
// //               </>
// //             )}
// //           </Button>
// //         </CardFooter>
// //       </Card>
// //     );
// //   };

// //   return (
// //     <div className="container mx-auto py-8 px-4">
// //       <h1 className="text-3xl font-bold mb-6 text-center">Email Template Manager</h1>
      
// //       {message.text && (
// //         <Alert className={`mb-6 ${message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}>
// //           <AlertCircle className="h-4 w-4 mr-2" />
// //           <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
// //           <AlertDescription>{message.text}</AlertDescription>
// //         </Alert>
// //       )}
      
// //       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
// //         <TabsList className="grid grid-cols-3 mb-6">
// //           <TabsTrigger value="existing">Existing Templates</TabsTrigger>
// //           <TabsTrigger value="edit" disabled={!selectedTemplate}>Edit Template</TabsTrigger>
// //           <TabsTrigger value="create">Create New</TabsTrigger>
// //         </TabsList>
        
// //         <TabsContent value="existing">
// //           <Card>
// //             <CardHeader>
// //               <CardTitle className="flex justify-between items-center">
// //                 <span>Available Templates</span>
// //                 <Button variant="outline" onClick={fetchTemplates} disabled={fetchingTemplates}>
// //                   {fetchingTemplates ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Refresh"}
// //                 </Button>
// //               </CardTitle>
// //               <CardDescription>
// //                 Select a template to edit or create a new one
// //               </CardDescription>
// //             </CardHeader>
// //             <CardContent>
// //               {fetchingTemplates ? (
// //                 <div className="flex justify-center items-center h-40">
// //                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //                 </div>
// //               ) : templates.length === 0 ? (
// //                 <div className="text-center py-8 text-gray-500">
// //                   <p>No templates found</p>
// //                   <Button 
// //                     onClick={handleCreateNew} 
// //                     className="mt-4"
// //                     variant="outline"
// //                   >
// //                     <Plus className="h-4 w-4 mr-2" />
// //                     Create Your First Template
// //                   </Button>
// //                 </div>
// //               ) : (
// //                 <div className="grid gap-4">
// //                   {templates.map((template) => (
// //                     <div key={template.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
// //                       <div className="flex-1">
// //                         <h3 className="font-medium">{template.name}</h3>
// //                         <p className="text-sm text-gray-500">{template.subject}</p>
// //                       </div>
// //                       <div className="flex gap-2">
// //                         <Button 
// //                           variant="outline" 
// //                           size="sm" 
// //                           onClick={() => handleSelectTemplate(template.id)}
// //                         >
// //                           <Edit className="h-4 w-4 mr-2" />
// //                           Edit
// //                         </Button>
// //                         <Button 
// //                           variant="destructive" 
// //                           size="sm" 
// //                           onClick={() => handleDeleteTemplate(template.id)}
// //                           disabled={loading}
// //                         >
// //                           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
// //                         </Button>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </CardContent>
// //             <CardFooter>
// //               <Button onClick={handleCreateNew} className="w-full">
// //                 <Plus className="h-4 w-4 mr-2" />
// //                 Create New Template
// //               </Button>
// //             </CardFooter>
// //           </Card>
// //         </TabsContent>
        
// //         <TabsContent value="edit">
// //           <TemplateForm formType="edit" />
// //         </TabsContent>
        
// //         <TabsContent value="create">
// //           <TemplateForm formType="create" />
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // };

// // export default EmailTemplateManager;

// // Fixed EmailTemplateManager.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
// import { Check, Plus, Edit, Trash2, Save, AlertCircle, Loader2, CodeSquare } from "lucide-react";


// const EmailTemplateManager = () => {
//   // States for template management
//   const [templates, setTemplates] = useState([]);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [activeTab, setActiveTab] = useState("existing");
  
//   // States for form values
//   const [name, setName] = useState("");
//   const [subject, setSubject] = useState("");
//   const [htmlContent, setHtmlContent] = useState("");
  
//   // States for UI feedback
//   const [loading, setLoading] = useState(false);
//   const [fetchingTemplates, setFetchingTemplates] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   // Fetch templates on component mount
//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   // Fetch all templates from Salesforce
//   const fetchTemplates = async () => {
//     setFetchingTemplates(true);
//     setMessage({ type: "", text: "" });

//     try {
//       const authdata = localStorage.getItem('sfAuthData');
//       if (!authdata) {
//         setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
//         setFetchingTemplates(false);
//         return;
//       }
      
//       const {accessToken, instanceUrl} = JSON.parse(authdata);

//       const res = await fetch('/api/email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           sfAuthData: {
//             instanceUrl: instanceUrl,
//             accessToken: accessToken
//           }
//         })
//       });
      
//       const data = await res.json();
//       console.log("API Response:", data);
      
//       if (res.ok && data.records) {
//         // Transform the Salesforce records to match our expected format
//         const formattedTemplates = data.records.map(record => ({
//           id: record.Id,
//           name: record.Name,
//           subject: record.Subject,
//           htmlContent: record.HtmlValue || record.Body || "",
//           createdDate: record.CreatedDate,
//           lastModifiedDate: record.LastModifiedDate
//         }));
        
//         setTemplates(formattedTemplates);
//       } else {
//         setMessage({ type: "error", text: data.error || "Failed to fetch templates." });
//       }
//       setFetchingTemplates(false);
      
//     } catch (error) {
//       console.error("Error fetching templates:", error);
//       setMessage({ 
//         type: "error", 
//         text: "Failed to fetch templates. Please try again."
//       });
//       setFetchingTemplates(false);
//     }
//   };

//   // Select a template to edit
//   const handleSelectTemplate = (templateId) => {
//     const template = templates.find(t => t.id === templateId);
//     if (template) {
//       setSelectedTemplate(template);
//       setName(template.name);
//       setSubject(template.subject);
//       setHtmlContent(template.htmlContent);
//       setActiveTab("edit");
//     }
//   };

//   // Reset form for creating a new template
//   const handleCreateNew = () => {
//     setSelectedTemplate(null);
//     setName("");
//     setSubject("");
//     setHtmlContent("");
//     setActiveTab("create");
//   };

//   // Submit form to create or update template
//   const handleSubmit = async (event) => {
//     if (event) event.preventDefault();
    
//     if (!name || !subject || !htmlContent) {
//       setMessage({ type: "error", text: "All fields are required." });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       const authdata = localStorage.getItem('sfAuthData');
//       if (!authdata) {
//         setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
//         setLoading(false);
//         return;
//       }
      
//       const {accessToken, instanceUrl} = JSON.parse(authdata);

//       const body = {
//         sfAuthData: {
//           instanceUrl: instanceUrl,
//           accessToken: accessToken
//         },
//         emailTemplateData: {
//           name,
//           subject,
//           htmlContent,
//           // If we're editing, include the template ID
//           ...(selectedTemplate && { id: selectedTemplate.id }),
//           // Specify the folder type as public
//           folder: "public"
//         }
//       };

//       // For creating new template
//       let endpoint = '/api/email';
//       let method = 'POST';
      
//       // For updating existing template
//       if (selectedTemplate) {
//         endpoint = `/api/email/${selectedTemplate.id}`;
//         method = 'PUT';
//       }

//       const res = await fetch(endpoint, {
//         method: method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Update the templates list with the new or updated template
//         if (selectedTemplate) {
//           setTemplates(templates.map(t => 
//             t.id === selectedTemplate.id 
//               ? { ...t, name, subject, htmlContent } 
//               : t
//           ));
//           setMessage({ type: "success", text: "Template updated successfully!" });
//         } else {
//           setTemplates([...templates, { id: data.emailTemplateId, name, subject, htmlContent }]);
//           setMessage({ type: "success", text: "New template created successfully!" });
//           // Reset form after creating
//           setName("");
//           setSubject("");
//           setHtmlContent("");
//         }
        
//         // Refresh templates to get the latest data
//         fetchTemplates();
//       } else {
//         setMessage({ type: "error", text: data.error || "Operation failed." });
//       }
//     } catch (error) {
//       console.error("Error submitting template:", error);
//       setMessage({ 
//         type: "error", 
//         text: "An error occurred while processing your request."
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete a template
//   const handleDeleteTemplate = async (templateId) => {
//     setLoading(true);
    
//     try {
//       const authdata = localStorage.getItem('sfAuthData');
//       if (!authdata) {
//         setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
//         setLoading(false);
//         return;
//       }
      
//       const {accessToken, instanceUrl} = JSON.parse(authdata);
      
//       const res = await fetch(`/api/email/${templateId}`, { 
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`
//         }
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setTemplates(templates.filter(t => t.id !== templateId));
        
//         // If we were editing this template, reset the form
//         if (selectedTemplate && selectedTemplate.id === templateId) {
//           setSelectedTemplate(null);
//           setName("");
//           setSubject("");
//           setHtmlContent("");
//           setActiveTab("existing");
//         }
        
//         setMessage({ type: "success", text: "Template deleted successfully!" });
//       } else {
//         setMessage({ type: "error", text: data.error || "Failed to delete template." });
//       }
//     } catch (error) {
//       console.error("Error deleting template:", error);
//       setMessage({ type: "error", text: "Failed to delete template." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Preview the template HTML
//   const previewTemplate = () => {
//     const newWindow = window.open();
//     newWindow.document.write(htmlContent);
//     newWindow.document.close();
//   };

//   // Template form component for both create and edit
//   const TemplateForm = ({ formType }) => {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>{formType === "edit" ? "Edit Template" : "Create New Template"}</CardTitle>
//           <CardDescription>
//             {formType === "edit" 
//               ? "Make changes to your template" 
//               : "Fill in the details to create a new email template"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <label htmlFor="name" className="text-sm font-medium">Template Name</label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter template name"
//               required
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label htmlFor="subject" className="text-sm font-medium">Subject Line</label>
//             <Input
//               id="subject"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               placeholder="Enter email subject"
//               required
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label htmlFor="content" className="text-sm font-medium">HTML Content</label>
//             <Textarea
//               id="content"
//               value={htmlContent}
//               onChange={(e) => setHtmlContent(e.target.value)}
//               placeholder="Enter HTML content for your email template"
//               className="min-h-[250px] font-mono"
//               required
//             />
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-col sm:flex-row gap-4">
//           <Button 
//             type="button" 
//             variant="outline" 
//             onClick={previewTemplate}
//             className="w-full sm:w-auto"
//             disabled={!htmlContent}
//           >
//             Preview Template
//           </Button>
//           <Button 
//             type="button" 
//             className="w-full sm:w-auto"
//             disabled={loading || !name || !subject || !htmlContent}
//             onClick={handleSubmit}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 {formType === "edit" ? "Updating..." : "Creating..."}
//               </>
//             ) : (
//               <>
//                 <Save className="mr-2 h-4 w-4" />
//                 {formType === "edit" ? "Update Template" : "Create Template"}
//               </>
//             )}
//           </Button>
//         </CardFooter>
//       </Card>
//     );
//   };

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Email Template Manager</h1>
      
//       {message.text && (
//         <Alert className={`mb-6 ${message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}>
//           <AlertCircle className="h-4 w-4 mr-2" />
//           <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
//           <AlertDescription>{message.text}</AlertDescription>
//         </Alert>
//       )}
      
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="grid grid-cols-3 mb-6">
//           <TabsTrigger value="existing">Existing Templates</TabsTrigger>
//           <TabsTrigger value="edit" disabled={!selectedTemplate}>Edit Template</TabsTrigger>
//           <TabsTrigger value="create">Create New</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="existing">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex justify-between items-center">
//                 <span>Available Templates</span>
//                 <Button variant="outline" onClick={fetchTemplates} disabled={fetchingTemplates}>
//                   {fetchingTemplates ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Refresh"}
//                 </Button>
//               </CardTitle>
//               <CardDescription>
//                 Select a template to edit or create a new one
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {fetchingTemplates ? (
//                 <div className="flex justify-center items-center h-40">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 </div>
//               ) : templates.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <p>No templates found</p>
//                   <Button 
//                     onClick={handleCreateNew} 
//                     className="mt-4"
//                     variant="outline"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Your First Template
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="grid gap-4">
//                   {templates.map((template) => (
//                     <div key={template.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
//                       <div className="flex-1">
//                         <h3 className="font-medium">{template.name}</h3>
//                         <p className="text-sm text-gray-500">{template.subject}</p>
//                         <p className="text-xs text-gray-400">Last modified: {new Date(template.lastModifiedDate).toLocaleString()}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button 
//                           variant="outline" 
//                           size="sm" 
//                           onClick={() => handleSelectTemplate(template.id)}
//                         >
//                           <Edit className="h-4 w-4 mr-2" />
//                           Edit
//                         </Button>
//                         <Button 
//                           variant="destructive" 
//                           size="sm" 
//                           onClick={() => handleDeleteTemplate(template.id)}
//                           disabled={loading}
//                         >
//                           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//             <CardFooter>
//               <Button onClick={handleCreateNew} className="w-full">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create New Template
//               </Button>
//             </CardFooter>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="edit">
//           <TemplateForm formType="edit" />
//         </TabsContent>
        
//         <TabsContent value="create">
//           <TemplateForm formType="create" />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default EmailTemplateManager;


"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Check, Plus, Edit, Trash2, Save, AlertCircle, Loader2, CodeSquare } from "lucide-react";


const EmailTemplateManager = () => {
  // States for template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("existing");
  
  // States for form values
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  
  // States for UI feedback
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  // Track which template is being deleted
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch all templates from Salesforce
  const fetchTemplates = async () => {
    setFetchingTemplates(true);
    setMessage({ type: "", text: "" });

    try {
      const authdata = localStorage.getItem('sfAuthData');
      if (!authdata) {
        setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
        setFetchingTemplates(false);
        return;
      }
      
      const {accessToken, instanceUrl} = JSON.parse(authdata);

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sfAuthData: {
            instanceUrl: instanceUrl,
            accessToken: accessToken
          }
        })
      });
      
      const data = await res.json();
      console.log("API Response:", data);
      
      if (res.ok && data.records) {
        // Transform the Salesforce records to match our expected format
        const formattedTemplates = data.records.map(record => ({
          id: record.Id,
          name: record.Name,
          subject: record.Subject,
          htmlContent: record.HtmlValue || record.Body || "",
          createdDate: record.CreatedDate,
          lastModifiedDate: record.LastModifiedDate
        }));
        
        setTemplates(formattedTemplates);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to fetch templates." });
      }
      setFetchingTemplates(false);
      
    } catch (error) {
      console.error("Error fetching templates:", error);
      setMessage({ 
        type: "error", 
        text: "Failed to fetch templates. Please try again."
      });
      setFetchingTemplates(false);
    }
  };

  // Select a template to edit
  const handleSelectTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setName(template.name);
      setSubject(template.subject);
      setHtmlContent(template.htmlContent);
      setActiveTab("edit");
    }
  };

  // Reset form for creating a new template
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setName("");
    setSubject("");
    setHtmlContent("");
    setActiveTab("create");
  };

  // Submit form to create or update template
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    
    if (!name || !subject || !htmlContent) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const authdata = localStorage.getItem('sfAuthData');
      if (!authdata) {
        setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
        setLoading(false);
        return;
      }
      
      const {accessToken, instanceUrl} = JSON.parse(authdata);

      const body = {
        sfAuthData: {
          instanceUrl: instanceUrl,
          accessToken: accessToken
        },
        emailTemplateData: {
          name,
          subject,
          htmlContent,
          // If we're editing, include the template ID
          ...(selectedTemplate && { id: selectedTemplate.id }),
          // Specify the folder type as public
          folder: "unfiled$public"  // Using the standard Salesforce public folder
        }
      };

      // For creating new template
      let endpoint = '/api/email';
      let method = 'POST';
      
      // For updating existing template
      if (selectedTemplate) {
        endpoint = `/api/email/${selectedTemplate.id}`;
        method = 'PUT';
      }

      console.log(`Making ${method} request to ${endpoint}`);

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (data.success) {
        // Update the templates list with the new or updated template
        if (selectedTemplate) {
          setTemplates(templates.map(t => 
            t.id === selectedTemplate.id 
              ? { ...t, name, subject, htmlContent, lastModifiedDate: new Date().toISOString() } 
              : t
          ));
          setMessage({ type: "success", text: "Template updated successfully!" });
        } else {
          const newTemplate = { 
            id: data.emailTemplateId, 
            name, 
            subject, 
            htmlContent,
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString()
          };
          setTemplates([newTemplate, ...templates]);
          setMessage({ type: "success", text: "New template created successfully!" });
          // Reset form after creating
          setName("");
          setSubject("");
          setHtmlContent("");
          // Switch to existing tab to see the new template
          setActiveTab("existing");
        }
      } else {
        setMessage({ type: "error", text: data.error || "Operation failed." });
      }
    } catch (error) {
      console.error("Error submitting template:", error);
      setMessage({ 
        type: "error", 
        text: "An error occurred while processing your request."
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const handleDeleteTemplate = async (templateId) => {
    setDeletingTemplateId(templateId);
    
    try {
      const authdata = localStorage.getItem('sfAuthData');
      if (!authdata) {
        setMessage({ type: "error", text: "Authentication data not found. Please log in again." });
        setDeletingTemplateId(null);
        return;
      }
      
      const {accessToken, instanceUrl} = JSON.parse(authdata);
      
      console.log(`Deleting template with ID: ${templateId}`);
      
      const res = await fetch(`/api/email/${templateId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Salesforce-Instance': instanceUrl
        },
        body: JSON.stringify({
          sfAuthData: {
            instanceUrl: instanceUrl,
            accessToken: accessToken
          }
        })
      });
      
      const data = await res.json();
      console.log("Delete response:", data);
      
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        
        // If we were editing this template, reset the form
        if (selectedTemplate && selectedTemplate.id === templateId) {
          setSelectedTemplate(null);
          setName("");
          setSubject("");
          setHtmlContent("");
          setActiveTab("existing");
        }
        
        setMessage({ type: "success", text: "Template deleted successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete template." });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      setMessage({ type: "error", text: "Failed to delete template." });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  // Preview the template HTML
  const previewTemplate = () => {
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  // Template form component for both create and edit
  const TemplateForm = ({ formType }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{formType === "edit" ? "Edit Template" : "Create New Template"}</CardTitle>
          <CardDescription>
            {formType === "edit" 
              ? "Make changes to your template" 
              : "Fill in the details to create a new email template"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Template Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject Line</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">HTML Content</label>
            <Textarea
              id="content"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Enter HTML content for your email template"
              className="min-h-[250px] font-mono"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={previewTemplate}
            className="w-full sm:w-auto"
            disabled={!htmlContent}
          >
            Preview Template
          </Button>
          <Button 
            type="button" 
            className="w-full sm:w-auto"
            disabled={loading || !name || !subject || !htmlContent}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {formType === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {formType === "edit" ? "Update Template" : "Create Template"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Email Template Manager</h1>
      
      {message.text && (
        <Alert className={`mb-6 ${message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="existing">Existing Templates</TabsTrigger>
          <TabsTrigger value="edit" disabled={!selectedTemplate}>Edit Template</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Available Templates</span>
                <Button variant="outline" onClick={fetchTemplates} disabled={fetchingTemplates}>
                  {fetchingTemplates ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Refresh"}
                </Button>
              </CardTitle>
              <CardDescription>
                Select a template to edit or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fetchingTemplates ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates found</p>
                  <Button 
                    onClick={handleCreateNew} 
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                        <p className="text-xs text-gray-400">
                          Last modified: {new Date(template.lastModifiedDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectTemplate(template.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={deletingTemplateId === template.id}
                        >
                          {deletingTemplateId === template.id ? 
                            <Loader2 className="h-4 w-4 animate-spin" /> : 
                            <Trash2 className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateNew} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <TemplateForm formType="edit" />
        </TabsContent>
        
        <TabsContent value="create">
          <TemplateForm formType="create" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailTemplateManager;