import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { wordSearchWords } from '@/data/gameData';
import { Star, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/contexts/GameContext';

interface WordSearchGameProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Cell = {
  letter: string;
  row: number;
  col: number;
  isFound: boolean;
  isSelected: boolean;
  wordIndex?: number;
};

export function WordSearchGame({ level, onComplete, onBack }: WordSearchGameProps) {
  const words = wordSearchWords[`level${level}` as keyof typeof wordSearchWords];
  const gridSize = 8 + level * 2;
  const { incrementAchievementProgress } = useGame();
  
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wordPositions, setWordPositions] = useState<Map<string, Cell[]>>(new Map());
  const [startCell, setStartCell] = useState<Cell | null>(null);

  const generateGrid = () => {
    const newGrid: Cell[][] = Array(gridSize).fill(null).map((_, row) =>
      Array(gridSize).fill(null).map((_, col) => ({
        letter: '',
        row,
        col,
        isFound: false,
        isSelected: false,
      }))
    );

    const positions = new Map<string, Cell[]>();

    // Place words
    words.forEach((word, wordIndex) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const maxRow = direction === 'vertical' ? gridSize - word.length : gridSize - 1;
        const maxCol = direction === 'horizontal' ? gridSize - word.length : gridSize - 1;
        
        const startRow = Math.floor(Math.random() * (maxRow + 1));
        const startCol = Math.floor(Math.random() * (maxCol + 1));

        let canPlace = true;
        const cellsToPlace: Cell[] = [];

        for (let i = 0; i < word.length; i++) {
          const row = direction === 'vertical' ? startRow + i : startRow;
          const col = direction === 'horizontal' ? startCol + i : startCol;
          
          if (newGrid[row][col].letter !== '' && newGrid[row][col].letter !== word[i]) {
            canPlace = false;
            break;
          }
          cellsToPlace.push({ ...newGrid[row][col], letter: word[i], row, col });
        }

        if (canPlace) {
          cellsToPlace.forEach(cell => {
            newGrid[cell.row][cell.col] = { ...cell, wordIndex };
          });
          positions.set(word, cellsToPlace);
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    newGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.letter === '') {
          cell.letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      });
    });

    setGrid(newGrid);
    setWordPositions(positions);
    setFoundWords([]);
    setSelectedCells([]);
  };

  useEffect(() => {
    generateGrid();
  }, [level]);

  useEffect(() => {
    if (foundWords.length === words.length && foundWords.length > 0) {
      const score = calculateScore();
      toast.success(`🎉 Parabéns! Você encontrou todas as palavras!`);
      setTimeout(() => onComplete(score), 1500);
    }
  }, [foundWords]);

  const calculateScore = () => {
    return foundWords.length * 150 + level * 200;
  };

  const getCellsInLine = (start: Cell, end: Cell): Cell[] => {
    const cells: Cell[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Only allow horizontal or vertical
    const isHorizontal = rowDiff === 0;
    const isVertical = colDiff === 0;
    
    if (!isHorizontal && !isVertical) return cells;
    
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = steps > 0 ? rowDiff / steps : 0;
    const colStep = steps > 0 ? colDiff / steps : 0;
    
    for (let i = 0; i <= steps; i++) {
      const row = start.row + Math.round(rowStep * i);
      const col = start.col + Math.round(colStep * i);
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        cells.push(grid[row][col]);
      }
    }
    
    return cells;
  };

  const updateSelection = (endCell: Cell) => {
    if (!startCell) return;
    
    const cellsInLine = getCellsInLine(startCell, endCell);
    setSelectedCells(cellsInLine);
    
    const newGrid = grid.map(row => row.map(c => ({
      ...c,
      isSelected: cellsInLine.some(s => s.row === c.row && s.col === c.col),
    })));
    setGrid(newGrid);
  };

  const handleStart = (cell: Cell) => {
    setIsSelecting(true);
    setStartCell(cell);
    setSelectedCells([cell]);
    const newGrid = grid.map(row => row.map(c => ({ 
      ...c, 
      isSelected: c.row === cell.row && c.col === cell.col 
    })));
    setGrid(newGrid);
  };

  const handleMove = (cell: Cell) => {
    if (!isSelecting || !startCell) return;
    updateSelection(cell);
  };

  const handleEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    setStartCell(null);
    
    // Check if selected cells form a word
    const selectedWord = selectedCells.map(c => grid[c.row][c.col].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    const matchedWord = words.find(w => 
      (w === selectedWord || w === reversedWord) && !foundWords.includes(w)
    );

    if (matchedWord) {
      const newFoundWords = [...foundWords, matchedWord];
      setFoundWords(newFoundWords);
      
      // Increment word_hunter achievement for each word found
      incrementAchievementProgress('word_hunter', 1);
      
      // Mark cells as found
      const newGrid = grid.map(row => row.map(c => {
        const isInSelection = selectedCells.some(s => s.row === c.row && s.col === c.col);
        return {
          ...c,
          isFound: c.isFound || isInSelection,
          isSelected: false,
        };
      }));
      setGrid(newGrid);
      toast.success(`✅ Palavra "${matchedWord}" encontrada!`);
    } else {
      // Clear selection
      const newGrid = grid.map(row => row.map(c => ({ ...c, isSelected: false })));
      setGrid(newGrid);
    }
    
    setSelectedCells([]);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent, cell: Cell) => {
    e.preventDefault();
    handleStart(cell);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const cellData = element.getAttribute('data-cell');
      if (cellData) {
        const [row, col] = cellData.split('-').map(Number);
        if (!isNaN(row) && !isNaN(col)) {
          handleMove(grid[row][col]);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
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
            <span className="text-sm">Encontradas:</span>
            <span className="font-bold text-accent">{foundWords.length}/{words.length}</span>
          </div>
        </div>
        <Button variant="outline" onClick={generateGrid} size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Level & Score */}
      <div className="text-center mb-6">
        <h2 className="font-pearl text-3xl text-primary">Fase {level}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-secondary">{calculateScore()} pontos</span>
        </div>
      </div>

      {/* Word List */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {words.map(word => (
          <span
            key={word}
            className={`
              px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
              ${foundWords.includes(word)
                ? 'bg-accent text-accent-foreground line-through'
                : 'bg-muted text-muted-foreground'
              }
            `}
          >
            {foundWords.includes(word) && <Check className="w-4 h-4 inline mr-1" />}
            {word}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div 
        className="bg-card rounded-3xl p-4 shadow-card select-none touch-none"
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                data-cell={`${rowIndex}-${colIndex}`}
                onMouseDown={() => handleStart(cell)}
                onMouseEnter={() => handleMove(cell)}
                onTouchStart={(e) => handleTouchStart(e, cell)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center
                  text-sm md:text-base font-bold transition-all duration-200
                  ${cell.isFound
                    ? 'bg-accent text-accent-foreground'
                    : cell.isSelected
                    ? 'bg-secondary text-secondary-foreground scale-110'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                  }
                `}
              >
                {cell.letter}
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Mobile tip */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        💡 Arraste o dedo para selecionar as palavras
      </p>
    </div>
  );
}