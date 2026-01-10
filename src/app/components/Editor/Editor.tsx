import React from 'react';
import '../../styles/Editor.css';

interface EditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  return (
    <textarea
      className="editor-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    ></textarea>
  );
}