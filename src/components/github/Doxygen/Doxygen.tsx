// components/github/Doxygen/Doxygen.tsx
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { githubApi } from '@/lib/api-client';
import DirectoryExplorer from '../DirectoryExplorer/DirectoryExplorer';

// Define the props for the Doxygen component
interface DoxygenProps {
  owner: string;
  repo: string;
  initialBranch?: string;
}

// Define the structure for parsed functions
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

// Define the structure for parsed classes
interface ParsedClass {
  name: string;
  description: string;
  file: string;
  lineNumber: number;
  methods: ParsedFunction[];
  properties: Array<{ name: string; type: string; description?: string }>;
  inheritance?: string;
}

// Define the structure for parsed files
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

  // Load branches from GitHub repository
  const loadBranches = async () => {
    if (!owner || !repo) return;

    const response = await githubApi.getBranches(owner, repo);
    if (response.success) {
      setBranches(response.data || []);
    }
  };

  // Handle file selection and load its content
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

  // Determine if the file should be documented based on its extension
  const shouldDocumentFile = (filePath: string): boolean => {
    const supportedExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'
    ];
    return supportedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  };

  // Parse file content based on file type
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

    // Determine parsing method by file extension
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

  // Extract file-level description from comments
  const extractFileDescription = (content: string): string => {
    const lines = content.split('\n');
    const descriptions: string[] = [];

    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('/**') || line.startsWith('/*')) {
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
        descriptions.push(line.replace(/^[\/\#\s]*/, ''));
      } else if (line && !line.match(/^(import|from|package|using)/)) {
        break;
      }
    }

    return descriptions.join(' ') || 'No file description available.';
  };

  // Extract import statements from the content
  const extractImports = (content: string, extension: string): string[] => {
    const lines = content.split('\n');
    const imports: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (['ts', 'tsx', 'js', 'jsx', 'py', 'java'].includes(extension) && (trimmed.startsWith('import ') || trimmed.startsWith('from '))) {
        imports.push(trimmed);
      } else if (['cpp', 'c', 'h', 'hpp'].includes(extension) && trimmed.startsWith('#include')) {
        imports.push(trimmed);
      }
    }

    return imports;
  };

  // Parse TypeScript/JavaScript files
  const parseTypeScriptJavaScript = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let inComment = false;
    let commentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

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

      const constMatch = trimmed.match(/^(export\s+)?const\s+(\w+)\s*=\s*(.+);?/);
      if (constMatch) {
        parsed.constants.push({
          name: constMatch[2],
          value: constMatch[3],
          description: commentBuffer.join(' ') || undefined
        });
        commentBuffer = [];
      }

      if (trimmed && !trimmed.startsWith('//')) {
        commentBuffer = [];
      }
    }
  };

  // Parse Python files
  const parsePython = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        const quote = trimmed.startsWith('"""') ? '"""' : "'''";
        if (trimmed.endsWith(quote) && trimmed.length > 6) {
          commentBuffer.push(trimmed.slice(3, -3));
        } else {
          let j = i + 1;
          while (j < lines.length && !lines[j].includes(quote)) {
            commentBuffer.push(lines[j].trim());
            j++;
          }
          i = j;
        }
        continue;
      }

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

      if (trimmed && !trimmed.startsWith('#')) {
        commentBuffer = [];
      }
    }
  };

// Parse Java files with detailed method extraction
const parseJava = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('/**')) {
      inComment = true;
      commentBuffer = [];
      continue;
    } else if (line.includes('*/')) {
      inComment = false;
      continue;
    } else if (inComment) {
      const comment = line.replace(/^\*\s?/, '');
      commentBuffer.push(comment);
      continue;
    }

    // Class detection
    const classMatch = line.match(/public\s+class\s+(\w+)/);
    if (classMatch) {
      currentClass = {
        name: classMatch[1],
        description: extractDescription(commentBuffer),
        file: parsed.path,
        lineNumber: i + 1,
        methods: [],
        properties: [],
      };
      parsed.classes.push(currentClass);
      commentBuffer = [];
      continue;
    }

    // Method detection
    const methodMatch = line.match(/public\s+(static\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const returnType = methodMatch[2];
      const methodName = methodMatch[3];
      const parameters = parseJavaParameters(methodMatch[4], commentBuffer);

      const func: ParsedFunction = {
        name: methodName,
        returnType: returnType,
        parameters: parameters,
        description: extractDescription(commentBuffer),
        file: parsed.path,
        lineNumber: i + 1,
        isStatic: !!methodMatch[1]
      };

      if (currentClass) {
        currentClass.methods.push(func);
      } else {
        parsed.functions.push(func);
      }
      commentBuffer = [];
    }
  }
};

// Extract description from comment buffer
const extractDescription = (commentBuffer: string[]): string => {
  return commentBuffer.filter(line => !line.startsWith('@')).join(' ').trim() || 'No description available.';
};

// Parse parameters from Java method signature and comments
const parseJavaParameters = (paramStr: string, commentBuffer: string[]): Array<{ type: string; name: string; description?: string }> => {
  const params = paramStr.split(',').map(param => param.trim());
  const paramDescriptions = extractParamDescriptions(commentBuffer);

  return params.map(param => {
    const [type, name] = param.split(' ').filter(Boolean);
    return {
      type,
      name,
      description: paramDescriptions[name] || 'No description'
    };
  });
};

