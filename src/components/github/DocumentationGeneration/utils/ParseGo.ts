import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseGo = (lines: string[], parsed: ParsedFile) => {
    let currentStruct: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let lastCommentLine = -1; // Track where comments end

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle comments
        if (line.startsWith('//')) {
            commentBuffer.push(line.replace(/^\/\/\s?/, ''));
            lastCommentLine = i;
            continue;
        }

        if (line.startsWith('/*')) {
            while (i < lines.length && !lines[i].includes('*/')) {
                commentBuffer.push(lines[i].trim().replace(/^[\/\*\s]+/, ''));
                i++;
                lastCommentLine = i;
            }
            continue;
        }

        // Clear comment buffer if there's a gap (empty line) between comment and code
        if (!line && commentBuffer.length > 0 && i > lastCommentLine + 1) {
            commentBuffer = [];
        }

        // Struct detection
        const structMatch = line.match(/^type\s+(\w+)\s+struct/);
        if (structMatch) {
            currentStruct = {
                name: structMatch[1],
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
        if (currentStruct && line && !line.includes('func') && !line.includes('}')) {
            const fieldMatch = line.match(/^(\w+)\s+([\w\[\]\*]+)(?:\s+`json:"(\w+)"`)?/);
            if (fieldMatch) {
                currentStruct.properties.push({
                    name: fieldMatch[1],
                    type: fieldMatch[2],
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
            }
        }

        // Function detection (including receiver methods)
        const funcMatch = line.match(/^func(?:\s+\((\w+)\s+\*?(\w+)\))?\s+(\w+)\s*\(([^)]*)\)(?:\s+\(([^)]+)\)|\s+([\w\[\]\*]+))?/);
        if (funcMatch) {
            const receiverVar = funcMatch[1];
            const receiverType = funcMatch[2];
            const methodName = funcMatch[3];
            const paramsStr = funcMatch[4];
            const returnMultiple = funcMatch[5];
            const returnSingle = funcMatch[6];

            const returnType = returnMultiple || returnSingle || 'void';

            const parameters = paramsStr.split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    const parts = param.split(/\s+/);
                    if (parts.length >= 2) {
                        return {name: parts[0], type: parts.slice(1).join(' ')};
                    }
                    return {name: param, type: 'interface{}'};
                });

            const func: ParsedFunction = {
                name: methodName,
                returnType,
                parameters,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1
            };

            // If it has a receiver, it's a method
            if (receiverType) {
                const structClass = parsed.classes.find(c => c.name === receiverType);
                if (structClass) {
                    structClass.methods.push(func);
                } else {
                    parsed.functions.push(func);
                }
            } else {
                parsed.functions.push(func);
            }

            commentBuffer = [];
        }

        // Clear struct context when exiting
        if (currentStruct && line === '}') {
            currentStruct = null;
        }
    }
};