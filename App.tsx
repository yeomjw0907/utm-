import React, { useState } from 'react';
import UtmBuilder from './components/UtmBuilder';
import Board from './components/Board';

type ViewState = 'builder' | 'board';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('builder');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('builder')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Smart<span className="text-primary">UTM</span>
            </span>
          </button>
          
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('builder')}
              className={`text-sm transition-colors ${
                currentView === 'builder' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'
              }`}
            >
              생성기
            </button>
            <button
              onClick={() => setCurrentView('board')}
              className={`text-sm transition-colors ${
                currentView === 'board' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'
              }`}
            >
              게시판
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow py-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
        {currentView === 'builder' ? (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center animate-in fade-in duration-500">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                더 똑똑한 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">마케팅 성과 분석</span>의 시작
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg word-keep-all">
                마케팅 캠페인을 위한 UTM 파라미터를 손쉽게 생성하세요. AI 어시스턴트가 캠페인 설명에 맞는 최적의 태그를 자동으로 제안합니다.
              </p>
            </div>
            <UtmBuilder />
          </>
        ) : (
          <Board />
        )}
      </main>

      <footer className="border-t border-gray-800 bg-gray-900 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SmartUTM Builder. Built with React & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;