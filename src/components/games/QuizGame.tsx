import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { quizQuestions } from '@/data/gameData';
import { Check, X, Star, HelpCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface QuizGameProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function QuizGame({ level, onComplete, onBack }: QuizGameProps) {
  const questions = quizQuestions[`level${level}` as keyof typeof quizQuestions];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const question = questions[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === question.correctAnswer) {
      setCorrectAnswers(c => c + 1);
      setStreak(s => s + 1);
      toast.success('🎉 Correto!');
    } else {
      setStreak(0);
      toast.error('Ops! Não foi dessa vez...');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setGameComplete(true);
      const score = calculateScore();
      setTimeout(() => onComplete(score), 1500);
    } else {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const calculateScore = () => {
    const baseScore = correctAnswers * 200;
    const levelBonus = level * 100;
    const perfectBonus = correctAnswers === questions.length ? 500 : 0;
    return baseScore + levelBonus + perfectBonus;
  };

  if (gameComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-8xl mb-6">
          {correctAnswers === questions.length ? '🏆' : correctAnswers >= questions.length / 2 ? '🎉' : '💪'}
        </div>
        <h2 className="font-pearl text-4xl text-primary mb-4">
          {correctAnswers === questions.length ? 'Perfeito!' : 'Fase Concluída!'}
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          Você acertou {correctAnswers} de {questions.length} perguntas!
        </p>
        <div className="flex items-center justify-center gap-2 mb-8">
          <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          <span className="text-3xl font-bold text-secondary">{calculateScore()} pontos</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="text-primary">
          ← Voltar
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <span className="text-sm">Acertos:</span>
            <span className="font-bold text-accent">{correctAnswers}</span>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full animate-bounce-gentle">
              <span className="text-sm">🔥 Sequência:</span>
              <span className="font-bold text-secondary">{streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pergunta {currentQuestion + 1}/{questions.length}</span>
          <span>Fase {level}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card rounded-3xl p-8 shadow-card mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-pearl text-2xl text-foreground">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            
            let buttonClass = 'bg-muted hover:bg-muted/80 text-foreground';
            if (showResult) {
              if (isCorrect) {
                buttonClass = 'bg-accent text-accent-foreground';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-destructive text-destructive-foreground';
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`
                  w-full p-4 rounded-xl text-left font-medium transition-all duration-300
                  flex items-center justify-between
                  ${buttonClass}
                  ${!showResult ? 'hover:scale-[1.02] hover:shadow-soft' : ''}
                `}
              >
                <span>{option}</span>
                {showResult && isCorrect && <Check className="w-5 h-5" />}
                {showResult && isSelected && !isCorrect && <X className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {showResult && (
        <div className={`
          rounded-2xl p-6 mb-6 animate-fade-in
          ${selectedAnswer === question.correctAnswer 
            ? 'bg-accent/20 border border-accent' 
            : 'bg-secondary/20 border border-secondary'
          }
        `}>
          <p className="text-foreground">
            <span className="font-bold">💡 Explicação: </span>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {showResult && (
        <Button 
          onClick={nextQuestion} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl"
        >
          {currentQuestion + 1 >= questions.length ? 'Ver Resultado' : 'Próxima Pergunta'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
}
