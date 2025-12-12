import React, { useState, useEffect, useCallback } from 'react';
import { UtmParams, UtmHistoryItem } from '../types';
import { CopyIcon, CheckIcon, LinkIcon, RefreshIcon, TrashIcon, ScissorsIcon, XIcon, HistoryIcon } from './Icons';

const commonSources = [
  { value: 'google', label: 'Google (구글)' },
  { value: 'naver', label: 'Naver (네이버)' },
  { value: 'kakao', label: 'Kakao (카카오)' },
  { value: 'facebook', label: 'Facebook (페이스북)' },
  { value: 'instagram', label: 'Instagram (인스타그램)' },
  { value: 'youtube', label: 'YouTube (유튜브)' },
  { value: 'tiktok', label: 'TikTok (틱톡)' },
  { value: 'newsletter', label: 'Newsletter (뉴스레터)' },
  { value: 'blog', label: 'Blog (블로그)' },
];

const commonMediums = [
  { value: 'cpc', label: 'CPC (클릭당 비용)' },
  { value: 'cpm', label: 'CPM (노출당 비용)' },
  { value: 'organic', label: 'Organic (오가닉/자연유입)' },
  { value: 'social', label: 'Social (소셜 미디어)' },
  { value: 'email', label: 'Email (이메일)' },
  { value: 'referral', label: 'Referral (추천/링크)' },
  { value: 'display', label: 'Display (배너/디스플레이)' },
  { value: 'push', label: 'Push (푸시 알림)' },
  { value: 'sms', label: 'SMS (문자)' },
  { value: 'short_form', label: 'Short Form (쇼츠/릴스)' },
];

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
    // Avoid duplicates at the top
    if (history.length > 0 && history[0].url === currentUrl) return;

    const newItem: UtmHistoryItem = {
      id: Date.now().toString(),
      url: currentUrl,
      shortUrl: currentShortUrl,
      params: { ...params },
      createdAt: Date.now()
    };
    
    // Keep top 50
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
      // Save to history on copy
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
    // Restore custom input state logic if needed
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
        addToHistory(generatedUrl, shortUrl); // Update history with short url
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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Section: Builder & Result */}
      <div className="space-y-8 mb-12">
        
        {/* Top: Inputs */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LinkIcon className="text-primary" />
                URL 생성하기
              </h2>
              <button 
                onClick={clearForm}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshIcon className="w-3 h-3" /> 초기화
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  웹사이트 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="baseUrl"
                  value={params.baseUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    캠페인 소스 (utm_source) <span className="text-red-500">*</span>
                  </label>
                  {isCustomSource ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="source"
                        value={params.source}
                        onChange={handleInputChange}
                        placeholder="예: newsletter"
                        autoFocus
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button 
                        onClick={() => setIsCustomSource(false)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      name="source"
                      value={params.source}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">선택해주세요</option>
                      {commonSources.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      <option value="custom_input_option" className="text-primary font-semibold">+ 직접 입력...</option>
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">방문자가 어디서 왔나요?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    캠페인 매체 (utm_medium) <span className="text-red-500">*</span>
                  </label>
                  {isCustomMedium ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="medium"
                        value={params.medium}
                        onChange={handleInputChange}
                        placeholder="예: email"
                        autoFocus
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button 
                        onClick={() => setIsCustomMedium(false)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                      >
                         <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      name="medium"
                      value={params.medium}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">선택해주세요</option>
                      {commonMediums.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      <option value="custom_input_option" className="text-primary font-semibold">+ 직접 입력...</option>
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">어떤 방식으로 왔나요?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  캠페인 이름 (utm_campaign) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="campaign"
                  value={params.campaign}
                  onChange={handleInputChange}
                  placeholder="예: summer_sale"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                 <p className="text-xs text-gray-500 mt-1">프로모션 이름이나 슬로건</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    캠페인 검색어 (utm_term)
                  </label>
                  <input
                    type="text"
                    name="term"
                    value={params.term}
                    onChange={handleInputChange}
                    placeholder="유료 키워드 식별"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    캠페인 콘텐츠 (utm_content)
                  </label>
                  <input
                    type="text"
                    name="content"
                    value={params.content}
                    onChange={handleInputChange}
                    placeholder="광고 소재 구분"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Generated Result */}
        <div>
          <div className={`bg-gray-800 rounded-2xl p-6 shadow-xl border transition-all ${generatedUrl ? 'border-primary/50' : 'border-gray-700'}`}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckIcon className="text-secondary" />
              생성된 URL
            </h3>
            
            <div className="relative group mb-6">
              <div className="w-full bg-gray-950 rounded-lg border border-gray-700 p-4 min-h-[120px] break-all text-gray-300 font-mono text-sm leading-relaxed flex items-center justify-center text-center">
                {generatedUrl ? (
                  <span className="text-left w-full">{generatedUrl}</span>
                ) : (
                  <span className="text-gray-600 italic">위에서 정보를 입력하면<br/>여기에 결과가 표시됩니다.</span>
                )}
              </div>
              
              {generatedUrl && (
                <div className="mt-3 flex justify-end">
                   <button
                    onClick={() => handleCopy(generatedUrl, false)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-lg w-full justify-center ${
                      isCopied 
                        ? 'bg-green-600 text-white shadow-green-900/20' 
                        : 'bg-primary text-white hover:bg-indigo-500 shadow-indigo-900/20'
                    }`}
                  >
                    {isCopied ? '복사 완료!' : 'URL 복사하기'}
                  </button>
                </div>
              )}
            </div>

            {/* Shortener Section */}
            {generatedUrl && (
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-3">
                   <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                     <ScissorsIcon className="w-4 h-4 text-secondary" /> 링크 단축
                   </h4>
                </div>
                
                {!shortenedUrl ? (
                   <button
                    onClick={handleShortenUrl}
                    disabled={isShortening}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border border-gray-600 font-medium"
                  >
                    {isShortening ? '생성 중...' : '단축 링크 생성 (TinyURL)'}
                  </button>
                ) : (
                  <div className="flex gap-2 items-center bg-gray-900 border border-gray-700 rounded-lg p-1 pr-2">
                    <input 
                      readOnly 
                      value={shortenedUrl} 
                      className="bg-transparent text-secondary text-sm px-3 py-3 w-full outline-none font-mono font-bold"
                    />
                    <button
                      onClick={() => handleCopy(shortenedUrl, true)}
                      className={`flex-none p-2 rounded-md transition-colors ${
                        isShortenedCopied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
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

      {/* Bottom Section: History */}
      <div className="border-t border-gray-800 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <HistoryIcon className="text-gray-400" />
             최근 생성 기록
          </h3>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              기록 전체 삭제
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-dashed border-gray-700">
            <p className="text-gray-500">아직 생성된 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-800">{item.params.source}</span>
                      <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded border border-purple-800">{item.params.medium}</span>
                      <span className="bg-green-900/50 text-green-300 text-xs px-2 py-0.5 rounded border border-green-800 font-bold">{item.params.campaign}</span>
                    </div>
                    <div className="font-mono text-gray-300 text-sm truncate opacity-70 mb-1">
                      {item.url}
                    </div>
                    {item.shortUrl && (
                      <div className="flex items-center gap-2 text-secondary text-sm font-bold">
                        <ScissorsIcon className="w-3 h-3" /> {item.shortUrl}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:border-l sm:border-gray-700 sm:pl-4">
                    <button 
                      onClick={() => handleRestoreFromHistory(item)}
                      className="text-gray-400 hover:text-white px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      불러오기
                    </button>
                    <button 
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      className="text-gray-500 hover:text-red-400 p-2 rounded hover:bg-gray-700/50 transition-colors"
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