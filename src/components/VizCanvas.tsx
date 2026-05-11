import React from 'react';

export type VizType =
  | 'flight' | 'gate' | 'maintenance' | 'crew' | 'cargo'
  | 'fuel' | 'airspace' | 'delay' | 'baggage' | 'congestion'
  | 'security' | 'rotation' | 'commercial' | 'noise' | 'energy'
  | 'weather' | 'mro' | 'pricing' | 'drone' | 'co2';

const VIZ_MAP: Record<string, VizType> = {
  'flight-schedule': 'flight', 'gate-assignment': 'gate', 'aircraft-maintenance': 'maintenance',
  'crew-scheduling': 'crew', 'cargo-loading': 'cargo', 'fuel-consumption': 'fuel',
  'airspace-management': 'airspace', 'delay-propagation': 'delay', 'baggage-routing': 'baggage',
  'airport-congestion': 'congestion', 'security-screening': 'security', 'aircraft-rotation': 'rotation',
  'airport-commercial': 'commercial', 'noise-impact': 'noise', 'airport-energy': 'energy',
  'weather-route': 'weather', 'mro-parts': 'mro', 'airline-pricing': 'pricing',
  'drone-airspace': 'drone', 'aviation-co2': 'co2', 'uam-traffic': 'drone',
};

export function getVizType(id: string): VizType {
  for (const [k, v] of Object.entries(VIZ_MAP)) { if (id.includes(k)) return v; }
  return 'flight';
}

export interface VizProps {
  running: boolean; optimized: boolean; progress: number;
  optLevel: number; selectedNode: string | null; onNodeClick: (n: string) => void;
}

const C1 = '#3B82F6', C2 = '#93C5FD', BG = '#0a1628', TX = '#f8f9fa', MU = '#8e9aaf';

/* ── 1. FlightViz ── */
const FlightViz: React.FC<VizProps> = ({ running, optimized, progress }) => {
  const planes = [
    { x: 60, y: 40, dest: 320, label: 'JL101' },
    { x: 80, y: 90, dest: 300, label: 'NH302' },
    { x: 50, y: 140, dest: 340, label: 'BC415' },
    { x: 70, y: 180, dest: 310, label: 'JL208' },
  ];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Flight Schedule Optimization</text>
    {planes.map((p, i) => {
      const cx = running ? p.x + (p.dest - p.x) * progress : optimized ? p.dest : p.x;
      return <g key={i}>
        <line x1={p.x} y1={p.y} x2={p.dest} y2={p.y} stroke={MU} strokeWidth="0.5" strokeDasharray="4,3" />
        <polygon points={`${cx},${p.y - 6} ${cx + 14},${p.y} ${cx},${p.y + 6}`} fill={optimized ? C1 : C2} opacity={0.9} />
        <text x={cx + 18} y={p.y + 4} fill={TX} fontSize="8">{p.label}</text>
      </g>;
    })}
    <rect x="350" y="30" width="40" height="170" rx="4" fill="none" stroke={MU} strokeWidth="0.5" />
    <text x="370" y="24" textAnchor="middle" fill={MU} fontSize="7">SLOT</text>
    {[0,1,2,3].map(i => <rect key={i} x="354" y={38 + i * 42} width="32" height="34" rx="2" fill={optimized ? C1 : MU} opacity={optimized ? 0.3 : 0.15} />)}
  </g>;
};

/* ── 2. GateViz ── */
const GateViz: React.FC<VizProps> = ({ optimized }) => {
  const gates = Array.from({ length: 8 }, (_, i) => ({ x: 30 + i * 46, y: 100 }));
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Gate Assignment</text>
    <rect x="20" y="50" width="360" height="8" rx="2" fill={MU} opacity={0.3} />
    {gates.map((g, i) => <g key={i}>
      <rect x={g.x} y={58} width="36" height="50" rx="3" fill={optimized ? C1 : MU} opacity={optimized ? 0.35 : 0.2} />
      <text x={g.x + 18} y={88} textAnchor="middle" fill={TX} fontSize="8">G{i + 1}</text>
      <circle cx={g.x + 18} cy={120} r={5} fill={optimized ? '#22c55e' : '#f59e0b'} opacity={0.8} />
    </g>)}
    <text x="200" y="150" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Conflict-free assignment achieved' : 'Assigning aircraft to gates…'}</text>
  </g>;
};

