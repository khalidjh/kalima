import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import AgeGroupSelect from './AgeGroupSelect';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  useUserStore.getState().setLearnLang('ar');
  mocks.navigate.mockReset();
  mocks.updateProfile.mockReset();
  mocks.updateProfile.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AgeGroupSelect', () => {
  it('persists choice and navigates to /hub', async () => {
    render(<MemoryRouter><AgeGroupSelect /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('age-6-8'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { age_group: '6-8' });
    expect(useUserStore.getState().ageGroup).toBe('6-8');
    expect(mocks.navigate).toHaveBeenCalledWith('/hub', { replace: true });
  });

  it('reverts local state and shows error when updateProfile rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.updateProfile.mockRejectedValue(new Error('boom'));
    render(<MemoryRouter><AgeGroupSelect /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('age-6-8'));
    await waitFor(() => {
      expect(screen.getByTestId('age-group-error')).toBeInTheDocument();
    });
    expect(useUserStore.getState().ageGroup).toBeNull();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
