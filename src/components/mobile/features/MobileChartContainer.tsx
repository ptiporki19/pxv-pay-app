"use client";

interface MobileChartContainerProps {
  data: any;
  height?: number;
  title?: string;
}

export function MobileChartContainer({ data, height = 300, title }: MobileChartContainerProps) {
  // Simplified chart placeholder for mobile
  return (
    <div className="bg-gray-50 rounded-lg p-4" style={{ height: `${height}px` }}>
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">{title || "Chart Data"}</div>
          <div className="space-y-2">
            {data.labels.map((label: string, index: number) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{label}</span>
                <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(data.datasets[0].data[index] / Math.max(...data.datasets[0].data)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-normal">${data.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}