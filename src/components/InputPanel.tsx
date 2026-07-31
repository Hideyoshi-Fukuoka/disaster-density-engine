/**
 * Input Panel Component
 * 多言語対応 災害報道・行政発表テキスト入力 & ライブ検索パネル
 */

import React from 'react';
import type { Dictionary } from '../i18n/config';

interface InputPanelProps {
  dict: Dictionary;
  disasterName: string;
  onDisasterNameChange: (val: string) => void;
  inputText: string;
  onInputTextChange: (val: string) => void;
  govSearchQuery: string;
  onGovSearchQueryChange: (val: string) => void;
  onGovSearch: () => void;
  onGovFetch: () => void;
  onParse: () => void;
  govSourceOptions: Array<{ id: string; title: string }>;
  selectedGovSource: string;
  onSelectGovSource: (id: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  dict,
  disasterName,
  onDisasterNameChange,
  inputText,
  onInputTextChange,
  govSearchQuery,
  onGovSearchQueryChange,
  onGovSearch,
  onGovFetch,
  onParse,
  govSourceOptions,
  selectedGovSource,
  onSelectGovSource,
}) => {
  return (
    <section className="panel input-panel">
      <div className="panel-header">
        <h2><span className="icon">📝</span> {dict.inputPanel.title}</h2>
        <span className="hint">{dict.inputPanel.hint}</span>
      </div>

      {/* Government Source Live Search Box */}
      <div className="gov-fetch-box">
        <label>{dict.inputPanel.govFetchLabel}</label>
        <div className="gov-search-row">
          <input
            type="text"
            id="govSearchInput"
            value={govSearchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onGovSearchQueryChange(e.target.value)}
            placeholder={dict.inputPanel.govSearchPlaceholder}
          />
          <button id="btnGovSearch" onClick={onGovSearch} className="btn btn-secondary btn-sm">
            {dict.inputPanel.govSearchBtn}
          </button>
        </div>
        <div className="gov-controls" style={{ marginTop: '8px' }}>
          <select
            id="govSourceSelect"
            value={selectedGovSource}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectGovSource(e.target.value)}
          >
            <option value="">{dict.inputPanel.govSelectDefault}</option>
            {govSourceOptions.map((opt: { id: string; title: string }) => (
              <option key={opt.id} value={opt.id}>
                {opt.title}
              </option>
            ))}
          </select>
          <button id="btnGovFetch" onClick={onGovFetch} className="btn btn-gov">
            {dict.inputPanel.govFetchBtn}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="disasterName">{dict.inputPanel.disasterNameLabel}</label>
        <input
          type="text"
          id="disasterName"
          value={disasterName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDisasterNameChange(e.target.value)}
          placeholder={dict.inputPanel.disasterNamePlaceholder}
        />
      </div>

      <div className="form-group">
        <label htmlFor="inputText">{dict.inputPanel.inputTextLabel}</label>
        <textarea
          id="inputText"
          rows={5}
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputTextChange(e.target.value)}
          placeholder={dict.inputPanel.inputTextPlaceholder}
        />
      </div>

      <button id="btnParse" onClick={onParse} className="btn btn-primary">
        <span className="btn-text">{dict.inputPanel.parseBtn}</span>
      </button>
    </section>
  );
};
