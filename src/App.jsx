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
          return { ...task, checked: !task.checked };
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
      setTasks(prevState => prevState.map(task => (
        task.id === id
          ? { ...task, deadline: null }
          : task
      )));
    }
  };

  const updateTask = (updatedTask) => {
    setTasks(prevState =>
      prevState.map(task =>
        task.id === updatedTask.id
          ? { ...task, ...updatedTask }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Todo') return !task.checked;
    if (filter === 'Done') return task.checked;
    if (filter === 'Exp') return task.isExpired;
    if (filter === 'Prio') return task.priority !== undefined && task.priority !== null;
    return true;
  }).sort((a, b) => {
    if (filter === 'Prio') {
      if (a.priority === undefined || a.priority === null) return 1;
      if (b.priority === undefined || b.priority === null) return -1;
      return a.priority - b.priority;
    }
    return b.id - a.id; 
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
        <h1 className="text-5xl font-bold mb-3">My Todo List :)</h1>
      </header>
      <CustomForm addTask={addTask} setFilter={setFilter} setDeadline={setDeadline} />
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
