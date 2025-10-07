import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

// Clean Javadoc HTML and inline tags
const cleanJavadocText = (text: string): string => {
    return text
        // Remove <pre> blocks entirely (they're usually code examples we can't format well)
        .replace(/<pre>[\s\S]*?<\/pre>/g, '')
        // Remove HTML tags but keep content
        .replace(/<\/?[^>]+(>|$)/g, '')
        // Convert {@code x} to `x`
        .replace(/\{@code\s+([^}]+)\}/g, '`$1`')
        // Convert {@link x} to x
        .replace(/\{@link\s+([^}]+)\}/g, '$1')
        // Convert {@literal x} to x
        .replace(/\{@literal\s+([^}]+)\}/g, '$1')
        // Remove other inline tags
        .replace(/\{@\w+\s+([^}]+)\}/g, '$1')
        // Clean up extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
};

export const parseJava = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let paramDescriptions: Record<string, string> = {};
    let returnDescription: string = '';
    let inComment = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle Javadoc comments
        if (line.startsWith('/**')) {
            inComment = true;
            commentBuffer = [];
            paramDescriptions = {};
            returnDescription = '';
            continue;
        } else if (line.includes('*/')) {
            inComment = false;
            continue;
        } else if (inComment) {
            const comment = line.replace(/^\*\s?/, '');

            // Extract @param descriptions
            const paramMatch = comment.match(/^@param\s+(\w+)\s+(.+)/);
            if (paramMatch) {
                paramDescriptions[paramMatch[1]] = cleanJavadocText(paramMatch[2]);
                continue;
            }

            // Extract @return description
            const returnMatch = comment.match(/^@return\s+(.+)/);
            if (returnMatch) {
                returnDescription = cleanJavadocText(returnMatch[1]);
                continue;
            }

            // Skip other @ tags
            if (comment.startsWith('@')) {
                continue;
            }

            // Add to comment buffer and clean HTML
            if (comment) {
                commentBuffer.push(cleanJavadocText(comment));
            }
            continue;
        }

        // Class detection (improved)
        const classMatch = line.match(/^(public|private|protected)?\s*(abstract|final)?\s*(class|interface|enum)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+))?/);
        if (classMatch) {
            currentClass = {
                name: classMatch[4],
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                methods: [],
                properties: [],
                inheritance: classMatch[5]
            };
            parsed.classes.push(currentClass);
            commentBuffer = [];
            paramDescriptions = {};
            returnDescription = '';
            continue;
        }

        // Field detection
        if (currentClass) {
            const fieldMatch = line.match(/^(public|private|protected)?\s*(static|final)?\s*([\w<>,\[\]]+)\s+(\w+)\s*[=;]/);
            if (fieldMatch && !line.includes('(')) {
                currentClass.properties.push({
                    name: fieldMatch[4],
                    type: fieldMatch[3],
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                returnDescription = '';
                continue;
            }
        }

        // Method detection (comprehensive)
        const methodMatch = line.match(/^(public|private|protected)?\s*(static|final|abstract)?\s*([\w<>,\[\]]+)\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch && !line.includes('class') && !line.includes('interface')) {
            const visibility = methodMatch[1] || 'package-private';
            const modifier = methodMatch[2];
            const returnType = methodMatch[3];
            const methodName = methodMatch[4];
            const paramsStr = methodMatch[5];

            const parameters = paramsStr.split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    const parts = param.split(/\s+/);
                    const name = parts[parts.length - 1];
                    const type = parts.slice(0, -1).join(' ');
                    return {
                        type: type || 'unknown',
                        name,
                        description: paramDescriptions[name]
                    };
                });

            // Build description - don't duplicate return info since it's in the type already
            let fullDescription = commentBuffer.join(' ') || 'No description available.';

            // Only add return description if it's meaningfully different from just the type
            if (returnDescription && returnDescription.toLowerCase() !== returnType.toLowerCase()) {
                fullDescription += `\n\n*Returns:* ${returnDescription}`;
            }

            const func: ParsedFunction = {
                name: methodName,
                returnType,
                parameters,
                description: fullDescription,
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
            returnDescription = '';
        }
    }
};