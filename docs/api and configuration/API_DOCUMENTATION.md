# API Documentation

**Purpose:** Complete documentation for all API integrations in the application

---

## Overview

The application integrates with three main APIs:
1. **Firebase/Firestore API** - Database and authentication
2. **Claude API (Anthropic)** - AI orchestration
3. **Electron IPC API** - Inter-process communication

---

## 1. Firebase/Firestore API

### Setup & Configuration

#### Installation
```bash
npm install firebase
```

#### Configuration (Client-Side)
```typescript
// renderer/src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
```

#### Environment Variables
```bash
# .env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### Firestore Operations

#### Create Document
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

async function createNote(noteData: Partial<Note>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...noteData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}
```

#### Read Document
```typescript
import { doc, getDoc } from 'firebase/firestore';

async function getNote(noteId: string): Promise<Note | null> {
  try {
    const docRef = doc(db, 'notes', noteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Note;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading note:', error);
    throw error;
  }
}
```

#### Update Document
```typescript
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

async function updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
  try {
    const docRef = doc(db, 'notes', noteId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}
```

#### Delete Document
```typescript
import { doc, deleteDoc } from 'firebase/firestore';

async function deleteNote(noteId: string): Promise<void> {
  try {
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}
```

#### Query Documents
```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function searchNotes(filters: {
  category?: string;
  office?: string;
  tags?: string[];
}): Promise<Note[]> {
  try {
    let q = collection(db, 'notes');
    
    // Apply filters
    const constraints = [];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.office) {
      constraints.push(where('architectureOffice', '==', filters.office));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', filters.tags));
    }
    
    // Order by creation date
    constraints.push(orderBy('createdAt', 'desc'));
    
    const finalQuery = query(q, ...constraints);
    const querySnapshot = await getDocs(finalQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
}
```

#### Real-time Listeners
```typescript
import { collection, query, onSnapshot } from 'firebase/firestore';

function subscribeToNotes(
  callback: (notes: Note[]) => void,
  filters?: { category?: string }
): () => void {
  const q = filters?.category
    ? query(collection(db, 'notes'), where('category', '==', filters.category))
    : collection(db, 'notes');
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
    
    callback(notes);
  }, (error) => {
    console.error('Listener error:', error);
  });
  
  return unsubscribe;
}
```

#### Batch Operations
```typescript
import { writeBatch, doc } from 'firebase/firestore';

async function batchUpdateNotes(updates: Array<{ id: string; data: Partial<Note> }>): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, 'notes', id);
      batch.update(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
}
```

---

### Error Handling

```typescript
import { FirebaseError } from 'firebase/app';

function handleFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'not-found':
        return 'Document not found';
      case 'already-exists':
        return 'Document already exists';
      case 'failed-precondition':
        return 'Operation failed: precondition not met';
      case 'unavailable':
        return 'Service temporarily unavailable';
      default:
        return `Firebase error: ${error.message}`;
    }
  }
  
  return 'An unknown error occurred';
}
```

---

## 2. Claude API (Anthropic)

### Setup & Configuration

#### Installation
```bash
npm install @anthropic-ai/sdk
```

#### Configuration
```typescript
// renderer/src/services/ai/claudeClient.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.VITE_CLAUDE_API_KEY,
});

export { anthropic };
```

#### Environment Variables
```bash
# .env
VITE_CLAUDE_API_KEY=sk-ant-api03-your-api-key-here
```

---

### API Methods

#### Send Message
```typescript
interface ClaudeRequest {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

async function sendMessage(request: ClaudeRequest): Promise<ClaudeResponse> {
  try {
    const messages = [
      ...(request.conversationHistory || []),
      {
        role: 'user' as const,
        content: request.userMessage,
      },
    ];
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',  // Latest Sonnet model
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 1.0,
      system: request.systemPrompt,
      messages: messages,
    });
    
    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      stopReason: response.stop_reason || 'end_turn',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}
```

