import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const ENGINES = {
  bing: { name: '必应', url: 'https://www.bing.com/search?q=' },
  google: { name: '谷歌', url: 'https://www.google.com/search?q=' },
  bilibili: { name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword=' },
  baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
  ai: { name: 'AI', url: 'https://metaso.cn/?s=3mitab&referrer_s=3mitab&q=' },

};

const SearchBar = ({ searchConfig, setSearchConfig, uiConfig }) => {
  const [engine, setEngine] = useState(searchConfig?.engine || 'bing');
  const [query, setQuery] = useState('');
  const engineKey = ENGINES[engine] ? engine : 'bing';
  const engineIcon = useMemo(() => {
    if (engineKey === 'bing') return '/assets/bing.png';
    if (engineKey === 'google') return '/assets/gulugulu.png';
    if (engineKey === 'bilibili') return '/assets/bilibili.jpg';
    if (engineKey === 'baidu') return '/assets/baidu.png';
    if (engineKey === 'ai') return '/icons/zakozako/14.png';
    return '/assets/bing.png';
  }, [engineKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = ENGINES[engineKey].url + encodeURIComponent(query);
    if (uiConfig?.openInNewTab) {
      window.open(url, '_blank', 'noopener');
    } else {
      window.location.href = url;
    }
  };

  return (
    <form onSubmit={handleSearch} className={`search-container glass animate-scale-in delay-100 ${searchConfig?.dark ? 'dark' : ''}`}>
      <img src={engineIcon} alt="engine" className="engine-icon" />
      <select 
        value={engineKey} 
        onChange={(e) => { const val = e.target.value; setEngine(val); setSearchConfig?.({ ...searchConfig, engine: val }); }}
        className="search-engine-select compact"
        title="切换搜索引擎"
      >
        <option value="bing">Bing</option>
        <option value="google">Google</option>
        <option value="bilibili">Bilibili</option>
        <option value="baidu">百度</option>
        <option value="ai">AI 搜索</option>
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`在 ${ENGINES[engineKey].name} 中搜索...`}
        className="search-input"
        autoFocus
      />
      <button type="submit" className="search-button" title="搜索">
        <Search size={20} />
      </button>
    </form>
  );
};

export default React.memo(SearchBar);
