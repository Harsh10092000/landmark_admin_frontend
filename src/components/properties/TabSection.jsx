import React, { useState } from 'react';

const TabSection = ({ allPropertiesLength, listedCount, delistedCount, soldCount, onTabChange }) => {
  const [activeTab, setActiveTab] = useState('All Properties');

  const tabs = [
    {
      label: 'All Properties',
      isSelected: activeTab === 'All Properties',
      length: allPropertiesLength,
    },
    {
      label: 'Listed Properties',
      isSelected: activeTab === 'Listed Properties',
      length: listedCount,
    },
    {
      label: 'Delisted/Pending',
      isSelected: activeTab === 'Delisted/Pending',
      length: delistedCount,
    },
    {
      label: 'Sold Out Properties',
      isSelected: activeTab === 'Sold Out Properties',
      length: soldCount,
    },
  ];

  const handleTabClick = (label) => {
    setActiveTab(label);
    if (onTabChange) {
      onTabChange(label);
    }
  };

  return (
    <div className="tab_section_wrapper">
      <div className="tab_section">
        {tabs.map((tab) => (
          <div
            key={tab.label}
            onClick={() => handleTabClick(tab.label)}
            className={`tab_section-item ${tab.isSelected ? 'tab_section-item-selected' : ''}`}
          >
            {tab.label}
            {tab.length !== null && (
              <span className="tab-section-length">{tab.length}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabSection;