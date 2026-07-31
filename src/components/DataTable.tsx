/**
 * Data Table Component
 * 多言語対応 自治体別 被害密度解析テーブル & JSON ビューア
 */

import React, { useState } from 'react';
import type { Dictionary } from '../i18n/config';
import type { ResolvedMunicipalityEntity } from '../types/gis-domain';

interface DataTableProps {
  dict: Dictionary;
  data: ResolvedMunicipalityEntity[];
  rawJsonPayload: string;
}

export const DataTable: React.FC<DataTableProps> = ({ dict, data, rawJsonPayload }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    if (navigator.clipboard && rawJsonPayload) {
      navigator.clipboard.writeText(rawJsonPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="panel full-width-panel">
      <div className="tab-header">
        <button
          className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          {dict.table.tabTable}
        </button>
        <button
          className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          {dict.table.tabJson}
        </button>
      </div>

      {/* Table View */}
      {activeTab === 'table' && (
        <div id="tabViewTable" className="tab-content active">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{dict.table.jisCode}</th>
                  <th>{dict.table.prefecture}</th>
                  <th>{dict.table.cityName}</th>
                  <th>{dict.table.damageType}</th>
                  <th>{dict.table.absoluteCount}</th>
                  <th>{dict.table.totalBase}</th>
                  <th>{dict.table.totalBaseYear}</th>
                  <th>{dict.table.relativeRatePercent}</th>
                  <th>{dict.table.severityRank}</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                      データがありません
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={`${item.jisCode}-${item.metrics.damageType}-${idx}`}>
                      <td><code>{item.jisCode}</code></td>
                      <td>{item.prefecture}</td>
                      <td><strong>{item.cityName}</strong></td>
                      <td>{item.metrics.damageLabelJa}</td>
                      <td>{item.metrics.absoluteCount.toLocaleString()}</td>
                      <td>{item.metrics.totalBase.toLocaleString()}</td>
                      <td><span className="badge-year">{item.metrics.totalBaseYear}</span></td>
                      <td>
                        <strong className={`density-val density-${item.metrics.severityRank.toLowerCase()}`}>
                          {item.metrics.relativeRatePercent.toFixed(2)}%
                        </strong>
                      </td>
                      <td>
                        <span className={`rank-badge rank-${item.metrics.severityRank.toLowerCase()}`}>
                          {dict.severityRanks[item.metrics.severityRank]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Schema View */}
      {activeTab === 'json' && (
        <div id="tabViewJson" className="tab-content active">
          <div className="json-actions">
            <button onClick={handleCopyJson} className="btn btn-secondary btn-sm">
              {copied ? dict.jsonViewer.copiedText : dict.jsonViewer.copyBtn}
            </button>
            <span className="json-badge">{dict.jsonViewer.badge}</span>
          </div>
          <pre id="jsonViewer" className="json-viewer">
            <code>{rawJsonPayload || dict.jsonViewer.placeholder}</code>
          </pre>
        </div>
      )}
    </section>
  );
};
