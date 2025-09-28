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

// Removed TypeScript type alias since this is a JavaScript file

// Removed TypeScript interface and type annotations for props
const NetworkActivityChart = ({ chartRef, data, style }) => {
  const theme = useTheme();
  const chartOption = useMemo(() => {
    const option = {
      color: [theme.palette.info.main, theme.palette.success.main],
      tooltip: {
        trigger: 'axis',
        confine: true,
      },
      legend: {
        data: ['Receive (RX)', 'Transmit (TX)'],
        left: 'center',
        bottom: 0,
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
          formatter: '{value} KB/s',
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
        bottom: 40,
        containLabel: true,
      },
      series: [
        {
          name: 'Receive (RX)',
          type: 'line',
          data: data.network_rx,
          smooth: true,
          symbol: 'circle',
          showSymbol: false,
          lineStyle: {
            width: 4,
          },
        },
        {
          name: 'Transmit (TX)',
          type: 'line',
          data: data.network_tx,
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

export default NetworkActivityChart;