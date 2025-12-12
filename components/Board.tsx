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
    
    // Reset and close
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <FileTextIcon className="text-secondary" />
             나만의 게시판
           </h2>
           <p className="text-gray-400 text-sm mt-1">
             아이디어나 메모를 자유롭게 기록하고 저장하세요.
           </p>
        </div>
        
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/20"
          >
            <PlusIcon className="w-5 h-5" />
            글쓰기
          </button>
        )}
      </div>

      {/* Editor Section */}
      {isWriting && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">새 글 작성</h3>
            <button 
              onClick={() => setIsWriting(false)} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all font-medium text-lg"
              />
            </div>
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 자유롭게 작성하세요..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all h-64 resize-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsWriting(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-secondary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-900/20"
              >
                <SaveIcon className="w-4 h-4" />
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List Section */}
      <div className="space-y-4">
        {posts.length === 0 && !isWriting ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
             <FileTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
             <p className="text-gray-400 text-lg">작성된 글이 없습니다.</p>
             <button onClick={() => setIsWriting(true)} className="mt-2 text-secondary hover:underline">첫 글을 작성해보세요!</button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{post.title}</h3>
                 <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="삭제"
                 >
                   <TrashIcon className="w-4 h-4" />
                 </button>
               </div>
               <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                 <CalendarIcon className="w-3 h-3" />
                 {post.createdAt}
               </div>
               <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                 {post.content}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;