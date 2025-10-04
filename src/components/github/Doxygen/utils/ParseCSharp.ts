import { ParsedClass, ParsedFile, parseParameters } from "@/components/github/Doxygen/Doxygen"; // Ensure this path is correct
import { ParsedFunction } from "@/components/github/Doxygen/Doxygen"; // Adjusted import for ParsedFunction

export const parseCSharp = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('/*')) {
      while (i < lines.length && !lines[i].includes('*/')) {
        commentBuffer.push(lines[i].trim());
        i++;
      }
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
    const methodMatch = line.match(/(public|private|protected|internal|static)?\s*(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const visibilityModifier = methodMatch[1] ? methodMatch[1].trim() : "default"; // Handle visibility
      const returnType = methodMatch[2];
      const methodName = methodMatch[3];
      const parameters = parseParameters(methodMatch[4]);

      const func: ParsedFunction = {
        name: methodName,
        returnType: returnType,
        parameters: parameters,
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        isStatic: visibilityModifier === 'static', // Set isStatic if method is static
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