
"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "@/components/admin/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Package, MessageSquare, DollarSign, Globe, Loader2, Plane } from "lucide-react";
import dynamic from 'next/dynamic';
import type { ApiDestination, TripPlan } from "@/lib/types";
import { format, parseISO } from 'date-fns';
import Link from "next/link";

const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = mod;
    
    const ClientBarChart = (props: any) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--foreground))" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Bar dataKey="tripPlans" fill="hsl(var(--primary))" name="Trip Plans" radius={[4, 4, 0, 0]} />
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
  const [isLoading, setIsLoading] = useState(true);
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const companyId = JSON.parse(localStorage.getItem('loggedInUser') || '{}').company_id;
        if (!companyId) {
            setIsLoading(false);
            return;
        }

        const [destinationsRes, tripPlansRes] = await Promise.all([
            fetch('http://localhost/travel_web_server/destinations'),
            fetch('http://localhost/travel_web_server/trip_plans')
        ]);

        const allDestinations = await destinationsRes.json();
        if (Array.isArray(allDestinations)) {
            const filtered = allDestinations.filter(d => d.company_id?.toString() === companyId.toString());
            setDestinations(filtered);
        }
        
        const allTripPlans = await tripPlansRes.json();
        if (Array.isArray(allTripPlans)) {
            const companyPlans = allTripPlans.filter(p => {
                // This is a bit of a hack since trip_plans doesn't have a company_id
                // We'll assume for now that an admin sees all plans.
                // In a real app, this should be filtered by company on the backend.
                return true; 
            });
            setTripPlans(companyPlans);
            
            // Process data for chart
            const monthlyData: {[key: string]: { name: string; tripPlans: number, packagesSold: number }} = {};
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            monthNames.forEach(name => {
                monthlyData[name] = { name, tripPlans: 0, packagesSold: 20 + Math.floor(Math.random() * 30) }; // Dummy packages sold
            });

            companyPlans.forEach(plan => {
                if (plan.created_at) {
                    const month = parseISO(plan.created_at).getMonth();
                    const monthName = monthNames[month];
                    if(monthlyData[monthName]) {
                        monthlyData[monthName].tripPlans += 1;
                    }
                }
            });
            setChartData(Object.values(monthlyData));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentTripPlans = tripPlans.slice(0, 3);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading dashboard...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Websites" value="1" icon={Globe} description="Backend not connected" />
        <MetricCard title="Total Destinations" value={destinations.length} icon={MapPin} description="Managed destinations" />
        <MetricCard title="Total Trip Plans" value={tripPlans.length} icon={Plane} description="Custom & Pre-plans" />
        <MetricCard title="New Inquiries" value="0" icon={MessageSquare} description="Backend not connected" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Monthly Activity</CardTitle>
            <CardDescription>Overview of newly created trip plans.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <DynamicBarChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Trip Plans</CardTitle>
            <CardDescription>Summary of recently created trip plans.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTripPlans.length > 0 ? (
                <div className="space-y-4">
                {recentTripPlans.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                    <div>
                        <p className="font-medium text-foreground">{item.full_name || `Plan #${item.id}`}</p>
                        <p className="text-xs text-muted-foreground">
                            {format(parseISO(item.created_at), 'PP')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-lg font-semibold">{parseFloat(item.estimated_cost).toFixed(0)}</span>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground py-10">No recent trip plans found.</p>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/admin/tripplans">
                    View All Trip Plans
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
