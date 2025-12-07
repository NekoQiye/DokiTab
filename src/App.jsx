import React, { useEffect, useState } from 'react';
import { getFile } from './utils/fileCache';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import Dock from './components/Dock';
import NekoPet from './components/NekoPet';
import Sidebar from './components/Sidebar';
import ShortcutGrid from './components/ShortcutGrid';
import WelcomeModal from './components/WelcomeModal';
import TerminalModal from './components/TerminalModal';
import useLocalStorage from './hooks/useLocalStorage';
import { spawnInputEffect, spawnCursorEffect } from './utils/fx';
import { Youtube, Mail, Github, Map, Globe } from 'lucide-react';

// 初始数据
const DEFAULT_SHORTCUTS = [
  { id: 1, name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: '/icons/zakozako/1.png' },
  { id: 2, name: '抖音', url: 'https://www.douyin.com/', icon: '/icons/zakozako/2.png' },
  { id: 3, name: '网易云音乐', url: 'https://music.163.com', icon: '/icons/zakozako/3.png' },
  { id: 4, name: '酷安', url: 'https://www.coolapk.com', icon: '/icons/zakozako/4.png' },
  { id: 5, name: '高德地图', url: 'https://map.amap.com/', icon: '/icons/zakozako/5.png' },
  { id: 6, name: '小黑盒', url: 'https://www.xiaoheihe.cn/app/bbs/home', icon: '/icons/zakozako/6.png' },
  { id: 7, name: 'MC百科', url: 'https://www.mcmod.cn/', icon: '/icons/zakozako/7.png' },
  { id: 8, name: 'Deepseek', url: 'https://chat.deepseek.com/', icon: '/icons/zakozako/8.png' },
  { id: 9, name: 'QQ邮箱', url: 'https://mail.qq.com', icon: '/icons/zakozako/4.png' },
  { id: 10, name: 'Mikutap', url: 'https://aidn.jp/mikutap/', icon: '/icons/zakozako/10.png' }, 
  { id: 11, name: 'Google', url: 'https://www.google.com/', icon: '/icons/zakozako/11.png' },
  { id: 12, name: 'YouTube', url: 'https://www.youtube.com', icon: '/icons/zakozako/12.png' },
  { id: 13, name: 'Gmail', url: 'https://mail.google.com', icon: '/icons/zakozako/13.png' },
  { id: 14, name: 'Google earth', url: 'https://www.google.com/maps', icon: '/icons/zakozako/14.png' },
  { id: 15, name: 'X', url: 'https://twitter.com', icon: '/icons/zakozako/15.png' },
  { id: 16, name: 'Github', url: 'https://www.github.com', icon: '/icons/zakozako/16.png' },
  { id: 17, name: 'Twitch', url: 'https://www.twitch.tv/', icon: '/icons/zakozako/17.png' },
  { id: 18, name: 'Apple', url: 'https://www.apple.com', icon: '/icons/zakozako/18.png' },
  { id: 19, name: 'OPEN AI', url: 'https://www.openai.com', icon: '/icons/zakozako/19.png' },
  { id: 20, name: '维基百科', url: 'https://www.wikipedia.org', icon: '/icons/zakozako/20.png' },
];

const DEFAULT_DOCK_ITEMS = [
  { id: 'd1', name: 'Google', url: 'https://www.google.com/', iconUrl: '/icons/zakozako/21.png' },
  { id: 'd2', name: '哔哩哔哩', url: 'https://www.bilibili.com', iconUrl: '/icons/zakozako/22.png' },
  { id: 'd3', name: 'Deepseek', url: 'https://chat.deepseek.com/', iconUrl: '/icons/zakozako/23.png' },
  { id: 'd4', name: '网易云音乐', url: 'https://music.163.com', iconUrl: '/icons/zakozako/24.png' },
  { id: 'd5', name: 'Github', url: 'https://www.github.com', iconUrl: '/icons/zakozako/25.png' },
];

