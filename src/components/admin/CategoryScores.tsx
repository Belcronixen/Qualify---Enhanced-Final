import { motion } from 'framer-motion';

interface CategoryScoresProps {
  scores?: {
    [key: string]: {
      score: number;
      total: number;
      percentage: number;
    };
  };
}

const CATEGORIES = [
  {
    name: 'Competencia Tecnológica Básica',
    color: '#3B82F6', // Blue
  },
  {
    name: 'Resolución de Problemas y Pensamiento Crítico',
    color: '#10B981', // Green
  },
  {
    name: 'Estado Personal y Recursos',
    color: '#8B5CF6', // Purple
  },
] as const;

export function CategoryScores({ scores = {} }: CategoryScoresProps) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-3">
      {CATEGORIES.map(({ name, color }) => {
        const score = scores[name] || { score: 0, total: 0, percentage: 0 };
        
        return (
          <div key={name} className="relative flex flex-col items-center">
            <div className="relative h-32 w-32">
              {/* Background circle */}
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-neutral-100"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Animated progress circle */}
                <motion.circle
                  className="stroke-current"
                  style={{ 
                    stroke: color,
                    strokeLinecap: 'round',
                    transformOrigin: '50% 50%',
                  }}
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: score.percentage / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              {/* Percentage text in the middle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color }}>
                  {score.percentage.toFixed(2)}%
                </span>
                <span className="text-xs text-neutral-500">
                  {score.score.toFixed(2)}/{score.total || 1}
                </span>
              </div>
            </div>
            <h3 className="mt-4 text-center text-sm font-medium text-neutral-700">
              {name}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
