import TaskItem from './TaskItem';

const TaskList = ({ tasks, deleteTask, toggleTask, updateTask, setDeadline }) => {
  // Reverse the order of tasks array to display newer tasks on top
  const reversedTasks = tasks.slice().reverse();

  return (
    <ul>
      {reversedTasks.map(task => (
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
