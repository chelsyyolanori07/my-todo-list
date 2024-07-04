import useLocalStorage from "@/hooks/useLocalStorage";
import useTagManager from "@/hooks/useTagManager";
import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, TagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ClockIcon, EllipsisVertical, PauseIcon, PlayIcon, SquarePlusIcon } from "lucide-react";
import { Fragment, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import styles from './TaskItem.module.css';
import TimerBar from './TimerBar';
import { CalendarDemo } from "./demo/CalendarDemo";

const TaskItem = ({ task, deleteTask, toggleTask, updateTask, setDeadline }) => {
  const [isChecked, setIsChecked] = useState(task.checked);
  const [isOpen, setIsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);
  const [selectedDeadline, setSelectedDeadline] = useState(task.deadline);
  const [priority, setPriority] = useState(task.priority || null);
  const [initialTime, setInitialTime] = useLocalStorage(`timer-${task.id}-initial`, task.timer || 0);
  const [remainingTime, setRemainingTime] = useLocalStorage(`timer-${task.id}-remaining`, initialTime);
  const [isTimerRunning, setIsTimerRunning] = useLocalStorage(`timer-${task.id}-running`, false);
  const [timeInput, setTimeInput] = useState('00:00:00');
  const [timerExpired, setTimerExpired] = useState(false);

  const { availableTags, addTag, removeTagFromTask, deleteTagPermanently } = useTagManager(["work", "personal", "study"]);
  const [newTag, setNewTag] = useState("");

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    toggleTask(task.id);
    if (!isChecked) {
      setDeadline(task.id, null);
      setSelectedDeadline(null);
    }
  };

  const handleEditChange = (e) => {
    setEditedTaskName(e.target.value);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const tags = editedTaskName.match(/#[\w]+/g) || [];
    const newTags = tags.map(tag => tag.slice(1));
    updateTask({ ...task, name: editedTaskName, tags: newTags });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit(e);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline set";
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
    return formattedDate;
  };

  const handlePriorityChange = (newPriority) => {
    const updatedPriority = priority === newPriority ? null : newPriority;
    setPriority(updatedPriority);
    updateTask({ ...task, priority: updatedPriority });
    setIsPriorityOpen(false);
  };

  const handleTimerChange = (e) => {
    const timeParts = e.target.value.split(':');
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    const newTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds;

    setInitialTime(newTimeInSeconds);
    setRemainingTime(newTimeInSeconds);
    setTimeInput(e.target.value);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = () => {
    const trimmedNewTag = newTag.trim();
    if (task.tags && !task.tags.includes(trimmedNewTag)) {
      const updatedTags = [...task.tags, trimmedNewTag];
      updateTask({ ...task, tags: updatedTags });
      addTag(trimmedNewTag);
      setNewTag("");
    } else if (!task.tags) {
      updateTask({ ...task, tags: [trimmedNewTag] });
      addTag(trimmedNewTag);
      setNewTag("");
    }
  };

  const handleRemoveTagFromTask = (tagToRemove) => {
    const updatedTags = task.tags.filter(tag => tag !== tagToRemove);
    const updatedTaskName = task.name.replace(new RegExp(`#${tagToRemove}\\b`, 'g'), '').trim();
    updateTask({ ...task, name: updatedTaskName, tags: updatedTags });
    removeTagFromTask(tagToRemove);
  };

  const handleDeleteTagPermanently = (tagToDelete) => {
    const updatedTags = task.tags.filter(tag => tag !== tagToDelete);
    const updatedTaskName = task.name.replace(new RegExp(`#${tagToDelete}\\b`, 'g'), '').trim();
    updateTask({ ...task, name: updatedTaskName, tags: updatedTags });
    deleteTagPermanently(tagToDelete);
  };
  
  const isTaskExpired = task.isExpired;

  useEffect(() => {
    if (remainingTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setRemainingTime(0);
      setTimerExpired(true);
      localStorage.removeItem(`timer-${task.id}-remaining`);
    }
  }, [remainingTime, isTimerRunning, task.id]);

  useEffect(() => {
    if (timerExpired) {
      setInitialTime(task.timer || 0);
      setRemainingTime(task.timer || 0);
      setIsTimerRunning(false);
      setTimerExpired(false);
      localStorage.removeItem(`timer-${task.id}-remaining`);
    }
  }, [timerExpired, task.timer, task.id, setInitialTime, setRemainingTime, setIsTimerRunning]);

  useEffect(() => {
    localStorage.setItem(`timer-${task.id}-initial`, initialTime);
    localStorage.setItem(`timer-${task.id}-remaining`, remainingTime);
    localStorage.setItem(`timer-${task.id}-running`, isTimerRunning);
  }, [initialTime, remainingTime, isTimerRunning, task.id]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTagSelect = (selectedOptions) => {
    const selectedTags = selectedOptions ? selectedOptions.map(option => option.value) : [];
    updateTask({ ...task, tags: selectedTags });
  };

  useEffect(() => {
    if (task.tags) {
      const newTags = task.tags.filter(tag => !availableTags.includes(tag));
      newTags.forEach(tag => addTag(tag));
    }
  }, [task.tags, availableTags]);

  const tagOptions = availableTags.map(tag => ({ value: tag, label: tag }));

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgb(243, 244, 246)',
      borderColor: state.isFocused ? 'rgb(37, 84, 123)' : 'gray',
      boxShadow: state.isFocused ? '0 0 0 3px rgb(37, 84, 123)' : 'none',
      color: 'black',
      '&:hover': {
        borderColor: 'rgb(37, 84, 123)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      maxHeight: 100,
      overflowY: 'auto',
      color: 'black',
      backgroundColor: 'rgb(37, 84, 123)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 70,
      overflowY: 'auto',
      color: 'black',
      backgroundColor: '#f0f0f0',
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : 'black',
      backgroundColor: state.isSelected ? 'blue' : 'white',
      '&:hover': {
        backgroundColor: state.isSelected ? 'none' : 'rgba(59, 130, 246, 0.5)',
      },
      display: 'flex',
      alignItems: 'center',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'rgb(37, 84, 123)',
      borderRadius: '2px',
      padding: '2px 5px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      fontWeight: 'bold',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgb(192, 54, 5)',
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        <TagIcon className="h-4 w-4 mr-2" />
        {props.data.label}
        <button
        className="ml-auto text-gray-500 hover:text-red-700"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTagPermanently(props.data.value);
        }}
      >
        <XMarkIcon width={12} height={12} className="text-black" />
      </button>
      </components.Option>
    );
  };

  const NoOptionsMessage = (props) => {
    return (
      <components.NoOptionsMessage {...props}>
        <div className="flex items-center">
          <input
            type="text"
            value={newTag}
            onChange={handleTagChange}
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            placeholder="Add new tag"
          />
          <button
            className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition"
            onClick={handleAddTag}
          >
            <SquarePlusIcon width={22} height={22} />
          </button>
        </div>
      </components.NoOptionsMessage>
    );
  };

  return (
    <li className={`${styles.task} relative ${isTaskExpired ? 'bg-blue-500' : ''}`}>
      <div className={styles["task-container"]}>
        <div className={styles["task-group"]}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isChecked}
            onChange={handleCheckboxChange}
            name={task.name}
            id={task.id}
          />
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className={styles["edit-form"]}>
              <input
                type="text"
                className={styles.input}
                value={editedTaskName}
                onChange={handleEditChange}
                onKeyDown={handleKeyDown}
                autoFocus
                required
              />
            </form>
          ) : (
            <label
              htmlFor={task.id}
              className={styles.label}
              onDoubleClick={() => setIsEditing(true)}
            >
              <div className="flex items-center">
                <p className={styles.checkmark}>
                  <CheckIcon strokeWidth={2} width={12} height={12} />
                </p>
                <span className="text-lg">{task.name}</span>
              </div>
            </label>
          )}
          <div className={styles["timer-info"]}>
            <ClockIcon width={20} height={20} className={styles.timerIcon} />
            <div className={styles.timerDisplay}>
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>
        <div className={styles["button-group"]}>
          <button
            className="btn"
            aria-label={`Set priority for ${task.name} Task`}
            onClick={() => setIsPriorityOpen(true)}
          >
            <EllipsisVertical width={12} height={12} className="text-white" />
          </button>
          <button
            className="btn"
            aria-label={`Set deadline for ${task.name} Task`}
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon width={12} height={12} className="text-white" />
          </button>
          <button
            className={`btn ${styles.delete}`}
            aria-label={`Delete ${task.name} Task`}
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon width={12} height={12} className="text-black" />
          </button>
        </div>
      </div>
      <div className={styles["tag-group"]}>
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center">
            <TagIcon width={20} height={20} className="mr-1 text-white" />
            {task.tags.map((tag, index) => (
              <span key={index} className={`${styles.tag} text-xs rounded px-2 py-1 flex items-center`}>
                {tag}
                <button
                  className={`ml-2 text-white hover:text-red-700 ${styles["close-button"]}`}
                  onClick={() => handleRemoveTagFromTask(tag)}
                >
                  <XMarkIcon width={12} height={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.timerContainer}>
        <TimerBar
          taskId={task.id}
          initialTime={initialTime}
          remainingTime={remainingTime}
          setRemainingTime={setRemainingTime}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
        />
      </div>

      <Transition appear show={isPriorityOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsPriorityOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md relative overflow-hidden rounded-2xl bg-[hsl(var(--accent))] p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsPriorityOpen(false)}
                  >
                    <XMarkIcon width={20} height={20} className="text-white"/>
                  </button>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Choose Task Priority 📌
                  </Dialog.Title>
                  <div className="flex flex-row mt-4 space-x-3">
                    {[1, 2, 3, 4].map((p) => (
                      <button
                        key={p}
                        className={`px-4 py-2 mb-2 rounded ${priority === p ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                        onClick={() => handlePriorityChange(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white mt-6"
                  >
                    Set The Timer ⏰
                  </Dialog.Title>
                  <div className="flex items-center mt-4 space-x-2 text-base">
                    <input
                      type="time"
                      step="1"
                      value={timeInput}
                      onChange={handleTimerChange}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-500 text-white"
                    />
                    <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition" onClick={isTimerRunning ? stopTimer : startTimer}>
                      {isTimerRunning ? <PauseIcon /> : <PlayIcon />}
                    </button>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white mt-6"
                  >
                     Manage Tags 🏷️
                  </Dialog.Title>
                  <div className="flex flex-col mt-4">
                  <Select
                    isMulti
                    name="tags"
                    options={tagOptions}
                    value={(task.tags || []).map(tag => ({ value: tag, label: tag }))}
                    onChange={handleTagSelect}
                    styles={customStyles}
                    components={{ Option: CustomOption, NoOptionsMessage }}
                    inputValue={newTag}
                    onInputChange={(value) => setNewTag(value)}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select tags or add new tag..."
                  />
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={handleTagChange}
                        className={`flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        style={{ visibility:'hidden'}}
                        placeholder="Add new tag"
                      />
                    <button 
                      className={`ml-2 p-2 bg-blue-50 rounded-md hover:bg-blue-400 transition`}
                      style={{ visibility:'hidden'}}
                    >
                      <SquarePlusIcon width={22} height={22} />
                    </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md relative overflow-hidden rounded-2xl bg-[hsl(var(--accent))] p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <XMarkIcon width={20} height={20} className="text-white"/>
                  </button>
                  <div className="flex items-center space-x-2">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white mr-2 ml-12 text-center"
                    >
                    🎯 Select Deadline
                    </Dialog.Title>
                      <div className="flex items-center">
                        <CalendarIcon width={16} height={16} className="text-white" />
                        <span className="text-sm font-semibold text-blue-500 ml-1">{formatDate(selectedDeadline)}</span>
                      </div>
                  </div>
                  <div className="flex min-h-full items-center justify-center p-2 mr-0.5 ml-0.5 text-center">
                    <CalendarDemo
                      task={task}
                      setDeadline={(id, date) => {
                        setSelectedDeadline(date);
                        setDeadline(id, date);
                      }}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </li>
  );
};

export default TaskItem;
