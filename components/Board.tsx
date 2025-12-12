import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, XIcon, FileTextIcon, CalendarIcon } from './Icons';

const Board: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedPosts = localStorage.getItem('my_board_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        console.error("Failed to load posts", e);
      }
    }
  }, []);

  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('my_board_posts', JSON.stringify(newPosts));
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const newPost: BlogPost = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedPosts = [newPost, ...posts];
    savePosts(updatedPosts);
    
    setTitle('');
    setContent('');
    setIsWriting(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("정말로 이 글을 삭제하시겠습니까?")) return;
    const updatedPosts = posts.filter(p => p.id !== id);
    savePosts(updatedPosts);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
               <FileTextIcon className="w-6 h-6" />
             </div>
             나만의 게시판
           </h2>
           <p className="text-slate-400 text-sm mt-2 ml-1">
             아이디어나 메모를 자유롭게 기록하고 저장하세요.
           </p>
        </div>
        
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5" />
            새 글 작성
          </button>
        )}
      </div>

      {/* Editor Section */}
      {isWriting && (
        <div className="bg-surface/50 backdrop-blur-md rounded-2xl p-1 shadow-2xl border border-white/10 mb-10 animate-slide-up">
          <div className="bg-slate-900 rounded-[20px] p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">작성하기</h3>
              <button 
                onClick={() => setIsWriting(false)} 
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-bold text-lg"
                  autoFocus
                />
              </div>
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 자유롭게 작성하세요..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all h-64 resize-none leading-relaxed custom-scrollbar"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsWriting(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-secondary hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-secondary/20"
                >
                  <SaveIcon className="w-4 h-4" />
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List Section */}
      <div className="grid grid-cols-1 gap-4">
        {posts.length === 0 && !isWriting ? (
          <div className="text-center py-24 bg-surface/30 rounded-3xl border border-dashed border-slate-700/50">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileTextIcon className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-slate-400 text-lg font-medium">아직 작성된 글이 없습니다.</p>
             <p className="text-slate-600 text-sm mt-2 mb-6">첫 번째 아이디어를 기록해보세요.</p>
             <button 
               onClick={() => setIsWriting(true)} 
               className="text-primary hover:text-primaryDark font-semibold transition-colors border-b-2 border-primary/20 hover:border-primary"
             >
               글쓰기 시작
             </button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-surface/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-primary/20 hover:bg-surface/60 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1 pr-4">{post.title}</h3>
                 <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                    title="삭제"
                 >
                   <TrashIcon className="w-4 h-4" />
                 </button>
               </div>
               <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-4 text-sm sm:text-base line-clamp-3 group-hover:line-clamp-none transition-all">
                 {post.content}
               </div>
               <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                 <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                 <span className="text-xs text-slate-500 font-medium">{post.createdAt}</span>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;