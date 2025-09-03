# 🔍 Accessibility Audit Report - A11Y-030

> **Generated:** 2025-09-02T22:28:34.069Z  
> **Status:** ⚠️ ISSUES FOUND  
> **WCAG Level:** AA

## 📊 Summary

| Severity  | Count   | Status    |
| --------- | ------- | --------- |
| Critical  | 109     | ❌        |
| Major     | 341     | ⚠️        |
| Minor     | 2       | ℹ️        |
| **Total** | **452** | ⚠️ REVIEW |

## 🎯 WCAG 2.1 AA Compliance Status

### ⚠️ WCAG 2.1.1: Click handler missing keyboard support (343 issues)

- **apps/astro/src/components/AI001/AI001Dashboard.tsx:85** - Click handler missing keyboard support
- **apps/astro/src/components/AI001/AI001Dashboard.tsx:124** - Click handler missing keyboard
  support
- **apps/astro/src/components/AI001/AI001Dashboard.tsx:459** - Click handler missing keyboard
  support
- **apps/astro/src/components/AIChat.tsx:218** - Click handler missing keyboard support
- **apps/astro/src/components/AIChat.tsx:224** - Click handler missing keyboard support
- **apps/astro/src/components/AIChat.tsx:247** - Click handler missing keyboard support
- **apps/astro/src/components/AIChat.tsx:326** - Click handler missing keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationCard.tsx:134** - Click handler missing
  keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationDisplay.tsx:145** - Click handler
  missing keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:736** - Click handler missing
  keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:747** - Click handler missing
  keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:838** - Click handler missing
  keyboard support
- **apps/astro/src/components/BlogComments.tsx:243** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:257** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:299** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:383** - Click handler missing keyboard support
- **apps/astro/src/components/ChartCalculator.tsx:267** - Click handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:180** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:106** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:112** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:124** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:58** - Element with tabIndex={-1}
  may not be keyboard accessible
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:534** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:609** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:616** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:707** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:717** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:1205** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartHeader.tsx:43** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartHeader.tsx:53** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartHeader.tsx:63** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartHeader.tsx:73** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/EnhancedChartWrapper.tsx:190** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:40** - Click handler missing
  keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/BirthSummaryHeader.a11y.test.tsx:18** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/BirthSummaryHeader.a11y.test.tsx:24** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/BirthSummaryHeader.a11y.test.tsx:30** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/BirthSummaryHeader.a11y.test.tsx:30** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/ChartDisplay.a11y.test.tsx:126** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/ChartDisplay.a11y.test.tsx:127** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/**tests**/ChartDisplay.a11y.test.tsx:127** - Click
  handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/tables/EnhancedAspectTable.tsx:59** - Click handler
  missing keyboard support
- **apps/astro/src/components/ChartPreferences.tsx:370** - Click handler missing keyboard support
- **apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:426** - Click handler
  missing keyboard support
- **apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:486** - Click handler
  missing keyboard support
- **apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:492** - Click handler
  missing keyboard support
- **apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:554** - Click handler
  missing keyboard support
- **apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:560** - Click handler
  missing keyboard support
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:323** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:452** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:524** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:608** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:611** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:91** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:268** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:281** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:290** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:299** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:196** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:331** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:339** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:451** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:493** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:540** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:175** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:210** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:243** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:272** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:308** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:325** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:334** - Click handler missing
  keyboard support
- **apps/astro/src/components/EducationPlatform/ProgressTracker.tsx:355** - Click handler missing
  keyboard support
- **apps/astro/src/components/EphemerisPerformanceDashboard.tsx:36** - Click handler missing
  keyboard support
- **apps/astro/src/components/EphemerisPerformanceDashboard.tsx:43** - Click handler missing
  keyboard support
- **apps/astro/src/components/ErrorBoundary.stories.tsx:27** - Click handler missing keyboard
  support