/* ── 3. MaintenanceViz ── */
const MaintenanceViz: React.FC<VizProps> = ({ optimized, progress, running }) => {
  const checks = ['A-Check', 'B-Check', 'C-Check', 'D-Check'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Maintenance Planning</text>
    {checks.map((c, i) => {
      const w = running ? 260 * progress : optimized ? 260 : 60;
      return <g key={i}>
        <text x="30" y={52 + i * 45} fill={TX} fontSize="9">{c}</text>
        <rect x="100" y={40 + i * 45} width="260" height="20" rx="3" fill={MU} opacity={0.15} />
        <rect x="100" y={40 + i * 45} width={w} height="20" rx="3" fill={optimized ? '#22c55e' : C1} opacity={0.6} />
      </g>;
    })}
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'AOG risk minimized' : 'Planning maintenance windows…'}</text>
  </g>;
};

/* ── 4. CrewViz ── */
const CrewViz: React.FC<VizProps> = ({ optimized }) => {
  const rows = 5;
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Crew Scheduling</text>
    {Array.from({ length: rows }, (_, r) => <g key={r}>
      <circle cx="40" cy={50 + r * 35} r="10" fill={C2} opacity={0.5} />
      <text x="60" y={54 + r * 35} fill={TX} fontSize="8">Crew {r + 1}</text>
      {Array.from({ length: 5 }, (_, c) => <rect key={c} x={120 + c * 50} y={40 + r * 35} width="42" height="18" rx="2" fill={optimized ? C1 : MU} opacity={optimized ? 0.4 : 0.15} />)}
    </g>)}
  </g>;
};

/* ── 5. CargoViz ── */
const CargoViz: React.FC<VizProps> = ({ optimized }) => {
  const boxes = Array.from({ length: 12 }, (_, i) => ({
    x: 40 + (i % 4) * 85, y: 50 + Math.floor(i / 4) * 55, w: 70, h: 40,
  }));
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Cargo Loading</text>
    {boxes.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={optimized ? C1 : MU} opacity={optimized ? 0.45 : 0.2} stroke={optimized ? C2 : MU} strokeWidth="0.5" />)}
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'CG balanced, payload maximized' : 'Optimizing cargo placement…'}</text>
  </g>;
};

/* ── 6. FuelViz ── */
const FuelViz: React.FC<VizProps> = ({ optimized, progress, running }) => {
  const pts = Array.from({ length: 20 }, (_, i) => {
    const x = 30 + i * 18;
    const base = 160 - Math.sin(i * 0.5) * 40 - (optimized ? 30 : 0);
    return `${x},${running ? 160 - (160 - base) * progress : base}`;
  }).join(' ');
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Fuel Consumption</text>
    <line x1="30" y1="190" x2="380" y2="190" stroke={MU} strokeWidth="0.5" />
    <line x1="30" y1="30" x2="30" y2="190" stroke={MU} strokeWidth="0.5" />
    <polyline points={pts} fill="none" stroke={optimized ? '#22c55e' : C1} strokeWidth="2" />
    <text x="200" y="208" textAnchor="middle" fill={MU} fontSize="7">Flight Phase →</text>
  </g>;
};

/* ── 7. AirspaceViz ── */
const AirspaceViz: React.FC<VizProps> = ({ optimized }) => {
  const sectors = [
    { cx: 120, cy: 90, r: 50 }, { cx: 200, cy: 70, r: 45 }, { cx: 280, cy: 100, r: 55 },
    { cx: 160, cy: 150, r: 40 }, { cx: 250, cy: 160, r: 48 },
  ];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Airspace Management</text>
    {sectors.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={optimized ? C1 : MU} opacity={optimized ? 0.2 : 0.1} stroke={optimized ? C2 : MU} strokeWidth="0.8" />)}
    {optimized && <polyline points="80,180 140,100 200,70 280,100 350,60" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2" />}
  </g>;
};

