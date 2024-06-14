import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import styles from './TimerBar.module.css';

const TimerBar = ({ initialTime, isTimerRunning, setIsTimerRunning }) => {
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const audioRef = useRef(null);

  useEffect(() => {
    setRemainingTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime <= 0) {
      clearInterval(interval);
      setIsTimerRunning(false);
      if (audioRef.current) {
        audioRef.current.play();  
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingTime, setIsTimerRunning]);

  const timerFill = ((initialTime - remainingTime) / initialTime) * 100;

  return (
    <div className={styles.timerContainer}>
      <ClockIcon width={20} height={20} className={styles.timerIcon} />
      <div className={styles.timerDisplay}>
        {Math.floor(remainingTime / 60)}:{remainingTime % 60 < 10 ? '0' : ''}{remainingTime % 60}
      </div>
      <div className={styles.timerBar}>
        <div className={styles.timerFill} style={{ width: `${timerFill}%` }}></div>
      </div>
      <audio ref={audioRef} src="src/Ding Sound Effect.mp3" preload="auto"></audio>
    </div>
  );
};

export default TimerBar;
