import { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { type Task, getTasks, updateTaskStatus } from '@/lib/api'


export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeTask, setActiveTask] = useState<Task | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const fetchTasks = async () => {
        try {
            const data = await getTasks()
            setTasks(data)
        } catch (err) {
            console.error('Failed to fetch tasks:', err)
        }
    }

    useEffect(() => {
        fetchTasks()
        const interval = setInterval(fetchTasks, 5000)
        return () => clearInterval(interval)
    }, [])

    const columns = [
        { id: 'backlog', title: 'Backlog', status: 'neutral' },
        { id: 'planning', title: 'Planning', status: 'blue' },
        { id: 'in_progress', title: 'In Progress', status: 'yellow' },
        { id: 'review', title: 'Review', status: 'red' },
        { id: 'done', title: 'Done', status: 'green' },
    ] as const

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Find the task and the column it's over
        const activeTask = tasks.find(t => t.id === activeId)
        if (!activeTask) return

        // If over a column
        const overColumn = columns.find(c => c.id === overId)
        if (overColumn && activeTask.status !== overId) {
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: overId as Task['status'] } : t
            ))
            return
        }

        // If over another task
        const overTask = tasks.find(t => t.id === overId)
        if (overTask && activeTask.status !== overTask.status) {
            setTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, status: overTask.status } : t
            ))
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const task = tasks.find(t => t.id === activeId)
        if (!task) return

        // Finalize status update on backend
        try {
            await updateTaskStatus(activeId, task.status)
        } catch (err) {
            console.error('Failed to update task status:', err)
            fetchTasks() // Rollback on error
        }

        if (activeId !== overId) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId);
                const newIndex = items.findIndex((t) => t.id === overId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    return (
        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        status={col.status}
                        tasks={tasks.filter(t => t.status === col.id)}
                    />
                ))}

                <DragOverlay>
                    {activeTask ? (
                        <div className="w-[280px]">
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
