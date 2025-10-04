import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";
import {parseParameters} from "@/components/github/Doxygen/Doxygen";


export const parseRust = (lines: string[], parsed: ParsedFile) => {
  let currentStruct: ParsedClass | null = null;
  let commentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('///')) {
      commentBuffer.push(line.replace(/^\/{2,3}/, '').trim());
      continue;
    }

    // Struct detection
    const structMatch = line.match(/struct\s+(\w+)/);
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
    const funcMatch = line.match(/fn\s+(\w+)\s*\(([^)]*)\)\s*->\s*(\w+)/);
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