"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { RefreshCw, BarChart3, PieChart as PieIcon, Radio, ArrowUpRight, TrendingUp } from "lucide-react";

export default function RealtimeVentureCharts({ initialDeals = [] }) {
  const [activeTab, setActiveTab] = useState("column"); // "column" | "pie" | "dual"
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const columnSvgRef = useRef(null);
  const pieSvgRef = useRef(null);

  // Fetch real-time metrics from NewsAPI endpoint
  const fetchRealtimeMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/newsroom/venture-analytics", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnalyticsData(json);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("[Venture Charts] Real-time fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtimeMetrics();
    // Auto-refresh every 45 seconds to keep data live
    const interval = setInterval(fetchRealtimeMetrics, 45000);
    return () => clearInterval(interval);
  }, [fetchRealtimeMetrics]);

  // Render D3 Column Chart
  useEffect(() => {
    if (!columnSvgRef.current || !analyticsData?.columnData) return;

    const data = analyticsData.columnData;
    const svg = d3.select(columnSvgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 20, bottom: 50, left: 55 };
    const width = 520 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.name))
      .padding(0.28);

    const maxVal = d3.max(data, (d) => d.amount) || 200;
    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, maxVal * 1.15]);

    // Horizontal Grid Lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
          .ticks(5)
      )
      .selectAll("line")
      .attr("stroke", "#766E5F")
      .attr("stroke-opacity", 0.25)
      .attr("stroke-dasharray", "2,2");

    g.select(".grid .domain").remove();

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    xAxis.select(".domain").attr("stroke", "#766E5F").attr("stroke-width", 1.5);

    xAxis
      .selectAll("text")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("fill", "#201E19")
      .attr("transform", "rotate(-12)")
      .style("text-anchor", "end");

    // Y Axis
    const yAxis = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `$${d}M`)
    );

    yAxis.select(".domain").attr("stroke", "#766E5F").attr("stroke-width", 1.5);

    yAxis
      .selectAll("text")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#201E19");

    // Bars
    const bars = g
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d, i) => (i % 2 === 0 ? "#9F3028" : "#201E19"))
      .attr("stroke", "#766E5F")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("fill", "#B24037")
          .attr("stroke-width", 2);
        setHoveredItem(d);
      })
      .on("mouseleave", function (event, d) {
        const idx = data.indexOf(d);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", idx % 2 === 0 ? "#9F3028" : "#201E19")
          .attr("stroke-width", 1);
        setHoveredItem(null);
      });

    // Animate bars entering
    bars
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .delay((d, i) => i * 80)
      .attr("y", (d) => y(d.amount))
      .attr("height", (d) => height - y(d.amount));

    // Value Labels on top of bars
    g.selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.amount) - 6)
      .attr("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "9px")
      .style("font-weight", "bold")
      .style("fill", "#9F3028")
      .style("opacity", 0)
      .text((d) => d.amountStr || `$${d.amount}M`)
      .transition()
      .duration(600)
      .delay((d, i) => i * 80 + 350)
      .style("opacity", 1);
  }, [analyticsData, activeTab]);

  // Render D3 Pie / Donut Chart
  useEffect(() => {
    if (!pieSvgRef.current || !analyticsData?.pieData) return;

    const data = analyticsData.pieData;
    const svg = d3.select(pieSvgRef.current);
    svg.selectAll("*").remove();

    const width = 460;
    const height = 240;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2.6},${height / 2})`);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.03);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.52)
      .outerRadius(radius * 0.92);

    const arcHover = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 1.02);

    const paths = g
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#E8DFC8")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("d", arcHover)
          .attr("stroke", "#201E19")
          .attr("stroke-width", 2.5);
        setHoveredItem({
          name: d.data.sector,
          amountStr: `$${d.data.value}M`,
          percentage: `${d.data.percentage}%`,
          stage: "Sector Share",
        });
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
          .attr("stroke", "#E8DFC8")
          .attr("stroke-width", 2);
        setHoveredItem(null);
      });

    // Donut Center Text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .style("font-family", "monospace")
      .style("font-size", "14px")
      .style("font-weight", "900")
      .style("fill", "#201E19")
      .text(analyticsData.summary?.totalVolume || "$658M");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.3em")
      .style("font-family", "monospace")
      .style("font-size", "8px")
      .style("font-weight", "bold")
      .style("fill", "#9F3028")
      .style("letter-spacing", "0.1em")
      .text("TOTAL DISPATCH");

    // Slices animation
    paths
      .transition()
      .duration(700)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(i(t));
        };
      });
  }, [analyticsData, activeTab]);

  const deals = analyticsData?.deals || initialDeals;

  return (
    <div className="space-y-6">
      {/* Real-time Venture Analytics Control Header */}
      <div className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#766E5F] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F3028] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9F3028]"></span>
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19]">
              REAL-TIME VENTURE INTELLIGENCE
            </span>
            <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 font-bold tracking-widest">
              NEWSAPI LIVE
            </span>
          </div>

          {/* Tab Selector & Refresh Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("column")}
              className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 border transition-all cursor-pointer ${
                activeTab === "column"
                  ? "bg-[#201E19] text-[#E8DFC8] border-[#201E19]"
                  : "bg-[#E8DFC8] text-[#201E19] border-[#766E5F] hover:bg-[#201E19]/10"
              }`}
            >
              <BarChart3 className="w-3 h-3 text-[#9F3028]" />
              <span>COLUMN GRAPH</span>
            </button>

            <button
              onClick={() => setActiveTab("pie")}
              className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 border transition-all cursor-pointer ${
                activeTab === "pie"
                  ? "bg-[#201E19] text-[#E8DFC8] border-[#201E19]"
                  : "bg-[#E8DFC8] text-[#201E19] border-[#766E5F] hover:bg-[#201E19]/10"
              }`}
            >
              <PieIcon className="w-3 h-3 text-[#9F3028]" />
              <span>PIE CHART</span>
            </button>

            <button
              onClick={() => setActiveTab("dual")}
              className={`hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 border transition-all cursor-pointer ${
                activeTab === "dual"
                  ? "bg-[#201E19] text-[#E8DFC8] border-[#201E19]"
                  : "bg-[#E8DFC8] text-[#201E19] border-[#766E5F] hover:bg-[#201E19]/10"
              }`}
            >
              <span>DUAL VIEW</span>
            </button>

            <button
              onClick={fetchRealtimeMetrics}
              disabled={loading}
              title="Sync with NewsAPI"
              className="p-1 border border-[#766E5F] bg-[#E8DFC8] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#9F3028]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-[11px] border-b border-[#766E5F]/30 pb-2">
          <div>
            <div className="text-[9px] text-[#666666] uppercase">Active Volume</div>
            <div className="font-bold text-[#9F3028]">
              {analyticsData?.summary?.totalVolume || "$658M"}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#666666] uppercase">Average Ticket</div>
            <div className="font-bold text-[#201E19]">
              {analyticsData?.summary?.averageRound || "$109M"}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#666666] uppercase">Leading Sector</div>
            <div className="font-bold text-[#201E19] truncate">
              {analyticsData?.summary?.topSector || "AI Reasoning"}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[#666666] uppercase">Feed Status</div>
            <div className="font-bold text-[#4A5844] flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-[#9F3028] animate-pulse" />
              <span>SYNCHRONIZED</span>
            </div>
          </div>
        </div>

        {/* Dynamic D3 Visualizations Canvas */}
        <div className="bg-[#E8DFC8] border border-[#766E5F] p-3 relative min-h-[260px]">
          {/* Active Hover Inspection Badge */}
          {hoveredItem && (
            <div className="absolute top-2 right-2 z-10 bg-[#201E19] text-[#E8DFC8] p-2 border border-[#9F3028] font-mono text-[10px] shadow-md pointer-events-none transition-all">
              <div className="font-bold text-[#9F3028] uppercase">{hoveredItem.name}</div>
              <div className="flex gap-2 text-[#DFD5BC]">
                <span>Amount: <b>{hoveredItem.amountStr || `$${hoveredItem.amount}M`}</b></span>
                {hoveredItem.valuation && <span>Valuation: <b>{hoveredItem.valuation}</b></span>}
                {hoveredItem.percentage && <span>Share: <b>{hoveredItem.percentage}</b></span>}
              </div>
            </div>
          )}

          {/* 1. D3 Column Graph View */}
          {(activeTab === "column" || activeTab === "dual") && (
            <div className={`${activeTab === "dual" ? "mb-6 pb-6 border-b border-[#766E5F]/30" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-[#9F3028] uppercase tracking-wider">
                  D3.JS COLUMN GRAPH — CAPITAL ALLOCATION BY SYNDICATE ($ MILLIONS)
                </span>
                <span className="font-mono text-[9px] text-[#666666] italic">
                  Hover bars to inspect valuation
                </span>
              </div>
              <div className="w-full overflow-x-auto">
                <svg
                  ref={columnSvgRef}
                  viewBox="0 0 520 250"
                  className="w-full h-auto max-h-[250px] select-none"
                  preserveAspectRatio="xMidYMid meet"
                />
              </div>
            </div>
          )}

          {/* 2. D3 Pie Chart View */}
          {(activeTab === "pie" || activeTab === "dual") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-[#9F3028] uppercase tracking-wider">
                  D3.JS PIE CHART — SECTOR CAPITAL DISTRIBUTION
                </span>
                <span className="font-mono text-[9px] text-[#666666] italic">
                  Click/hover slices for details
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-2/3">
                  <svg
                    ref={pieSvgRef}
                    viewBox="0 0 460 240"
                    className="w-full h-auto max-h-[240px] select-none"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </div>
                {/* Sector Legend */}
                <div className="w-full sm:w-1/3 space-y-1.5 font-mono text-[10px]">
                  {analyticsData?.pieData?.map((item) => (
                    <div
                      key={item.sector}
                      className="flex items-center justify-between p-1 bg-[#DFD5BC]/60 border border-[#766E5F]/20"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 inline-block shrink-0 border border-black/20"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-[#201E19]">{item.sector}</span>
                      </div>
                      <span className="font-bold text-[#9F3028] ml-2 shrink-0">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live NewsAPI Dispatches Ticker */}
        {analyticsData?.headlines?.length > 0 && (
          <div className="mt-3 pt-2 border-t border-[#766E5F]/30 font-mono text-[10px] text-[#39352D] flex items-center gap-2 overflow-hidden">
            <span className="font-bold text-[#9F3028] shrink-0 uppercase tracking-tighter">
              [DISPATCH WIRE]:
            </span>
            <div className="truncate text-[#201E19] hover:underline cursor-pointer">
              <a
                href={analyticsData.headlines[0].url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1"
              >
                <span>{analyticsData.headlines[0].title}</span>
                <ArrowUpRight className="w-3 h-3 text-[#9F3028] shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* The Week in Venture Rounds Ledger Table */}
      <div className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC]">
        <div className="flex items-center justify-between border-b border-[#766E5F] pb-2 mb-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19]">
            THE WEEK IN VENTURE ROUNDS
          </span>
          <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
            REAL-TIME LEDGER
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar scrollbar-none">
          <table className="w-full text-left font-mono text-[11px] text-[#222222]">
            <thead>
              <tr className="border-b border-[#766E5F]/40 text-[#39352D]">
                <th className="py-1">SYNDICATE</th>
                <th className="py-1">STAGE</th>
                <th className="py-1">AMOUNT</th>
                <th className="py-1">POST-VAL</th>
                <th className="py-1 text-right">FOCUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#766E5F]/20">
              {deals.map((deal, idx) => (
                <tr
                  key={deal.company || `deal-${idx}`}
                  className="hover:bg-[#201E19]/5 transition-colors"
                >
                  <td className="py-2 font-bold text-[#201E19]">{deal.company}</td>
                  <td className="py-2 text-[#39352D]">{deal.stage || deal.round}</td>
                  <td className="py-2 font-black text-[#9F3028]">{deal.amountStr || deal.amount}</td>
                  <td className="py-2 font-semibold text-[#201E19]">{deal.valuation}</td>
                  <td className="py-2 text-right text-[10px] text-[#39352D] truncate max-w-[180px]">
                    {deal.focus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-[9px] font-mono text-[#777777] italic text-right flex items-center justify-between">
          <span>Source: NewsAPI Financial Dispatches & Digital Times Ledger</span>
          {lastUpdated && <span>Synced: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}
