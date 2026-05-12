import { useState } from 'react';
import { Plane, Code2, Cpu, LayoutDashboard } from 'lucide-react';
import './index.css';
import { useCases } from './data/useCases';
import type { UseCase } from './data/useCases';
import AIChat from './components/AIChat';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';

function App() {
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState<UseCase[]>([]);

  const handleGenerateCommand = (useCaseId: string) => {
    const uc = useCases.find(u => u.id === useCaseId);
    if (!uc) return;
    setActiveUseCase(uc);
    setIsGenerating(true);
    setIsGenerated(false);
    setGeneratedCode(uc.codeSnippet);
    setHistory(prev => [uc, ...prev.filter(h => h.id !== uc.id)].slice(0, 10));
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2800);
  };

  const handleReset = () => {
    setActiveUseCase(null);
    setGeneratedCode('');
    setIsGenerating(false);
    setIsGenerated(false);
  };

  return (
    <div className="app-wrapper">
      {/* Top bar */}
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Plane size={20} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>航空・空港 Quantum Vibe Coder</span>
        </div>
          <LayoutDashboard size={14} /> 40業界ポータルへ
        </a>
      </div>

      {/* 3-pane layout */}
      <div className="app-container">
        {/* Left pane — AI Chat */}
        <div className="pane" style={{ width: 400 }}>
          <div className="pane-header"><Plane size={16} /> 航空 Vibe Coder</div>
          <div className="pane-content">
            <AIChat onGenerate={handleGenerateCommand} onReset={handleReset} isGenerating={isGenerating} history={history} />
          </div>
        </div>

        {/* Center pane — Code Editor */}
        <div className="pane" style={{ flex: 1.2 }}>
          <div className="pane-header"><Code2 size={16} /> quantum_aviation_engine.py</div>
          <div className="pane-content">
            <CodeEditor code={generatedCode} isGenerating={isGenerating} onAnimationComplete={() => {}} />
          </div>
        </div>

        {/* Right pane — Live Preview */}
        <div className="pane" style={{ width: 500 }}>
          <div className="pane-header"><Cpu size={16} /> ライブダッシュボード (Aviation Control Center)</div>
          <div className="pane-content">
            {isGenerated && activeUseCase ? (
              <LivePreview useCase={activeUseCase} />
            ) : (
              <div className="preview-placeholder">
                <Cpu size={36} style={{ opacity: 0.3 }} />
                <p style={{ opacity: 0.5, marginTop: 12, fontSize: 13 }}>
                  {isGenerating ? 'Quantum tensors resolving…' : 'ユースケースを選択してVibe Codingを押してください'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
