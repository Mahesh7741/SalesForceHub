"use client";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import ThemeToggle from "../components/ThemeToggle";
import LoginHistory from "../components/loginHistory/LoginHistory.jsx";
import SalesforceChatterPage from "../components/salesforceChatter/SalesforceChatterPage";
// import Sales from "../components/salescloud/Sales";
import SalesCloudManager from "../components/salescloud/salesManager";
import Fileuploader from "../components/fileuploader/Fileuploader";
import Health from "../components/health/Health";
import ServiceCloud from "../components/servicecloud/serviceCloud.jsx";
import MarketingCloud from "../components/marketingCloud";
import Dashboard from "../components/default";
import AIQueryAssistant from '../components/aiassistanquery/AIQueryAssistant .jsx'
import GeminiChatAssistant from "../components/aiassistanquery/GeminiChatAssistant.jsx";
import ApexClassViewer from "../components/apexClass/ApexClass.jsx";
import CreateEmailTemplate from "../components/email/CreateEmailTemplate";
import UsersTable from "../components/users/UsersTable.jsx";
import SchemaBuilder from '../components/schemabuilder/SchemaBuilder'
import ReportsBuild from '../components/reports/ReportsBuild.jsx'
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  HeartPulse, 
  Upload, 
  MessageSquare, 
  Clock, 
  HelpCircle, 
  Mail, 
  LogOut,
  ChevronRight,
  UserCircle,
  Proportions
} from "lucide-react";

const Page = () => {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeCloud, setActiveCloud] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleGoogleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCloudContent = () => {
    switch (activeCloud) {
      case "salescloud":
        return <SalesCloudManager />;
      case "servicecloud":
        return <ServiceCloud />;
      case "marketingcloud":
        return <MarketingCloud />;
      case "health":
        return <Health />;
      case "fileuploader":
        return <Fileuploader />;  
      case "salesforceChatter":
        return <SalesforceChatterPage />;  
      case "loginHistory":
        return <LoginHistory />;  
      case "aiquery":
        return <AIQueryAssistant />;  
      case "chat assistant":
        return <GeminiChatAssistant />;
      case "createEmailTemplate":
        return <CreateEmailTemplate />;
      case "apexclass":
        return <ApexClassViewer />;
      case "users":
        return <UsersTable />;
      case 'schema':
        return <SchemaBuilder/>  
      case 'reports':
        return <ReportsBuild/> 
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "salescloud", label: "Sales Cloud", icon: <UserCircle size={20} /> },
    { id: "health", label: "Health", icon: <HeartPulse size={20} /> },
    { id: "fileuploader", label: "File Uploader", icon: <Upload size={20} /> },
    { id: "salesforceChatter", label: "Salesforce Chatter", icon: <MessageSquare size={20} /> },
    { id: "loginHistory", label: "Login History", icon: <Clock size={20} /> },
    { id: "servicecloud", label: "Service Cloud", icon: <HelpCircle size={20} /> },
    { id: "marketingcloud", label: "Marketing Cloud", icon: <Mail size={20} /> },
    { id: "aiquery", label: "AI Query Assistant", icon: <LayoutDashboard size={20} /> },
    { id: "chat assistant", label: "Chat Assistant", icon: <Users size={20} /> },
    { id: "apexclass", label: "Apex Class Viewer", icon: <ChevronRight size={20} /> },
    { id: "createEmailTemplate", label: "Create Email Template", icon: <Mail size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "schema", label: "Schema Builder", icon: <Users size={20} /> },
    { id: "reports", label: "Reports", icon: <Proportions size={20} /> }, 
  ];

  // Salesforce Account button (external link)
  const handleSalesforceAccountClick = () => {
    window.location.href = "/dashboard"; // Replace with actual Salesforce account URL
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg p-2 flex items-center justify-center">
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="text-white"
              >
                {/* Salesforce-inspired cloud logo */}
                <path 
                  d="M16.5 17.25c1.242 0 2.25-1.008 2.25-2.25 0-1.242-1.008-2.25-2.25-2.25-.27 0-.525.045-.75.135v-.135c0-1.657-1.343-3-3-3-.39 0-.75.09-1.095.24C11.295 8.693 10.05 7.75 8.625 7.75c-2.07 0-3.75 1.68-3.75 3.75 0 .09 0 .18.015.27C3.675 12.14 2.75 13.25 2.75 14.625c0 1.657 1.343 3 3 3h10.75z" 
                  fill="currentColor" 
                  stroke="currentColor" 
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            {!collapsed && <h1 className="text-lg font-bold">Salesforce Hub</h1>}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 rounded-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight size={18} className={`transform transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className={`space-y-1 px-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full flex items-center justify-${collapsed ? 'center' : 'start'} py-3 px-3 rounded-lg transition-colors ${
                  activeCloud === item.id
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveCloud(item.id)}
              >
                <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</div>
                {!collapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className={`p-4 border-t border-gray-100 dark:border-gray-700 ${collapsed ? 'flex flex-col items-center gap-4' : 'space-y-3'}`}>
          {/* Salesforce Account button */}
          <Button
            variant="default"
            onClick={handleSalesforceAccountClick}
            className={`${collapsed ? 'w-10 h-10 p-0 rounded-lg' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            {collapsed ? <UserCircle size={18} /> : (
              <div className="flex items-center justify-center w-full gap-2">
                <UserCircle size={16} />
                <span>Salesforce Account</span>
              </div>
            )}
          </Button>

          <ThemeToggle />
          <Button
            variant="outline"
            onClick={handleGoogleSignOut}
            disabled={loading}
            className={`${collapsed ? 'w-10 h-10 p-0 rounded-lg' : 'w-full'} border-gray-200 dark:border-gray-700`}
          >
            {collapsed ? <LogOut size={18} /> : (
              <div className="flex items-center justify-center w-full gap-2">
                <LogOut size={16} />
                <span>Sign out</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold">
            {menuItems.find(item => item.id === activeCloud)?.label || "Dashboard"}
          </h1>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderCloudContent()}
          </div>
        </main>
      </div>  
    </div>
  );
};

export default Page;