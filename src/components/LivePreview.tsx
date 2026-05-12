import React, { useState, useCallback, useEffect } from 'react';
import type { UseCase } from '../data/useCases';
import { TrendingUp, TrendingDown, Truck, Zap, ShieldCheck, Target, Play, RotateCcw } from 'lucide-react';
import VizCanvas, { getVizType } from './VizCanvas';

const parseToSeconds = (timeStr: string): number | null => {
  if (!timeStr) return null;
  if (/即時|リアルタイム/.test(timeStr)) return 0.05;
  if (/日次|翌朝/.test(timeStr)) return 86400;
  const weekMatch = timeStr.match(/([\d.]+)\s*週間/);
  if (weekMatch) return parseFloat(weekMatch[1]) * 7 * 86400;
  const monthMatch = timeStr.match(/([\d.]+)\s*[ヶヵ]月/);
  if (monthMatch) return parseFloat(monthMatch[1]) * 30 * 86400;
  const numMatch = timeStr.match(/([\d.]+)/);
  if (!numMatch) return null;
  const num = parseFloat(numMatch[1]);
  if (timeStr.includes('ms')) return num / 1000;
  if (timeStr.includes('秒')) return num;
  if (timeStr.includes('分')) return num * 60;
  if (timeStr.includes('時間')) return num * 3600;
  if (timeStr.includes('日')) return num * 86400;
  return num;
};

