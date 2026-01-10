import React from 'react';

interface SplitViewProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftWidth?: string; // e.g., "50%", "300px"
  gap?: string; // e.g., "20px"
}

export function SplitView({ leftPanel, rightPanel, leftWidth = '50%', gap = '20px' }: SplitViewProps) {
  return (
    <div className="split-view-container" style={{ gridTemplateColumns: `${leftWidth} 1fr`, gap: gap }}>
      <div className="split-view-left">
        {leftPanel}
      </div>
      <div className="split-view-right">
        {rightPanel}
      </div>
    </div>
  );
}