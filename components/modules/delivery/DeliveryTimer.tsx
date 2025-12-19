"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface DeliveryTimerProps {
  startTime?: Date;
  status: string;
}

export default function DeliveryTimer({ startTime, status }: DeliveryTimerProps) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!startTime || status === 'pendiente') {
      setElapsed("00:00");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);

      if (diff < 0) {
        setElapsed("00:00");
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;

      const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setElapsed(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-lg">
      <Clock size={14} className="text-red-600 animate-pulse" />
      <span className="text-red-700 font-mono font-bold text-sm tracking-wider">{elapsed}</span>
    </div>
  );
}
