import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './Clock.css';

const Digit = ({ char, animation }) => {
  const [displayChar, setDisplayChar] = useState(char);
  const [prevChar, setPrevChar] = useState(char);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (char !== displayChar) {
      setPrevChar(displayChar);
      setDisplayChar(char);
      setIsAnimating(true);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // 匹配 CSS 动画时长
    }
  }, [char, displayChar]);

  if (!animation || animation === 'none' || !isAnimating) {
    return (
      <span className={`clock-digit-wrapper ${/\d/.test(char) ? 'is-digit' : 'is-separator'} ${animation === 'flip' ? 'flip-mode' : ''}`}>
        <span className="clock-digit-content">{char}</span>
      </span>
    );
  }

  const getAnimClasses = (type) => {
    switch(type) {
      case 'slide': return ['anim-slide-out', 'anim-slide-in'];
      case 'flip': return ['anim-flip-out', 'anim-flip-in'];
      case 'fade': return ['anim-fade-out', 'anim-fade-in'];
      case 'zoom': return ['anim-zoom-out', 'anim-zoom-in'];
      case 'blur': return ['anim-blur-out', 'anim-blur-in'];
      case 'elastic': return ['anim-elastic-out', 'anim-elastic-in'];
      case 'tumble': return ['anim-tumble-out', 'anim-tumble-in'];
      case 'swap': return ['anim-swap-out', 'anim-swap-in'];
      case 'door': return ['anim-door-out', 'anim-door-in'];
      case 'bounce': return ['anim-bounce-out', 'anim-bounce-in'];
      case 'glitch': return ['anim-glitch-out', 'anim-glitch-in'];
      case 'roll': return ['anim-roll-out', 'anim-roll-in'];
      case 'neon': return ['anim-neon-out', 'anim-neon-in'];
      case 'drop': return ['anim-drop-out', 'anim-drop-in'];
      case 'shake': return ['anim-shake-out', 'anim-shake-in'];
      default: return ['anim-slide-out', 'anim-slide-in'];
    }
  };

  const [animClassOut, animClassIn] = getAnimClasses(animation);

  return (
    <span className={`clock-digit-wrapper ${/\d/.test(char) ? 'is-digit' : 'is-separator'} ${animation === 'flip' ? 'flip-mode' : ''}`}>
      <span className={`clock-digit-content ${animClassOut}`}>{prevChar}</span>
      <span className={`clock-digit-content ${animClassIn}`}>{displayChar}</span>
    </span>
  );
};

const Clock = ({ clockConfig, layoutConfig, onClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = format(time, clockConfig?.showSeconds ? 'HH:mm:ss' : 'HH:mm');

  return (
    <div 
      className="flex flex-col items-center justify-center p-4 select-none animate-slide-up" 
      style={{ textShadow: 'var(--text-shadow)' }}
    >
      <div 
        className={`tracking-tight flex items-center justify-center`} 
        style={{ 
          fontSize: (layoutConfig?.clockFontSize ?? 96) + 'px',
          fontWeight: clockConfig?.weight === 'bold' ? 700 : clockConfig?.weight === 'light' ? 300 : 400,
          color: clockConfig?.timeColor || '#ffffff',
          opacity: clockConfig?.timeOpacity ?? 0.95,
        }}
        onClick={onClick}
      >
        {timeString.split('').map((char, index) => (
          <Digit 
            key={index} 
            char={char} 
            animation={clockConfig?.digitAnimation || 'none'} 
          />
        ))}
      </div>
      {(clockConfig?.showDate || clockConfig?.showWeek) && (
        <div className="mt-2 font-medium opacity-90" style={{ opacity: 0.9 }}>
          {clockConfig?.showDate && (
            <span style={{ fontSize: (layoutConfig?.dateFontSize ?? 24) + 'px', color: clockConfig?.dateColor || 'rgba(255,255,255,0.8)', opacity: clockConfig?.dateOpacity ?? 0.9, marginRight: 12 }}>
              {format(time, 'MM月dd日', { locale: zhCN })}
            </span>
          )}
          {clockConfig?.showWeek && (
            <span style={{ fontSize: (layoutConfig?.weekFontSize ?? 24) + 'px', color: clockConfig?.weekColor || 'rgba(255,255,255,0.8)', opacity: clockConfig?.weekOpacity ?? 0.9 }}>
              {format(time, 'EEEE', { locale: zhCN })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Clock);
