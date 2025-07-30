// components/github/CodeEditor/CodeEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { githubApi } from '@/lib/provider-api-client';

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

  useEffect(() => {
    loadBranches();
    loadContents();
  }, [currentBranch]);

  const loadBranches = async () => {
    const response = await githubApi.getBranches(owner, repo);
    if (response.success) {
      setBranches(response.data || []);
    }
  };

  const loadContents = async () => {
    setIsLoading(true);
    const response = await githubApi.getContents(owner, repo, currentPath, currentBranch);
    if (response.success) {
      setContents(Array.isArray(response.data) ? response.data : [response.data]);
    }
    setIsLoading(false);
  };

  const openFile = async (path: string) => {
    const response = await githubApi.getFile(owner, repo, path, currentBranch);
    if (response.success && response.data.decodedContent) {
      setCurrentFile(path);
      setFileContent(response.data.decodedContent);
    }
  };

  const saveFile = async () => {
    if (!currentFile) return;

    const encodedContent = btoa(fileContent);
    const currentFileData = contents.find(c => c.path === currentFile);

    const response = await githubApi.updateFile(owner, repo, currentFile, {
      message: `Update ${currentFile}`,
      content: encodedContent,
      sha: currentFileData?.sha,
      branch: currentBranch
    });

    if (response.success) {
      alert('File saved successfully!');
      loadContents();
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
            {contents.map(item => (
              <div
                key={item.path}
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