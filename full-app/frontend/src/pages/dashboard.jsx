import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";

Chart.register(zoomPlugin);

const Dashboard = () => {
  const theme = useTheme();

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const overviewChartRef = useRef(null);
  const cpuChartRef = useRef(null);
  const memoryChartRef = useRef(null);
  const diskChartRef = useRef(null);
  const networkChartRef = useRef(null);
  const processChartRef = useRef(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/dashboard");
      setStats(response.data);
    } catch (err) {
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats.length === 0) return;

    const labels = stats.map((s) => new Date(s.timestamp));
    const cpuData = stats.map((s) => s.cpu_usage);
    const memoryData = stats.map((s) => s.memory_percent);
    const diskData = stats.map((s) => s.disk_percent);
    const networkData = stats.map((s) => s.network_tx + s.network_rx);

    const systemProcesses = stats.map((s) => Math.floor(s.process_count * 0.6));
    const userProcesses = stats.map((s) => Math.floor(s.process_count * 0.4));

    // Palette personnalisée
    const colors = {
      primary: "#1A3D6D",           // bleu foncé
      secondary: "#4FA1F3",         // bleu clair
      error: "#d32f2f",             // rouge foncé (inchangé)
      info: "#1976d2",              // bleu info (inchangé)
      warning: "#ffa000",           // orange (pour mémoire par ex)
      success: "#388e3c",           // vert (pour disque)
      lighterPrimary: "#1A3D6D33",  // bleu foncé transparent (20%)
      lighterSecondary: "#4FA1F333" // bleu clair transparent (20%)
    };

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
        tension: {
          duration: 1000,
          easing: "linear",
          from: 0.4,
          to: 0,
          loop: true,
        },
      },
      plugins: {
        legend: { display: true },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
          pan: {
            enabled: true,
            mode: "x",
            modifierKey: "ctrl",
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            tooltipFormat: "PPpp",
            displayFormats: {
              second: "HH:mm:ss",
              minute: "HH:mm",
              hour: "HH:mm",
            },
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 20,
          },
        },
        y: { beginAtZero: true },
      },
    };

    [
      overviewChartRef,
      cpuChartRef,
      memoryChartRef,
      diskChartRef,
      networkChartRef,
      processChartRef,
    ].forEach((ref) => {
      if (ref.current && ref.current.chart) ref.current.chart.destroy();
    });

    overviewChartRef.current.chart = new Chart(overviewChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "System Overview (%)",
            data: stats.map(
              (s) => (s.cpu_usage + s.memory_percent + s.disk_percent) / 3
            ),
            borderColor: colors.primary,
            backgroundColor: colors.lighterPrimary,
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: chartDefaults,
    });

    cpuChartRef.current.chart = new Chart(cpuChartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "CPU Usage",
            data: cpuData,
            backgroundColor: colors.primary,
            borderRadius: 4,
          },
        ],
      },
      options: chartDefaults,
    });

    const donutPieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeInOutQuart" },
      plugins: {
        legend: { display: true },
        zoom: { zoom: { enabled: false }, pan: { enabled: false } },
      },
    };

    memoryChartRef.current.chart = new Chart(memoryChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Used", "Free"],
        datasets: [
          {
            data: [memoryData.at(-1), 100 - memoryData.at(-1)],
            backgroundColor: [colors.secondary, colors.lighterSecondary],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: donutPieOptions,
    });

    diskChartRef.current.chart = new Chart(diskChartRef.current, {
      type: "pie",
      data: {
        labels: ["Used", "Free"],
        datasets: [
          {
            data: [diskData.at(-1), 100 - diskData.at(-1)],
            backgroundColor: [colors.primary, colors.lighterPrimary],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: donutPieOptions,
    });

    networkChartRef.current.chart = new Chart(networkChartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Network Traffic (Tx+Rx)",
            data: networkData,
            borderColor: colors.secondary,
            backgroundColor: colors.lighterSecondary,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: chartDefaults,
    });

    processChartRef.current.chart = new Chart(processChartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "System Processes",
            data: systemProcesses,
            backgroundColor: colors.primary,
            borderRadius: 4,
          },
          {
            label: "User Processes",
            data: userProcesses,
            backgroundColor: colors.secondary,
            borderRadius: 4,
          },
        ],
      },
      options: {
        ...chartDefaults,
        scales: {
          x: {
            stacked: true,
            type: "time",
            time: chartDefaults.scales.x.time,
            ticks: chartDefaults.scales.x.ticks,
          },
          y: { stacked: true, beginAtZero: true },
        },
      },
    });
  }, [stats, theme.palette]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="linear-gradient(135deg, #ece9e6 0%, #ffffff 100%)"
      minHeight="100vh"
      p={3}
    >
      <Box maxWidth={1200} width="100%">
        <Typography
          variant="h4"
          mb={3}
          fontWeight="bold"
          color="primary.main"
          textAlign="center"
          letterSpacing={2}
        >
          Dashboard Système
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="System Overview" />
              <CardContent sx={{ height: 320 }}>
                <canvas ref={overviewChartRef} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="CPU Usage" />
              <CardContent sx={{ height: 280 }}>
                <canvas ref={cpuChartRef} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="Memory Usage" />
              <CardContent sx={{ height: 280 }}>
                <canvas ref={memoryChartRef} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="Disk Usage" />
              <CardContent sx={{ height: 280 }}>
                <canvas ref={diskChartRef} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="Network Traffic" />
              <CardContent sx={{ height: 280 }}>
                <canvas ref={networkChartRef} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={8} sx={{ borderRadius: 3 }}>
              <CardHeader title="Running Processes (Stacked)" />
              <CardContent sx={{ height: 280 }}>
                <canvas ref={processChartRef} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