const fmtTime = (sec: number): string => {
  if (sec < 0.001) return `${(sec * 1_000_000).toFixed(0)}μs`;
  if (sec < 1)     return `${(sec * 1000).toFixed(0)}ms`;
  if (sec < 60)    return `${sec < 10 ? sec.toFixed(2) : sec.toFixed(1)}秒`;
  if (sec < 3600)  return `${(sec / 60).toFixed(1)}分`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)}時間`;
  if (sec < 86400 * 30) return `${(sec / 86400).toFixed(1)}日`;
  return `${(sec / (86400 * 30)).toFixed(1)}ヶ月`;
};

interface Props {
  activeUseCase: UseCase;
}

const LivePreview: React.FC<Props> = ({ activeUseCase }) => {
  const [optimizationLevel, setOptimizationLevel] = useState(50);
  const [dataSize, setDataSize] = useState(5000);
  const [isRunning, setIsRunning] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [useQuantum, setUseQuantum] = useState(true);
  const [progress, setProgress] = useState(0);

  const vizType = getVizType(activeUseCase.id);
  const isActionMode = activeUseCase.id.includes('gate') || activeUseCase.id.includes('crew') || activeUseCase.id.includes('rotation') || activeUseCase.id.includes('baggage') || activeUseCase.id.includes('security');

  useEffect(() => {
    setIsOptimized(false);
    setIsRunning(false);
    setSelectedNode(null);
    setProgress(0);
    setOptimizationLevel(50);
    setDataSize(5000);
  }, [activeUseCase.id]);

  const statusClass = isActionMode || isOptimized ? 'action-mode' : '';

  const getTrendIcon = (trend: string, active: boolean) => {
    const color = active ? "#eab308" : "#2dd4bf";
    if (trend === 'up') return <TrendingUp size={20} color={color} />;
    if (trend === 'down') return <TrendingDown size={20} color={color} />;
    return <Truck size={20} color={color} />;
  };

  const handleRunSimulation = useCallback(() => {
    setIsRunning(true);
    setIsOptimized(false);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsRunning(false);
          setIsOptimized(true);
          setProgress(0);
        }, 300);
      }
      setProgress(Math.min(p, 100));
    }, 120);
  }, []);

  const handleReset = useCallback(() => {
    setIsOptimized(false);
    setIsRunning(false);
    setProgress(0);
    setOptimizationLevel(50);
    setDataSize(5000);
    setSelectedNode(null);
    setUseQuantum(true);
  }, []);

  const getAdjustedValue = (value: string, trend: 'up' | 'down' | 'neutral') => {
    if (!isOptimized) return value;
    const match = value.match(/([\d.]+)/);
    if (!match) return value;
    const num = parseFloat(match[1]);
    const qBoost = useQuantum ? 1.15 : 1.0;
    const factor = (optimizationLevel / 100) * qBoost;
    const adjusted = trend === 'down'
      ? num * (1 - factor * 0.25)
      : num * (1 + factor * 0.3);
    const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
    return value.replace(match[1], adjusted.toFixed(decimals));
  };

  const vizLabels: Record<string, { idle: string; running: string; done: string }> = {
    flight:      { idle: 'フライトスケジュール待機中',     running: '量子最適化実行中',          done: '✓ スケジュール最適化完了' },
    gate:        { idle: 'ゲート割当待機中',               running: 'ゲート配置最適化中',        done: '✓ 衝突ゼロ割当達成' },
    maintenance: { idle: '整備計画待機中',                 running: '整備ウィンドウ最適化中',    done: '✓ AOGリスク最小化完了' },
    crew:        { idle: 'クルー割当待機中',               running: 'ペアリング最適化中',        done: '✓ クルー最適配置完了' },
    cargo:       { idle: '貨物配置待機中',                 running: '重心バランス最適化中',      done: '✓ 積載率最大化完了' },
    fuel:        { idle: '燃費予測待機中',                 running: '燃料消費モデル実行中',      done: '✓ 燃費予測モデル完成' },
    airspace:    { idle: '空域管理待機中',                 running: 'セクター最適化中',          done: '✓ 空域衝突ゼロ達成' },
    delay:       { idle: '遅延分析待機中',                 running: '遅延伝播シミュレーション中', done: '✓ 遅延波及抑制完了' },
    baggage:     { idle: '手荷物追跡待機中',               running: 'BHSルーティング最適化中',   done: '✓ ロストバゲージ▼94%' },
    congestion:  { idle: '混雑分析待機中',                 running: 'ターミナル人流最適化中',    done: '✓ 混雑緩和達成' },
    security:    { idle: '保安検査待機中',                 running: 'レーン配分最適化中',        done: '✓ 待ち時間▼68%' },
    rotation:    { idle: '機材ローテーション待機中',       running: '機材回し最適化中',          done: '✓ 稼働率最大化完了' },
    commercial:  { idle: '商業収益分析待機中',             running: 'テナント配置最適化中',      done: '✓ 非航空収入▲22%' },
    noise:       { idle: '騒音評価待機中',                 running: '騒音コンター計算中',        done: '✓ 騒音面積▼35%' },
    energy:      { idle: 'エネルギー分析待機中',           running: '空港電力最適化中',          done: '✓ エネルギー▼31%' },
    weather:     { idle: '気象回避待機中',                 running: '代替ルート計算中',          done: '✓ 最適迂回ルート確定' },
    mro:         { idle: 'MRO在庫待機中',                  running: '部品在庫最適化中',          done: '✓ 充足率98.7%' },
    pricing:     { idle: '運賃分析待機中',                 running: 'ダイナミックプライシング最適化中', done: '✓ 収益▲18%' },
    drone:       { idle: 'ドローン空域待機中',             running: 'UAM回廊デコンフリクト中',   done: '✓ 安全間隔確保完了' },
    co2:         { idle: 'CO₂分析待機中',                  running: 'カーボン削減シナリオ計算中', done: '✓ CO₂▼28% YoY' },
  };

  const getVizLabel = () => {
    const labels = vizLabels[vizType] || vizLabels.flight;
    if (isRunning) return `${labels.running} ${Math.round(progress)}%`;
    if (isOptimized) return `${labels.done} (${useQuantum ? '量子' : '古典'})`;
    return labels.idle;
  };

  return (
    <div className="preview-container">
      {/* ビジュアライゼーション */}
      <div className={`visualization-box ${statusClass} ${isRunning ? 'viz-running' : ''}`}>
        <VizCanvas
          vizType={vizType}
          running={isRunning}
          optimized={isOptimized}
          progress={progress}
          optLevel={optimizationLevel}
          selectedNode={selectedNode}
          onNodeClick={(n) => setSelectedNode(selectedNode === n ? null : n)}
        />

        {isRunning && (
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className={`viz-overlay ${statusClass}`}>{getVizLabel()}</div>
      </div>

      {/* コントロールパネル */}
      <div className="control-panel">
        <div className="control-sliders">
          <div className="control-group">
            <label className="control-label">
              最適化レベル
              <span className="control-value">{optimizationLevel}%</span>
            </label>
            <input
              type="range" min="10" max="100" value={optimizationLevel}
              onChange={(e) => { setOptimizationLevel(Number(e.target.value)); setIsOptimized(false); }}
              className="control-slider"
              disabled={isRunning}
            />
          </div>
          <div className="control-group">
            <label className="control-label">
              データ件数
              <span className="control-value">{dataSize.toLocaleString()}件</span>
            </label>
            <input
              type="range" min="1000" max="10000" step="500" value={dataSize}
              onChange={(e) => { setDataSize(Number(e.target.value)); setIsOptimized(false); }}
              className="control-slider"
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="control-actions">
          <div className="toggle-group">
            <button
              className={`toggle-btn ${useQuantum ? 'active' : ''}`}
              onClick={() => { setUseQuantum(true); setIsOptimized(false); }}
              disabled={isRunning}
            >
              量子
            </button>
            <button
              className={`toggle-btn ${!useQuantum ? 'active' : ''}`}
              onClick={() => { setUseQuantum(false); setIsOptimized(false); }}
              disabled={isRunning}
            >
              古典
            </button>
          </div>

          <button
            className={`run-btn ${isRunning ? 'running' : ''}`}
            onClick={handleRunSimulation}
            disabled={isRunning}
          >
            <Play size={13} />
            {isRunning ? '実行中...' : 'シミュレーション実行'}
          </button>

          <button className="reset-btn" onClick={handleReset} disabled={isRunning}>
            <RotateCcw size={13} />
            リセット
          </button>
        </div>
      </div>

      {/* KPIメトリクス */}
      <div className="metrics-grid">
        {activeUseCase.metrics.map((m, idx) => (
          <div key={idx} className={`metric-card ${statusClass} ${isOptimized ? 'metric-optimized' : ''}`}>
            <div>
              <div className="metric-label">{m.label}</div>
              <div className={`metric-value ${isOptimized ? 'metric-value-updated' : ''}`}>
                {getAdjustedValue(m.value, m.trend)}
              </div>
              {isOptimized && <div className="metric-badge">最適化済</div>}
            </div>
            <div>{getTrendIcon(m.trend, !!(isActionMode || isOptimized))}</div>
          </div>
        ))}
      </div>

      {/* インサイトパネル */}
      <div className="insights-panel">
        <div className={`insight-card impact-card ${statusClass}`}>
          <div className="card-header">
            <Target size={16} className="insight-icon" />
            <span>経営インパクト (Business Impact)</span>
          </div>
          <div className="card-body impact-text">{activeUseCase.businessImpact}</div>
        </div>

        <div className={`insight-card qvc-card ${statusClass}`}>
          <div className="card-header">
            <Zap size={16} className="insight-icon" />
            <span>量子 vs 古典 ― 規模別比較</span>
          </div>
          <div className="card-body">
            {(() => {
              const cSec = parseToSeconds(activeUseCase.quantumVsClassical.classicalTime);
              const qSec = parseToSeconds(activeUseCase.quantumVsClassical.quantumTime);
              const scales = [
                {
                  label: '小規模',
                  sublabel: '〜1,000件',
                  cMult: 0.04,
                  qMult: 0.18,
                  classicalComment: '古典計算でも許容範囲内',
                  quantumComment: '量子優位性は限定的・コスト対効果を要検討',
                  verdict: '古典で対応可能',
                  verdictClass: 'verdict-neutral',
                },
                {
                  label: '中規模',
                  sublabel: '1,000〜10,000件',
                  cMult: 1.0,
                  qMult: 1.0,
                  classicalComment: '処理時間が長くなり業務効率への影響が顕在化',
                  quantumComment: '量子優位性が明確に現れ始める規模',
                  verdict: '量子優位性が顕在化',
                  verdictClass: 'verdict-quantum',
                },
                {
                  label: '大規模',
                  sublabel: '10,000件超',
                  cMult: 16.0,
                  qMult: 3.5,
                  classicalComment: '実用的な時間内での処理はほぼ不可能',
                  quantumComment: '量子処理が事実上の必須要件',
                  verdict: '量子処理が必須',
                  verdictClass: 'verdict-critical',
                },
              ];
              return (
                <div className="qvc-scales">
                  {scales.map((s) => {
                    const cTime = cSec != null ? fmtTime(cSec * s.cMult) : activeUseCase.quantumVsClassical.classicalTime;
                    const qTime = qSec != null ? fmtTime(qSec * s.qMult) : activeUseCase.quantumVsClassical.quantumTime;
                    const ratio = (cSec != null && qSec != null && qSec * s.qMult > 0)
                      ? Math.round((cSec * s.cMult) / (qSec * s.qMult))
                      : null;
                    return (
                      <div key={s.label} className="qvc-scale-block">
                        <div className="qvc-scale-header">
                          <span className="qvc-scale-label">{s.label}</span>
                          <span className="qvc-scale-sublabel">{s.sublabel}</span>
                          <span className={`qvc-verdict ${s.verdictClass}`}>{s.verdict}</span>
                        </div>
                        <div className="qvc-scale-rows">
                          <div className="qvc-scale-row">
                            <span className="qvc-scale-type classical-type">古典</span>
                            <span className="qvc-time classical-time">{cTime}</span>
                            <span className="qvc-scale-comment">{s.classicalComment}</span>
                          </div>
                          <div className="qvc-scale-row">
                            <span className="qvc-scale-type quantum-type">量子</span>
                            <span className="qvc-time quantum-time">{qTime}</span>
                            <span className="qvc-scale-comment">{s.quantumComment}</span>
                          </div>
                          {ratio != null && ratio > 1 && (
                            <div className="qvc-speedup">
                              量子が <strong>{ratio.toLocaleString()}倍</strong> 高速
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="advantage-text" style={{ marginTop: '8px' }}>
                    {activeUseCase.quantumVsClassical.advantage}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className={`insight-card verify-card ${statusClass}`}>
          <div className="card-header">
            <ShieldCheck size={16} className="insight-icon" />
            <span>検証・信頼性サマリー (Safety & Compliance)</span>
          </div>
          <div className="card-body verify-text">{activeUseCase.verificationSummary}</div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
