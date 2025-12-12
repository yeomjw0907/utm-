import React, { useState, useEffect, useCallback } from 'react';
import { UtmParams, UtmHistoryItem } from '../types';
import { CopyIcon, CheckIcon, LinkIcon, RefreshIcon, TrashIcon, ScissorsIcon, XIcon, HistoryIcon } from './Icons';

const commonSources = [
  { value: 'google', label: 'Google (구글)' },
  { value: 'naver', label: 'Naver (네이버)' },
  { value: 'kakao', label: 'Kakao (카카오)' },
  { value: 'facebook', label: 'Facebook (페이스북)' },
  { value: 'instagram', label: 'Instagram (인스타그램)' },
  { value: 'meta', label: 'Meta Ads (메타 광고)' },
  { value: 'youtube', label: 'YouTube (유튜브)' },
  { value: 'tiktok', label: 'TikTok (틱톡)' },
  { value: '{{site_source_name}}', label: 'Meta Dynamic ({{site_source_name}})' },
  { value: 'newsletter', label: 'Newsletter (뉴스레터)' },
  { value: 'blog', label: 'Blog (블로그)' },
];

const commonMediums = [
  { value: 'paid_social', label: 'Paid Social (유료 소셜)' },
  { value: 'cpc', label: 'CPC (클릭당 비용)' },
  { value: 'cpm', label: 'CPM (노출당 비용)' },
  { value: 'organic', label: 'Organic (오가닉/자연유입)' },
  { value: 'social', label: 'Social (소셜 미디어)' },
  { value: 'email', label: 'Email (이메일)' },
  { value: 'referral', label: 'Referral (추천/링크)' },
  { value: 'display', label: 'Display (배너/디스플레이)' },
  { value: '{{placement}}', label: 'Meta Placement ({{placement}})' },
  { value: 'push', label: 'Push (푸시 알림)' },
  { value: 'sms', label: 'SMS (문자)' },
  { value: 'short_form', label: 'Short Form (쇼츠/릴스)' },
];

const InputGroup = ({ label, required, children, subLabel }: { label: string, required?: boolean, children?: React.ReactNode, subLabel?: string }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-slate-300 mb-1.5 transition-colors group-focus-within:text-primary">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {subLabel && <p className="text-xs text-slate-500 mt-1.5">{subLabel}</p>}
  </div>
);

