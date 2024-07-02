import { useState, useEffect } from 'react';

export default function useTagManager(initialTags = []) {
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    const allTags = [...new Set([...initialTags, ...storedTags])];
    setAvailableTags(prevTags => {
      if (JSON.stringify(prevTags) !== JSON.stringify(allTags)) {
        return allTags;
      }
      return prevTags;
    });
  }, [initialTags]);

  const addTag = (tag) => {
    const updatedTags = [...availableTags, tag];
    setAvailableTags(updatedTags);
    localStorage.setItem('tags', JSON.stringify(updatedTags));
  };

  const removeTagFromTask = (tagToRemove) => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
      if (task.tags.includes(tagToRemove)) {
        return {
          ...task,
          tags: task.tags.filter(tag => tag !== tagToRemove)
        };
      }
      return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const deleteTagPermanently = (tagToDelete) => {
    const updatedTags = availableTags.filter(tag => tag !== tagToDelete);
    setAvailableTags(updatedTags);
    localStorage.setItem('tags', JSON.stringify(updatedTags));

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.filter(tag => tag !== tagToDelete)
    }));
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return { availableTags, addTag, removeTagFromTask, deleteTagPermanently };
}