- **apps/astro/src/components/ErrorBoundary.tsx:98** - Click handler missing keyboard support
- **apps/astro/src/components/ErrorBoundary.tsx:104** - Click handler missing keyboard support
- **apps/astro/src/components/ErrorTestComponent.tsx:31** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:257** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:269** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:387** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:397** - Click handler missing keyboard support
- **apps/astro/src/components/GeneKeysChart/ActivationSequenceTab.tsx:60** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/CoreQuartetTab.tsx:76** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeyDetails.tsx:27** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:30** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:224** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:235** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:272** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:34** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:106** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/PearlSequenceTab.tsx:60** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/VenusSequenceTab.tsx:108** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:364** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:414** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:465** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:39** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:154** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:51** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:118** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:171** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignGeneKeys.tsx:118** - Click handler missing keyboard support
- **apps/astro/src/components/HumanDesignGeneKeys.tsx:368** - Click handler missing keyboard support
- **apps/astro/src/components/Login.tsx:114** - Click handler missing keyboard support
- **apps/astro/src/components/MockLoginPanel.tsx:173** - Click handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:166** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:177** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:188** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:199** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:210** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/MultiSystemChartDisplay.tsx:41** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:5** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:10** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:25** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:25** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:241** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:269** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:286** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:301** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:311** - Click handler
  missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:221** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:244** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:255** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:266** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:277** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/EnneagramDetailView.tsx:47** -
  Click handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/MBTIDetailView.tsx:44** -
  Click handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/PsychologySynthesisView.tsx:38** -
  Click handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/ResponsiveComponents.tsx:30** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:221** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:231** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:241** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:251** - Click handler missing
  keyboard support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:217** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:279** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:290** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:300** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:311** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:321** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:332** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:341** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/TCMChart.tsx:352** - Click handler missing keyboard
  support
- **apps/astro/src/components/MultiSystemChart/**tests**/PsychologyChart.test.tsx:31** - Click
  handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/**tests**/PsychologyChart.test.tsx:36** - Click
  handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/**tests**/PsychologyChart.test.tsx:41** - Click
  handler missing keyboard support
- **apps/astro/src/components/MultiSystemChart/**tests**/PsychologyChart.test.tsx:41** - Click
  handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:78** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:156** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:426** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:439** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:474** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:496** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:519** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:544** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:564** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:576** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:598** - Click handler missing keyboard support
- **apps/astro/src/components/NotificationSettings.tsx:201** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:210** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:238** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:248** - Click handler missing keyboard
  support
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:365** - Click handler
  missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:292** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:299** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:307** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:325** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:363** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:369** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:426** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:432** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:454** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineIndicator.tsx:182** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:204** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:346** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:353** - Click handler missing keyboard support
- **apps/astro/src/components/PremiumFeaturesDashboard.tsx:25** - Click handler missing keyboard
  support
- **apps/astro/src/components/PricingPage.tsx:399** - Click handler missing keyboard support
- **apps/astro/src/components/SimpleBirthForm.tsx:363** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:141** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:174** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:197** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:209** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:234** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:249** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:259** - Click handler missing keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:96** - Click handler missing
  keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:164** - Click handler missing
  keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:170** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/EphemerisChart.tsx:130** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/EphemerisChartWrapper.tsx:38** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:53** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:63** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:189** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:199** - Click handler missing keyboard
  support
- **apps/astro/src/components/UnifiedBirthInput.tsx:224** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:376** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:390** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:457** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:93** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:100** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:107** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:120** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradePrompt.tsx:150** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradePrompt.tsx:157** - Click handler missing keyboard support
- **apps/astro/src/components/UserProfile.tsx:381** - Click handler missing keyboard support
- **apps/astro/src/components/UserProfile.tsx:700** - Click handler missing keyboard support
- **apps/astro/src/components/common/VirtualizedDataTable.tsx:30** - Click handler missing keyboard
  support
- **apps/astro/src/components/common/VirtualizedDataTable.tsx:143** - Click handler missing keyboard
  support
- **apps/healwave/src/components/BinauralSettings.tsx:185** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:196** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:499** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:518** - Click handler missing keyboard support
- **apps/healwave/src/components/ChartPreferences.tsx:211** - Click handler missing keyboard support
- **apps/healwave/src/components/ErrorBoundary.tsx:65** - Click handler missing keyboard support
- **apps/healwave/src/components/FrequencyControls.tsx:177** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyControls.tsx:203** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyControls.tsx:220** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyGenerator.tsx:258** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyGenerator.tsx:269** - Click handler missing keyboard
  support
- **apps/healwave/src/components/HealWaveErrorTestComponent.tsx:30** - Click handler missing
  keyboard support
