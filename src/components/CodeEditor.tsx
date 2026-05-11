import { useEffect, useState, useRef } from 'react';

interface Props {
  code: string;
  isGenerating: boolean;
  onAnimationComplete: () => void;
}

const CodeEditor: React.FC<Props> = ({ code, isGenerating, onAnimationComplete }) => {
  const [displayCode, setDisplayCode] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isGenerating || !code) return;
    setDisplayCode('');
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 20;
      if (idx >= code.length) {
        idx = code.length;
        clearInterval(intervalRef.current!);
        onAnimationComplete();
      }
      setDisplayCode(code.substring(0, idx));
    }, 10);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [code, isGenerating]);

  const colorLine = (line: string, _i: number) => {
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
    <div className="code-editor">
      <pre className="code-pre" style={{ filter: 'blur(2.5px)' }}>
        {lines.map((l, i) => (
          <div key={i} className="code-line">
            <span className="line-number">{i + 1}</span>
            <span style={{ color: colorLine(l, i) }}>{l}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeEditor;
