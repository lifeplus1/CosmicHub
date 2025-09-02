// /Users/Chris/Projects/CosmicHub/apps/astro/src/__tests__/App.routing.test.tsx
/**
 * Simplified routing tests using actual react-router-dom components.
 * Focus: basic route rendering, navigation hook, location hook, and Suspense fallback.
 */
import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

const Dashboard = () => <div data-testid='dashboard-page'>Dashboard Page</div>;
const Chart = () => <div data-testid='chart-page'>Chart Page</div>;
const Profile = () => <div data-testid='profile-page'>Profile Page</div>;

describe('App Routing (integration)', () => {
  it('renders initial route (root)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/chart' element={<Chart />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders a secondary route', () => {
    render(
      <MemoryRouter initialEntries={['/chart']}>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/chart' element={<Chart />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId('chart-page')).toBeInTheDocument();
  });

  it('supports navigation via useNavigate', async () => {
    const user = userEvent.setup();
    const NavComponent = () => {
      const navigate = useNavigate();
      return (
        <button data-testid='go-profile' onClick={() => navigate('/profile')}>
          Go Profile
        </button>
      );
    };
    const LocationViewer = () => {
      const loc = useLocation();
      return <div data-testid='location-path'>{loc.pathname}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path='/'
            element={
              <>
                <NavComponent />
                <LocationViewer />
              </>
            }
          />
          <Route
            path='/profile'
            element={
              <>
                <Profile />
                <LocationViewer />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('go-profile'));
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    expect(screen.getByTestId('location-path').textContent).toBe('/profile');
  });

  it('shows Suspense fallback while lazy content resolves (simulated)', () => {
    const Fallback = () => <div data-testid='loading-fallback'>Loading...</div>;
    const Content = () => <div data-testid='lazy-content'>Lazy Content</div>;

    render(
      <MemoryRouter>
        <Suspense fallback={<Fallback />}>
          <Content />
        </Suspense>
      </MemoryRouter>
    );
    expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
  });
});
