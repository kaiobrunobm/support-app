import React from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { IconProps } from '@phosphor-icons/react';

interface StatCardProps {
  title: string;
  value: number | string;
  IconComponent: React.ComponentType<IconProps>;
  isLoading: boolean;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, IconComponent, isLoading, colorClass }) => {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondaryText">{title}</h3>
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