// Extract parameter descriptions from Javadoc comments
const extractParamDescriptions = (commentBuffer: string[]): Record<string, string> => {
  const paramDescriptions: Record<string, string> = {};

  commentBuffer.forEach(line => {
    const paramMatch = line.match(/^@param\s+(\w+)\s+(.+)/);
    if (paramMatch) {
      paramDescriptions[paramMatch[1]] = paramMatch[2];
    }
  });

  return paramDescriptions;
};

  // Parse C++ files (generic parsing as a placeholder)
  const parseCpp = (lines: string[], parsed: ParsedFile) => {
    parseGeneric(lines, parsed);
  };

  // Generic parsing for unsupported languages
  const parseGeneric = (lines: string[], parsed: ParsedFile) => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('function') || line.includes('def') || line.includes('void') || line.includes('int')) {
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

  // Parse parameters from function/method signatures
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

  // Parse Python function parameters
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

  // Generate documentation from parsed data
  const generateDocumentation = () => {
    if (!fileContent || !selectedFile) return;

    const parsed = parseFileContent(fileContent, selectedFile);
    setParsedData(parsed);

    const markdown = generateMarkdown(parsed);
    setMarkdownOutput(markdown);
  };

  // Generate markdown from parsed file data
  const generateMarkdown = (data: ParsedFile): string => {
    let md = '';

    md += `# Documentation for \`${data.path}\`\n\n`;
    md += `${data.description}\n\n`;

    md += `## Table of Contents\n\n`;
    if (data.imports.length > 0) md += `- [Imports](#imports)\n`;
    if (data.constants.length > 0) md += `- [Constants](#constants)\n`;
    if (data.classes.length > 0) md += `- [Classes](#classes)\n`;
    if (data.functions.length > 0) md += `- [Functions](#functions)\n`;
    md += `\n`;

    if (data.imports.length > 0) {
      md += `## Imports\n\n`;
      md += '```javascript\n';
      data.imports.forEach(imp => (md += `${imp}\n`));
      md += '```\n\n';
    }

    if (data.constants.length > 0) {
      md += `## Constants\n\n`;
      md += `| Name | Value | Description |\n`;
      md += `|------|-------|-------------|\n`;
      data.constants.forEach(constant => {
        md += `| \`${constant.name}\` | \`${constant.value}\` | ${constant.description || 'No description'} |\n`;
      });
      md += `\n`;
    }

    if (data.classes.length > 0) {
      md += `## Classes\n\n`;
      data.classes.forEach(cls => {
        md += `### \`${cls.name}\`\n\n`;
        md += `**File:** \`${cls.file}\` (Line ${cls.lineNumber})\n\n`;
        if (cls.inheritance) {
          md += `**Extends:** \`${cls.inheritance}\`\n\n`;
        }
        md += `${cls.description}\n\n`;

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
    <div style={{ display: 'flex', height: '800px', border: `var(--border-thickness) solid var(--border-color)` }}>
      {/* Directory Explorer */}
      <DirectoryExplorer
        owner={owner}
        repo={repo}
        branch={currentBranch}
        onFileSelect={handleFileSelect}
        // selected
                onBranchChange={setCurrentBranch}
        style={{ width: '350px' }}
      />

      {/* Documentation Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: 'var(--padding-thickness)',
          borderBottom: `var(--border-thickness) solid var(--border-color)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--background-primary)',
          color: 'var(--foreground-primary)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              📚 Doxygen Documentation
            </h3>
            {selectedFile && (
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--foreground-secondary)' }}>
                {selectedFile}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setDocumentationMode('single')}
              style={{
                padding: 'var(--button-padding)',
                backgroundColor: documentationMode === 'single' ? 'var(--highlight)' : 'var(--base-background)',
                color: documentationMode === 'single' ? 'var(--foreground-primary)' : 'var(--foreground-secondary)',
                border: `var(--border-thickness) solid var(--border-color)`,
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Single File
            </button>
            <button
              onClick={() => setDocumentationMode('overview')}
              style={{
                padding: 'var(--button-padding)',
                backgroundColor: documentationMode === 'overview' ? 'var(--highlight)' : 'var(--base-background)',
                color: documentationMode === 'overview' ? 'var(--foreground-primary)' : 'var(--foreground-secondary)',
                border: `var(--border-thickness) solid var(--border-color)`,
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: 'var(--background-tertiary)' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--foreground-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</div>
              <div>Generating documentation...</div>
            </div>
          )}

          {error && (
            <div style={{
              color: '#d73a49',
              border: `var(--border-thickness) solid #fdaeb7`,
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!selectedFile && !isLoading && !error && (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--foreground-secondary)' }}>
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
              lineHeight: '1.6',
              color: 'var(--foreground-primary)'
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ borderBottom: `2px solid var(--border-color)`, paddingBottom: '10px', color: 'var(--foreground-primary)' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ borderBottom: `1px solid var(--border-color)`, paddingBottom: '8px', marginTop: '30px', color: 'var(--foreground-primary)' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ marginTop: '25px', color: 'var(--link-color)' }}>{children}</h3>,
                  code: ({ children, className }) => {
                    if (className?.includes('language-')) {
                      return <code className={className} style={{padding: '16px', borderRadius: 'var(--border-radius)', display: 'block', overflow: 'auto' }}>{children}</code>;
                    }
                    return <code style={{padding: '2px 4px', borderRadius: '3px', fontSize: '85%' }}>{children}</code>;
                  },
                  table: ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px' }}>{children}</table>,
                  th: ({ children }) => <th style={{ border: `var(--border-thickness) solid var(--border-color)`, padding: '8px 13px', backgroundColor: 'var(--background-secondary)', fontWeight: 'bold', color: 'var(--foreground-primary)' }}>{children}</th>,
                  td: ({ children }) => <td style={{ border: `var(--border-thickness) solid var(--border-color)`, padding: '8px 13px', color: 'var(--foreground-secondary)' }}>{children}</td>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: `4px solid var(--border-color)`, paddingLeft: '16px', color: 'var(--foreground-tertiary)', margin: '0 0 16px 0' }}>{children}</blockquote>
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