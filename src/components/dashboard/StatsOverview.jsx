
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview({ stats, isLoading }) {
  const statCards = [
    {
      title: "Total Equipment",
      value: stats.totalEquipment,
      icon: Package,
      color: "bg-blue-500",
      trend: null
    },
    {
      title: "Currently Issued",
      value: stats.issuedEquipment,
      icon: CheckCircle,
      color: "bg-green-500",
      trend: `${stats.issuanceRate}% issuance rate`
    },
    {
      title: "In Storage",
      value: stats.inStorage,
      icon: Clock,
      color: "bg-amber-500",
      trend: null
    },
    {
      title: "Under Repair",
      value: stats.inRepair,
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: null
    },
    {
      title: "Active Soldiers",
      value: stats.activeSoldiers,
      icon: Users,
      color: "bg-purple-500",
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 transform translate-x-4 md:translate-x-6 -translate-y-4 md:-translate-y-6 ${stat.color} rounded-full opacity-10`} />
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-slate-500 truncate">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-6 md:h-8 w-8 md:w-12 mt-2" />
                ) : (
                  <CardTitle className="text-lg md:text-2xl font-bold mt-2">
                    {stat.value}
                  </CardTitle>
                )}
              </div>
              <div className={`p-1.5 md:p-2 rounded-lg ${stat.color} bg-opacity-20 flex-shrink-0`}>
                <stat.icon className={`w-3 h-3 md:w-5 md:h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardHeader>
          {stat.trend && (
            <CardContent className="pt-0 p-3 md:p-4">
              <div className="flex items-center text-xs md:text-sm">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-500" />
                <span className="text-green-500 font-medium truncate">{stat.trend}</span>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