const UtmBuilder: React.FC = () => {
  const [params, setParams] = useState<UtmParams>({
    baseUrl: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Custom Input State
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [isCustomMedium, setIsCustomMedium] = useState(false);

  // Shortener State
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [isShortenedCopied, setIsShortenedCopied] = useState(false);

  // History State
  const [history, setHistory] = useState<UtmHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('utm_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const buildUrl = useCallback(() => {
    if (!params.baseUrl) {
      setGeneratedUrl('');
      setShortenedUrl(''); 
      return;
    }

    let url = params.baseUrl;
    try {
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;

      if (params.source) searchParams.set('utm_source', params.source);
      if (params.medium) searchParams.set('utm_medium', params.medium);
      if (params.campaign) searchParams.set('utm_campaign', params.campaign);
      if (params.term) searchParams.set('utm_term', params.term);
      if (params.content) searchParams.set('utm_content', params.content);

      const newUrl = urlObj.toString();
      if (newUrl !== generatedUrl) {
         setGeneratedUrl(newUrl);
         setShortenedUrl('');
      }
    } catch (e) {
      setGeneratedUrl('');
      setShortenedUrl('');
    }
  }, [params, generatedUrl]);

  useEffect(() => {
    buildUrl();
  }, [buildUrl]);

  const addToHistory = (currentUrl: string, currentShortUrl: string = '') => {
    if (history.length > 0 && history[0].url === currentUrl) return;

    const newItem: UtmHistoryItem = {
      id: Date.now().toString(),
      url: currentUrl,
      shortUrl: currentShortUrl,
      params: { ...params },
      createdAt: Date.now()
    };
    
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('utm_history', JSON.stringify(newHistory));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'source' && value === 'custom_input_option') {
      setIsCustomSource(true);
      setParams(prev => ({ ...prev, source: '' }));
      return;
    }
    if (name === 'medium' && value === 'custom_input_option') {
      setIsCustomMedium(true);
      setParams(prev => ({ ...prev, medium: '' }));
      return;
    }

    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = async (text: string, isShort: boolean = false) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isShort) {
        setIsShortenedCopied(true);
        setTimeout(() => setIsShortenedCopied(false), 2000);
      } else {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
      addToHistory(generatedUrl, isShort ? text : '');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('utm_history', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    if(window.confirm("히스토리를 모두 삭제하시겠습니까?")) {
      setHistory([]);
      localStorage.removeItem('utm_history');
    }
  };

  const handleRestoreFromHistory = (item: UtmHistoryItem) => {
    setParams(item.params);
    const isSourceCommon = commonSources.some(s => s.value === item.params.source);
    setIsCustomSource(!isSourceCommon && !!item.params.source);
    
    const isMediumCommon = commonMediums.some(m => m.value === item.params.medium);
    setIsCustomMedium(!isMediumCommon && !!item.params.medium);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShortenUrl = async () => {
    if (!generatedUrl) return;
    setIsShortening(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(generatedUrl)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        setShortenedUrl(shortUrl);
        addToHistory(generatedUrl, shortUrl);
      } else {
        alert("URL 단축에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("Shortener error:", error);
      alert("단축 서비스 연결에 실패했습니다.");
    } finally {
      setIsShortening(false);
    }
  };

  const clearForm = () => {
    setParams({
      baseUrl: '',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: ''
    });
    setIsCustomSource(false);
    setIsCustomMedium(false);
    setShortenedUrl('');
  };

  // Styles
  const inputClass = "w-full bg-slate-900/50 border border-slate-700/60 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:border-slate-600 hover:bg-slate-900";
  const selectClass = "w-full bg-slate-900/50 border border-slate-700/60 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:border-slate-600 hover:bg-slate-900 appearance-none";

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20 animate-slide-up">
      {/* Builder Card */}
      <div className="bg-surface/40 backdrop-blur-md rounded-3xl p-1 shadow-2xl border border-white/5 mb-8">
        <div className="bg-[#0f172a] rounded-[22px] p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <LinkIcon className="w-5 h-5" />
              </div>
              URL 빌더
            </h2>
            <button 
              onClick={clearForm}
              className="text-xs font-medium text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <RefreshIcon className="w-3.5 h-3.5" /> 초기화
            </button>
          </div>

          <div className="space-y-8">
            <InputGroup label="웹사이트 URL" required>
              <input
                type="text"
                name="baseUrl"
                value={params.baseUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className={inputClass}
              />
            </InputGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="소스 (Source)" required subLabel="예: google, newsletter, {{site_source_name}}">
                {isCustomSource ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="source"
                      value={params.source}
                      onChange={handleInputChange}
                      placeholder="직접 입력..."
                      autoFocus
                      className={inputClass}
                    />
                    <button 
                      onClick={() => setIsCustomSource(false)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select name="source" value={params.source} onChange={handleInputChange} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {commonSources.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      <option value="custom_input_option" className="font-semibold text-primary">+ 직접 입력</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                )}
              </InputGroup>

              <InputGroup label="매체 (Medium)" required subLabel="예: paid_social, cpc, banner">
                {isCustomMedium ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="medium"
                      value={params.medium}
                      onChange={handleInputChange}
                      placeholder="직접 입력..."
                      autoFocus
                      className={inputClass}
                    />
                    <button 
                      onClick={() => setIsCustomMedium(false)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    >
                       <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select name="medium" value={params.medium} onChange={handleInputChange} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {commonMediums.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      <option value="custom_input_option" className="font-semibold text-primary">+ 직접 입력</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                )}
              </InputGroup>
            </div>

            <InputGroup label="캠페인 이름 (Campaign)" required subLabel="예: summer_sale, 2024_promo">
              <input
                type="text"
                name="campaign"
                value={params.campaign}
                onChange={handleInputChange}
                placeholder="캠페인을 식별할 수 있는 이름"
                className={inputClass}
              />
            </InputGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="검색어 (Term)" subLabel="유료 키워드 식별">
                <input
                  type="text"
                  name="term"
                  value={params.term}
                  onChange={handleInputChange}
                  placeholder="(선택 사항)"
                  className={inputClass}
                />
              </InputGroup>
              <InputGroup label="콘텐츠 (Content)" subLabel="광고 소재 구분">
                <input
                  type="text"
                  name="content"
                  value={params.content}
                  onChange={handleInputChange}
                  placeholder="(선택 사항)"
                  className={inputClass}
                />
              </InputGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Result Card */}
      <div className={`transition-all duration-500 ease-out transform ${generatedUrl ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-50'}`}>
        <div className={`rounded-3xl p-[1px] shadow-2xl mb-12 ${generatedUrl ? 'bg-gradient-to-r from-primary/50 via-purple-500/50 to-secondary/50' : 'bg-slate-800'}`}>
          <div className="bg-slate-900 rounded-[23px] p-6 sm:p-8 overflow-hidden relative">
             {/* Background Glow */}
             {generatedUrl && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/20 blur-[60px]" />}

            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 relative z-10">
              <div className={`w-2 h-2 rounded-full ${generatedUrl ? 'bg-secondary animate-pulse' : 'bg-slate-600'}`} />
              생성 결과
            </h3>
            
            <div className="relative group mb-6 z-10">
              <div className={`w-full rounded-xl border p-5 min-h-[120px] break-all font-mono text-sm leading-relaxed flex items-center transition-colors ${generatedUrl ? 'bg-black/40 border-primary/30 text-slate-200' : 'bg-slate-950 border-white/5 text-slate-600 justify-center text-center italic'}`}>
                {generatedUrl ? generatedUrl : '파라미터를 입력하면 결과가 여기에 표시됩니다.'}
              </div>
              
              {generatedUrl && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                   <button
                    onClick={() => handleCopy(generatedUrl, false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-[0.98] shadow-lg ${
                      isCopied 
                        ? 'bg-secondary text-white shadow-secondary/20' 
                        : 'bg-primary text-white hover:bg-primaryDark shadow-primary/25 hover:shadow-primary/40'
                    }`}
                  >
                    {isCopied ? <><CheckIcon className="w-4 h-4" /> 복사 완료</> : <><CopyIcon className="w-4 h-4" /> URL 복사</>}
                  </button>
                  
                  {!shortenedUrl ? (
                    <button
                      onClick={handleShortenUrl}
                      disabled={isShortening}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-white/10"
                    >
                      {isShortening ? (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><ScissorsIcon className="w-4 h-4" /> 링크 단축 (TinyURL)</>
                      )}
                    </button>
                  ) : (
                    <div className="flex-1 flex gap-2 items-center bg-black/40 border border-secondary/30 rounded-xl p-1 pr-2 animate-fade-in">
                       <input 
                        readOnly 
                        value={shortenedUrl} 
                        className="bg-transparent text-secondary text-sm px-3 w-full outline-none font-mono font-bold"
                      />
                      <button
                        onClick={() => handleCopy(shortenedUrl, true)}
                        className={`flex-none p-2 rounded-lg transition-colors ${
                          isShortenedCopied ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                         {isShortenedCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="border-t border-white/10 pt-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
             <HistoryIcon className="text-slate-500" />
             최근 기록
          </h3>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-1 rounded hover:bg-rose-500/10"
            >
              전체 삭제
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border border-dashed border-slate-800 bg-slate-900/30">
            <p className="text-slate-500 text-sm">아직 생성된 UTM 링크가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {history.map(item => (
              <div key={item.id} className="bg-slate-900/50 backdrop-blur rounded-xl p-5 border border-white/5 hover:border-primary/30 hover:bg-slate-800 transition-all group relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {item.params.source && <span className="bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-blue-500/20">{item.params.source}</span>}
                      {item.params.medium && <span className="bg-purple-500/10 text-purple-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-purple-500/20">{item.params.medium}</span>}
                      {item.params.campaign && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-emerald-500/20">{item.params.campaign}</span>}
                    </div>
                    <div className="font-mono text-slate-400 text-xs sm:text-sm truncate mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.url}
                    </div>
                    {item.shortUrl && (
                      <div className="flex items-center gap-1.5 text-secondary text-xs font-bold mt-1">
                        <ScissorsIcon className="w-3 h-3" /> {item.shortUrl}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:pl-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRestoreFromHistory(item)}
                      className="text-slate-300 hover:text-white px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      불러오기
                    </button>
                    <button 
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UtmBuilder;