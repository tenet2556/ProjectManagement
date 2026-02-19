"use client";

import { useState } from "react";

export default function CreateProjectModal({
  refresh,
}: {
  refresh: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const createProject = async () => {
    await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setOpen(false);
    refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Create New Project
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-96 space-y-3">

            <h2 className="font-bold text-xl">
              Create Project
            </h2>

            <input
              placeholder="Project Name"
              className="border p-2 w-full"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full"
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={createProject}
                className="bg-green-600 text-white px-4 py-2"
              >
                Create
              </button>

              <button
                onClick={() => setOpen(false)}
                className="bg-gray-400 px-4 py-2"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
