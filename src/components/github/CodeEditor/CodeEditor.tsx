// components/github/CodeEditor/CodeEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { CodeAction } from "@/types/codeActions";

interface CodeActionsProps {
  actions: CodeAction[];
  onApprove: (actions: CodeAction[]) => void;
  onReject: () => void;
}

function CodeActions({ actions, onApprove, onReject }: CodeActionsProps) {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: '#f5f5f5' }}>
      <h4>Pending Changes</h4>
      {actions.map(action => (
        <div key={action.id} style={{ marginBottom: '5px' }}>
          {action.type} {action.path}: {action.message}
        </div>
      ))}
      <button onClick={() => onApprove(actions)}>Approve All</button>
      <button onClick={onReject} style={{ marginLeft: '10px' }}>Reject</button>
    </div>
  );
}

interface CodeEditorProps {
  owner: string;
  repo: string;
  initialPath?: string;
}

export default function CodeEditor({ owner, repo, initialPath = '' }: CodeEditorProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [contents, setContents] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [isLoading, setIsLoading] = useState(false);

  // Add to CodeEditor component
  const [pendingActions, setPendingActions] = useState<CodeAction[]>([]);
  const [showActions, setShowActions] = useState(false);
// Add new state for file selection
const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
const [showFileSelector, setShowFileSelector] = useState(false);
const [allRepoFiles, setAllRepoFiles] = useState<Array<{path: string, content: string, type: string}>>([]);
const [pendingPrompt, setPendingPrompt] = useState<string>('');

// Update the requestLLMChanges function
const requestLLMChanges = async (prompt: string) => {
  setPendingPrompt(prompt);

  // Get all files and show selector
  const codebaseFiles = await getAllRepositoryFiles();
  setAllRepoFiles(codebaseFiles);
  setShowFileSelector(true);
};

const sendToLLM = async () => {
  const selectedFileData = allRepoFiles.filter(file => selectedFiles.has(file.path));

  const response = await fetch('/api/bedrock/code-actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: pendingPrompt,
      owner,
      repo,
      branch: currentBranch,
      codebase: selectedFileData
    })
  });

  const result = await response.json();

  if (!result.actions || !Array.isArray(result.actions)) {
    console.error('Invalid response:', result);
    alert('Failed to get code actions from LLM');
    return;
  }

  const actions = result.actions.map((action: any, index: number) => ({
    ...action,
    id: `${Date.now()}-${index}`,
    status: 'pending'
  }));

  setPendingActions(actions);
  setShowActions(true);
  setShowFileSelector(false);
  setSelectedFiles(new Set());
};

