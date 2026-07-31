/**
 * Dual Mode Visualizer Component
 * 多言語対応 被害密度/規模 二重軸ビジュアライザーパネル
 */

import React from 'react';
import type { Dictionary } from '../i18n/config';
import type { VisualizerMode, DamageType } from '../types/gis-domain';

interface DualModeVisualizerProps {
  dict: Dictionary;
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  selectedDamageType: DamageType | 'ALL';
  onDamageTypeChange: (type: DamageType | 'ALL') => void;
  analyzedCount: number;
  maxDensityCityName: string;
  maxDensityValue: number;
  pointInTimeYear: number;
}

export const DualModeVisualizer: React.FC<DualModeVisualizerProps> = ({
  dict,
  mode,
  onModeChange,
  selectedDamageType,
  onDamageTypeChange,
  analyzedCount,
  maxDensityCityName,
  maxDensityValue,
  pointInTimeYear,
}) => {
  return (
    <section className="panel mode-panel">
      <div className="mode-header">
        <div>
          <h2><span className="icon">📊</span> {dict.visualizer.title}</h2>
          <p className="mode-desc">{dict.visualizer.description}</p>
        </div>

        {/* Dual-Mode Switch Toggle */}
        <div className="mode-switch-container">
          <button
            className={`mode-btn ${mode === 'relative' ? 'active' : ''}`}
            onClick={() => onModeChange('relative')}
            data-mode="relative"
          >
            <span className="icon">🔥</span> {dict.visualizer.modeRelative}{' '}
            <small>{dict.visualizer.modeRelativeSub}</small>
          </button>
          <button
            className={`mode-btn ${mode === 'absolute' ? 'active' : ''}`}
            onClick={() => onModeChange('absolute')}
            data-mode="absolute"
          >
            <span className="icon">🏢</span> {dict.visualizer.modeAbsolute}{' '}
            <small>{dict.visualizer.modeAbsoluteSub}</small>
          </button>
        </div>
      </div>

      {/* Filter & Stats Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="filterDamageType">{dict.visualizer.filterLabel}</label>
          <select
            id="filterDamageType"
            value={selectedDamageType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onDamageTypeChange(e.target.value as DamageType | 'ALL')}
          >
            <option value="ALL">{dict.visualizer.filterAll}</option>
            <option value="collapsed_houses">{dict.metrics.collapsedHouses}</option>
            <option value="water_outage">{dict.metrics.waterOutage}</option>
            <option value="evacuees">{dict.metrics.evacuees}</option>
            <option value="infrastructure_damage">{dict.metrics.infrastructure}</option>
          </select>
        </div>

        <div className="stats-summary" id="statsSummary">
          <span className="stat-pill">
            {dict.visualizer.statAnalyzed} <strong>{analyzedCount}</strong>
          </span>
          <span className="stat-pill">
            {dict.visualizer.statMaxDensity}{' '}
            <strong>{maxDensityCityName || '-'} ({maxDensityValue}% )</strong>
          </span>
          <span className="stat-pill">
            {dict.visualizer.statPointInTime} <strong>{pointInTimeYear}</strong>
          </span>
        </div>
      </div>

      {/* Chart Canvas View */}
      <div className="chart-container">
        <canvas id="densityChart"></canvas>
      </div>
    </section>
  );
};
