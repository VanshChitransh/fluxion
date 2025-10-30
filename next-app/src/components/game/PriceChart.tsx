'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
import { PricePoint } from '@/services/priceService';

interface PriceChartProps {
  data: PricePoint[];
  height?: number;
  showGrid?: boolean;
  showTimeScale?: boolean;
  lineColor?: string;
  backgroundColor?: string;
}

export default function PriceChart({
  data,
  height = 400,
  showGrid = true,
  showTimeScale = true,
  lineColor = '#a855f7', // purple-500
  backgroundColor = 'transparent',
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: backgroundColor },
        textColor: '#d1d5db', // gray-300
      },
      grid: {
        vertLines: { visible: showGrid, color: '#374151' }, // gray-700
        horzLines: { visible: showGrid, color: '#374151' },
      },
      timeScale: {
        visible: showTimeScale,
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#4b5563', // gray-600
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 2, // Dashed
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 2,
        },
      },
    });

    // Create line series
    const lineSeries = chart.addLineSeries({
      color: lineColor,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      lastValueVisible: true,
      priceLineVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height, showGrid, showTimeScale, lineColor, backgroundColor]);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const chartData: LineData[] = data.map((point) => ({
      time: Math.floor(point.timestamp / 1000) as any, // Convert to seconds
      value: point.price,
    }));

    seriesRef.current.setData(chartData);

    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full relative"
      style={{ height: `${height}px` }}
    />
  );
}

