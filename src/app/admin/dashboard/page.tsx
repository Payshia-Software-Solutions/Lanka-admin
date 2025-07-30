"use client";

import { MetricCard } from "@/components/admin/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Package, MessageSquare, DollarSign, Globe } from "lucide-react";
import dynamic from 'next/dynamic';

const sampleChartData = [
  { name: 'Jan', inquiries: 30, packagesSold: 20 },
  { name: 'Feb', inquiries: 45, packagesSold: 25 },
  { name: 'Mar', inquiries: 60, packagesSold: 40 },
  { name: 'Apr', inquiries: 50, packagesSold: 35 },
  { name: 'May', inquiries: 70, packagesSold: 50 },
  { name: 'Jun', inquiries: 85, packagesSold: 60 },
];

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = mod;
    
    // This component will be rendered on the client side
    const ClientBarChart = (props: any) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Bar dataKey="inquiries" fill="hsl(var(--primary))" name="Inquiries" radius={[4, 4, 0, 0]} />
          <Bar dataKey="packagesSold" fill="hsl(var(--accent))" name="Packages Sold" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
    ClientBarChart.displayName = 'ClientBarChart';
    return ClientBarChart;
  }),
  { ssr: false, loading: () => <p className="text-center text-muted-foreground">Loading chart...</p> }
);


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Websites" value="5" icon={Globe} description="Managed tourism sites" />
        <MetricCard title="Total Destinations" value="25" icon={MapPin} description="+2 this month" />
        <MetricCard title="Total Packages" value="80" icon={Package} description="Across all websites" />
        <MetricCard title="New Inquiries" value="12" icon={MessageSquare} description="Requires attention" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Monthly Activity</CardTitle>
            <CardDescription>Overview of inquiries and packages sold.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <DynamicBarChart data={sampleChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent AI Price Suggestions</CardTitle>
            <CardDescription>Summary of recently generated package prices.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for AI price suggestions summary */}
            <div className="space-y-4">
              {[
                {title: "Kandy Cultural Tour", price: 150, date: "2 days ago"},
                {title: "Ella Adventure Package", price: 220, date: "Yesterday"},
                {title: "Colombo City Explorer", price: 90, date: "Today"},
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-lg font-semibold">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full">View All Suggestions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
