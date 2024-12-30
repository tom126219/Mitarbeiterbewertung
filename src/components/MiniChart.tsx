'use client'

import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MiniChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  color?: string;
  type?: 'line' | 'bar';
  horizontal?: boolean;
  height?: number;
}

const MiniChart: React.FC<MiniChartProps> = ({ data, color = "var(--primary)", type = 'line', horizontal = false, height = 50 }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`h-[${height}px] w-full flex items-center justify-center`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`h-[${height}px] w-full bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500`}>
        Keine Daten verfügbar
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        borderColor: type === 'line' ? color : data.map(d => d.color || color),
        backgroundColor: type === 'bar' ? data.map(d => d.color || `${color}66`) : 'transparent',
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        },
        min: 0,
        max: type === 'bar' ? Math.max(...data.map(d => d.value)) * 1.1 : undefined,
      },
    },
    indexAxis: horizontal ? 'y' as const : 'x' as const,
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default MiniChart;