- **apps/healwave/src/components/Login.tsx:24** - Click handler missing keyboard support
- **apps/healwave/src/components/Login.tsx:129** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:102** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:108** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:246** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:276** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:347** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:376** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:408** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:526** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:537** - Click handler missing keyboard support
- **apps/healwave/src/components/PricingPage.tsx:121** - Click handler missing keyboard support
- **apps/healwave/src/components/Signup.tsx:88** - Click handler missing keyboard support
- **apps/healwave/src/components/Signup.tsx:628** - Click handler missing keyboard support
- **apps/healwave/src/components/Subscribe.tsx:66** - Click handler missing keyboard support
- **apps/healwave/src/components/UserProfile.tsx:230** - Click handler missing keyboard support
- **packages/ui/src/components/Accordion.tsx:95** - Click handler missing keyboard support
- **packages/ui/src/components/Alert.tsx:42** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:249** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:271** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:285** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:295** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:305** - Click handler missing keyboard support
- **packages/ui/src/components/AnalyticsDashboard.tsx:315** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:84** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:96** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:139** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:139** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:175** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:184** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:230** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystem.tsx:230** - Click handler missing keyboard support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:84** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:96** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:139** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:139** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:175** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:184** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:230** - Click handler missing keyboard
  support
- **packages/ui/src/components/AnimationSystemCleaned.tsx:230** - Click handler missing keyboard
  support
- **packages/ui/src/components/Button.tsx:15** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:53** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:74** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:74** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:92** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:144** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:24** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:236** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:243** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:252** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:252** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:304** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedChartDisplay.tsx:262** - Click handler missing keyboard
  support
- **packages/ui/src/components/ErrorBoundaries.tsx:126** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:132** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:191** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:197** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:253** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:270** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:276** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:337** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:354** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:360** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:342** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:348** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:357** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorHandling.tsx:230** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorHandling.tsx:254** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorHandling.tsx:275** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorHandling.tsx:299** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorHandling.tsx:437** - Click handler missing keyboard support
- **packages/ui/src/components/MicroInteractions.tsx:67** - Click handler missing keyboard support
- **packages/ui/src/components/MicroInteractions.tsx:101** - Click handler missing keyboard support
- **packages/ui/src/components/MicroInteractions.tsx:111** - Click handler missing keyboard support
- **packages/ui/src/components/MicroInteractions.tsx:146** - Click handler missing keyboard support
- **packages/ui/src/components/MicroInteractions.tsx:166** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:282** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:306** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:342** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:375** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:425** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:437** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:438** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:441** - Click handler missing keyboard support
- **packages/ui/src/components/MobileResponsive.tsx:473** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:50** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:63** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:78** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:59** - Element with tabIndex={-1} may not be keyboard
  accessible
- **packages/ui/src/components/Tabs.tsx:80** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:27** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:88** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:88** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:117** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:123** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:129** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:156** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:163** - Click handler missing keyboard support
- **packages/ui/src/components/UX002Demo.tsx:229** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:93** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:109** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:198** - Click handler missing keyboard support
- **packages/ui/src/components/UserFeedback.tsx:18** - Click handler missing keyboard support
- **packages/ui/src/components/UserFeedback.tsx:290** - Click handler missing keyboard support
- **packages/ui/src/components/UserFeedback.tsx:290** - Click handler missing keyboard support
- **packages/ui/src/components/UserFeedback.tsx:305** - Click handler missing keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:146** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:168** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:193** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:588** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:41** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:42** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:69** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:69** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:149** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:276** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:294** - Click handler missing
  keyboard support
- **packages/ui/src/components/modals/ChartModal.tsx:29** - Click handler missing keyboard support
- **packages/ui/src/components/modals/ChartModal.tsx:47** - Click handler missing keyboard support
- **packages/ui/src/components/modals/FrequencyPlayerModal.tsx:22** - Click handler missing keyboard
  support
- **packages/ui/src/components/modals/ProfileModal.tsx:22** - Click handler missing keyboard support
- **packages/ui/src/components/modals/SettingsModal.tsx:22** - Click handler missing keyboard
  support
- **packages/ui/src/components/modals/ShareModal.tsx:17** - Click handler missing keyboard support

### ❌ WCAG 1.3.1: Input missing label or aria-label (109 issues)

- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:500** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:545** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:585** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:625** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:685** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:791** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:806** - Input missing label or
  aria-label
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:821** - Input missing label or
  aria-label
- **apps/astro/src/components/BlogSubscription.tsx:91** - Input missing label or aria-label
- **apps/astro/src/components/BlogSubscription.tsx:153** - Input missing label or aria-label
- **apps/astro/src/components/BlogSubscription.tsx:217** - Input missing label or aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:227** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:243** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:274** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:295** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:316** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:346** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:361** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:385** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:400** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:424** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:439** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:454** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:469** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:496** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:524** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ChartHeader.tsx:26** - Input missing label or aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:95** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:111** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:149** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:171** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:193** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:214** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:229** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:269** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:284** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:297** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:312** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:327** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:340** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:353** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:366** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:385** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:400** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:442** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:457** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:484** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:499** - Input missing label or
  aria-label
- **apps/astro/src/components/ChartDisplay/**tests**/ChartDisplay.test.tsx:183** - Input missing
  label or aria-label
- **apps/astro/src/components/ChartPreferences.tsx:347** - Input missing label or aria-label
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:299** - Input missing label or
  aria-label
- **apps/astro/src/components/EducationPlatform/CommunityHub.tsx:571** - Input missing label or
  aria-label
- **apps/astro/src/components/Login.tsx:69** - Input missing label or aria-label
- **apps/astro/src/components/Login.tsx:86** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:282** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:306** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:330** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:354** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:380** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:405** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:432** - Input missing label or aria-label
- **apps/astro/src/components/NotificationSettings.tsx:455** - Input missing label or aria-label
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:305** - Input missing
  label or aria-label
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:319** - Input missing
  label or aria-label
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:333** - Input missing
  label or aria-label
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:349** - Input missing
  label or aria-label
- **apps/astro/src/components/OfflineChartDemo.tsx:351** - Input missing label or aria-label
- **apps/astro/src/components/PricingPage.tsx:298** - Input missing label or aria-label
- **apps/astro/src/components/SimpleBirthForm.tsx:267** - Input missing label or aria-label
- **apps/astro/src/components/SimpleBirthForm.tsx:302** - Input missing label or aria-label
- **apps/astro/src/components/SimpleBirthForm.tsx:340** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:251** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:295** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:318** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:337** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:359** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:405** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:422** - Input missing label or aria-label
- **apps/astro/src/components/UnifiedBirthInput.tsx:439** - Input missing label or aria-label
- **apps/astro/src/components/common/VirtualizedDataTable.tsx:125** - Input missing label or
  aria-label
- **apps/healwave/src/components/ChartPreferences.tsx:176** - Input missing label or aria-label
- **apps/healwave/src/components/ChartPreferences.tsx:192** - Input missing label or aria-label
- **apps/healwave/src/components/FrequencyControls.tsx:212** - Input missing label or aria-label
- **apps/healwave/src/components/FrequencyGenerator.tsx:149** - Input missing label or aria-label
- **apps/healwave/src/components/Login.tsx:78** - Input missing label or aria-label
- **apps/healwave/src/components/Login.tsx:97** - Input missing label or aria-label
- **apps/healwave/src/components/PresetSelector.tsx:442** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:228** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:250** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:273** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:296** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:318** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:347** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:366** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:494** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:510** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:526** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:542** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:565** - Input missing label or aria-label
- **apps/healwave/src/components/Signup.tsx:583** - Input missing label or aria-label
- **packages/ui/src/components/Input.tsx:9** - Input missing label or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:192** - Input missing label or
  aria-label
- **packages/ui/src/components/calculators/EphemerisCalculator.tsx:30** - Input missing label or
  aria-label
- **packages/ui/src/components/calculators/FrequencyCalculator.tsx:30** - Input missing label or
  aria-label
- **packages/ui/src/components/calculators/GeneKeysCalculator.tsx:30** - Input missing label or
  aria-label
- **packages/ui/src/components/forms/BirthDataForm.tsx:45** - Input missing label or aria-label
- **packages/ui/src/components/forms/BirthDataForm.tsx:59** - Input missing label or aria-label
- **packages/ui/src/components/forms/BirthDataForm.tsx:76** - Input missing label or aria-label
- **packages/ui/src/components/forms/FrequencyForm.tsx:39** - Input missing label or aria-label

