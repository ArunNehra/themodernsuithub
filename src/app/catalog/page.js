'use client';

import { useState } from 'react';
import { suits } from '@/data/suits';
import SuitCard from '@/components/SuitCard';
import FilterBar from '@/components/FilterBar';
import styles from './page.module.css';

const initialFilters = {
  occasion: [],
  budget: [],
  color: [],
  fabric: [],
  work: []
};

export default function CatalogPage() {
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (category, newList) => {
    setFilters(prev => ({
      ...prev,
      [category]: newList
    }));
  };

  const handleClearAll = () => {
    setFilters(initialFilters);
  };

  // Filter Logic:
  // If a category has active filters, the suit must match at least one selected item in that category.
  const filteredSuits = suits.filter(suit => {
    if (filters.occasion.length > 0 && !filters.occasion.includes(suit.occasion)) {
      return false;
    }
    if (filters.budget.length > 0 && !filters.budget.includes(suit.priceCategory)) {
      return false;
    }
    if (filters.color.length > 0 && !filters.color.includes(suit.color)) {
      return false;
    }
    if (filters.fabric.length > 0 && !filters.fabric.includes(suit.fabric)) {
      return false;
    }
    if (filters.work.length > 0 && !filters.work.includes(suit.work)) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Hamari Suit Collection</h1>
          <p className={styles.subtitle}>
            ₹500 se ₹6000+ bridal tak — har occasion ke liye select premium styles.
          </p>
          <div className={styles.stats}>
            {filteredSuits.length} {filteredSuits.length === 1 ? 'Suit' : 'Suits'} Mile
          </div>
        </div>

        {/* Main Body Grid */}
        <div className={styles.layout}>
          <FilterBar
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />
          
          <main className={styles.catalogMain}>
            {filteredSuits.length > 0 ? (
              <div className={styles.grid}>
                {filteredSuits.map(suit => (
                  <SuitCard key={suit.id} suit={suit} />
                ))}
              </div>
            ) : (
              <div className={`${styles.emptyState} glass-card`}>
                <span className={styles.emptyIcon}>🔍</span>
                <h3>Koi suits nahi mile!</h3>
                <p>Aapke filters se koi suit match nahi kar raha hai. Kripya filters clear karke dobara check karein.</p>
                <button className="btn btn-primary" onClick={handleClearAll} id="empty-state-clear-btn">
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
