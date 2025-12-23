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
        3: 'text-cyan-400',
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
                isDragging && "border-cyan-500/50 shadow-lg shadow-cyan-500/10"
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
                        <User size={10} className="text-cyan-500/70" />
                        {task.assigned_to}
                    </div>
                )}
            </div>

            {task.status === 'in_progress' && (
                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-cyan-500">{task.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500/80 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                </div>
            )}

        </div>
    )
}
