import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileClock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/api'


interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    const priorityColor = {
        1: 'text-zinc-500',
        2: 'text-blue-400',
        3: 'text-yellow-400',
        4: 'text-orange-400',
        5: 'text-red-400',
    }[task.priority as 1 | 2 | 3 | 4 | 5] || 'text-zinc-400'

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "bg-zinc-950 p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-grab active:cursor-grabbing transition-colors group relative",
                isDragging && "border-yellow-500/50 shadow-lg shadow-yellow-500/10"
            )}
        >
            <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug flex-1">
                    {task.task}
                </span>
                <span className={cn("text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800", priorityColor)}>
                    P{task.priority}
                </span>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <FileClock size={10} />
                    <span>{new Date(task.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {task.assigned_to && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        <User size={10} className="text-yellow-500/70" />
                        {task.assigned_to}
                    </div>
                )}
            </div>

            {task.status === 'in_progress' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-800 overflow-hidden rounded-b-lg">
                    <div className="h-full bg-yellow-500 animate-pulse w-full" />
                </div>
            )}

        </div>
    )
}
