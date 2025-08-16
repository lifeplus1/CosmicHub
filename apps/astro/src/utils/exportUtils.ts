// apps/astro/src/utils/exportUtils.ts

const serializeValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[object]';
    }
  }
  return String(val);
};

export const exportTableAsCSV = <T extends Record<string, unknown>>(data: T[], filename: string): void => {
  if (data.length === 0) return;

  const first = data[0];
  const headers = Object.keys(first).join(',');
  const csv = [
    headers,
    ...data.map((row: T) =>
      Object.values(row)
        .map((val: unknown) => `"${serializeValue(val).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const formatDataForExport = <T extends Record<string, unknown>>(data: T[], type: 'csv' | 'json' = 'csv'): string => {
  if (type === 'json') {
    return JSON.stringify(data, null, 2);
  }

  if (data.length === 0) return '';

  const first = data[0];
  const headers = Object.keys(first).join(',');
  return [
    headers,
    ...data.map((row: T) =>
      Object.values(row)
        .map((val: unknown) => `"${serializeValue(val).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
};
