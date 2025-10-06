// ParseMaster.ts - Central parsing utilities and interfaces
import { parseTypeScriptJavaScript } from "@/components/github/DocumentationGeneration/utils/ParseTypeScript";
import { parsePython } from "@/components/github/DocumentationGeneration/utils/ParsePython";
import { parseCpp } from "@/components/github/DocumentationGeneration/utils/ParseCpp";
import { parseJava } from "@/components/github/DocumentationGeneration/utils/ParseJava";
import { parseCSharp } from "@/components/github/DocumentationGeneration/utils/ParseCSharp";
import { parsePHP } from "@/components/github/DocumentationGeneration/utils/ParsePHP";
import { parseRuby } from "@/components/github/DocumentationGeneration/utils/ParseRuby";
import { parseGo } from "@/components/github/DocumentationGeneration/utils/ParseGo";
import { parseRust } from "@/components/github/DocumentationGeneration/utils/ParseRust";
import { parseSwift } from "@/components/github/DocumentationGeneration/utils/ParseSwift";

// Define the structure for parsed functions
export interface ParsedFunction {
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
export interface ParsedClass {
  name: string;
  description: string;
  file: string;
  lineNumber: number;
  methods: ParsedFunction[];
  properties: Array<{ name: string; type: string; description?: string }>;
  inheritance?: string;
}

// Define the structure for parsed files
export interface ParsedFile {
  path: string;
  description: string;
  functions: ParsedFunction[];
  classes: ParsedClass[];
  constants: Array<{ name: string; value: string; description?: string }>;
  imports: string[];
}

// Parse file content based on file type
export const parseFileContent = (content: string, filePath: string): ParsedFile => {
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
    case 'cs':
      parseCSharp(lines, parsed);
      break;
    case 'php':
      parsePHP(lines, parsed);
      break;
    case 'rb':
      parseRuby(lines, parsed);
      break;
    case 'go':
      parseGo(lines, parsed);
      break;
    case 'rs':
      parseRust(lines, parsed);
      break;
    case 'swift':
      parseSwift(lines, parsed);
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

    // Multi-line comments (/* */ or /** */)
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
    }
    // Single-line comments (// or # or ///)
    else if (line.startsWith('//') || line.startsWith('#') || line.startsWith('///')) {
      descriptions.push(line.replace(/^[\/\#]{1,3}\s*/, ''));
    }
    // Stop at first non-comment, non-import line
    else if (line && !line.match(/^(import|from|package|using|namespace)/)) {
      break;
    }
  }

  const rawDescription = descriptions.join(' ');

  // Remove HTML tags, Javadoc inline tags, and normalize whitespace
  const cleaned = rawDescription
    .replace(/<pre>[\s\S]*?<\/pre>/g, '')     // Remove <pre> blocks
    .replace(/<\/?[^>]+(>|$)/g, '')           // Strip all HTML tags
    .replace(/\{@code\s+([^}]+)\}/g, '`$1`')  // Convert {@code x} to `x`
    .replace(/\{@link\s+([^}]+)\}/g, '$1')    // Convert {@link x} to x
    .replace(/\{@literal\s+([^}]+)\}/g, '$1') // Convert {@literal x} to x
    .replace(/\{@\w+\s+([^}]+)\}/g, '$1')     // Remove other inline tags
    .replace(/\s+/g, ' ')                      // Normalize whitespace
    .trim();

  return cleaned || 'No file description available.';
};

// Extract import statements from the content
const extractImports = (content: string, extension: string): string[] => {
  const lines = content.split('\n');
  const imports: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // JavaScript/TypeScript/Python/Java/C#/PHP/Ruby/Go/Rust/Swift imports
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cs', 'php', 'rb', 'go', 'rs', 'swift']
        .includes(extension) && (trimmed.startsWith('import ') || trimmed.startsWith('from ') || trimmed.startsWith('use '))) {
      imports.push(trimmed);
    }
    // C/C++ includes
    else if (['cpp', 'c', 'h', 'hpp'].includes(extension) && trimmed.startsWith('#include')) {
      imports.push(trimmed);
    }
    // Ruby require
    else if (extension === 'rb' && trimmed.startsWith('require')) {
      imports.push(trimmed);
    }
  }

  return imports;
};

// Generic parsing for unsupported languages
export const parseGeneric = (lines: string[], parsed: ParsedFile) => {
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

// Parse parameters from function/method signatures (TypeScript/JavaScript style)
export const parseParameters = (line: string): Array<{ type: string; name: string; description?: string }> => {
  const match = line.match(/\(([^)]*)\)/);
  if (!match || !match[1].trim()) return [];

  const params = match[1].split(',').map(p => p.trim());
  return params.map(param => {
    // Handle TypeScript-style parameters (name: type)
    const parts = param.split(':');
    if (parts.length === 2) {
      return { name: parts[0].trim(), type: parts[1].trim() };
    }
    // Handle default values
    const nameOnly = param.split('=')[0].trim();
    return { name: nameOnly || param, type: 'any' };
  });
};