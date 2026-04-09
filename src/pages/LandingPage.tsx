import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Learning Assistant',
    description:
      'Your personal AI tutor that explains concepts, answers questions, and simplifies complex topics instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Conversational AI Chat',
    description:
      'Engage in intelligent, context-aware conversations powered by advanced large language models.',
  },
  {
    icon: FileText,
    title: 'PDF-Based AI (RAG)',
    description:
      'Upload documents and get accurate answers, summaries, and insights using Retrieval-Augmented Generation.',
  },
  {
    icon: Zap,
    title: 'AI Quiz Generator',
    description:
      'Generate adaptive quizzes and MCQs instantly to test and strengthen your understanding.',
  },
  {
    icon: BookOpen,
    title: 'Personalized Learning Paths',
    description:
      'Receive customized study plans tailored to your goals, pace, and performance.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description:
      'JWT-based authentication ensures secure access and protects your learning data.',
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Lakshya AI
            </span>
          </div>
          <Button variant="glass" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Powered by Generative AI & RAG Technology
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Master Any Subject with</span>
              <br />
              <span className="gradient-text">Lakshya AI</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              An intelligent AI-powered learning platform that helps you chat,
              analyze PDFs, generate quizzes, and build knowledge faster than
              ever before.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="hero"
                size="lg"
                className="text-base px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <Sparkles className="h-5 w-5 ml-1" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="text-base px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Explore Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Learn Smarter</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Lakshya AI combines Generative AI, Retrieval-Augmented Generation,
              and adaptive assessments to create a powerful learning ecosystem.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="glass rounded-xl p-6 hover:glow-sm transition-all duration-300 group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Your AI-Powered Learning Journey Today
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of learners using Lakshya AI to enhance their
              knowledge, prepare for exams, and achieve their academic and
              professional goals.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Start Learning for Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-bg flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Lakshya AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Lakshya AI. Built with passion for intelligent learning.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Terms
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}