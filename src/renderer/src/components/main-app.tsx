import { useEffect, useState } from 'react'

function MainApp(): JSX.Element {
  const [tasks, setTasks] = useState<{ title: string }[]>([])

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      const tasks = await window.api.getTasks()
      setTasks(tasks)
    }
    fetch()

    window.api.onUpdate(fetch)
  }, [])

  return (
    <div>
      <div>
        {tasks.map((t, i) => {
          return <div key={i}>{t.title}</div>
        })}
      </div>
    </div>
  )
}

export default MainApp