// Add FileSelector component before CodeActions
function FileSelector({
  files,
  selectedFiles,
  onToggleFile,
  onSelectAll,
  onDeselectAll,
  onSend,
  onCancel
}: {
  files: Array<{path: string, content: string, type: string}>;
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSend: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
      <h4>Select files to send to LLM</h4>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={onSelectAll}>Select All</button>
        <button onClick={onDeselectAll} style={{ marginLeft: '5px' }}>Deselect All</button>
        <span style={{ marginLeft: '10px' }}>{selectedFiles.size} files selected</span>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
        {files.map(file => (
          <div key={file.path} style={{ marginBottom: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={selectedFiles.has(file.path)}
                onChange={() => onToggleFile(file.path)}
              />
              <span style={{ marginLeft: '5px' }}>{file.path}</span>
            </label>
          </div>
        ))}
      </div>
      <button onClick={onSend}>
        Send to LLM
      </button>
      <button onClick={onCancel} style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </div>
  );
}
  // New function to recursively get all files
  const getAllRepositoryFiles = async (path: string = ''): Promise<Array<{path: string, content: string, type: string}>> => {
    const files: Array<{path: string, content: string, type: string}> = [];

    try {

      const response = await fetch(`/api/github/contents?owner=${owner}&repo=${repo}&path=${path}&currentBranch=${currentBranch}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`)
      }

      const {data} = await response.json()

      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item.type === 'file') {
          // Get file content


          const response = await fetch(`/api/github/file?owner=${owner}&repo=${repo}&path=${item.path}&currentBranch=${currentBranch}`)

            if (!response.ok) {
              throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`)
            }
          const {data} = await response.json()
          if (data.decodedContent) {
            files.push({
              path: item.path,
              content: data.decodedContent,
              type: item.type
            });
          }
        } else if (item.type === 'dir') {
          // Recursively get files from subdirectories
          const subFiles = await getAllRepositoryFiles(item.path);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      console.error('Error fetching repository files:', error);
    }

    return files;
  };

  const executeActions = async (approvedActions: CodeAction[]) => {
    for (const action of approvedActions) {
      if (action.type === 'update' || action.type === 'create') {
        const encodedContent = btoa(action.content || '');
        const existingFile = contents.find(c => c.path === action.path);

        await fetch('/api/github/file', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            owner,
            repo,
            path: action.path,
            message: action.message,
            content: action.content || '',
            sha: existingFile?.sha,
            branch: currentBranch
          })
        });
      }
      // Handle delete actions similarly
    }

    setPendingActions([]);
    setShowActions(false);
    loadContents();
    alert('Changes committed successfully!');
  };

  useEffect(() => {
    loadBranches();
    loadContents();
  }, [currentBranch]);

  const loadBranches = async () => {
    const response = await fetch(`/api/github/branches?owner=${owner}&repo=${repo}`);
    if (response.ok) {
      const {data} = await response.json();
      setBranches(data || []);
    }
  };

  const loadContents = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/github/contents?owner=${owner}&repo=${repo}&path=${currentPath}&currentBranch=${currentBranch}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`)
      }

      const {data} = await response.json()
      setContents(Array.isArray(data) ? data : [data]);

    setIsLoading(false);
  };

  const openFile = async (path: string) => {
    const response = await fetch(`/api/github/file?owner=${owner}&repo=${repo}&path=${path}&currentBranch=${currentBranch}`)

            if (!response.ok) {
              throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`)
            }
          const {data} = await response.json()

    if (response.ok && data.decodedContent) {
      setCurrentFile(path);
      setFileContent(data.decodedContent);
    }
  };

  const saveFile = async () => {
  if (!currentFile) return;

  const currentFileData = contents.find(c => c.path === currentFile);

  const response = await fetch(`/api/github/file`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    owner,
    repo,
    path: currentFile,
    branch: currentBranch,
    message: `Update ${currentFile}`,
    content: fileContent,
    sha: currentFileData?.sha,
  }),
});

  const result = await response.json();

  if (result.success) {
    alert('File saved successfully!');
    loadContents();
  } else {
    alert(`Error: ${result.error}`);
  }
};

  const navigateToPath = (path: string, isDir: boolean) => {
    if (isDir) {
      setCurrentPath(path);
      setCurrentFile('');
      setFileContent('');
    } else {
      openFile(path);
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px', border: '1px solid #ccc' }}>
      {/* File Explorer */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <select
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value)}
          >
            {branches.map(branch => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {currentPath && (
          <button onClick={() => setCurrentPath('')}>
            ← Root
          </button>
        )}

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {contents.map((item, index) => (
              <div
                key={item.path + index}
                onClick={() => navigateToPath(item.path, item.type === 'dir')}
                style={{
                  cursor: 'pointer',
                  padding: '5px',
                  backgroundColor: currentFile === item.path ? '#e0e0e0' : 'transparent'
                }}
              >
                {item.type === 'dir' ? '📁' : '📄'} {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Add LLM prompt input */}
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <input
            type="text"
            placeholder="Ask LLM to make changes..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                requestLLMChanges(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            style={{ width: '100%', padding: '5px' }}
          />
            {/* Add after the LLM prompt input */}
{showFileSelector && (
  <FileSelector
    files={allRepoFiles}
    selectedFiles={selectedFiles}
    onToggleFile={(path) => {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(path)) {
        newSelected.delete(path);
      } else {
        newSelected.add(path);
      }
      setSelectedFiles(newSelected);
    }}
    onSelectAll={() => setSelectedFiles(new Set(allRepoFiles.map(f => f.path)))}
    onDeselectAll={() => setSelectedFiles(new Set())}
    onSend={sendToLLM}
    onCancel={() => {
      setShowFileSelector(false);
      setSelectedFiles(new Set());
      setPendingPrompt('');
    }}
  />
)}
        </div>

        {/* Add to JSX before the existing editor */}
        {showActions && (
          <CodeActions
            actions={pendingActions}
            onApprove={executeActions}
            onReject={() => {
              setPendingActions([]);
              setShowActions(false);
            }}
          />
        )}

        {currentFile && (
          <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <span>{currentFile}</span>
            <button onClick={saveFile} style={{ marginLeft: '10px' }}>
              Save
            </button>
          </div>
        )}

        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
          placeholder="Select a file to edit..."
        />
      </div>
    </div>
  );
}