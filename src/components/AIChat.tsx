import React, { useState } from 'react';
import { Sparkles, TerminalSquare, RotateCcw } from 'lucide-react';
import { useCases } from '../data/useCases';

interface Props {
  onGenerate: (useCaseId: string) => void;
  onReset: () => void;
  isGenerating: boolean;
  history: {role: 'user'|'assistant', content: string}[];
}

const AIChat: React.FC<Props> = ({ onGenerate, onReset, isGenerating, history }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleReset = () => {
    setPrompt('');
    setSelectedId(null);
    onReset();
  };

  const handleUseCaseClick = (id: string, ucPrompt: string) => {
    setSelectedId(id);
    setPrompt(ucPrompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const matched = useCases.find(uc => uc.id === selectedId || uc.prompt === prompt.trim());
    onGenerate(matched ? matched.id : useCases[0].id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: '1', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.length > 0 && (
          <button
            onClick={handleReset}
            disabled={isGenerating}
            className="back-to-list-btn"
          >
            <RotateCcw size={14} />
            ユースケース一覧に戻る
          </button>
        )}

        {history.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.7, marginTop: '20px' }}>
            <Sparkles size={32} style={{ color: 'var(--quantum-green)', marginBottom: '16px' }} />
            <p style={{ marginBottom: '16px' }}>航空・空港 Quantum Copilot へようこそ。<br/>以下のユースケースから実装を選択してください：</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.length === 0 && useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => {
                handleUseCaseClick(uc.id, uc.prompt);
                fetch('/api/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ app_id: 'aviation', usecase_id: uc.id, usecase_title: uc.title })
                }).catch(() => {});
              }}
              disabled={isGenerating}
              style={{
                textAlign: 'left',
                padding: '12px',
                background: selectedId === uc.id ? 'rgba(0, 225, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedId === uc.id ? 'var(--quantum-blue)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                color: 'var(--text-main)',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isGenerating ? 0.5 : 1
              }}
              className="use-case-btn"
            >
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: selectedId === uc.id ? 'var(--quantum-green)' : '#eab308', marginBottom: '4px' }}>{uc.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{uc.description}</div>
            </button>
          ))}
        </div>

        {history.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${msg.role === 'user' ? 'var(--quantum-green)' : 'var(--border-color)'}`,
            padding: '12px',
            borderRadius: '12px',
            maxWidth: '90%',
            fontSize: '0.85rem',
            lineHeight: '1.5'
          }}>
            {msg.content}
          </div>
        ))}

        {isGenerating && (
          <div style={{ alignSelf: 'flex-start', padding: '12px', color: 'var(--quantum-blue)', fontStyle: 'italic', fontSize: '0.85rem' }}>
            <span className="anim-pulse">Quantum tensors resolving...</span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setSelectedId(null); }}
            placeholder="ユースケースを選択するか、直接プロンプトを入力..."
            rows={3}
            disabled={isGenerating}
            style={{
              resize: 'none',
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${prompt ? 'var(--quantum-blue)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={isGenerating || !prompt.trim()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isGenerating ? (
              <span className="anim-pulse">生成中...</span>
            ) : (
              <>
                <TerminalSquare size={16} />
                Vibe Coding
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
