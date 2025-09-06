import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import renderer from 'react-test-renderer';
import TCMPage from '../TCM';
import PsychologyPage from '../Psychology';
import SpiritualPage from '../Spiritual';
import '../../test-utils/setupDomainPages';

function withProviders(node: React.ReactElement) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{node}</QueryClientProvider>;
}

describe('Domain page snapshots', () => {
  it('TCMPage renders consistently', () => {
    const tree = renderer.create(withProviders(<TCMPage />)).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('PsychologyPage renders consistently', () => {
    const tree = renderer.create(withProviders(<PsychologyPage />)).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('SpiritualPage renders consistently', () => {
    const tree = renderer.create(withProviders(<SpiritualPage />)).toJSON();
    expect(tree).toMatchSnapshot();
  });
});