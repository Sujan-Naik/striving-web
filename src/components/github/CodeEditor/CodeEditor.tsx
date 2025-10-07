// components/github/CodeEditor/CodeEditor.tsx
'use client';
import {useEffect, useState} from 'react';
import {CodeAction} from "@/types/codeActions";
import DirectoryExplorer from '../DirectoryExplorer/DirectoryExplorer';
import {HeadedSelect, VariantEnum} from "headed-ui";

// AVAILABLE_MODELS - extended with Grok models
const AVAILABLE_MODELS = [
    // OpenAI models
    {id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI'},
    {id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI'},
    {id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI'},
    {id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', provider: 'OpenAI'},
    {id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI'},
    {id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI'},
    {id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI'},
    {id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI'},
    {id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI'},
    {id: 'gpt-4o-2024-05-13', name: 'GPT-4o (2024-05-13)', provider: 'OpenAI'},
    {id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI'},
    {id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI'},
    {id: 'o3', name: 'o3', provider: 'OpenAI'},
    {id: 'o4-mini', name: 'o4-mini (efficient reasoning)', provider: 'OpenAI'},
    {id: 'o3-mini', name: 'o3-mini', provider: 'OpenAI'},
    {id: 'o1-mini', name: 'o1-mini', provider: 'OpenAI'},
    // Grok models
    {id: 'grok-code-fast-1', name: 'Grok-Code-Fast-1', provider: 'xAI'},
    {id: 'grok-4-fast-reasoning', name: 'Grok-4-Fast Reasoning', provider: 'xAI'},
    {id: 'grok-4-fast-non-reasoning', name: 'Grok-4-Fast Non-Reasoning', provider: 'xAI'},
    {id: 'grok-4-0709', name: 'Grok-4-0709', provider: 'xAI'},
    {id: 'grok-3-mini', name: 'Grok-3 Mini', provider: 'xAI'},
    {id: 'grok-3', name: 'Grok-3', provider: 'xAI'},
] as const;

type ModelId = typeof AVAILABLE_MODELS[number]['id'];

// PRICING for display in UI (prompt/completion per million tokens)
const PRICING = {
    // OpenAI
    "gpt-5": {prompt: 1.25, completion: 10.00},
    "gpt-5-mini": {prompt: 0.25, completion: 2.00},
    "gpt-5-nano": {prompt: 0.05, completion: 0.40},
    "gpt-5-chat-latest": {prompt: 1.25, completion: 10.00},
    "gpt-4.1": {prompt: 2.00, completion: 8.00},
    "gpt-4.1-mini": {prompt: 0.40, completion: 1.60},
    "gpt-4.1-nano": {prompt: 0.10, completion: 0.40},
    "gpt-4o": {prompt: 2.50, completion: 10.00},
    "gpt-4o-2024-05-13": {prompt: 5.00, completion: 15.00},
    "gpt-4o-mini": {prompt: 0.15, completion: 0.60},
    "o3": {prompt: 2.00, completion: 8.00},
    "o4-mini": {prompt: 1.10, completion: 4.40},
    "o3-mini": {prompt: 1.10, completion: 4.40},
    "o1-mini": {prompt: 1.10, completion: 4.40},
    "gpt-4-turbo": {prompt: 10.00, completion: 30.00},
    "gpt-3.5-turbo": {prompt: 0.50, completion: 1.50},
    // Grok
    "grok-code-fast-1": {prompt: 0.20, completion: 1.50},
    "grok-4-fast-reasoning": {prompt: 0.20, completion: 0.80},
    "grok-4-fast-non-reasoning": {prompt: 0.20, completion: 0.80},
    "grok-4-0709": {prompt: 5.00, completion: 15.00},
    "grok-3-mini": {prompt: 0.30, completion: 0.50},
    "grok-3": {prompt: 3.00, completion: 15.00},
} as const;

interface CodeActionsProps {
    actions: CodeAction[];
    onApprove: (actions: CodeAction[]) => void;
    onReject: () => void;
}

function CodeActions({actions, onApprove, onReject}: CodeActionsProps) {
    return (
        <div style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
            <h4>Pending Changes</h4>
            {actions.map(action => (
                <div key={action.id} style={{marginBottom: '5px'}}>
                    {action.type} {action.path}: {action.message}
                </div>
            ))}
            <button onClick={() => onApprove(actions)}>Approve All</button>
            <button onClick={onReject} style={{marginLeft: '10px'}}>Reject</button>
        </div>
    );
}

function FileSelector({
                          files,
                          selectedFiles,
                          onToggleFile,
                          onSelectAll,
                          onDeselectAll,
                          onSend,
                          onCancel,
                          sending,
                          selectedModel,
                          setSelectedModel,
                      }: {
    files: Array<{ path: string; content: string; type: string }>;
    selectedFiles: Set<string>;
    onToggleFile: (path: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onSend: () => void;
    onCancel: () => void;
    sending: boolean;
    selectedModel: ModelId;
    setSelectedModel: (model: ModelId) => void;


}) {

    const options = AVAILABLE_MODELS.map(model => {
        const price = PRICING[model.id as keyof typeof PRICING];
        return {
            value: model.id,
            label: `${model.name} (${model.provider}) - In: ${price.prompt.toFixed(2)} / Out: ${price.completion.toFixed(2)} per MTok`
        }
    })

    return (
        <div style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
            <h4>Select files to send to LLM</h4>
            <div style={{marginBottom: '10px'}}>
                <label style={{fontSize: 14, color: "#666"}}>
                    Model:
                </label>
                <HeadedSelect
                    variant={VariantEnum.Outline}
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as ModelId)}
                    label={'Model'}
                    options={options}
                />
            </div>
            <div style={{marginBottom: '10px'}}>
                <button onClick={onSelectAll}>Select All</button>
                <button onClick={onDeselectAll} style={{marginLeft: '5px'}}>Deselect All</button>
                <span style={{marginLeft: '10px'}}>{selectedFiles.size} files selected</span>
            </div>
            <div style={{maxHeight: '200px', overflowY: 'auto', marginBottom: '10px'}}>
                {files.map(file => (
                    <div key={file.path} style={{marginBottom: '5px'}}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedFiles.has(file.path)}
                                onChange={() => onToggleFile(file.path)}
                            />
                            <span style={{marginLeft: '5px'}}>{file.path}</span>
                        </label>
                    </div>
                ))}
            </div>
            <button onClick={onSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send to LLM'}
            </button>
            <button onClick={onCancel} style={{marginLeft: '10px'}}>
                Cancel
            </button>
        </div>
    );
}

interface CodeEditorProps {
    owner: string;
    repo: string;
    initialPath?: string;
}

export default function CodeEditor({owner, repo, initialPath = ''}: CodeEditorProps) {
    const fullRepoName = `${owner}/${repo}`;

    const [currentPath, setCurrentPath] = useState(initialPath);
    const [currentFile, setCurrentFile] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');
    const [branches, setBranches] = useState<any[]>([]);
    const [currentBranch, setCurrentBranch] = useState<string>('main');
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    // LLM integration state
    const [pendingActions, setPendingActions] = useState<CodeAction[]>([]);
    const [showActions, setShowActions] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [allRepoFiles, setAllRepoFiles] = useState<Array<{ path: string, content: string, type: string }>>([]);
    const [pendingPrompt, setPendingPrompt] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<ModelId>('o4-mini');

    useEffect(() => {
        loadBranches();
    }, [owner, repo]);

    const loadBranches = async () => {
        if (!owner || !repo) return;
        const response = await fetch(`/api/github/${fullRepoName}/branches`);
        if (response.ok) {
            const data = await response.json();
            setBranches(data || []);
        }
    };

    const handleFileSelect = async (filePath: string) => {
        setIsLoadingFile(true);
        try {
            const response = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(filePath)}&branch=${currentBranch}`);
            const data = await response.json();
            if (response.ok && data.decodedContent) {
                setCurrentFile(filePath);
                setFileContent(data.decodedContent);
            }
        } catch (error) {
            console.error('Error loading file:', error);
        } finally {
            setIsLoadingFile(false);
        }
    };

    const handleDirectoryChange = (path: string) => {
        setCurrentPath(path);
        setCurrentFile('');
        setFileContent('');
    };

    const handleBranchChange = (branch: string) => {
        setCurrentBranch(branch);
        setCurrentFile('');
        setFileContent('');
    };

    const saveFile = async () => {
        if (!currentFile) return;
        try {
            const getFileResp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(currentFile)}&branch=${currentBranch}`);
            const getFileData = await getFileResp.json();
            const sha = getFileResp.ok ? getFileData.sha : undefined;

            const response = await fetch(`/api/github/${fullRepoName}/file`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    path: currentFile,
                    message: `Update ${currentFile}`,
                    content: fileContent,
                    sha,
                    branch: currentBranch
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert('File saved successfully!');
            } else {
                alert('Failed to save file: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file');
        }
    };

    const getAllRepositoryFiles = async (path: string = ''): Promise<Array<{
        path: string,
        content: string,
        type: string
    }>> => {
        const files: Array<{ path: string, content: string, type: string }> = [];
        try {
            const response = await fetch(`/api/github/${fullRepoName}/contents?path=${encodeURIComponent(path)}&branch=${currentBranch}`);
            const data = await response.json();
            if (!response.ok) return files;

            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
                if (item.type === 'file') {
                    const fileResp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(item.path)}&branch=${currentBranch}`);
                    const fileData = await fileResp.json();
                    if (fileResp.ok && fileData.decodedContent) {
                        files.push({
                            path: item.path,
                            content: fileData.decodedContent,
                            type: item.type
                        });
                    }
                } else if (item.type === 'dir') {
                    const subFiles = await getAllRepositoryFiles(item.path);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            console.error('Error fetching repository files:', error);
        }
        return files;
    };

    const requestLLMChanges = async (prompt: string) => {
        setPendingPrompt(prompt);
        const codebaseFiles = await getAllRepositoryFiles();
        setAllRepoFiles(codebaseFiles);
        setShowFileSelector(true);
    };

    const [sending, setSending] = useState(false);

    const sendToLLM = async () => {
        if (sending) return;
        setSending(true);
        const selectedFileData = allRepoFiles.filter(file => selectedFiles.has(file.path));

        try {
            const response = await fetch('/api/bedrock/code-actions', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    query: pendingPrompt,
                    owner,
                    repo,
                    branch: currentBranch,
                    codebase: selectedFileData,
                    model: selectedModel, // Pass selected model
                })
            });

            const result = await response.json();
            if (!result.actions || !Array.isArray(result.actions)) {
                console.error('Invalid response:', result);
                alert('Failed to get code actions from LLM');
                return;
            }

            const actions = result.actions.map((action: any, index: number) => ({
                ...action,
                id: `${Date.now()}-${index}`,
                status: 'pending'
            }));

            setPendingActions(actions);
            setShowActions(true);
            setShowFileSelector(false);
            setSelectedFiles(new Set());
        } catch (error) {
            console.error('Error sending to LLM:', error);
            alert('Failed to send request to LLM');
        } finally {
            setSending(false);
        }
    };

    const executeActions = async (approvedActions: CodeAction[]) => {
        try {
            for (const action of approvedActions) {
                if (action.type === 'update' || action.type === 'create') {
                    let sha: string | undefined;
                    if (action.type === 'update') {
                        const resp = await fetch(`/api/github/${fullRepoName}/file?path=${encodeURIComponent(action.path)}&branch=${currentBranch}`);
                        const data = await resp.json();
                        if (resp.ok) {
                            sha = data.sha;
                        }
                    }

                    await fetch(`/api/github/${fullRepoName}/file`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            path: action.path,
                            message: action.message,
                            content: action.content,
                            sha,
                            branch: currentBranch
                        })
                    });
                }
            }

            setPendingActions([]);
            setShowActions(false);
            alert('Changes committed successfully!');
            if (currentFile && approvedActions.some(action => action.path === currentFile)) {
                handleFileSelect(currentFile);
            }
        } catch (error) {
            console.error('Error executing actions:', error);
            alert('Failed to execute some actions');
        }
    };

    return (
        <div style={{display: 'flex', height: 'auto', border: '1px solid #ccc'}}>
            <DirectoryExplorer
                fullRepoName={fullRepoName}
                branch={currentBranch}
                onFileSelect={handleFileSelect}
                onDirectoryChange={handleDirectoryChange}
                selectedFile={currentFile}
                showBranchSelector={true}
                branches={branches}
                onBranchChange={handleBranchChange}
            />
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
                    <input
                        type="text"
                        placeholder="Ask LLM to make changes... (Press Enter to submit)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                requestLLMChanges(e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {showFileSelector && (
                    <FileSelector
                        files={allRepoFiles}
                        selectedFiles={selectedFiles}
                        onToggleFile={(path) => {
                            const newSelected = new Set(selectedFiles);
                            if (newSelected.has(path)) {
                                newSelected.delete(path);
                            } else {
                                newSelected.add(path);
                            }
                            setSelectedFiles(newSelected);
                        }}
                        onSelectAll={() => setSelectedFiles(new Set(allRepoFiles.map(f => f.path)))}
                        onDeselectAll={() => setSelectedFiles(new Set())}
                        onSend={sendToLLM}
                        onCancel={() => {
                            setShowFileSelector(false);
                            setSelectedFiles(new Set());
                            setPendingPrompt('');
                        }}
                        sending={sending}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />
                )}

                {showActions && (
                    <CodeActions
                        actions={pendingActions}
                        onApprove={executeActions}
                        onReject={() => {
                            setPendingActions([]);
                            setShowActions(false);
                        }}
                    />
                )}

                {currentFile && (
                    <div style={{
                        padding: '10px',
                        borderBottom: '1px solid #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={{fontWeight: 'bold', fontSize: '14px'}}>{currentFile}</span>
                            {isLoadingFile && <span style={{marginLeft: '10px', color: '#666'}}>Loading...</span>}
                        </div>
                        <button
                            onClick={saveFile}
                            disabled={isLoadingFile}
                            style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Save
                        </button>
                    </div>
                )}

                <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    style={{
                        flex: 1,
                        border: 'none',
                        padding: '15px',
                        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        resize: 'none',
                        outline: 'none'
                    }}
                    placeholder={
                        currentFile
                            ? isLoadingFile
                                ? "Loading file content..."
                                : ""
                            : "Select a file from the directory explorer to start editing..."
                    }
                    disabled={isLoadingFile}
                />
            </div>
        </div>
    );
}