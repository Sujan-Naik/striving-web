// components/CodeActions.tsx
import { useState } from 'react';
import { CodeAction, CodeActionRequest } from '@/types/codeActions';

interface CodeActionsProps {
  actions: CodeAction[];
  onApprove: (actions: CodeAction[]) => void;
  onReject: () => void;
}

export default function CodeActions({ actions, onApprove, onReject }: CodeActionsProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>(
    actions.map(a => a.id)
  );

  const toggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleApprove = () => {
    const approved = actions.filter(a => selectedActions.includes(a.id));
    onApprove(approved);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h3>Proposed Changes</h3>
      {actions.map(action => (
        <div key={action.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #eee' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedActions.includes(action.id)}
              onChange={() => toggleAction(action.id)}
            />
            <strong>{action.type.toUpperCase()}</strong>: {action.path}
          </label>
          <p>{action.message}</p>
          {action.content && (
            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
              {action.content.substring(0, 200)}...
            </pre>
          )}
        </div>
      ))}

      <div style={{ marginTop: '15px' }}>
        <button onClick={handleApprove} disabled={selectedActions.length === 0}>
          Approve & Commit ({selectedActions.length})
        </button>
        <button onClick={onReject} style={{ marginLeft: '10px' }}>
          Reject All
        </button>
      </div>
    </div>
  );
}