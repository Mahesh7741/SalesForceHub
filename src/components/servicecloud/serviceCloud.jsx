"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import CaseManager from './CaseManager';
import AnalayzeServiceCloud from './AnalayzeServiceCloud';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UserRound, TrendingUp, Building, Users, Loader2 } from "lucide-react";

const ServiceCloud = () => {
  const [activeTab, setActiveTab] = useState("case");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleTabChange = (value) => {
    setLoading(true);

    setTimeout(() => {
      setActiveTab(value);
      setLoading(false);
    }, 300);
  };

  const handleLeadConversion = () => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab("case");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      <Card className="border dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-gray-800 dark:text-gray-200">
            Service Cloud Manager
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
          <TabsTrigger
            value="case"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            <UserRound className="h-4 w-4" />
            <span>Case</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:text-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            <TrendingUp className="h-4 w-4" />
            <span>analytics</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center p-16 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 mt-4 transition-colors duration-200">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent
              value="case"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-all duration-300 ease-in-out"
            >
              <CaseManager onLeadConversion={handleLeadConversion} />
            </TabsContent>

            <TabsContent
              value="analytics"
              className="mt-4 bg-white dark:bg-gray-900 border rounded-md dark:border-gray-700 transition-all duration-300 ease-in-out"
            >
              <AnalayzeServiceCloud />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ServiceCloud;