import { useTheme } from '@mui/material';
import { MutableRefObject, useMemo } from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { CanvasRenderer, UniversalTransition } from 'echarts/features';
import EChartsReact from 'echarts-for-react';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer, UniversalTransition]);

// Remove TypeScript type and interface definitions

const SystemMetricChart = ({ chartRef, data, style }) => {
  const theme = useTheme();

  const chartOption = useMemo(() => {
    const option = {
      color: [theme.palette.primary.main],
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: {
          lineStyle: {
            color: theme.palette.grey[400],
          },
        },
      },
      legend: {
        show: false,
      },
      xAxis: {
        type: 'category',
        data: data.timestamp,
        axisLabel: {
          fontSize: theme.typography.fontSize / 1.4,
          color: theme.palette.grey[200],
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: theme.typography.caption.fontSize,
          color: theme.palette.grey[200],
        },
        splitLine: {
          lineStyle: {
            color: theme.palette.grey[400],
          },
        },
      },
      grid: {
        top: 8,
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
      },
      series: [
        {
          name: data.metricName,
          type: 'line',
          data: data.values,
          smooth: true,
          symbol: 'circle',
          showSymbol: false,
          lineStyle: {
            width: 4,
          },
        },
      ],
    };
    return option;
  }, [theme, data]);

  return <ReactEchart echarts={echarts} option={chartOption} ref={chartRef} style={style} />;
};

export default SystemMetricChart;
