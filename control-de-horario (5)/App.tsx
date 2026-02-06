
import React, { useState, useEffect, useRef } from 'react';
import { ContextType, User, LocaleType, Product, ShiftLog, WorkSession } from './types';
import { ApiService } from './services/apiService';
import { 
  User as UserIcon, Lock, ArrowLeft, IceCream, Coffee, Crown, 
  Clock, PlayCircle, PauseCircle, StopCircle, LogOut, 
  Plus, Trash2, Edit, X, Calendar, History, Music, Volume2, Play, Pause, Loader2
} from 'lucide-react';

// Pages
import { Calculator } from './components/Calculator';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.floor(amount));
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- MUSIC PLAYER COMPONENT ---
const MusicPlayer = ({ context }: { context: ContextType }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const themeColor = context === 'yummy' ? 'pink' : context === 'uwu' ? 'sky' : context === 'admin_panel' ? 'amber' : 'purple';

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    };
    playAudio();
    const handleFirstInteraction = () => { if (!isPlaying && audioRef.current) playAudio(); };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play().catch(console.error); setIsPlaying(true); }
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-center gap-3">
      <audio ref={audioRef} loop src="https://r2.fivemanage.com/kzuuKwd6ZkGWhQCgiNggV/AnimalCrossing-BubblegumKKRemix.mp3" />
      <div className="relative flex flex-col items-center group" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
        <div className={`absolute bottom-full pb-4 px-2 transition-all duration-300 origin-bottom ${showVolume ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
          <div className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white">
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMusic} className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-4 border-white group overflow-hidden ${isPlaying ? 'bg-white text-gray-700' : `bg-${themeColor}-400 text-white`}`}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          {isPlaying && (
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white flex items-center gap-2 animate-in slide-in-from-left duration-500">
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className={`w-1 bg-${themeColor}-400 rounded-full animate-bounce`} style={{ height: `${Math.random() * 12 + 8}px`, animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <div className="flex flex-col"><span className="text-xs font-bold text-gray-600 truncate max-w-[90px]">Bubblegum KK✨</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [context, setContext] = useState<ContextType>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ApiService.getAllData();
        setGlobalData(data);
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pink-400" size={64} /></div>;

  return (
    <>
      <MusicPlayer context={context} />
      {!currentUser && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none select-none z-0">
          <span className="text-[10px] tracking-[0.2em] font-black uppercase text-slate-400/20">by:W4LT3R</span>
        </div>
      )}

      {!context ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
          <h1 className="text-4xl font-bold text-slate-700 mb-12 text-center drop-shadow-xl bg-white/60 backdrop-blur-md px-10 py-5 rounded-full border-2 border-white/40">✨ Bienvenido al Sistema ✨</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            <button onClick={() => setContext('yummy')} className="group bg-pink-100/80 backdrop-blur-md rounded-3xl p-8 h-80 flex flex-col items-center justify-center shadow-xl hover:-translate-y-2 transition-all border-4 border-white">
              <div className="bg-white p-6 rounded-full shadow-inner mb-6 group-hover:rotate-12 transition-transform"><IceCream size={64} className="text-pink-400" /></div>
              <h2 className="text-3xl font-bold text-pink-500 mb-2">Yummy Ice Cream</h2>
            </button>
            <button onClick={() => setContext('uwu')} className="group bg-sky-100/80 backdrop-blur-md rounded-3xl p-8 h-80 flex flex-col items-center justify-center shadow-xl hover:-translate-y-2 transition-all border-4 border-white">
              <div className="bg-white p-6 rounded-full shadow-inner mb-6 group-hover:-rotate-12 transition-transform"><Coffee size={64} className="text-sky-400" /></div>
              <h2 className="text-3xl font-bold text-sky-500 mb-2">UwU Café</h2>
            </button>
            <button onClick={() => setContext('admin_panel')} className="group bg-amber-100/80 backdrop-blur-md rounded-3xl p-8 h-80 flex flex-col items-center justify-center shadow-xl hover:-translate-y-2 transition-all border-4 border-white">
              <div className="bg-white p-6 rounded-full shadow-inner mb-6 group-hover:scale-110 transition-transform"><Crown size={64} className="text-amber-500" /></div>
              <h2 className="text-3xl font-bold text-amber-500 mb-2">Jefes / Dueños</h2>
            </button>
          </div>
        </div>
      ) : !currentUser ? (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="bg-white/95 p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white relative">
            <button onClick={() => setContext(null)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"><ArrowLeft /></button>
            <h2 className="text-3xl font-bold text-center mb-8 text-slate-700">{context === 'admin_panel' ? 'Panel de Jefes' : context.toUpperCase()}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const user = await ApiService.login((e.target as any).u.value, (e.target as any).p.value).catch(err => alert(err.message));
              if (user) setCurrentUser(user);
            }} className="space-y-6">
              <input name="u" placeholder="Usuario" className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none" required />
              <input name="p" type="password" placeholder="Contraseña" className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none" required />
              <button type="submit" className="w-full py-4 rounded-xl font-bold bg-pink-400 text-white shadow-lg hover:bg-pink-500">Entrar</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8">
           {/* Dashboards simplified for logic: En producción se integrarían los componentes anteriores usando ApiService */}
           <h1 className="text-white text-2xl">Logueado como {currentUser.username} en {context}</h1>
           <button onClick={() => setCurrentUser(null)} className="mt-4 bg-white px-4 py-2 rounded-lg">Cerrar Sesión</button>
           <Calculator locale={context === 'admin_panel' ? 'yummy' : context as LocaleType} user={currentUser} />
        </div>
      )}
    </>
  );
};

export default App;
