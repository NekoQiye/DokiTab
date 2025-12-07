import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Edit2, Plus, X } from 'lucide-react';
import './Dock.css';

const Dock = ({ items, setItems, isEditing, setIsEditing, dockConfig, uiConfig }) => {
  // 移除直接返回null，改为通过CSS控制显示隐藏以实现动画
  const isHidden = (!items || items.length === 0) && !isEditing;
  
  const draggedIdRef = useRef(null);
  const lastOverIdRef = useRef(null);
  const lastUpdateTsRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [confirmClosing, setConfirmClosing] = useState(false);
  const fileInputRef = useRef(null);
  const [modalData, setModalData] = useState({ name: '', url: '', iconUrl: '', size: '1x1', bgColor: '#ffffff', bgOpacity: 0.5, showIcon: true, labelText: '', labelSize: 25, labelColor: '#ffffff', labelOffsetY: 0 });
  const lastAddedIdRef = useRef(null);
  const [removingId, setRemovingId] = useState(null);
  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0, type: 'blank', id: null });
  const menuRef = React.useRef(null);
  const closeCtx = () => setCtxMenu(prev => ({ ...prev, show: false }));
  React.useEffect(() => {
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

  const handleAddClick = () => {
    setModalData({ name: '', url: '', iconUrl: '', size: '1x1', showIcon: true });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (e, app) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setModalData({ 
      name: app.name, 
      url: app.url, 
      iconUrl: app.iconUrl, 
      size: app.size || '1x1',
      bgColor: app.bgColor || '#ffffff',
      bgOpacity: (app.bgOpacity ?? 0.5),
      showIcon: app.showIcon !== false,
      labelText: app.labelText || '',
      labelSize: app.labelSize ?? 25,
      labelColor: app.labelColor || '#ffffff',
      labelOffsetY: app.labelOffsetY ?? 0
    });
    setEditingId(app.id);
    setShowModal(true);
  };

  const handleDeleteClick = (e, id) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setConfirmId(id);
  };

  const confirmDelete = () => {
    if (confirmId != null) {
      const id = confirmId;
      setConfirmId(null);
      setRemovingId(id);
      setTimeout(() => {
        setItems(prev => prev.filter(s => s.id !== id));
        setRemovingId(null);
      }, 220);
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
        setModalData({ ...modalData, iconUrl: reader.result });
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
    setModalData({ ...modalData, iconUrl: apiUrl });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const getRandomIcon = () => `/icons/zakozako/${Math.floor(Math.random() * 50) + 1}.png`;

    if (editingId) {
      setItems(prev => prev.map(s => s.id === editingId ? { ...s, ...modalData, id: editingId, iconUrl: modalData.iconUrl || s.iconUrl || getRandomIcon() } : s));
    } else {
      const newId = `d${Date.now()}`;
      lastAddedIdRef.current = newId;
      setItems(prev => [...prev, { ...modalData, id: newId, iconUrl: modalData.iconUrl || getRandomIcon() }]);
    }
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setShowModal(false);
    }, 220);
  };

  return (
    <>
    <div className={`dock-container glass ${isEditing ? 'editing' : ''} ${isHidden ? 'dock-hidden' : ''}`} onContextMenu={(e) => { e.preventDefault(); const x = Math.min(e.clientX, window.innerWidth - 220); const y = Math.min(e.clientY, window.innerHeight - 220); setCtxMenu({ show: true, x, y, type: 'blank', id: null }); }}>
      {items.map((app) => (
        <a 
          key={app.id} 
          href={isEditing ? undefined : app.url} 
          className={`dock-item ${isEditing ? 'animate-wiggle' : ''}`}
          style={{ 
            ...(isEditing ? { animationDelay: `${Math.random() * -0.5}s` } : {}), 
            '--icon-size': `${dockConfig?.iconSize || 56}px`, 
            '--hover-scale': `${dockConfig?.hoverScale || 1.08}`,
            width: `calc(var(--icon-size) * ${parseInt((app.size || '1x1').split('x')[1], 10) || 1})`,
            height: `var(--icon-size)`
          }}
          
          onClick={(e) => isEditing && e.preventDefault()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); const x = Math.min(e.clientX, window.innerWidth - 220); const y = Math.min(e.clientY, window.innerHeight - 220); setCtxMenu({ show: true, x, y, type: 'item', id: app.id }); }}
          draggable={isEditing}
          target={uiConfig?.openInNewTab ? '_blank' : '_self'}
          rel={uiConfig?.openInNewTab ? 'noopener noreferrer' : undefined}
          onDragStart={(e) => { 
            if (!isEditing) { e.preventDefault(); return; }
            draggedIdRef.current = app.id; 
            setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            const overId = app.id;
            if (!draggedIdRef.current || draggedIdRef.current === overId || lastOverIdRef.current === overId) return;
            const now = Date.now();
            if (now - lastUpdateTsRef.current < 50) return; // 节流：50ms
            lastUpdateTsRef.current = now;
            lastOverIdRef.current = overId;
            setItems(prev => {
              const draggedIndex = prev.findIndex(i => i.id === draggedIdRef.current);
              const overIndexFull = prev.findIndex(i => i.id === overId);
              if (draggedIndex === -1 || overIndexFull === -1 || draggedIndex === overIndexFull) return prev;
              const next = [...prev];
              const [dragged] = next.splice(draggedIndex, 1);
              next.splice(overIndexFull, 0, dragged);
              return next;
            });
          }}
          onDragEnd={() => { draggedIdRef.current = null; setIsDragging(false); }}
        >
          <div className="relative w-full h-full">
            {app.showIcon !== false ? (
              <img 
                src={app.iconUrl || '/icons/icon48.png'} 
                alt={app.name} 
                className={`dock-img ${lastAddedIdRef.current === app.id ? 'animate-scale-in' : ''} ${removingId === app.id ? 'animate-fade-out' : ''}`}
                style={{ background: toRgba(app.bgColor || dockConfig?.bgColor || '#ffffff', (app.bgOpacity ?? dockConfig?.bgOpacity ?? 0.95)) }}
                draggable={false}
                onError={(e) => { e.target.src = '/icons/icon48.png'; }}
              />
            ) : (
              <div 
                className={`dock-icon-fallback ${lastAddedIdRef.current === app.id ? 'animate-scale-in' : ''} ${removingId === app.id ? 'animate-fade-out' : ''}`}
                style={{ background: toRgba(app.bgColor || dockConfig?.bgColor || '#ffffff', (app.bgOpacity ?? dockConfig?.bgOpacity ?? 0.95)) }}
              />
            )}
            {app.labelText && (() => {
              const labelSize = app.labelSize || 14;
              const clamp = Math.max(1, Math.floor((dockConfig?.iconSize || 56) / (labelSize * 1.2)));
              return (
                <div 
                  className="dock-label"
                  style={{ fontSize: `${labelSize}px`, color: app.labelColor || '#ffffff', transform: `translateY(${app.labelOffsetY || 0}px)`, ['--label-clamp']: clamp }}
                >
                  {app.labelText}
                </div>
              );
            })()}
          </div>
          {!isEditing && !isDragging && (
            <div 
              className="dock-tooltip"
              style={{ 
                background: toRgba(dockConfig?.tipBgColor || 'rgb(140,140,140)', dockConfig?.tipOpacity ?? 0.55), 
                color: dockConfig?.tipTextColor || '#ffffff',
                '--tip-blur': `${dockConfig?.tipBlur ?? 8}px`
              }}
            >
              {app.name}
            </div>
          )}
          {isEditing && (
            <>
              <div className="absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-[1px] border border-white/20" />
              <div className="dock-hit-area delete" onClick={(e) => handleDeleteClick(e, app.id)} title="删除">
                <button className="dock-edit-btn delete"><X size={14} strokeWidth={2.5} /></button>
              </div>
              <div className="dock-hit-area edit" onClick={(e) => handleEditClick(e, app)} title="编辑">
                <button className="dock-edit-btn edit"><Edit2 size={12} strokeWidth={2.5} /></button>
              </div>
            </>
          )}
        </a>
      ))}
      {isEditing && (
        <div 
          className="dock-add-item" 
          style={{ '--icon-size': `${dockConfig?.iconSize || 56}px` }}
          onClick={handleAddClick} 
          onContextMenu={(e) => { e.preventDefault(); const x = Math.min(e.clientX, window.innerWidth - 220); const y = Math.min(e.clientY, window.innerHeight - 220); setCtxMenu({ show: true, x, y, type: 'blank', id: null }); }}
        >
          <Plus size={28} />
        </div>
      )}
    </div>

    {ctxMenu.show && (
      <div 
        className="dock-context-menu"
        style={{ left: ctxMenu.x, top: ctxMenu.y, background: toRgba(uiConfig.ctxMenuBgColor || '#2c2f36', (uiConfig.ctxMenuOpacity ?? 0.92)), color: uiConfig.ctxMenuTextColor || '#fff', backdropFilter: `blur(${uiConfig.ctxMenuBlur || 10}px)`, fontSize: `${uiConfig.ctxMenuFontSize || 15}px` }}
        ref={menuRef}
      >
        {ctxMenu.type === 'item' ? (
          <>
            <div className="dock-context-item" onClick={() => { const it = items.find(s => s.id === ctxMenu.id); if (it) window.open(it.url, '_blank'); closeCtx(); }}>在新标签页打开</div>
            <div className="dock-context-item" onClick={(e) => { const it = items.find(s => s.id === ctxMenu.id); if (it) handleEditClick(null, it); closeCtx(); }}>编辑</div>
            <div className="dock-context-item delete" onClick={(e) => { handleDeleteClick(null, ctxMenu.id); closeCtx(); }}>删除</div>
          </>
        ) : (
          <>
            <div className="dock-context-item" onClick={() => { handleAddClick(); closeCtx(); }}>新建 Dock 图标</div>
            {setIsEditing && (
              isEditing ? (
                <div className="dock-context-item" onClick={() => { setIsEditing(false); closeCtx(); }}>退出图标编辑模式</div>
              ) : (
                <div className="dock-context-item" onClick={() => { setIsEditing(true); closeCtx(); }}>进入图标编辑模式</div>
              )
            )}
          </>
        )}
      </div>
    )}
    {/* 弹窗（渲染在根节点以避免 transform 问题） */}
    {showModal && ReactDOM.createPortal(
      <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
        <div className={`edit-modal custom-scrollbar animate-scale-in ${closing ? 'closing' : ''}`}>
          <h3>{editingId ? '编辑 Dock 图标' : '添加 Dock 图标'}</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="setting-item">
              <label>名称</label>
              <input 
                value={modalData.name}
                onChange={e => setModalData({...modalData, name: e.target.value})}
                required type="text" placeholder="例如：哔哩哔哩" />
            </div>
            <div className="setting-item">
              <label>网址 (URL)</label>
              <input 
                value={modalData.url}
                onChange={e => setModalData({...modalData, url: e.target.value})}
                required type="text" placeholder="https://..." />
            </div>
            <div className="setting-item">
              <label>自定义图标(支持动图)</label>
              <div className="flex gap-4 items-center mt-2">
                 <div className="icon-preview-frame">
                    {modalData.iconUrl ? (
                      <img src={modalData.iconUrl} alt="Preview" className="icon-preview-img" />
                    ) : (
                      <img src="/icons/icon48.png" alt="默认图标" className="icon-preview-img opacity-70" />
                    )}
                 </div>
                 <div className="flex-1">
                    {modalData.showIcon ? (
                      <>
                        <button type="button" className="file-btn w-full" onClick={() => fileInputRef.current?.click()}>选择文件...若不选择将会使用随机表情包~</button>
                        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
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
            <div className="setting-row">
              <span className="setting-label-strong">图标背景颜色</span>
              <input 
                type="color"
                className="color-input"
                value={modalData.bgColor}
                onChange={e => setModalData({ ...modalData, bgColor: e.target.value })}
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span className="label-text">图标背景透明度</span>
                <div className="label-value"><input className="setting-value-input" type="number" min="0" max="1" step="0.01" value={modalData.bgOpacity} onChange={e => setModalData({ ...modalData, bgOpacity: Number(e.target.value) })} /><span className="unit-suffix">%</span></div>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={modalData.bgOpacity}
                onChange={e => setModalData({ ...modalData, bgOpacity: Number(e.target.value) })}
              />
            </div>
            <div className="setting-item">
              <label>叠加文字</label>
              <input 
                value={modalData.labelText}
                onChange={e => setModalData({ ...modalData, labelText: e.target.value })}
                type="text"
                placeholder="在图标上显示的文字"
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span className="label-text">文字大小</span>
                <div className="label-value"><input className="setting-value-input" type="number" min="10" max="40" step="1" value={modalData.labelSize} onChange={e => setModalData({ ...modalData, labelSize: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
              </div>
              <input type="range" min="10" max="40" step="1" value={modalData.labelSize} onChange={e => setModalData({ ...modalData, labelSize: Number(e.target.value) })} />
            </div>
            <div className="setting-row">
              <span className="setting-label-strong">文字颜色</span>
              <input type="color" className="color-input" value={modalData.labelColor} onChange={e => setModalData({ ...modalData, labelColor: e.target.value })} />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span className="label-text">文字上下偏移</span>
                <div className="label-value"><input className="setting-value-input" type="number" min="-40" max="40" step="1" value={modalData.labelOffsetY} onChange={e => setModalData({ ...modalData, labelOffsetY: Number(e.target.value) })} /><span className="unit-suffix">px</span></div>
              </div>
              <input type="range" min="-40" max="40" step="1" value={modalData.labelOffsetY} onChange={e => setModalData({ ...modalData, labelOffsetY: Number(e.target.value) })} />
            </div>
              <div>
                <label>板块尺寸</label>
                <div className="flex gap-2 mt-2">
                  {['1x1','1x2','1x3','1x4','1x5','1x6'].map(size => (
                    <button type="button" key={size} className={`size-btn ${modalData.size === size ? 'active' : ''}`} onClick={() => setModalData({ ...modalData, size })}>{size}</button>
                  ))}
                </div>
              </div>
            <div className="flex gap-4 mt-2">
              <button type="button" onClick={() => { setClosing(true); setTimeout(() => { setClosing(false); setShowModal(false); }, 220); }} className="action-btn cancel-btn flex-[3]">取消</button>
              <button type="submit" className="action-btn save-btn flex-1">保存</button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}
    {confirmId != null && ReactDOM.createPortal(
      <div className="fixed inset-0 top-layer bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" style={{ zIndex: 100001 }}>
        <div className={`edit-modal animate-scale-in ${confirmClosing ? 'closing' : ''}`}>
          <h3>你确定要删除这个 Dock 图标吗?</h3>
          <p className="opacity-80">“{(items.find(s => s.id === confirmId) || {}).name || '此项'}”将会永久消失！（真的很久！）</p>
          <h3></h3>
          <div className="flex gap-4 mt-6">
            <button className="action-btn cancel-btn flex-1" onClick={cancelDelete}>取消</button>
            <button className="action-btn save-btn flex-[1]" onClick={confirmDelete}>删除</button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

function toRgba(hex, opacity) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default React.memo(Dock);
