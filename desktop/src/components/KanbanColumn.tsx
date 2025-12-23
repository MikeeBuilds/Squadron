import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import type { Task } from '@/lib/api'


interface KanbanColumnProps {
    id: string
    title: string
    tasks: Task[]
    status: 'neutral' | 'blue' | 'yellow' | 'green' | 'red'
    onAddTask?: () => void
}

export function KanbanColumn({ id, title, tasks, status, onAddTask }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({ id })

    const statusColor = {
        neutral: 'border-zinc-800/50',
        blue: 'border-blue-500/20',
        yellow: 'border-cyan-500/20',
        green: 'border-green-500/20',
        red: 'border-red-500/20'
    }[status]

    return (
        <div className={cn("flex flex-col h-full bg-zinc-900/40 rounded-xl border overflow-hidden transition-colors", statusColor)}>
            <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
                <h4 className="font-semibold text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    {title}
                    <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full text-[10px] lowercase font-medium">
                        {tasks.length}
                    </span>
                </h4>
                {onAddTask && (
                    <button
                        onClick={onAddTask}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-cyan-400"
                    >
                        <Plus size={14} />
                    </button>
                )}
            </div>

            <div
                ref={setNodeRef}
                className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-hide min-h-[150px]"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    ) : (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-800/30 rounded-lg">
                            <span className="text-[10px] text-zinc-700 font-medium">No Tasks</span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    )
}
