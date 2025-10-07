import {
    ParsedClass,
    ParsedFile,
    ParsedFunction,
    parseParameters
} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseTypeScriptJavaScript = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let inComment = false;
    let commentBuffer: string[] = [];
    let paramDescriptions: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Handle JSDoc comments
        if (trimmed.startsWith('/**')) {
            inComment = true;
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        } else if (trimmed.includes('*/')) {
            inComment = false;
            continue;
        } else if (inComment) {
            const comment = trimmed.replace(/^\*\s?/, '');

            // Extract @param descriptions
            const paramMatch = comment.match(/^@param\s+(?:\{[^}]+\}\s+)?(\w+)\s+(.+)/);
            if (paramMatch) {
                paramDescriptions[paramMatch[1]] = paramMatch[2];
            } else if (comment && !comment.startsWith('@')) {
                commentBuffer.push(comment);
            }
            continue;
        }

        // Single-line comments
        if (trimmed.startsWith('//')) {
            const comment = trimmed.replace(/^\/\/\s?/, '');
            commentBuffer.push(comment);
            continue;
        }

        // Class/Interface detection
        const classMatch = trimmed.match(/^(export\s+)?(default\s+)?(abstract\s+)?(class|interface)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+))?/);
        if (classMatch) {
            currentClass = {
                name: classMatch[5],
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                methods: [],
                properties: [],
                inheritance: classMatch[6]
            };
            parsed.classes.push(currentClass);
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        }

        // Property detection (class properties)
        if (currentClass) {
            const propMatch = trimmed.match(/^(public|private|protected|readonly)?\s*(static)?\s*(\w+)(\?)?:\s*([^=;]+)/);
            if (propMatch) {
                currentClass.properties.push({
                    name: propMatch[3],
                    type: propMatch[5].trim(),
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                continue;
            }
        }

        // Function/Method detection (improved pattern)
        const functionMatch = trimmed.match(/^(export\s+)?(default\s+)?(async\s+)?(function\s+)?(\w+)\s*(<[^>]+>)?\s*\([^)]*\)(?:\s*:\s*([^{=]+))?/);
        if (functionMatch && !trimmed.includes('import') && !trimmed.includes('return')) {
            const funcName = functionMatch[5];
            const returnType = functionMatch[7]?.trim() || 'void';
            const params = parseParameters(line);

            // Enhance parameters with descriptions from JSDoc
            const enhancedParams = params.map(param => ({
                ...param,
                description: paramDescriptions[param.name] || param.description
            }));

            const func: ParsedFunction = {
                name: funcName,
                returnType,
                parameters: enhancedParams,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1
            };

            if (currentClass) {
                currentClass.methods.push(func);
            } else {
                parsed.functions.push(func);
            }
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        }

        // Arrow function detection
        const arrowMatch = trimmed.match(/^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|(\w+))\s*=>/);
        if (arrowMatch) {
            const params = parseParameters(line);
            const enhancedParams = params.map(param => ({
                ...param,
                description: paramDescriptions[param.name] || param.description
            }));

            const func: ParsedFunction = {
                name: arrowMatch[3],
                returnType: 'inferred',
                parameters: enhancedParams,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1
            };

            parsed.functions.push(func);
            commentBuffer = [];
            paramDescriptions = {};
            continue;
        }

        // Constant detection
        const constMatch = trimmed.match(/^(export\s+)?const\s+(\w+)\s*[:=]\s*(.+?)[;,]?\s*$/);
        if (constMatch && !constMatch[3].includes('=>')) {
            parsed.constants.push({
                name: constMatch[2],
                value: constMatch[3],
                description: commentBuffer.join(' ') || undefined
            });
            commentBuffer = [];
            paramDescriptions = {};
        }

        // Clear comment buffer if we hit non-comment code
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
            if (!inComment && !classMatch && !functionMatch && !arrowMatch && !constMatch) {
                commentBuffer = [];
                paramDescriptions = {};
            }
        }
    }
};
