import React from 'react';
import { Flame, Target, Zap } from 'lucide-react';

export default function StatsBar({ streak = 0, xp = 0, coursesCompleted = 0 }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full">
        <Flame className="w-4 h-4 text-[#FF6B00] dark:text-orange-400 streak-pulse" />
        <span className="font-bold text-[#FF6B00] dark:text-orange-400">{streak}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden sm:inline">jours</span>
      </div>
      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
        <Zap className="w-4 h-4 text-[#00C9A7] dark:text-emerald-400" />
        <span className="font-bold text-[#00C9A7] dark:text-emerald-400">{xp}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden sm:inline">XP</span>
      </div>
      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full">
        <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        <span className="font-bold text-blue-500 dark:text-blue-400">{coursesCompleted}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden sm:inline">terminés</span>
      </div>
    </div>
  );
}