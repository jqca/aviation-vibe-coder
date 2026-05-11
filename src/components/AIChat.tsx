import React, { useState } from 'react';
import { Send, RotateCcw, Loader2 } from 'lucide-react';
import { useCases } from '../data/useCases';
import type { UseCase } from '../data/useCases';

interface Props {
  onGenerate: (useCaseId: string) => void;
  onReset: () => void;
  isGenerating: boolean;
  history: UseCase[];
}

const AIChat: React.FC<Props> = ({ onGenerate, onReset, isGenerating, history: _history }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (uc: UseCase) => {
    setSelectedId(uc.id);
    setPrompt(uc.prompt);
    // track
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: 'aviation', usecase_id: uc.id, usecase_title: uc.title }),
    }).catch(() => {});
  };

  const handleSubmit = () => {
    if (!selectedId || isGenerating) return;
    onGenerate(selectedId);
  };

  const handleBack = () => {
    setSelectedId(null);
    setPrompt('');
    onReset();
  };

  return (
    <div className="ai-chat">
      <div className="chat-welcome">
        <strong>航空・空港 Quantum Copilot へようこそ</strong>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>ユースケースを選択し、量子最適化コードを生成します。</p>
      </div>

      {selectedId && (
        <button className="back-btn" onClick={handleBack}><RotateCcw size={14} /> 一覧に戻る</button>
      )}

      <div className="usecase-list">
        {useCases.map(uc => (
          <div key={uc.id} className={`usecase-item${selectedId === uc.id ? ' selected' : ''}`} onClick={() => handleSelect(uc)}>
            <div className="usecase-title">{uc.title}</div>
            <div className="usecase-desc">{uc.description}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <textarea className="chat-textarea" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="プロンプトを入力..." rows={3} readOnly />
        <button className="generate-btn" onClick={handleSubmit} disabled={!selectedId || isGenerating}>
          {isGenerating ? <><Loader2 size={14} className="spin" /> 生成中...</> : <><Send size={14} /> Vibe Coding</>}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
