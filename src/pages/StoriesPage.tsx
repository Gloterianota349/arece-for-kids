import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/integrations/supabase/client';

interface Story {
  id: string;
  title: string;
  icon: string;
  color: string;
  coverImage: string;
  pages: {
    text: string;
    image: string;
  }[];
}

const stories: Story[] = [
  {
    id: 'gota-adventure',
    title: 'A Aventura da Gotinha',
    icon: '💧',
    color: 'from-blue-400 to-cyan-500',
    coverImage: '💧',
    pages: [
      {
        text: 'Era uma vez, uma pequena gotinha de óleo de Copaíba chamada Gotinha. Ela nasceu no coração da Floresta Amazônica, dentro de uma grande árvore.',
        image: '🌳',
      },
      {
        text: 'Gotinha sonhava em ajudar as crianças a se protegerem dos mosquitos. Um dia, decidiu partir em uma grande aventura!',
        image: '✨',
      },
      {
        text: 'No caminho, encontrou Folhinha, uma folha verde muito simpática. "Oi, Gotinha! Para onde você vai?" perguntou curiosa.',
        image: '🍃',
      },
      {
        text: '"Vou ajudar as crianças a se protegerem dos mosquitos!", respondeu Gotinha animada. Folhinha decidiu ajudá-la na missão.',
        image: '🦟',
      },
      {
        text: 'Juntas, elas encontraram crianças brincando em um parque. Gotinha usou seu poder especial para criar um escudo de proteção contra os mosquitos!',
        image: '🛡️',
      },
      {
        text: 'As crianças ficaram muito felizes e aprenderam que produtos naturais da Amazônia, como o óleo de Copaíba, ajudam a proteger contra mosquitos de forma segura!',
        image: '🎉',
      },
      {
        text: 'E assim, Gotinha e Folhinha se tornaram grandes amigas e protetoras das crianças. Fim! Lembre-se: proteger-se dos mosquitos é importante!',
        image: '💚',
      },
    ],
  },
  {
    id: 'mosquito-fight',
    title: 'O Combate ao Mosquito',
    icon: '🦸',
    color: 'from-red-400 to-orange-500',
    coverImage: '🦸',
    pages: [
      {
        text: 'Na cidade de São Paulo, muitos mosquitos apareciam quando chovia. As pessoas não sabiam como se proteger.',
        image: '🌧️',
      },
      {
        text: 'Um dia, o Guardião Verde apareceu! Ele era um super-herói que conhecia todos os segredos para combater os mosquitos.',
        image: '🦸‍♂️',
      },
      {
        text: '"Amigos, vocês sabiam que mosquitos se reproduzem em água parada?" perguntou o Guardião. As pessoas ficaram surpresas.',
        image: '💧',
      },
      {
        text: 'Ele ensinou que pneus, garrafas e vasos de plantas podem acumular água da chuva. "Precisamos eliminar esses criadouros!"',
        image: '🚫',
      },
      {
        text: 'Todos trabalharam juntos para limpar a cidade. Tamparam caixas d\'água, viraram garrafas e colocaram areia nos pratos das plantas.',
        image: '🧹',
      },
      {
        text: 'O Guardião Verde também ensinou a usar repelentes naturais. "Produtos com óleo de Copaíba são seguros para crianças!"',
        image: '🌿',
      },
      {
        text: 'Com o trabalho de todos, a cidade ficou livre de mosquitos! E as crianças aprenderam que pequenas ações fazem grande diferença.',
        image: '🏙️',
      },
    ],
  },
  {
    id: 'amazon-secrets',
    title: 'Os Segredos da Amazônia',
    icon: '🌴',
    color: 'from-green-400 to-emerald-500',
    coverImage: '🌴',
    pages: [
      {
        text: 'Na maior floresta do mundo, vivem milhões de animais e plantas. A Amazônia é um lugar mágico e cheio de segredos!',
        image: '🌳',
      },
      {
        text: 'Naturinha era uma fada da floresta que conhecia todos os seus segredos. Um dia, decidiu compartilhá-los com as crianças.',
        image: '🧚',
      },
      {
        text: '"Vocês sabiam que a Amazônia produz 20% do oxigênio do planeta?" perguntou Naturinha. "As árvores são nossas amigas!"',
        image: '💨',
      },
      {
        text: 'Ela mostrou a árvore Copaíba, de onde vem o óleo especial. "Este óleo natural ajuda a proteger as pessoas dos mosquitos!"',
        image: '🌳',
      },
      {
        text: 'Naturinha também ensinou sobre os rios. "O Rio Amazonas é o maior do mundo em quantidade de água! Precisamos cuidar dele."',
        image: '🌊',
      },
      {
        text: '"Quando vocês usam produtos naturais da Amazônia, ajudam a preservar a floresta. Os povos que vivem aqui plantam novas árvores!"',
        image: '🌱',
      },
      {
        text: 'E assim, as crianças aprenderam que proteger a Amazônia é proteger nosso futuro. Cada um pode fazer sua parte! Fim!',
        image: '🌍',
      },
    ],
  },
];

