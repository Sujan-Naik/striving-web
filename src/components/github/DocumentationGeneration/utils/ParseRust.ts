import { ParsedClass, ParsedFile, ParsedFunction } from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseRust = (lines: string[], parsed: ParsedFile) => {
  let currentStruct: ParsedClass | null = null;
  let commentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle documentation comments
    if (line.startsWith('///')) {
      commentBuffer.push(line.replace(/^\/{2,3}/, '').trim());
      continue;
    }

    // Handle multi-line comments
    if (line.startsWith('/**')) {
      while (i < lines.length && !lines[i].includes('*/')) {
        const comment = lines[i].trim().replace(/^[\/*\s]+/, '');
        if (comment) commentBuffer.push(comment);
        i++;
      }
      continue;
    }

    // Struct/Enum detection
    const structMatch = line.match(/^(pub(?:\s+\(crate\))?)?\s*(struct|enum|trait)\s+(\w+)(?:<[^>]+>)?/);
    if (structMatch) {
      currentStruct = {
        name: structMatch[3],
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        methods: [],
        properties: []
      };
      parsed.classes.push(currentStruct);
      commentBuffer = [];
      continue;
    }

    // Struct field detection
    if (currentStruct && line && !line.includes('fn') && !line.includes('impl')) {
      const fieldMatch = line.match(/^(pub(?:\s+\(crate\))?)?\s*(\w+):\s*([\w<>,\[\]&']+)/);
      if (fieldMatch) {
        currentStruct.properties.push({
          name: fieldMatch[2],
          type: fieldMatch[3],
          description: commentBuffer.join(' ') || undefined
        });
        commentBuffer = [];
        continue;
      }
    }

    // Function detection (including impl block methods)
    const funcMatch = line.match(/^(pub(?:\s+\(crate\))?)?\s*(unsafe\s+)?(async\s+)?(const\s+)?fn\s+(\w+)(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*->\s*([\w<>,\[\]&']+))?/);
    if (funcMatch) {
      const visibility = funcMatch[1];
      const methodName = funcMatch[5];
      const paramsStr = funcMatch[6];
      const returnType = funcMatch[7] || '()';

      const parameters = paramsStr.split(',')
        .map(p => p.trim())
        .filter(p => p && p !== '&self' && p !== '&mut self' && p !== 'self')
        .map(param => {
          const parts = param.split(':');
          if (parts.length >= 2) {
            return {
              name: parts[0].trim(),
              type: parts.slice(1).join(':').trim()
            };
          }
          return { name: param, type: 'unknown' };
        });

      const func: ParsedFunction = {
        name: methodName,
        returnType,
        parameters,
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        isPrivate: !visibility
      };

      // Check if we're in an impl block
      if (currentStruct) {
        currentStruct.methods.push(func);
      } else {
        parsed.functions.push(func);
      }
      commentBuffer = [];
    }

    // Track impl blocks
    const implMatch = line.match(/^impl(?:<[^>]+>)?\s+(\w+)/);
    if (implMatch) {
      currentStruct = parsed.classes.find(c => c.name === implMatch[1]) || null;
    }

    // Exit impl/struct context
    if (line === '}' && currentStruct) {
      currentStruct = null;
    }
  }
};