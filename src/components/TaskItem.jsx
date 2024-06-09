import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import styles from './TaskItem.module.css';
import { CalendarDemo } from "./demo/CalendarDemo";

const TaskItem = ({ task, deleteTask, toggleTask, enterEditMode, setDeadline }) => {
  const [isChecked, setIsChecked] = useState(task.checked);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(!isChecked);
    toggleTask(task.id);
    if (!isChecked) {
      setDeadline(task.id, null); 
    }
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

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
        <label htmlFor={task.id} className={styles.label}>
          <div className="flex items-center">
            <span className="text-lg">{task.name}</span>
          </div>
          <p className={styles.checkmark}>
            <CheckIcon strokeWidth={2} width={12} height={12} />
          </p>
        </label>
      </div>
      <div className={styles["task-group"]}>
        <button className="btn" aria-label={`Update ${task.name} Task`} onClick={() => enterEditMode(task)}>
          <PencilSquareIcon width={12} height={12} />
        </button>

        <button className="btn" aria-label={`Set deadline for ${task.name} Task`} onClick={openModal}>
          <CalendarIcon width={12} height={12} />
        </button>

        <button className={`btn ${styles.delete}`} aria-label={`Delete ${task.name} Task`} onClick={() => deleteTask(task.id)}>
          <TrashIcon width={12} height={12} />
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                <Dialog.Panel className="w-full max-w-md relative overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
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
                        setDeadline={setDeadline} 
                        closeModal={closeModal} 
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

