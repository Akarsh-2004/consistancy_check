
import '../../styles/Streak.css';

interface StreakProps {
  name: string;
  count: number;
  unit: string;
}

export function Streak({ name, count, unit }: StreakProps) {
  return (
    <div className="streak-item">
      <h4>{name} Streak: {count} {unit}</h4>
    </div>
  );
}
