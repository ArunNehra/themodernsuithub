'use client';

import { useState } from 'react';
import styles from './FilterBar.module.css';

export default function FilterBar({ selectedFilters, onFilterChange, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = {
    occasion: ['Bridal', 'Shaadi', 'Festival', 'Casual', 'Office'],
    budget: [
      { label: '₹500 - ₹1,500', value: '₹500-1500' },
      { label: '₹1,500 - ₹3,000', value: '₹1500-3000' },
      { label: '₹3,000 - ₹6,000', value: '₹3000-6000' },
      { label: '₹6,000+', value: '₹6000+' }
    ],
    color: [
      { name: 'Maroon', hex: '#800000' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Blue', hex: '#3182CE' },
      { name: 'Green', hex: '#38A169' },
      { name: 'Yellow', hex: '#D69E2E' },
      { name: 'Red', hex: '#E53E3E' },
      { name: 'White', hex: '#FFFFFF', border: true },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Cream', hex: '#FDFBD3' }
    ],
    fabric: ['Cotton', 'Chiffon', 'Silk', 'Georgette', 'Rayon'],
    work: ['Embroidery', 'Plain', 'Print', 'Zari', 'Mirror work']
  };

  const handleCheckboxChange = (category, value) => {
    const currentList = selectedFilters[category] || [];
    let updatedList;
    if (currentList.includes(value)) {
      updatedList = currentList.filter(item => item !== value);
    } else {
      updatedList = [...currentList, value];
    }
    onFilterChange(category, updatedList);
  };

  const handleColorClick = (colorName) => {
    const currentList = selectedFilters.color || [];
    let updatedList;
    if (currentList.includes(colorName)) {
      updatedList = currentList.filter(item => item !== colorName);
    } else {
      updatedList = [...currentList, colorName];
    }
    onFilterChange('color', updatedList);
  };

  const toggleMobileFilter = () => setIsOpen(!isOpen);

  const hasActiveFilters = Object.values(selectedFilters).some(list => list.length > 0);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className={styles.mobileToggleBtn} 
        onClick={toggleMobileFilter}
        id="filter-drawer-toggle"
      >
        <span>🔍 Filters Filter Karein</span>
        {hasActiveFilters && <span className={styles.activeDot}></span>}
      </button>

      {/* Filter Sidebar Container */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Filter Options</h3>
          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={onClearAll} id="clear-all-filters-btn">
              Clear All
            </button>
          )}
          <button className={styles.closeBtn} onClick={toggleMobileFilter} id="close-filter-drawer-btn">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* Occasion Filter */}
          <div className={styles.group}>
            <h4>Occasion</h4>
            <div className={styles.checkboxList}>
              {filterOptions.occasion.map(item => (
                <label key={item} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(selectedFilters.occasion || []).includes(item)}
                    onChange={() => handleCheckboxChange('occasion', item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div className={styles.group}>
            <h4>Budget Range</h4>
            <div className={styles.checkboxList}>
              {filterOptions.budget.map(item => (
                <label key={item.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(selectedFilters.budget || []).includes(item.value)}
                    onChange={() => handleCheckboxChange('budget', item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className={styles.group}>
            <h4>Colors</h4>
            <div className={styles.colorGrid}>
              {filterOptions.color.map(item => {
                const isSelected = (selectedFilters.color || []).includes(item.name);
                return (
                  <button
                    key={item.name}
                    className={`${styles.colorDot} ${isSelected ? styles.selectedColor : ''}`}
                    style={{ backgroundColor: item.hex }}
                    onClick={() => handleColorClick(item.name)}
                    title={item.name}
                    type="button"
                    aria-label={`Select ${item.name}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Fabric Filter */}
          <div className={styles.group}>
            <h4>Fabric</h4>
            <div className={styles.checkboxList}>
              {filterOptions.fabric.map(item => (
                <label key={item} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(selectedFilters.fabric || []).includes(item)}
                    onChange={() => handleCheckboxChange('fabric', item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Filter */}
          <div className={styles.group}>
            <h4>Work Type</h4>
            <div className={styles.checkboxList}>
              {filterOptions.work.map(item => (
                <label key={item} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(selectedFilters.work || []).includes(item)}
                    onChange={() => handleCheckboxChange('work', item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Done Button */}
        <div className={styles.mobileFooter}>
          <button className="btn btn-primary" onClick={toggleMobileFilter}>
            Apply Filters
          </button>
        </div>
      </aside>
      
      {/* Mobile Drawer Overlay */}
      {isOpen && <div className={styles.overlay} onClick={toggleMobileFilter} />}
    </>
  );
}