## 🔧 Implementation Status

- ✅ Accessibility testing infrastructure
- ✅ Custom accessibility components (VisuallyHidden)
- ✅ Automated axe-core integration
- ❌ Critical accessibility issues resolved
- ⚠️ Major accessibility issues resolved
- ℹ️ Minor accessibility improvements completed

## 📋 Detailed Issues

### 🚨 CRITICAL Issues

#### 1. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:500`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 2. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:545`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 3. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:585`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 4. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:625`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 5. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:685`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 6. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:791`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 7. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:806`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 8. Input missing label or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:821`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 9. Input missing label or aria-label

- **File:** `apps/astro/src/components/BlogSubscription.tsx:91`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 10. Input missing label or aria-label

- **File:** `apps/astro/src/components/BlogSubscription.tsx:153`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 11. Input missing label or aria-label

- **File:** `apps/astro/src/components/BlogSubscription.tsx:217`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 12. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:227`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 13. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:243`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 14. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:274`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 15. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:295`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 16. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:316`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 17. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:346`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 18. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:361`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 19. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:385`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 20. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:400`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 21. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:424`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 22. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:439`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 23. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:454`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 24. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:469`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 25. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:496`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 26. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:524`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 27. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ChartHeader.tsx:26`
- **WCAG Rule:** 1.3.1
- **Code:** `<Input`

#### 28. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:95`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 29. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:111`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 30. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:149`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 31. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:171`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 32. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:193`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 33. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:214`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 34. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:229`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 35. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:269`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 36. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:284`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 37. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:297`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 38. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:312`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 39. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:327`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 40. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:340`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 41. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:353`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 42. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:366`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 43. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:385`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 44. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:400`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 45. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:442`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 46. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:457`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 47. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:484`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 48. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:499`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 49. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/ChartDisplay.test.tsx:183`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 50. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartPreferences.tsx:347`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 51. Input missing label or aria-label

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:299`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 52. Input missing label or aria-label

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:571`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 53. Input missing label or aria-label

- **File:** `apps/astro/src/components/Login.tsx:69`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 54. Input missing label or aria-label

- **File:** `apps/astro/src/components/Login.tsx:86`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 55. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:282`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 56. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:306`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 57. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:330`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 58. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:354`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 59. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:380`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 60. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:405`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 61. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:432`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 62. Input missing label or aria-label

- **File:** `apps/astro/src/components/NotificationSettings.tsx:455`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 63. Input missing label or aria-label

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:305`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 64. Input missing label or aria-label

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:319`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 65. Input missing label or aria-label

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:333`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 66. Input missing label or aria-label

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:349`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 67. Input missing label or aria-label

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:351`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 68. Input missing label or aria-label

- **File:** `apps/astro/src/components/PricingPage.tsx:298`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 69. Input missing label or aria-label

- **File:** `apps/astro/src/components/SimpleBirthForm.tsx:267`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 70. Input missing label or aria-label

- **File:** `apps/astro/src/components/SimpleBirthForm.tsx:302`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 71. Input missing label or aria-label

- **File:** `apps/astro/src/components/SimpleBirthForm.tsx:340`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 72. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:251`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 73. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:295`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 74. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:318`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 75. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:337`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 76. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:359`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 77. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:405`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 78. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:422`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 79. Input missing label or aria-label

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:439`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 80. Input missing label or aria-label

- **File:** `apps/astro/src/components/common/VirtualizedDataTable.tsx:125`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 81. Input missing label or aria-label

- **File:** `apps/healwave/src/components/ChartPreferences.tsx:176`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 82. Input missing label or aria-label

- **File:** `apps/healwave/src/components/ChartPreferences.tsx:192`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 83. Input missing label or aria-label

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:212`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 84. Input missing label or aria-label

- **File:** `apps/healwave/src/components/FrequencyGenerator.tsx:149`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 85. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Login.tsx:78`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 86. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Login.tsx:97`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 87. Input missing label or aria-label

- **File:** `apps/healwave/src/components/PresetSelector.tsx:442`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 88. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:228`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 89. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:250`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 90. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:273`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 91. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:296`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 92. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:318`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 93. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:347`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 94. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:366`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 95. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:494`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 96. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:510`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 97. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:526`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 98. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:542`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 99. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:565`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 100. Input missing label or aria-label

- **File:** `apps/healwave/src/components/Signup.tsx:583`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 101. Input missing label or aria-label

- **File:** `packages/ui/src/components/Input.tsx:9`
- **WCAG Rule:** 1.3.1
- **Code:** `<Input`

#### 102. Input missing label or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:192`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 103. Input missing label or aria-label

