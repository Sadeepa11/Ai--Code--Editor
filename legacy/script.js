// Select IDE Elements
const themeToggle = document.getElementById('theme-toggle');
const analyzeBtn = document.getElementById('analyze-btn');
const runBtn = document.getElementById('run-btn');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');
const statusLine = document.getElementById('status-line');
const fileTree = document.getElementById('file-tree');
const tabsList = document.getElementById('tabs-list');
const consoleOutput = document.getElementById('console-output');
const clearConsoleBtn = document.getElementById('clear-console');

// --- FILE SYSTEM STATE ---
let files = JSON.parse(localStorage.getItem('ide_files')) || {};
let activeFile = Object.keys(files)[0] || null;

// Initialize CodeMirror
const editor = CodeMirror(document.getElementById('editor-wrapper'), {
    value: activeFile ? files[activeFile].content : '',
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 4,
});

// Update status bar
editor.on('cursorActivity', () => {
    if (!activeFile) return;
    const pos = editor.getCursor();
    statusLine.textContent = `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;
});

// Sync editor changes back to state
editor.on('change', () => {
    if (activeFile && files[activeFile]) {
        files[activeFile].content = editor.getValue();
        localStorage.setItem('ide_files', JSON.stringify(files));
    }
});

// --- UI RENDERING ---
function renderExplorer() {
    fileTree.innerHTML = '';
    const fileNames = Object.keys(files);
    if (fileNames.length === 0) {
        fileTree.innerHTML = '<div class="sidebar-header" style="opacity:0.5; font-weight:400">No files</div>';
    }
    fileNames.forEach(fileName => {
        const item = document.createElement('div');
        item.className = `file-item ${fileName === activeFile ? 'active' : ''}`;
        item.innerHTML = `<span>${files[fileName].type === 'folder' ? '📁' : '📄'} ${fileName}</span>`;
        item.onclick = () => switchFile(fileName);
        fileTree.appendChild(item);
    });
    updateEditorVisibility();
}

function renderTabs() {
    tabsList.innerHTML = '';
    if (!activeFile) return;
    const tab = document.createElement('div');
    tab.className = 'tab active';
    tab.textContent = activeFile;
    tabsList.appendChild(tab);
}

function updateEditorVisibility() {
    const emptyState = document.getElementById('empty-state');
    const cmElement = document.querySelector('.CodeMirror');
    if (activeFile) {
        emptyState.style.display = 'none';
        cmElement.style.display = 'block';
    } else {
        emptyState.style.display = 'flex';
        cmElement.style.display = 'none';
    }
}

function switchFile(fileName) {
    if (!files[fileName] || files[fileName].type === 'folder') return;
    activeFile = fileName;
    editor.setValue(files[fileName].content);
    
    // Update Mode
    const ext = fileName.split('.').pop();
    const modeMap = { 'js': 'javascript', 'css': 'css', 'html': 'xml', 'md': 'markdown' };
    editor.setOption('mode', modeMap[ext] || 'javascript');
    
    renderExplorer();
    renderTabs();
}

// File Management
document.getElementById('new-file').onclick = () => {
    const name = prompt('Enter file name (e.g. script.js):');
    if (name && !files[name]) {
        files[name] = { content: '', type: 'file' };
        switchFile(name);
    }
};

document.getElementById('new-folder').onclick = () => {
    const name = prompt('Enter folder name:');
    if (name && !files[name]) {
        files[name] = { type: 'folder' };
        renderExplorer();
    }
};

// --- CONSOLE LOGIC ---
function logToConsole(msg, type = 'log') {
    const div = document.createElement('div');
    div.className = `console-${type}`;
    div.textContent = `> ${msg}`;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

runBtn.onclick = () => {
    if (!activeFile) return logToConsole('No file to run', 'error');
    logToConsole('Running ' + activeFile + '...', 'log');
    const code = editor.getValue();
    
    const nativeLog = console.log;
    console.log = (...args) => {
        logToConsole(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '), 'log');
        nativeLog(...args);
    };

    try {
        new Function(code)();
    } catch (err) {
        logToConsole(err.message, 'error');
    } finally {
        console.log = nativeLog;
    }
};

clearConsoleBtn.onclick = () => consoleOutput.innerHTML = '';

// --- THEME LOGIC ---
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    editor.setOption('theme', 'default');
    themeToggle.textContent = '🌙 Dark Mode';
}

themeToggle.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.body.removeAttribute('data-theme');
        editor.setOption('theme', 'dracula');
        themeToggle.textContent = '🌙 Switch Theme';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
        editor.setOption('theme', 'default');
        themeToggle.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'light');
    }
});

// --- AI CONFIG & CHAT ---
const API_KEY = CONFIG.API_KEY;
const MODEL = 'stepfun/step-3.5-flash:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage('user', text);
    chatInput.value = '';
    const currentCode = activeFile ? editor.getValue() : "No files open";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { 
                        role: 'system', 
                        content: `You are an AI IDE assistant. 
                        1. You can create or update MULTIPLE files.
                        2. For each file, use this format EXACTLY:
                           ### FILE: [filename.ext]
                           \`\`\`[language]
                           [content]
                           \`\`\`
                        3. I will automatically parse these markers and add the files to the user's IDE.` 
                    },
                    { role: 'user', content: `Current Context: ${activeFile ? 'File: ' + activeFile : 'No files open'}\nCode:\n${currentCode}\n\nQuestion: ${text}` }
                ]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Advanced Multi-File Parser
            const filePattern = /### FILE:\s*([^\n\r]+)[\s\S]*?```(?:[a-z]*)\n([\s\S]*?)```/g;
            let match;
            let firstFileCreated = null;

            while ((match = filePattern.exec(aiResponse)) !== null) {
                const fileName = match[1].trim();
                const fileContent = match[2].trim();
                files[fileName] = { content: fileContent, type: 'file' };
                if (!firstFileCreated) firstFileCreated = fileName;
            }

            if (firstFileCreated) {
                localStorage.setItem('ide_files', JSON.stringify(files));
                switchFile(firstFileCreated);
            }
            
            appendMessage('ai', aiResponse);
        }
    } catch (error) {
        appendMessage('ai', "Error: " + error.message);
    }
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    if (role === 'ai') msgDiv.innerHTML = marked.parse(text);
    else msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn.onclick = sendChatMessage;
chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendChatMessage(); };

// Auto-Correct (Silent)
analyzeBtn.onclick = async () => {
    if (!activeFile) return;
    const code = editor.getValue();
    const oldText = analyzeBtn.textContent;
    analyzeBtn.textContent = 'Correcting...';
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are an AI assistant. Output ONLY corrected code, no markdown.' },
                    { role: 'user', content: `Fix:\n${code}` }
                ]
            })
        });
        if (response.ok) {
            const data = await response.json();
            const clean = data.choices[0].message.content.trim().replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
            editor.setValue(clean);
        }
    } finally { analyzeBtn.textContent = oldText; }
};

// Initial Render
renderExplorer();
renderTabs();
updateEditorVisibility();
