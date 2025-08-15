// apps/astro/src/utils/exportUtils.ts

export const exportTableAsCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const csv = [
    headers,
    ...data.map(row => 
      Object.values(row)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    )
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

export const formatDataForExport = (data: any[], type: 'csv' | 'json' = 'csv') => {
  if (type === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).join(',');
  return [
    headers,
    ...data.map(row => 
      Object.values(row)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n');
};
