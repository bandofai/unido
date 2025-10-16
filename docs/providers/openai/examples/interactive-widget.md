# Example: Interactive Widget

This example demonstrates an interactive widget that can trigger server-side tool calls using `window.openai.callTool()`.

## Use Case

A task management widget where users can add, complete, and delete tasks directly from the chat interface.

## Complete Implementation

### 1. Create React Component

**File**: `src/components/TaskList.tsx`

```typescript
import { FC, useEffect, useState } from 'react';
import './TaskList.css';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // Load tasks from window.openai
  useEffect(() => {
    if (window.openai?.toolOutput) {
      const output = window.openai.toolOutput as TaskListProps;
      setTasks(output.tasks || []);
    }
  }, []);

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    setLoading('add');
    try {
      await window.openai?.callTool('add_task', {
        text: newTaskText.trim()
      });
      setNewTaskText('');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(null);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setLoading(id);
    try {
      await window.openai?.callTool('toggle_task', {
        id,
        completed: !task.completed
      });
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoading(null);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;

    setLoading(id);
    try {
      await window.openai?.callTool('delete_task', { id });
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <span className="task-count">
          {tasks.filter(t => !t.completed).length} active
        </span>
      </div>

      <div className="task-input">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          disabled={loading === 'add'}
        />
        <button
          onClick={addTask}
          disabled={!newTaskText.trim() || loading === 'add'}
        >
          {loading === 'add' ? '...' : 'Add'}
        </button>
      </div>

      <div className="tasks">
        {tasks.length === 0 ? (
          <div className="empty-state">
            No tasks yet. Add one above!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task ${task.completed ? 'completed' : ''} ${loading === task.id ? 'loading' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={loading === task.id}
              />
              <span className="task-text">{task.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
                disabled={loading === task.id}
                aria-label="Delete task"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="task-summary">
        <span>{tasks.length} total</span>
        <span>{tasks.filter(t => t.completed).length} completed</span>
      </div>
    </div>
  );
};
```

**File**: `src/components/TaskList.css`

```css
.task-list {
  max-width: 500px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  font-family: system-ui, -apple-system, sans-serif;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-list-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.task-count {
  font-size: 14px;
  color: #666;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 12px;
}

.task-input {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.task-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.task-input input:focus {
  border-color: #2563eb;
}

.task-input button {
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.task-input button:hover:not(:disabled) {
  background: #1d4ed8;
}

.task-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.task {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.task:hover {
  background: #f3f4f6;
}

.task.loading {
  opacity: 0.5;
}

.task.completed .task-text {
  text-decoration: line-through;
  color: #9ca3af;
}

.task input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-text {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
}

.delete-btn {
  padding: 4px 8px;
  background: transparent;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.task:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.task-summary {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
}
```

### 2. Register Component and Tools

**File**: `src/index.ts`

```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

// Helper to resolve component paths
function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./')
    ? relativePath.slice(2)
    : relativePath;

  const distUrl = new URL(
    normalized.startsWith('components/')
      ? './' + normalized
      : './components/' + normalized,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) return distPath;
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

const app = createApp({
  name: 'task-manager',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// In-memory task storage (use a database in production)
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const tasks: Task[] = [];

// Register the TaskList component
app.component({
  type: 'task-list',
  title: 'Task List',
  description: 'Interactive task list with add, complete, and delete actions',
  sourcePath: resolveComponentPath('components/TaskList.tsx'),
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true, // Critical for interactivity!
        preferredSize: 'medium'
      }
    }
  }
});

// Display tool - shows the task list widget
app.tool('show_tasks', {
  title: 'Show Task List',
  description: 'Display the interactive task list',
  input: z.object({}),
  metadata: {
    openai: {
      widgetAccessible: true, // Must be true for callTool to work
      'toolInvocation/invoking': 'Loading tasks...',
      'toolInvocation/invoked': 'Tasks loaded'
    }
  },
  handler: async () => {
    return app.componentResponse(
      'task-list',
      { tasks },
      `Task list: ${tasks.length} tasks (${tasks.filter(t => !t.completed).length} active)`
    );
  }
});

// Action tool - add new task
app.tool('add_task', {
  title: 'Add Task',
  description: 'Add a new task to the list',
  input: z.object({
    text: z.string().min(1).describe('Task description')
  }),
  handler: async ({ text }) => {
    const newTask: Task = {
      id: randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    // Return updated list
    return app.componentResponse(
      'task-list',
      { tasks },
      `Added task: "${text}"`
    );
  }
});

// Action tool - toggle task completion
app.tool('toggle_task', {
  title: 'Toggle Task',
  description: 'Mark a task as completed or incomplete',
  input: z.object({
    id: z.string().describe('Task ID'),
    completed: z.boolean().describe('New completion status')
  }),
  handler: async ({ id, completed }) => {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return app.errorResponse(`Task not found: ${id}`);
    }

    task.completed = completed;

    return app.componentResponse(
      'task-list',
      { tasks },
      `Task ${completed ? 'completed' : 'uncompleted'}: "${task.text}"`
    );
  }
});

// Action tool - delete task
app.tool('delete_task', {
  title: 'Delete Task',
  description: 'Remove a task from the list',
  input: z.object({
    id: z.string().describe('Task ID')
  }),
  handler: async ({ id }) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return app.errorResponse(`Task not found: ${id}`);
    }

    const [deleted] = tasks.splice(index, 1);

    return app.componentResponse(
      'task-list',
      { tasks },
      `Deleted task: "${deleted.text}"`
    );
  }
});

await app.listen();
console.log('Task manager server running on http://localhost:3000');
```

## How It Works

### Interactive Widget Flow

