import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseRuby = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let fileDoc: string[] = [];
    let currentIndent = 0;
    let fileDocCaptured = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const indent = line.search(/\S/);

        // Handle file-level comment block (=begin ... =end)
        if (trimmed.startsWith('=begin')) {
            const block: string[] = [];
            i++;
            while (i < lines.length && !lines[i].includes('=end')) {
                block.push(lines[i].trim());
                i++;
            }

            const blockText = block.join('\n').trim();

            // Store as file-level doc if it’s near the top or fileDoc not set
            if (!fileDocCaptured || parsed.functions.length === 0) {
                fileDoc.push(blockText);
                fileDocCaptured = true;
            } else {
                commentBuffer.push(blockText);
            }

            continue;
        }

        // Handle single-line comments
        if (trimmed.startsWith('#')) {
            commentBuffer.push(trimmed.slice(1).trim());
            continue;
        }

        // Class or Module detection
        const classMatch = trimmed.match(/^(class|module)\s+(\w+)(?:\s*<\s*(\w+))?/);
        if (classMatch) {
            currentClass = {
                name: classMatch[2],
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                methods: [],
                properties: [],
                inheritance: classMatch[3] || undefined
            };
            parsed.classes.push(currentClass);
            currentIndent = indent;
            commentBuffer = [];
            continue;
        }

        // Attribute accessors
        if (currentClass && /^attr_(reader|writer|accessor)\s+/.test(trimmed)) {
            const attrs = trimmed.match(/:(\w+)/g);
            if (attrs) {
                attrs.forEach(attr => {
                    currentClass!.properties.push({
                        name: attr.slice(1),
                        type: 'Object',
                        description: commentBuffer.join(' ') || undefined
                    });
                });
            }
            commentBuffer = [];
            continue;
        }

        // Method detection
        const methodMatch = trimmed.match(/^def\s+(self\.)?(\w+)(?:\(([^)]*)\))?/);
        if (methodMatch) {
            const isClassMethod = !!methodMatch[1];
            const methodName = methodMatch[2];
            const paramsStr = methodMatch[3] || '';

            const parameters = paramsStr
                .split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    const name = param.split('=')[0].trim();
                    return {name, type: 'Object', description: undefined};
                });

            const func: ParsedFunction = {
                name: methodName,
                returnType: 'Object',
                parameters,
                description: commentBuffer.join(' ') || 'No description available.',
                file: parsed.path,
                lineNumber: i + 1,
                isStatic: isClassMethod,
                isPrivate: methodName.startsWith('_')
            };

            if (currentClass && indent > currentIndent) {
                currentClass.methods.push(func);
            } else {
                parsed.functions.push(func);
            }
            commentBuffer = [];
            continue;
        }

        // Reset on end of class
        if (currentClass && indent <= currentIndent && trimmed === 'end') {
            currentClass = null;
        }
    }

    // Assign file-level description from =begin block
    if (fileDoc.length > 0) {
        parsed.description = fileDoc.join('\n').trim();
    }
};