- **File:** `packages/ui/src/components/calculators/EphemerisCalculator.tsx:30`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 104. Input missing label or aria-label

- **File:** `packages/ui/src/components/calculators/FrequencyCalculator.tsx:30`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 105. Input missing label or aria-label

- **File:** `packages/ui/src/components/calculators/GeneKeysCalculator.tsx:30`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 106. Input missing label or aria-label

- **File:** `packages/ui/src/components/forms/BirthDataForm.tsx:45`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 107. Input missing label or aria-label

- **File:** `packages/ui/src/components/forms/BirthDataForm.tsx:59`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 108. Input missing label or aria-label

- **File:** `packages/ui/src/components/forms/BirthDataForm.tsx:76`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

#### 109. Input missing label or aria-label

- **File:** `packages/ui/src/components/forms/FrequencyForm.tsx:39`
- **WCAG Rule:** 1.3.1
- **Code:** `<input`

### ⚠️ MAJOR Issues

#### 1. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AI001/AI001Dashboard.tsx:85`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 2. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AI001/AI001Dashboard.tsx:124`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 3. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AI001/AI001Dashboard.tsx:459`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 4. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIChat.tsx:218`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 5. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIChat.tsx:224`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 6. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIChat.tsx:247`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 7. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIChat.tsx:326`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 8. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationCard.tsx:134`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 9. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationDisplay.tsx:145`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 10. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:736`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 11. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:747`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 12. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:838`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 13. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:243`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 14. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:257`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 15. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:299`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 16. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:383`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 17. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartCalculator.tsx:267`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 18. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/AstrologySettings.tsx:180`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 19. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:106`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 20. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:112`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 21. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:124`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 22. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:534`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 23. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:609`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 24. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:616`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 25. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:707`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 26. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:717`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 27. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:1205`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 28. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartHeader.tsx:43`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 29. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartHeader.tsx:53`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 30. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartHeader.tsx:63`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 31. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartHeader.tsx:73`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 32. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/EnhancedChartWrapper.tsx:190`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 33. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ViewSpecificSettings.tsx:40`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 34. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/BirthSummaryHeader.a11y.test.tsx:18`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 35. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/BirthSummaryHeader.a11y.test.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 36. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/BirthSummaryHeader.a11y.test.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 37. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/BirthSummaryHeader.a11y.test.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 38. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/ChartDisplay.a11y.test.tsx:126`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 39. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/ChartDisplay.a11y.test.tsx:127`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 40. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/__tests__/ChartDisplay.a11y.test.tsx:127`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 41. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/tables/EnhancedAspectTable.tsx:59`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 42. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartPreferences.tsx:370`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 43. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:426`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 44. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:486`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 45. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:492`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 46. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:554`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 47. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CertificationCenter.tsx:560`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 48. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:323`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 49. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:452`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 50. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:524`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 51. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:608`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 52. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/CommunityHub.tsx:611`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 53. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:91`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 54. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:268`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 55. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:281`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 56. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:290`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 57. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/EducationDashboard.tsx:299`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 58. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:196`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 59. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:331`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 60. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:339`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 61. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:451`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 62. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:493`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 63. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/LearningPathViewer.tsx:540`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 64. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:175`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 65. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:210`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 66. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:243`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 67. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:272`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 68. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:308`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 69. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:325`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 70. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/OnboardingFlow.tsx:334`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 71. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EducationPlatform/ProgressTracker.tsx:355`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 72. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EphemerisPerformanceDashboard.tsx:36`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 73. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EphemerisPerformanceDashboard.tsx:43`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 74. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.stories.tsx:27`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 75. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.tsx:98`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 76. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.tsx:104`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 77. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorTestComponent.tsx:31`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 78. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:257`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 79. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:269`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 80. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:387`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 81. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:397`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 82. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/ActivationSequenceTab.tsx:60`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 83. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/CoreQuartetTab.tsx:76`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 84. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeyDetails.tsx:27`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 85. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 86. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:224`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 87. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:235`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 88. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:272`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 89. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:34`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 90. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:106`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 91. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/PearlSequenceTab.tsx:60`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 92. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/VenusSequenceTab.tsx:108`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 93. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:364`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 94. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:414`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 95. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:465`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 96. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:39`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 97. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:154`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 98. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:51`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 99. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:118`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 100. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:171`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 101. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignGeneKeys.tsx:118`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 102. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignGeneKeys.tsx:368`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 103. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Login.tsx:114`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 104. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MockLoginPanel.tsx:173`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 105. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:166`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 106. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:177`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 107. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:188`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 108. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:199`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 109. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/AyurvedaChart.tsx:210`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 110. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/MultiSystemChartDisplay.tsx:41`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 111. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:5`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 112. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:10`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 113. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:25`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 114. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:25`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 115. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:241`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 116. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:269`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 117. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:286`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 118. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:301`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 119. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PersonalityAssessment.tsx:311`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 120. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:221`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 121. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:244`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 122. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:255`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 123. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:266`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 124. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/PsychologyChart.tsx:277`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 125. Click handler missing keyboard support

