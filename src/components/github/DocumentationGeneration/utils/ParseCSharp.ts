import {ParsedClass, ParsedFile, ParsedFunction} from "@/components/github/DocumentationGeneration/utils/ParseMaster";

export const parseCSharp = (lines: string[], parsed: ParsedFile) => {
    let currentClass: ParsedClass | null = null;
    let commentBuffer: string[] = [];
    let paramDescriptions: Record<string, string> = {};
    let inComment = false;
    let inXmlTag: string | null = null;
    let xmlTagContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle XML documentation comments (///)
        if (line.startsWith('///')) {
            const xmlContent = line.replace(/^\/\/\/\s?/, '');

            // Check for opening XML tags
            const openTagMatch = xmlContent.match(/<(summary|param|returns|remarks|example)(?:\s+name="(\w+)")?>/);
            if (openTagMatch) {
                inXmlTag = openTagMatch[1];
                xmlTagContent = [];

                // Check if it's a self-closing or same-line closing tag
                const sameLineContent = xmlContent.match(/<\w+(?:\s+name="\w+")?>(.+)<\/\w+>/);
                if (sameLineContent) {
                    if (inXmlTag === 'summary' || inXmlTag === 'remarks') {
                        commentBuffer.push(sameLineContent[1].trim());
                    } else if (inXmlTag === 'param' && openTagMatch[2]) {
                        paramDescriptions[openTagMatch[2]] = sameLineContent[1].trim();
                    }
                    inXmlTag = null;
                } else {
                    // Extract any content after the opening tag
                    const afterTag = xmlContent.substring(openTagMatch[0].length).trim();
                    if (afterTag && !afterTag.startsWith('<')) {
                        xmlTagContent.push(afterTag);
                    }
                }
                continue;
            }

            // Check for closing XML tags
            const closeTagMatch = xmlContent.match(/<\/(summary|param|returns|remarks|example)>/);
            if (closeTagMatch && inXmlTag === closeTagMatch[1]) {
                // Extract content before closing tag
                const beforeTag = xmlContent.substring(0, xmlContent.indexOf('</')).trim();
                if (beforeTag) {
                    xmlTagContent.push(beforeTag);
                }

                const fullContent = xmlTagContent.join(' ').trim();

                if (inXmlTag === 'summary' || inXmlTag === 'remarks') {
                    if (fullContent) {
                        commentBuffer.push(fullContent);
                    }
                } else if (inXmlTag === 'param') {
                    // Find the param name from the opening tag we saw earlier
                    for (let j = i - 1; j >= 0 && j >= i - 10; j--) {
                        const prevLine = lines[j].trim();
                        const paramMatch = prevLine.match(/<param\s+name="(\w+)">/);
                        if (paramMatch) {
                            paramDescriptions[paramMatch[1]] = fullContent;
                            break;
                        }
                    }
                }

                inXmlTag = null;
                xmlTagContent = [];
                continue;
            }

            // If we're inside an XML tag, accumulate content
            if (inXmlTag) {
                const content = xmlContent.replace(/<paramref\s+name="(\w+)"\s*\/>/g, '$1').trim();
                if (content && !content.startsWith('<')) {
                    xmlTagContent.push(content);
                }
            }

            continue;
        }

        // Handle multi-line /* */ comments
        if (line.startsWith('/*')) {
            inComment = true;
            const content = line.replace(/^\/\*+\s?/, '').replace(/\*+\/\s?$/, '');
            if (content) commentBuffer.push(content);
            if (line.includes('*/')) {
                inComment = false;
            }
            continue;
        } else if (inComment) {
            const content = line.replace(/^\*+\s?/, '').replace(/\*+\/\s?$/, '');
            if (content) commentBuffer.push(content);
            if (line.includes('*/')) {
                inComment = false;
            }
            continue;
        }

        // Namespace detection (for context, not parsed as class)
        if (line.startsWith('namespace ')) {
            continue;
        }

        // Class/Interface/Struct detection
        const classMatch = line.match(/^(public|private|protected|internal)?\s*(abstract|sealed|static|partial)?\s*(class|interface|struct|record)\s+(\w+)(?:\s*:\s*(.+))?/);
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

        // Property detection (with get/set)
        if (currentClass) {
            const propMatch = line.match(/^(public|private|protected|internal)?\s*(static|readonly|virtual|override|const)?\s*([\w<>,\[\]?]+)\s+(\w+)\s*\{/);
            if (propMatch) {
                currentClass.properties.push({
                    name: propMatch[4],
                    type: propMatch[3],
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                continue;
            }

            // Field detection (without get/set)
            const fieldMatch = line.match(/^(public|private|protected|internal)?\s*(static|readonly|const)?\s*([\w<>,\[\]?]+)\s+(\w+)\s*[;=]/);
            if (fieldMatch && !line.includes('(')) {
                currentClass.properties.push({
                    name: fieldMatch[4],
                    type: fieldMatch[3],
                    description: commentBuffer.join(' ') || undefined
                });
                commentBuffer = [];
                paramDescriptions = {};
                continue;
            }
        }

        // Method/Constructor detection
        const methodMatch = line.match(/^(public|private|protected|internal)?\s*(static|virtual|override|async|abstract|sealed|extern)?\s*([\w<>,\[\]?]+)\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch && !line.includes('class') && !line.includes('interface') && !line.includes('struct')) {
            const visibility = methodMatch[1] || 'private';
            const modifier = methodMatch[2];
            const returnType = methodMatch[3];
            const methodName = methodMatch[4];
            const paramsStr = methodMatch[5];

            const parameters = paramsStr.split(',')
                .map(p => p.trim())
                .filter(p => p)
                .map(param => {
                    // Handle various C# parameter patterns
                    const match = param.match(/(?:(ref|out|in|params)\s+)?([\w<>,\[\]?]+)\s+(\w+)(?:\s*=\s*.+)?/);
                    if (match) {
                        const modifier = match[1];
                        const type = match[2];
                        const name = match[3];
                        return {
                            type: modifier ? `${modifier} ${type}` : type,
                            name,
                            description: paramDescriptions[name]
                        };
                    }
                    return {type: 'object', name: param};
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