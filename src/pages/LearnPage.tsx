import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { educationalContent } from '@/data/gameData';
import { EducationalContent, QuizQuestion } from '@/types/game';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, ChevronLeft, Check, X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/contexts/GameContext';

export default function LearnPage() {
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { addPoints, unlockAchievement, trackArticleRead, playerState } = useGame();

  const handleQuizAnswer = (answerIndex: number) => {
    if (showAnswer || !selectedContent?.quiz) return;
    
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    const quiz = selectedContent.quiz[currentQuizIndex];
    if (answerIndex === quiz.correctAnswer) {
      addPoints(50);
      toast.success('🎉 Resposta correta! +50 pontos');
    } else {
      toast.error('Ops! Não foi dessa vez...');
    }
  };

  const nextQuiz = () => {
    if (!selectedContent?.quiz) return;
    
    if (currentQuizIndex < selectedContent.quiz.length - 1) {
      setCurrentQuizIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      // Completed all quizzes for this content - track article as read
      trackArticleRead(selectedContent.id);
      
      // Check nature_lover achievement for "Como Preservar a Natureza" section
      if (selectedContent.id === 'nature-preservation') {
        unlockAchievement('nature_lover');
      }
      
      setSelectedContent(null);
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  if (selectedContent) {
    const quiz = selectedContent.quiz?.[currentQuizIndex];
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => {
              setSelectedContent(null);
              setCurrentQuizIndex(0);
              setSelectedAnswer(null);
              setShowAnswer(false);
            }}
            className="mb-6 text-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Content Header */}
          <div className={`bg-gradient-to-br ${selectedContent.color} rounded-3xl p-8 mb-8 text-white`}>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{selectedContent.icon}</span>
              <div>
                <h1 className="font-pearl text-3xl text-shadow-md">
                  {selectedContent.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card mb-8">
            <div className="space-y-4">
              {selectedContent.content.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted rounded-xl animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-2xl">{item.split(' ')[0]}</span>
                  <p className="text-foreground flex-1">
                    {item.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          {quiz && (
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-6 h-6 text-secondary" />
                <h2 className="font-pearl text-2xl text-foreground">Hora do Quiz!</h2>
              </div>

              <p className="text-lg text-foreground mb-6">{quiz.question}</p>

              <div className="space-y-3 mb-6">
                {quiz.options.map((option, index) => {
                  let buttonClass = 'bg-muted hover:bg-muted/80';
                  if (showAnswer) {
                    if (index === quiz.correctAnswer) {
                      buttonClass = 'bg-accent text-accent-foreground';
                    } else if (index === selectedAnswer) {
                      buttonClass = 'bg-destructive text-destructive-foreground';
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      disabled={showAnswer}
                      className={`
                        w-full p-4 rounded-xl text-left font-medium
                        transition-all duration-300 flex items-center justify-between
                        ${buttonClass}
                      `}
                    >
                      <span>{option}</span>
                      {showAnswer && index === quiz.correctAnswer && (
                        <Check className="w-5 h-5" />
                      )}
                      {showAnswer && index === selectedAnswer && index !== quiz.correctAnswer && (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className={`
                  p-4 rounded-xl mb-6 animate-fade-in
                  ${selectedAnswer === quiz.correctAnswer ? 'bg-accent/20' : 'bg-secondary/20'}
                `}>
                  <p className="text-foreground">
                    <span className="font-bold">💡 </span>
                    {quiz.explanation}
                  </p>
                </div>
              )}

              {showAnswer && (
                <Button 
                  onClick={nextQuiz}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {currentQuizIndex < (selectedContent.quiz?.length || 0) - 1 
                    ? 'Próxima Pergunta' 
                    : 'Concluir'
                  }
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Aprender
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra como proteger você e a natureza!
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {educationalContent.map((content, index) => (
            <button
              key={content.id}
              onClick={() => setSelectedContent(content)}
              className="animate-fade-in text-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`
                bg-gradient-to-br ${content.color} rounded-3xl p-6
                transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                shadow-card hover:shadow-glow h-full
              `}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{content.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-pearl text-xl text-white text-shadow-sm mb-2">
                      {content.title}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {content.content[0].split(' ').slice(1).join(' ')}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60" />
                </div>
                
                {content.quiz && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Lightbulb className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Com quiz!</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-2xl">📚</span>
            <p className="text-foreground">
              Leia os conteúdos e responda os quizzes para ganhar pontos!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
