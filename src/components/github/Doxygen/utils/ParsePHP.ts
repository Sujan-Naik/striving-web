import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";
import {parseParameters} from "@/components/github/Doxygen/Doxygen";


export const parsePHP = (lines: string[], parsed: ParsedFile) => {
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
    const methodMatch = line.match(/(public|private|protected|static)?\s*(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const returnType = methodMatch[2];
      const methodName = methodMatch[3];
      const parameters = parseParameters(methodMatch[4]);

      const func: ParsedFunction = {
        name: methodName,
        returnType: returnType,
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