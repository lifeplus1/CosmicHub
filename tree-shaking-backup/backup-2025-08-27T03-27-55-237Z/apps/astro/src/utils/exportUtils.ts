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
  if (
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  ) {
    return String(val);
  }
  return '[unknown]';
};

  const first = data[0];
  if (first === undefined) return; // defensive (length check above, but strict mode)
  const headers = Object.keys(first as object).join(',');
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

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

  }

  if (data.length === 0) return '';

  const first = data[0];
  if (first === undefined) return '';
  const headers = Object.keys(first as object).join(',');
  return [
    headers,
    ...data.map((row: T) =>
      Object.values(row)
        .map((val: unknown) => `"${serializeValue(val).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
};