export default function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioListenCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addPoints, unlockAchievement, incrementAchievementProgress, trackStoryCompleted, trackDailyPlay, playerState } = useGame();

  const generateAudio = async (text: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audio.muted = isMuted;
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      await audio.play();
      setIsPlaying(true);
      // Track audio listens for achievement
      audioListenCountRef.current += 1;
      incrementAchievementProgress('audio_listener', 1);
    } catch (error) {
      console.error('Audio generation error:', error);
      toast.error('Não foi possível gerar o áudio. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAudio = async () => {
    if (!selectedStory) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const currentText = selectedStory.pages[currentPage].text;
      await generateAudio(currentText);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const nextPage = () => {
    if (!selectedStory) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (currentPage < selectedStory.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Story completed
      addPoints(100);
      trackDailyPlay();
      
      // Track story completion for achievements (unique stories only)
      trackStoryCompleted(selectedStory.id);
      
      // First story achievement
      if (!playerState.achievements.includes('first_story')) {
        unlockAchievement('first_story');
      }
      
      toast.success('🎉 História concluída! +100 pontos');
      setSelectedStory(null);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const closeStory = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    setSelectedStory(null);
    setCurrentPage(0);
    setIsPlaying(false);
  };

  if (selectedStory) {
    const page = selectedStory.pages[currentPage];
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Button 
            variant="ghost" 
            onClick={closeStory}
            className="mb-6 text-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar às Histórias
          </Button>

          {/* Story Card */}
          <div className={`bg-gradient-to-br ${selectedStory.color} rounded-3xl p-6 mb-6`}>
            <h1 className="font-pearl text-2xl md:text-3xl text-white text-center text-shadow-md">
              {selectedStory.title}
            </h1>
            <p className="text-white/80 text-center mt-2">
              Página {currentPage + 1} de {selectedStory.pages.length}
            </p>
          </div>

          {/* Page Content */}
          <div className="bg-card rounded-3xl p-8 shadow-card mb-6">
            {/* Image */}
            <div className="text-center mb-8">
              <span className="text-[120px] leading-none animate-bounce-gentle inline-block">
                {page.image}
              </span>
            </div>

            {/* Text */}
            <p className="text-xl md:text-2xl text-foreground text-center leading-relaxed mb-8">
              {page.text}
            </p>

            {/* Audio Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleAudio}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando...
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Ouvir
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex gap-1">
              {selectedStory.pages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentPage ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextPage}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {currentPage === selectedStory.pages.length - 1 ? 'Concluir' : 'Próxima'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
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
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Histórias
          </h1>
          <p className="text-muted-foreground text-lg">
            Histórias educativas com narração em áudio!
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => {
                setSelectedStory(story);
                setCurrentPage(0);
              }}
              className="animate-fade-in text-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`
                bg-gradient-to-br ${story.color} rounded-3xl p-6 h-full
                transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
                shadow-card hover:shadow-glow
              `}>
                <div className="text-center mb-4">
                  <span className="text-6xl">{story.icon}</span>
                </div>
                <h3 className="font-pearl text-xl text-white text-center text-shadow-sm mb-2">
                  {story.title}
                </h3>
                <p className="text-white/80 text-sm text-center">
                  {story.pages.length} páginas
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <Volume2 className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Com áudio!</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-2xl">📖</span>
            <p className="text-foreground">
              Clique em "Ouvir" para escutar a história narrada!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
