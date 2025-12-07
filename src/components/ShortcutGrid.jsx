import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, X, Edit2, ImageIcon } from 'lucide-react';
import './ShortcutGrid.css';

const ShortcutGrid = ({ shortcuts, setShortcuts, gridConfig, uiConfig, isEditing, setIsEditing }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const lastOverIndexRef = useRef(null);
  // 弹窗编辑状态
  const [editingId, setEditingId] = useState(null);
  
  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ name: '', url: '', icon: '', labelText: '', labelSize: 25, labelColor: '', labelOffsetY: 0, showIcon: true, bgColor: '', bgOpacity: undefined, size: '1x1' });
  const fileInputRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [confirmClosing, setConfirmClosing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => { setHasLoaded(true); }, []);

  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0, type: 'blank', id: null });
  const menuRef = useRef(null);
  const closeCtx = () => setCtxMenu(prev => ({ ...prev, show: false }));
  useEffect(() => {
    if (!ctxMenu.show) return;
    const handler = (ev) => {
      if (menuRef.current && menuRef.current.contains(ev.target)) return;
      closeCtx();
    };
    const attach = () => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('scroll', handler, true);
      window.addEventListener('resize', handler);
    };
    const detach = () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
    const t = setTimeout(attach, 50);
    return () => { clearTimeout(t); detach(); };
  }, [ctxMenu.show]);

  const { iconSize, gap } = gridConfig;
  const toRgba = (hex, opacity) => {
    const h = (hex || '#ffffff').replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity ?? 0.95})`;
  };

  // 拖拽处理
  const handleDragStart = (e, index) => {
    // 开始拖拽
    setDraggedItem(shortcuts[index]);
    lastOverIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };


  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (lastOverIndexRef.current === index) return;
    lastOverIndexRef.current = index;
    setShortcuts(prev => {
      const draggedOverItem = prev[index];
      if (!draggedItem || draggedItem === draggedOverItem) return prev;
      const items = prev.filter(item => item !== draggedItem);
      items.splice(index, 0, draggedItem);
      return items;
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    lastOverIndexRef.current = null;
  };

  // 新增/编辑/删除处理
  const handleAddClick = () => {
    setModalData({ name: '', url: '', icon: '', size: '1x1', showIcon: true });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (e, item) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setModalData({ ...item, showIcon: item.showIcon !== false });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDeleteClick = (e, id) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setConfirmId(id);
  };

  const confirmDelete = () => {
    if (confirmId != null) {
      setShortcuts(prev => prev.filter(s => s.id !== confirmId));
      setConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmClosing(true);
    setTimeout(() => {
      setConfirmClosing(false);
      setConfirmId(null);
    }, 220);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalData({ ...modalData, icon: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoIconFetch = async () => {
    const u = (modalData.url || '').trim();
    if (!u) return;
    const s = u.toLowerCase();
    let host = '';
    try { host = new URL(s).hostname; } catch (_) {}
    if (!host) {
      const m = s.match(/([a-z0-9-]+\.)+[a-z]{2,}/);
      host = m ? m[0] : '';
    }
    if (!host) return;
    host = host.replace(/[^a-z0-9.-]/g, '').replace(/\.$/, '');
    if (!host.includes('.')) return;
    const apiUrl = `https://favicon.im/zh/${host}?larger=true`;
    setModalData({ ...modalData, icon: apiUrl });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const getRandomIcon = () => `/icons/zakozako/${Math.floor(Math.random() * 50) + 1}.png`;
    
    if (editingId) {
      setShortcuts(prev => prev.map(s => s.id === editingId ? { ...s, ...modalData, id: editingId, icon: modalData.icon || s.icon || getRandomIcon() } : s));
    } else {
      setShortcuts(prev => [...prev, { ...modalData, id: Date.now(), icon: modalData.icon || getRandomIcon() }]);
    }
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setShowModal(false);
    }, 220);
  };

  const openCtxForItem = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 220);
    setCtxMenu({ show: true, x, y, type: 'item', id });
  };
  const openCtxForBlank = (e) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 220);
    setCtxMenu({ show: true, x, y, type: 'blank', id: null });
  };

  return (
    <div className={`shortcut-grid-wrapper relative custom-scrollbar ${(!isEditing && !hasLoaded) ? 'animate-once' : 'no-animate'}`} onContextMenu={openCtxForBlank}>
      <div 
        className="shortcut-grid"
        style={{
          gridTemplateColumns: gridConfig?.customColsEnabled 
            ? `repeat(${gridConfig.customCols || 10}, ${iconSize + 30}px)`
            : `repeat(auto-fill, ${iconSize + 30}px)`,
          gridAutoRows: `${iconSize + 30}px`,
          gridAutoFlow: 'dense',
          gap: `${gap}px`,
        }}
      >
        {shortcuts.map((item, index) => {
          const [spanW, spanH] = (item.size || '1x1').split('x');
          return (
          <div
            key={item.id}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`shortcut-item relative group size-${spanW}x${spanH}`}
            style={{ 
              gridColumn: `span ${spanW}`,
              gridRow: `span ${spanH}`,
              width: '100%',
              height: '100%',
              animationDelay: `${index * 50}ms` 
            }}
          >
            <a 
              href={isEditing ? undefined : item.url} 
              className="flex flex-col items-center w-full h-full"
              onClick={(e) => isEditing && e.preventDefault()}
              onContextMenu={(e) => openCtxForItem(e, item.id)}
              draggable={false}
              onDragStart={(e) => { if (!isEditing) e.preventDefault(); }}
              target={uiConfig?.openInNewTab ? '_blank' : '_self'}
              rel={uiConfig?.openInNewTab ? 'noopener noreferrer' : undefined}
            >
              <div 
                className={`relative flex items-center justify-center ${isEditing ? 'animate-wiggle' : ''}`}
                style={{ 
                  height: 'calc(100% - 24px)', 
                  width: `${(gridConfig?.tileWidthPct?.[`${spanW}x${spanH}`] ?? ((spanW === spanH) ? 100 : 90))}%`,
                  ...(isEditing ? { animationDelay: `${Math.random() * -0.5}s` } : {}) 
                }}
              >
                <div style={{ transform: isEditing ? 'scale(0.9)' : 'scale(1)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'transform 0.3s ease' }}>
                {item.showIcon !== false ? (
                  spanW === spanH ? (
                    <div className="icon-square">
                      <img 
                        src={item.icon ? item.icon : '/icons/icon48.png'} 
                        alt={item.name}
                        className="shortcut-icon transition-transform duration-300"
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'cover',
                          background: toRgba(item.bgColor || gridConfig?.iconBgColor, (item.bgOpacity ?? gridConfig?.iconBgOpacity))
                        }}
                        onError={(e) => {e.target.src = '/icons/icon48.png'}}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <img 
                      src={item.icon ? item.icon : '/icons/icon48.png'} 
                      alt={item.name}
                      className="shortcut-icon transition-transform duration-300"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                        background: toRgba(item.bgColor || gridConfig?.iconBgColor, (item.bgOpacity ?? gridConfig?.iconBgOpacity))
                      }}
                      onError={(e) => {e.target.src = '/icons/icon48.png'}}
                      draggable={false}
                    />
                  )
                ) : (
                  <div 
                    className="shortcut-icon"
                    style={{ 
                      width: '100%', height: '100%', background: toRgba(item.bgColor || gridConfig?.iconBgColor, (item.bgOpacity ?? gridConfig?.iconBgOpacity))
                    }}
                  />
                )}
                {item.labelText && (() => {
                  const labelSize = item.labelSize || 14;
                  const clamp = Math.max(1, Math.floor((((gridConfig?.iconSize || 56) + 30) * Number(spanH)) / (labelSize * 1.2) - (24 / (labelSize * 1.2))));
                  return (
                    <div 
                      className="icon-label"
                      style={{ fontSize: `${labelSize}px`, color: item.labelColor || gridConfig?.nameColor || '#ffffff', transform: `translateY(${item.labelOffsetY || 0}px)`, ['--label-clamp']: clamp }}
                    >
                      {item.labelText}
                    </div>
                  );
                })()}
                </div>
                {/* 编辑/删除按钮，只在编辑模式出现 */}
                {isEditing && (
                  <>
                    <div 
                      className="edit-hit-area delete" 
                      onClick={(e) => handleDeleteClick(e, item.id)}
                      title="删除"
                    >
                      <button 
                        className="edit-mode-btn btn-delete animate-scale-in"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div 
                      className="edit-hit-area edit"
                      onClick={(e) => handleEditClick(e, item)}
                      title="编辑"
                    >
                      <button 
                        className="edit-mode-btn btn-edit animate-scale-in"
                      >
                        <Edit2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <span className="shortcut-name" style={{ color: gridConfig?.nameColor || '#ffffff' }}>{item.name}</span>
            </a>
          </div>
        ); })}

        <div 
          className={`shortcut-item add-shortcut-btn animate-scale-in ${isEditing ? 'force-show' : ''}`}
          onClick={handleAddClick}
          onContextMenu={openCtxForBlank}
          style={{ 
            width: '100%', 
            height: '100%',
            animationDelay: `${shortcuts.length * 50}ms`
          }} 
        >
          <Plus size={32} />
        </div>
      </div>

      {/* 移除覆盖层，直接在 wrapper 上捕获空白右键 */}

      {ctxMenu.show && (
        <div 
          className="context-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y, background: toRgba(uiConfig.ctxMenuBgColor || '#2c2f36', (uiConfig.ctxMenuOpacity ?? 0.92)), color: uiConfig.ctxMenuTextColor || '#fff', backdropFilter: `blur(${uiConfig.ctxMenuBlur || 10}px)`, fontSize: `${uiConfig.ctxMenuFontSize || 15}px` }}
          ref={menuRef}
        >
          {ctxMenu.type === 'item' ? (
            <>
              <div className="context-item" onClick={() => { const it = shortcuts.find(s => s.id === ctxMenu.id); if (it) window.open(it.url, '_blank'); closeCtx(); }}>在新标签页打开</div>
              <div className="context-item" onClick={() => { const it = shortcuts.find(s => s.id === ctxMenu.id); if (it) handleEditClick(null, it); closeCtx(); }}>编辑</div>
              <div className="context-item delete" onClick={() => { handleDeleteClick(null, ctxMenu.id); closeCtx(); }}>删除</div>
            </>
          ) : (
            <>
              <div className="context-item" onClick={() => { handleAddClick(); closeCtx(); }}>新建图标</div>
              {setIsEditing && (
                isEditing ? (
                  <div className="context-item" onClick={() => { setIsEditing(false); closeCtx(); }}>退出图标编辑模式</div>
                ) : (
                  <div className="context-item" onClick={() => { setIsEditing(true); closeCtx(); }}>进入图标编辑模式</div>
                )
              )}
            </>
          )}
        </div>
      )}

      {/* 弹窗 */}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
          <div className={`edit-modal custom-scrollbar animate-scale-in ${closing ? 'closing' : ''}`}>
            <h3>{editingId ? '编辑快捷方式' : '添加快捷方式'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label>名称</label>
                <input 
                  value={modalData.name} 
                  onChange={e => setModalData({...modalData,name: e.target.value})}
                  required 
                  type="text"
                  placeholder="例如：哔哩哔哩"
                />
              </div>
              <div>
                <label>网址 (URL)</label>
                <input 
                  value={modalData.url} 
                  onChange={e => setModalData({...modalData, url: e.target.value})}
                  required 
                  type="text"
                  placeholder="https://..."
                />
              </div>
              <div className="setting-item">
                <label>自定义图标(支持动图)</label>
                <div className="flex gap-4 items-center mt-2">
                   <div className="icon-preview-frame">
                      {modalData.icon ? (
                        <img src={modalData.icon} alt="Preview" className="icon-preview-img" />
                      ) : (
                        <img src="/icons/icon48.png" alt="默认图标" className="icon-preview-img opacity-70" />
                      )}
                   </div>
                   <div className="flex-1">
                     {modalData.showIcon ? (
                       <>
                         <label htmlFor="shortcut-file-input" className="file-btn w-full">选择图片...若不选择将使用随机表情包~</label>
                         <input 
                           id="shortcut-file-input"
                           type="file" 
                           ref={fileInputRef} 
                           hidden 
                           accept="image/*" 
                           onChange={handleFileChange} 
                         />
                          <button type="button" className="file-btn w-full mt-2" onClick={handleAutoIconFetch} disabled={!modalData.url}>自动获取网站图标</button>
                       </>
                     ) : (
                       <div className="text-xs text-white/40 text-center py-2 border border-white/10 rounded bg-white/5">开启显示图片图标后才能使用</div>
                     )}
                   </div>
                </div>
                <div className="setting-row mt-3">
                  <span className="setting-label-strong">显示图片图标</span>
                  <button 
                    type="button"
                    onClick={() => setModalData({ ...modalData, showIcon: !modalData.showIcon })}
                    className={`toggle-switch ${modalData.showIcon ? 'on' : ''}`}
                  >
                    <span className="switch-knob"></span>
                  </button>
                </div>
              </div>
              <div>
                <label>图标叠加文字</label>
                <input 
                  value={modalData.labelText}
                  onChange={e => setModalData({ ...modalData, labelText: e.target.value })}
                  type="text"
                  placeholder="在图标上显示的文字"
                />
              </div>
              <div>
                <label>图标尺寸</label>
                <div className="flex gap-2 mt-2">
                  {['1x1','1x2','2x1','2x2','1x3','2x3','3x1','3x2','3x3'].map(size => (
                    <button 
                      key={size}
                      type="button"
                      onClick={() => setModalData({...modalData, size})}
                      className={`size-btn ${modalData.size === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">叠加文字大小</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="10" max="40" step="1" value={modalData.labelSize} onChange={e => setModalData({ ...modalData, labelSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="10" max="40" step="1"
                  value={modalData.labelSize}
                  onChange={e => setModalData({ ...modalData, labelSize: Number(e.target.value) })}
                />
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">叠加文字颜色</span>
                <input 
                  type="color"
                  className="color-input"
                  value={modalData.labelColor || '#ffffff'}
                  onChange={e => setModalData({ ...modalData, labelColor: e.target.value })}
                />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">叠加文字上下偏移</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="-40" max="40" step="1" value={modalData.labelOffsetY} onChange={e => setModalData({ ...modalData, labelOffsetY: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
                </div>
                <input 
                  type="range" min="-40" max="40" step="1"
                  value={modalData.labelOffsetY}
                  onChange={e => setModalData({ ...modalData, labelOffsetY: Number(e.target.value) })}
                />
              </div>
              <div className="setting-row">
                <span className="setting-label-strong">图标背景颜色</span>
                <input 
                  type="color"
                  className="color-input"
                  value={modalData.bgColor || '#ffffff'}
                  onChange={e => setModalData({ ...modalData, bgColor: e.target.value })}
                />
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <span className="label-text">图标背景透明度</span>
                  <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={modalData.bgOpacity ?? 0.5} onChange={e => setModalData({ ...modalData, bgOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={modalData.bgOpacity ?? 0.5}
                  onChange={e => setModalData({ ...modalData, bgOpacity: Number(e.target.value) })}
                />
              </div>
              
              <div className="flex gap-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => { setClosing(true); setTimeout(() => { setClosing(false); setShowModal(false); }, 220); }}
                  className="action-btn cancel-btn flex-[3]"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="action-btn save-btn flex-1"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {confirmId != null && ReactDOM.createPortal(
        <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
          <div className={`edit-modal animate-scale-in ${confirmClosing ? 'closing' : ''}`}>
            <h3>你确定要删除这个图标吗?</h3>
            <p className="opacity-80">“{(shortcuts.find(s => s.id === confirmId) || {}).name || '此项'}”将会永久消失！（真的很久！）</p>
            <h3></h3>
            <div className="flex gap-4 mt-6">
              <button className="action-btn cancel-btn flex-1" onClick={cancelDelete}>取消</button>
              <button className="action-btn save-btn flex-[1]" onClick={confirmDelete}>删除</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

function toRgba(hexOrRgb, alpha = 1) {
  try {
    if (!hexOrRgb) return `rgba(0,0,0,${alpha})`;
    if (typeof hexOrRgb === 'string' && hexOrRgb.startsWith('rgb')) {
      const nums = hexOrRgb.match(/\d+/g);
      if (!nums) return `rgba(0,0,0,${alpha})`;
      return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
    }
    let h = String(hexOrRgb).replace('#','');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(0,0,0,${alpha})`;
  }
}

export default React.memo(ShortcutGrid);
