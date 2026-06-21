import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CHART_STYLES } from '../../constants';

const DeviceAnalyticsChart = ({ data, metricConfig }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <p className="text-[10px] font-bold uppercase tracking-widest">Insufficient Data for Analytics</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={metricConfig.chartColor} stopOpacity={0.1}/>
            <stop offset="95%" stopColor={metricConfig.chartColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray={CHART_STYLES.grid.strokeDasharray} 
          vertical={CHART_STYLES.grid.vertical} 
          stroke={CHART_STYLES.grid.stroke} 
        />
        <XAxis 
          dataKey="timestamp" 
          hide 
        />
        <YAxis 
          fontSize={CHART_STYLES.axis.fontSize}
          fontWeight={CHART_STYLES.axis.fontWeight}
          tickMargin={CHART_STYLES.axis.tickMargin}
          stroke={CHART_STYLES.axis.stroke}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          itemStyle={CHART_STYLES.tooltip.itemStyle}
          labelStyle={{ display: 'none' }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={metricConfig.chartColor} 
          strokeWidth={CHART_STYLES.line.strokeWidth}
          fillOpacity={1} 
          fill="url(#colorMetric)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DeviceAnalyticsChart;