import React, { useState, useEffect } from 'react';
import './NekoPet.css';

const messages = [
  '喵~今天的你也要元气满满喵~',
  '要摸摸我的头嘛？',
  '尾..尾巴不可以摸喵！所以我藏起来啦~',
  '尾巴被抓住啦~快放开喵~',
  '呼噜呼噜~好困喵~',
  '耳朵痒痒的呐，ruarua我喵~',
  '喵！发现可疑的用户在戳我喵！',
  '今天的网站应该没有什么bug吧喵~对吧？',
  '喵呜~摸摸头最舒服了喵~(≧ω≦)',
  '可以去GitHub帮主人点个star嘛？求你了喵~',
  '蹭蹭你~今天也要加油喵！',
  '好厄厄，祈烨又把我丢在这里当看板娘了喵...',
  '悄悄告诉你个秘密...逗你玩的啦，喵~',
  '喵喵拳！(ノ≧∇≦)ノ',
  '下面的这个按钮按起来好有趣喵~',
  '杂鱼杂鱼~',
  '喵喵~咕噜咕噜~',
  '有彩蛋哦~',
  '今天的你也闪闪发亮呢喵~'
];

const NekoPet = ({ nekoConfig }) => {
  const sideStyle = nekoConfig.side === 'left' ? { left: nekoConfig.offset || 16 } : { right: nekoConfig.offset || 16 };
  const [bubble, setBubble] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleClosing, setBubbleClosing] = useState(false);

  useEffect(() => {
    let t1, t2;
    if (showBubble) {
      t1 = setTimeout(() => setBubbleClosing(true), 1200);
      t2 = setTimeout(() => { setShowBubble(false); setBubbleClosing(false); }, 1700);
    }
    return () => { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [showBubble]);

  const handleClick = () => {
    if (showBubble) return;
    
    let currentMessages = messages;
    if (nekoConfig.customTextsEnabled && nekoConfig.customTexts && nekoConfig.customTexts.trim()) {
       const userTexts = nekoConfig.customTexts.split('\n').filter(t => t.trim());
       if (userTexts.length > 0) {
         currentMessages = userTexts;
       }
    }
    
    const text = currentMessages[Math.floor(Math.random() * currentMessages.length)];
    setBubble(text);
    setShowBubble(true);
  };

  return (
    <div
      className={`neko-pet ${nekoConfig.hideOnSmallScreen ? 'hide-on-small' : ''}`}
      style={{ 
        ...sideStyle, 
        '--neko-scale': nekoConfig.scale || 1,
        '--neko-swing-range': `${nekoConfig.amplitude ?? 3}deg`
      }}
      onClick={handleClick}
    >
      <img src={nekoConfig.customImage || "/assets/neko.png"} alt="neko" className="neko-img" />
      {showBubble && (
        <div className={`neko-bubble ${nekoConfig.side === 'left' ? 'side-right' : 'side-left'} ${bubbleClosing ? 'closing' : ''}`}>{bubble}</div>
      )}
    </div>
  );
};

export default React.memo(NekoPet);
