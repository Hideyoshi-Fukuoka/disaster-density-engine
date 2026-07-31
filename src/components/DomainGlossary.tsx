/**
 * Domain Glossary Component
 * 防災・GIS ドメイン専門用語集 UI コンポーネント
 */

import React from 'react';
import type { Dictionary } from '../i18n/config';

interface DomainGlossaryProps {
  dict: Dictionary;
}

export const DomainGlossary: React.FC<DomainGlossaryProps> = ({ dict }) => {
  const glossaryItems = [
    { key: 'damageDensity', term: dict.gis.damageDensity, desc: 'GIS上の単位面積あたり・分母引き当て被害割合' },
    { key: 'evacuationOrder', term: dict.disasterInfo.evacuationOrder, desc: '行政が発令する最高段階の緊急避難指示' },
    { key: 'evacuationAdvisory', term: dict.disasterInfo.evacuationAdvisory, desc: '警戒レベル4相当（旧避難勧告）' },
    { key: 'evacuationVulnerable', term: dict.disasterInfo.evacuationVulnerable, desc: '警戒レベル3相当（高齢者等避難）' },
    { key: 'evacuationCenter', term: dict.disasterInfo.evacuationCenter, desc: '物理的な避難施設・シェルター' },
    { key: 'estimatedDamage', term: dict.disasterInfo.estimatedDamage, desc: 'シミュレーションモデルによる予測・想定被害' },
    { key: 'damageRatio', term: dict.disasterInfo.damageRatio, desc: '全体数に対する被災割合（%）' },
    { key: 'collapseRate', term: dict.disasterInfo.collapseRate, desc: '全壊・半壊を含む構造物倒壊率' },
    { key: 'isolatedAreas', term: dict.disasterInfo.isolatedAreas, desc: 'インフラ途絶時の孤立予測地域' },
    { key: 'inundationDepth', term: dict.gis.inundationDepth, desc: '洪水・高潮・津波による推定水深（m）' },
    { key: 'seismicIntensity', term: dict.gis.seismicIntensity, desc: '気象庁震度階級（JMA Scale）' },
    { key: 'populationDensity', term: dict.gis.populationDensity, desc: 'GISレイヤー重ね合わせ用人口メッシュデータ' },
  ];

  return (
    <section className="panel glossary-panel" style={{ marginTop: '24px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="panel-header" style={{ marginBottom: '16px' }}>
        <h2><span className="icon">📖</span> Disaster & GIS Domain Glossary</h2>
      </div>
      <div className="glossary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {glossaryItems.map((item) => (
          <div key={item.key} className="glossary-card" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '0.95rem' }}>{item.term}</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
