import { useEffect, useState } from 'react';

export default function useTagManager(initialTags = []) {
  const [availableTags, setAvailableTags] = useState(() => {
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    return [...new Set([...initialTags, ...storedTags])];
  });

  useEffect(() => {
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    const allTags = [...new Set([...initialTags, ...storedTags])];
    
    if (JSON.stringify(availableTags) !== JSON.stringify(allTags)) {
      setAvailableTags(allTags);
      localStorage.setItem('tags', JSON.stringify(allTags));
    }
  }, [initialTags]);

  const addTag = (tag) => {
    if (!availableTags.includes(tag)) {
      const updatedTags = [...availableTags, tag];
      setAvailableTags(updatedTags);
      localStorage.setItem('tags', JSON.stringify(updatedTags));
    }
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
