import React from 'react';
import { motion } from 'framer-motion'; // 1. Import motion

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="flex w-full justify-center ">
      <nav 
        className="flex space-x-1 rounded-lg bg-muted p-1 bg-border/30"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            
            className="relative whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none"
            style={{
            
              WebkitTapHighlightColor: "transparent",
            }}
          >
   
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-pill" 
                className="absolute inset-0 bg-border shadow-sm"
                style={{ borderRadius: 6 }} 
                transition={{ type: "spring", stiffness: 350, damping: 30 }} 
              />
            )}

           
            <span className={`relative z-10 ${activeTab === tab.id ? 'text-primary-foreground' : 'text-secondary-foreground hover:text-text'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;

