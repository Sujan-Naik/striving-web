// Parse Java files with detailed method extraction
import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/Doxygen/utils/ParseMaster";

export const parseJava = (lines: string[], parsed: ParsedFile) => {
  let currentClass: ParsedClass | null = null;
  let commentBuffer: string[] = [];
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle multi-line comments
    if (line.startsWith('/**')) {
      inComment = true;
      commentBuffer = [];
      continue;
    } else if (line.includes('*/')) {
      inComment = false;
      continue;
    } else if (inComment) {
      const comment = line.replace(/^\*\s?/, '');
      commentBuffer.push(comment);
      continue;
    }

    // Class detection
    const classMatch = line.match(/public\s+class\s+(\w+)/);
    if (classMatch) {
      currentClass = {
        name: classMatch[1],
        description: extractDescription(commentBuffer),
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
    const methodMatch = line.match(/public\s+(static\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    if (methodMatch) {
      const returnType = methodMatch[2];
      const methodName = methodMatch[3];
      const parameters = parseJavaParameters(methodMatch[4], commentBuffer);

      const func: ParsedFunction = {
        name: methodName,
        returnType: returnType,
        parameters: parameters,
        description: extractDescription(commentBuffer),
        file: parsed.path,
        lineNumber: i + 1,
        isStatic: !!methodMatch[1]
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

// Extract description from comment buffer
const extractDescription = (commentBuffer: string[]): string => {
  return commentBuffer.filter(line => !line.startsWith('@')).join(' ').trim() || 'No description available.';
};

// Parse parameters from Java method signature and comments
const parseJavaParameters = (paramStr: string, commentBuffer: string[]): Array<{ type: string; name: string; description?: string }> => {
  const params = paramStr.split(',').map(param => param.trim());
  const paramDescriptions = extractParamDescriptions(commentBuffer);

  return params.map(param => {
    const [type, name] = param.split(' ').filter(Boolean);
    return {
      type,
      name,
      description: paramDescriptions[name] || 'No description'
    };
  });
};

// Extract parameter descriptions from Javadoc comments
const extractParamDescriptions = (commentBuffer: string[]): Record<string, string> => {
  const paramDescriptions: Record<string, string> = {};

  commentBuffer.forEach(line => {
    const paramMatch = line.match(/^@param\s+(\w+)\s+(.+)/);
    if (paramMatch) {
      paramDescriptions[paramMatch[1]] = paramMatch[2];
    }
  });

  return paramDescriptions;
};