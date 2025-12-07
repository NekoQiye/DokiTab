
import React, { useState, useEffect } from 'react';
import './WelcomeModal.css';

const WelcomeModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('doki_visited');
    if (!visited) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('doki_visited', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal-content">
        <div className="welcome-neko-container">
          <img src="/assets/neko.png" alt="neko" className="welcome-neko" />
        </div>
        <div className="welcome-text-container">
          <h2 className="welcome-title">欢迎使用呐！</h2>
          <p className="welcome-message">
            欸嘿嘿，既然选择了 DokiTab，那我们就开始吧~ <br/>
            点击右上角按钮可打开设置面板;<br/>
            鼠标右键即可进入图标编辑模式哦~
          </p>
          <button className="welcome-close-btn" onClick={handleClose}>
            知道啦~
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
