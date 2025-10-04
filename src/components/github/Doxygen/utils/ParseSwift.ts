export const parseSwift = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('///')) {
      commentBuffer.push(line.replace(/^\/{2,3}/, '').trim());
      continue;
    }

    // Class detection
    const classMatch = line.match(/class\s+(\w+)/);
    if (classMatch) {
      currentClass = {
        name: classMatch[1],
        description: commentBuffer.join(' ') || 'No description available.',
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
    const funcMatch = line.match(/func\s+(\w+)\s*\(([^)]*)\)\s*->\s*(\w+)/);
    if (funcMatch) {
      const methodName = funcMatch[1];
      const parameters = parseParameters(funcMatch[2]);
      const returnType = funcMatch[3];

      const func: ParsedFunction = {
        name: methodName,
        returnType,
        parameters,
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
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