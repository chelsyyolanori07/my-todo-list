import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ClockIcon, EllipsisVertical, TagIcon } from "lucide-react";
import { Fragment, useEffect, useState } from 'react';
import styles from './TaskItem.module.css';
import TimerBar from './TimerBar';
import { CalendarDemo } from "./demo/CalendarDemo";
import useLocalStorage from "@/hooks/useLocalStorage";

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
    updateTask({ ...task, name: editedTaskName, tags });
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
        <div className="flex">
          <TagIcon width={20} height={20} className="mr-1 text-white" />
            <div className="flex">
              {task.tags && task.tags.map(tag => (
                <span key={tag} className="text-white text-sm rounded mr-0 ">
                  {tag.replace('#','')}
                </span>
              ))}
            </div>
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
                   <ClockIcon width={25} height={25} className="mr-0 text-[#316493]" />
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
                    onClick={() => setIsOpen(false)}
                  >
                    <XMarkIcon width={24} height={24} />
                  </button>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-black"
                  >
                    Select Deadline
                  </Dialog.Title>
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <CalendarDemo
                      task={task}
                      setDeadline={(id, date) => {
                        setSelectedDeadline(date); 
                        setDeadline(id, date);
                      }}
                    />
                  </div>
                  <div className="flex items-center mt-4 p-2 rounded">
                    <CalendarIcon width={16} height={16} className="mr-2 text-black" />
                    <span className="text-black">{formatDate(selectedDeadline)}</span>
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
