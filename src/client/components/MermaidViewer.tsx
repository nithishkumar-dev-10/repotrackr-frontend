import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });

    let isMounted = true;
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
          setHasError(false);
        }
      } catch (err) {
        console.warn('Failed to render Mermaid chart:', err);
        if (isMounted) setHasError(true);
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return (
      <div className="p-4 rounded-xl bg-[#F6F7FB] border border-[#E4E7EF] font-mono text-xs text-[#5B6478] overflow-x-auto whitespace-pre">
        {chart}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto p-4 bg-white rounded-xl border border-[#E4E7EF] flex justify-center items-center"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
