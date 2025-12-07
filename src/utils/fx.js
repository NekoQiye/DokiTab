
// 输入特效
export const spawnInputEffect = (type, inputElement, overlay) => {
  if (!inputElement || !overlay) return;

  const rect = inputElement.getBoundingClientRect();
  const style = window.getComputedStyle(inputElement);
  const fontSize = parseFloat(style.fontSize) || 14;
  
  // 计算光标位置（近似值）
  const sel = typeof inputElement.selectionStart === 'number' ? inputElement.selectionStart : (inputElement.value || '').length;
  // 创建临时 span 以测量光标前的文本宽度
  const text = (inputElement.value || '').slice(0, sel);
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = style.font || `${style.fontSize} ${style.fontFamily}`;
  const textWidth = measureCtx.measureText(text).width;
  
  // 调整 X/Y 坐标
  const padL = parseFloat(style.paddingLeft) || 0;
  const borL = parseFloat(style.borderLeftWidth) || 0;
  let x = rect.left + padL + borL + textWidth - (inputElement.scrollLeft || 0);
  
  // 将 X 坐标限制在输入框内
  if (x > rect.right) x = rect.right;
  if (x < rect.left) x = rect.left;
  
  const y = rect.top + rect.height / 2;

  switch (type) {
    case 'fire':
      spawnParticles(overlay, x, y, ['#ef4444', '#f97316', '#fbbf24'], 'up', 'circle');
      break;
    case 'bubbles':
      spawnParticles(overlay, x, y, ['#60a5fa', '#3b82f6', '#93c5fd'], 'up', 'circle', 20); 
      break;
    case 'stars':
      spawnParticles(overlay, x, y, ['#fde047', '#fbbf24', '#ffffff'], 'out', 'star');
      break;
    case 'matrix':
      spawnMatrixChar(overlay, x, y);
      break;
    case 'heart':
      spawnParticles(overlay, x, y, ['#f472b6', '#ec4899', '#be185d'], 'up', 'heart');
      break;
    case 'particles':
    default:
      spawnParticles(overlay, x, y, ['#fbcfe8', '#a5b4fc', '#93c5fd'], 'out', 'circle');
      break;
  }
};

// 鼠标特效
export const spawnCursorEffect = (type, x, y, overlay) => {
  if (!overlay) return;

  switch (type) {
    case 'trail':
      spawnParticles(overlay, x, y, ['#ffffff', '#e5e7eb'], 'still', 'circle', 1, 400);
      break;
    case 'bubbles':
      if (Math.random() > 0.5) return; // 节流
      spawnParticles(overlay, x, y, ['rgba(255,255,255,0.4)', 'rgba(147, 197, 253, 0.4)'], 'scatter', 'circle', 1, 1000);
      break;
    case 'stars':
       if (Math.random() > 0.3) return;
      spawnParticles(overlay, x, y, ['#fde047', '#fbbf24'], 'still', 'star', 1, 600);
      break;
    case 'fire':
      spawnParticles(overlay, x, y, ['#ef4444', '#f97316'], 'up', 'circle', 2, 500);
      break;
    case 'snowflake':
      if (Math.random() > 0.3) return;
      spawnParticles(overlay, x, y, ['#ffffff', '#e0f2fe'], 'down', 'circle', 1, 1500);
      break;
    case 'none':
    default:
      break;
  }
};

// 生成粒子的辅助函数
function spawnParticles(container, x, y, colors, movementType, shape = 'circle', count = 3, duration = 700) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    
    // 形状
    if (shape === 'star') {
      el.innerHTML = '★';
      el.style.color = colors[i % colors.length];
      el.style.fontSize = `${10 + Math.random() * 10}px`;
    } else if (shape === 'heart') {
      el.innerHTML = '♥';
      el.style.color = colors[i % colors.length];
      el.style.fontSize = `${10 + Math.random() * 10}px`;
    } else {
      // 圆形
      const size = 3 + Math.random() * 4;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.background = colors[i % colors.length];
    }

    el.style.opacity = '0.9';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    el.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    
    container.appendChild(el);

    // 计算移动
    let dx = 0;
    let dy = 0;
    
    switch (movementType) {
      case 'up':
        dx = (Math.random() - 0.5) * 20;
        dy = -30 - Math.random() * 30;
        break;
      case 'down':
        dx = (Math.random() - 0.5) * 20;
        dy = 30 + Math.random() * 30;
        break;
      case 'out': // 爆裂式
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 30;
        dx = Math.cos(angle) * dist;
        dy = Math.sin(angle) * dist;
        break;
      case 'scatter': // 轻微散射
        dx = (Math.random() - 0.5) * 40;
        dy = (Math.random() - 0.5) * 40;
        break;
      case 'still': // 几乎不动，仅淡出
        dx = (Math.random() - 0.5) * 5;
        dy = (Math.random() - 0.5) * 5;
        break;
    }

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, duration);
  }
}

function spawnMatrixChar(container, x, y) {
  const chars = '0123456789ABCDEF';
  const char = chars[Math.floor(Math.random() * chars.length)];
  const el = document.createElement('div');
  el.textContent = char;
  el.style.position = 'fixed';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = '#22c55e';
  el.style.fontFamily = 'monospace';
  el.style.fontWeight = 'bold';
  el.style.fontSize = '14px';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '9999';
  el.style.opacity = '1';
  el.style.transition = 'transform 800ms linear, opacity 800ms ease-in';
  
  container.appendChild(el);
  
  requestAnimationFrame(() => {
    el.style.transform = `translateY(${30 + Math.random() * 20}px)`;
    el.style.opacity = '0';
  });
  
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 800);
}
