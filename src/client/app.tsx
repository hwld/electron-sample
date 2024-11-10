import { useEffect, useState } from "react";
import { EVENTS } from "../api";

export const App = () => {
  const [tasks, setTasks] = useState<{ title: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const tasks = await window.API[EVENTS.getTasks]();
      setTasks(tasks);
    };
    fetch();

    window.API.onUpdate(fetch);
  }, []);

  return (
    <div className="bg-neutral-900 min-h-[100dvh] text-neutral-100 gap-2 pt-10 px-6">
      <div className="text-4xl">
        {tasks.map((t, i) => {
          return <div key={i}>{t.title}</div>;
        })}
      </div>
    </div>
  );
};
