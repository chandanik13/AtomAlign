const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, suffix = '' }) => (
  <div className="card p-5 flex items-center gap-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
    <div className={`w-14 h-14 rounded-3xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-inner`}>
      <Icon className={`w-7 h-7 ${iconColor}`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-900">{value}{suffix}</p>
      <p className="text-sm text-slate-500 mt-0.5">{title}</p>
    </div>
  </div>
);

export default StatCard;
