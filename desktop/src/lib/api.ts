import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        const response = await api.get('/system/status');
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
    const response = await api.get('/tasks');
    return response.data.tasks;
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const response = await api.patch(`/tasks/${taskId}`, { status });
    return response.data;
};

export const createTask = async (task: string, priority: number = 5, assignedTo?: string) => {
    const response = await api.post('/tasks', { task, priority, assigned_to: assignedTo });
    return response.data;
};

export const getAgents = async (): Promise<Agent[]> => {
    const response = await api.get('/agents');
    return response.data.agents;
};

