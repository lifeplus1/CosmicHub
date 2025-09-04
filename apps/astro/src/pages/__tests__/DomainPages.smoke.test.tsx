import React from 'react';
import { render, screen } from '@testing-library/react';
import '../../test-utils/setupDomainPages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TCMPage from '../TCM';
import PsychologyPage from '../Psychology';
import SpiritualPage from '../Spiritual';

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('Domain standalone pages smoke tests', () => {
  it('renders TCMPage title', async () => {
    renderWithProviders(<TCMPage />);
    expect(await screen.findByText(/TCM Analysis/i)).toBeInTheDocument();
  });
  it('renders PsychologyPage title', async () => {
    renderWithProviders(<PsychologyPage />);
    expect(await screen.findByText(/Psychology Profile/i)).toBeInTheDocument();
  });
  it('renders SpiritualPage title', async () => {
    renderWithProviders(<SpiritualPage />);
    expect(await screen.findByText(/Spiritual Systems/i)).toBeInTheDocument();
  });
});
