import { useEffect, useState, useRef } from 'react';

interface Props {
  code: string;
  isGenerating: boolean;
  onAnimationComplete: () => void;
}

const CodeEditor: React.FC<Props> = ({ code, isGenerating, onAnimationComplete }) => {
  const [displayCode, setDisplayCode] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) { setDisplayCode(''); return; }
    let idx = 0;
    setDisplayCode('');
    const interval = setInterval(() => {
      idx += 20;
      if (idx >= code.length) {
        setDisplayCode(code);
        clearInterval(interval);
        onAnimationComplete();
      } else {
        setDisplayCode(code.substring(0, idx));
      }
    }, 10);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [displayCode]);

  const colorLine = (line: string) => {
    if (line.trimStart().startsWith('#')) return '#6a9955';
    if (line.trimStart().startsWith('import ') || line.trimStart().startsWith('from ')) return '#c586c0';
    if (line.trimStart().startsWith('class ')) return '#4ec9b0';
    if (line.trimStart().startsWith('def ')) return '#dcdcaa';
    if (line.trimStart().startsWith('return ')) return '#569cd6';
    if (/^\s*(if|elif|else|for|while|try|except|with)\b/.test(line)) return '#c586c0';
    return '#d4d4d4';
  };

  const lines = (displayCode || '').split('\n');

  return (
    <div className="code-editor" ref={containerRef}>
      {isGenerating && !displayCode ? (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--quantum-blue)' }}>
          <div className="anim-pulse" style={{ fontSize: '2rem', marginBottom: '8px' }}>&#9889;</div>
          AIがコードを生成中...
        </div>
      ) : (
        <pre className="code-pre" style={{ filter: 'blur(2.5px)' }}>
          {lines.map((l, i) => (
            <div key={i} className="code-line">
              <span className="line-number">{i + 1}</span>
              <span style={{ color: colorLine(l) }}>{l}</span>
            </div>
          ))}
        </pre>
      )}
    </div>
  );
};

export default CodeEditor;
