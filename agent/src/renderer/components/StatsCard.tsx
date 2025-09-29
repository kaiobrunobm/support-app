import React from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
// 1. Import the IconProps type from the icon library
import { IconProps } from '@phosphor-icons/react';

interface StatCardProps {
  title: string;
  value: number | string;
  // 2. Use a more specific type for the icon component itself
  IconComponent: React.ComponentType<IconProps>;
  isLoading: boolean;
  colorClass: string; // e.g., 'text-blue-500', 'text-green-500'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, IconComponent, isLoading, colorClass }) => {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondaryText">{title}</h3>
        {/* 3. Render the icon as a component, passing the props directly */}
        <IconComponent size={24} className={`text-secondaryText ${colorClass}`} />
      </div>
      <div className="mt-4">
        {isLoading ? (
          <CircleNotchIcon size={32} className="animate-spin text-text" />
        ) : (
          <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;

