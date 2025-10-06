
import { ParsedClass, ParsedFile, ParsedFunction } from "@/components/github/DocumentationGeneration/utils/ParseMaster";

const parsePythonParameters = (paramStr: string, docstring: string[]): Array<{ type: string; name: string; description?: string }> => {
  if (!paramStr.trim()) return [];

  // Extract parameter descriptions from docstring
  const paramDescriptions: Record<string, string> = {};
  const typeHints: Record<string, string> = {};

  docstring.forEach(line => {
    const paramMatch = line.match(/(?:Args?|Parameters?):\s*$/i);
    if (paramMatch) return;

    const paramDescMatch = line.match(/^\s*(\w+)\s*(?:\(([^)]+)\))?\s*:\s*(.+)/);
    if (paramDescMatch) {
      paramDescriptions[paramDescMatch[1]] = paramDescMatch[3];
      if (paramDescMatch[2]) {
        typeHints[paramDescMatch[1]] = paramDescMatch[2];
      }
    }
  });

  const params = paramStr.split(',').map(p => p.trim()).filter(p => p && p !== 'self' && p !== 'cls');

  return params.map(param => {
    const parts = param.split(':');
    const nameWithDefault = parts[0].trim();
    const name = nameWithDefault.split('=')[0].trim();
    const type = parts[1]?.trim() || typeHints[name] || 'Any';

    return {
      name,
      type,
      description: paramDescriptions[name]
    };
  });
};

export const parsePython = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.search(/\S/);

    // Handle docstrings (triple quotes)
    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      const quote = trimmed.startsWith('"""') ? '"""' : "'''";
      commentBuffer = [];

      // Single-line docstring
      if (trimmed.endsWith(quote) && trimmed.length > 6) {
        commentBuffer.push(trimmed.slice(3, -3));
      } else {
        // Multi-line docstring
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().endsWith(quote)) {
          commentBuffer.push(lines[j].trim());
          j++;
        }
        if (j < lines.length) {
          const lastLine = lines[j].trim();
          if (lastLine !== quote) {
            commentBuffer.push(lastLine.slice(0, -3));
          }
        }
        i = j;
      }
      continue;
    }

    // Handle single-line comments
    if (trimmed.startsWith('#')) {
      commentBuffer.push(trimmed.slice(1).trim());
      continue;
    }

    // Class detection
    const classMatch = trimmed.match(/^class\s+(\w+)(?:\(([^)]+)\))?:/);
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
      currentIndent = indent;
      commentBuffer = [];
      continue;
    }

    // Function/Method detection
    const funcMatch = trimmed.match(/^(async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*(.+))?:/);
    if (funcMatch) {
      const isMethod = currentClass && indent > currentIndent;
      const funcName = funcMatch[2];
      const returnType = funcMatch[4]?.trim() || 'None';

      const func: ParsedFunction = {
        name: funcName,
        returnType,
        parameters: parsePythonParameters(funcMatch[3], commentBuffer),
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        isPrivate: funcName.startsWith('_') && !funcName.startsWith('__'),
        isStatic: commentBuffer.some(c => c.includes('@staticmethod'))
      };

      if (isMethod && currentClass) {
        currentClass.methods.push(func);
      } else {
        parsed.functions.push(func);
      }
      commentBuffer = [];
      continue;
    }

    // Class variable detection
    if (currentClass && indent > currentIndent && trimmed.includes(':') && !trimmed.includes('def')) {
      const varMatch = trimmed.match(/^(\w+)\s*:\s*([^=]+)(?:\s*=\s*(.+))?/);
      if (varMatch) {
        currentClass.properties.push({
          name: varMatch[1],
          type: varMatch[2].trim(),
          description: commentBuffer.join(' ') || undefined
        });
        commentBuffer = [];
      }
    }

    // Clear comment buffer on unindented code (exiting class)
    if (currentClass && indent <= currentIndent && trimmed && !trimmed.startsWith('#')) {
      if (trimmed !== '' && !trimmed.startsWith('class') && !trimmed.startsWith('def')) {
        currentClass = null;
      }
    }
  }
};