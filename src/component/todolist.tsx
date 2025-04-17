"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../app/lib/firebase";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline: string;
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      tasks.forEach((task) => {
        newTimeRemaining[task.id] = calculateTimeRemaining(task.deadline);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const calculateTimeRemaining = (deadline: string): string => {
    const deadlineTime = new Date(deadline).getTime();
    const now = new Date().getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) return "Waktu habis";

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${hours}j ${minutes}m ${seconds}d`;
  };

  const addTask = async (): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: "Tambah Tugas",
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Judul Tugas">' +
        '<input id="swal-input2" type="datetime-local" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      buttonsStyling: false,
      customClass: {
        popup: "swal2-fade",
        confirmButton:
          "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded mr-2",
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded",
      },
      showClass: {
        popup: "transition-opacity duration-500 ease-out opacity-100",
      },
      hideClass: {
        popup: "transition-opacity duration-300 ease-in opacity-0",
      },
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLInputElement)?.value,
          (document.getElementById("swal-input2") as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const newTask: Omit<Task, "id"> = {
        text: formValues[0],
        completed: false,
        deadline: formValues[1],
      };
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      setTasks((prev) => [...prev, { id: docRef.id, ...newTask }]);
    }
  };

  const toggleTask = async (id: string): Promise<void> => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, {
      completed: updatedTasks.find((task) => task.id === id)?.completed,
    });
  };

  const deleteTask = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "tasks", id));
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = async (task: Task): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Tugas",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Nama tugas" value="${task.text}">` +
        `<input id="swal-input2" type="datetime-local" class="swal2-input" value="${task.deadline.slice(
          0,
          16
        )}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      buttonsStyling: false,
      customClass: {
        popup: "swal2-fade",
        confirmButton:
          "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded mr-2",
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded",
      },
      showClass: {
        popup: "transition-opacity duration-500 ease-out opacity-100",
      },
      hideClass: {
        popup: "transition-opacity duration-300 ease-in opacity-0",
      },
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLInputElement)?.value,
          (document.getElementById("swal-input2") as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const updatedTask = {
        text: formValues[0],
        deadline: formValues[1],
      };

      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, updatedTask);

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...updatedTask } : t))
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center text-emerald-600 mb-6"
      >
        Simple To-do List
      </motion.h1>

      <div className="flex justify-center mb-5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={addTask}
          className="bg-emerald-500 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-emerald-600 transition"
        >
          + Tambah Tugas
        </motion.button>
      </div>

      <ul className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => {
            const timeLeft = calculateTimeRemaining(task.deadline);
            const isExpired = timeLeft === "Waktu habis";
            const taskColor = task.completed
              ? "bg-green-200"
              : isExpired
              ? "bg-red-200"
              : "bg-yellow-200";

            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${taskColor}`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <p
                    className={`text-lg font-medium transition-all ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text}
                  </p>
                  <p className="text-sm text-gray-500">
                    Deadline: {new Date(task.deadline).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 font-semibold">
                    ⏳ {timeRemaining[task.id] || "Menghitung..."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => editTask(task)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                  >
                    ✏️
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <footer className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
        &copy; 2025 rasya.permataatmaja. All rights reserved.
      </footer>
    </div>
  );
}
