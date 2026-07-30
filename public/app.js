/**
 * Disaster Density Engine - Frontend App Script
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const btnParse = document.getElementById("btnParse");
  const disasterNameInput = document.getElementById("disasterName");
  const inputTextarea = document.getElementById("inputText");
  const presetButtonsContainer = document.getElementById("presetButtons");

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

  // App State
  let currentOutputData = null;
  let activeMode = "relative"; // 'relative' | 'absolute'
  let chartInstance = null;

  // Initialize
  searchGovSources("");
  executeParse();

  // Event Listeners
  btnParse.addEventListener("click", executeParse);
  btnGovFetch.addEventListener("click", fetchAndParseGovData);

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
   * 総務省・消防庁 発表データのキーワード検索
   */
  async function searchGovSources(query = "") {
    try {
      btnGovSearch.disabled = true;
      btnGovSearch.textContent = "⏳ 検索中...";

      const res = await fetch(`/api/gov/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      govSourceSelect.innerHTML = "";
      if (data.results && data.results.length > 0) {
        data.results.forEach(src => {
          const opt = document.createElement("option");
          opt.value = src.id;
          opt.textContent = `[${src.source}] ${src.title}`;
          govSourceSelect.appendChild(opt);
        });
      } else {
        govSourceSelect.innerHTML = '<option value="">該当する総務省発表が見つかりません</option>';
      }
    } catch (e) {
      console.error("Failed to search gov sources:", e);
    } finally {
      btnGovSearch.disabled = false;
      btnGovSearch.textContent = "🔍 検索";
    }
  }

  /**
   * 総務省・消防庁データの直接取得と解析
   */
  async function fetchAndParseGovData() {
    const selectedId = govSourceSelect.value;
    if (!selectedId) {
      alert("取得する総務省・消防庁の報道発表を選択してください。");
      return;
    }

    btnGovFetch.disabled = true;
    btnGovFetch.textContent = "⏳ 取得中...";

    try {
      const res = await fetch("/api/gov/fetch-and-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: selectedId })
      });

      if (!res.ok) throw new Error("Gov fetch failed");

      const data = await res.json();
      
      // UIに入力テキストとタイトルを自動設定
      disasterNameInput.value = data.parsed_result.disaster_name;
      inputTextarea.value = data.raw_text;

      currentOutputData = data.parsed_result;
      renderVisualizations();
      jsonViewer.textContent = JSON.stringify(currentOutputData, null, 2);

    } catch (err) {
      alert("総務省データの取得に失敗しました: " + err.message);
    } finally {
      btnGovFetch.disabled = false;
      btnGovFetch.textContent = "取得＆自動計算 ⚡";
    }
  }

  /**
   * テキストの解析API呼び出し
   */
  async function executeParse() {
    const text = inputTextarea.value.trim();
    const disasterName = disasterNameInput.value.trim() || "災害被害速報";

    if (!text) {
      alert("解析する報道テキストを入力してください。");
      return;
    }

    btnParse.disabled = true;
    btnParse.querySelector(".btn-text").textContent = "⏳ 解析・計算中...";

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, disaster_name: disasterName })
      });

      if (!res.ok) throw new Error("Parse request failed");

      currentOutputData = await res.json();
      renderVisualizations();
      jsonViewer.textContent = JSON.stringify(currentOutputData, null, 2);
    } catch (err) {
      alert("解析に失敗しました: " + err.message);
    } finally {
      btnParse.disabled = false;
      btnParse.querySelector(".btn-text").textContent = "⚡ 被害密度（相対数%）を解析・算出";
    }
  }

  /**
   * 表示モード切替 ('relative' % vs 'absolute' 件数)
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
   * タブ切替 (Table vs JSON)
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
   * グラフ・テーブル・サマリーの統一描画
   */
  function renderVisualizations() {
    if (!currentOutputData || !currentOutputData.data) return;

    const filter = filterDamageType.value;
    let items = [...currentOutputData.data];

    if (filter !== "ALL") {
      items = items.filter(d => d.metrics.damage_type === filter);
    }

    // ソート処理
    if (activeMode === "relative") {
      // 被害密度 (%) の降順
      items.sort((a, b) => b.metrics.relative_rate_percent - a.metrics.relative_rate_percent);
    } else {
      // 絶対数の降順
      items.sort((a, b) => b.metrics.absolute_count - a.metrics.absolute_count);
    }

    // 1. サマリー表示
    const totalItems = items.length;
    const criticalCount = items.filter(i => i.metrics.severity_rank === "CRITICAL").length;
    statsSummary.innerHTML = `
      <div class="stat-item">検出自治体/指標: <span class="stat-val">${totalItems}件</span></div>
      <div class="stat-item">CRITICAL(重症度極高): <span class="stat-val" style="color:var(--rank-critical);">${criticalCount}件</span></div>
    `;

    // 2. テーブル描画
    tableBody.innerHTML = "";
    items.forEach(item => {
      const tr = document.createElement("tr");
      const damageTypeLabel = getDamageTypeLabel(item.metrics.damage_type);

      tr.innerHTML = `
        <td><code>${item.jis_code}</code></td>
        <td>${item.prefecture}</td>
        <td><strong>${item.city_name}</strong></td>
        <td>${damageTypeLabel}</td>
        <td><strong>${item.metrics.absolute_count.toLocaleString()}</strong></td>
        <td>${item.metrics.total_base.toLocaleString()}</td>
        <td><span class="badge tech-tag" style="font-size:11px;">${item.metrics.total_base_year || 2026}年統計</span></td>
        <td style="font-weight:bold; font-size:15px; color:${getRankColor(item.metrics.severity_rank)};">
          ${item.metrics.relative_rate_percent}%
        </td>
        <td><span class="rank-badge rank-${item.metrics.severity_rank}">${item.metrics.severity_rank}</span></td>
      `;
      tableBody.appendChild(tr);
    });

    // 3. Chart.js グラフ描画
    renderChart(items);
  }

  /**
   * Chart.js バーチャートの描画
   */
  function renderChart(items) {
    const ctx = document.getElementById("densityChart").getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = items.map(i => `${i.city_name} (${getDamageTypeLabel(i.metrics.damage_type)})`);
    const values = items.map(i => activeMode === "relative" ? i.metrics.relative_rate_percent : i.metrics.absolute_count);
    const backgroundColors = items.map(i => getRankColor(i.metrics.severity_rank));

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: activeMode === "relative" ? "被害密度 (%) [相対数]" : "被害規模 (件/棟) [絶対数]",
          data: values,
          backgroundColor: activeMode === "relative" ? backgroundColors : "rgba(56, 189, 248, 0.75)",
          borderColor: activeMode === "relative" ? backgroundColors : "#38bdf8",
          borderWidth: 1,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#f1f5f9", font: { family: "Inter", size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const item = items[context.dataIndex];
                if (activeMode === "relative") {
                  return ` 被害密度: ${item.metrics.relative_rate_percent}% (${item.metrics.absolute_count.toLocaleString()} / ${item.metrics.total_base.toLocaleString()})`;
                } else {
                  return ` 被害絶対数: ${item.metrics.absolute_count.toLocaleString()} (全体数: ${item.metrics.total_base.toLocaleString()})`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 12 } },
            grid: { color: "rgba(255, 255, 255, 0.05)" }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#94a3b8",
              font: { size: 12 },
              callback: function(val) {
                return activeMode === "relative" ? val + "%" : val.toLocaleString();
              }
            },
            grid: { color: "rgba(255, 255, 255, 0.05)" }
          }
        }
      }
    });
  }

  function getDamageTypeLabel(type) {
    switch (type) {
      case "collapsed_houses": return "全壊・住家被害";
      case "water_outage": return "断水";
      case "power_outage": return "停電";
      case "evacuees": return "避難者数";
      default: return type;
    }
  }

  function getRankColor(rank) {
    switch (rank) {
      case "CRITICAL": return "#ef4444";
      case "SEVERE": return "#f97316";
      case "MODERATE": return "#eab308";
      case "LOW": return "#10b981";
      default: return "#38bdf8";
    }
  }

  function copyJsonToClipboard() {
    const text = jsonViewer.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btnCopyJson.textContent = "✅ コピー完了!";
      setTimeout(() => {
        btnCopyJson.textContent = "📋 JSONをコピー";
      }, 2000);
    });
  }
});
