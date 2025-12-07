import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Settings, X, Plus, Trash2, Layout, Image as ImageIcon, Grid, Anchor, Edit2, ClipboardList, Monitor, Terminal, Clock, Search, Palette, Cat, User, Sparkles } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import './Sidebar.css';
import './ShortcutGrid.css';
import { setFile } from '../utils/fileCache';
import { exportConfig, importConfig } from '../utils/configIO';

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-1" />;
    
    if (trimmed.startsWith('### ')) {
      return <h4 key={index} className="text-sm font-bold mt-3 mb-2 text-white/90">{trimmed.replace('### ', '')}</h4>;
    }
    
    if (trimmed.startsWith('- ')) {
      const content = trimmed.replace('- ', '');
      const parts = content.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={index} className="flex items-start text-xs text-white/70 leading-relaxed mb-1 pl-2">
          <span className="mr-2 opacity-50">•</span>
          <span>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-white/95 font-bold mx-0.5 px-1 py-0.5 bg-white/10 rounded text-[11px]">{part.replace(/\*\*/g, '')}</span>;
              }
              return part;
            })}
          </span>
        </div>
      );
    }
    
    return <p key={index} className="text-xs text-white/70">{line}</p>;
  });
};

const Sidebar = ({ 
  shortcuts, setShortcuts,
  bgConfig, setBgConfig, 
  gridConfig, setGridConfig,
  dockItems, setDockItems,
  dockConfig, setDockConfig,
  searchConfig, setSearchConfig,
  clockConfig, setClockConfig,
  uiConfig, setUiConfig,
  layoutConfig, setLayoutConfig,
  simpleConfig, setSimpleConfig,
  nekoConfig, setNekoConfig,
  pageTitle, setPageTitle,
  focusMode, setFocusMode,
  isEditing, setIsEditing,
  onOpenTerminal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [activeTab, setActiveTab] = useState('settings'); // 默认为设置

  const fileInputRef = useRef(null);
  const dockIconRef = useRef(null);
  const [editingDockId, setEditingDockId] = useState(null);

  React.useEffect(() => {
    const body = document.body;
    if (isOpen) body.classList.add('sidebar-open');
    else body.classList.remove('sidebar-open');
    return () => body.classList.remove('sidebar-open');
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const [removingId, setRemovingId] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetClosing, setResetClosing] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearClosing, setClearClosing] = useState(false);
  const [clearChallenge, setClearChallenge] = useState({ a: 0, b: 0, input: '' });
  const [clearStep2Open, setClearStep2Open] = useState(false);
  const [clearStep2Closing, setClearStep2Closing] = useState(false);

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      setTodos(todos.filter(todo => todo.id !== id));
      setRemovingId(null);
    }, 250);
  };

  const handleBgFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    const fileKey = 'bg-file';
    await setFile(fileKey, file);
    const previewUrl = URL.createObjectURL(file);
    setBgConfig({
      ...bgConfig,
      type: isVideo ? 'video' : 'image',
      url: previewUrl,
      customFile: true,
      fileKey
    });
  };

  const handleAddDockItem = () => {
    const newId = `d${Date.now()}`;
    setDockItems(prev => [...prev, { id: newId, name: '新项目', url: 'https://', iconUrl: '/icons/icon48.png' }]);
  };

  const handleDeleteDockItem = (id) => {
    setDockItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDockIconChange = (e, id) => {
     const file = e.target.files[0];
     if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         setDockItems(prev => prev.map(item => item.id === id ? { ...item, iconUrl: reader.result } : item));
       };
       reader.readAsDataURL(file);
     }
  };

  const updateDockItem = (id, field, value) => {
    setDockItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const restoreDefaults = () => {
    setBgConfig({ type: 'image', url: '/assets/default-bg.jpg', blur: 0, overlayOpacity: 20, customFile: false });
    setGridConfig({
      iconSize: 68,
      gap: 20,
      iconBgColor: '#ffffff',
      iconBgOpacity: 0.95,
      nameColor: '#ffffff',
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
    setDockConfig({ iconSize: 68, hoverScale: 1.08, bgColor: '#ffffff', bgOpacity: 0.95, tipBgColor: 'rgb(140,140,140)', tipTextColor: '#ffffff', tipOpacity: 0.55, tipBlur: 8 });
    setSearchConfig({ dark: false });
    setClockConfig({ weight: 'normal', timeColor: '#ffffff', timeOpacity: 0.95, showDate: true, showWeek: true, showSeconds: true, dateColor: '#ffffff', dateOpacity: 0.9, weekColor: '#ffffff', weekOpacity: 0.9, clickFocusEnabled: true });
    setLayoutConfig({ clockTopMargin: 40, clockFontSize: 120, dateFontSize: 28, weekFontSize: 28, searchWidthPct: 45, searchScale: 1.0 });
    setSimpleConfig({ clockFontSize: 140, dateFontSize: 28, weekFontSize: 28, searchWidthPct: 43, searchHidden: true, clockOffsetXPct: 0, clockOffsetYPct: -20, searchOffsetXPct: 0, searchOffsetYPct: -20, searchScale: 1.0, autoEnterAfterSec: 20 });
    setUiConfig({ glassBlur: 16, panelBlur: 24, disableContextMenu: true, inputFX: true, disableSelection: true, openInNewTab: true, pageShadowSize: 0, pageShadowColor: '#000000', ctxMenuBgColor: '#000000', ctxMenuTextColor: '#ffffff', ctxMenuBlur: 25, ctxMenuOpacity: 0.4, ctxMenuFontSize: 15 });
    setNekoConfig({ enabled: true, side: 'left', scale: 1.0, offset: 16, hideInSimple: false, amplitude: 3, customImage: null, customTextsEnabled: false, customTexts: '' });
    setPageTitle('Zako♥~');
  };

  const clearUserData = () => {
    try {
      window.localStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  const openClearConfirm = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2-9 之间的随机数
    const b = Math.floor(Math.random() * 8) + 2; // 2-9 之间的随机数
    setClearChallenge({ a, b, input: '' });
    setClearStep2Open(false);
    setClearConfirmOpen(true);
  };

  return (
    <>
      <button className="sidebar-toggle glass" onClick={toggleSidebar} title="设置 & 待办">
        {isOpen ? <X /> : <Settings />}
      </button>
      
      <div className={`sidebar right glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            设置
          </button>
          <button 
            className={`tab-btn ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            待办事项
          </button>
        </div>
        
        {isOpen && (activeTab === 'settings' ? (
          <div className="sidebar-content custom-scrollbar">
            
            

            {/* 编辑模式 */}
            <div className="settings-section">
              <div className={`edit-card ${isEditing ? 'on' : ''}`}>
                <div className="edit-title">
                  <Edit2 size={18}/>
                  <span>图标编辑模式</span>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`toggle-switch ${isEditing ? 'on' : ''}`}
                  title="切换编辑模式"
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
            </div>

            {/* 终端 */}
            <div className="settings-section">
              <button 
                className={`edit-card terminal-open-btn w-full`}
                onClick={(e) => {
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  btn.style.setProperty('--ripple-x', `${x}px`);
                  btn.style.setProperty('--ripple-y', `${y}px`);
                  btn.classList.add('rippling');
                  setTimeout(() => btn.classList.remove('rippling'), 420);
                  if (onOpenTerminal) onOpenTerminal();
                }}
                title="打开DokiDoki终端"
              >
                <div className="edit-title">
                  <Terminal size={22} />
                  <span>打开DokiDoki终端</span>
                </div>
              </button>
            </div>

            {/* 数据备份 */}
            <div className="settings-section">
              <h3 className="section-title text-indigo-300"><ClipboardList size={18}/> 数据备份</h3>
              <div className="setting-row">
                <span className="setting-label-strong">导出配置</span>
                <button className="file-btn" onClick={async () => await exportConfig({
                  shortcuts,
                  dockItems,
                  bgConfig,
                  gridConfig,
                  dockConfig,
                  searchConfig,
                  clockConfig,
                  uiConfig,
                  layoutConfig,
                  simpleConfig,
                  nekoConfig,
                  pageTitle,
                  todos,
                  focusMode
                })}>下载配置</button>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">导入配置</span>
                <div>
                  <button className="file-btn" onClick={() => document.getElementById('import-config-input').click()}>选择文件</button>
                  <input id="import-config-input" type="file" accept="application/json" hidden onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    const text = await file.text()
                    try {
                      const data = JSON.parse(text)
                      await importConfig(data, {
                        setShortcuts,
                        setDockItems,
                        setBgConfig,
                        setGridConfig,
                        setDockConfig,
                        setSearchConfig,
                        setClockConfig,
                        setUiConfig,
                        setLayoutConfig,
                        setSimpleConfig,
                        setNekoConfig,
                        setPageTitle,
                        setTodos,
                        setFocusMode
                      })
                      window.location.reload()
                    } catch (_) {
                      alert('配置导入失败，请检查文件格式')
                    }
                  }} />
                </div>
              </div>
            </div>

            {/* 标题设置 */}
            <div className="settings-section">
              <h3 className="section-title text-indigo-300"><Edit2 size={18}/> 标题设置</h3>
              <div className="setting-item">
                <div className="setting-label">页面标题</div>
                <input 
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="请输入页面标题..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {/* 页面设置 */}
            <div className="settings-section">
              <h3 className="section-title text-yellow-300"><Settings size={18}/> 页面设置</h3>
              <div className="setting-row">
                <span className="setting-label-strong">阻止浏览器右键菜单</span>
                <button 
                  onClick={() => setUiConfig({ ...uiConfig, disableContextMenu: !uiConfig.disableContextMenu })}
                  className={`toggle-switch ${uiConfig.disableContextMenu ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">阻止选中页面元素</span>
                <button 
                  onClick={() => setUiConfig({ ...uiConfig, disableSelection: !uiConfig.disableSelection })}
                  className={`toggle-switch ${uiConfig.disableSelection ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">图标在新标签页打开</span>
                <button 
                  onClick={() => setUiConfig({ ...uiConfig, openInNewTab: !uiConfig.openInNewTab })}
                  className={`toggle-switch ${uiConfig.openInNewTab ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
            </div>

            {/* 特效设置 */}
            <div className="settings-section">
              <h3 className="section-title text-purple-300"><Sparkles size={18}/> 特效设置</h3>
              
              {/* 输入特效 */}
              <div className="setting-row">
                <span className="setting-label-strong">输入框特效</span>
                <button 
                  onClick={() => setUiConfig({ ...uiConfig, inputFX: !uiConfig.inputFX })}
                  className={`toggle-switch ${uiConfig.inputFX ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
              
              {uiConfig.inputFX && (
                <div className="setting-item">
                  <div className="setting-label">特效类型</div>
                  <select
                    value={uiConfig.inputFXType || 'particles'}
                    onChange={(e) => setUiConfig({ ...uiConfig, inputFXType: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                  >
                    <option value="particles">默认粒子 (Default)</option>
                    <option value="fire">火焰 (Fire)</option>
                    <option value="bubbles">气泡 (Bubbles)</option>
                    <option value="stars">星星 (Stars)</option>
                    <option value="matrix">黑客帝国 (Matrix)</option>
                    <option value="heart">爱心 (Heart)</option>
                  </select>
                </div>
              )}

              {/* 鼠标特效 */}
              <div className="setting-row mt-4">
                <span className="setting-label-strong">鼠标滑动特效</span>
                <button 
                  onClick={() => setUiConfig({ ...uiConfig, cursorFX: !uiConfig.cursorFX })}
                  className={`toggle-switch ${uiConfig.cursorFX ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>

              {uiConfig.cursorFX && (
                <div className="setting-item">
                  <div className="setting-label">特效类型</div>
                  <select
                    value={uiConfig.cursorFXType || 'trail'}
                    onChange={(e) => setUiConfig({ ...uiConfig, cursorFXType: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                  >
                    <option value="trail">拖尾 (Trail)</option>
                    <option value="bubbles">气泡 (Bubbles)</option>
                    <option value="stars">星星 (Stars)</option>
                    <option value="fire">火焰 (Fire)</option>
                    <option value="snowflake">雪花 (Snowflake)</option>
                  </select>
                </div>
              )}
            </div>

            {/* 背景设置 */}
            <div className="settings-section">
              <h3 className="section-title text-blue-400"><ImageIcon size={18}/> 背景设置</h3>
              
              <div className="setting-item">
                <div className="setting-label">背景图片/视频</div>
                <div className="custom-input-group">
                   <button 
                    onClick={() => fileInputRef.current.click()}
                    className="file-upload-btn group"
                  >
                    <span>选择本地文件...</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white/20 px-1.5 py-0.5 rounded">Browse</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*,video/*" 
                    onChange={handleBgFileChange} 
                  />
                </div>
                {(bgConfig.customFile || bgConfig.url !== '/assets/default-bg.jpg') && (
                  <div 
                    className="text-xs text-center mt-2 text-white/50 hover:text-white cursor-pointer transition-colors underline decoration-dashed underline-offset-2"
                    onClick={() => setBgConfig(prev => ({ ...prev, type: 'image', url: '/assets/default-bg.jpg', customFile: false, fileKey: undefined }))}
                  >
                    点击此处恢复默认背景
                  </div>
                )}
                {bgConfig.customFile && <p className="text-xs text-yellow-400/80 mt-2">* 设置完成后刷新页面生效哦~</p>}
              </div>

              <div className="setting-item">
                <div className="setting-label">图片 URL</div>
                <input 
                  type="text" 
                  value={bgConfig.type === 'image' && !bgConfig.customFile ? bgConfig.url : ''} 
                  onChange={(e) => setBgConfig({ ...bgConfig, type: 'image', url: e.target.value, customFile: false, fileKey: undefined })}
                  placeholder="https://..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">视频 URL</div>
                <input 
                  type="text" 
                  value={bgConfig.type === 'video' && !bgConfig.customFile ? bgConfig.url : ''}
                  onChange={(e) => setBgConfig({ ...bgConfig, type: 'video', url: e.target.value, customFile: false, fileKey: undefined })}
                  placeholder="https://... (mp4/webm)"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {bgConfig.type === 'video' && !bgConfig.customFile && (
                  <p className="text-xs text-white/40 mt-1">支持mp4/webm视频链接~</p>
                )}
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">背景模糊</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="20" step="1" value={bgConfig.blur} onChange={(e) => setBgConfig({ ...bgConfig, blur: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" 
                  min="0" max="20" 
                  value={bgConfig.blur} 
                  onChange={(e) => setBgConfig({ ...bgConfig, blur: Number(e.target.value) })}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">遮罩透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="100" step="1" value={bgConfig.overlayOpacity} onChange={(e) => setBgConfig({ ...bgConfig, overlayOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={bgConfig.overlayOpacity} 
                  onChange={(e) => setBgConfig({ ...bgConfig, overlayOpacity: Number(e.target.value) })}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">组件毛玻璃模糊</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="40" step="1" value={uiConfig.glassBlur} onChange={(e) => setUiConfig({ ...uiConfig, glassBlur: Number(e.target.value), panelBlur: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="0" max="40" 
                  value={uiConfig.glassBlur}
                  onChange={(e) => setUiConfig({ ...uiConfig, glassBlur: Number(e.target.value), panelBlur: Number(e.target.value) })}
                />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">页面边缘内阴影大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="100" step="1" value={uiConfig.pageShadowSize} onChange={(e) => setUiConfig({ ...uiConfig, pageShadowSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="0" max="250" step="1"
                  value={uiConfig.pageShadowSize}
                  onChange={(e) => setUiConfig({ ...uiConfig, pageShadowSize: Number(e.target.value) })}
                />
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">页面边缘内阴影颜色</span>
                <input 
                  type="color" 
                  className="color-input" 
                  value={uiConfig.pageShadowColor}
                  onChange={(e) => setUiConfig({ ...uiConfig, pageShadowColor: e.target.value })}
                />
              </div>
            </div>

            {/* 时钟设置 */}
            <div className="settings-section">
              <h3 className="section-title text-pink-300"><Clock size={18}/> 时钟</h3>
              <div className="setting-row">
                <span className="setting-label-strong">字体粗细</span>
                <select className="select-compact" value={clockConfig.weight} onChange={(e) => setClockConfig({ ...clockConfig, weight: e.target.value })}>
                  <option value="light">细体</option>
                  <option value="normal">普通</option>
                  <option value="bold">粗体</option>
                </select>
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">数字切换动画</span>
                <select className="select-compact" value={clockConfig.digitAnimation || 'none'} onChange={(e) => setClockConfig({ ...clockConfig, digitAnimation: e.target.value })}>
                  <option value="none">无</option>
                  <option value="slide">滑动</option>
                  <option value="flip">翻页</option>
                  <option value="fade">淡入</option>
                  <option value="zoom">缩放</option>
                  <option value="blur">模糊</option>
                  <option value="elastic">回弹</option>
                  <option value="tumble">下坠</option>
                  <option value="swap">横向</option>
                  <option value="door">开门</option>
                  <option value="bounce">弹跳</option>
                  <option value="glitch">故障</option>
                  <option value="roll">滚动</option>
                  <option value="neon">霓虹</option>
                  <option value="drop">下坠</option>
                  <option value="shake">震动</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">时钟大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="40" max="300" step="1" value={layoutConfig.clockFontSize} onChange={(e) => setLayoutConfig({ ...layoutConfig, clockFontSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="40" max="300" step="1" value={layoutConfig.clockFontSize} onChange={(e) => setLayoutConfig({ ...layoutConfig, clockFontSize: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">日期/星期大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="12" max="80" step="1" value={layoutConfig.dateFontSize} onChange={(e) => setLayoutConfig({ ...layoutConfig, dateFontSize: Number(e.target.value), weekFontSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="12" max="80" step="1" value={layoutConfig.dateFontSize} onChange={(e) => setLayoutConfig({ ...layoutConfig, dateFontSize: Number(e.target.value), weekFontSize: Number(e.target.value) })} />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">显示秒钟</span>
                <button onClick={() => setClockConfig({ ...clockConfig, showSeconds: !clockConfig.showSeconds })} className={`toggle-switch ${clockConfig.showSeconds ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">顶部间距</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1200" step="1" value={layoutConfig.clockTopMargin} onChange={(e) => setLayoutConfig({ ...layoutConfig, clockTopMargin: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="0" max="1200" step="1" value={layoutConfig.clockTopMargin} onChange={(e) => setLayoutConfig({ ...layoutConfig, clockTopMargin: Number(e.target.value) })} />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">时钟颜色</span>
                <input type="color" className="color-input" value={clockConfig.timeColor} onChange={(e) => setClockConfig({ ...clockConfig, timeColor: e.target.value })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">时钟透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={clockConfig.timeOpacity} onChange={(e) => setClockConfig({ ...clockConfig, timeOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={clockConfig.timeOpacity} onChange={(e) => setClockConfig({ ...clockConfig, timeOpacity: Number(e.target.value) })} />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">显示日历</span>
                <button onClick={() => setClockConfig({ ...clockConfig, showDate: !clockConfig.showDate })} className={`toggle-switch ${clockConfig.showDate ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">日历颜色</span>
                <input type="color" className="color-input" value={clockConfig.dateColor} onChange={(e) => setClockConfig({ ...clockConfig, dateColor: e.target.value })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">日历透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={clockConfig.dateOpacity} onChange={(e) => setClockConfig({ ...clockConfig, dateOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={clockConfig.dateOpacity} onChange={(e) => setClockConfig({ ...clockConfig, dateOpacity: Number(e.target.value) })} />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">显示星期</span>
                <button onClick={() => setClockConfig({ ...clockConfig, showWeek: !clockConfig.showWeek })} className={`toggle-switch ${clockConfig.showWeek ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              
              <div className="setting-row">
                <span className="setting-label-strong">星期颜色</span>
                <input type="color" className="color-input" value={clockConfig.weekColor} onChange={(e) => setClockConfig({ ...clockConfig, weekColor: e.target.value })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">星期透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={clockConfig.weekOpacity} onChange={(e) => setClockConfig({ ...clockConfig, weekOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={clockConfig.weekOpacity} onChange={(e) => setClockConfig({ ...clockConfig, weekOpacity: Number(e.target.value) })} />
              </div>
            </div>

            {/* 搜索框设置 */}
            <div className="settings-section">
              <h3 className="section-title text-yellow-300"><Search size={18}/> 搜索框</h3>
              <div className="setting-row">
                <span className="setting-label-strong">暗色模式</span>
                <button 
                  onClick={() => setSearchConfig({ ...searchConfig, dark: !searchConfig.dark })}
                  className={`toggle-switch ${searchConfig.dark ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索栏长度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="30" max="100" step="1" value={layoutConfig.searchWidthPct} onChange={(e) => setLayoutConfig({ ...layoutConfig, searchWidthPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="30" max="100" step="1" value={layoutConfig.searchWidthPct} onChange={(e) => setLayoutConfig({ ...layoutConfig, searchWidthPct: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索栏缩放</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0.6" max="1.6" step="0.01" value={layoutConfig.searchScale || 1} onChange={(e) => setLayoutConfig({ ...layoutConfig, searchScale: Number(e.target.value) })} /><span className="unit-suffix">x</span></div>
                </div>
                <input type="range" min="0.6" max="1.6" step="0.01" value={layoutConfig.searchScale || 1} onChange={(e) => setLayoutConfig({ ...layoutConfig, searchScale: Number(e.target.value) })} />
              </div>

            </div>

            {/* 图标布局 */}
            <div className="settings-section">
              <h3 className="section-title text-green-400"><Grid size={18}/> 图标布局</h3>
              
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="40" max="120" step="1" value={gridConfig.iconSize} onChange={(e) => setGridConfig({ ...gridConfig, iconSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" 
                  min="40" max="120" 
                  value={gridConfig.iconSize} 
                  onChange={(e) => setGridConfig({ ...gridConfig, iconSize: Number(e.target.value) })}
                  className="accent-green-500"
                />
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标间距</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="10" max="60" step="1" value={gridConfig.gap} onChange={(e) => setGridConfig({ ...gridConfig, gap: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" 
                  min="0" max="60" 
                  value={gridConfig.gap} 
                  onChange={(e) => setGridConfig({ ...gridConfig, gap: Number(e.target.value) })}
                  className="accent-green-500"
                />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">自定义列数</span>
                <button 
                  onClick={() => setGridConfig({ ...gridConfig, customColsEnabled: !gridConfig.customColsEnabled })} 
                  className={`toggle-switch ${gridConfig.customColsEnabled ? 'on' : ''}`}
                >
                  <span className="switch-knob"></span>
                </button>
              </div>

              {gridConfig.customColsEnabled && (
                <div className="setting-item">
                  <div className="setting-label">
                    <span className="label-text">列数设置</span>
                    <div className="label-value">
                      <input 
                        className="setting-value-input" 
                        type="number" min="1" max="20" step="1" 
                        value={gridConfig.customCols || 10} 
                        onChange={(e) => setGridConfig({ ...gridConfig, customCols: Number(e.target.value) })} 
                      />
                      <span className="unit-suffix">列</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="20" step="1" 
                    value={gridConfig.customCols || 10} 
                    onChange={(e) => setGridConfig({ ...gridConfig, customCols: Number(e.target.value) })}
                    className="accent-green-500"
                  />
                </div>
              )}

              <div className="setting-row">
                <span className="setting-label-strong">图标背景颜色</span>
                <input 
                  type="color" 
                  className="color-input"
                  value={gridConfig.iconBgColor}
                  onChange={(e) => setGridConfig({ ...gridConfig, iconBgColor: e.target.value })}
                />
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">图标文字颜色</span>
                <input 
                  type="color" 
                  className="color-input"
                  value={gridConfig.nameColor || '#ffffff'}
                  onChange={(e) => setGridConfig({ ...gridConfig, nameColor: e.target.value })}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标背景透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={gridConfig.iconBgOpacity} onChange={(e) => setGridConfig({ ...gridConfig, iconBgOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={gridConfig.iconBgOpacity}
                  onChange={(e) => setGridConfig({ ...gridConfig, iconBgOpacity: Number(e.target.value) })}
                />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">各尺寸图标宽度(%)</span>
                </div>
                {['1x1','1x2','1x3','2x1','2x2','2x3','3x1','3x2','3x3'].map(size => (
                  <div key={size} style={{ marginBottom: 12 }}>
                    <div className="setting-row">
                      <span className="setting-label-strong">{size}</span>
                      <div className="label-value">
                        <input 
                          className="setting-value-input" 
                          type="number" min="20" max="100" step="1"
                          value={(gridConfig.tileWidthPct?.[size] ?? ((() => { const [w,h] = size.split('x'); return w===h ? 100 : 90; })()))}
                          onChange={(e) => setGridConfig({ 
                            ...gridConfig, 
                            tileWidthPct: { ...(gridConfig.tileWidthPct || {}), [size]: Number(e.target.value) }
                          })}
                        />
                        <span className="unit-suffix">%</span>
                      </div>
                    </div>
                    <input 
                      type="range" min="20" max="100" step="1"
                      value={(gridConfig.tileWidthPct?.[size] ?? ((() => { const [w,h] = size.split('x'); return w===h ? 100 : 90; })()))}
                      onChange={(e) => setGridConfig({ 
                        ...gridConfig, 
                        tileWidthPct: { ...(gridConfig.tileWidthPct || {}), [size]: Number(e.target.value) }
                      })}
                    />
                  </div>
                ))}
              </div>

            </div>


            {/* 简洁模式设置 */}
            <div className="settings-section">
              <h3 className="section-title text-pink-300"><Palette size={18}/> 简洁模式样式设置</h3>

              <div className="setting-row">
                <span className="setting-label-strong">点击时钟切换简洁模式</span>
                <button onClick={() => setClockConfig({ ...clockConfig, clickFocusEnabled: !clockConfig.clickFocusEnabled })} className={`toggle-switch ${clockConfig.clickFocusEnabled ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">自动切换简洁模式秒数(0为关闭)</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="600" step="1" value={simpleConfig.autoEnterAfterSec} onChange={(e) => setSimpleConfig({ ...simpleConfig, autoEnterAfterSec: Number(e.target.value) })} /><span className="unit-suffix">s</span></div>
                </div>
                <input type="range" min="0" max="600" step="1" value={simpleConfig.autoEnterAfterSec} onChange={(e) => setSimpleConfig({ ...simpleConfig, autoEnterAfterSec: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">时钟大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="40" max="300" step="1" value={simpleConfig.clockFontSize} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockFontSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="40" max="300" step="1" value={simpleConfig.clockFontSize} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockFontSize: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">日期/星期大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="12" max="80" step="1" value={simpleConfig.dateFontSize} onChange={(e) => setSimpleConfig({ ...simpleConfig, dateFontSize: Number(e.target.value), weekFontSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="12" max="80" step="1" value={simpleConfig.dateFontSize} onChange={(e) => setSimpleConfig({ ...simpleConfig, dateFontSize: Number(e.target.value), weekFontSize: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索栏长度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="30" max="100" step="1" value={simpleConfig.searchWidthPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchWidthPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="30" max="100" step="1" value={simpleConfig.searchWidthPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchWidthPct: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索栏缩放</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0.6" max="1.6" step="0.01" value={simpleConfig.searchScale || 1} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchScale: Number(e.target.value) })} /><span className="unit-suffix">x</span></div>
                </div>
                <input type="range" min="0.6" max="1.6" step="0.01" value={simpleConfig.searchScale || 1} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchScale: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">时钟左右偏移</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="-50" max="50" step="1" value={simpleConfig.clockOffsetXPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockOffsetXPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="-50" max="50" step="1" value={simpleConfig.clockOffsetXPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockOffsetXPct: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">时钟上下偏移</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="-50" max="50" step="1" value={simpleConfig.clockOffsetYPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockOffsetYPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="-50" max="50" step="1" value={simpleConfig.clockOffsetYPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, clockOffsetYPct: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索框左右偏移</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="-50" max="50" step="1" value={simpleConfig.searchOffsetXPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchOffsetXPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="-50" max="50" step="1" value={simpleConfig.searchOffsetXPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchOffsetXPct: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">搜索框上下偏移</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="-50" max="50" step="1" value={simpleConfig.searchOffsetYPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchOffsetYPct: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="-50" max="50" step="1" value={simpleConfig.searchOffsetYPct} onChange={(e) => setSimpleConfig({ ...simpleConfig, searchOffsetYPct: Number(e.target.value) })} />
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">隐藏搜索栏</span>
                <button onClick={() => setSimpleConfig({ ...simpleConfig, searchHidden: !simpleConfig.searchHidden })} className={`toggle-switch ${simpleConfig.searchHidden ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
            </div>
            
            {/* Dock 设置 */}
            <div className="settings-section">
               <h3 className="section-title text-purple-400"><Anchor size={18}/> Dock栏设置</h3>

               <div className="setting-row">
                 <span className="setting-label-strong">名称提示框背景色</span>
                 <input 
                   type="color"
                   className="color-input"
                   value={dockConfig.tipBgColor}
                   onChange={(e) => setDockConfig({ ...dockConfig, tipBgColor: e.target.value })}
                 />
               </div>

               <div className="setting-row">
                 <span className="setting-label-strong">名称提示框文字颜色</span>
                 <input 
                   type="color"
                   className="color-input"
                   value={dockConfig.tipTextColor}
                   onChange={(e) => setDockConfig({ ...dockConfig, tipTextColor: e.target.value })}
                 />
               </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">名称提示框透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={dockConfig.tipOpacity} onChange={(e) => setDockConfig({ ...dockConfig, tipOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={dockConfig.tipOpacity}
                  onChange={(e) => setDockConfig({ ...dockConfig, tipOpacity: Number(e.target.value) })}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">名称提示框模糊</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="30" step="1" value={dockConfig.tipBlur} onChange={(e) => setDockConfig({ ...dockConfig, tipBlur: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="0" max="30" step="1"
                  value={dockConfig.tipBlur}
                  onChange={(e) => setDockConfig({ ...dockConfig, tipBlur: Number(e.target.value) })}
                />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标鼠标交互缩放</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="1" max="1.5" step="0.01" value={dockConfig.hoverScale} onChange={(e) => setDockConfig({ ...dockConfig, hoverScale: Number(e.target.value) })} /><span className="unit-suffix">x</span></div>
                </div>
                <input 
                  type="range" min="1" max="1.5" step="0.01"
                  value={dockConfig.hoverScale} 
                  onChange={(e) => setDockConfig({ ...dockConfig, hoverScale: Number(e.target.value) })}
                />
              </div>
              {/* 图标设置的说 */}
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="40" max="100" step="1" value={dockConfig.iconSize} onChange={(e) => setDockConfig({ ...dockConfig, iconSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="40" max="100" 
                  value={dockConfig.iconSize} 
                  onChange={(e) => setDockConfig({ ...dockConfig, iconSize: Number(e.target.value) })}
                />
              </div>

               <div className="setting-row">
                 <span className="setting-label-strong">图标背景颜色</span>
                 <input 
                   type="color"
                   className="color-input"
                   value={dockConfig.bgColor}
                   onChange={(e) => setDockConfig({ ...dockConfig, bgColor: e.target.value })}
                 />
               </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标背景透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={dockConfig.bgOpacity} onChange={(e) => setDockConfig({ ...dockConfig, bgOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={dockConfig.bgOpacity}
                  onChange={(e) => setDockConfig({ ...dockConfig, bgOpacity: Number(e.target.value) })}
                />
              </div>

              {/* 列表的说，早期废弃代码qwq */}
               {/*
               <div className="dock-edit-list">
                 {dockItems && dockItems.map((item) => (
                   <div key={item.id} className="dock-edit-item group relative">
                      <div 
                        className="dock-edit-icon"
                        onClick={() => {
                           setEditingDockId(item.id);
                           dockIconRef.current.click();
                        }}
                      >
                        {item.iconUrl ? (
                          <img src={item.iconUrl} className="w-full h-full object-cover" alt={item.name}/>
                        ) : (
                           <img src={`https://www.google.com/s2/favicons?sz=64&domain=${item.url}`} className="w-6 h-6" alt={item.name}/>
                        )}
                        <div className="dock-edit-overlay">
                          <Edit2 size={14} />
                        </div>
                      </div>
                      
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text"
                      value={item.name}
                      onChange={(e) => updateDockItem(item.id, 'name', e.target.value)}
                      className="dock-input-name"
                      placeholder="名称"
                    />
                    <input 
                      type="text"
                      value={item.url}
                      onChange={(e) => updateDockItem(item.id, 'url', e.target.value)}
                      className="dock-input-url"
                      placeholder="URL"
                    />
                  </div>
                  <div className="dock-edit-actions">
                    <button 
                      onClick={() => handleDeleteDockItem(item.id)}
                      className="dock-edit-delete"
                      title="删除图标"
                    >
                       <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                   </div>
                 ))}
                 
                <button 
                  onClick={handleAddDockItem}
                  className="w-full py-3 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                >
                  <Plus size={18} />
                  <span className="ml-2 text-sm font-medium">添加图标</span>
                </button>

                 <input 
                   type="file"
                   hidden
                   ref={dockIconRef}
                   accept="image/*"
                   onChange={(e) => handleDockIconChange(e, editingDockId)}
                 />
               </div>
               */}
            </div>

            <div className="settings-section">
              <h3 className="section-title text-indigo-300"><Layout size={18}/> 右键菜单样式设置</h3>
              <div className="setting-row">
                <span className="setting-label-strong">背景颜色</span>
                <input type="color" className="color-input" value={uiConfig.ctxMenuBgColor} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuBgColor: e.target.value })} />
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">文字颜色</span>
                <input type="color" className="color-input" value={uiConfig.ctxMenuTextColor} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuTextColor: e.target.value })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">模糊程度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="30" step="1" value={uiConfig.ctxMenuBlur} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuBlur: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="0" max="30" step="1" value={uiConfig.ctxMenuBlur} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuBlur: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">字体大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="12" max="24" step="1" value={uiConfig.ctxMenuFontSize || 15} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuFontSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="12" max="24" step="1" value={uiConfig.ctxMenuFontSize || 15} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuFontSize: Number(e.target.value) })} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={uiConfig.ctxMenuOpacity ?? 0.92} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={uiConfig.ctxMenuOpacity ?? 0.92} onChange={(e) => setUiConfig({ ...uiConfig, ctxMenuOpacity: Number(e.target.value) })} />
              </div>
            </div>

            {/* 猫猫，好耶！ */}
            <div className="settings-section">
              <h3 className="section-title text-pink-300"><Cat size={18}/> 猫猫</h3>
              <div className="setting-row">
                <span className="setting-label-strong">猫猫启用</span>
                <button onClick={() => setNekoConfig(prev => ({ ...prev, enabled: !prev.enabled }))} className={`toggle-switch ${nekoConfig?.enabled ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">位置</span>
                <select className="select-compact" value={nekoConfig?.side || 'right'} onChange={(e) => setNekoConfig(prev => ({ ...prev, side: e.target.value }))}>
                  <option value="left">左侧</option>
                  <option value="right">右侧</option>
                </select>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">简洁模式隐藏猫猫</span>
                <button onClick={() => setNekoConfig(prev => ({ ...prev, hideInSimple: !prev.hideInSimple }))} className={`toggle-switch ${nekoConfig?.hideInSimple ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">屏幕过窄时隐藏</span>
                <button onClick={() => setNekoConfig(prev => ({ ...prev, hideOnSmallScreen: !prev.hideOnSmallScreen }))} className={`toggle-switch ${nekoConfig?.hideOnSmallScreen ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">距离网页边界间距</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="240" step="1" value={nekoConfig?.offset ?? 16} onChange={(e) => setNekoConfig(prev => ({ ...prev, offset: Number(e.target.value) }))} /><span className="unit-suffix">px</span></div>
                </div>
                <input type="range" min="0" max="240" step="1" value={nekoConfig?.offset ?? 16} onChange={(e) => setNekoConfig(prev => ({ ...prev, offset: Number(e.target.value) }))} />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">猫猫缩放大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0.6" max="1.6" step="0.01" value={nekoConfig?.scale || 1} onChange={(e) => setNekoConfig(prev => ({ ...prev, scale: Number(e.target.value) }))} /><span className="unit-suffix">x</span></div>
                </div>
                <input type="range" min="0.6" max="1.6" step="0.01" value={nekoConfig?.scale || 1} onChange={(e) => setNekoConfig(prev => ({ ...prev, scale: Number(e.target.value) }))} />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">晃动幅度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="45" step="1" value={nekoConfig?.amplitude ?? 3} onChange={(e) => setNekoConfig(prev => ({ ...prev, amplitude: Number(e.target.value) }))} /><span className="unit-suffix">deg</span></div>
                </div>
                <input type="range" min="0" max="45" step="1" value={nekoConfig?.amplitude ?? 3} onChange={(e) => setNekoConfig(prev => ({ ...prev, amplitude: Number(e.target.value) }))} />
              </div>

              <div className="setting-item">
                <div className="setting-label">自定义图片</div>
                <div className="custom-input-group">
                   <label className="file-upload-btn group cursor-pointer">
                    <span>{nekoConfig?.customImage ? '已选择图片 (点击更换)' : '选择图片...'}</span>
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                             setNekoConfig(prev => ({ ...prev, customImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                {nekoConfig?.customImage && (
                   <button 
                     className="text-xs text-red-400 mt-2 hover:underline"
                     onClick={() => setNekoConfig(prev => ({ ...prev, customImage: null }))}
                   >
                     重置为默认图片
                   </button>
                )}
              </div>

              <div className="setting-row">
                <span className="setting-label-strong">启用自定义语录</span>
                <button onClick={() => setNekoConfig(prev => ({ ...prev, customTextsEnabled: !prev.customTextsEnabled }))} className={`toggle-switch ${nekoConfig?.customTextsEnabled ? 'on' : ''}`}>
                  <span className="switch-knob"></span>
                </button>
              </div>
              {nekoConfig?.customTextsEnabled && (
                <div className="setting-item">
                  <div className="setting-label">自定义语录 (每行一句)</div>
                  <textarea 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors h-24 resize-none custom-scrollbar placeholder-white/30"
                    placeholder="喵~ (默认语录)"
                    value={nekoConfig?.customTexts || ''}
                    onChange={(e) => setNekoConfig(prev => ({ ...prev, customTexts: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {/* 底部恢复/清除 */}
            <div className="settings-section">
              <div className="setting-item">
                <button className="danger-glow-btn" onClick={() => setResetConfirmOpen(true)}>恢复默认设置 (不删除图标)</button>
              </div>
              <div className="setting-item">
                <button className="danger-glow-btn" onClick={openClearConfirm}>清除全部用户数据 (删除图标)</button>
              </div>
            </div>

            {/* 关于本项目 */}
            <div className="settings-section">
              <h3 className="section-title text-indigo-400"><Monitor size={18}/> 关于本项目</h3>
              <div className="project-card">
                 <div className="project-header">
                    <div className="project-logo-container">
                      <img src="/icons/icon128.png" alt="DokiTab" className="project-logo" />
                    </div>
                    <div className="project-title">DokiTab</div>
                    <div className="project-version">Release_1.0.0</div>
                 </div>
                 <div className="project-changelog">
                    <div className="changelog-content">
                        {renderMarkdown(`
### Release_1.0.0 更新日志
- **新增 -** 更新了若干功能
- **修复 -** 修复了部分已知问题
- **改进 -** 改进了用户使用体验
- **说明 -** 这是对标大厂的日志w
- **说明 -** 给我点个Star嘛~
                        `)}
                    </div>
                 </div>
                 <a href="https://github.com/NekoQiye/DokiTab" target="_blank" rel="noreferrer" className="project-repo-btn">
                   ♥项目仓库♥
                 </a>
              </div>
            </div>

            {/* 作者栏位 */}
            <div className="settings-section">
              <h3 className="section-title text-pink-400"><User size={18}/> 关于作者</h3>
              <div className="author-card">
                <img src="/assets/neko-qiye.png" alt="祈烨猫猫" className="author-avatar" />
                <div className="author-info">
                  <span className="name">祈烨猫猫</span>
                  <a href="https://space.bilibili.com/1477363664" target="_blank" rel="noreferrer" className="author-link">
                    Nya nya nya ? Nya nya nya~~
                  </a>
                  <a href="https://github.com/NekoQiye/" target="_blank" rel="noreferrer" className="repo-btn">
                    ♥Github主页♥
                  </a>
                </div>
              </div>
            </div>

            {/* 画师栏位 */}
            <div className="settings-section">
              <h3 className="section-title text-blue-300"><Palette size={18}/> 关于画师</h3>
              {/* 1. NachoNeko */}
              <div className="artist-card nacho">
                <img src="/assets/nacho.jpg" alt="甘城なつき" className="author-avatar" />
                <div className="author-info">
                  <span className="name">甘城なつき</span>
                  <a href="https://t.co/OpxXBqzkwL" target="_blank" rel="noreferrer" className="artist-link-nacho">
                    本项目吉祥物和作者头像画师~
                  </a>
                  <a href="https://x.com/amsrntk3" target="_blank" rel="noreferrer" className="artist-repo-btn-nacho">
                    ♥推特(X)主页♥
                  </a>
                </div>
              </div>

              {/* 2. 明风 OuO */}
              <div className="artist-card ming">
                <img src="/assets/ouo.jpg" alt="明风OuO" className="author-avatar" />
                <div className="author-info">
                  <span className="name">明风OuO</span>
                  <a href="https://www.bilibili.com/opus/1088645747074662400" target="_blank" rel="noreferrer" className="artist-link-ming">
                    本项目部分插画版权持有者~
                  </a>
                  <a href="https://space.bilibili.com/274939213/" target="_blank" rel="noreferrer" className="artist-repo-btn-ming">
                    ♥B站主页♥
                  </a>
                </div>
              </div>

              {/* 3. ぴよみゅう */}
              <div className="artist-card piyomew">
                <img src="/assets/piyomew.jpg" alt="ぴよみゅう" className="author-avatar" />
                <div className="author-info">
                  <span className="name">ぴよみゅう</span>
                  <a href="https://www.pixiv.net/users/12838739" target="_blank" rel="noreferrer" className="artist-link-piyomew">
                    本项目默认壁纸画师~
                  </a>
                  <a href="https://x.com/piyomew/media" target="_blank" rel="noreferrer" className="artist-repo-btn-piyomew">
                    ♥推特(X)主页♥
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <form onSubmit={addTodo} className="mb-4 todo-form">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="添加待办事项...[Enter]"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all"
              />
            </form>
            
            <ul className="todo-list custom-scrollbar space-y-2">
              {todos.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-30">
                   <ClipboardList size={40} />
                   <p className="mt-2 text-sm">暂无待办事项，今天很清闲哦</p>
                </div>
              )}
              {todos.map((todo, idx) => (
                <li key={todo.id} className={`todo-item group ${todo.completed ? 'completed' : ''} ${removingId === todo.id ? 'removing' : ''}`}>
                  <div className="todo-index">#{idx + 1}</div>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 rounded border-white/30 bg-transparent checked:bg-blue-500 transition-all"
                  />
                  <span className="flex-1 ml-3 text-sm">{todo.text}</span>
                  <button 
                    onClick={() => startRemove(todo.id)} 
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {false && resetConfirmOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className={`edit-modal animate-scale-in ${resetClosing ? 'closing' : ''}`}>
              <h3>你确定要恢复为默认设置吗?</h3>
              <p className="opacity-80">此操作会重置页面设置，但不会删除快捷方式和 Dock 图标。</p>
              <h3></h3>
              <div className="flex gap-4 mt-6">
                <button className="action-btn cancel-btn flex-1" onClick={() => setResetConfirmOpen(false)}>取消</button>
                <button className="action-btn save-btn flex-[1]" onClick={() => { setResetClosing(true); setTimeout(() => { restoreDefaults(); setResetClosing(false); setResetConfirmOpen(false); }, 220); }}>恢复</button>
              </div>
            </div>
          </div>
        )}

        {false && clearConfirmOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className={`edit-modal animate-scale-in ${clearClosing ? 'closing' : ''}`}>
              <h3>你确定要清除所有用户数据吗?</h3>
              <p className="opacity-80">此操作将删除本扩展的所有本地数据，页面将刷新。</p>
              <h3></h3>
              <div className="flex gap-4 mt-6">
                <button className="action-btn cancel-btn flex-1" onClick={() => setClearConfirmOpen(false)}>取消</button>
                <button className="action-btn save-btn flex-[1]" onClick={() => { setClearClosing(true); setTimeout(() => { clearUserData(); }, 180); }}>清除</button>
              </div>
            </div>
          </div>
        )}

      </div>
      {resetConfirmOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
          <div className={`edit-modal animate-scale-in ${resetClosing ? 'closing' : ''}`}>
            <h3>确定要恢复为默认设置嘛</h3>
            <p className="opacity-80">此操作会重置页面基础设置哦,<br/><br/>最好是你觉得搞砸了什么的话再进行重置呐,<br/><br/>此操作不会删除快捷方式和 Dock 图标~</p>
            <h3></h3>
            <div className="flex gap-4 mt-6">
              <button className="action-btn cancel-btn flex-1" onClick={() => setResetConfirmOpen(false)}>取消</button>
              <button className="action-btn save-btn flex-[1]" onClick={() => { setResetClosing(true); setTimeout(() => { restoreDefaults(); setResetClosing(false); setResetConfirmOpen(false); }, 220); }}>恢复</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {clearConfirmOpen && !clearStep2Open && ReactDOM.createPortal(
        <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
          <div className={`edit-modal animate-scale-in ${clearClosing ? 'closing' : ''}`}>
            <h3>清除所有用户数据 - 需要验证</h3>
            <p className="opacity-80">本操作为高危操作，请输入 {clearChallenge.a} × {clearChallenge.b} 的结果以继续,<br/><br/>输入错误点击下一步是没有反应的哦~</p>
            <h4> ​</h4>
            <div className="mt-4">
              <input 
                type="text" 
                value={clearChallenge.input} 
                onChange={(e) => setClearChallenge({ ...clearChallenge, input: e.target.value })}
                placeholder="请输入乘法计算结果~"
              />
            </div>
            <h4> ​</h4>
            <div className="flex gap-4 mt-6">
              <button className="action-btn cancel-btn flex-1" onClick={() => setClearConfirmOpen(false)}>取消</button>
              <button 
                className="action-btn save-btn flex-[1]" 
                onClick={() => setClearStep2Open(true)}
                disabled={parseInt(clearChallenge.input, 10) !== (clearChallenge.a * clearChallenge.b)}
              >
                下一步
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {clearConfirmOpen && clearStep2Open && ReactDOM.createPortal(
        <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
          <div className={`edit-modal animate-scale-in ${clearStep2Closing ? 'closing' : ''}`}>
            <h3>清除所有用户数据 - 二次确认</h3>
            <p className="opacity-80">你即将清除所有用户数据，此操作不可恢复！<br/><br/>建议先下载配置后再执行此操作！</p>
            <h3></h3>
            <div className="flex gap-4 mt-6">
              <button className="action-btn cancel-btn flex-1" onClick={() => { setClearStep2Open(false); setClearConfirmOpen(false); }}>取消</button>
              <button className="action-btn save-btn flex-[1]" onClick={() => { setClearStep2Closing(true); setTimeout(() => { clearUserData(); }, 180); }}>清除</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default React.memo(Sidebar);
