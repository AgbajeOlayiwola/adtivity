'use client';
import KpiCard from '@/components/dashboard/kpi-card';
import { Users, DollarSign, Activity, Target, TrendingUp, Eye, Lock, Wallet, Repeat, FilePlus2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip as RechartsTooltip } from 'recharts';
import { useEffect, useState } from 'react';

const kpiData = [
  { title: 'Total Users', value: '10,234', trend: 'up', trendValue: '+12.5%', icon: Users, iconColorClass: 'text-accent' },
  { title: 'Revenue', value: '$125,670', trend: 'up', trendValue: '+8.2%', icon: DollarSign, iconColorClass: 'text-green-500' },
  { title: 'Active Sessions', value: '1,589', trend: 'down', trendValue: '-2.1%', icon: Activity, iconColorClass: 'text-yellow-500' },
  { title: 'Conversion Rate', value: '4.75%', trend: 'up', trendValue: '+0.5%', icon: Target, iconColorClass: 'text-purple-500' },
];

const web3KpiData = [
  { title: 'Total Value Locked (TVL)', value: '$2.5M', trend: 'up', trendValue: '+5.8%', icon: Lock, iconColorClass: 'text-primary', description: 'Total value of assets locked in your protocol.' },
  { title: 'Active Wallets (Daily)', value: '1,200', trend: 'up', trendValue: '+3.2%', icon: Wallet, iconColorClass: 'text-accent', description: 'Unique wallets interacting with your dApp daily.' },
  { title: 'Transaction Volume (24h)', value: '3,450 ETH', trend: 'down', trendValue: '-1.5%', icon: Repeat, iconColorClass: 'text-primary', description: 'Total volume of transactions in the last 24 hours.' },
  { title: 'New Contracts Deployed', value: '25', trend: 'up', trendValue: '+10', icon: FilePlus2, iconColorClass: 'text-accent', description: 'Smart contracts deployed to your platform this week.' },
];

const salesDataDefault = [
  { month: 'Jan', sales: 0, revenue: 0 },
  { month: 'Feb', sales: 0, revenue: 0 },
  { month: 'Mar', sales: 0, revenue: 0 },
  { month: 'Apr', sales: 0, revenue: 0 },
  { month: 'May', sales: 0, revenue: 0 },
  { month: 'Jun', sales: 0, revenue: 0 },
];

const pageViewsDataDefault = [
  { date: '01', views: 0 }, { date: '02', views: 0 }, { date: '03', views: 0 },
  { date: '04', views: 0 }, { date: '05', views: 0 }, { date: '06', views: 0 },
  { date: '07', views: 0 },
];

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
  views: { label: 'Page Views', color: 'hsl(var(--accent))' },
};

export default function KpiDashboardPage() {
  const [salesData, setSalesData] = useState(salesDataDefault);
  const [pageViewsData, setPageViewsData] = useState(pageViewsDataDefault);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate random data only on client-side after mount to avoid hydration mismatch
    setSalesData([
      { month: 'Jan', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { month: 'Feb', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { month: 'Mar', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { month: 'Apr', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { month: 'May', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { month: 'Jun', sales: Math.floor(Math.random() * 2000) + 1000, revenue: Math.floor(Math.random() * 50000) + 20000 },
    ]);
    setPageViewsData([
      { date: '01', views: Math.floor(Math.random() * 500) + 100 }, { date: '02', views: Math.floor(Math.random() * 500) + 100 },
      { date: '03', views: Math.floor(Math.random() * 500) + 100 }, { date: '04', views: Math.floor(Math.random() * 500) + 100 },
      { date: '05', views: Math.floor(Math.random() * 500) + 100 }, { date: '06', views: Math.floor(Math.random() * 500) + 100 },
      { date: '07', views: Math.floor(Math.random() * 500) + 100 },
    ]);
  }, []);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Business Overview</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {kpiData.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight">Key Web3 Metrics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {web3KpiData.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Sales & Revenue Overview
            </CardTitle>
            <CardDescription>Monthly sales and revenue for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {isClient ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <RechartsBarChart data={salesData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="sales" fill="var(--color-sales)" radius={4} />
                  <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </RechartsBarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
               <Eye className="mr-2 h-5 w-5 text-accent" /> Daily Page Views
            </CardTitle>
            <CardDescription>Page views over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
             {isClient ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={pageViewsData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}} 
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={3} dot={{ r: 5, fill: 'var(--color-views)', strokeWidth: 2, stroke: 'hsl(var(--background))' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ChartContainer>
             ) : (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