- **File:**
  `apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/EnneagramDetailView.tsx:47`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 126. Click handler missing keyboard support

- **File:**
  `apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/MBTIDetailView.tsx:44`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 127. Click handler missing keyboard support

- **File:**
  `apps/astro/src/components/MultiSystemChart/PsychologyChartComponents/PsychologySynthesisView.tsx:38`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 128. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/ResponsiveComponents.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 129. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:221`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 130. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:231`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 131. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:241`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 132. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/SpiritualChart.tsx:251`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 133. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:217`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 134. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:279`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 135. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:290`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 136. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:300`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 137. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:311`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 138. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:321`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 139. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:332`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 140. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:341`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 141. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/TCMChart.tsx:352`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 142. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx:31`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 143. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx:36`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 144. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx:41`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 145. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx:41`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 146. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:78`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 147. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:156`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 148. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:426`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 149. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:439`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 150. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:474`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 151. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:496`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 152. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:519`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 153. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:544`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 154. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:564`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 155. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:576`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 156. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:598`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 157. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:201`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 158. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:210`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 159. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:238`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 160. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:248`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 161. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:365`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 162. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:292`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 163. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:299`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 164. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:307`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 165. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:325`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 166. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:363`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 167. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:369`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 168. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:426`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 169. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:432`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 170. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:454`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 171. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineIndicator.tsx:182`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 172. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:204`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 173. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:346`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 174. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:353`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 175. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PremiumFeaturesDashboard.tsx:25`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 176. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PricingPage.tsx:399`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 177. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SimpleBirthForm.tsx:363`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 178. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:141`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 179. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:174`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 180. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:197`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 181. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:209`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 182. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:234`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 183. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:249`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 184. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:259`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 185. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:96`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 186. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:164`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 187. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:170`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 188. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/EphemerisChart.tsx:130`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 189. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/EphemerisChartWrapper.tsx:38`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 190. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:53`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 191. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:63`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 192. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:189`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 193. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:199`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 194. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:224`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 195. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:376`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 196. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:390`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 197. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:457`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 198. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:93`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 199. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:100`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 200. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:107`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 201. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:120`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 202. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradePrompt.tsx:150`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 203. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradePrompt.tsx:157`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 204. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UserProfile.tsx:381`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 205. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UserProfile.tsx:700`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 206. Click handler missing keyboard support

- **File:** `apps/astro/src/components/common/VirtualizedDataTable.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 207. Click handler missing keyboard support

