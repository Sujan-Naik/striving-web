import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";
import {parseParameters} from "@/components/github/Doxygen/Doxygen";


export const parseRuby = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('=begin')) {
      while (i < lines.length && !lines[i].includes('=end')) {
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
    const methodMatch = line.match(/def\s+(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const methodName = methodMatch[1];
      const parameters = parseParameters(methodMatch[2]);

      const func: ParsedFunction = {
        name: methodName,
        returnType: 'unknown',
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