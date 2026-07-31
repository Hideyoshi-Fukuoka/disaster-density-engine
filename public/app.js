/**
 * Disaster Density Engine - Frontend App Script with Live i18n Language Toggle
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const btnParse = document.getElementById("btnParse");
  const disasterNameInput = document.getElementById("disasterName");
  const inputTextarea = document.getElementById("inputText");

  const govSearchInput = document.getElementById("govSearchInput");
  const btnGovSearch = document.getElementById("btnGovSearch");
  const govSourceSelect = document.getElementById("govSourceSelect");
  const btnGovFetch = document.getElementById("btnGovFetch");

  const btnModeRelative = document.getElementById("btnModeRelative");
  const btnModeAbsolute = document.getElementById("btnModeAbsolute");
  const filterDamageType = document.getElementById("filterDamageType");
  const statsSummary = document.getElementById("statsSummary");

  const tabBtnTable = document.getElementById("tabBtnTable");
  const tabBtnJson = document.getElementById("tabBtnJson");
  const tabViewTable = document.getElementById("tabViewTable");
  const tabViewJson = document.getElementById("tabViewJson");

  const tableBody = document.getElementById("tableBody");
  const jsonViewer = document.getElementById("jsonViewer");
  const btnCopyJson = document.getElementById("btnCopyJson");

  // Language Switcher Elements
  const btnLangJa = document.getElementById("btnLangJa");
  const btnLangEn = document.getElementById("btnLangEn");
  const glossaryGrid = document.getElementById("glossaryGrid");

  // App State
  let currentOutputData = null;
  let activeMode = "relative"; // 'relative' | 'absolute'
  let currentLang = localStorage.getItem("disaster_density_lang") || "ja";
  let chartInstance = null;

  // i18n Dictionaries
  const i18nDict = {
    ja: {
      appTitle: "Disaster Density Engine",
      appSubtitle: "報道「絶対数」から自治体「全体数（分母）」を引き当て「被害密度（%）」を即時可視化",
      badgeLive: "Live Engine",
      badgeJis: "JISコード動的照合",
      badgeGov: "🏛️ 総務省・消防庁データ連携",
      inputTitle: "災害報道・行政発表テキスト",
      inputHint: "非構造化テキストを入力",
      govFetchLabel: "🏛️ 総務省・消防庁 発表データのライブ検索・自動取得:",
      govSearchPlaceholder: "キーワード・報数・URL検索 (例: 熊本地震, 第14報, 第15報, または総務省URL)",
      govSearchBtn: "🔍 検索",
      govSelectDefault: "-- 検索・取得対象の発表を選択 --",
      govFetchBtn: "取得＆自動計算 ⚡",
      disasterNameLabel: "災害名・タイトル",
      disasterNamePlaceholder: "例: 令和8年熊本地震被害速報",
      inputTextLabel: "報道文章テキスト",
      inputTextPlaceholder: "テキストを入力してください。",
      btnParse: "⚡ 被害密度（相対数%）を解析・算出",
      modeDesc: "絶対数（規模）と相対数（密度%）を比較切替",
      modeRelativeText: "被害密度 (%) モード",
      modeRelativeSub: "(相対数)",
      modeAbsoluteText: "被害規模 モード",
      modeAbsoluteSub: "(絶対数)",
      filterLabel: "被害種別フィルタ:",
      filterAll: "すべて表示",
      filterCollapsed: "全壊・住家被害",
      filterWater: "断水",
      filterEvacuees: "避難者",
      tabTable: "📋 自治体別 被害密度解析テーブル",
      tabJson: "{ } Output JSON Schema (API結果)",
      thJisCode: "JISコード",
      thPrefecture: "都道府県",
      thCityName: "自治体名",
      thDamageType: "被害種別",
      thAbsoluteCount: "被害絶対数 (分子)",
      thTotalBase: "自治体全体数 (分母)",
      thTotalBaseYear: "分母参照年次",
      thRelativeRatePercent: "被害密度 (%)",
      thSeverityRank: "重症度ランク",
      jsonBadge: "Output JSON Schema (Required Format)",
      copyJsonBtn: "📋 JSONをコピー",
      copyJsonSuccess: "✅ コピー完了！",
      glossaryTitle: "Disaster Risk Reduction (DRR) & GIS Domain Glossary",
      footerText: "Disaster-Density-Engine © 2026 | Disaster Damage Dynamic Density Analytics Platform",
      severity: {
        CRITICAL: "CRITICAL (極めて致命的)",
        SEVERE: "SEVERE (深刻)",
        MODERATE: "MODERATE (中規模)",
        LIGHT: "LIGHT (軽微)",
      },
      glossary: [
        { term: "被害密度 (Disaster Impact Density)", desc: "GIS上の単位面積・自治体全体数（分母）に対する被災割合（%）。人口規模の小さい中小自治体の致命的被害を即座に可視化。" },
        { term: "避難指示 (Evacuation Order)", desc: "行政が発令する最高段階の緊急避難指示（警戒レベル5/4相当）。" },
        { term: "避難指示相当 (Evacuation Advisory)", desc: "警戒レベル4相当の危険地域からの避難指示・旧避難勧告。" },
        { term: "高齢者等避難 (Evacuation of Vulnerable)", desc: "警戒レベル3相当の高齢者や要配慮者の優先避難指示。" },
        { term: "避難所 (Evacuation Center / Shelter)", desc: "被災者を安全に収容・支援する物理的な避難施設。" },
        { term: "想定被害 (Estimated Damage)", desc: "シミュレーションモデルや初期速報に基づくモデル予測被害数値。" },
        { term: "被害率 (Damage Ratio)", desc: "総世帯数・人口・建物数に対する被災割合（%）。" },
        { term: "建物倒壊率 (Building Collapse Rate)", desc: "全壊・半壊を含む自治体全体の構造物損壊割合。" },
        { term: "孤立可能性地域 (Potentially Isolated)", desc: "土砂崩れや道路途絶によるインフラ孤立予測地域。" },
        { term: "浸水深 (Inundation Depth)", desc: "洪水・高潮・津波による想定・観測水深（m）。" },
        { term: "震度 (Seismic Intensity)", desc: "気象庁震度階級（JMA Scale）による地震動強度。" },
        { term: "人口密度 (Population Density)", desc: "GISレイヤー重ね合わせ用メッシュ単位人口分布。" },
      ]
    },
    en: {
      appTitle: "Disaster Density Engine",
      appSubtitle: "Dynamic Resolution of Absolute Damage Counts to Municipal Baseline for Relative Impact Density (%) Visualization",
      badgeLive: "Live Engine",
      badgeJis: "Dynamic JIS Code Match",
      badgeGov: "🏛️ MIC / FDMA Data Pipeline",
      inputTitle: "Disaster Reports & Government Bulletins",
      inputHint: "Input Unstructured Text",
      govFetchLabel: "🏛️ Live Search & Automated Fetch for MIC / FDMA Bulletins:",
      govSearchPlaceholder: "Search by keyword, bulletin #, or URL (e.g., Kumamoto Earthquake, Bulletin #14, #15)",
      govSearchBtn: "🔍 Search",
      govSelectDefault: "-- Select Target Bulletin / Announcement --",
      govFetchBtn: "Fetch & Analyze ⚡",
      disasterNameLabel: "Disaster Name / Headline",
      disasterNamePlaceholder: "e.g., 2026 Reiwa 8 Kumamoto Earthquake Emergency Report",
      inputTextLabel: "Unstructured Damage Report Body Text",
      inputTextPlaceholder: "Please enter disaster news report or official bulletin text.",
      btnParse: "⚡ Parse & Calculate Impact Density Ratio (%)",
      modeDesc: "Switch between Absolute Damage Magnitude & Relative Impact Density (%)",
      modeRelativeText: "Impact Density (%) Mode",
      modeRelativeSub: "(Relative Rate)",
      modeAbsoluteText: "Absolute Magnitude Mode",
      modeAbsoluteSub: "(Absolute Count)",
      filterLabel: "Damage Category Filter:",
      filterAll: "Show All Categories",
      filterCollapsed: "Structural Collapse / Destroyed Homes",
      filterWater: "Water Service Disruption",
      filterEvacuees: "Displaced Persons / Evacuees",
      tabTable: "📋 Municipal Damage Density Analytics Table",
      tabJson: "{ } Output JSON Schema (API Payload)",
      thJisCode: "JIS Code",
      thPrefecture: "Prefecture",
      thCityName: "Municipality Name",
      thDamageType: "Damage Category",
      thAbsoluteCount: "Absolute Count (Numerator)",
      thTotalBase: "Municipal Baseline (Denominator)",
      thTotalBaseYear: "Baseline Census Year",
      thRelativeRatePercent: "Impact Density (%)",
      thSeverityRank: "Severity Rank",
      jsonBadge: "Output JSON Schema (Required Format)",
      copyJsonBtn: "📋 Copy JSON Payload",
      copyJsonSuccess: "✅ Copied to Clipboard!",
      glossaryTitle: "Disaster Risk Reduction (DRR) & GIS Domain Glossary",
      footerText: "Disaster-Density-Engine © 2026 | Disaster Damage Dynamic Density Analytics Platform",
      severity: {
        CRITICAL: "CRITICAL (≥ 15% Ratio)",
        SEVERE: "SEVERE (5% - 15% Ratio)",
        MODERATE: "MODERATE (1% - 5% Ratio)",
        LIGHT: "LIGHT (< 1% Ratio)",
      },
      glossary: [
        { term: "Disaster Impact Density", desc: "Relative damage ratio (%) calculated by dividing reported absolute damage figures by pre-disaster municipal census baselines. Immediately highlights extreme severity in small municipalities." },
        { term: "Evacuation Order", desc: "Highest level emergency evacuation command issued by municipal government (Level 4/5 equivalent)." },
        { term: "Evacuation Advisory", desc: "Evacuation instruction issued for high-risk zones (Level 4 equivalent)." },
        { term: "Evacuation of Vulnerable People", desc: "Priority evacuation directive for elderly and individuals requiring assistance (Level 3 equivalent)." },
        { term: "Evacuation Center / Shelter", desc: "Physical facility for safely accommodating and supporting displaced persons." },
        { term: "Estimated Damage / Projected Impact", desc: "Model-predicted damage statistics derived from hazard simulations and early bulletins." },
        { term: "Damage Ratio (%)", desc: "Proportion of impacted households, population, or building stock relative to municipal baseline." },
        { term: "Building Collapse Rate", desc: "Percentage of completely or heavily damaged structural stock across municipality." },
        { term: "Potentially Isolated Areas", desc: "Geospatial zones predicted to suffer isolation due to landslides or road disruptions." },
        { term: "Inundation Depth", desc: "Estimated or measured flood, storm surge, or tsunami water depth in meters." },
        { term: "Seismic Intensity", desc: "Ground motion shaking intensity on the JMA Seismic Intensity Scale." },
        { term: "Population Density", desc: "Mesh-level spatial population distribution for GIS layer overlay." },
      ]
    }
  };

  // Initialize Language & App
  setLanguage(currentLang);
  searchGovSources("");
  executeParse();

  // Event Listeners
  btnLangJa.addEventListener("click", () => setLanguage("ja"));
  btnLangEn.addEventListener("click", () => setLanguage("en"));

  btnParse.addEventListener("click", () => executeParse());
  btnGovFetch.addEventListener("click", () => fetchAndParseGovData());

  btnGovSearch.addEventListener("click", () => {
    searchGovSources(govSearchInput.value);
  });

  govSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchGovSources(govSearchInput.value);
    }
  });

  btnModeRelative.addEventListener("click", (e) => {
    e.preventDefault();
    setMode("relative");
  });

  btnModeAbsolute.addEventListener("click", (e) => {
    e.preventDefault();
    setMode("absolute");
  });

  filterDamageType.addEventListener("change", renderVisualizations);

  tabBtnTable.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("table");
  });

  tabBtnJson.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("json");
  });

  btnCopyJson.addEventListener("click", copyJsonToClipboard);

  /**
   * 言語切替関数 (Live Language Switcher)
   */
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("disaster_density_lang", lang);

    // Toggle button active states
    if (lang === "ja") {
      btnLangJa.classList.add("active");
      btnLangEn.classList.remove("active");
    } else {
      btnLangEn.classList.add("active");
      btnLangJa.classList.remove("active");
    }

    const dict = i18nDict[lang];
    if (!dict) return;

    // Update Text Elements
    setText("i18nAppTitle", dict.appTitle);
    setText("i18nAppSubtitle", dict.appSubtitle);
    setText("i18nBadgeLive", dict.badgeLive);
    setText("i18nBadgeJis", dict.badgeJis);
    setText("i18nBadgeGov", dict.badgeGov);

    setText("i18nInputTitle", dict.inputTitle);
    setText("i18nInputHint", dict.inputHint);
    setText("i18nGovFetchLabel", dict.govFetchLabel);
    setPlaceholder("govSearchInput", dict.govSearchPlaceholder);
    setText("btnGovSearch", dict.govSearchBtn);
    setText("i18nGovSelectDefault", dict.govSelectDefault);
    setText("btnGovFetch", dict.govFetchBtn);

    setText("i18nDisasterNameLabel", dict.disasterNameLabel);
    setPlaceholder("disasterName", dict.disasterNamePlaceholder);
    setText("i18nInputTextLabel", dict.inputTextLabel);
    setPlaceholder("inputText", dict.inputTextPlaceholder);

    const btnTextEl = document.getElementById("i18nBtnParse") || btnParse.querySelector(".btn-text") || btnParse;
    if (btnTextEl) btnTextEl.textContent = dict.btnParse;

    setText("i18nModeDesc", dict.modeDesc);
    setText("i18nModeRelativeText", dict.modeRelativeText);
    setText("i18nModeRelativeSub", dict.modeRelativeSub);
    setText("i18nModeAbsoluteText", dict.modeAbsoluteText);
    setText("i18nModeAbsoluteSub", dict.modeAbsoluteSub);

    setText("i18nFilterLabel", dict.filterLabel);
    setText("i18nFilterAll", dict.filterAll);
    setText("i18nFilterCollapsed", dict.filterCollapsed);
    setText("i18nFilterWater", dict.filterWater);
    setText("i18nFilterEvacuees", dict.filterEvacuees);

    setText("tabBtnTable", dict.tabTable);
    setText("tabBtnJson", dict.tabJson);

    setText("thJisCode", dict.thJisCode);
    setText("thPrefecture", dict.thPrefecture);
    setText("thCityName", dict.thCityName);
    setText("thDamageType", dict.thDamageType);
    setText("thAbsoluteCount", dict.thAbsoluteCount);
    setText("thTotalBase", dict.thTotalBase);
    setText("thTotalBaseYear", dict.thTotalBaseYear);
    setText("thRelativeRatePercent", dict.thRelativeRatePercent);
    setText("thSeverityRank", dict.thSeverityRank);

    setText("i18nJsonBadge", dict.jsonBadge);
    setText("btnCopyJson", dict.copyJsonBtn);
    setText("i18nGlossaryTitle", dict.glossaryTitle);
    setText("i18nFooterText", dict.footerText);

    // Render Glossary Grid
    if (glossaryGrid && dict.glossary) {
      glossaryGrid.innerHTML = "";
      dict.glossary.forEach(item => {
        const card = document.createElement("div");
        card.className = "glossary-card";
        card.innerHTML = `
          <h4><span>📖</span> ${item.term}</h4>
          <p>${item.desc}</p>
        `;
        glossaryGrid.appendChild(card);
      });
    }

    // Re-render Visualizations if data exists
    if (currentOutputData) {
      renderVisualizations();
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setPlaceholder(id, placeholder) {
    const el = document.getElementById(id);
    if (el) el.placeholder = placeholder;
  }

  /**
   * 総務省・消防庁 発表データのキーワード検索
   */
  async function searchGovSources(query = "") {
    try {
      btnGovSearch.disabled = true;
      btnGovSearch.textContent = currentLang === "ja" ? "⏳ 検索中..." : "⏳ Searching...";

      const res = await fetch(`/api/gov/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      const selectedVal = govSourceSelect.value;
      govSourceSelect.innerHTML = "";

      if (data.results && data.results.length > 0) {
        data.results.forEach(src => {
          const opt = document.createElement("option");
          opt.value = src.id;
          opt.textContent = `[${src.source}] ${src.title}`;
          if (src.id === selectedVal) opt.selected = true;
          govSourceSelect.appendChild(opt);
        });
      } else {
        const noResultText = currentLang === "ja" ? "該当する総務省発表が見つかりません" : "No matching bulletins found";
        govSourceSelect.innerHTML = `<option value="">${noResultText}</option>`;
      }
    } catch (e) {
      console.error("Gov search error:", e);
    } finally {
      btnGovSearch.disabled = false;
      btnGovSearch.textContent = i18nDict[currentLang].govSearchBtn;
    }
  }

  /**
   * 選択された総務省発表データの本文を取得し自動フェッチ＆解析
   */
  async function fetchAndParseGovData() {
    const selectedId = govSourceSelect.value;
    if (!selectedId) {
      alert(currentLang === "ja" ? "取得対象の総務省発表を選択してください。" : "Please select a target bulletin to fetch.");
      return;
    }

    try {
      btnGovFetch.disabled = true;
      btnGovFetch.textContent = currentLang === "ja" ? "⚡ データ取得・解析中..." : "⚡ Fetching & Analyzing...";

      const res = await fetch(`/api/gov/fetch?id=${encodeURIComponent(selectedId)}`);
      const data = await res.json();

      if (data.success) {
        disasterNameInput.value = data.disaster_name || data.title;
        inputTextarea.value = data.text;
        await executeParse();
      } else {
        alert((currentLang === "ja" ? "データ取得失敗: " : "Fetch failed: ") + (data.error || ""));
      }
    } catch (e) {
      console.error("Gov fetch error:", e);
      alert(currentLang === "ja" ? "データの自動取得中にエラーが発生しました。" : "An error occurred while fetching government data.");
    } finally {
      btnGovFetch.disabled = false;
      btnGovFetch.textContent = i18nDict[currentLang].govFetchBtn;
    }
  }

  /**
   * テキスト解析・被害密度算出 API の呼び出し
   */
  async function executeParse() {
    const text = inputTextarea.value.trim();
    const disasterName = disasterNameInput.value.trim() || (currentLang === "ja" ? "被害緊急解析" : "Emergency Impact Analysis");

    if (!text) {
      alert(currentLang === "ja" ? "解析対象の文章テキストを入力してください。" : "Please enter report text to analyze.");
      return;
    }

    const btnTextEl = document.getElementById("i18nBtnParse") || btnParse.querySelector(".btn-text") || btnParse;

    try {
      btnParse.disabled = true;
      if (btnTextEl) {
        btnTextEl.textContent = currentLang === "ja" ? "⏳ 解析・密度計算中..." : "⏳ Calculating Impact Density...";
      }

      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, disaster_name: disasterName })
      });

      if (!response.ok) throw new Error("API Server Error");

      currentOutputData = await response.json();
      renderVisualizations();
    } catch (err) {
      console.error("Parse failed:", err);
      alert(currentLang === "ja" ? "解析処理に失敗しました。サーバーログをご確認ください。" : "Parsing failed. Please check server logs.");
    } finally {
      btnParse.disabled = false;
      if (btnTextEl) {
        btnTextEl.textContent = i18nDict[currentLang].btnParse;
      }
    }
  }

  /**
   * モード切り替え (relative % ↔ absolute 規模)
   */
  function setMode(mode) {
    activeMode = mode;
    if (mode === "relative") {
      btnModeRelative.classList.add("active");
      btnModeAbsolute.classList.remove("active");
    } else {
      btnModeAbsolute.classList.add("active");
      btnModeRelative.classList.remove("active");
    }
    renderVisualizations();
  }

  /**
   * タブ切り替え (Table ↔ Output JSON)
   */
  function switchTab(tab) {
    if (tab === "table") {
      tabBtnTable.classList.add("active");
      tabBtnJson.classList.remove("active");
      tabViewTable.classList.add("active");
      tabViewJson.classList.remove("active");
    } else {
      tabBtnJson.classList.add("active");
      tabBtnTable.classList.remove("active");
      tabViewJson.classList.add("active");
      tabViewTable.classList.remove("active");
    }
  }

  /**
   * データ可視化・レンダリング (Chart, Table, JSON Schema)
   */
  function renderVisualizations() {
    if (!currentOutputData || !currentOutputData.data) return;

    const filterVal = filterDamageType.value;
    let filteredList = currentOutputData.data;

    if (filterVal !== "ALL") {
      filteredList = filteredList.filter(item => item.metrics.damage_type === filterVal);
    }

    // Sort by Active Mode
    if (activeMode === "relative") {
      filteredList.sort((a, b) => b.metrics.relative_rate_percent - a.metrics.relative_rate_percent);
    } else {
      filteredList.sort((a, b) => b.metrics.absolute_count - a.metrics.absolute_count);
    }

    renderStatsSummary(filteredList);
    renderChart(filteredList);
    renderTable(filteredList);
    renderJsonViewer();
  }

  /**
   * 統計サマリーの描画
   */
  function renderStatsSummary(list) {
    if (list.length === 0) {
      statsSummary.innerHTML = `<span class="stat-pill">${currentLang === 'ja' ? '該当データなし' : 'No data found'}</span>`;
      return;
    }

    const totalMunicipalities = new Set(list.map(item => item.jis_code)).size;
    const maxDensityItem = [...list].sort((a, b) => b.metrics.relative_rate_percent - a.metrics.relative_rate_percent)[0];
    const baseYear = maxDensityItem ? maxDensityItem.metrics.total_base_year || 2026 : 2026;

    const labelAnalyzed = currentLang === "ja" ? "解析自治体数:" : "Municipalities Analyzed:";
    const labelMax = currentLang === "ja" ? "最高被害密度自治体:" : "Peak Impact Municipality:";
    const labelYear = currentLang === "ja" ? "分母同期年次:" : "Baseline Year:";

    statsSummary.innerHTML = `
      <span class="stat-pill">${labelAnalyzed} <strong>${totalMunicipalities}</strong></span>
      <span class="stat-pill">${labelMax} <strong>${maxDensityItem ? maxDensityItem.city_name : '-'} (${maxDensityItem ? maxDensityItem.metrics.relative_rate_percent.toFixed(2) : 0}%)</strong></span>
      <span class="stat-pill">${labelYear} <strong>${baseYear}</strong></span>
    `;
  }

  /**
   * Chart.js グラフの描画
   */
  function renderChart(list) {
    const ctx = document.getElementById("densityChart").getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = list.map(item => `${item.city_name} (${getDamageTypeLabel(item.metrics.damage_type)})`);
    const values = list.map(item => activeMode === "relative" ? item.metrics.relative_rate_percent : item.metrics.absolute_count);

    const backgroundColors = list.map(item => {
      if (activeMode === "relative") {
        switch (item.metrics.severity_rank) {
          case "CRITICAL": return "rgba(239, 68, 68, 0.85)";
          case "SEVERE": return "rgba(249, 115, 22, 0.85)";
          case "MODERATE": return "rgba(234, 179, 8, 0.85)";
          default: return "rgba(16, 185, 129, 0.85)";
        }
      }
      return "rgba(56, 189, 248, 0.85)";
    });

    const datasetLabel = activeMode === "relative" 
      ? (currentLang === "ja" ? "被害密度 (%)" : "Impact Density (%)") 
      : (currentLang === "ja" ? "被害規模 (絶対数)" : "Absolute Count");

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace("0.85", "1")),
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#f1f5f9", font: { family: "Inter, Noto Sans JP" } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const item = list[context.dataIndex];
                if (activeMode === "relative") {
                  return ` ${currentLang === 'ja' ? '被害密度' : 'Impact Density'}: ${item.metrics.relative_rate_percent.toFixed(2)}% (${currentLang === 'ja' ? '分子' : 'Num'}:${item.metrics.absolute_count.toLocaleString()} / ${currentLang === 'ja' ? '分母' : 'Denom'}:${item.metrics.total_base.toLocaleString()})`;
                } else {
                  return ` ${currentLang === 'ja' ? '被害規模' : 'Absolute Count'}: ${item.metrics.absolute_count.toLocaleString()}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid: { color: "rgba(255, 255, 255, 0.05)" }
          },
          y: {
            ticks: {
              color: "#94a3b8",
              callback: function(value) {
                return activeMode === "relative" ? value + "%" : value.toLocaleString();
              }
            },
            grid: { color: "rgba(255, 255, 255, 0.08)" }
          }
        }
      }
    });
  }

  /**
   * データテーブルの描画
   */
  function renderTable(list) {
    tableBody.innerHTML = "";

    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colSpan="9" style="text-align:center; color:#94a3b8; padding:24px;">${currentLang === 'ja' ? '解析データがありません' : 'No analytics data available'}</td></tr>`;
      return;
    }

    const dict = i18nDict[currentLang];

    list.forEach(item => {
      const tr = document.createElement("tr");
      const rank = item.metrics.severity_rank;
      const rankText = dict.severity[rank] || rank;

      tr.innerHTML = `
        <td><code>${item.jis_code}</code></td>
        <td>${item.prefecture}</td>
        <td><strong>${item.city_name}</strong></td>
        <td>${getDamageTypeLabel(item.metrics.damage_type)}</td>
        <td>${item.metrics.absolute_count.toLocaleString()}</td>
        <td>${item.metrics.total_base.toLocaleString()}</td>
        <td><span class="badge-year">${item.metrics.total_base_year || 2026}</span></td>
        <td><strong class="density-val density-${rank.toLowerCase()}">${item.metrics.relative_rate_percent.toFixed(2)}%</strong></td>
        <td><span class="rank-badge rank-${rank.toLowerCase()}">${rankText}</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  /**
   * JSON Viewer の表示更新
   */
  function renderJsonViewer() {
    if (!currentOutputData) return;
    jsonViewer.textContent = JSON.stringify(currentOutputData, null, 2);
  }

  /**
   * JSON Payload コピー機能
   */
  function copyJsonToClipboard() {
    if (!currentOutputData) return;
    const text = JSON.stringify(currentOutputData, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      const dict = i18nDict[currentLang];
      btnCopyJson.textContent = dict.copyJsonSuccess;
      setTimeout(() => {
        btnCopyJson.textContent = dict.copyJsonBtn;
      }, 2000);
    });
  }

  /**
   * 被害種別のラベル変換
   */
  function getDamageTypeLabel(type) {
    const dict = i18nDict[currentLang];
    switch (type) {
      case "collapsed_houses": return dict.filterCollapsed;
      case "water_outage": return dict.filterWater;
      case "evacuees": return dict.filterEvacuees;
      default: return type;
    }
  }
});
