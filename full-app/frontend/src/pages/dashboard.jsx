import { Grid, Paper, Typography } from '@mui/material';
import { useRef } from 'react';
import SystemMetricChart from './SystemMetricChart';
import NetworkActivityChart from './NetworkActivityChart';
import EChartsReact from 'echarts-for-react';

const Dashboard = () => {
  const cpuChartRef = useRef(null);
  const memoryChartRef = useRef(null);
  const diskChartRef = useRef(null);
  const networkChartRef = useRef(null);
  const loadChartRef = useRef(null);
  const processChartRef = useRef(null);

  // Mock data (replace with MongoDB fetch)
  const systemData = [
    {
      timestamp: '2025-09-28T10:00:00Z',
      cpu_usage: 65,
      memory_percent: 70,
      disk_percent: 80,
      network_rx: 120,
      network_tx: 80,
      load_avg_1min: 1.2,
      process_count: 150,
    },
    {
      timestamp: '2025-09-28T10:01:00Z',
      cpu_usage: 70,
      memory_percent: 72,
      disk_percent: 81,
      network_rx: 130,
      network_tx: 85,
      load_avg_1min: 1.3,
      process_count: 152,
    },
  ];

  const timestamps = systemData.map((d) => new Date(d.timestamp).toLocaleTimeString());

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6} xl={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            CPU Usage
          </Typography>
          <SystemMetricChart
            chartRef={cpuChartRef}
            data={{
              timestamp: timestamps,
              values: systemData.map((d) => d.cpu_usage),
              metricName: 'CPU Usage (%)',
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} xl={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            Memory Usage
          </Typography>
          <SystemMetricChart
            chartRef={memoryChartRef}
            data={{
              timestamp: timestamps,
              values: systemData.map((d) => d.memory_percent),
              metricName: 'Memory Usage (%)',
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} xl={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            Disk Usage
          </Typography>
          <SystemMetricChart
            chartRef={diskChartRef}
            data={{
              timestamp: timestamps,
              values: systemData.map((d) => d.disk_percent),
              metricName: 'Disk Usage (%)',
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} xl={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            Network Activity
          </Typography>
          <NetworkActivityChart
            chartRef={networkChartRef}
            data={{
              timestamp: timestamps,
              network_rx: systemData.map((d) => d.network_rx),
              network_tx: systemData.map((d) => d.network_tx),
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            Load Average (1 min)
          </Typography>
          <SystemMetricChart
            chartRef={loadChartRef}
            data={{
              timestamp: timestamps,
              values: systemData.map((d) => d.load_avg_1min),
              metricName: 'Load Average',
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" color="primary.dark" mb={3}>
            Process Count
          </Typography>
          <SystemMetricChart
            chartRef={processChartRef}
            data={{
              timestamp: timestamps,
              values: systemData.map((d) => d.process_count),
              metricName: 'Process Count',
            }}
            style={{ height: 200 }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;