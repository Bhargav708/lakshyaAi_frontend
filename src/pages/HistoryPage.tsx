import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  FileText,
  Zap,
  Search,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  id: string;
  type: 'chat' | 'pdf' | 'quiz';
  title: string;
  preview: string;
  timestamp: string;
}

// ✅ ICON MAP
const typeIcons = {
  chat: MessageSquare,
  pdf: FileText,
  quiz: Zap,
};

// ✅ COLOR MAP
const typeColors = {
  chat: 'text-primary',
  pdf: 'text-secondary',
  quiz: 'text-warning',
};

// ✅ TIME FORMATTER
function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'chat' | 'pdf' | 'quiz'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ FETCH HISTORY
  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await axios.get('http://localhost:8000/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log("RAW DATA:", res.data);

      let sessions: any[] = [];

      if (res.data?.history) {
        sessions = res.data.history;
      } else {
        console.error("Unexpected API format:", res.data);
        setHistory([]);
        return;
      }

      // ✅ SAFE TRANSFORMATION + NORMALIZATION
      const transformed: HistoryItem[] = sessions.map((session: any) => {
        let type = (session.type || 'chat')
          .toString()
          .toLowerCase()
          .trim();

        // 🔥 normalize invalid types
        if (!['chat', 'pdf', 'quiz'].includes(type)) {
          console.warn("Invalid type from backend:", type);
          type = 'chat';
        }

        return {
          id: session.session_id || crypto.randomUUID(),
          type: type as 'chat' | 'pdf' | 'quiz',
          title: session.title || 'Untitled',
          preview: session.preview || '',
          timestamp: session.timestamp || new Date().toISOString(),
        };
      });

      console.log("TRANSFORMED:", transformed);

      setHistory(transformed);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteItem = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/history/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ NAVIGATION
  const handleClick = (item: HistoryItem) => {
    if (item.type === 'chat') {
      navigate(`/chat/${item.id}`);
    } else if (item.type === 'pdf') {
      navigate(`/pdf/${item.id}`);
    } else if (item.type === 'quiz') {
      navigate(`/quiz/${item.id}`);
    }
  };

  // ✅ FILTER
  const filtered = history.filter(
    (h) =>
      (filter === 'all' || h.type === filter) &&
      (h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.preview.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-muted-foreground mt-1">
          Review your past sessions and continue learning.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'chat', 'pdf', 'quiz'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">
            Loading history...
          </p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No history found</p>
            <p className="text-sm text-muted-foreground">
              Start a conversation or analyze a document to see it here.
            </p>
          </div>
        ) : (
          filtered.map((item, i) => {
            // ✅ SAFE ICON + COLOR
            const Icon =
              typeIcons[item.type as keyof typeof typeIcons] || MessageSquare;

            const color =
              typeColors[item.type as keyof typeof typeColors] ||
              'text-primary';

            return (
              <motion.div
                key={item.id}
                onClick={() => handleClick(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4 flex items-center gap-4 bg-muted/40 hover:bg-muted/60 transition-all cursor-pointer group"
              >
                {/* ICON */}
                <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.preview}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(item.timestamp)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}