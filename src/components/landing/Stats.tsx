'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const stats = [
  {
    title: "Transactions Processed",
    value: "$1 Billion+",
    description: "Total value processed",
    change: "+12.5%",
    changeType: "positive",
  },
  {
    title: "Global Merchants",
    value: "10,000+",
    description: "Businesses using PXV Pay",
    change: "+4",
    changeType: "positive",
  },
  {
    title: "Countries Supported",
    value: "150+",
    description: "Reaching customers worldwide",
    change: "+5",
    changeType: "positive",
  },
  {
    title: "Payment Methods",
    value: "300+",
    description: "Diverse local options",
    change: "+15",
    changeType: "positive",
  },
]

const operationalStats = [
  {
    title: "System Uptime",
    value: "99.99%",
    change: "Stable",
  },
  {
    title: "Avg. Response Time",
    value: "120ms",
    change: "Fast",
  },
  {
    title: "Fraud Prevention",
    value: "98.5%",
    change: "Industry Leading",
  },
]

const Stats = () => {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Unlocking Global Potential
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See how PXV Pay is driving growth and efficiency for businesses worldwide.
          </p>
          <Separator className="mt-8 max-w-md mx-auto bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Key Metrics */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((stat, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.title}</CardTitle>
                {/* Icon placeholder if needed */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
                <div className={`flex items-center pt-1 text-xs ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : stat.changeType === 'negative'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.changeType === 'positive' && <ArrowUpRight className="h-3 w-3 mr-1" />} 
                  {stat.changeType === 'negative' && <ArrowDownRight className="h-3 w-3 mr-1" />} 
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Operational Stats */}
        <div className="grid gap-8 md:grid-cols-3">
           {operationalStats.map((stat, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Stats 