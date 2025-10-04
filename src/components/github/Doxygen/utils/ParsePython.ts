// Parse Python files
  import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";


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


export const parsePython = (lines: string[], parsed: ParsedFile) => {
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