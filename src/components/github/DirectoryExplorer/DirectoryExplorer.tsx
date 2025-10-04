// components/github/DirectoryExplorer/DirectoryExplorer.tsx
'use client';
import { useState, useEffect } from 'react';
import { githubApi } from '@/lib/api-client';

export interface DirectoryItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha?: string;
  size?: number;
}

export interface DirectoryExplorerProps {
  owner: string;
  repo: string;
  branch: string;
  onFileSelect?: (filePath: string) => void;
  onDirectoryChange?: (path: string) => void;
  selectedFile?: string;
  className?: string;
  style?: React.CSSProperties;
  showBranchSelector?: boolean;
  branches?: any[];
  onBranchChange?: (branch: string) => void;
}

export default function DirectoryExplorer({
  owner,
  repo,
  branch,
  onFileSelect,
  onDirectoryChange,
  selectedFile,
  className,
  style,
  showBranchSelector = false,
  branches = [],
  onBranchChange
}: DirectoryExplorerProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<DirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContents();
  }, [currentPath, branch, owner, repo]);

  const loadContents = async () => {
    if (!owner || !repo || !branch) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await githubApi.getContents(owner, repo, currentPath, branch);
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : [response.data];
        setContents(items.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'dir',
          sha: item.sha,
          size: item.size
        })));
      } else {
        setError(response.error || 'Failed to load directory contents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPath = (path: string, isDir: boolean) => {
    if (isDir) {
      setCurrentPath(path);
      onDirectoryChange?.(path);
    } else {
      onFileSelect?.(path);
    }
  };

  const goToParent = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(parentPath);
    onDirectoryChange?.(parentPath);
  };

  const goToRoot = () => {
    setCurrentPath('');
    onDirectoryChange?.('');
  };

  // Get breadcrumb items
  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  const defaultStyle: React.CSSProperties = {
    width: '300px',
    borderRight: `var(--border-thickness) solid var(--border-color)`,
    padding: 'var(--padding-thickness)',
    backgroundColor: 'var(--background-secondary)',
    overflowY: 'auto',
    color: 'var(--foreground-secondary)',
    ...style
  };

  return (
    <div className={className} style={defaultStyle}>
      {/* Branch Selector */}
      {showBranchSelector && branches.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <select
            value={branch}
            onChange={(e) => onBranchChange?.(e.target.value)}
            style={{
              width: '100%',
              padding: '5px',
              border: `var(--border-thickness) solid var(--border-color)`,
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--background-tertiary)',
              color: 'var(--foreground-primary)'
            }}
          >
            {branches.map(branchItem => (
              <option key={branchItem.name} value={branchItem.name}>
                {branchItem.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '10px', fontSize: '12px', color: 'var(--foreground-tertiary)' }}>
        <button
          onClick={goToRoot}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath ? 'var(--link-color)' : 'var(--foreground-tertiary)',
            cursor: currentPath ? 'pointer' : 'default',
            padding: '2px 4px',
            textDecoration: currentPath ? 'underline' : 'none'
          }}
        >
          {repo}
        </button>
        {breadcrumbs.map((segment, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const segmentPath = breadcrumbs.slice(0, index + 1).join('/');
          return (
            <span key={index}>
              <span style={{ margin: '0 4px' }}>/</span>
              {isLast ? (
                <span style={{ fontWeight: 'bold' }}>{segment}</span>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPath(segmentPath);
                    onDirectoryChange?.(segmentPath);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--link-color)',
                    cursor: 'pointer',
                    padding: '2px',
                    textDecoration: 'underline'
                  }}
                >
                  {segment}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Parent Directory Button */}
      {currentPath && (
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={goToParent}
            style={{
              background: 'none',
              border: `var(--border-thickness) solid var(--border-color)`,
              padding: '5px 10px',
              cursor: 'pointer',
              borderRadius: 'var(--border-radius)',
              fontSize: '12px',
              color: 'var(--foreground-primary)'
            }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--foreground-tertiary)' }}>
          Loading...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          color: 'var(--foreground-primary)',
          fontSize: '12px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: `var(--border-thickness) solid #ffcccc`,
          borderRadius: 'var(--border-radius)',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      {/* Directory Contents */}
      {!isLoading && !error && (
        <div>
          {contents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--foreground-tertiary)', fontSize: '12px' }}>
              Empty directory
            </div>
          ) : (
            contents
              .sort((a, b) => {
                // Directories first, then files
                if (a.type !== b.type) {
                  return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map(item => (
                <div
                  key={item.path}
                  onClick={() => navigateToPath(item.path, item.type === 'dir')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 5px',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: selectedFile === item.path ? 'var(--background-primary)' : 'transparent',
                    border: selectedFile === item.path ? `var(--border-thickness) solid var(--highlight)` : '1px solid transparent',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFile !== item.path) {
                      e.currentTarget.style.backgroundColor = 'var(--hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFile !== item.path) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ marginRight: '8px', fontSize: '14px' }}>
                    {item.type === 'dir' ? '📁' : getFileIcon(item.name)}
                  </span>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    color: 'var(--foreground-primary)'
                  }}>
                    {item.name}
                  </span>
                  {item.type === 'file' && item.size !== undefined && (
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--foreground-tertiary)',
                      marginLeft: '5px',
                      flexShrink: 0
                    }}>
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to get file icons based on extension
function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    // Code files
    'js': '🟨',
    'ts': '🔷',
    'tsx': '🔷',
    'jsx': '🟨',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'go': '🐹',
    'rs': '🦀',
    'php': '🐘',
    'rb': '💎',
    'swift': '🐦',
    'kt': '🟣',
    'scala': '🔴',

    // Web files
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'less': '🎨',

    // Config files
    'json': '📋',
    'xml': '📋',
    'yaml': '📋',
    'yml': '📋',
    'toml': '📋',
    'ini': '📋',

    // Documentation
    'md': '📝',
    'txt': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',

    // Images
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',

    // Others
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'gitignore': '🙈',
    'dockerignore': '🐳',
    'dockerfile': '🐳'
  };

  return iconMap[extension || ''] || '📄';
}

// Utility function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}