#### Streaming Response
```typescript
async function streamMessage(
  request: ClaudeRequest,
  onChunk: (text: string) => void
): Promise<ClaudeResponse> {
  try {
    const messages = [
      ...(request.conversationHistory || []),
      {
        role: 'user' as const,
        content: request.userMessage,
      },
    ];
    
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 1.0,
      system: request.systemPrompt,
      messages: messages,
      stream: true,
    });
    
    let fullText = '';
    let usage = { inputTokens: 0, outputTokens: 0 };
    
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if (delta.type === 'text_delta') {
          fullText += delta.text;
          onChunk(delta.text);
        }
      }
      
      if (event.type === 'message_delta') {
        usage.outputTokens = event.usage?.output_tokens || 0;
      }
      
      if (event.type === 'message_start') {
        usage.inputTokens = event.message.usage?.input_tokens || 0;
      }
    }
    
    return {
      content: fullText,
      stopReason: 'end_turn',
      usage,
    };
  } catch (error) {
    console.error('Claude streaming error:', error);
    throw error;
  }
}
```

#### Function/Tool Calling
```typescript
interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

async function sendMessageWithTools(
  request: ClaudeRequest,
  tools: Tool[]
): Promise<{
  content: string;
  toolCalls?: Array<{ name: string; input: any }>;
  usage: { inputTokens: number; outputTokens: number };
}> {
  try {
    const messages = [
      ...(request.conversationHistory || []),
      {
        role: 'user' as const,
        content: request.userMessage,
      },
    ];
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: request.maxTokens || 4096,
      system: request.systemPrompt,
      messages: messages,
      tools: tools,
    });
    
    const toolCalls = response.content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        name: block.name,
        input: block.input,
      }));
    
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
    
    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Claude tool calling error:', error);
    throw error;
  }
}
```

---

### Rate Limiting & Error Handling

```typescript
class ClaudeAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

async function handleClaudeRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      // Rate limiting
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] 
          ? parseInt(error.headers['retry-after']) * 1000
          : Math.pow(2, attempt) * 1000;
        
        console.log(`Rate limited. Retrying after ${retryAfter}ms`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }
      
      // Server errors (5xx) - retry with exponential backoff
      if (error.status >= 500 && error.status < 600) {
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`Server error. Retrying after ${backoff}ms`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      
      // Client errors (4xx) - don't retry
      if (error.status >= 400 && error.status < 500) {
        throw new ClaudeAPIError(
          error.status.toString(),
          `Client error: ${error.message}`
        );
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
```

---

### Token Management

```typescript
// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Truncate conversation to fit token limit
function truncateConversation(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Array<{ role: string; content: string }> {
  let totalTokens = 0;
  const truncated: Array<{ role: string; content: string }> = [];
  
  // Keep messages from newest to oldest until we hit token limit
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = estimateTokens(messages[i].content);
    
    if (totalTokens + messageTokens > maxTokens) {
      break;
    }
    
    truncated.unshift(messages[i]);
    totalTokens += messageTokens;
  }
  
  return truncated;
}
```

---

## 3. Electron IPC API

### Main Process → Renderer

#### Send Message
```typescript
// main/main.ts
import { BrowserWindow } from 'electron';

function sendToRenderer(window: BrowserWindow, channel: string, data: any) {
  window.webContents.send(channel, data);
}

// Example: Notify renderer of update
sendToRenderer(mainWindow, 'update:available', { version: '1.2.0' });
```

#### Broadcast to All Windows
```typescript
import { BrowserWindow } from 'electron';

function broadcastToAll(channel: string, data: any) {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send(channel, data);
  });
}
```

---

### Renderer → Main Process

#### IPC Handler (Main Process)
```typescript
// main/ipc/handlers.ts
import { ipcMain } from 'electron';

export function setupIpcHandlers() {
  // Window controls
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });
  
  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });
  
  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });
  
  // App info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
  
  // File operations
  ipcMain.handle('fs:selectFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    return result.canceled ? null : result.filePaths[0];
  });
}
```

#### IPC Invoke (Renderer Process)
```typescript
// renderer/src/services/electron/ipc.ts

// Window controls
export async function minimizeWindow() {
  await window.electronAPI.window.minimize();
}

export async function maximizeWindow() {
  await window.electronAPI.window.maximize();
}

export async function closeWindow() {
  await window.electronAPI.window.close();
}

// App info
export async function getAppVersion(): Promise<string> {
  return await window.electronAPI.app.getVersion();
}

// File operations
export async function selectFile(): Promise<string | null> {
  return await window.electronAPI.fs.selectFile();
}
```

