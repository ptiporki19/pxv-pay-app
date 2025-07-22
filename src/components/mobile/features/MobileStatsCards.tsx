"use client";

import { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CubeIcon
} from "@heroicons/react/24/solid";
import {
  getTotalPaymentsCount
} from "@/lib/actions/dashboard-stats";
import {
  getCheckoutLinkAnalytics,
  getGeographicAnalytics,
  getTransactionStatusAnalytics
} from "@/lib/actions/analytics-data-simple";

interface MobileStatsCardsProps {
  data?: {
    totalRevenue: number;
    totalPayments: number;
    successRate: number;
    activeCountries: number;
  };
}

export function MobileStatsCards({ data }: MobileStatsCardsProps = {}) {
  const [totalPayments, setTotalPayments] = useState(0);
  const [bestProduct, setBestProduct] = useState("N/A");
  const [bestCountry, setBestCountry] = useState("N/A");
  const [successRate, setSuccessRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all stats to match desktop exactly
        const [
          totalPaymentsResult,
          checkoutLinkResult,
          geographicResult,
          transactionStatusResult
        ] = await Promise.all([
          getTotalPaymentsCount(),
          getCheckoutLinkAnalytics(),
          getGeographicAnalytics(),
          getTransactionStatusAnalytics()
        ]);

        // Total Payments
        setTotalPayments(totalPaymentsResult.count || 0);

        // Best Performing Product
        if (checkoutLinkResult.success && checkoutLinkResult.data && checkoutLinkResult.data.length > 0) {
          setBestProduct(checkoutLinkResult.data[0].title || "N/A");
        } else {
          setBestProduct("N/A");
        }

        // Best Country
        if (geographicResult.success && geographicResult.data && geographicResult.data.length > 0) {
          setBestCountry(geographicResult.data[0]?.country_name || "N/A");
        } else {
          setBestCountry("N/A");
        }

        // Success Rate
        if (transactionStatusResult.success && transactionStatusResult.data && transactionStatusResult.data.length > 0) {
          const total = transactionStatusResult.data.reduce((sum, item) => sum + item.count, 0);
          const successful = transactionStatusResult.data.find(item => item.status === 'completed')?.count || 0;
          setSuccessRate(total > 0 ? (successful / total * 100) : 0);
        } else {
          setSuccessRate(0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Payments",
      value: loading ? "..." : totalPayments.toLocaleString(),
      icon: CurrencyDollarIcon
    },
    {
      title: "Best Performing Product",
      value: loading ? "..." : bestProduct,
      icon: CubeIcon
    },
    {
      title: "Country Performance",
      value: loading ? "..." : bestCountry,
      icon: GlobeAltIcon
    },
    {
      title: "Success Rate",
      value: loading ? "..." : `${successRate.toFixed(1)}%`,
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-normal text-card-foreground mb-1 font-roboto">{stat.title}</h3>
            <p className="text-xl font-normal text-card-foreground truncate font-roboto">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}