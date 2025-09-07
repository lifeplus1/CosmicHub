import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Centralized navigation hook to prevent routing errors
 * All navigation should go through this hook instead of direct useNavigate
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToPresets = useCallback(() => {
    navigate('/presets');
  }, [navigate]);

  const goToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const goToUpgrade = useCallback(() => {
    navigate('/upgrade');
  }, [navigate]);

  const goToTest = useCallback(() => {
    navigate('/test');
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return {
    goToHome,
    goToPresets,
    goToProfile,
    goToUpgrade,
    goToTest,
    goBack,
    goTo,
  };
};
