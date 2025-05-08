"use client";
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "../components/ui/card";
import { 
  CircleIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  CloudIcon,
  UsersIcon,
  DollarSignIcon,
  PhoneCallIcon,
  MailIcon,
  CalendarIcon,
  TrendingUpIcon,
  TargetIcon,
  BarChart3Icon,
  LineChartIcon,
  PieChartIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

const SalesforceDashboard = () => {
  const [timeframe, setTimeframe] = useState("weekly");

  // Sample CRM data
  const salesStats = [
    {
      title: "Total Deals",
      value: "$1.72M",
      description: "Pipeline value",
      change: "+18%",
      increasing: true,
      icon: <DollarSignIcon className="h-5 w-5 text-green-600" />
    },
    {
      title: "Qualified Leads",
      value: "283",
      description: "Last 30 days",
      change: "+24%",
      increasing: true,
      icon: <UsersIcon className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Conversion Rate",
      value: "32%",
      description: "From lead to opportunity",
      change: "-3%",
      increasing: false,
      icon: <TrendingUpIcon className="h-5 w-5 text-indigo-600" />
    },
    {
      title: "Customer Meetings",
      value: "147",
      description: "Scheduled this month",
      change: "+8%",
      increasing: true,
      icon: <CalendarIcon className="h-5 w-5 text-purple-600" />
    }
  ];

  const salesPerformance = [
    { name: "Enterprise Solutions", target: 85, achieved: 72, color: "bg-blue-600" },
    { name: "Small Business", target: 65, achieved: 78, color: "bg-green-600" },
    { name: "Professional Services", target: 50, achieved: 62, color: "bg-purple-600" },
    { name: "Product Licenses", target: 70, achieved: 51, color: "bg-amber-600" }
  ];

  const topOpportunities = [
    { 
      company: "Acme Corporation", 
      value: "$425,000", 
      stage: "Negotiation", 
      probability: 75,
      owner: "Jessica Smith",
      lastContact: "2 days ago",
      logo: "A"
    },
    { 
      company: "TechSolutions Inc.", 
      value: "$310,000", 
      stage: "Proposal", 
      probability: 60,
      owner: "Michael Johnson",
      lastContact: "Today",
      logo: "T"
    },
    { 
      company: "Global Enterprises", 
      value: "$285,000", 
      stage: "Discovery", 
      probability: 45,
      owner: "Sarah Williams",
      lastContact: "Yesterday",
      logo: "G"
    },
    { 
      company: "Innovate Partners", 
      value: "$175,000", 
      stage: "Closed Won", 
      probability: 100,
      owner: "David Miller",
      lastContact: "1 week ago",
      logo: "I"
    }
  ];

  const recentActivities = [
    { 
      type: "call", 
      title: "Sales call with Acme Corp.", 
      time: "10:32 AM", 
      user: "Jessica Smith",
      details: "Discussed enterprise package pricing",
      icon: <PhoneCallIcon className="h-4 w-4 text-blue-500" />
    },
    { 
      type: "email", 
      title: "Proposal sent to TechSolutions", 
      time: "09:14 AM", 
      user: "Michael Johnson",
      details: "Final pricing sheet for Q3 contract",
      icon: <MailIcon className="h-4 w-4 text-indigo-500" />
    },
    { 
      type: "meeting", 
      title: "Discovery call - Global Enterprises", 
      time: "Yesterday", 
      user: "Sarah Williams",
      details: "Initial needs assessment and demo",
      icon: <CalendarIcon className="h-4 w-4 text-purple-500" />
    },
    { 
      type: "deal", 
      title: "Deal closed with Innovate Partners", 
      time: "Yesterday", 
      user: "David Miller",
      details: "$175,000 annual contract signed",
      icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />
    }
  ];

  const salesTeamPerformance = [
    { name: "Jessica Smith", deals: 24, value: "$680K", conversion: "38%", avatar: "JS" },
    { name: "Michael Johnson", deals: 18, value: "$510K", conversion: "29%", avatar: "MJ" },
    { name: "Sarah Williams", deals: 15, value: "$320K", conversion: "32%", avatar: "SW" },
    { name: "David Miller", deals: 21, value: "$590K", conversion: "35%", avatar: "DM" },
  ];

  const segmentPerformance = {
    labels: ["Enterprise", "SMB", "Mid-Market", "Government", "Education"],
    values: [35, 25, 20, 10, 10]
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Monitor your sales pipeline and team performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full text-sm text-blue-700 dark:text-blue-300">
            <CloudIcon className="h-4 w-4 mr-1" />
            Salesforce: Connected
          </div>
          <Tabs defaultValue="weekly" className="w-[250px]" onValueChange={setTimeframe}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <CardDescription className="flex items-center">
                {stat.description}
                <div className={`ml-auto flex items-center ${stat.increasing ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.increasing ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                  {stat.change}
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Target achievement by product line</CardDescription>
            </div>
            <TargetIcon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {salesPerformance.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm">
                      <span className="font-medium">{service.achieved}%</span>
                      <span className="text-gray-500 ml-1">of {service.target}% target</span>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={`flex flex-col justify-center rounded-full ${service.color}`}
                        style={{ width: `${service.achieved}%` }}
                      ></div>
                    </div>
                    {service.achieved > service.target ? (
                      <div 
                        className="absolute top-1 h-2 border-r-2 border-gray-800 dark:border-white"
                        style={{ left: `${service.target}%` }}
                      ></div>
                    ) : (
                      <div 
                        className="absolute top-1 h-2 border-r-2 border-gray-800 dark:border-white" 
                        style={{ left: `${service.target}%` }}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Sales Reps</CardTitle>
            <CardDescription>Performance this {timeframe}</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-4">
              {salesTeamPerformance.map((rep, index) => (
                <div key={index} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={`/api/placeholder/32/32`} alt={rep.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{rep.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{rep.name}</p>
                    <p className="text-xs text-gray-500 truncate">{rep.deals} deals · {rep.conversion} conv.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rep.value}</p>
                    <div className="flex items-center justify-end text-xs text-green-600">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      <span>8%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <a className="text-sm text-blue-600 hover:underline" href="#">View all team members</a>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Opportunities</CardTitle>
            <CardDescription>Your highest potential deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOpportunities.map((opp, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={`/api/placeholder/32/32`} alt={opp.company} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{opp.logo}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{opp.company}</h4>
                      <div className="font-bold text-green-600">{opp.value}</div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Badge variant={opp.stage === "Closed Won" ? "success" : "outline"} className={opp.stage === "Closed Won" ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""}>
                        {opp.stage}
                      </Badge>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-600 dark:text-gray-400">{opp.probability}% probability</span>
                      <div className="ml-auto flex items-center text-gray-500">
                        <span>{opp.owner}</span>
                        <span className="mx-1">•</span>
                        <span>{opp.lastContact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <span className="text-sm text-gray-500">Showing 4 of 24 opportunities</span>
            <a className="text-sm text-blue-600 hover:underline" href="#">View all opportunities</a>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest sales actions</CardDescription>
            </div>
            <BriefcaseIcon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="mr-3">
                    <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {activity.icon}
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{activity.time}</span>
                      <span className="mx-1">•</span>
                      <span>{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <a className="text-sm text-blue-600 hover:underline w-full text-center" href="#">View activity log</a>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>Value by sales stage</CardDescription>
            </div>
            <BarChart3Icon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="text-sm">Discovery: $845K</div>
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <div className="text-sm">Proposal: $1.2M</div>
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div className="text-sm">Negotiation: $680K</div>
              </div>
              <p className="text-gray-500">Detailed pipeline chart would render here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Revenue distribution</CardDescription>
            </div>
            <PieChartIcon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {segmentPerformance.labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'indigo', 'purple', 'amber'][index]}-500`}></div>
                    <div className="text-sm">{label}: {segmentPerformance.values[index]}%</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500">Segment distribution chart would render here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesforceDashboard;