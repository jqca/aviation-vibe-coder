import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import VizCanvas, { getVizType } from './VizCanvas';
import type { UseCase } from '../data/useCases';

function parseToSeconds(v: string): number | null {
  const s = v.replace(/,/g, '');
  const m1 = s.match(/([\d.]+)\s*秒/); if (m1) return parseFloat(m1[1]);
  const m2 = s.match(/([\d.]+)\s*分/); if (m2) return parseFloat(m2[1]) * 60;
  const m3 = s.match(/([\d.]+)\s*時間/); if (m3) return parseFloat(m3[1]) * 3600;
  const m4 = s.match(/([\d.]+)\s*日/); if (m4) return parseFloat(m4[1]) * 86400;
  const m5 = s.match(/([\d.]+)\s*ms/i); if (m5) return parseFloat(m5[1]) / 1000;
  const m6 = s.match(/([\d.]+)\s*s(?:ec)?/i); if (m6) return parseFloat(m6[1]);
  const m7 = s.match(/([\d.]+)\s*min/i); if (m7) return parseFloat(m7[1]) * 60;
  const m8 = s.match(/([\d.]+)\s*h(?:our|r)?/i); if (m8) return parseFloat(m8[1]) * 3600;
  return null;
}

function fmtTime(sec: number): string {
  if (sec < 1) return `${(sec * 1000).toFixed(0)} ms`;
  if (sec < 60) return `${sec.toFixed(1)} 秒`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} 分`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} 時間`;
  return `${(sec / 86400).toFixed(1)} 日`;
}

interface Props { useCase: UseCase; }

const LivePreview: React.FC<Props> = ({ useCase }) => {
  const [optimizationLevel, setOptimizationLevel] = useState(75);
  const [dataSize, setDataSize] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [useQuantum, setUseQuantum] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const vizType = getVizType(useCase.id);
  const isActionMode = /gate|crew|rotation|baggage|security/.test(useCase.id);

  useEffect(() => {
    setIsOptimized(false); setIsRunning(false); setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [useCase.id]);

  const handleRunSimulation = () => {
    if (isRunning) return;
    setIsRunning(true); setIsOptimized(false); setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 0.025;
      if (p >= 1) { p = 1; clearInterval(intervalRef.current!); setIsRunning(false); setIsOptimized(true); }
      setProgress(p);
    }, 120);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false); setIsOptimized(false); setProgress(0); setSelectedNode(null);
  };

  const getAdjustedValue = (raw: string): string => {
    const n = parseFloat(raw.replace(/[^0-9.\-]/g, ''));
    if (isNaN(n)) return raw;
    const factor = optimizationLevel / 75;
    const adj = n * factor;
    const unit = raw.replace(/[0-9.\-,]/g, '').trim();
    return Number.isInteger(adj) ? `${Math.round(adj)}${unit}` : `${adj.toFixed(1)}${unit}`;
  };

  const vizLabels: Record<string, { idle: string; running: string; done: string }> = {
    flight: { idle: 'フライトスケジュール待機中', running: '量子最適化実行中…', done: 'スケジュール最適化完了' },
    gate: { idle: 'ゲート割当待機中', running: 'ゲート配置最適化中…', done: '衝突ゼロ割当達成' },
    maintenance: { idle: '整備計画待機中', running: '整備ウィンドウ最適化中…', done: 'AOGリスク最小化完了' },
    crew: { idle: 'クルー割当待機中', running: 'ペアリング最適化中…', done: 'クルー最適配置完了' },
    cargo: { idle: '貨物配置待機中', running: '重心バランス最適化中…', done: '積載率最大化完了' },
    fuel: { idle: '燃費予測待機中', running: '燃料消費モデル実行中…', done: '燃費予測モデル完成' },
    airspace: { idle: '空域管理待機中', running: 'セクター最適化中…', done: '空域衝突ゼロ達成' },
    delay: { idle: '遅延分析待機中', running: '遅延伝播シミュレーション中…', done: '遅延波及抑制完了' },
    baggage: { idle: '手荷物追跡待機中', running: 'BHSルーティング最適化中…', done: 'ロストバゲージ▼94%' },
    congestion: { idle: '混雑分析待機中', running: 'ターミナル人流最適化中…', done: '混雑緩和達成' },
    security: { idle: '保安検査待機中', running: 'レーン配分最適化中…', done: '待ち時間▼68%' },
    rotation: { idle: '機材ローテーション待機中', running: '機材回し最適化中…', done: '稼働率最大化完了' },
    commercial: { idle: '商業収益分析待機中', running: 'テナント配置最適化中…', done: '非航空収入▲22%' },
    noise: { idle: '騒音評価待機中', running: '騒音コンター計算中…', done: '騒音面積▼35%' },
    energy: { idle: 'エネルギー分析待機中', running: '空港電力最適化中…', done: 'エネルギー▼31%' },
    weather: { idle: '気象回避待機中', running: '代替ルート計算中…', done: '最適迂回ルート確定' },
    mro: { idle: 'MRO在庫待機中', running: '部品在庫最適化中…', done: '充足率98.7%' },
    pricing: { idle: '運賃分析待機中', running: 'ダイナミックプライシング最適化中…', done: '収益▲18%' },
    drone: { idle: 'ドローン空域待機中', running: 'UAM回廊デコンフリクト中…', done: '安全間隔確保完了' },
    co2: { idle: 'CO₂分析待機中', running: 'カーボン削減シナリオ計算中…', done: 'CO₂▼28% YoY' },
  };

  const label = vizLabels[vizType] || vizLabels.flight;
  const statusText = isRunning ? label.running : isOptimized ? label.done : label.idle;

  const qvc = useCase.quantumVsClassical;

  return (
    <div className="live-preview">
      {/* ── Visualization ── */}
      <div className={`visualization-box${isActionMode ? ' action-mode' : ''}${isRunning ? ' viz-running' : ''}`}>
        <VizCanvas vizType={vizType} running={isRunning} optimized={isOptimized} progress={progress} optLevel={optimizationLevel} selectedNode={selectedNode} onNodeClick={setSelectedNode} />
        <div className="viz-status">{statusText}</div>
      </div>

      {/* ── Controls ── */}
      <div className="control-panel">
        <div className="control-row">
          <label className="control-label">最適化レベル
            <input type="range" min={0} max={100} value={optimizationLevel} onChange={e => setOptimizationLevel(+e.target.value)} className="slider" />
            <span className="control-value">{optimizationLevel}%</span>
          </label>
        </div>
        <div className="control-row">
          <label className="control-label">データ規模
            <input type="range" min={10} max={100} value={dataSize} onChange={e => setDataSize(+e.target.value)} className="slider" />
            <span className="control-value">{dataSize}</span>
          </label>
        </div>
        <div className="control-row">
          <div className="toggle-group">
            <button className={`toggle-btn${useQuantum ? ' active' : ''}`} onClick={() => setUseQuantum(true)}>Quantum</button>
            <button className={`toggle-btn${!useQuantum ? ' active' : ''}`} onClick={() => setUseQuantum(false)}>Classical</button>
          </div>
        </div>
        <div className="control-row btn-row">
          <button className="run-btn" onClick={handleRunSimulation} disabled={isRunning}><Play size={14} /> 実行</button>
          <button className="reset-btn" onClick={handleReset}><RotateCcw size={14} /> リセット</button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="metrics-grid">
        {useCase.metrics.slice(0, 4).map((m, i) => (
          <div key={i} className="metric-card">
            <div className="metric-label">{m.label}</div>
            <div className={`metric-value trend-${m.trend}`}>{isOptimized ? getAdjustedValue(m.value) : m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Insights ── */}
      <div className="insights-panel">
        {/* Impact card */}
        <div className="insight-card impact-card">
          <div className="insight-title">BUSINESS IMPACT</div>
          <p className="insight-body">{useCase.businessImpact}</p>
        </div>

        {/* Quantum vs Classical card */}
        <div className="insight-card qvc-card">
          <div className="insight-title">QUANTUM vs CLASSICAL</div>
          <div className="qvc-scales">
            {[
              { label: '小規模 (~1,000件)', qt: qvc.quantumTime, ct: qvc.classicalTime },
              { label: '中規模 (1,000~10,000件)', qt: qvc.quantumTime, ct: qvc.classicalTime },
              { label: '大規模 (10,000件超)', qt: qvc.quantumTime, ct: qvc.classicalTime },
            ].map((s, i) => {
              const qs = parseToSeconds(s.qt);
              const cs = parseToSeconds(s.ct);
              const ratio = qs && cs ? cs / qs : null;
              let verdict = '';
              if (i === 0) verdict = '古典有利';
              else if (i === 1) verdict = '量子やや有利';
              else verdict = '量子圧倒的';
              return (
                <div key={i} className="qvc-scale-block">
                  <div className="qvc-scale-label">{s.label}</div>
                  <div className="qvc-row"><span className="qvc-tag q">Q</span><span>{i === 0 ? fmtTime((qs || 1) * 0.9) : i === 1 ? fmtTime((qs || 1) * 0.5) : s.qt}</span></div>
                  <div className="qvc-row"><span className="qvc-tag c">C</span><span>{i === 0 ? s.ct : i === 1 ? fmtTime((cs || 1) * 1.5) : fmtTime((cs || 1) * 5)}</span></div>
                  <div className={`qvc-verdict ${i === 0 ? 'classical' : 'quantum'}`}>{verdict}{ratio && i === 2 ? ` (${ratio.toFixed(0)}x)` : ''}</div>
                </div>
              );
            })}
          </div>
          <div className="qvc-advantage">{qvc.advantage}</div>
        </div>

        {/* Verification card */}
        <div className="insight-card verify-card">
          <div className="insight-title">VALIDATION &amp; RELIABILITY</div>
          <p className="insight-body">{useCase.verificationSummary}</p>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
