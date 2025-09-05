'use client';

import { useState } from 'react';

type Tab = {
  id: string;
  label: string;
  icon: JSX.Element;
};

type AdminTabsProps = {
  children: React.ReactNode[];
  tabs: Tab[];
  defaultTab?: string;
};

export default function AdminTabs({ children, tabs, defaultTab }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl">
        {children[activeIndex] || children[0]}
      </div>
    </div>
  );
}
