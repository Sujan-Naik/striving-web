import { ParsedClass, ParsedFile, ParsedFunction } from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseCpp = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];
  let currentVisibility: 'public' | 'private' | 'protected' = 'private';
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle Doxygen comments
    if (line.startsWith('///') || line.startsWith('//!')) {
      commentBuffer.push(line.replace(/^\/\/[\/!]\s?/, ''));
      continue;
    }

    // Handle multi-line comments
    if (line.startsWith('/**') || line.startsWith('/*!')) {
      inComment = true;
      commentBuffer = [];
      continue;
    } else if (line.includes('*/')) {
      inComment = false;
      continue;
    } else if (inComment) {
      const comment = line.replace(/^\*\s?/, '');
      if (!comment.startsWith('@') && !comment.startsWith('\\')) {
        commentBuffer.push(comment);
      }
      continue;
    }

    // Class/Struct detection
    const classMatch = line.match(/^(class|struct)\s+(\w+)(?:\s*:\s*(?:public|private|protected)\s+(\w+))?/);
    if (classMatch) {
      currentClass = {
        name: classMatch[2],
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        methods: [],
        properties: [],
        inheritance: classMatch[3]
      };
      parsed.classes.push(currentClass);
      currentVisibility = classMatch[1] === 'struct' ? 'public' : 'private';
      commentBuffer = [];
      continue;
    }

    // Visibility modifier
    const visibilityMatch = line.match(/^(public|private|protected):/);
    if (visibilityMatch) {
      currentVisibility = visibilityMatch[1] as 'public' | 'private' | 'protected';
      continue;
    }

    // Member variable detection
    if (currentClass && line.match(/^\w+[\w\s\*&<>,]*\s+\w+\s*[;=]/) && !line.includes('(')) {
      const varMatch = line.match(/([\w<>,\*&\s]+)\s+(\w+)\s*[;=]/);
      if (varMatch) {
        currentClass.properties.push({
          name: varMatch[2],
          type: varMatch[1].trim(),
          description: commentBuffer.join(' ') || undefined
        });
        commentBuffer = [];
        continue;
      }
    }

    // Function/Method detection
    const funcMatch = line.match(/^(?:(virtual|static|inline|constexpr|explicit)\s+)*([\w<>,:\*&\s]+)\s+(\w+)\s*\(([^)]*)\)(?:\s+(const|override|final|noexcept))*\s*[;{]?/);
    if (funcMatch && !line.includes('if') && !line.includes('while') && !line.includes('for')) {
      const returnType = funcMatch[2].trim();
      const methodName = funcMatch[3];
      const paramsStr = funcMatch[4];
      const isStatic = line.includes('static');

      const parameters = paramsStr.split(',')
        .map(p => p.trim())
        .filter(p => p)
        .map(param => {
          const parts = param.split(/\s+/);
          const name = parts[parts.length - 1].replace(/[\*&\[\]]/g, '');
          const type = parts.slice(0, -1).join(' ') || 'void';
          return { name, type };
        });

      const func: ParsedFunction = {
        name: methodName,
        returnType,
        parameters,
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        isStatic,
        isPrivate: currentVisibility === 'private',
        isProtected: currentVisibility === 'protected'
      };

      if (currentClass) {
        currentClass.methods.push(func);
      } else {
        parsed.functions.push(func);
      }
      commentBuffer = [];
    }

    // Exit class context
    if (line === '};' && currentClass) {
      currentClass = null;
      currentVisibility = 'private';
    }
  }
};