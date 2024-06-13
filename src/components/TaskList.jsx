import TaskItem from './TaskItem';

const TaskList = ({ tasks, deleteTask, toggleTask, updateTask, setDeadline }) => {
  return (
    <ul>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          updateTask={updateTask}
          setDeadline={setDeadline}
        />
      ))}
    </ul>
  );
};

export default TaskList;
