import { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Search, Activity, Cpu, TrendingUp, ShieldAlert, Zap, Globe, DollarSign, BarChart3 } from 'lucide-react';

const POPULAR_ASSETS = [
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'КРИПТОВАЛЮТА', icon: <Zap className="text-yellow-500" /> },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'КРИПТОВАЛЮТА', icon: <Zap className="text-purple-500" /> },
  { symbol: 'TON11419-USD', name: 'Toncoin', type: 'КРИПТОВАЛЮТА', icon: <Zap className="text-blue-400" /> },
  { symbol: 'SOL-USD', name: 'Solana', type: 'КРИПТОВАЛЮТА', icon: <Zap className="text-green-400" /> },
  { symbol: 'NVDA', name: 'Nvidia', type: 'АКЦИИ', icon: <BarChart3 className="text-green-500" /> },
  { symbol: 'TSLA', name: 'Tesla', type: 'АКЦИИ', icon: <BarChart3 className="text-red-500" /> },
  { symbol: 'AAPL', name: 'Apple', type: 'АКЦИИ', icon: <BarChart3 className="text-gray-400" /> },
  { symbol: 'PLTR', name: 'Palantir', type: 'АКЦИИ', icon: <BarChart3 className="text-blue-300" /> },
];

function App() {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (symbol) => {
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setData(null);
    setTicker(symbol);

    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        ticker: symbol.toUpperCase().trim()
      });

      if (response.data.market_data?.error) {
        setError(`Тикер "${symbol}" не найден. Попробуйте другой.`);
        return;
      }

      if (!response.data.market_data?.current_price) {
        setError("Нет данных о цене. Возможно, тикер указан неверно.");
        return;
      }

      setData(response.data);
    } catch (err) {
      setError("Ошибка соединения с сервером AI. Убедитесь, что backend запущен.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(ticker);
  };

  const getSignalColor = (signal) => {
    if (!signal) return 'text-gray-400 border-gray-400';
    if (signal.includes('BUY')) return 'text-crypto-green border-crypto-green';
    if (signal.includes('SELL')) return 'text-crypto-red border-crypto-red';
    return 'text-yellow-400 border-yellow-400';
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white p-4 md:p-8 font-sans">

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setData(null); setTicker(''); }}>
          <div className="p-2 bg-gradient-to-tr from-crypto-accent/20 to-purple-500/20 rounded-xl border border-white/10">
            <Cpu className="text-crypto-accent w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider">QUANTUM <span className="text-crypto-accent">TRADER</span></h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Activity size={12} /> Анализ рынка на основе AI
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-crypto-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Поиск тикера (например: BTC-USD)"
            className="relative w-full bg-crypto-card border border-gray-700/50 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all text-white placeholder-gray-600 shadow-xl"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-crypto-accent transition-colors z-10" />
          <button type="submit" disabled={loading} className="absolute right-2 top-2 bg-crypto-accent hover:bg-cyan-300 text-crypto-dark font-bold py-1 px-4 rounded-lg transition-all disabled:opacity-50 z-10">
            {loading ? '...' : 'Анализ'}
          </button>
        </form>
      </header>

      <main className="max-w-7xl mx-auto">

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3 animate-pulse">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-32">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-crypto-accent/30 blur-xl rounded-full animate-pulse"></div>
              <Activity className="w-20 h-20 text-crypto-accent relative z-10 animate-spin duration-700" />
            </div>
            <h2 className="text-2xl font-mono text-white mt-8 tracking-widest">АНАЛИЗ РЫНОЧНЫХ ДАННЫХ</h2>
            <p className="text-gray-500 mt-2">Запуск нейронных сетей и анализ настроений...</p>
          </div>
        )}

        {!data && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Обзор рынка</h2>
              <p className="text-gray-400">Выберите актив для генерации AI-отчета в реальном времени</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {POPULAR_ASSETS.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => fetchData(asset.symbol)}
                  className="bg-crypto-card hover:bg-gray-800 border border-gray-800 hover:border-crypto-accent/50 p-6 rounded-2xl transition-all duration-300 group text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    {asset.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {asset.icon}
                    <span className="text-xs font-bold bg-white/5 px-2 py-0.5 rounded text-gray-400 group-hover:text-white transition-colors">
                      {asset.type}
                    </span>
                  </div>
                  <div className="font-bold text-xl mb-1 group-hover:text-crypto-accent transition-colors">{asset.symbol}</div>
                  <div className="text-sm text-gray-500">{asset.name}</div>
                </button>
              ))}
            </div>

            <div className="mt-16 border-t border-gray-800 pt-8 flex justify-center gap-8 text-gray-600 text-sm">
              <div className="flex items-center gap-2"><Globe size={16} /> Поиск мировых новостей</div>
              <div className="flex items-center gap-2"><DollarSign size={16} /> Цены в реальном времени</div>
              <div className="flex items-center gap-2"><Cpu size={16} /> Анализ на Llama-3</div>
            </div>
          </div>
        )}

        {data && !loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-crypto-card rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-crypto-accent to-transparent opacity-50"></div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-gray-400 text-sm font-mono flex items-center gap-2">
                      <TrendingUp size={16} /> ДИНАМИКА ЦЕН {data.ticker}
                    </h2>
                    <div className="text-4xl font-bold mt-1 text-white">
                      ${data.market_data?.current_price?.toLocaleString() ?? "0.00"}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${data.market_data?.rsi > 50 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    RSI: {data.market_data?.rsi ?? "Н/Д"}
                  </div>
                </div>

                <div className="h-[400px] w-full">
                  {data.market_data?.chart_data?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.market_data.chart_data}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} opacity={0.4} />
                        <XAxis dataKey="date" stroke="#718096" tick={{ fontSize: 12 }} tickFormatter={(val) => val ? val.slice(5) : ''} axisLine={false} tickLine={false} />
                        <YAxis stroke="#718096" domain={['auto', 'auto']} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0b0e11', borderColor: '#2d3748', color: '#fff', borderRadius: '8px' }}
                          itemStyle={{ color: '#00E0FF' }}
                        />
                        <Area type="monotone" dataKey="close" stroke="#00E0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                      Нет исторических данных
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">

              <div className={`bg-crypto-card rounded-2xl p-8 border-2 shadow-[0_0_40px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center text-center h-fit transform transition-all hover:scale-[1.02] ${getSignalColor(data.analysis?.signal)}`}>
                <h3 className="text-gray-400 font-mono text-sm tracking-widest mb-3 opacity-80">AI СТРАТЕГИЯ</h3>
                <div className="text-6xl font-black mb-2 tracking-tighter drop-shadow-lg">
                  {data.analysis?.signal ?? "НЕИЗВЕСТНО"}
                </div>
                <div className="text-sm font-mono bg-white/5 px-3 py-1 rounded-full">
                  УВЕРЕННОСТЬ: {data.analysis?.score ?? 0}%
                </div>
              </div>

              <div className="bg-crypto-card rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                  <Activity className="w-5 h-5 text-crypto-accent" />
                  Объяснение AI
                </h3>
                <div className="prose prose-invert text-gray-400 text-sm leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {data.analysis?.reasoning ?? "Анализ не получен."}
                </div>
              </div>

              <div className="bg-crypto-card rounded-2xl p-6 border border-gray-800">
                <h3 className="text-gray-300 font-bold mb-2 text-xs uppercase tracking-wider">Технические данные</h3>
                <p className="text-xs text-gray-500 font-mono border-l-2 border-crypto-accent pl-4 py-1">
                  {data.market_data?.summary ?? "Нет данных"}
                </p>
              </div>

              <button onClick={() => setData(null)} className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm font-bold">
                Назад к обзору
              </button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;