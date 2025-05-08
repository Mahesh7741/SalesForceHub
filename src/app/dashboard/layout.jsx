"use client";

import { SalesforceProvider } from "../../context/salesforcecontet";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <SalesforceProvider>
        {children}
      </SalesforceProvider>
    </SessionProvider>
  );
}
