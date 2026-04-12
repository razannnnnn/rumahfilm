import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // CPU Usage
    const cpuBefore = os.cpus();
    await new Promise((r) => setTimeout(r, 500));
    const cpuAfter = os.cpus();

    let idle = 0, total = 0;
    cpuAfter.forEach((cpu, i) => {
      const beforeTimes = cpuBefore[i].times;
      const afterTimes = cpu.times;
      idle += afterTimes.idle - beforeTimes.idle;
      total += Object.values(afterTimes).reduce((a, b) => a + b, 0) -
               Object.values(beforeTimes).reduce((a, b) => a + b, 0);
    });
    const cpuUsage = Math.round(100 - (idle / total) * 100);

    // RAM
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsage = Math.round((usedMem / totalMem) * 100);

    // CPU Temperature
    let temperature = null;
    try {
      const { stdout: tempOut } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp");
      temperature = (parseInt(tempOut.trim()) / 1000).toFixed(1);
    } catch {
      temperature = null;
    }

    // HDD Usage
    let hdd = null;
    try {
      const { stdout: dfOut } = await execAsync("df -h /mnt/harddisk");
      const lines = dfOut.trim().split("\n");
      const parts = lines[1].trim().split(/\s+/);
      hdd = {
        total: parts[1],
        used: parts[2],
        free: parts[3],
        percent: parseInt(parts[4]),
      };
    } catch {
      hdd = null;
    }

    // Network IP
    const nets = os.networkInterfaces();
    let ipAddress = null;
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          ipAddress = net.address;
          break;
        }
      }
      if (ipAddress) break;
    }

    // Uptime
    const uptimeSeconds = os.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${hours}j ${minutes}m`;

    return NextResponse.json({
      cpu: cpuUsage,
      ram: {
        used: Math.round(usedMem / 1024 / 1024),
        total: Math.round(totalMem / 1024 / 1024),
        percent: ramUsage,
      },
      temperature,
      hdd,
      ip: ipAddress,
      uptime,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}