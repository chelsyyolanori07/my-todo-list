import { FunnelIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useEffect, useRef, useState } from 'react';

const CustomForm = ({ addTask, setFilter }) => {
  const [task, setTask] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filters = ['All', 'Todo', 'Done', 'Exp'];
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addTask({
      name: task,
      checked: false,
      id: Date.now()
    });
    setTask("");
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showFilters && buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const selectElement = document.getElementById("filterSelect");
      if (selectElement) {
        selectElement.style.width = `${buttonWidth}px`;
      }
    }
  }, [showFilters]);

  return (
    <form className="flex items-center justify-between todo" onSubmit={handleFormSubmit}>
      <div className="wrapper flex-grow">
        <input
          type="text"
          id="task"
          className="input"
          value={task}
          onInput={(e) => setTask(e.target.value)}
          required
          autoFocus
          maxLength={60}
          placeholder="Enter Task"
        />
        <label htmlFor="task" className="label">Enter Task</label>
      </div>
      <div className="flex items-center">
        <button
          className="btn"
          aria-label="Add Task"
          type="submit"
          ref={buttonRef}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="btn bg-gray-200 text-gray-700 rounded-md px-1 py-1 flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-6 w-6" />
          </button>
        </div>
        {showFilters && (
          <select
            id="filterSelect"
            className="absolute btn bg-gray-200 text-gray-700 border border-gray-300 rounded-md text-xxs"
            style={{ width: "fit-content" }}
            onChange={handleFilterChange}
          >
            {filters.map((filter, index) => (
              <option key={index} value={filter}>{filter}</option>
            ))}
          </select>
        )}
      </div>
    </form>
  );
};

export default CustomForm;
