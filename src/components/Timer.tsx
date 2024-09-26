import React, { useEffect, useState } from "react"
import { calcSpentTime } from "../utils"

export const Timer = ({ startTime, endTime }: { startTime: string; endTime: string }) => {
  const [spentTime, setSpentTime] = useState(calcSpentTime(startTime, endTime))

  useEffect(() => {
    const interval = setInterval(() => setSpentTime(calcSpentTime(startTime, endTime)), 1000)
    return () => clearInterval(interval)
  }, [startTime, endTime])

  return <span>{spentTime}</span>
}
