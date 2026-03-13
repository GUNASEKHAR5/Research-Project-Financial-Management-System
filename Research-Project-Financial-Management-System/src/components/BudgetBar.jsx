import { calcPercent, budgetColor, formatCurrency } from "../utils/helpers";

const BudgetBar = ({ spent, budget, showLabels = true }) => {
  const percent = calcPercent(spent, budget);
  const color = budgetColor(percent);

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{formatCurrency(spent)} spent</span>
          <span className="font-semibold" style={{ color }}>{percent}%</span>
        </div>
      )}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default BudgetBar;