/* ── 8. DelayViz ── */
const DelayViz: React.FC<VizProps> = ({ optimized }) => {
  const nodes = [
    { x: 60, y: 60, l: 'HND' }, { x: 180, y: 40, l: 'NRT' }, { x: 300, y: 60, l: 'KIX' },
    { x: 120, y: 130, l: 'FUK' }, { x: 240, y: 140, l: 'CTS' }, { x: 340, y: 150, l: 'OKA' },
  ];
  const edges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4]];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Delay Propagation</text>
    {edges.map(([a, b], i) => <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={optimized ? C1 : '#ef4444'} strokeWidth="1" opacity={0.5} />)}
    {nodes.map((n, i) => <g key={i}>
      <circle cx={n.x} cy={n.y} r="16" fill={optimized ? C1 : '#ef4444'} opacity={optimized ? 0.4 : 0.3} />
      <text x={n.x} y={n.y + 4} textAnchor="middle" fill={TX} fontSize="8" fontWeight="bold">{n.l}</text>
    </g>)}
    <text x="200" y="190" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Cascade delays contained' : 'Analyzing delay propagation…'}</text>
  </g>;
};

/* ── 9. BaggageViz ── */
const BaggageViz: React.FC<VizProps> = ({ optimized, progress, running }) => {
  const belt = Array.from({ length: 10 }, (_, i) => ({ x: 30 + i * 36, y: 110 }));
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Baggage Routing</text>
    <rect x="20" y="100" width="360" height="30" rx="4" fill={MU} opacity={0.12} />
    {belt.map((b, i) => {
      const off = running ? (progress * 360 + i * 36) % 360 : optimized ? i * 36 : 0;
      return <rect key={i} x={20 + off} y={b.y - 5} width="24" height="20" rx="3" fill={optimized ? C1 : C2} opacity={0.5} />;
    })}
    <text x="200" y="160" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Mishandled bags ▼ 94%' : 'Routing bags through BHS…'}</text>
  </g>;
};

/* ── 10. CongestionViz ── */
const CongestionViz: React.FC<VizProps> = ({ optimized }) => {
  const bars = Array.from({ length: 12 }, (_, i) => ({
    x: 35 + i * 30, h: 30 + Math.random() * 100 * (optimized ? 0.5 : 1),
  }));
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Airport Congestion</text>
    <line x1="30" y1="190" x2="380" y2="190" stroke={MU} strokeWidth="0.5" />
    {bars.map((b, i) => <rect key={i} x={b.x} y={190 - b.h} width="22" height={b.h} rx="2" fill={optimized ? '#22c55e' : '#f59e0b'} opacity={0.6} />)}
    <text x="200" y="208" textAnchor="middle" fill={MU} fontSize="7">Terminal areas →</text>
  </g>;
};

/* ── 11. SecurityViz ── */
const SecurityViz: React.FC<VizProps> = ({ optimized }) => {
  const lanes = 6;
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Security Screening</text>
    {Array.from({ length: lanes }, (_, i) => <g key={i}>
      <rect x="50" y={40 + i * 28} width="300" height="20" rx="3" fill={MU} opacity={0.1} />
      <rect x="50" y={40 + i * 28} width={optimized ? 300 : 120 + Math.random() * 100} height="20" rx="3" fill={optimized ? '#22c55e' : '#f59e0b'} opacity={0.35} />
      <text x="40" y={54 + i * 28} textAnchor="end" fill={TX} fontSize="7">L{i + 1}</text>
    </g>)}
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Wait time ▼ 68%' : 'Balancing lane throughput…'}</text>
  </g>;
};

