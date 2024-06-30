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

  const removeTag = (tag) => {
    const updatedTags = availableTags.filter(t => t !== tag);
    setAvailableTags(updatedTags);
    localStorage.setItem('tags', JSON.stringify(updatedTags));
  };

  return { availableTags, addTag, removeTag };
}
