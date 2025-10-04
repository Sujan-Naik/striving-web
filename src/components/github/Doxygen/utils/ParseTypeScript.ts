// Parse TypeScript/JavaScript files
import {ParsedClass, ParsedFile, ParsedFunction, parseParameters} from "@/components/github/Doxygen/utils/ParseMaster";

export const parseTypeScriptJavaScript = (lines: string[], parsed: ParsedFile) => {
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