```
1. User in ChatGPT: "Show me my tasks"
                  ↓
2. ChatGPT calls: show_tasks({})
                  ↓
3. Returns widget with widgetAccessible: true
                  ↓
4. User sees TaskList widget rendered
                  ↓
5. User clicks "Add" button in widget
                  ↓
6. Component calls: window.openai.callTool('add_task', { text: '...' })
                  ↓
7. Server receives add_task tool call
                  ↓
8. Server returns updated componentResponse
                  ↓
9. Widget automatically re-renders with new data
                  ↓
10. User sees new task in list
```

### Critical Settings

**Both component AND tool must have `widgetAccessible: true`:**

```typescript
// Component registration
app.component({
  type: 'task-list',
  metadata: {
    openai: {
      renderHints: {
        widgetAccessible: true // ← Required!
      }
    }
  }
});

// Display tool
app.tool('show_tasks', {
  metadata: {
    openai: {
      widgetAccessible: true // ← Required!
    }
  }
});
```

### window.openai API

The component uses three key APIs:

```typescript
// 1. Get initial data
const output = window.openai?.toolOutput as TaskListProps;

// 2. Trigger server-side actions
await window.openai?.callTool('add_task', { text: 'New task' });

// 3. (Optional) Check display mode
const mode = window.openai?.displayMode; // 'fullscreen' | 'sidebar'
```

## Testing

### 1. Start Development Server

```bash
pnpm run dev
```

### 2. Test in ChatGPT Developer Mode

1. Go to ChatGPT Settings → Actions → Developer Mode
2. Add your server: `http://localhost:3000/sse`
3. In chat: "Show me my tasks"
4. Should see the interactive task list
5. Try:
   - Adding a task
   - Checking/unchecking tasks
   - Deleting tasks

### 3. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse

# Show tasks
--method tools/call --params '{"name": "show_tasks", "arguments": {}}'

# Add task
--method tools/call --params '{"name": "add_task", "arguments": {"text": "Test task"}}'

# Toggle task (replace <task-id> with actual ID from response)
--method tools/call --params '{"name": "toggle_task", "arguments": {"id": "<task-id>", "completed": true}}'

# Delete task
--method tools/call --params '{"name": "delete_task", "arguments": {"id": "<task-id>"}}'
```

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(false);

const performAction = async () => {
  setLoading(true);
  try {
    await window.openai?.callTool('my_tool', { ... });
  } finally {
    setLoading(false);
  }
};
```

### Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

const performAction = async () => {
  try {
    await window.openai?.callTool('my_tool', { ... });
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};
```

### Optimistic Updates

```typescript
const deleteTask = async (id: string) => {
  // Update UI immediately
  setTasks(prev => prev.filter(t => t.id !== id));

  try {
    await window.openai?.callTool('delete_task', { id });
  } catch (error) {
    // Revert on error
    setTasks(originalTasks);
  }
};
```

### Debounced Actions

```typescript
import { useEffect, useRef } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const debounceTimeout = useRef<NodeJS.Timeout>();

useEffect(() => {
  clearTimeout(debounceTimeout.current);

  debounceTimeout.current = setTimeout(() => {
    if (searchTerm) {
      window.openai?.callTool('search', { query: searchTerm });
    }
  }, 500);
}, [searchTerm]);
```

## Important Considerations

### 1. Idempotent Actions

Action tools should be idempotent (safe to call multiple times):

```typescript
// ✅ Good - idempotent
app.tool('set_task_status', {
  handler: async ({ id, completed }) => {
    const task = findTask(id);
    task.completed = completed; // Setting to specific value
    return componentResponse('task-list', { tasks });
  }
});

// ⚠️ Risky - not idempotent
app.tool('toggle_task', {
  handler: async ({ id }) => {
    const task = findTask(id);
    task.completed = !task.completed; // Toggle can cause issues if called twice
    return componentResponse('task-list', { tasks });
  }
});
```

### 2. Always Return Updated Data

Action tools should return the latest widget state:

```typescript
app.tool('add_task', {
  handler: async ({ text }) => {
    tasks.push({ id: uuid(), text, completed: false });

    // ✅ Return updated list
    return app.componentResponse('task-list', { tasks });

    // ❌ Don't just return text
    // return app.textResponse('Task added');
  }
});
```

### 3. Validation

Validate inputs thoroughly:

```typescript
app.tool('delete_task', {
  handler: async ({ id }) => {
    const task = tasks.find(t => t.id === id);

    if (!task) {
      // ✅ Return error response
      return app.errorResponse(`Task not found: ${id}`);
    }

    // Proceed with deletion
  }
});
```

### 4. Security

Never trust client input:

```typescript
app.tool('update_task', {
  input: z.object({
    id: z.string(),
    text: z.string().max(500), // Limit length
    completed: z.boolean()
  }),
  handler: async ({ id, text, completed }) => {
    // Validate ownership if multi-user
    // Sanitize text content
    // Rate limit if needed
  }
});
```

## Key Takeaways

1. **Both component and tool need `widgetAccessible: true`**
2. **Action tools should be idempotent**
3. **Always return updated widget data from action tools**
4. **Handle loading and error states in UI**
5. **Validate all inputs thoroughly**
6. **Use window.openai.callTool() for server actions**
7. **Tool results automatically update the widget**

## Next Steps

- **Multiple components**: See [multi-component.md](multi-component.md)
- **Troubleshooting**: See [../troubleshooting.md](../troubleshooting.md)
- **Security patterns**: Query Context7 for "OAuth authentication" and "state persistence"

---

> 📚 **For detailed interactive widget specifications**: Query Context7 with `/websites/developers_openai_apps-sdk` and topic "callTool window.openai component bridge"
