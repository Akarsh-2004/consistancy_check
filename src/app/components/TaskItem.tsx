import { Check, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import './TaskItem.css'

interface TaskItemProps {
    task: {
        id: string
        title: string
        completed: boolean
    }
    onToggle: () => void
    onDelete: () => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    return (
        <div className={clsx("task-item", { completed: task.completed })}>
            <button
                onClick={onToggle}
                className={clsx("check-btn", { checked: task.completed })}
            >
                {task.completed && <Check size={14} strokeWidth={3} color="white" />}
            </button>

            <div className="task-content">
                <span className="task-title">
                    {task.title}
                </span>
            </div>

            <button
                onClick={onDelete}
                className="delete-btn"
            >
                <Trash2 size={16} />
            </button>
        </div>
    )
}
