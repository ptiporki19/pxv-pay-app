"use client";

interface CountryData {
  country: string;
  revenue: number;
  transactions: number;
}

interface MobileCountryGridProps {
  data: CountryData[];
}

export function MobileCountryGrid({ data }: MobileCountryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((item) => (
        <div key={item.country} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-normal text-gray-900">{item.country}</h4>
              <p className="text-sm text-gray-600">Revenue: ${item.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Transactions: {item.transactions}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}