/* ── 12. RotationViz ── */
const RotationViz: React.FC<VizProps> = ({ optimized }) => {
  const acft = ['JA801A', 'JA302J', 'JA611F', 'JA45AN'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Aircraft Rotation</text>
    {acft.map((a, i) => <g key={i}>
      <text x="30" y={55 + i * 42} fill={TX} fontSize="8">{a}</text>
      {Array.from({ length: 6 }, (_, j) => <rect key={j} x={100 + j * 44} y={40 + i * 42} width="38" height="22" rx="2" fill={optimized ? C1 : MU} opacity={optimized ? 0.4 : 0.18} stroke={C2} strokeWidth="0.3" />)}
    </g>)}
  </g>;
};

/* ── 13. CommercialViz ── */
const CommercialViz: React.FC<VizProps> = ({ optimized }) => {
  const shops = ['Duty Free', 'Lounge', 'Restaurant', 'Retail', 'Café', 'Spa'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Commercial Revenue</text>
    {shops.map((s, i) => {
      const w = optimized ? 180 + i * 15 : 60 + Math.random() * 80;
      return <g key={i}>
        <text x="30" y={50 + i * 28} fill={TX} fontSize="8">{s}</text>
        <rect x="120" y={38 + i * 28} width={w} height="18" rx="2" fill={optimized ? C1 : MU} opacity={0.45} />
      </g>;
    })}
  </g>;
};

/* ── 14. NoiseViz ── */
const NoiseViz: React.FC<VizProps> = ({ optimized }) => {
  const rings = [30, 55, 80, 105];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Noise Impact</text>
    {rings.map((r, i) => <ellipse key={i} cx="200" cy="120" rx={r * 1.8} ry={r} fill="none" stroke={optimized ? '#22c55e' : '#ef4444'} strokeWidth="0.8" opacity={0.3 + i * 0.1} />)}
    <polygon points="200,105 208,125 192,125" fill={C1} opacity={0.8} />
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Noise contour ▼ 35%' : 'Modeling noise footprint…'}</text>
  </g>;
};

/* ── 15. EnergyViz ── */
const EnergyViz: React.FC<VizProps> = ({ optimized }) => {
  const items = ['Terminal', 'Runway', 'ATC', 'Hangar', 'Parking'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Airport Energy</text>
    {items.map((it, i) => {
      const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
      const cx = 200 + Math.cos(angle) * 70, cy = 110 + Math.sin(angle) * 60;
      return <g key={i}>
        <line x1="200" y1="110" x2={cx} y2={cy} stroke={MU} strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r="18" fill={optimized ? '#22c55e' : C1} opacity={0.3} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={TX} fontSize="7">{it}</text>
      </g>;
    })}
    <circle cx="200" cy="110" r="12" fill={C1} opacity={0.5} />
    <text x="200" y="114" textAnchor="middle" fill={TX} fontSize="7">Hub</text>
  </g>;
};

/* ── 16. WeatherViz ── */
const WeatherViz: React.FC<VizProps> = ({ optimized }) => {
  const waypoints = [
    { x: 40, y: 160 }, { x: 100, y: 130 }, { x: 160, y: 80 }, { x: 220, y: 60 },
    { x: 280, y: 90 }, { x: 340, y: 50 },
  ];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Weather Route Avoidance</text>
    <ellipse cx="180" cy="100" rx="60" ry="40" fill="#ef4444" opacity={0.15} />
    <text x="180" y="104" textAnchor="middle" fill="#ef4444" fontSize="8" opacity={0.7}>CB</text>
    <polyline points={waypoints.map(w => `${w.x},${w.y}`).join(' ')} fill="none" stroke={optimized ? '#22c55e' : C2} strokeWidth="1.5" strokeDasharray={optimized ? '0' : '4,3'} />
    {waypoints.map((w, i) => <circle key={i} cx={w.x} cy={w.y} r="4" fill={C1} opacity={0.7} />)}
  </g>;
};

/* ── 17. MroViz ── */
const MroViz: React.FC<VizProps> = ({ optimized }) => {
  const parts = ['Engine', 'APU', 'Landing Gear', 'Avionics', 'Hydraulics', 'Pneumatics'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">MRO Parts Inventory</text>
    {parts.map((p, i) => <g key={i}>
      <text x="30" y={48 + i * 28} fill={TX} fontSize="8">{p}</text>
      <rect x="130" y={36 + i * 28} width="230" height="18" rx="2" fill={MU} opacity={0.1} />
      <rect x="130" y={36 + i * 28} width={optimized ? 210 : 80 + Math.random() * 60} height="18" rx="2" fill={optimized ? '#22c55e' : '#f59e0b'} opacity={0.4} />
    </g>)}
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Fill rate 98.7%' : 'Optimizing reorder points…'}</text>
  </g>;
};

/* ── 18. PricingViz ── */
const PricingViz: React.FC<VizProps> = ({ optimized }) => {
  const cols = 8;
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Dynamic Pricing</text>
    <line x1="40" y1="190" x2="380" y2="190" stroke={MU} strokeWidth="0.5" />
    <line x1="40" y1="30" x2="40" y2="190" stroke={MU} strokeWidth="0.5" />
    {Array.from({ length: cols }, (_, i) => {
      const h1 = 40 + Math.random() * 60;
      const h2 = optimized ? h1 * 1.3 : h1;
      return <g key={i}>
        <rect x={55 + i * 40} y={190 - h1} width="14" height={h1} rx="2" fill={MU} opacity={0.3} />
        <rect x={71 + i * 40} y={190 - h2} width="14" height={h2} rx="2" fill={optimized ? '#22c55e' : C1} opacity={0.5} />
      </g>;
    })}
    <text x="200" y="208" textAnchor="middle" fill={MU} fontSize="7">Booking class →</text>
  </g>;
};

/* ── 19. DroneViz ── */
const DroneViz: React.FC<VizProps> = ({ optimized, progress, running }) => {
  const drones = [
    { sx: 60, sy: 40, ex: 340, ey: 50 },
    { sx: 80, sy: 100, ex: 300, ey: 90 },
    { sx: 50, sy: 160, ex: 350, ey: 170 },
  ];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Drone / UAM Traffic</text>
    {/* corridors */}
    {drones.map((d, i) => <line key={i} x1={d.sx} y1={d.sy} x2={d.ex} y2={d.ey} stroke={MU} strokeWidth="0.5" strokeDasharray="6,3" />)}
    {drones.map((d, i) => {
      const t = running ? progress : optimized ? 1 : 0;
      const cx = d.sx + (d.ex - d.sx) * t, cy = d.sy + (d.ey - d.sy) * t;
      return <g key={`d${i}`}>
        <circle cx={cx} cy={cy} r="8" fill={C1} opacity={0.6} />
        <text x={cx} y={cy + 3} textAnchor="middle" fill={TX} fontSize="6">D{i + 1}</text>
      </g>;
    })}
    <text x="200" y="200" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'Separation assured' : 'Deconflicting corridors…'}</text>
  </g>;
};

/* ── 20. Co2Viz ── */
const Co2Viz: React.FC<VizProps> = ({ optimized }) => {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  return <g>
    <text x="200" y="16" textAnchor="middle" fill={TX} fontSize="10" fontWeight="bold">Aviation CO₂ Reduction</text>
    <line x1="30" y1="180" x2="380" y2="180" stroke={MU} strokeWidth="0.5" />
    {months.map((m, i) => {
      const h = 60 + Math.sin(i * 0.8) * 30;
      const hOpt = h * 0.6;
      return <g key={i}>
        <rect x={35 + i * 29} y={180 - h} width="12" height={h} rx="1" fill={MU} opacity={0.3} />
        {optimized && <rect x={49 + i * 29} y={180 - hOpt} width="12" height={hOpt} rx="1" fill="#22c55e" opacity={0.5} />}
        <text x={45 + i * 29} y="194" textAnchor="middle" fill={MU} fontSize="6">{m}</text>
      </g>;
    })}
    <text x="200" y="210" textAnchor="middle" fill={MU} fontSize="8">{optimized ? 'CO₂ ▼ 28% YoY' : 'Calculating carbon baseline…'}</text>
  </g>;
};

const VIZ_COMPONENTS: Record<VizType, React.FC<VizProps>> = {
  flight: FlightViz, gate: GateViz, maintenance: MaintenanceViz, crew: CrewViz,
  cargo: CargoViz, fuel: FuelViz, airspace: AirspaceViz, delay: DelayViz,
  baggage: BaggageViz, congestion: CongestionViz, security: SecurityViz,
  rotation: RotationViz, commercial: CommercialViz, noise: NoiseViz,
  energy: EnergyViz, weather: WeatherViz, mro: MroViz, pricing: PricingViz,
  drone: DroneViz, co2: Co2Viz,
};

interface CanvasProps { vizType: VizType; running: boolean; optimized: boolean; progress: number; optLevel: number; selectedNode: string | null; onNodeClick: (n: string) => void; }

const VizCanvas: React.FC<CanvasProps> = ({ vizType, ...rest }) => {
  const Comp = VIZ_COMPONENTS[vizType] || FlightViz;
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" style={{ background: BG, borderRadius: 8 }}>
      <Comp {...rest} />
      {rest.running && (
        <rect x="0" y="216" width={400 * rest.progress} height="4" fill={C1} rx="2" />
      )}
    </svg>
  );
};

export default VizCanvas;
