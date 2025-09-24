// components/github/Doxygen/Doxygen.tsx
'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { githubApi } from '@/lib/api-client';
import DirectoryExplorer from '../DirectoryExplorer/DirectoryExplorer';

interface DoxygenProps {
  owner: string;
  repo: string;
  initialBranch?: string;
}

interface ParsedFunction {
  name: string;
  returnType: string;
  parameters: Array<{ type: string; name: string; description?: string }>;
  description: string;
  file: string;
  lineNumber: number;
  isStatic?: boolean;
  isPrivate?: boolean;
  isProtected?: boolean;
}

interface ParsedClass {
  name: string;
  description: string;
  file: string;
  lineNumber: number;
  methods: ParsedFunction[];
  properties: Array<{ name: string; type: string; description?: string }>;
  inheritance?: string;
}

interface ParsedFile {
  path: string;
  description: string;
  functions: ParsedFunction[];
  classes: ParsedClass[];
  constants: Array<{ name: string; value: string; description?: string }>;
  imports: string[];
}

export default function Doxygen({ owner, repo, initialBranch = 'main' }: DoxygenProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null);
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentationMode, setDocumentationMode] = useState<'single' | 'overview'>('single');

  useEffect(() => {
    loadBranches();
  }, [owner, repo]);

  useEffect(() => {
    if (selectedFile && fileContent) {
      generateDocumentation();
    }
  }, [selectedFile, fileContent]);

  const loadBranches = async () => {
    if (!owner || !repo) return;

    const response = await githubApi.getBranches(owner, repo);
    if (response.success) {
      setBranches(response.data || []);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    if (!shouldDocumentFile(filePath)) {
      setError(`File type not supported for documentation: ${filePath}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await githubApi.getFile(owner, repo, filePath, currentBranch);
      if (response.success && response.data.decodedContent) {
        setSelectedFile(filePath);
        setFileContent(response.data.decodedContent);
      } else {
        setError('Failed to load file content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setIsLoading(false);
    }
  };

  const shouldDocumentFile = (filePath: string): boolean => {
    const supportedExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'
    ];
    return supportedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  };

  const parseFileContent = (content: string, filePath: string): ParsedFile => {
    const lines = content.split('\n');
    const extension = filePath.split('.').pop()?.toLowerCase();

    const parsed: ParsedFile = {
      path: filePath,
      description: extractFileDescription(content),
      functions: [],
      classes: [],
      constants: [],
      imports: extractImports(content, extension || '')
    };

    // Parse based on file type
    switch (extension) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        parseTypeScriptJavaScript(lines, parsed);
        break;
      case 'py':
        parsePython(lines, parsed);
        break;
      case 'java':
        parseJava(lines, parsed);
        break;
      case 'cpp':
      case 'c':
      case 'h':
      case 'hpp':
        parseCpp(lines, parsed);
        break;
      default:
        parseGeneric(lines, parsed);
    }

    return parsed;
  };

  const extractFileDescription = (content: string): string => {
    const lines = content.split('\n');
    const descriptions: string[] = [];

    // Look for file-level comments at the top
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('/**') || line.startsWith('/*')) {
        // Multi-line comment
        let j = i;
        while (j < lines.length && !lines[j].includes('*/')) {
          const commentLine = lines[j].replace(/^[\s*\/]*/, '').trim();
          if (commentLine && !commentLine.startsWith('@')) {
            descriptions.push(commentLine);
          }
          j++;
        }
        break;
      } else if (line.startsWith('//') || line.startsWith('#')) {
        // Single line comment
        descriptions.push(line.replace(/^[\/\#\s]*/, ''));
      } else if (line && !line.match(/^(import|from|package|using)/)) {
        break; // Stop at first non-comment, non-import line
      }
    }

    return descriptions.join(' ') || 'No file description available.';
  };

  const extractImports = (content: string, extension: string): string[] => {
    const lines = content.split('\n');
    const imports: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (extension === 'ts' || extension === 'tsx' || extension === 'js' || extension === 'jsx') {
        if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
          imports.push(trimmed);
        }
      } else if (extension === 'py') {
        if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
          imports.push(trimmed);
        }
      } else if (extension === 'java') {
        if (trimmed.startsWith('import ')) {
          imports.push(trimmed);
        }
      } else if (extension === 'cpp' || extension === 'c' || extension === 'h' || extension === 'hpp') {
        if (trimmed.startsWith('#include')) {
          imports.push(trimmed);
        }
      }
    }

    return imports;
  };

  const parseTypeScriptJavaScript = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let inComment = false;
    let commentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle comments
      if (trimmed.startsWith('/**')) {
        inComment = true;
        commentBuffer = [];
        continue;
      } else if (trimmed.includes('*/')) {
        inComment = false;
        continue;
      } else if (inComment) {
        const comment = trimmed.replace(/^\*\s?/, '');
        if (comment && !comment.startsWith('@')) {
          commentBuffer.push(comment);
        }
        continue;
      }

      // Parse classes
      const classMatch = trimmed.match(/^(export\s+)?(class|interface)\s+(\w+)(?:\s+extends\s+(\w+))?/);
      if (classMatch) {
        currentClass = {
          name: classMatch[3],
          description: commentBuffer.join(' ') || 'No description available.',
          file: parsed.path,
          lineNumber: i + 1,
          methods: [],
          properties: [],
          inheritance: classMatch[4]
        };
        parsed.classes.push(currentClass);
        commentBuffer = [];
        continue;
      }

      // Parse functions/methods
      const functionMatch = trimmed.match(/^(export\s+)?(async\s+)?(function\s+)?(\w+)\s*\(/);
      if (functionMatch) {
        const func: ParsedFunction = {
          name: functionMatch[4],
          returnType: 'unknown',
          parameters: parseParameters(line),
          description: commentBuffer.join(' ') || 'No description available.',
          file: parsed.path,
          lineNumber: i + 1
        };

        if (currentClass) {
          currentClass.methods.push(func);
        } else {
          parsed.functions.push(func);
        }
        commentBuffer = [];
        continue;
      }

      // Parse constants
      const constMatch = trimmed.match(/^(export\s+)?const\s+(\w+)\s*=\s*(.+);?/);
      if (constMatch) {
        parsed.constants.push({
          name: constMatch[2],
          value: constMatch[3],
          description: commentBuffer.join(' ') || undefined
        });
        commentBuffer = [];
      }

      // Clear comment buffer if not used
      if (trimmed && !trimmed.startsWith('//')) {
        commentBuffer = [];
      }
    }
  };

  const parsePython = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle docstrings
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        const quote = trimmed.startsWith('"""') ? '"""' : "'''";
        if (trimmed.endsWith(quote) && trimmed.length > 6) {
          // Single line docstring
          commentBuffer.push(trimmed.slice(3, -3));
        } else {
          // Multi-line docstring
          let j = i + 1;
          while (j < lines.length && !lines[j].includes(quote)) {
            commentBuffer.push(lines[j].trim());
            j++;
          }
          i = j;
        }
        continue;
      }

      // Parse classes
      const classMatch = trimmed.match(/^class\s+(\w+)(?:\((.+)\))?:/);
      if (classMatch) {
        currentClass = {
          name: classMatch[1],
          description: commentBuffer.join(' ') || 'No description available.',
          file: parsed.path,
          lineNumber: i + 1,
          methods: [],
          properties: [],
          inheritance: classMatch[2]
        };
        parsed.classes.push(currentClass);
        commentBuffer = [];
        continue;
      }

      // Parse functions/methods
      const funcMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*(.+))?:/);
      if (funcMatch) {
        const func: ParsedFunction = {
          name: funcMatch[1],
          returnType: funcMatch[3] || 'None',
          parameters: parsePythonParameters(funcMatch[2]),
          description: commentBuffer.join(' ') || 'No description available.',
          file: parsed.path,
          lineNumber: i + 1
        };

        if (currentClass) {
          currentClass.methods.push(func);
        } else {
          parsed.functions.push(func);
        }
        commentBuffer = [];
        continue;
      }

      // Clear comment buffer if not used
      if (trimmed && !trimmed.startsWith('#')) {
        commentBuffer = [];
      }
    }
  };

  const parseJava = (lines: string[], parsed: ParsedFile) => {
    // Similar pattern to TypeScript but with Java syntax
    parseGeneric(lines, parsed);
  };

  const parseCpp = (lines: string[], parsed: ParsedFile) => {
    // Similar pattern but with C++ syntax
    parseGeneric(lines, parsed);
  };

  const parseGeneric = (lines: string[], parsed: ParsedFile) => {
    // Generic parser for unsupported languages
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('function') || line.includes('def') || line.includes('void') || line.includes('int')) {
        // Try to extract function-like patterns
        const match = line.match(/(\w+)\s*\(/);
        if (match) {
          parsed.functions.push({
            name: match[1],
            returnType: 'unknown',
            parameters: [],
            description: 'Auto-detected function',
            file: parsed.path,
            lineNumber: i + 1
          });
        }
      }
    }
  };

  const parseParameters = (line: string): Array<{ type: string; name: string; description?: string }> => {
    const match = line.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return [];

    const params = match[1].split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(':');
      if (parts.length === 2) {
        return { name: parts[0].trim(), type: parts[1].trim() };
      }
      return { name: param, type: 'any' };
    });
  };

  const parsePythonParameters = (paramStr: string): Array<{ type: string; name: string; description?: string }> => {
    if (!paramStr.trim()) return [];

    const params = paramStr.split(',').map(p => p.trim());
    return params.map(param => {
      const parts = param.split(':');
      if (parts.length === 2) {
        return { name: parts[0].trim(), type: parts[1].trim() };
      }
      return { name: param, type: 'any' };
    });
  };

  const generateDocumentation = () => {
    if (!fileContent || !selectedFile) return;

    const parsed = parseFileContent(fileContent, selectedFile);
    setParsedData(parsed);

    const markdown = generateMarkdown(parsed);
    setMarkdownOutput(markdown);
  };

  const generateMarkdown = (data: ParsedFile): string => {
    let md = '';

    // File header
    md += `# Documentation for \`${data.path}\`\n\n`;
    md += `${data.description}\n\n`;

    // Table of contents
    md += `## Table of Contents\n\n`;
    if (data.imports.length > 0) md += `- [Imports](#imports)\n`;
    if (data.constants.length > 0) md += `- [Constants](#constants)\n`;
    if (data.classes.length > 0) md += `- [Classes](#classes)\n`;
    if (data.functions.length > 0) md += `- [Functions](#functions)\n`;
    md += `\n`;

    // Imports
    if (data.imports.length > 0) {
      md += `## Imports\n\n`;
      md += '```javascript\n';
      data.imports.forEach(imp => {
        md += `${imp}\n`;
      });
      md += '```\n\n';
    }

    // Constants
    if (data.constants.length > 0) {
      md += `## Constants\n\n`;
      md += `| Name | Value | Description |\n`;
      md += `|------|-------|-------------|\n`;
      data.constants.forEach(constant => {
        md += `| \`${constant.name}\` | \`${constant.value}\` | ${constant.description || 'No description'} |\n`;
      });
      md += `\n`;
    }

    // Classes
    if (data.classes.length > 0) {
      md += `## Classes\n\n`;
      data.classes.forEach(cls => {
        md += `### \`${cls.name}\`\n\n`;
        md += `**File:** \`${cls.file}\` (Line ${cls.lineNumber})\n\n`;
        if (cls.inheritance) {
          md += `**Extends:** \`${cls.inheritance}\`\n\n`;
        }
        md += `${cls.description}\n\n`;

        // Methods
        if (cls.methods.length > 0) {
          md += `#### Methods\n\n`;
          cls.methods.forEach(method => {
            md += `##### \`${method.name}(${method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})\`\n\n`;
            md += `**Returns:** \`${method.returnType}\`\n\n`;
            md += `${method.description}\n\n`;

            if (method.parameters.length > 0) {
              md += `**Parameters:**\n\n`;
              md += `| Name | Type | Description |\n`;
              md += `|------|------|-------------|\n`;
              method.parameters.forEach(param => {
                md += `| \`${param.name}\` | \`${param.type}\` | ${param.description || 'No description'} |\n`;
              });
              md += `\n`;
            }
          });
        }

        // Properties
        if (cls.properties.length > 0) {
          md += `#### Properties\n\n`;
          md += `| Name | Type | Description |\n`;
          md += `|------|------|-------------|\n`;
          cls.properties.forEach(prop => {
            md += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.description || 'No description'} |\n`;
          });
          md += `\n`;
        }
      });
    }

    // Functions
    if (data.functions.length > 0) {
      md += `## Functions\n\n`;
      data.functions.forEach(func => {
        md += `### \`${func.name}(${func.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})\`\n\n`;
        md += `**File:** \`${func.file}\` (Line ${func.lineNumber})\n\n`;
        md += `**Returns:** \`${func.returnType}\`\n\n`;
        md += `${func.description}\n\n`;

        if (func.parameters.length > 0) {
          md += `**Parameters:**\n\n`;
          md += `| Name | Type | Description |\n`;
          md += `|------|------|-------------|\n`;
          func.parameters.forEach(param => {
            md += `| \`${param.name}\` | \`${param.type}\` | ${param.description || 'No description'} |\n`;
          });
          md += `\n`;
        }
      });
    }

    return md;
  };

  return (
    <div style={{ display: 'flex', height: '800px', border: '1px solid #ccc' }}>
      {/* Directory Explorer */}
      <DirectoryExplorer
        owner={owner}
        repo={repo}
        branch={currentBranch}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        showBranchSelector={true}
        branches={branches}
        onBranchChange={setCurrentBranch}
        style={{ width: '350px' }}
      />

      {/* Documentation Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #ccc',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              📚 Doxygen Documentation
            </h3>
            {selectedFile && (
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                {selectedFile}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setDocumentationMode('single')}
              style={{
                padding: '6px 12px',
                backgroundColor: documentationMode === 'single' ? '#007bff' : '#f8f9fa',
                color: documentationMode === 'single' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Single File
            </button>
            <button
              onClick={() => setDocumentationMode('overview')}
              style={{
                padding: '6px 12px',
                backgroundColor: documentationMode === 'overview' ? '#007bff' : '#f8f9fa',
                color: documentationMode === 'overview' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#ffffff' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</div>
              <div>Generating documentation...</div>
            </div>
          )}

          {error && (
            <div style={{
              color: '#d73a49',
              backgroundColor: '#ffeef0',
              border: '1px solid #fdaeb7',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!selectedFile && !isLoading && !error && (
            <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
              <h3>Select a file to generate documentation</h3>
              <p>Choose a source code file from the directory explorer to see its auto-generated documentation.</p>
              <div style={{ marginTop: '20px', fontSize: '14px' }}>
                <strong>Supported file types:</strong><br />
                TypeScript/JavaScript (.ts, .tsx, .js, .jsx)<br />
                Python (.py) • Java (.java) • C/C++ (.c, .cpp, .h, .hpp)<br />
                C# (.cs) • PHP (.php) • Ruby (.rb) • Go (.go) • Rust (.rs)
              </div>
            </div>
          )}

          {markdownOutput && !isLoading && (
            <div style={{
              maxWidth: 'none',
              lineHeight: '1.6'
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 style={{ borderBottom: '2px solid #e1e4e8', paddingBottom: '10px' }}>{children}</h1>,
                  h2: ({children}) => <h2 style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '8px', marginTop: '30px' }}>{children}</h2>,
                  h3: ({children}) => <h3 style={{ marginTop: '25px', color: '#0366d6' }}>{children}</h3>,
                  code: ({children, className}) => {
                    if (className?.includes('language-')) {
                      return <code className={className} style={{ backgroundColor: '#f6f8fa', padding: '16px', borderRadius: '6px', display: 'block', overflow: 'auto' }}>{children}</code>;
                    }
                    return <code style={{ backgroundColor: '#f6f8fa', padding: '2px 4px', borderRadius: '3px', fontSize: '85%' }}>{children}</code>;
                  },
                  table: ({children}) => <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px' }}>{children}</table>,
                  th: ({children}) => <th style={{ border: '1px solid #d0d7de', padding: '8px 13px', backgroundColor: '#f6f8fa', fontWeight: 'bold' }}>{children}</th>,
                  td: ({children}) => <td style={{ border: '1px solid #d0d7de', padding: '8px 13px' }}>{children}</td>,
                  blockquote: ({children}) => <blockquote style={{ borderLeft: '4px solid #d0d7de', paddingLeft: '16px', color: '#656d76', margin: '0 0 16px 0' }}>{children}</blockquote>
                }}
              >
                {markdownOutput}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}