- **File:** `apps/astro/src/components/common/VirtualizedDataTable.tsx:143`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 208. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:185`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 209. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:196`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 210. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:499`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 211. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:518`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 212. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/ChartPreferences.tsx:211`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 213. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/ErrorBoundary.tsx:65`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 214. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:177`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 215. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:203`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 216. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:220`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 217. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyGenerator.tsx:258`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 218. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyGenerator.tsx:269`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 219. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/HealWaveErrorTestComponent.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 220. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Login.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 221. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Login.tsx:129`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 222. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:102`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 223. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:108`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 224. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:246`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 225. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:276`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 226. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:347`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 227. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:376`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 228. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:408`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 229. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:526`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 230. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:537`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 231. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PricingPage.tsx:121`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 232. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Signup.tsx:88`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 233. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Signup.tsx:628`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 234. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Subscribe.tsx:66`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 235. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/UserProfile.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 236. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Accordion.tsx:95`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 237. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Alert.tsx:42`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 238. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:249`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 239. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:271`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 240. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:285`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 241. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:295`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 242. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:305`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 243. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnalyticsDashboard.tsx:315`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 244. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:84`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 245. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:96`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 246. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:139`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 247. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:139`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 248. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:175`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 249. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:184`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 250. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 251. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystem.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 252. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:84`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 253. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:96`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 254. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:139`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 255. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:139`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 256. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:175`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 257. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:184`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 258. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 259. Click handler missing keyboard support

- **File:** `packages/ui/src/components/AnimationSystemCleaned.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 260. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:15`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 261. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:53`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 262. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:74`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 263. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:74`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 264. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:92`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 265. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:144`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 266. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 267. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:236`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 268. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:243`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 269. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:252`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 270. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:252`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 271. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:304`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 272. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedChartDisplay.tsx:262`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 273. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:126`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 274. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:132`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 275. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:191`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 276. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:197`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 277. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:253`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 278. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:270`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 279. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:276`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 280. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:337`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 281. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:354`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 282. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:360`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 283. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:342`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 284. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:348`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 285. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:357`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 286. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorHandling.tsx:230`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 287. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorHandling.tsx:254`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 288. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorHandling.tsx:275`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 289. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorHandling.tsx:299`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 290. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorHandling.tsx:437`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 291. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MicroInteractions.tsx:67`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 292. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MicroInteractions.tsx:101`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 293. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MicroInteractions.tsx:111`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 294. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MicroInteractions.tsx:146`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 295. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MicroInteractions.tsx:166`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 296. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:282`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 297. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:306`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 298. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:342`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 299. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:375`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 300. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:425`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 301. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:437`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 302. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:438`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 303. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:441`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 304. Click handler missing keyboard support

- **File:** `packages/ui/src/components/MobileResponsive.tsx:473`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 305. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:50`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 306. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:63`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 307. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:78`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 308. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Tabs.tsx:80`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 309. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:27`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 310. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:88`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 311. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:88`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 312. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:117`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 313. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:123`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 314. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:129`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 315. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:156`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 316. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:163`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 317. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UX002Demo.tsx:229`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 318. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:93`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 319. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:109`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 320. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:198`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 321. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UserFeedback.tsx:18`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 322. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UserFeedback.tsx:290`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 323. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UserFeedback.tsx:290`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 324. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UserFeedback.tsx:305`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 325. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:146`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 326. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:168`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 327. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:193`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 328. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:588`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 329. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:41`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 330. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:42`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 331. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:69`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 332. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:69`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 333. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:149`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 334. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:276`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 335. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:294`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 336. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ChartModal.tsx:29`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 337. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ChartModal.tsx:47`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 338. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/FrequencyPlayerModal.tsx:22`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 339. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ProfileModal.tsx:22`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 340. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/SettingsModal.tsx:22`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 341. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ShareModal.tsx:17`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

### ℹ️ MINOR Issues

#### 1. Element with tabIndex={-1} may not be keyboard accessible

- **File:** `apps/astro/src/components/ChartDisplay/BirthSummaryHeader.tsx:58`
- **WCAG Rule:** 2.1.1
- **Code:** `tabIndex={-1}`

#### 2. Element with tabIndex={-1} may not be keyboard accessible

- **File:** `packages/ui/src/components/Modal.tsx:59`
- **WCAG Rule:** 2.1.1
- **Code:** `tabIndex={-1}`

## 🎯 Next Steps

- 🚨 **URGENT:** Fix critical accessibility violations immediately
- 🔧 Add proper ARIA labels, alt text, and modal accessibility
- ⚠️ **HIGH:** Resolve major accessibility issues
- 🎯 Improve form labels and interactive element accessibility
- ℹ️ **MEDIUM:** Address minor accessibility improvements
- ✨ Add skip links and enhance keyboard navigation
- 🧪 Run comprehensive screen reader testing
- 📊 Update CI/CD pipeline with accessibility checks

---

**A11Y-030 Status:** 🔄 IN PROGRESS
