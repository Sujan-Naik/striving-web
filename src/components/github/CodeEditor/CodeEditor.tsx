// components/github/CodeEditor/CodeEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import { githubApi } from '@/lib/api-client';
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
      {/*<button onClick={onSend} disabled={selectedFiles.size === 0}>*/}
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

    const response = await githubApi.getBranches(owner, repo);
    if (response.success) {
      setBranches(response.data || []);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    setIsLoadingFile(true);
    try {
      const response = await githubApi.getFile(owner, repo, filePath, currentBranch);
      if (response.success && response.data.decodedContent) {
        setCurrentFile(filePath);
        setFileContent(response.data.decodedContent);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDirectoryChange = (path: string) => {
    setCurrentPath(path);
    // Clear current file when navigating directories
    setCurrentFile('');
    setFileContent('');
  };

  const handleBranchChange = (branch: string) => {
    setCurrentBranch(branch);
    // Clear current file when switching branches
    setCurrentFile('');
    setFileContent('');
  };

  const saveFile = async () => {
    if (!currentFile) return;

    try {
      // const sanitized = fileContent.replace(/[^\x00-\xFF]/g, '');
      const encodedContent = btoa(fileContent);

      // Get current file data to get SHA (required for updates)
      const currentFileResponse = await githubApi.getFile(owner, repo, currentFile, currentBranch);
      const sha = currentFileResponse.success ? currentFileResponse.data.sha : undefined;

      const response = await githubApi.updateFile(owner, repo, currentFile, {
        message: `Update ${currentFile}`,
        content: encodedContent,
        sha,
        branch: currentBranch
      });

      if (response.success) {
        alert('File saved successfully!');
      } else {
        alert('Failed to save file: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  };

  // LLM Integration Functions
  const getAllRepositoryFiles = async (path: string = ''): Promise<Array<{path: string, content: string, type: string}>> => {
    const files: Array<{path: string, content: string, type: string}> = [];
    try {
      const response = await githubApi.getContents(owner, repo, path, currentBranch);
      if (!response.success) return files;

      const items = Array.isArray(response.data) ? response.data : [response.data];

      for (const item of items) {
        if (item.type === 'file') {
          // Get file content
          const fileResponse = await githubApi.getFile(owner, repo, item.path, currentBranch);
          if (fileResponse.success && fileResponse.data.decodedContent) {
            files.push({
              path: item.path,
              content: fileResponse.data.decodedContent,
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

  const requestLLMChanges = async (prompt: string) => {
    setPendingPrompt(prompt);
    // Get all files and show selector
    const codebaseFiles = await getAllRepositoryFiles();
    setAllRepoFiles(codebaseFiles);
    setShowFileSelector(true);
  };

  const [sending, setSending] = useState(false);

  const sendToLLM = async () => {

    if (sending) return; // 🚫 Prevent duplicates at function level
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
      setSending(false); // ✅ Re-enable button after completion
    }
  };

  const executeActions = async (approvedActions: CodeAction[]) => {
    try {
      for (const action of approvedActions) {
        if (action.type === 'update' || action.type === 'create') {
          const encodedContent = btoa(action.content || '');

          // Get existing file SHA if it exists
          let sha: string | undefined;
          if (action.type === 'update') {
            const existingFileResponse = await githubApi.getFile(owner, repo, action.path, currentBranch);
            if (existingFileResponse.success) {
              sha = existingFileResponse.data.sha;
            }
          }

          await githubApi.updateFile(owner, repo, action.path, {
            message: action.message,
            content: encodedContent,
            sha,
            branch: currentBranch
          });
        }
        // TODO: Handle delete actions
      }

      setPendingActions([]);
      setShowActions(false);
      alert('Changes committed successfully!');

      // Refresh current file if it was modified
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
      {/* Directory Explorer */}
      <DirectoryExplorer
        owner={owner}
        repo={repo}
        branch={currentBranch}
        onFileSelect={handleFileSelect}
        onDirectoryChange={handleDirectoryChange}
        selectedFile={currentFile}
        showBranchSelector={true}
        branches={branches}
        onBranchChange={handleBranchChange}
      />

      {/* Code Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* LLM Prompt Input */}
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

        {/* File Selector for LLM */}
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

        {/* Code Actions */}
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

        {/* File Header */}
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

        {/* Code Editor Textarea */}
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