// components/github/CodeEditor/CodeEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import { CodeAction } from "@/types/codeActions";
import DirectoryExplorer from '../DirectoryExplorer/DirectoryExplorer';

interface CodeActionsProps {
  actions: CodeAction[];
  onApprove: (actions: CodeAction[]) => void;
  onReject: () => void;
}

function CodeActions({ actions, onApprove, onReject }: CodeActionsProps) {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
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

function FileSelector({
  files,
  selectedFiles,
  onToggleFile,
  onSelectAll,
  onDeselectAll,
  onSend,
  onCancel,
  sending,
}: {
  files: Array<{ path: string; content: string; type: string }>;
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSend: () => void;
  onCancel: () => void;
  sending: boolean;
}) {
  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc'}}>
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
      <button onClick={onSend} disabled={sending}>
        {sending ? 'Sending...' : 'Send to LLM'}
      </button>
      <button onClick={onCancel} style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </div>
  );
}

interface CodeEditorProps {
  owner: string;
  repo: string;
  initialPath?: string;
}

export default function CodeEditor({ owner, repo, initialPath = '' }: CodeEditorProps) {
  const fullRepoName = `${owner}/${repo}`;

  const [currentPath, setCurrentPath] = useState(initialPath);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // LLM integration state
  const [pendingActions, setPendingActions] = useState<CodeAction[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [allRepoFiles, setAllRepoFiles] = useState<Array<{path: string, content: string, type: string}>>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  useEffect(() => {
    loadBranches();
  }, [owner, repo]);

  const loadBranches = async () => {
    if (!owner || !repo) return;
    const response = await fetch(`/api/github/${fullRepoName}/branches`);
    if (response.ok) {
      const data = await response.json();
      setBranches(data || []);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    setIsLoadingFile(true);
    try {
      const response = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(filePath)}&branch=${currentBranch}`);
      const data = await response.json();
      if (response.ok && data.decodedContent) {
        setCurrentFile(filePath);
        setFileContent(data.decodedContent);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDirectoryChange = (path: string) => {
    setCurrentPath(path);
    setCurrentFile('');
    setFileContent('');
  };

  const handleBranchChange = (branch: string) => {
    setCurrentBranch(branch);
    setCurrentFile('');
    setFileContent('');
  };

  const saveFile = async () => {
    if (!currentFile) return;
    try {
      const getFileResp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(currentFile)}&branch=${currentBranch}`);
      const getFileData = await getFileResp.json();
      const sha = getFileResp.ok ? getFileData.sha : undefined;

      const response = await fetch(`/api/github/${fullRepoName}/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentFile,
          message: `Update ${currentFile}`,
          content: fileContent,
          sha,
          branch: currentBranch
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('File saved successfully!');
      } else {
        alert('Failed to save file: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  };

  const getAllRepositoryFiles = async (path: string = ''): Promise<Array<{path: string, content: string, type: string}>> => {
    const files: Array<{path: string, content: string, type: string}> = [];
    try {
      const response = await fetch(`/api/github/${fullRepoName}/contents?path=${encodeURIComponent(path)}&branch=${currentBranch}`);
      const data = await response.json();
      if (!response.ok) return files;

      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.type === 'file') {
          const fileResp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(item.path)}&branch=${currentBranch}`);
          const fileData = await fileResp.json();
          if (fileResp.ok && fileData.decodedContent) {
            files.push({
              path: item.path,
              content: fileData.decodedContent,
              type: item.type
            });
          }
        } else if (item.type === 'dir') {
          const subFiles = await getAllRepositoryFiles(item.path);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      console.error('Error fetching repository files:', error);
    }
    return files;
  };

  const requestLLMChanges = async (prompt: string) => {
    setPendingPrompt(prompt);
    const codebaseFiles = await getAllRepositoryFiles();
    setAllRepoFiles(codebaseFiles);
    setShowFileSelector(true);
  };

  const [sending, setSending] = useState(false);

  const sendToLLM = async () => {
    if (sending) return;
    setSending(true);
    const selectedFileData = allRepoFiles.filter(file => selectedFiles.has(file.path));

    try {
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
    } catch (error) {
      console.error('Error sending to LLM:', error);
      alert('Failed to send request to LLM');
    } finally {
      setSending(false);
    }
  };

  const executeActions = async (approvedActions: CodeAction[]) => {
    try {
      for (const action of approvedActions) {
        if (action.type === 'update' || action.type === 'create') {
          let sha: string | undefined;
          if (action.type === 'update') {
            const resp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(action.path)}&branch=${currentBranch}`);
            const data = await resp.json();
            if (resp.ok) {
              sha = data.sha;
            }
          }

          await fetch(`/api/github/${fullRepoName}/file`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: action.path,
              message: action.message,
              content: action.content,
              sha,
              branch: currentBranch
            })
          });
        }
      }

      setPendingActions([]);
      setShowActions(false);
      alert('Changes committed successfully!');
      if (currentFile && approvedActions.some(action => action.path === currentFile)) {
        handleFileSelect(currentFile);
      }
    } catch (error) {
      console.error('Error executing actions:', error);
      alert('Failed to execute some actions');
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px', border: '1px solid #ccc' }}>
      <DirectoryExplorer
        fullRepoName={fullRepoName}
        branch={currentBranch}
        onFileSelect={handleFileSelect}
        onDirectoryChange={handleDirectoryChange}
        selectedFile={currentFile}
        showBranchSelector={true}
        branches={branches}
        onBranchChange={handleBranchChange}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <input
            type="text"
            placeholder="Ask LLM to make changes... (Press Enter to submit)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                requestLLMChanges(e.currentTarget.value.trim());
                e.currentTarget.value = '';
              }
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

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
            sending={sending}
          />
        )}

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
          <div style={{
            padding: '10px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{currentFile}</span>
              {isLoadingFile && <span style={{ marginLeft: '10px', color: '#666' }}>Loading...</span>}
            </div>
            <button
              onClick={saveFile}
              disabled={isLoadingFile}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
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
            padding: '15px',
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none'
          }}
          placeholder={
            currentFile
              ? isLoadingFile
                ? "Loading file content..."
                : ""
              : "Select a file from the directory explorer to start editing..."
          }
          disabled={isLoadingFile}
        />
      </div>
    </div>
  );
}