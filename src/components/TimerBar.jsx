import { useEffect, useRef } from 'react';
import styles from './TimerBar.module.css';

const TimerBar = ({ initialTime, remainingTime, setRemainingTime, isTimerRunning, setIsTimerRunning }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isTimerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isTimerRunning && remainingTime === initialTime) {
      
    } else if (remainingTime <= 0) {
      clearInterval(interval);
      setIsTimerRunning(false);
      if (audioRef.current && isTimerRunning) {
        audioRef.current.play();
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingTime, setIsTimerRunning, setRemainingTime, initialTime]);

  const timerFill = remainingTime > 0 ? (initialTime - remainingTime) / initialTime * 100 : 100;

  return (
  <div className={styles.timerBar}>
    <div className={styles.timerFill} style={{ width: `${timerFill}%` }}></div>
      <audio ref={audioRef} src="/Ding Sound Effect.mp3" preload="auto"></audio>
    <button onClick={() => audioRef.current && audioRef.current.play()}>Test Sound</button>
  </div>
  );
};

export default TimerBar;
