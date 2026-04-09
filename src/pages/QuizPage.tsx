import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, CheckCircle, XCircle, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
}

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // ✅ SESSION ID
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);

  // =========================
  // GENERATE QUIZ
  // =========================
  const generateQuiz = async () => {
    if (!topic.trim() && !pdfFile) return;

    setGenerating(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);

    try {
      let res;

      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);

        res = await fetch('https://lakshya-ai-backend.onrender.com/quiz/upload-pdf', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        res = await fetch('https://lakshya-ai-backend.onrender.com/quiz/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            topic,
            num_questions: 10,
            difficulty,
            session_id: sessionId, // ✅ FIXED
          }),
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to generate quiz');

      // ✅ SAVE SESSION ID
      setSessionId(data.session_id);

      const mcqs: Question[] = data.mcqs.map((q: any, idx: number) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation || 'No explanation provided.',
        topic: q.topic || topic,
      }));

      setQuestions(mcqs);

      setTimeout(() => {
        questionsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate quiz');
    }

    setGenerating(false);
  };

  // =========================
  // SUBMIT QUIZ
  // =========================
  const submitQuiz = async () => {
    try {
      const res = await fetch('https://lakshya-ai-backend.onrender.com/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mcqs: questions,
          answers: Object.values(answers),
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error('Submission failed');

      setShowResults(true);

    } catch (err) {
      console.error(err);
      alert('Error submitting quiz');
    }
  };

  const score = questions.filter(q => answers[q.id] === q.correct).length;

  const weakTopics = questions
    .filter(q => answers[q.id] !== q.correct)
    .map(q => q.topic)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          AI Quiz Generator
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-lg">
          Generate MCQ quizzes from a topic or PDF and test your knowledge.
        </p>
      </div>

      {/* INPUTS */}
      <div className="glass rounded-xl p-4 sm:p-6 space-y-4">

        {/* Topic */}
        <div>
          <Label className="text-foreground">Topic</Label>
          <Input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., Deep Learning"
            className="mt-1.5 bg-muted/50 border-border text-sm"
            disabled={!!pdfFile || generating}
          />
        </div>

        {/* PDF Upload */}
        <div>
          <Label className="text-foreground">Upload PDF</Label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            hidden
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) setPdfFile(f);
            }}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            disabled={generating}
          >
            <Upload className="h-4 w-4 mr-2" />
            {pdfFile ? pdfFile.name : 'Select PDF'}
          </Button>
        </div>

        {/* Difficulty */}
        <div>
          <Label className="text-foreground">Difficulty</Label>
          <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                  difficulty === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                disabled={!!pdfFile || generating}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateQuiz}
          disabled={generating || (!topic.trim() && !pdfFile)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </div>

      {/* QUESTIONS */}
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div
            ref={questionsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto p-2"
          >
            {questions.map((q, qi) => (
              <div key={q.id} className="glass rounded-xl p-4 sm:p-6">
                <p className="text-foreground font-medium mb-4 text-sm sm:text-base">
                  <span className="text-primary mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    const isCorrect = showResults && oi === q.correct;
                    const isWrong = showResults && selected && oi !== q.correct;

                    return (
                      <button
                        key={oi}
                        onClick={() => {
                          if (!showResults) {
                            setAnswers(prev => ({ ...prev, [q.id]: oi }));
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                          isCorrect
                            ? 'bg-green-600/20 border border-green-500 text-white'
                            : isWrong
                            ? 'bg-red-600/20 border border-red-500 text-white'
                            : selected
                            ? 'bg-blue-600/20 border border-blue-500 text-white'
                            : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <p className="text-sm text-muted-foreground mt-3 bg-muted/30 rounded-lg p-3">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-muted/30 p-3 rounded-xl">
              {!showResults ? (
                <Button
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length < questions.length}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit Answers
                </Button>
              ) : (
                <div className="flex-1 text-center space-y-2">
                  <p className="text-xl font-bold text-foreground">
                    {score}/{questions.length}
                  </p>

                  {weakTopics.length > 0 && (
                    <p className="text-sm text-red-400">
                      Weak areas: {weakTopics.join(', ')}
                    </p>
                  )}

                  <Button
                    onClick={() => {
                      setQuestions([]);
                      setAnswers({});
                      setShowResults(false);
                      setPdfFile(null);
                    }}
                    className="mt-2 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      {generating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}