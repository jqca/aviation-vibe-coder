import { useState } from 'react';
import { Bot, Code2, Cpu, LayoutDashboard } from 'lucide-react';
import AIChat from './components/AIChat';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import { useCases } from './data/useCases';
import type { UseCase } from './data/useCases';
import './index.css';

function App() {
  const [activeUseCase, setActiveUseCase] = useState<UseCase>(useCases[0]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState<{role: 'user'|'assistant', content: string}[]>([]);

  const handleReset = () => {
    setHistory([]);
    setGeneratedCode('');
    setIsGenerated(false);
    setIsGenerating(false);
  };

  const handleGenerateCommand = (useCaseId: string) => {
    const matchedUseCase = useCases.find(uc => uc.id === useCaseId) || useCases[0];

    setHistory(prev => [
      ...prev,
      { role: 'user', content: matchedUseCase.prompt }
    ]);

    setIsGenerating(true);
    setIsGenerated(false);
    setGeneratedCode('');

    setTimeout(() => {
      setGeneratedCode(matchedUseCase.codeSnippet);
      setActiveUseCase(matchedUseCase);
      setIsGenerating(false);
      setHistory(prev => [
        ...prev,
        { role: 'assistant', content: "Quantum Execution Completed: 航空量子最適化エンジンの実行に成功しました。" }
      ]);
      // isGenerated は CodeEditor のアニメーション完了後に onAnimationComplete で true にする
    }, 2800);
  };

  return (
    <div className="app-wrapper">
    <div className="top-bar">
      <a
        href="https://company-dashboard.up.railway.app/expo"
        className="portal-btn"
      >
        <LayoutDashboard size={14} />
        ポータルサイトへ戻る
      </a>
    </div>
    <div className="app-container">
      <div className="pane glass-panel" style={{ flex: '0 0 400px' }}>
        <div className="pane-header">
          <Bot size={18} color="var(--quantum-green)" />
          <span>航空・空港 Vibe Coder</span>
        </div>
        <div className="pane-content">
          <AIChat onGenerate={handleGenerateCommand} onReset={handleReset} isGenerating={isGenerating} history={history} />
        </div>
      </div>

      <div className="pane glass-panel" style={{ flex: '1.2' }}>
        <div className="pane-header">
          <Code2 size={18} color="var(--quantum-blue)" />
          <span>quantum_aviation_engine.py</span>
        </div>
        <div className="pane-content">
          <CodeEditor
            code={generatedCode}
            isGenerating={isGenerating}
            onAnimationComplete={() => setIsGenerated(true)}
          />
        </div>
      </div>

      <div className="pane glass-panel" style={{ flex: '0 0 500px' }}>
        <div className="pane-header">
          <Cpu size={18} color="#eab308" />
          <span>ライブダッシュボード (Aviation Control Center)</span>
        </div>
        <div className="pane-content" style={{ padding: '16px' }}>
          {isGenerated ? (
            <LivePreview activeUseCase={activeUseCase} />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: '16px',
              opacity: 0.45
            }}>
              <Cpu size={48} color="#eab308" style={{ animation: isGenerating ? 'pulse 1.2s infinite' : 'none' }} />
              <p style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {isGenerating
                  ? 'Quantum tensors resolving…\nダッシュボードを構築中'
                  : 'ユースケースを選択して\n「Vibe Coding」を押してください'}
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
