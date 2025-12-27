import { useState } from 'react';
import { Header } from '@/components/Header';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Gift, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RedeemPage() {
  const { unlockWithCode } = useGame();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Digite um código válido!');
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = unlockWithCode(code);
    setLastResult(success ? 'success' : 'error');
    
    if (success) {
      setCode('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-glow pulse-glow">
            <Key className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Resgatar Código
          </h1>
          <p className="text-muted-foreground text-lg">
            Digite o código do seu produto Arecê!
          </p>
        </div>

        {/* Code Input */}
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Código do Produto
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ARECE-XXX-XXXX"
                className="text-center text-xl font-mono py-6 rounded-xl uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={isLoading || !code.trim()}
              className="w-full bg-primary hover:bg-primary/90 py-6 text-lg rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Resgatar
                </div>
              )}
            </Button>

            {/* Result Feedback */}
            {lastResult && (
              <div className={`
                mt-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in
                ${lastResult === 'success' 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-destructive/20 text-destructive'
                }
              `}>
                {lastResult === 'success' ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span className="font-medium">Código resgatado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6" />
                    <span className="font-medium">Código inválido ou já utilizado</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 space-y-4">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Onde encontrar o código?
              </h3>
              <p className="text-muted-foreground text-sm">
                Cada produto Arecê possui um código único na embalagem. 
                Procure dentro da caixa ou na parte interna do rótulo!
              </p>
            </div>

            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                O que posso desbloquear?
              </h3>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  Jogos exclusivos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  Personagens colecionáveis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  Desde básicos até lendários!
                </li>
              </ul>
            </div>
          </div>

          {/* Example Codes Info (for demo) */}
          <div className="mt-8 bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
            <h3 className="font-bold text-foreground mb-3 text-center">
              🎁 Códigos de Demonstração
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Para testar a aplicação, você pode usar estes códigos:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background p-2 rounded text-center">ARECE-QUI-2024</div>
                <div className="bg-background p-2 rounded text-center">ARECE-CAC-2024</div>
                <div className="bg-background p-2 rounded text-center">ARECE-CRU-2024</div>
                <div className="bg-background p-2 rounded text-center">ARECE-MOS-2024</div>
                <div className="bg-background p-2 rounded text-center">ARECE-FOL-BAS2</div>
                <div className="bg-background p-2 rounded text-center">ARECE-COP-COM1</div>
                <div className="bg-background p-2 rounded text-center">ARECE-GUA-EPI1</div>
                <div className="bg-background p-2 rounded text-center">ARECE-ARE-LEN1</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
