// Import parsing utilities for different languages
import { useEffect, useState } from "react";
import DirectoryExplorer from "@/components/github/DirectoryExplorer/DirectoryExplorer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ParsedFile,
  parseFileContent,
} from "@/components/github/DocumentationGeneration/utils/ParseMaster"; // Swift parsing

// Define the props for the Doxygen component
interface DoxygenProps {
  owner: string;
  repo: string;
  initialBranch?: string;
}

export default function DocumentationGeneration({
  owner,
  repo,
  initialBranch = "main",
}: DoxygenProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null);
  const [markdownOutput, setMarkdownOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentationMode, setDocumentationMode] = useState<
    "single" | "overview"
  >("single");

  useEffect(() => {
    loadBranches();

  }, [owner, repo]);



  useEffect(() => {
    if (selectedFile && fileContent) {
      generateDocumentation();
    }
  }, [selectedFile, fileContent]);

  // Load branches from GitHub repository through API route
  const loadBranches = async () => {
  if (!owner || !repo) return;
  try {
    const res = await fetch(`/api/github/${owner}/${repo}/branches`);
    const response = await res.json();
    if (res.ok) {
      setBranches(response || []);
    } else {
      setError(response.error || "Failed to load branches");
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error occurred");
  }
};

  // Handle file selection and load its content
  const handleFileSelect = async (filePath: string) => {
  if (!shouldDocumentFile(filePath)) {
    setError(`File type not supported for documentation: ${filePath}`);
    return;
  }
  setIsLoading(true);
  setError(null);
  try {
    const res = await fetch(
      `/api/github/${owner}/${repo}/file?path=${encodeURIComponent(
        filePath
      )}&branch=${currentBranch}`
    );
    const response = await res.json();
    if (res.ok && response.decodedContent) {
      setSelectedFile(filePath);
      setFileContent(response.decodedContent);
    } else {
      setError(response.error || "Failed to load file content");
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load file");
  } finally {
    setIsLoading(false);
  }
};

  // Determine if the file should be documented based on its extension
  const shouldDocumentFile = (filePath: string): boolean => {
    const supportedExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".h",
      ".hpp",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".swift",
      ".kt",
      ".scala",
    ];
    return supportedExtensions.some((ext) =>
      filePath.toLowerCase().endsWith(ext)
    );
  };

  // Generate documentation from parsed data
  const generateDocumentation = () => {
    if (!fileContent || !selectedFile) return;

    const parsed = parseFileContent(fileContent, selectedFile);
    setParsedData(parsed);

    const markdown = generateMarkdown(parsed);

    // DEBUG: Log the actual markdown
    console.log("=== GENERATED MARKDOWN ===");
    console.log(markdown);
    console.log("=== END MARKDOWN ===");
    setMarkdownOutput(markdown);
  };

  // Generate markdown from parsed file data
  const generateMarkdown = (data: ParsedFile): string => {
    let md = "";

    md += `# Documentation for \`${data.path}\`\n\n`;
    md += `${data.description}\n\n`;

    md += `## Table of Contents\n\n`;
    if (data.imports.length > 0) md += `- [Imports](#imports)\n`;
    if (data.constants.length > 0) md += `- [Constants](#constants)\n`;
    if (data.classes.length > 0) md += `- [Classes](#classes)\n`;
    if (data.functions.length > 0) md += `- [Functions](#functions)\n`;
    md += `\n`;

    if (data.imports.length > 0) {
      md += `## Imports\n\n`;
      md += "```javascript\n";
      data.imports.forEach((imp) => (md += `${imp}\n`));
      md += "```\n\n";
    }

    if (data.constants.length > 0) {
      md += `## Constants\n\n`;
      md += `| Name | Value | Description |\n`;
      md += `|------|-------|-------------|\n`;
      data.constants.forEach((constant) => {
        md += `| \`${constant.name}\` | \`${constant.value}\` | ${
          constant.description || "No description"
        } |\n`;
      });
      md += `\n`;
    }

    if (data.classes.length > 0) {
      md += `## Classes\n\n`;
      data.classes.forEach((cls) => {
        md += `### \`${cls.name}\`\n\n`;
        md += `**File:** \`${cls.file}\` (Line ${cls.lineNumber})\n\n`;
        if (cls.inheritance) {
          md += `**Extends:** \`${cls.inheritance}\`\n\n`;
        }
        md += `${cls.description}\n\n`;

        if (cls.methods.length > 0) {
          md += `#### Methods\n\n`;
          cls.methods.forEach((method) => {
            md += `##### \`${method.name}(${method.parameters
              .map((p) => `${p.name}: ${p.type}`)
              .join(", ")})\`\n\n`;
            md += `**Returns:** \`${method.returnType}\`\n\n`;
            md += `${method.description}\n\n`;

            if (method.parameters.length > 0) {
              md += `**Parameters:**\n\n`;
              md += `| Name | Type | Description |\n`;
              md += `|------|------|-------------|\n`;
              method.parameters.forEach((param) => {
                md += `| \`${param.name}\` | \`${param.type}\` | ${
                  param.description || "No description"
                } |\n`;
              });
              md += `\n`;
            }
          });
        }

        if (cls.properties.length > 0) {
          md += `#### Properties\n\n`;
          md += `| Name | Type | Description |\n`;
          md += `|------|------|-------------|\n`;
          cls.properties.forEach((prop) => {
            md += `| \`${prop.name}\` | \`${prop.type}\` | ${
              prop.description || "No description"
            } |\n`;
          });
          md += `\n`;
        }
      });
    }

    if (data.functions.length > 0) {
      md += `## Functions\n\n`;
      data.functions.forEach((func) => {
        md += `### \`${func.name}(${func.parameters
          .map((p) => `${p.name}: ${p.type}`)
          .join(", ")})\`\n\n`;
        md += `**File:** \`${func.file}\` (Line ${func.lineNumber})\n\n`;
        md += `**Returns:** \`${func.returnType}\`\n\n`;
        md += `${func.description}\n\n`;

        if (func.parameters.length > 0) {
          md += `**Parameters:**\n\n`;
          md += `| Name | Type | Description |\n`;
          md += `|------|------|-------------|\n`;
          func.parameters.forEach((param) => {
            md += `| \`${param.name}\` | \`${param.type}\` | ${
              param.description || "No description"
            } |\n`;
          });
          md += `\n`;
        }
      });
    }

    return md;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "800px",
        border: `var(--border-thickness) solid var(--border-color)`,
      }}
    >
      {/* Directory Explorer */}
      <DirectoryExplorer
        fullRepoName={`${owner}/${repo}`}
        branch={currentBranch}
        onFileSelect={handleFileSelect}
        onBranchChange={setCurrentBranch}
        style={{ width: "350px" }}
      />

      {/* Documentation Viewer */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: "var(--padding-thickness)",
            borderBottom: `var(--border-thickness) solid var(--border-color)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--background-primary)",
            color: "var(--foreground-primary)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              📚 Doxygen Documentation
            </h3>
            {selectedFile && (
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "14px",
                  color: "var(--foreground-secondary)",
                }}
              >
                {selectedFile}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setDocumentationMode("single")}
              style={{
                padding: "var(--button-padding)",
                backgroundColor:
                  documentationMode === "single"
                    ? "var(--highlight)"
                    : "var(--base-background)",
                color:
                  documentationMode === "single"
                    ? "var(--foreground-primary)"
                    : "var(--foreground-secondary)",
                border: `var(--border-thickness) solid var(--border-color)`,
                borderRadius: "var(--border-radius)",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Single File
            </button>
            <button
              onClick={() => setDocumentationMode("overview")}
              style={{
                padding: "var(--button-padding)",
                backgroundColor:
                  documentationMode === "overview"
                    ? "var(--highlight)"
                    : "var(--base-background)",
                color:
                  documentationMode === "overview"
                    ? "var(--foreground-primary)"
                    : "var(--foreground-secondary)",
                border: `var(--border-thickness) solid var(--border-color)`,
                borderRadius: "var(--border-radius)",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "20px",
            backgroundColor: "var(--background-tertiary)",
          }}
        >
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
                color: "var(--foreground-secondary)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚙️</div>
              <div>Generating documentation...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#d73a49",
                border: `var(--border-thickness) solid #fdaeb7`,
                borderRadius: "var(--border-radius)",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {!selectedFile && !isLoading && !error && (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
                color: "var(--foreground-secondary)",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📄</div>
              <h3>Select a file to generate documentation</h3>
              <p>
                Choose a source code file from the directory explorer to see its
                auto-generated documentation.
              </p>
              <div style={{ marginTop: "20px", fontSize: "14px" }}>
                <strong>Supported file types:</strong>
                <br />
                TypeScript/JavaScript (.ts, .tsx, .js, .jsx)
                <br />
                Python (.py) • Java (.java) • C/C++ (.c, .cpp, .h, .hpp)
                <br />
                C# (.cs) • PHP (.php) • Ruby (.rb) • Go (.go) • Rust (.rs)
              </div>
            </div>
          )}

          {markdownOutput && !isLoading && (
            <div
              style={{
                maxWidth: "none",
                lineHeight: "1.6",
                color: "var(--foreground-primary)",
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1
                      style={{
                        borderBottom: `2px solid var(--border-color)`,
                        paddingBottom: "10px",
                        color: "var(--foreground-primary)",
                      }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      style={{
                        borderBottom: `1px solid var(--border-color)`,
                        paddingBottom: "8px",
                        marginTop: "30px",
                        color: "var(--foreground-primary)",
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      style={{ marginTop: "25px", color: "var(--link-color)" }}
                    >
                      {children}
                    </h3>
                  ),
                  code: ({ children, className }) => {
                    if (className?.includes("language-")) {
                      return (
                        <code
                          className={className}
                          style={{
                            padding: "16px",
                            borderRadius: "var(--border-radius)",
                            display: "block",
                            overflow: "auto",
                          }}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        style={{
                          padding: "2px 4px",
                          borderRadius: "3px",
                          fontSize: "85%",
                        }}
                      >
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <table
                      style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        marginBottom: "16px",
                      }}
                    >
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th
                      style={{
                        border: `var(--border-thickness) solid var(--border-color)`,
                        padding: "8px 13px",
                        backgroundColor: "var(--background-secondary)",
                        fontWeight: "bold",
                        color: "var(--foreground-primary)",
                      }}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td
                      style={{
                        border: `var(--border-thickness) solid var(--border-color)`,
                        padding: "8px 13px",
                        color: "var(--foreground-secondary)",
                      }}
                    >
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      style={{
                        borderLeft: `4px solid var(--border-color)`,
                        paddingLeft: "16px",
                        color: "var(--foreground-tertiary)",
                        margin: "0 0 16px 0",
                      }}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {markdownOutput}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
