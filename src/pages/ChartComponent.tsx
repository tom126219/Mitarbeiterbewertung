'use client'

import React, { useEffect, useState, useRef } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Loader2 } from 'lucide-react';

interface ChartComponentProps {
  changes: Array<{
    name: string;
    changes: Array<{ date: string; score: number }>;
    isTopPerformer: boolean;
  }>;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ changes }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setIsMounted(true);
      
      const updateDimensions = () => {
        if (containerRef.current) {
          setChartWidth(containerRef.current.clientWidth);
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      return () => window.removeEventListener('resize', updateDimensions);
    } catch (err) {
      console.error('Error in ChartComponent:', err);
      setError('Fehler beim Laden der Grafik');
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  const chartData = changes.flatMap(performer => 
    performer.changes.map(d => ({
      name: performer.name,
      date: new Date(d.date).toLocaleDateString('de-DE'),
      score: d.score,
      isTop: performer.isTopPerformer
    }))
  );

  if (chartWidth === 0) {
    return (
      <div ref={containerRef} className="h-[400px] w-full">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        topPerformers: {
          label: "Top Performer",
          color: "hsl(var(--chart-1))",
        },
        bottomPerformers: {
          label: "Andere Performer",
          color: "hsl(var(--chart-2))",
        },
      }}
    >
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '400px' }}
      >
        <LineChart
          width={chartWidth}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => value}
          />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value} Punkte`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Mitarbeiter
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Punktzahl
                      </span>
                      <span className="font-bold">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Legend />
          {changes.map((performer) => (
            <Line
              key={performer.name}
              type="monotone"
              dataKey="score"
              data={performer.changes}
              name={performer.name}
              stroke={performer.isTopPerformer ? "var(--color-topPerformers)" : "var(--color-bottomPerformers)"}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </div>
    </ChartContainer>
  );
};

export default ChartComponent;

