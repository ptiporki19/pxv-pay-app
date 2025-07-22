"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Eye, Clock, CreditCard, User } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: string;
  country: string;
  date: string;
  status: "completed" | "pending" | "failed" | "refunded";
}

interface MobileTransactionListProps {
  transactions: Transaction[];
}

export function MobileTransactionList({ transactions }: MobileTransactionListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "refunded":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white truncate">{transaction.customerName}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="truncate">{transaction.method}</span>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-lg text-gray-900 dark:text-white">
                {formatCurrency(transaction.amount)}
              </p>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{formatTime(transaction.date)}</span>
              <span className="text-gray-400">•</span>
              <span>{transaction.country}</span>
            </div>
            <Link href={`/transactions/${transaction.id}`}>
              <Eye className="h-5 w-5 text-violet-600 hover:text-violet-700 cursor-pointer" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}