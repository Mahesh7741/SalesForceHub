"use client";
import React, { useState } from 'react';
import { useTheme } from "next-themes";
import LeadManager from './LeadManager';
import OpportunityManager from './Oppurtunity';
import AccountManager from './AccountManager';
import ContactManager from './ContactManager';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UserRound, TrendingUp, Building, Users, Loader2 } from "lucide-react";

const SalesCloudManager = () => {
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleLeadConversion = () => {
    setLoading(true);
    setActiveTab("opportunities");
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      <Card className="border dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-gray-800 dark:text-gray-200">
            Sales Cloud Manager
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
          <TabsTrigger
            value="leads"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-colors duration-200"
          >
            <UserRound className="h-4 w-4" />
            <span>Leads</span>
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-colors duration-200"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-colors duration-200"
          >
            <Building className="h-4 w-4" />
            <span>Accounts</span>
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-colors duration-200"
          >
            <Users className="h-4 w-4" />
            <span>Contacts</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center p-16 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 mt-4 transition-colors duration-200">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent
              value="leads"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-colors duration-200"
            >
              <LeadManager onLeadConversion={handleLeadConversion} />
            </TabsContent>

            <TabsContent
              value="opportunities"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-colors duration-200"
            >
              <OpportunityManager />
            </TabsContent>

            <TabsContent
              value="accounts"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-colors duration-200"
            >
              <AccountManager />
            </TabsContent>

            <TabsContent
              value="contacts"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-colors duration-200"
            >
              <ContactManager />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SalesCloudManager;
