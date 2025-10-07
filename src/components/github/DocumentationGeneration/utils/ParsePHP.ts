import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parsePHP = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let paramDescriptions: Record<string, string> = {};
    let inComment = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle PHPDoc comments
        if (line.startsWith('/**')) {
            inComment = true;
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        } else if (line.includes('*/')) {
            inComment = false;
            continue;
        } else if (inComment) {
            const comment = line.replace(/^\*\s?/, '');

            // Extract @param descriptions
            const paramMatch = comment.match(/^@param\s+(?:[\w\|\\]+\s+)?\$(\w+)\s+(.+)/);
            if (paramMatch) {
                paramDescriptions[paramMatch[1]] = paramMatch[2];
            } else if (!comment.startsWith('@')) {
                commentBuffer.push(comment);
            }
            continue;
        }

        // Class detection
        const classMatch = line.match(/^(abstract|final)?\s*class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+))?/);
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
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        }

        // Property detection
        if (currentClass) {
            const propMatch = line.match(/^(public|private|protected)?\s*(static)?\s*\$(\w+)/);
            if (propMatch && !line.includes('function')) {
                currentClass.properties.push({
                    name: propMatch[3],
                    type: 'mixed',
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                continue;
            }
        }

        // Function/Method detection
        const methodMatch = line.match(/^(public|private|protected)?\s*(static|abstract|final)?\s*function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*\??([\w\\|]+))?/);
        if (methodMatch) {
            const visibility = methodMatch[1] || 'public';
            const modifier = methodMatch[2];
            const methodName = methodMatch[3];
            const paramsStr = methodMatch[4];
            const returnType = methodMatch[5] || 'mixed';

            const parameters = paramsStr.split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    const typeMatch = param.match(/^(?:\??([\w\\|]+)\s+)?\$(\w+)/);
                    if (typeMatch) {
                        return {
                            type: typeMatch[1] || 'mixed',
                            name: typeMatch[2],
                            description: paramDescriptions[typeMatch[2]]
                        };
                    }
                    return {type: 'mixed', name: param.replace('$', '')};
                });

            const func: ParsedFunction = {
                name: methodName,
                returnType,
                parameters,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                isStatic: modifier === 'static',
                isPrivate: visibility === 'private',
                isProtected: visibility === 'protected'
            };

            if (currentClass) {
                currentClass.methods.push(func);
            } else {
                parsed.functions.push(func);
            }
            commentBuffer = [];
            paramDescriptions = {};
        }
    }
};