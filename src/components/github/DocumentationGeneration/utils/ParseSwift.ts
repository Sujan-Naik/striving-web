import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseSwift = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let paramDescriptions: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle documentation comments
        if (line.startsWith('///')) {
            const comment = line.replace(/^\/{2,3}/, '').trim();

            // Extract parameter descriptions
            const paramMatch = comment.match(/^-\s+[Pp]arameter\s+(\w+):\s+(.+)/);
            if (paramMatch) {
                paramDescriptions[paramMatch[1]] = paramMatch[2];
            } else {
                commentBuffer.push(comment);
            }
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

        // Class/Struct/Protocol detection
        const classMatch = line.match(/^(public|private|internal|fileprivate)?\s*(final|open)?\s*(class|struct|protocol|enum)\s+(\w+)(?:\s*:\s*(.+))?/);
        if (classMatch) {
            const inheritance = classMatch[5]?.split(',').map(s => s.trim());
            currentClass = {
                name: classMatch[4],
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                methods: [],
                properties: [],
                inheritance: inheritance?.[0]
            };
            parsed.classes.push(currentClass);
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        }

        // Property detection
        if (currentClass) {
            const propMatch = line.match(/^(public|private|internal|fileprivate)?\s*(static|lazy)?\s*(let|var)\s+(\w+):\s*([\w<>,\[\]?]+)/);
            if (propMatch) {
                currentClass.properties.push({
                    name: propMatch[4],
                    type: propMatch[5],
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                continue;
            }
        }

        // Function/Method detection (comprehensive)
        const funcMatch = line.match(/^(public|private|internal|fileprivate)?\s*(static|class)?\s*func\s+(\w+)(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*(?:throws|rethrows))?\s*(?:->\s*([\w<>,\[\]?]+))?/);
        if (funcMatch) {
            const visibility = funcMatch[1];
            const modifier = funcMatch[2];
            const methodName = funcMatch[3];
            const paramsStr = funcMatch[4];
            const returnType = funcMatch[5] || 'Void';

            const parameters = paramsStr.split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    // Swift parameters: externalName internalName: Type
                    const match = param.match(/(?:(\w+)\s+)?(\w+):\s*([\w<>,\[\]?]+)/);
                    if (match) {
                        const internalName = match[2];
                        return {
                            name: internalName,
                            type: match[3],
                            description: paramDescriptions[internalName]
                        };
                    }
                    return {name: param, type: 'Any'};
                });

            const func: ParsedFunction = {
                name: methodName,
                returnType,
                parameters,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                isStatic: modifier === 'static' || modifier === 'class',
                isPrivate: visibility === 'private' || visibility === 'fileprivate'
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