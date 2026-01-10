import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskItem } from './TaskItem'
import './TaskList.css'

interface Task {
    id: string
    title: string
    completed: boolean
    category: string
    // other fields as needed
}

interface TaskListProps {
    tasks: Task[]
    onAddTask: (text: string, category: string) => void
    onToggleTask: (id: string) => void
    onDeleteTask: (id: string) => void
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
    const [newTask, setNewTask] = useState('')
    const [category, setCategory] = useState('PERSONAL')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        onAddTask(newTask, category)
        setNewTask('')
    }

    return (
        <div className="task-list-container">
            <form onSubmit={handleSubmit} className="task-form">
                <div className="task-input-group">
                    <div className="input-wrapper" style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="task-input"
                        />
                        <div className="input-icon">
                            <Plus size={14} color="white" />
                        </div>
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="category-select"
                    >
                        <option value="HEALTH">Health</option>
                        <option value="LEARNING">Learning</option>
                        <option value="CAREER">Career</option>
                        <option value="PERSONAL">Personal</option>
                    </select>
                </div>
            </form>

            <div className="tasks-wrapper">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No tasks for today. Time to grow! 🌱</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => onToggleTask(task.id)}
                            onDelete={() => onDeleteTask(task.id)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default TaskList
