import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, TrashIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import styles from './TaskItem.module.css';
import { CalendarDemo } from "./demo/CalendarDemo";

const TaskItem = ({ task, deleteTask, toggleTask, updateTask, setDeadline }) => {
  const [isChecked, setIsChecked] = useState(task.checked);
  const [isOpen, setIsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);
  const [selectedDeadline, setSelectedDeadline] = useState(task.deadline);
  const [priority, setPriority] = useState(task.priority || null); 

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
    updateTask({ ...task, name: editedTaskName });
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

  return (
    <li className={`${styles.task} relative ${task.isExpired ? 'bg-blue-500' : ''}`}>
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
              <span className="text-lg">{task.name}</span>
            </div>
            <p className={styles.checkmark}>
              <CheckIcon strokeWidth={2} width={12} height={12} />
            </p>
          </label>
        )}
      </div>
      <div className={styles["task-group"]}>
        <button
          className="btn"
          aria-label={`Set priority for ${task.name} Task`}
          onClick={() => setIsPriorityOpen(true)}
        >
          <AdjustmentsHorizontalIcon width={12} height={12} />
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
                  <div className="flex flex-col mt-4">
                    {[1, 2, 3, 4].map((p) => (
                      <button
                        key={p}
                        className={`p-2 mb-2 rounded ${priority === p ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                        onClick={() => handlePriorityChange(p)}
                      >
                        Priority {p}
                      </button>
                    ))}
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
