import { useState, useEffect } from 'react';

export default function useTagManager(initialTags) {
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    const filteredInitialTags = initialTags.filter(tag => !storedTags.includes(tag));
    setAvailableTags([...filteredInitialTags, ...storedTags]);
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
