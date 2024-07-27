import { Dialog, Transition } from '@headlessui/react';
import { CalendarIcon, CheckCircleIcon, FlagIcon, FunnelIcon, InformationCircleIcon, PencilSquareIcon, PlusIcon, TagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ClockIcon, EllipsisVertical } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from 'react';
import * as chrono from 'chrono-node';

const CustomForm = ({ addTask, setFilter, setDeadline }) => {
  const [task, setTask] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const filters = ['All', 'Todo', 'Done', 'Exp', 'Prio'];
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const tagPattern = /#[\w]+/g;
    const tags = task.match(tagPattern) || [];
    const newTags = tags.map(tag => tag.slice(1));

    const parsedDate = chrono.parseDate(task);
    const newTask = {
      name: task,
      checked: false,
      id: Date.now(),
      priority: null,
      deadline: parsedDate ? parsedDate.toISOString() : null,
      tags: newTags
    };
    addTask(newTask);
    if (parsedDate) {
      setDeadline(newTask.id, parsedDate);
    }
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
    <>
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
            <PlusIcon className="text-white" />
          </button>
        </div>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="btn bg-gray-200 text-gray-700 rounded-md px-1 py-1 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-6 w-6 text-white" />
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
        <div className="flex items-center">
          <button
            className="btn"
            aria-label="Show Info"
            type="button"
            onClick={() => setShowInfoDialog(true)}
          >
            <InformationCircleIcon className="text-white h-6 w-6" />
          </button>
        </div>
      </form>
      
      <Transition appear show={showInfoDialog} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowInfoDialog(false)}>
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
                <Dialog.Panel className="w-full max-w-lg relative overflow-hidden rounded-2xl bg-[#302e4a] p-6 text-left align-middle shadow-xl transition-all border-4 border-white">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={() => setShowInfoDialog(false)}
                  >
                    <XMarkIcon width={22} height={22} className="text-white"/>
                  </button>
                  <div className="flex items-center space-x-2 justify-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white mr-2 text-center"
                    >
                      How to Use This To-Do List App
                    </Dialog.Title>
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <div className="text-sm text-gray-400">
                      Here are the simple instructions on how to use the app:
                      <ul className="list-disc list-inside">
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <PlusIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Add your tasks using the input field and click the plus icon or click enter.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <FunnelIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Filter tasks using the funnel icon and selecting a filter.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Mark tasks as done by checking them off.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <PencilSquareIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Edit tasks by double-clicking on the task and save it by click enter.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <TrashIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Delete tasks by clicking the trash icon.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <CalendarIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">Select your task deadline by clicking the calendar icon.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <CalendarIcon className="h-11 w-11 text-white" />
                          <span className="text-justify">Or you can write in the task name as well for example: "Finish homework by next Monday", "Meeting in 3 days" it will automatically set that deadline</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <EllipsisVertical className="h-5 w-5 text-white" />
                          <span className="text-justify">The ellipsis vertical icon button is the task menu.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <FlagIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">You can choose task priority and it will show up beside flag icon.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <ClockIcon className="h-5 w-5 text-white" />
                          <span className="text-justify">You can set up your task timer and click start button to start the timer.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <TagIcon className="h-10 w-10 text-white" />
                          <span className="text-justify">You can create a custom tag using combobox feature, you will find (+) button there or you can edit your task by writing "#tagname" on the task name.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <XMarkIcon className="h-7 w-7 text-white" />
                          <span className="text-justify">If you hover on tag in the task UI you will see 'X' button there, it used to delete the tag from that specific task.</span>
                        </li>
                        <li className="flex items-center space-x-2 mt-2 mb-2">
                          <XMarkIcon className="h-12 w-12 text-white" />
                          <span className="text-justify">To delete a custom tag permanently, find the task where you created the tag. Search for the tag name in the combobox, then click the 'X' button next to it to delete the tag permanently.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CustomForm;
