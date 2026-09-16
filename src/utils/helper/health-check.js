const mongoose = require('mongoose');
const os = require('os');
const { performance } = require('perf_hooks');
const checkDiskSpace = require('check-disk-space').default;

// helpers
const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
const formatGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';

const formatUptime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
};

const getCpuUsage = async () => {
  const start = os.cpus();
  await new Promise((resolve) => setTimeout(resolve, 100));
  const end = os.cpus();

  let idle = 0;
  let total = 0;

  for (let i = 0; i < start.length; i++) {
    const startTimes = start[i].times;
    const endTimes = end[i].times;

    const startTotal = Object.values(startTimes).reduce((a, b) => a + b);
    const endTotal = Object.values(endTimes).reduce((a, b) => a + b);

    total += endTotal - startTotal;
    idle += endTimes.idle - startTimes.idle;
  }

  return 100 - Math.floor((idle / total) * 100);
};

exports.healthCheck = async (req, res) => {
  try {
    // MongoDB status
    const mongoStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';

    // Server uptime
    const uptime = process.uptime();

    // Memory
    const memory = process.memoryUsage();

    // CPU
    const cpuLoad = os.loadavg();

    //cpu usage
    const cpuUsage = await getCpuUsage();

    // Node info
    const nodeInfo = {
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    // Disk
    const diskPath = process.platform === 'win32' ? 'C:' : '/';
    const disk = await checkDiskSpace(diskPath);

    // Event loop delay
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const eventLoopDelay = performance.now() - start;

    // Detect health
    let status = 'UP';

    // MongoDB critical (highest priority)
    if (mongoStatus !== 'UP') {
      status = 'DOWN';
    }

    // Disk thresholds
    const freeDiskGB = disk.free / (1024 * 1024 * 1024);

    if (freeDiskGB < 5 && status !== 'DOWN') {
      status = 'CRITICAL';
    } else if (freeDiskGB < 15 && status !== 'DOWN' && status !== 'CRITICAL') {
      status = 'DEGRADED';
    } else if (freeDiskGB < 25 && status === 'UP') {
      status = 'WARNING';
    }

    const health = {
      status,
      service: 'Project-Setup',
      server: { uptime: formatUptime(uptime) },
      database: { mongo: mongoStatus },
      system: {
        memory: {
          rss: formatMB(memory.rss),
          heapTotal: formatMB(memory.heapTotal),
          heapUsed: formatMB(memory.heapUsed),
        },
        cpu: {
          usagePercent: cpuUsage,
          cores: os.cpus().length,
          load: cpuLoad,
        },
      },
      disk: {
        free: formatGB(disk.free),
        total: formatGB(disk.size),
      },
      performance: {
        eventLoopDelayMs: Number(eventLoopDelay.toFixed(2)),
      },
      node: nodeInfo,
      timestamp: new Date().toISOString(),
    };

    const statusCode = status === 'UP' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      message: error.message,
    });
  }
};
