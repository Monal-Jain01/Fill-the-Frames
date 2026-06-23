import type { Layout, PlotRelayoutEvent } from 'plotly.js';

export function syncPlotlyRelayout(
  eventData: Readonly<PlotRelayoutEvent>,
  setLayout: React.Dispatch<React.SetStateAction<Partial<Layout>>>
) {
  const ev = eventData as Record<string, unknown>;
  const newLayout: Partial<Layout> = {};
  let shouldUpdate = false;

  // Handle flat keys like 'xaxis.range[0]' and object keys like 'xaxis.range'
  if (ev['xaxis.autorange'] === true) {
    newLayout.xaxis = { autorange: true };
    shouldUpdate = true;
  } else if (ev['xaxis.range[0]'] !== undefined && ev['xaxis.range[1]'] !== undefined) {
    newLayout.xaxis = {
      range: [ev['xaxis.range[0]'] as number, ev['xaxis.range[1]'] as number],
    };
    shouldUpdate = true;
  } else if (ev['xaxis.range'] !== undefined) {
    newLayout.xaxis = { range: ev['xaxis.range'] as [number, number] };
    shouldUpdate = true;
  }

  if (ev['yaxis.autorange'] === true) {
    newLayout.yaxis = { autorange: true };
    shouldUpdate = true;
  } else if (ev['yaxis.range[0]'] !== undefined && ev['yaxis.range[1]'] !== undefined) {
    newLayout.yaxis = {
      range: [ev['yaxis.range[0]'] as number, ev['yaxis.range[1]'] as number],
    };
    shouldUpdate = true;
  } else if (ev['yaxis.range'] !== undefined) {
    newLayout.yaxis = { range: ev['yaxis.range'] as [number, number] };
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    setLayout(prev => ({ ...prev, ...newLayout }));
  }
}