---

### Event Listeners

#### Listen to Main Process Events
```typescript
// renderer
export function onWindowMaximized(callback: () => void) {
  window.electronAPI.on('window:maximized', callback);
}

export function onWindowUnmaximized(callback: () => void) {
  window.electronAPI.on('window:unmaximized', callback);
}

export function onUpdateAvailable(callback: (version: string) => void) {
  window.electronAPI.on('update:available', callback);
}

// Cleanup
export function removeListener(channel: string, callback: Function) {
  window.electronAPI.off(channel, callback);
}
```

---

### Security Best Practices

#### Context Isolation
```typescript
// main/main.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,      //  Never enable
    contextIsolation: true,       //  Always enable
    sandbox: true,                //  Enable sandbox
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

#### Whitelist IPC Channels
```typescript
// main/preload.ts
const ALLOWED_CHANNELS = [
  'window:minimize',
  'window:maximize',
  'window:close',
  'app:getVersion',
  'fs:selectFile',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: any[]) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Channel ${channel} is not allowed`);
  },
});
```

---

## API Integration Patterns

### Combined Firebase + Claude Flow
```typescript
// AI creates note via orchestrator
async function aiCreateNote(userInput: string): Promise<Note> {
  // 1. Send to Claude
  const claudeResponse = await sendMessage({
    systemPrompt: buildSystemPrompt(),
    userMessage: userInput,
  });
  
  // 2. Parse Claude's response
  const action = parseClaudeResponse(claudeResponse.content);
  
  // 3. Execute Firestore operation
  if (action.action === 'CREATE_NOTE') {
    const noteId = await createNote(action.parameters);
    const note = await getNote(noteId);
    return note!;
  }
  
  throw new Error('Invalid action');
}
```

### Error Handling Across APIs
```typescript
async function orchestrateAction(userInput: string): Promise<any> {
  try {
    // Try Claude API
    const claudeResponse = await handleClaudeRequest(() =>
      sendMessage({ systemPrompt: '', userMessage: userInput })
    );
    
    const action = parseClaudeResponse(claudeResponse.content);
    
    // Try Firestore operation
    const result = await executeFirestoreAction(action);
    
    return result;
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      // Handle Claude-specific errors
      throw new Error(`AI service error: ${error.message}`);
    }
    
    if (error instanceof FirebaseError) {
      // Handle Firebase-specific errors
      throw new Error(`Database error: ${handleFirebaseError(error)}`);
    }
    
    throw error;
  }
}
```

---

## API Rate Limits & Quotas

### Claude API
- **Rate Limit**: Varies by tier (check Anthropic console)
- **Token Limits**: 
  - Input: 200k tokens (Sonnet 4)
  - Output: 16k tokens max
- **Retry Strategy**: Exponential backoff with retry-after header

### Firebase/Firestore
- **Reads**: 50,000/day (free tier), unlimited (paid)
- **Writes**: 20,000/day (free tier), unlimited (paid)
- **Real-time listeners**: 100 concurrent connections (free tier)
- **Retry Strategy**: Automatic with exponential backoff

### Electron IPC
- **No rate limits** (local communication)
- **Performance**: Keep payloads small (<1MB)
- **Best Practice**: Use structured cloning for complex objects

---

## Environment Setup Checklist

### Development
```bash
# .env.development
VITE_FIREBASE_API_KEY=dev_key
VITE_FIREBASE_PROJECT_ID=dev_project
VITE_CLAUDE_API_KEY=sk-ant-dev-key
NODE_ENV=development
```

### Production
```bash
# .env.production
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_PROJECT_ID=prod_project
VITE_CLAUDE_API_KEY=sk-ant-prod-key
NODE_ENV=production
```

### Security Notes
- Never commit `.env` files
- Use `.env.example` for template
- Rotate API keys regularly
- Use Firebase security rules in production
- Validate all user input before API calls

---

*This documentation covers all API integrations required for the AI orchestrator architecture app.*

