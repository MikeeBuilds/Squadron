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
