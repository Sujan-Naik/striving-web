import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";
import {parseParameters} from "@/components/github/Doxygen/Doxygen";


export const parseGo = (lines: string[], parsed: ParsedFile) => {
  let currentStruct: ParsedClass | null = null;
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

    // Struct detection
    const structMatch = line.match(/type\s+(\w+)\s+struct/);
    if (structMatch) {
      currentStruct = {
        name: structMatch[1],
        description: commentBuffer.join(' ') || 'No description available.',
        file: parsed.path,
        lineNumber: i + 1,
        methods: [],
        properties: [],
      };
      parsed.classes.push(currentStruct);
      commentBuffer = [];
      continue;
    }

    // Function detection
    const funcMatch = line.match(/func\s+(\w+)\s*\(([^)]*)\)\s+(\w+)/);
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

      if (currentStruct) {
        currentStruct.methods.push(func);
      } else {
        parsed.functions.push(func);
      }
      commentBuffer = [];
    }
  }
};