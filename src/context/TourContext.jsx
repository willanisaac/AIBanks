import { useState, useCallback, useMemo } from 'react';
import { TourContext } from './TourContextBase';
import { useTranslation } from '../i18n';
import * as reactJoyride from 'react-joyride';
const { STATUS } = reactJoyride;

function useTourSteps() {
  const { t } = useTranslation();

  const GLOBAL_STEPS = useMemo(() => [
    {
      target: '.tour-step-banco',
      content: t('tour.global.step1'),
      disableBeacons: true,
      placement: 'top',
    },
    {
      target: '.tour-step-mundial',
      content: t('tour.global.step2'),
      placement: 'top',
    },
    {
      target: '.tour-step-recompensas',
      content: t('tour.global.step3'),
      placement: 'top',
    }
  ], [t]);

  const SEASON_STEPS = useMemo(() => [
    {
      target: '.tour-step-balance',
      content: t('tour.season.step1'),
      disableBeacons: true,
      placement: 'bottom',
    },
    {
      target: '.tour-step-tabs',
      content: t('tour.season.step2'),
      placement: 'bottom',
    },
    {
      target: '.tour-step-bonus',
      content: t('tour.season.step3'),
      placement: 'top',
    },
    {
      target: '.tour-step-matches',
      content: t('tour.season.step4'),
      placement: 'top',
    }
  ], [t]);

  const REWARDS_STEPS = useMemo(() => [
    {
      target: '.tour-step-rewards-balance',
      content: t('tour.rewards.step1'),
      disableBeacons: true,
      placement: 'bottom',
    },
    {
      target: '.tour-step-rewards-ranking',
      content: t('tour.rewards.step2'),
      placement: 'bottom',
    },
    {
      target: '.tour-step-rewards-catalog',
      content: t('tour.rewards.step3'),
      placement: 'top',
    }
  ], [t]);

  const PROFILE_STEPS = useMemo(() => [
    {
      target: '.tour-step-profile-pts',
      content: t('tour.profile.step1'),
      disableBeacons: true,
      placement: 'bottom',
    },
    {
      target: '.tour-step-profile-stats',
      content: t('tour.profile.step2'),
      placement: 'bottom',
    },
    {
      target: '.tour-step-profile-referral',
      content: t('tour.profile.step3'),
      placement: 'top',
    },
    {
      target: '.tour-step-profile-history',
      content: t('tour.profile.step4'),
      placement: 'top',
    },
    {
      target: '.tour-step-profile-settings',
      content: t('tour.profile.step5'),
      placement: 'top',
    }
  ], [t]);

  return { GLOBAL_STEPS, SEASON_STEPS, REWARDS_STEPS, PROFILE_STEPS };
}

export function TourProvider({ children }) {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeFlow, setActiveFlow] = useState('global'); // 'global' | 'season'
  const { GLOBAL_STEPS, SEASON_STEPS, REWARDS_STEPS, PROFILE_STEPS } = useTourSteps();

  const steps = useMemo(() => {
    switch (activeFlow) {
      case 'season': return SEASON_STEPS;
      case 'rewards': return REWARDS_STEPS;
      case 'profile': return PROFILE_STEPS;
      default: return GLOBAL_STEPS;
    }
  }, [activeFlow, GLOBAL_STEPS, SEASON_STEPS, REWARDS_STEPS, PROFILE_STEPS]);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    console.log('[Tour] Callback:', { status, type, run, activeFlow });

    if (finishedStatuses.includes(status)) {
      console.log('[Tour] Finishing tour...');
      setRun(false);
      const storageKey = 
        activeFlow === 'season' ? 'hasSeenSeasonTour' : 
        activeFlow === 'rewards' ? 'hasSeenRewardsTour' :
        activeFlow === 'profile' ? 'hasSeenProfileTour' :
        'hasSeenGlobalTour';
      localStorage.setItem(storageKey, 'true');
    }
  }, [run, activeFlow]);

  const startTour = useCallback((force = false, flow = 'global') => {
    const storageKey = 
      flow === 'season' ? 'hasSeenSeasonTour' : 
      flow === 'rewards' ? 'hasSeenRewardsTour' :
      flow === 'profile' ? 'hasSeenProfileTour' :
      'hasSeenGlobalTour';
    const hasSeen = localStorage.getItem(storageKey);
    console.log('[Tour] startTour call:', { force, hasSeen, flow });
    
    if (!hasSeen || force) {
      setActiveFlow(flow);
      setTourKey(prev => prev + 1);
      setStepIndex(0);
      setRun(true);
    }
  }, []);

  return (
    <TourContext.Provider value={{ run, tourKey, steps, stepIndex, setStepIndex, handleJoyrideCallback, startTour }}>
      {children}
    </TourContext.Provider>
  );
}
