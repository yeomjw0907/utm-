import React, { useState } from 'react';
import UtmBuilder from './components/UtmBuilder';
import Board from './components/Board';

type ViewState = 'builder' | 'board';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('builder');

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0B1120] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1120]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B1120]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('builder')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-xl rotate-3 group-hover:rotate-6 transition-transform opacity-80 group-hover:opacity-100"></div>
               <div className="absolute inset-0 bg-slate-900 rounded-xl opacity-90"></div>
               <span className="relative font-bold text-transparent bg-clip-text bg-gradient-to-tr from-primary to-purple-400 text-lg">U</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary/90 transition-colors">
              Smart<span className="text-primary">UTM</span>
            </span>
          </button>
          
          <nav className="flex items-center p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => setCurrentView('builder')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === 'builder' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              생성기
            </button>
            <button
              onClick={() => setCurrentView('board')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                currentView === 'board' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              게시판
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 relative z-10">
        {currentView === 'builder' ? (
          <>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-10 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-4 backdrop-blur-sm">
                AI Powered Generator
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                완벽한 파라미터,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                  더 스마트한 트래킹
                </span>
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed word-keep-all">
                복잡한 UTM 코드를 쉽고 정확하게 생성하세요. 마케팅 성과 분석의 첫 걸음을 도와드립니다.
              </p>
            </div>
            <UtmBuilder />
          </>
        ) : (
          <Board />
        )}
      </main>

      <footer className="border-t border-white/5 bg-[#0B1120] py-8 mt-auto relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SmartUTM Builder. <span className="text-slate-600">Designed with precision.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;