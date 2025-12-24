
// Helper to route requests through Electron IPC -> Python Backend
const request = async <T>(method: string, endpoint: string, body?: any): Promise<{ data: T }> => {
    const api = (window as any).electronAPI;
    if (!api) {
        throw new Error("Electron API not initialized");
    }

    // Use the apiRequest proxy we defined in preload.ts and main.ts
    const result = await api.apiRequest(method, endpoint, body);

    if (!result.success) {
        console.error(`[API] ${method} ${endpoint} failed:`, result.error);
        throw new Error(result.error || `Request failed with status ${result.status}`);
    }

    return { data: result.data };
};

export interface SystemStatus {
    status: string;
    agents_online: number;
    tasks_queued: number;
    missions_active: number;
}

export interface Task {
    id: string;
    task: string;
    priority: number;
    assigned_to: string | null;
    status: 'backlog' | 'planning' | 'in_progress' | 'review' | 'done';
    progress: number;
    created: string;
    result?: string;
}

export interface Agent {
    name: string;
    role: string;
    status: 'active' | 'idle';
    current_thought?: string;
    current_tool?: string;
    current_task?: string;
}


export const getSystemStatus = async (): Promise<SystemStatus> => {
    try {
        const response = await request<SystemStatus>('GET', '/system/status');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch system status:', error);
        return {
            status: `Error: ${error instanceof Error ? error.message : String(error)}`,
            agents_online: 0,
            tasks_queued: 0,
            missions_active: 0
        };
    }
};

export const getTasks = async (): Promise<Task[]> => {
    try {
        const response = await request<{ tasks: Task[] }>('GET', '/tasks');
        return response.data.tasks || [];
    } catch (e) {
        console.error("Failed to fetch tasks", e);
        return [];
    }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const response = await request('PATCH', `/tasks/${taskId}`, { status });
    return response.data;
};

export const createTask = async (task: string, priority: number = 5, assignedTo?: string) => {
    const response = await request('POST', '/tasks', { task, priority, assigned_to: assignedTo });
    return response.data;
};

export const getAgents = async (): Promise<Agent[]> => {
    try {
        const response = await request<{ agents: Agent[] }>('GET', '/agents');
        return response.data.agents || [];
    } catch (e) {
        console.error("Failed to fetch agents", e);
        return [];
    }
};

// Start a task - triggers the wake protocol to have agents work on it
export const startTask = async (taskId: string, taskDescription: string) => {
    // First update status to in_progress
    await updateTaskStatus(taskId, 'in_progress');

    // Then trigger the wake protocol
    const response = await request('POST', '/wake', {
        summary: taskDescription,
        source_type: 'desktop',
        ticket_id: taskId
    });
    return response.data;
};

// Stop a task - sets status back to backlog
export const stopTask = async (taskId: string) => {
    await updateTaskStatus(taskId, 'backlog');
    return { success: true };
};
