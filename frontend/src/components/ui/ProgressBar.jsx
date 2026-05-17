const ProgressBar = ({ value = 0, showLabel = true, height = '8px', color }) => {
  const pct = Math.min(Math.max(value, 0), 100);
  const getColor = () => {
    if (color) return color;
    if (pct >= 80) return 'linear-gradient(90deg, #10B981, #34D399)';
    if (pct >= 50) return 'linear-gradient(90deg, #2563EB, #3B82F6)';
    return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: getColor() }} />
      </div>
      {showLabel && <span className="text-sm font-semibold text-gray-700 w-10 text-right">{pct}%</span>}
    </div>
  );
};

export default ProgressBar;
