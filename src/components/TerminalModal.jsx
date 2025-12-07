import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import './TerminalModal.css';
//只是放点我喜欢的歌啦...不要骂我呜呜
const MUSIC_LIST = [
  { title: '未完成ランデヴー - Lezel', url: 'https://music.163.com/song/media/outer/url?id=2604586574.mp3' },
  { title: 'M@GICAL☆CURE! LOVE ? SHOT! - SAWTOWNE/初音ミク', url: 'https://music.163.com/song/media/outer/url?id=2127806975.mp3' },
  { title: '泛泛人类不会祈祷 - warma', url: 'https://music.163.com/song/media/outer/url?id=2089729261.mp3' },
  { title: 'Fly to the moon - PSYQUI/中村さんそ', url: 'https://music.163.com/song/media/outer/url?id=1400184857.mp3' },
  { title: 'カトラリー - 神山羊/初音ミク', url: 'https://music.163.com/song/media/outer/url?id=1899686964.mp3' },
  { title: 'ぐるぐる - OLDUCT/初音未來/歌愛雪', url: 'https://music.163.com/song/media/outer/url?id=2743181172.mp3' },
  { title: '痛いの痛いの飛んでいけっ - MIMI/saewool', url: 'https://music.163.com/song/media/outer/url?id=3315230476.mp3' },
  { title: 'ちゅきちゅきポコポコポン - TAK/初音ミク', url: 'https://music.163.com/song/media/outer/url?id=2733083749.mp3' },
  { title: 'ちきゅう大爆発 - P丸様。', url: 'https://music.163.com/song/media/outer/url?id=1902224491.mp3' },
  { title: 'ドゥーマー - 東京真中', url: 'https://music.163.com/song/media/outer/url?id=2737471087.mp3' },
  { title: 'チェリーポップ - DECO*27/初音ミク', url: 'https://music.163.com/song/media/outer/url?id=2719630556.mp3' },
  { title: '愛言葉IV - DECO*27/初音ミク', url: 'https://music.163.com/song/media/outer/url?id=1951952113.mp3' },
  { title: 'aimai[2025ver] - 瀬名航/鎖那', url: 'https://music.163.com/song/media/outer/url?id=2692340939.mp3' },
  { title: 'きゅびびびびずむ - 超てんちゃん/NEEDY GIRL OVERDOSE/原口沙輔', url: 'https://music.163.com/song/media/outer/url?id=2605552169.mp3' },
  { title: 'リードコントロール - なるみや', url: 'https://music.163.com/song/media/outer/url?id=2628590766.mp3' },
  { title: 'タイムパラドックス - 森羅万象', url: 'https://music.163.com/song/media/outer/url?id=2685882285.mp3' },
  { title: '屑屑 - ChiliChill乐团', url: 'https://music.163.com/song/media/outer/url?id=2615403834.mp3' },
  { title: 'ひとりぼっち産業革命 - シャノン/裏命', url: 'https://music.163.com/song/media/outer/url?id=2018936468.mp3' },
  { title: '死別 - シャノン/GUMI', url: 'https://music.163.com/song/media/outer/url?id=2134872913.mp3' },
  { title: 'C&C - 森羅万象', url: 'https://music.163.com/song/media/outer/url?id=2705024291.mp3' }
];

const TerminalModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  
  const [loginStep, setLoginStep] = useState('username'); // 'username'（用户名） | 'password'（密码） | 'loggedIn'（已登录）
  const [username, setUsername] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [crashMode, setCrashMode] = useState(false);
  const [sudoPending, setSudoPending] = useState(null);
  
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const audioRef = useRef(new Audio());
  const abortRef = useRef(false);
  const terminalRef = useRef(null);
  const remainingSongsRef = useRef([]);
  const playedHistoryRef = useRef([]);
  const currentSongRef = useRef(null);
  const isMusicModeRef = useRef(false);
  
  // 动画状态
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    // 配置音频
    audioRef.current.volume = 0.4;
    audioRef.current.onended = () => {
       setHistory(prev => [...prev, { type: 'output', content: '音乐播放结束惹。 🎵' }]);
    };
    return () => {
      audioRef.current.pause();
    };
  }, []);

  // Ctrl+C 全局按键处理
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!isOpen) return;
      
      const key = e.key.toLowerCase();
      
      // Ctrl+C
      if (e.ctrlKey && key === 'c') {
        e.preventDefault();
        if (isRunning) {
          abortRef.current = true;
          setIsRunning(false);
          const wasPlaying = !audioRef.current.paused;
          audioRef.current.pause();
          // 确保输出 ^C
          addToHistory('output', '^C');
          if (wasPlaying && isMusicModeRef.current) {
             addToHistory('output', '用户停止了音乐呢。');
          }
        } else {
           // 如果空闲，只需在输入后追加 ^C
           setInput(prev => {
             addToHistory('input', prev + '^C', `${username}@dokidoki:~$ `);
             return '';
           });
        }
        return;
      }

      // 音乐控制快捷键 (仅在音乐模式下生效)
      if (isMusicModeRef.current && isRunning) {
         if (e.ctrlKey && key === 's') {
            e.preventDefault();
            if (audioRef.current.paused) {
               audioRef.current.play();
               addToHistory('output', '继续播放 🎵');
            } else {
               audioRef.current.pause();
               addToHistory('output', '已暂停 ⏸️');
            }
         }
         else if (e.ctrlKey && key === 'd') {
            e.preventDefault();
            addToHistory('output', '切换下一首 ⏭️');
            audioRef.current.currentTime = audioRef.current.duration || 1e9;
         }
         else if (e.ctrlKey && key === 'a') {
            e.preventDefault();
            const history = playedHistoryRef.current;
            // 如果历史记录只有当前这首（或者空），则重播当前
            if (history.length <= 1) {
               addToHistory('output', '已经是第一首啦 (重新开始) ⏮️');
               audioRef.current.currentTime = 0;
            } else {
               addToHistory('output', '切换上一首 ⏮️');
               // 历史记录栈顶是当前播放的歌
               const current = history.pop();
               const prev = history.pop();
               
               // 放回待播放列表（栈结构，后进先出）
               // 我们希望下一个 pop 出来的是 prev
               remainingSongsRef.current.push(current);
               remainingSongsRef.current.push(prev);
               
               // 跳过当前，触发循环进入下一轮（即 prev）
               audioRef.current.currentTime = audioRef.current.duration || 1e9;
            }
         }
         else if (e.ctrlKey && key === 'q') {
            e.preventDefault();
            const newVol = Math.min(1, audioRef.current.volume + 0.1);
            audioRef.current.volume = newVol;
            addToHistory('output', `音量: ${Math.round(newVol * 100)}% 🔊`);
         }
         else if (e.ctrlKey && key === 'e') {
            e.preventDefault();
            const newVol = Math.max(0, audioRef.current.volume - 0.1);
            audioRef.current.volume = newVol;
            addToHistory('output', `音量: ${Math.round(newVol * 100)}% 🔉`);
         }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleGlobalKeyDown);
      // 打开时聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, isRunning, username]); // 闭包变量所需的依赖项

  // 仅初始化一次
  useEffect(() => {
      setHistory([
        { type: 'output', content: 'DokiDoki OS v1.0.0 (tty1)' },
        { type: 'output', content: '' },
      ]);
      setLoginStep('username');
      setUsername('');
      setIsRunning(false);
      abortRef.current = false;
  }, []); // 仅在挂载时运行

  useEffect(() => {
    if (!isOpen) {
      // 保持音乐在后台播放
      // audioRef.current.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, crashMode]);

  const addToHistory = (type, content, prompt = null) => {
     setHistory(prev => [...prev, { type, content, prompt }]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkAborted = () => {
    if (abortRef.current) {
      throw new Error('ABORTED');
    }
  };

  const playMusicAndWait = (song) => {
    return new Promise((resolve, reject) => {
      audioRef.current.src = song.url;
      
      const cleanup = () => {
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
      };

      audioRef.current.onended = () => {
        cleanup();
        resolve();
      };

      audioRef.current.onpause = () => {
        if (abortRef.current) {
          cleanup();
          reject(new Error('ABORTED'));
        }
      };

      audioRef.current.play().catch(err => {
        cleanup();
        reject(err);
      });
    });
  };

  const triggerCrashEgg = async () => {
    setIsRunning(true);
    abortRef.current = false;

    try {
      // 尝试尽早进入全屏
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen failed:', err);
      }

      addToHistory('output', 'rm: 无法删除 \'/boot/efi\': 设备或资源忙');
      await sleep(500); checkAborted();
      addToHistory('output', 'rm: 正在删除目录 \'/\'');
      await sleep(800); checkAborted();
      addToHistory('output', 'rm: 正在删除目录 \'/bin\'');
      await sleep(200);
      addToHistory('output', 'rm: 正在删除目录 \'/usr\'');
      await sleep(200);
      addToHistory('output', 'rm: 正在删除目录 \'/home\'');
      await sleep(200);
      addToHistory('output', 'rm: 正在删除目录 \'/var\'');
      await sleep(1000);
      addToHistory('output', '操作成功完成。');
      await sleep(2000);
      
      // 触发完全崩溃模式
      setCrashMode(true);
    } catch (err) {
       if (err.message !== 'ABORTED') {
         console.error(err);
         addToHistory('error', '错误: ' + err.message);
       }
       setIsRunning(false);
    }
  };

  const executeCommand = async (cmd, args) => {
     setIsRunning(true);
     abortRef.current = false;

     try {
       switch (cmd) {
        case 'clear':
          setHistory([]);
          break;
        case 'exit':
          // 退出时重置状态
          setHistory([
             { type: 'output', content: 'DokiDoki OS v1.0.0 (tty1)' },
             { type: 'output', content: '' },
          ]);
          setLoginStep('username');
          setUsername('');
          onClose();
          break;
        case 'date':
          addToHistory('output', new Date().toString());
          break;
        case 'history':
          cmdHistory.forEach((c, i) => addToHistory('output', `${i + 1}  ${c}`));
          break;
        case 'who':
          addToHistory('output', `${username}  tty1         ${new Date().toISOString().slice(0,10)} (:0)`);
          break;
        case 'music':
          if (args === 'stop') {
            audioRef.current.pause();
            addToHistory('output', '音乐已停止。 🔇');
          } else {
            addToHistory('output', '开始随机播放列表... (按 Ctrl+C 停止)');
            addToHistory('output', '快捷键: Ctrl+A 上一首 | Ctrl+D 下一首 | Ctrl+S 暂停/继续');
            addToHistory('output', '音量: Ctrl+Q 增加 | Ctrl+E 减少');
            
            isMusicModeRef.current = true;
            // 清空历史记录（新会话）
            playedHistoryRef.current = [];
            
            try {
               while (true) {
                 checkAborted();

                 if (remainingSongsRef.current.length === 0) {
                    // 重置并洗牌播放列表
                    let newQueue = [...MUSIC_LIST];
                    for (let i = newQueue.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
                    }
                    remainingSongsRef.current = newQueue;
                 }
                 
                 const song = remainingSongsRef.current.pop();
                 currentSongRef.current = song;
                 playedHistoryRef.current.push(song);
                 
                 addToHistory('output', `正在播放：${song.title} 🎵`);
                 
                 await playMusicAndWait(song);
                 await sleep(1000);
               }
            } catch (e) {
               isMusicModeRef.current = false;
               if (e.message === 'ABORTED') {
                 // 在全局按键按下时处理
                 throw e;
               }
               addToHistory('error', '无法播放音乐，可能你没连上网络呢？：' + e.message);
            }
            isMusicModeRef.current = false;
          }
          break;
        case 'ping':
           const host = args || 'google.com';
           addToHistory('output', `PING ${host} (127.0.0.1) 56(84) bytes of data.`);
           for (let i = 0; i < 4; i++) {
             await sleep(1000); checkAborted();
             addToHistory('output', `64 bytes from ${host} (127.0.0.1): icmp_seq=${i+1} ttl=64 time=${(Math.random()*10+10).toFixed(1)} ms`);
           }
           addToHistory('output', `--- ${host} ping statistics ---`);
           addToHistory('output', `4 packets transmitted, 4 received, 0% packet loss, time 3000ms`);
           break;
        case 'mkdir':
           addToHistory('output', `mkdir: 无法创建目录 '${args || ''}': 权限不足 (Permission denied)`);
           break;
        case 'touch':
           addToHistory('output', `touch: 无法创建文件 '${args || ''}': 权限不足 (Permission denied)`);
           break;
        case 'rm':
        case 'cp':
        case 'mv':
           addToHistory('output', `${cmd}: 无法${cmd === 'rm' ? '删除' : cmd === 'cp' ? '复制' : '移动'} '${args || ''}': 权限不足 (Permission denied)`);
           break;
        case 'vi':
        case 'vim':
           addToHistory('output', 'Starting VIM - Vi IMproved 8.2 (2019 Dec 12, compiled Jan 01 2023 00:00:00)');
           await sleep(1000); checkAborted();
           addToHistory('output', '\n[ERROR] 无法打开显示。使用伪接口。');
           addToHistory('output', '按 Ctrl+C 中止');
           // 模拟阻塞循环
           while(true) {
             await sleep(1000); checkAborted();
           }
           break;
        case 'shutdown':
        case 'reboot':
          const action = cmd === 'reboot' ? 'Rebooting' : 'Shutting down';
          addToHistory('output', `${action} system...`);
          await sleep(1000); checkAborted();
          addToHistory('output', 'Stopping system services...');
          await sleep(800); checkAborted();
          addToHistory('output', '[OK] Stopped DokiDoki Service.');
          await sleep(800); checkAborted();
          addToHistory('output', '[OK] Unmounted /dev/sda1.');
          await sleep(800); checkAborted();
          if (cmd === 'reboot') {
             addToHistory('output', 'Restarting...');
             await sleep(1000); checkAborted();
             setHistory([]);
             addToHistory('output', 'DokiDoki OS v1.0.0');
             addToHistory('output', 'Login: ' + username);
          } else {
             addToHistory('output', 'System halted.');
             await sleep(1000); checkAborted();
             onClose();
          }
          break;
        case 'apt':
          if (!args) {
            addToHistory('output', 'apt 1.0.0 (amd64)');
            addToHistory('output', '用法：apt install <package>');
          } else if (args.startsWith('install ')) {
             const pkg = args.replace('install ', '').trim();
             addToHistory('output', `正在读取软件包列表... 完成`);
             await sleep(500); checkAborted();
             addToHistory('output', `正在构建依赖树... 完成`);
             await sleep(500); checkAborted();
             addToHistory('output', `下列【新】软件包将被安装：${pkg}`);
             await sleep(800); checkAborted();
             addToHistory('output', `获取：1 https://archive.nekoqiye.com/${pkg} [1337 kB]`);
             await sleep(800); checkAborted();
             addToHistory('output', `已下载 1337 kB，耗时 1秒 (1337 kB/s)`);
             addToHistory('output', `正在选中未选择的软件包 ${pkg}。`);
             await sleep(800); checkAborted();
             addToHistory('output', `(正在读取数据库 ... 系统当前共安装了 25000 个文件和目录。)`);
             await sleep(800); checkAborted();
             addToHistory('output', `正在准备解压 .../${pkg} ...`);
             await sleep(400); checkAborted();
             addToHistory('output', `正在解压 ${pkg} ...`);
             await sleep(400); checkAborted();
             addToHistory('output', `正在设置 ${pkg} ...`);
             await sleep(400); checkAborted();
             addToHistory('output', `正在处理 man-db 的触发器 ...`);
             addToHistory('output', `完成。`);
          } else {
             addToHistory('output', `ERROR: 无效操作 ${args}`);
          }
          break;
        case 'docker':
          addToHistory('output', 'Docker version 20.10.7, build f0df350');
          addToHistory('output', 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?');
          break;
        case 'ifconfig':
          addToHistory('output', 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
          addToHistory('output', '        inet 192.168.71.2  netmask 255.255.255.0  broadcast 192.168.71.255');
          addToHistory('output', '        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>');
          addToHistory('output', '        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)');
          addToHistory('output', '        RX packets 1337  bytes 123456 (120.5 KiB)');
          addToHistory('output', '        TX packets 420   bytes 65432 (63.8 KiB)');
          addToHistory('output', '');
          addToHistory('output', 'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536');
          addToHistory('output', '        inet 127.0.0.1  netmask 255.0.0.0');
          addToHistory('output', '        inet6 ::1  prefixlen 128  scopeid 0x10<host>');
          addToHistory('output', '        loop  txqueuelen 1000  (Local Loopback)');
          addToHistory('output', '        RX packets 0  bytes 0 (0.0 B)');
          addToHistory('output', '        TX packets 0  bytes 0 (0.0 B)');
          break;
        case 'ssh':
          if (!args) {
            addToHistory('output', '用法: ssh <目标地址>');
          } else {
            addToHistory('output', `ssh: 连接到主机 ${args} 端口 22: 连接被拒绝`);
          }
          break;
        case 'df':
          addToHistory('output', '文件系统       1K-块        已用     可用     已用% 挂载点');
          addToHistory('output', 'udev             4000000       0   4000000   0% /dev');
          addToHistory('output', 'tmpfs             800000    1200    798800   1% /run');
          addToHistory('output', '/dev/sda1       50000000 4500000  42900000  10% /');
          addToHistory('output', 'tmpfs            4000000       0   4000000   0% /dev/shm');
          break;
        case 'free':
          addToHistory('output', '              总计        已用        空闲      共享    缓存/缓冲   可用');
          addToHistory('output', '内存:       8192000     4096000     1024000      128000     3072000     4096000');
          addToHistory('output', '交换:       2048000           0     2048000');
          break;
        case 'ps':
          addToHistory('output', '  PID TTY          TIME CMD');
          addToHistory('output', ` 1337 tty1     00:00:00 bash`);
          addToHistory('output', ` 4200 tty1     00:00:00 ps`);
          break;
        case 'netstat':
          addToHistory('output', '活跃的互联网连接 (不含服务器)');
          addToHistory('output', '协议 收取-Q 发送-Q 本地地址                外部地址                状态');
          addToHistory('output', 'tcp        0      0 dokidoki:54321           1.1.1.1:https           ESTABLISHED');
          addToHistory('output', 'tcp        0      0 dokidoki:ssh             192.168.1.100:54322     ESTABLISHED');
          break;
        case 'grep':
          if (!args) {
             addToHistory('output', '用法: grep [OPTION]... PATTERNS [FILE]...');
          } else {
             addToHistory('output', 'grep: (标准输入): 二进制文件匹配');
          }
          break;
        case 'tail':
          if (!args) {
             addToHistory('output', '... (等待输入，按 Ctrl+C 中止)');
             while(true) { await sleep(1000); checkAborted(); }
          } else {
             addToHistory('output', `tail: 无法打开 '${args}': 权限不足 (Permission denied)`);
          }
          break;
        case 'head':
          if (!args) {
             addToHistory('output', '... (等待输入，按 Ctrl+C 中止)');
             while(true) { await sleep(1000); checkAborted(); }
          } else {
             addToHistory('output', `head: 无法打开 '${args}': 权限不足 (Permission denied)`);
          }
          break;
        case 'help':
          addToHistory('output', `Available commands (可用指令):
  help      - 显示帮助信息 (Show this help)
  clear     - 清屏 (Clear terminal)
  date      - 显示时间 (Show date)
  exit      - 关闭终端 (Exit terminal)
  ls        - 列出文件 (List files)
  cat       - 查看文件 (Read file)
  whoami    - 我是谁 (Who am I)
  pwd       - 当前目录 (Current directory)
  echo      - 输出文本 (Echo text)
  top       - 进程监控 (Process monitor)
  mkdir     - 创建目录 (Make directory)
  touch     - 创建文件 (Touch file)
  vi/vim    - Vim文本编辑器 (Text editor)
  docker    - 容器 (Docker)
  ifconfig  - 网络配置 (Network config)
  ssh       - 远程连接 (SSH client)
  df        - 磁盘空间 (Disk usage)
  free      - 内存使用 (Memory usage)
  ps        - 进程状态 (Process status)
  netstat   - 网络状态 (Network stats)
  grep      - 文本搜索 (Global regex print)
  tail      - 尾部查看 (Output tail)
  head      - 头部查看 (Output head)
  uname     - 系统信息 (System info)
  neofetch  - 系统信息-第三方 (System info)
  sudo      - 管理员权限 (Admin access)
  fortune   - 今日运势 (Daily fortune)
  coin      - 抛硬币 (Flip a coin)
  music     - 播放音乐 (Play music)
  ping      - 网络测试 (Ping host)
  nya       - 喵喵喵 (Meow meow meow)
  apt       - 包管理器 (Package manager)
  about     - 关于作者 (About author)
  zako      - Zako (Zako mode)
  reboot    - 重启系统 (Reboot system)
  shutdown  - 关机 (Shutdown)`);
          break;
        case 'zako':
          addToHistory('output', '杂鱼杂鱼~ ❤️\nzako~zako~');
          break;
        case 'about':
          addToHistory('output', '作者：祈烨猫猫 (NekoQiye) 🐱\n喵喵~咕噜咕噜~\n输入sudo rm -rf /*有彩蛋哦~');
          break;
        case 'whoami':
          addToHistory('output', username);
          break;
        case 'ls':
          addToHistory('output', 'Documents  Downloads  Music  Pictures  Videos  secrets.txt  dokidoki_config.json');
          break;
        case 'pwd':
          addToHistory('output', `/home/${username}`);
          break;
        case 'echo':
          addToHistory('output', args);
          break;
        case 'uname':
          if (args === '-a') {
            addToHistory('output', 'Linux dokidoki 1.0.0-zako #1 SMP PREEMPT Thu Jan 01 00:00:00 UTC 1970 x86_64 GNU/Linux');
          } else {
            addToHistory('output', 'Linux');
          }
          break;
        case 'top':
          addToHistory('output', 'top - 12:00:00 up 1 day,  0:00,  1 user,  load average: 0.00, 0.01, 0.05');
          addToHistory('output', 'Tasks:  1 total,   1 running,   0 sleeping,   0 stopped,   0 zombie');
          addToHistory('output', '%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st');
          addToHistory('output', 'MiB Mem :   8192.0 total,   1024.0 free,   4096.0 used,   3072.0 buff/cache');
          addToHistory('output', 'MiB Swap:      0.0 total,      0.0 free,      0.0 used.   4096.0 avail Mem');
          addToHistory('output', '');
          addToHistory('output', '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND');
          addToHistory('output', ` 1337 ${username.padEnd(8)}  20   0  1000M   500M   100M R   0.1   6.1   0:00.01 dokidoki-shell`);
          break;
        case 'cat':
          if (args.includes('secrets.txt')) addToHistory('output', '诶诶？不给看！');
          else if (args.includes('dokidoki_config.json')) addToHistory('output', '{ "theme": "kawaii", "mode": "zako" }');
          else addToHistory('output', 'cat: ' + (args || 'filename') + ': 没有那个文件或目录 (No such file or directory)');
          break;
        case 'sudo':
          if (args.trim() === 'rm -rf /' || args.trim() === 'rm -rf /*') {
            setSudoPending(true);
            addToHistory('output', `[sudo] ${username} 的密码：`);
            return;
          }
          
          addToHistory('output', `[sudo] ${username} 的密码：`);
          await sleep(2000); checkAborted();
          addToHistory('output', '错误：杂鱼杂鱼~');
          break;
        case 'fortune':
          addToHistory('output', '今日运势：大吉！\n宜：睡大觉\n忌：学习');
          break;
        case 'coin':
          addToHistory('output', Math.random() > 0.5 ? '🪙 正面 (Heads)' : '🪙 反面 (Tails)');
          break;
        case 'nya':
          const count = Math.floor(Math.random() * 50) + 1;
          addToHistory('output', Array(count).fill('Nya~').join(' '));
          break;
        case 'neofetch':
          addToHistory('output', `
ooo.          8       o ooooo        8      o    o               
8   8.        8           8          8      8b   8               
8    8 .oPYo. 8  .o  o8   8   .oPYo. 8oPYo. 8 b  8 o    o .oPYo. 
8    8 8    8 8oP'    8   8   .oooo8 8    8 8  b 8 8    8 .oooo8 
8   .P 8    8 8  b.   8   8   8    8 8    8 8   b8 8    8 8    8 
8ooo'   YooP' 8   o.  8   8    YooP8  YooP' 8    8  YooP8  YooP8 
.....:::.....:..::...:..::..:::.....::.....:..:::..:....8 :.....:
:::::::::::::::::::::::::::::::::::::::::::::::::::::ooP'.:::::::
OS: DokiDoki OS
Kernel: 1.0.1
Uptime: Forever
Shell: ZakoShell
Resolution: 1920x1080
Zako zako~
  `);
          break;
        default:
          addToHistory('error', `未找到命令: ${cmd}`);
      }
     } catch (err) {
       if (err.message === 'ABORTED') {
         // 在全局按键按下时处理
       } else {
         console.error(err);
         addToHistory('error', '错误: ' + err.message);
       }
     } finally {
       setIsRunning(false);
       // 如果中止，历史记录添加在 keydown 中处理
     }
  };

  const handleCommand = (cmdString) => {
    const trimmedCmd = cmdString.trim();
    
    if (loginStep === 'username') {
      if (trimmedCmd) {
        addToHistory('input', trimmedCmd, 'login: ');
        setUsername(trimmedCmd);
        setLoginStep('password');
      }
      return;
    }
    
    if (loginStep === 'password') {
      setLoginStep('loggedIn');
      addToHistory('input', '', 'Password: '); // 在历史记录中添加空白密码行
      addToHistory('output', '\n登录成功。');
      addToHistory('output', '欢迎使用 DokiDokiSukiSuki 终端 v1.7.0');
      addToHistory('output', '输入 "help" 查看命令列表。');
      return;
    }

    if (sudoPending) {
      // 这里的输入被视为密码
      setSudoPending(false);
      // sudo 通常不显示任何内容，直接执行
      // 触发彩蛋
      triggerCrashEgg();
      return;
    }

    if (!trimmedCmd) return;

    const parts = trimmedCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    const currentPrompt = `${username}@dokidoki:~$ `;
    addToHistory('input', cmdString, currentPrompt);
    setCmdHistory(prev => [...prev, cmdString]);
    setHistoryPointer(-1);

    executeCommand(cmd, args);
  };

  const handleKeyDown = (e) => {
    
    if (isRunning) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      
      let newPointer = historyPointer;
      if (newPointer === -1) {
        newPointer = cmdHistory.length - 1;
      } else if (newPointer > 0) {
        newPointer--;
      }
      
      setHistoryPointer(newPointer);
      setInput(cmdHistory[newPointer]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      
      let newPointer = historyPointer;
      if (newPointer < cmdHistory.length - 1) {
        newPointer++;
        setHistoryPointer(newPointer);
        setInput(cmdHistory[newPointer]);
      } else {
        newPointer = -1;
        setHistoryPointer(newPointer);
        setInput('');
      }
    }
  };
  
  // 确定提示文本
  let promptText = '';
  if (sudoPending) {
    promptText = '';
  } else if (loginStep === 'loggedIn') {
    promptText = `${username}@dokidoki:~$ `;
  } else if (loginStep === 'username') {
    promptText = 'login: ';
  } else if (loginStep === 'password') {
    promptText = ''; // 密码提示已在历史记录中打印
  }

  if (crashMode) {
    return (
      <div style={{
        display: shouldRender ? 'flex' : 'none',
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#000', zIndex: 999999, cursor: 'none',
        alignItems: 'flex-start', justifyContent: 'flex-start',
        padding: '20px', color: '#fff', fontFamily: 'monospace', fontSize: '20px'
      }}>
        <div className="blinking-cursor"></div>
      </div>
    );
  }

  return (
    <div className={`terminal-overlay ${isClosing ? 'closing' : ''}`} onClick={onClose} style={{ display: shouldRender ? 'flex' : 'none' }}>
      <div className={`terminal-window glass-panel ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="terminal-title">
            <TerminalIcon size={16} className="mr-2" />
            <span>⠀DokiDokiSukiSuki Server</span>
          </div>
          <button className="terminal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="terminal-content custom-scrollbar" onClick={() => inputRef.current?.focus()}>
          {history.map((item, index) => (
            <div key={index} className={`terminal-line ${item.type}`}>
              {item.type === 'input' && (
                <span 
                  className="prompt"
                  style={{ color: (item.prompt && (item.prompt.includes('login:') || item.prompt.includes('Password:'))) ? '#e0e0e0' : undefined }}
                >
                  {item.prompt || 'root@dokidoki:~$ '}
                </span>
              )}
              <pre>{item.content}</pre>
            </div>
          ))}
          <div className="terminal-input-line" style={{ display: isRunning ? 'none' : 'flex' }}>
             {loginStep === 'loggedIn' && <span className="prompt">{promptText}</span>}
             {loginStep === 'username' && <span className="prompt" style={{ color: '#e0e0e0' }}>login: </span>}
             {loginStep === 'password' && <span className="prompt" style={{ color: '#e0e0e0' }}>Password: </span>}
            <input
              ref={inputRef}
              type={(loginStep === 'password' || sudoPending) ? 'password' : 'text'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoComplete="off"
              spellCheck="false"
              readOnly={isRunning}
              style={(loginStep === 'password' || sudoPending) ? { color: 'transparent', caretColor: 'transparent' } : {}}
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default TerminalModal;
