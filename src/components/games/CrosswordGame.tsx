import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { crosswordClues } from '@/data/gameData';
import { Star, Check, HelpCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface CrosswordGameProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

type CrosswordCell = {
  letter: string;
  userLetter: string;
  row: number;
  col: number;
  isBlocked: boolean;
  wordIndices: number[];
  isCorrect?: boolean;
};

export function CrosswordGame({ level, onComplete, onBack }: CrosswordGameProps) {
  const clues = crosswordClues[`level${level}` as keyof typeof crosswordClues];
  const gridSize = 10 + level * 2;
  
  const [grid, setGrid] = useState<CrosswordCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [solvedWords, setSolvedWords] = useState<number[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const generateCrossword = () => {
    // Initialize empty grid
    const newGrid: CrosswordCell[][] = Array(gridSize).fill(null).map((_, row) =>
      Array(gridSize).fill(null).map((_, col) => ({
        letter: '',
        userLetter: '',
        row,
        col,
        isBlocked: true,
        wordIndices: [],
      }))
    );

    // Place words with proper spacing
    let currentRow = 1;
    let currentCol = 1;

    clues.forEach((clue, index) => {
      const wordLength = clue.word.length;
      
      if (clue.direction === 'horizontal') {
        // Ensure word fits in grid
        if (currentCol + wordLength > gridSize - 1) {
          currentCol = 1;
          currentRow += 3;
        }
        
        for (let i = 0; i < wordLength; i++) {
          if (currentRow < gridSize - 1 && currentCol + i < gridSize - 1) {
            newGrid[currentRow][currentCol + i] = {
              letter: clue.word[i],
              userLetter: '',
              row: currentRow,
              col: currentCol + i,
              isBlocked: false,
              wordIndices: [index],
            };
          }
        }
        currentRow += 2;
      } else {
        // Ensure word fits in grid
        if (currentRow + wordLength > gridSize - 1) {
          currentRow = 1;
          currentCol += 4;
        }
        
        for (let i = 0; i < wordLength; i++) {
          if (currentRow + i < gridSize - 1 && currentCol < gridSize - 1) {
            const existingCell = newGrid[currentRow + i][currentCol];
            newGrid[currentRow + i][currentCol] = {
              letter: clue.word[i],
              userLetter: existingCell.userLetter || '',
              row: currentRow + i,
              col: currentCol,
              isBlocked: false,
              wordIndices: [...existingCell.wordIndices, index],
            };
          }
        }
        currentCol += 3;
        if (currentCol >= gridSize - 4) {
          currentCol = 1;
          currentRow = 1;
        }
      }
    });

    setGrid(newGrid);
    setSolvedWords([]);
    setHintsUsed(0);
    setActiveWordIndex(null);
  };

  useEffect(() => {
    generateCrossword();
  }, [level]);

  useEffect(() => {
    if (solvedWords.length === clues.length && solvedWords.length > 0) {
      const score = calculateScore();
      toast.success(`🎉 Parabéns! Você completou as palavras cruzadas!`);
      setTimeout(() => onComplete(score), 1500);
    }
  }, [solvedWords]);

  const calculateScore = () => {
    const baseScore = solvedWords.length * 200;
    const levelBonus = level * 150;
    const hintPenalty = hintsUsed * 50;
    return Math.max(100, baseScore + levelBonus - hintPenalty);
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (grid[row][col].isBlocked) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      userLetter: value.toUpperCase().slice(0, 1),
    };
    setGrid(newGrid);

    // Check if any word is complete
    checkCompletedWords(newGrid);

    // Auto-advance to next cell if a letter was typed
    if (value && activeWordIndex !== null) {
      const clue = clues[activeWordIndex];
      const wordCells = newGrid.flat()
        .filter(cell => cell.wordIndices.includes(activeWordIndex) && !cell.isBlocked)
        .sort((a, b) => {
          if (clue.direction === 'horizontal') return a.col - b.col;
          return a.row - b.row;
        });
      
      const currentIndex = wordCells.findIndex(c => c.row === row && c.col === col);
      if (currentIndex < wordCells.length - 1) {
        const nextCell = wordCells[currentIndex + 1];
        setSelectedCell({ row: nextCell.row, col: nextCell.col });
        // Focus the next input
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-row="${nextCell.row}"][data-col="${nextCell.col}"]`
          ) as HTMLInputElement;
          nextInput?.focus();
        }, 10);
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.isBlocked) return;
    
    setSelectedCell({ row, col });
    if (cell.wordIndices.length > 0) {
      setActiveWordIndex(cell.wordIndices[0]);
    }
  };

  const handleClueClick = (index: number) => {
    setActiveWordIndex(index);
    // Find first cell of this word
    const firstCell = grid.flat().find(cell => 
      cell.wordIndices.includes(index) && !cell.isBlocked
    );
    if (firstCell) {
      setSelectedCell({ row: firstCell.row, col: firstCell.col });
    }
  };

  const checkCompletedWords = (currentGrid: CrosswordCell[][]) => {
    const newSolved: number[] = [...solvedWords];

    clues.forEach((clue, index) => {
      if (newSolved.includes(index)) return;

      const wordCells = currentGrid.flat().filter(cell => 
        cell.wordIndices.includes(index) && !cell.isBlocked
      );

      const userWord = wordCells.map(c => c.userLetter).join('');
      
      if (userWord === clue.word) {
        newSolved.push(index);
        toast.success(`✅ Palavra "${clue.word}" correta!`);
      }
    });

    if (newSolved.length > solvedWords.length) {
      setSolvedWords(newSolved);
    }
  };

  const giveHint = () => {
    const unsolvedClue = clues.findIndex((_, i) => !solvedWords.includes(i));
    if (unsolvedClue === -1) return;

    const wordCells = grid.flat().filter(cell => 
      cell.wordIndices.includes(unsolvedClue) && !cell.isBlocked
    );

    // Find first empty or wrong cell
    const cellToFill = wordCells.find(cell => cell.userLetter !== cell.letter);
    if (cellToFill) {
      const newGrid = [...grid];
      newGrid[cellToFill.row][cellToFill.col] = {
        ...cellToFill,
        userLetter: cellToFill.letter,
      };
      setGrid(newGrid);
      setHintsUsed(h => h + 1);
      checkCompletedWords(newGrid);
      toast.info('💡 Dica revelada!');
    }
  };

  const isCellActive = (cell: CrosswordCell) => {
    if (activeWordIndex === null) return false;
    return cell.wordIndices.includes(activeWordIndex) && !cell.isBlocked;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="text-primary">
          ← Voltar
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <span className="text-sm">Palavras:</span>
            <span className="font-bold text-accent">{solvedWords.length}/{clues.length}</span>
          </div>
          <Button variant="outline" onClick={giveHint} size="sm" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Dica
          </Button>
        </div>
      </div>

      {/* Level & Score */}
      <div className="text-center mb-6">
        <h2 className="font-pearl text-3xl text-primary">Fase {level}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-secondary">{calculateScore()} pontos</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Clues */}
        <div className="bg-card rounded-3xl p-6 shadow-card">
          <h3 className="font-pearl text-xl text-primary mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Dicas
          </h3>
          <div className="space-y-3">
            {clues.map((clue, index) => (
              <div 
                key={index}
                onClick={() => handleClueClick(index)}
                className={`
                  p-3 rounded-xl transition-all duration-300 cursor-pointer
                  ${solvedWords.includes(index)
                    ? 'bg-accent/20 border border-accent'
                    : activeWordIndex === index
                    ? 'bg-secondary/30 border-2 border-secondary ring-2 ring-secondary/50'
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    activeWordIndex === index ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm ${solvedWords.includes(index) ? 'line-through text-muted-foreground' : ''}`}>
                      {clue.clue}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({clue.direction === 'horizontal' ? 'Horizontal' : 'Vertical'})
                    </p>
                  </div>
                  {solvedWords.includes(index) && (
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="bg-card rounded-3xl p-4 shadow-card overflow-x-auto">
          <div 
            className="grid gap-1 min-w-fit"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(28px, 1fr))` }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                // Check if cell is part of a completed word
                const isCellInCompletedWord = cell.wordIndices.some(idx => solvedWords.includes(idx));
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      aspect-square flex items-center justify-center min-w-[28px] min-h-[28px]
                      ${cell.isBlocked 
                        ? 'bg-foreground/10' 
                        : isCellInCompletedWord
                        ? 'bg-accent'
                        : isCellActive(cell)
                        ? 'bg-secondary/40 border-2 border-secondary ring-2 ring-secondary/30'
                        : 'bg-muted border-2 border-border'
                      }
                      rounded-md transition-all duration-200
                    `}
                  >
                    {!cell.isBlocked && (
                      <input
                        type="text"
                        data-row={rowIndex}
                        data-col={colIndex}
                        value={cell.userLetter}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        maxLength={1}
                        className={`
                          w-full h-full text-center font-bold bg-transparent
                          focus:outline-none focus:ring-2 focus:ring-primary rounded-md
                          text-sm uppercase
                          ${isCellInCompletedWord
                            ? 'text-accent-foreground'
                            : 'text-foreground'
                          }
                        `}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}