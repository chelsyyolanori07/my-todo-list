import useLocalStorage from "@/hooks/useLocalStorage";
import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, TagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ClockIcon, EllipsisVertical, SquarePlusIcon } from "lucide-react";
import { Fragment, useEffect, useState } from 'react';
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

  const [availableTags, setAvailableTags] = useState(["work", "personal", "study"]);
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
    const uniqueNewTags = newTags.filter(tag => !availableTags.includes(tag));

    setAvailableTags([...availableTags, ...uniqueNewTags]);

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

  const handleTagClick = (tag) => {
    const currentTags = task.tags || [];
  
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
      
    updateTask({ ...task, tags: updatedTags });
  };

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = () => {
    const trimmedNewTag = newTag.trim();
    if (trimmedNewTag !== "" && !availableTags.includes(trimmedNewTag)) {
      setAvailableTags([...availableTags, trimmedNewTag]);
      setNewTag("");
      updateTask({ ...task, tags: [...task.tags, trimmedNewTag] });
    }
  };

  const handleDeleteTag = (tag) => {
    const updatedTaskName = editedTaskName.replace(new RegExp(`#${tag}\\b`, 'gi'), '');
    const updatedTags = task.tags.filter(t => t !== tag);
    updateTask({ ...task, tags: updatedTags, name: updatedTaskName });
  
    setEditedTaskName(updatedTaskName);
  
    const updatedAvailableTags = availableTags.filter(t => t !== tag);
    setAvailableTags(updatedAvailableTags);
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

  useEffect(() => {
    const storedTags = JSON.parse(localStorage.getItem('tags')) || [];
    setAvailableTags(prevTags => [...prevTags, ...storedTags]);

    const storedTask = JSON.parse(localStorage.getItem(`task-${task.id}`));
    if (storedTask) {
      setEditedTaskName(storedTask.name);
      setSelectedDeadline(storedTask.deadline);
      setPriority(storedTask.priority);
      updateTask({ ...task, tags: storedTask.tags || [] });
    }
  }, [task.id]);

  useEffect(() => {
    const customTags = availableTags.filter(tag => !["work", "personal", "study"].includes(tag));
    localStorage.setItem('tags', JSON.stringify(customTags));

    const taskData = {
      name: editedTaskName,
      deadline: selectedDeadline,
      priority: priority,
      tags: task.tags || []
    };
    localStorage.setItem(`task-${task.id}`, JSON.stringify(taskData));
  }, [availableTags, task.tags, editedTaskName, selectedDeadline, priority, task.id]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            <EllipsisVertical width={12} height={12} />
          </button>
          <button
            className="btn"
            aria-label={`Set deadline for ${task.name} Task`}
            onClick={() => setIsOpen(true)}
          >
            <CalendarIcon width={12} height={12} />
          </button>
          <button
            className={`btn ${styles.delete}`}
            aria-label={`Delete ${task.name} Task`}
            onClick={() => deleteTask(task.id)}
          >
            <TrashIcon width={12} height={12} />
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
                  onClick={() => handleDeleteTag(tag)}
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
                <Dialog.Panel className="w-full max-w-md relative overflow-hidden rounded-2xl bg-slate-50 p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsPriorityOpen(false)}
                  >
                    <XMarkIcon width={24} height={24} />
                  </button>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-black"
                  >
                    Select Priority
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
                    className="text-lg font-medium leading-6 text-black mt-4"
                  >
                    Set Your Timer
                  </Dialog.Title>
                  <div className="flex items-center mt-4 space-x-2 text-base">
                    <input
                      type="time"
                      step="1"
                      value={timeInput}
                      onChange={handleTimerChange}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition" onClick={startTimer}>
                      Start Timer
                    </button>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-black mt-4"
                  >
                    Manage Tags
                  </Dialog.Title>
                  <div className="flex flex-col mt-2">
                    <div className="flex flex-wrap">
                      {availableTags.map((tag, index) => (
                        <button
                          key={index}
                          className={`flex items-center px-3 py-1 mb-2 rounded mr-2 ${task.tags?.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => handleTagClick(tag)}
                        >
                          <TagIcon width={16} height={16} className="mr-1" />
                          {tag}
                        </button>
                    ))}
                    </div>
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={handleTagChange}
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add new tag"
                      />
                    <button className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition" onClick={handleAddTag}>
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
                <Dialog.Panel className="w-full max-w-md relative overflow-hidden rounded-2xl bg-slate-50 p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <XMarkIcon width={24} height={24} />
                  </button>
                  <div className="flex items-center space-x-2">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-black mr-2"
                    >
                    Select Deadline
                    </Dialog.Title>
                      <div className="flex items-center">
                        <CalendarIcon width={16} height={16} className="text-red-700" />
                        <span className="text-sm font-semibold text-red-600 ml-1">{formatDate(selectedDeadline)}</span>
                      </div>
                  </div>
                  <div className="flex min-h-full items-center justify-center p-2 text-center">
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