function App() {
  // 状态
  const [bgConfig, setBgConfig] = useLocalStorage('bgConfig', {
    type: 'image', // 或 'video'
    url: '/assets/default-bg.jpg',
    blur: 0,
    overlayOpacity: 20,
    customFile: false // 若为 true，url 为会话级 blob
  });

  const [gridConfig, setGridConfig] = useLocalStorage('gridConfig', {
    iconSize: 85,
    gap: 0,
    iconBgColor: '#ffffff',
    iconBgOpacity: 0.5,
    nameColor: '#ffffff',
    customColsEnabled: false,
    customCols: 10,
    tileWidthPct: {
      '1x1': 100,
      '1x2': 90,
      '1x3': 90,
      '2x1': 90,
      '2x2': 100,
      '2x3': 90,
      '3x1': 95,
      '3x2': 93,
      '3x3': 100
    }
  });

  const [shortcuts, setShortcuts] = useLocalStorage('shortcuts', DEFAULT_SHORTCUTS);
  const [dockItems, setDockItems] = useLocalStorage('dockItems', DEFAULT_DOCK_ITEMS);
  const [dockConfig, setDockConfig] = useLocalStorage('dockConfig', { iconSize: 65, hoverScale: 1.08, bgColor: '#ffffff', bgOpacity: 0.5, tipBgColor: 'rgb(140,140,140)', tipTextColor: '#ffffff', tipOpacity: 0.55, tipBlur: 8 });
  const [searchConfig, setSearchConfig] = useLocalStorage('searchConfig', { dark: false });
  const [clockConfig, setClockConfig] = useLocalStorage('clockConfig', { weight: 'normal', timeColor: '#ffffff', timeOpacity: 0.95, showDate: true, showWeek: true, showSeconds: true, dateColor: '#ffffff', dateOpacity: 0.9, weekColor: '#ffffff', weekOpacity: 0.9, clickFocusEnabled: true });
  const [focusMode, setFocusMode] = useLocalStorage('focusMode', false);
  const [layoutConfig, setLayoutConfig] = useLocalStorage('layoutConfig', { clockTopMargin: 40, clockFontSize: 120, dateFontSize: 28, weekFontSize: 28, searchWidthPct: 45, searchScale: 1.0 });
  const [simpleConfig, setSimpleConfig] = useLocalStorage('simpleConfig', { clockFontSize: 140, dateFontSize: 28, weekFontSize: 28, searchWidthPct: 43, searchHidden: true, clockOffsetXPct: 0, clockOffsetYPct: -20, searchOffsetXPct: 0, searchOffsetYPct: -20, searchScale: 1.0, autoEnterAfterSec: 20 });
  const [uiConfig, setUiConfig] = useLocalStorage('uiConfig', { glassBlur: 16, panelBlur: 24, disableContextMenu: true, inputFX: true, inputFXType: 'stars', cursorFX: false, cursorFXType: 'bubbles', disableSelection: true, openInNewTab: true, pageShadowSize: 0, pageShadowColor: '#000000', ctxMenuBgColor: '#000000', ctxMenuTextColor: '#ffffff', ctxMenuBlur: 25, ctxMenuOpacity: 0.4, ctxMenuFontSize: 15 });
  const [nekoConfig, setNekoConfig] = useLocalStorage('nekoConfig', { 
    enabled: true, 
    side: 'left', 
    scale: 1.0, 
    offset: 16, 
    hideInSimple: false,
    hideOnSmallScreen: true,
    amplitude: 3,
    customImage: null,
    customTextsEnabled: false,
    customTexts: ''
  });
  const [pageTitle, setPageTitle] = useLocalStorage('pageTitle', '新标签页 - DokiTab♥~');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [autoFocusMode, setAutoFocusMode] = useState(false);

  // 运行时背景文件 URL（缓存读取）
  const [bgRuntimeUrl, setBgRuntimeUrl] = useState('');

  useEffect(() => {
    let revokeUrl = null;
    const setup = async () => {
      if (bgConfig.customFile && bgConfig.fileKey) {
        const blob = await getFile(bgConfig.fileKey);
        if (blob) {
          const objUrl = URL.createObjectURL(blob);
          revokeUrl = objUrl;
          setBgRuntimeUrl(objUrl);
        } else {
          setBgRuntimeUrl('');
          setBgConfig(prev => ({ ...prev, customFile: false, fileKey: undefined }));
        }
      } else {
        setBgRuntimeUrl('');
      }
    };
    setup();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [bgConfig.customFile, bgConfig.fileKey]);

  // 背景样式应用
  const bgStyle = {
    filter: `blur(${bgConfig.blur}px)`,
    transform: 'scale(1.05)', // 防止模糊边缘
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${uiConfig.glassBlur}px`);
    root.style.setProperty('--glass-panel-blur', `${uiConfig.panelBlur}px`);
  }, [uiConfig.glassBlur, uiConfig.panelBlur]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
    };
    if (uiConfig.disableContextMenu) {
      document.addEventListener('contextmenu', handler);
    }
    return () => {
      document.removeEventListener('contextmenu', handler);
    };
  }, [uiConfig.disableContextMenu]);

  useEffect(() => {
    const body = document.body;
    if (uiConfig.disableSelection) {
      body.classList.add('no-select');
    } else {
      body.classList.remove('no-select');
    }
  }, [uiConfig.disableSelection]);

  const autoFocusedRef = React.useRef(false);
  const lastActivityRef = React.useRef(Date.now());
  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      if (autoFocusedRef.current && autoFocusMode) {
        setAutoFocusMode(false);
        autoFocusedRef.current = false;
      }
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));
    const interval = setInterval(() => {
      const sec = simpleConfig.autoEnterAfterSec;
      if (!sec || sec <= 0) return;
      const elapsed = (Date.now() - lastActivityRef.current) / 1000;
      if (elapsed >= sec && !(focusMode || autoFocusMode)) {
        autoFocusedRef.current = true;
        setAutoFocusMode(true);
      }
    }, 1000);
    return () => {
      events.forEach(ev => window.removeEventListener(ev, onActivity));
      clearInterval(interval);
    };
  }, [simpleConfig.autoEnterAfterSec, focusMode, autoFocusMode]);

  // 输入特效
  useEffect(() => {
    if (!uiConfig.inputFX) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

    const handler = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
      if (el.type === 'range' || el.type === 'color' || el.type === 'checkbox' || el.type === 'radio') return;
      
      spawnInputEffect(uiConfig.inputFXType || 'particles', el, overlay);
    };
    
    document.addEventListener('input', handler, true);
    return () => {
      document.removeEventListener('input', handler, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
  }, [uiConfig.inputFX, uiConfig.inputFXType]);

  // 鼠标特效
  useEffect(() => {
    if (!uiConfig.cursorFX) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

    const handler = (e) => {
      spawnCursorEffect(uiConfig.cursorFXType || 'trail', e.clientX, e.clientY, overlay);
    };

    window.addEventListener('mousemove', handler, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handler);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
  }, [uiConfig.cursorFX, uiConfig.cursorFXType]);

  useEffect(() => {
    document.title = pageTitle || '';
  }, [pageTitle]);

  const handleMainClockClick = React.useCallback(() => {
    if (clockConfig.clickFocusEnabled) setFocusMode(true);
  }, [clockConfig.clickFocusEnabled, setFocusMode]);

  const handleFocusClockClick = React.useCallback(() => {
    if (clockConfig.clickFocusEnabled) setFocusMode(false);
  }, [clockConfig.clickFocusEnabled, setFocusMode]);

  const focusClockLayout = React.useMemo(() => ({
    clockFontSize: simpleConfig.clockFontSize,
    dateFontSize: simpleConfig.dateFontSize,
    weekFontSize: simpleConfig.weekFontSize
  }), [simpleConfig.clockFontSize, simpleConfig.dateFontSize, simpleConfig.weekFontSize]);

  const pageShadowStyle = React.useMemo(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 15,
    boxShadow: uiConfig.pageShadowSize > 0 ? `inset 0 0 ${uiConfig.pageShadowSize}px ${uiConfig.pageShadowColor}` : 'none'
  }), [uiConfig.pageShadowSize, uiConfig.pageShadowColor]);

  return (
    <div className={`app-container relative overflow-hidden ${(focusMode || autoFocusMode) ? 'focus-mode' : ''}`}>
      {/* 背景层 - z-index 0 */}
      <div id="background-layer" className="absolute inset-0 z-0 overflow-hidden">
        {bgConfig.type === 'video' ? (
          <video 
            src={bgRuntimeUrl || bgConfig.url} 
            autoPlay 
            loop 
            muted 
            className="w-full h-full pointer-events-none"
            style={{ ...bgStyle, objectFit: 'cover' }}
          />
        ) : (
          <div 
            className="w-full h-full transition-all duration-500 pointer-events-none"
            style={{ 
              backgroundImage: `url('${bgRuntimeUrl || bgConfig.url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              ...bgStyle 
            }}
          />
        )}
        {/* 遮罩层 */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: `rgba(0,0,0, ${bgConfig.overlayOpacity / 100})` }}
        />
      </div>

      {/* 页面内阴影层 - 覆盖在背景之上 */}
      <div style={pageShadowStyle} />

      {/* 内容层 - z-index 20 */}
      <div className="relative z-20 flex flex-col h-full">
        
        <main className="flex flex-col items-center justify-center flex-1 w-full h-full pb-32 overflow-y-auto custom-scrollbar pointer-events-auto">
          <div className={`mb-6 focus-target clock-wrap ${(focusMode || autoFocusMode) ? 'hidden-fade' : 'visible-fade'}`} style={{ marginTop: layoutConfig.clockTopMargin }}>
            <Clock clockConfig={clockConfig} layoutConfig={layoutConfig} onClick={handleMainClockClick} />
          </div>
          
          <div className={`w-full px-4 mb-8 focus-target search-wrap ${(focusMode || autoFocusMode) ? 'hidden-fade' : 'visible-fade'}`} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: `${layoutConfig.searchWidthPct}vw`, transform: `scale(${layoutConfig.searchScale || 1})`, transformOrigin: 'center' }}>
              <SearchBar searchConfig={searchConfig} setSearchConfig={setSearchConfig} uiConfig={uiConfig} />
            </div>
          </div>

          <div className={`w-full px-4 flex-1 ${(focusMode || autoFocusMode) ? 'hidden-fade' : 'visible-fade'}`}>
             <ShortcutGrid 
               shortcuts={shortcuts} 
               setShortcuts={setShortcuts} 
               gridConfig={gridConfig}
               uiConfig={uiConfig}
               isEditing={isEditing}
               setIsEditing={setIsEditing}
             />
          </div>
        </main>
      </div>
      
      {/* 猫猫！ */}
      {nekoConfig.enabled && (
        <div className={`${(focusMode || autoFocusMode) && nekoConfig.hideInSimple ? 'hidden-fade' : 'visible-fade'}`}>
          <NekoPet nekoConfig={nekoConfig} />
        </div>
      )}

      {/* Dock 固定层 - z-index 50 */}
      <div className={`pointer-events-auto ${(focusMode || autoFocusMode) ? 'hidden-fade' : 'visible-fade'}`}>
          <Dock items={dockItems} setItems={setDockItems} isEditing={isEditing} setIsEditing={setIsEditing} dockConfig={dockConfig} uiConfig={uiConfig} />
      </div>

      <div className={`focus-layer ${(focusMode || autoFocusMode) ? 'visible-fade' : 'hidden-fade'}`}>
        <div className="focus-clock" style={{ transform: `translate(${simpleConfig.clockOffsetXPct}vw, ${simpleConfig.clockOffsetYPct}vh)` }}>
          <Clock clockConfig={clockConfig} layoutConfig={focusClockLayout} onClick={handleFocusClockClick} />
        </div>
        {!simpleConfig.searchHidden && (
          <div className="focus-search w-full px-4" style={{ display: 'flex', justifyContent: 'center', transform: `translate(${simpleConfig.searchOffsetXPct}vw, ${simpleConfig.searchOffsetYPct}vh)` }}>
            <div style={{ width: `${simpleConfig.searchWidthPct}vw`, transform: `scale(${simpleConfig.searchScale || 1})`, transformOrigin: 'center' }}>
              <SearchBar searchConfig={searchConfig} setSearchConfig={setSearchConfig} uiConfig={uiConfig} />
            </div>
          </div>
        )}
      </div>
      
      <Sidebar 
        shortcuts={shortcuts} setShortcuts={setShortcuts}
        bgConfig={bgConfig} setBgConfig={setBgConfig}
        gridConfig={gridConfig} setGridConfig={setGridConfig}
        dockItems={dockItems} setDockItems={setDockItems}
        dockConfig={dockConfig} setDockConfig={setDockConfig}
        searchConfig={searchConfig} setSearchConfig={setSearchConfig}
        clockConfig={clockConfig} setClockConfig={setClockConfig}
        uiConfig={uiConfig} setUiConfig={setUiConfig}
        layoutConfig={layoutConfig} setLayoutConfig={setLayoutConfig}
        simpleConfig={simpleConfig} setSimpleConfig={setSimpleConfig}
        nekoConfig={nekoConfig} setNekoConfig={setNekoConfig}
        pageTitle={pageTitle} setPageTitle={setPageTitle}
        focusMode={focusMode} setFocusMode={setFocusMode}
        isEditing={isEditing} setIsEditing={setIsEditing}
        onOpenTerminal={() => setIsTerminalOpen(true)}
      />
      <WelcomeModal />
      <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  );
}

export default App;
