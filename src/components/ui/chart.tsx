import React, { ReactNode } from 'react';

interface ChartContainerProps {
  config: Record<string, { label: string; color: string }>;
  children: ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ config, children, className }) => {
  return (
    <div className={`chart-container ${className || ''}`} style={{ '--chart-1': config[Object.keys(config)[0]].color, '--chart-2': config[Object.keys(config)[1]].color } as React.CSSProperties}>
      {children}
    </div>
  );
};

interface ChartTooltipProps {
  content: (props: any) => ReactNode;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ content }) => {
  return content;
};

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-2 border border-gray-200 rounded shadow">
      <p className="label">{`${label}`}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {`${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};

