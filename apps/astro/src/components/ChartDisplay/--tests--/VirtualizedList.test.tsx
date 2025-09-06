import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualizedList } from '../VirtualizedList';

interface Item {
  id: number;
}

describe('VirtualizedList', () => {
  const items: Item[] = Array.from({ length: 200 }, (_, i) => ({ id: i }));

  it('renders only a window of items', () => {
    render(
      <VirtualizedList
        items={items}
        itemHeight={20}
        height={100}
        width={300}
        ariaLabel='Test list'
        render={item => <div data-testid='row'>Row {item.id}</div>}
      />
    );
    const rows = screen.getAllByTestId('row');
    // Expect far fewer than total 200
    expect(rows.length).toBeLessThan(60);
  });
});
