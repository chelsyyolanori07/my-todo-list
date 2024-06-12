import { useEffect, useState } from 'react';
import CustomForm from './components/CustomForm';
import TaskList from './components/TaskList';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [tasks, setTasks] = useLocalStorage('react-todo.tasks', []);
  const [filter, setFilter] = useState('All');

  const addTask = (task) => {
    setTasks(prevState => [...prevState, task]);
  };

  const deleteTask = (id) => {
    setTasks(prevState => prevState.filter(task => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(prevState =>
      prevState.map(task => {
        if (task.id === id) {
          const updatedTask = { ...task, checked: !task.checked };

          if (updatedTask.checked && updatedTask.isExpired) {
            updatedTask.isExpired = false;
            return updatedTask;
          }

          if (updatedTask.checked) {
            updatedTask.isExpired = false;
            return updatedTask;
          }

          const deadline = new Date(updatedTask.deadline);
          if (deadline < new Date()) {
            updatedTask.isExpired = true;
          } else {
            updatedTask.isExpired = false;
          }
          return updatedTask;
        }
        return task;
      })
    );
  };

  const setDeadline = (id, deadline) => {
    if (deadline) {
      setTasks(prevState => prevState.map(task => (
        task.id === id
          ? { ...task, deadline: deadline.toISOString() } 
          : task
      )));
    } else {
      // If deadline is null, clear the deadline for the task
      setTasks(prevState => prevState.map(task => (
        task.id === id
          ? { ...task, deadline: null } 
          : task
      )));
    }
  };

  const updateTask = (task) => {
    setTasks(prevState => prevState.map(currentTask => (
      currentTask.id === task.id
        ? { ...currentTask, name: task.name }
        : currentTask
    )));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Todo') return !task.checked;
    if (filter === 'Done') return task.checked;
    if (filter === 'Exp') return task.isExpired;
  });

  useEffect(() => {
    const today = new Date();
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.deadline) {
        const deadline = new Date(task.deadline);
        if (deadline < today) {
          task.isExpired = true;
        } else if (deadline.toDateString() === today.toDateString()) {
          task.isToday = true;
        } else {
          task.isExpired = false;
          task.isToday = false;
        }
      }
      return task;
    }));
  }, [setTasks]);

  return (
    <div className="container mx-auto p-4">
      <header>
        <h1 className="text-4xl font-bold mb-3">My Todo List :)</h1>
      </header>
      <CustomForm addTask={addTask} setFilter={setFilter} />
      {filteredTasks && (
        <TaskList
          tasks={filteredTasks}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          updateTask={updateTask}
          setDeadline={setDeadline}
        />
      )}
    </div>
  );
}

export default App;