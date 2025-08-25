# 🔍 Accessibility Audit Report - A11Y-030

> **Generated:** 2025-08-25T09:24:15.376Z  
> **Status:** ⚠️ ISSUES FOUND  
> **WCAG Level:** AA

## 📊 Summary

| Severity  | Count   | Status    |
| --------- | ------- | --------- |
| Critical  | 8       | ❌        |
| Major     | 186     | ⚠️        |
| Minor     | 0       | ✅        |
| **Total** | **194** | ⚠️ REVIEW |

## 🎯 WCAG 2.1 AA Compliance Status

### ⚠️ WCAG 2.1.1: Click handler missing keyboard support (186 issues)

- **apps/astro/src/components/AIChat.tsx:130** - Click handler missing keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationCard.tsx:114** - Click handler missing
  keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationDisplay.tsx:124** - Click handler
  missing keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:342** - Click handler missing
  keyboard support
- **apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:374** - Click handler missing
  keyboard support
- **apps/astro/src/components/BlogComments.tsx:213** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:227** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:267** - Click handler missing keyboard support
- **apps/astro/src/components/BlogComments.tsx:345** - Click handler missing keyboard support
- **apps/astro/src/components/ChartCalculator.tsx:244** - Click handler missing keyboard support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:538** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:548** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:558** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:568** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:578** - Click handler missing keyboard
  support
- **apps/astro/src/components/ChartPreferences.tsx:278** - Click handler missing keyboard support
- **apps/astro/src/components/EphemerisPerformanceDashboard.tsx:35** - Click handler missing
  keyboard support
- **apps/astro/src/components/EphemerisPerformanceDashboard.tsx:42** - Click handler missing
  keyboard support
- **apps/astro/src/components/ErrorBoundary.stories.tsx:25** - Click handler missing keyboard
  support
- **apps/astro/src/components/ErrorBoundary.tsx:89** - Click handler missing keyboard support
- **apps/astro/src/components/ErrorBoundary.tsx:95** - Click handler missing keyboard support
- **apps/astro/src/components/ErrorTestComponent.tsx:28** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:126** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:134** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:232** - Click handler missing keyboard support
- **apps/astro/src/components/FeatureGuard.tsx:242** - Click handler missing keyboard support
- **apps/astro/src/components/GeneKeysChart/ActivationSequenceTab.tsx:52** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/CoreQuartetTab.tsx:74** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeyDetails.tsx:24** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:109** - Click handler missing keyboard
  support
- **apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:30** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:93** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/PearlSequenceTab.tsx:52** - Click handler missing
  keyboard support
- **apps/astro/src/components/GeneKeysChart/VenusSequenceTab.tsx:103** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:165** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:202** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:238** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:118** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:47** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:105** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:151** - Click handler missing
  keyboard support
- **apps/astro/src/components/HumanDesignGeneKeys.tsx:110** - Click handler missing keyboard support
- **apps/astro/src/components/HumanDesignGeneKeys.tsx:299** - Click handler missing keyboard support
- **apps/astro/src/components/Login.tsx:90** - Click handler missing keyboard support
- **apps/astro/src/components/MockLoginPanel.tsx:145** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:60** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:129** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:333** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:346** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:370** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:392** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:415** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:440** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:460** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:472** - Click handler missing keyboard support
- **apps/astro/src/components/Navbar.tsx:490** - Click handler missing keyboard support
- **apps/astro/src/components/NotificationSettings.tsx:172** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:179** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:201** - Click handler missing keyboard
  support
- **apps/astro/src/components/NotificationSettings.tsx:209** - Click handler missing keyboard
  support
- **apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:309** - Click handler
  missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:258** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:265** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:273** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:290** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:321** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:327** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:374** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:380** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineChartDemo.tsx:399** - Click handler missing keyboard support
- **apps/astro/src/components/OfflineIndicator.tsx:172** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:162** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:273** - Click handler missing keyboard support
- **apps/astro/src/components/PdfExport.tsx:280** - Click handler missing keyboard support
- **apps/astro/src/components/PremiumFeaturesDashboard.tsx:25** - Click handler missing keyboard
  support
- **apps/astro/src/components/PricingPage.tsx:266** - Click handler missing keyboard support
- **apps/astro/src/components/SimpleBirthForm.tsx:307** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:125** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:154** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:170** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:180** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:201** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:216** - Click handler missing keyboard support
- **apps/astro/src/components/SocialShare.tsx:226** - Click handler missing keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:86** - Click handler missing
  keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:144** - Click handler missing
  keyboard support
- **apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:150** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/EphemerisChart.tsx:123** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/EphemerisChartWrapper.tsx:36** - Click handler missing
  keyboard support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:38** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:48** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:146** - Click handler missing keyboard
  support
- **apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:156** - Click handler missing keyboard
  support
- **apps/astro/src/components/UnifiedBirthInput.tsx:177** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:307** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:321** - Click handler missing keyboard support
- **apps/astro/src/components/UnifiedBirthInput.tsx:377** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:77** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:84** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:91** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradeModalDemo.tsx:102** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradePrompt.tsx:89** - Click handler missing keyboard support
- **apps/astro/src/components/UpgradePrompt.tsx:96** - Click handler missing keyboard support
- **apps/astro/src/components/UserProfile.tsx:289** - Click handler missing keyboard support
- **apps/astro/src/components/UserProfile.tsx:500** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:187** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:198** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:501** - Click handler missing keyboard support
- **apps/healwave/src/components/BinauralSettings.tsx:520** - Click handler missing keyboard support
- **apps/healwave/src/components/ChartPreferences.tsx:198** - Click handler missing keyboard support
- **apps/healwave/src/components/ErrorBoundary.tsx:125** - Click handler missing keyboard support
- **apps/healwave/src/components/ErrorBoundary.tsx:132** - Click handler missing keyboard support
- **apps/healwave/src/components/FrequencyControls.tsx:178** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyControls.tsx:204** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyControls.tsx:221** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyGenerator.tsx:256** - Click handler missing keyboard
  support
- **apps/healwave/src/components/FrequencyGenerator.tsx:267** - Click handler missing keyboard
  support
- **apps/healwave/src/components/HealWaveErrorTestComponent.tsx:30** - Click handler missing
  keyboard support
- **apps/healwave/src/components/Login.tsx:24** - Click handler missing keyboard support
- **apps/healwave/src/components/Login.tsx:127** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:70** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:81** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:87** - Click handler missing keyboard support
- **apps/healwave/src/components/Navbar.tsx:104** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:226** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:239** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:269** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:360** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:389** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:421** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:528** - Click handler missing keyboard support
- **apps/healwave/src/components/PresetSelector.tsx:539** - Click handler missing keyboard support
- **apps/healwave/src/components/PricingPage.tsx:121** - Click handler missing keyboard support
- **apps/healwave/src/components/Signup.tsx:88** - Click handler missing keyboard support
- **apps/healwave/src/components/Signup.tsx:618** - Click handler missing keyboard support
- **apps/healwave/src/components/Subscribe.tsx:64** - Click handler missing keyboard support
- **apps/healwave/src/components/UserProfile.tsx:229** - Click handler missing keyboard support
- **packages/ui/src/components/Accordion.tsx:94** - Click handler missing keyboard support
- **packages/ui/src/components/Alert.tsx:42** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:5** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:22** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:40** - Click handler missing keyboard support
- **packages/ui/src/components/Button.tsx:40** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:78** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:104** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:149** - Click handler missing keyboard support
- **packages/ui/src/components/Dropdown.tsx:177** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:24** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:225** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:231** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:237** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:237** - Click handler missing keyboard support
- **packages/ui/src/components/EnhancedCard.tsx:283** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:94** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:121** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:122** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:153** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:163** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:164** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:214** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:224** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundaries.tsx:225** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:245** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:246** - Click handler missing keyboard support
- **packages/ui/src/components/ErrorBoundary.tsx:247** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:20** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:28** - Click handler missing keyboard support
- **packages/ui/src/components/Modal.tsx:36** - Click handler missing keyboard support
- **packages/ui/src/components/Tabs.tsx:79** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:89** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:105** - Click handler missing keyboard support
- **packages/ui/src/components/UpgradeModal.tsx:189** - Click handler missing keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:127** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:149** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:174** - Click handler missing
  keyboard support
- **packages/ui/src/components/**tests**/EnhancedCard.test.tsx:443** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:50** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:52** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:355** - Click handler missing
  keyboard support
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:377** - Click handler missing
  keyboard support
- **packages/ui/src/components/modals/ChartModal.tsx:29** - Click handler missing keyboard support
- **packages/ui/src/components/modals/ChartModal.tsx:41** - Click handler missing keyboard support
- **packages/ui/src/components/modals/FrequencyPlayerModal.tsx:19** - Click handler missing keyboard
  support
- **packages/ui/src/components/modals/ProfileModal.tsx:19** - Click handler missing keyboard support
- **packages/ui/src/components/modals/SettingsModal.tsx:19** - Click handler missing keyboard
  support
- **packages/ui/src/components/modals/ShareModal.tsx:19** - Click handler missing keyboard support

### ❌ WCAG 4.1.2: Modal missing aria-labelledby or aria-label (7 issues)

- **apps/astro/src/components/AIInterpretation/InterpretationModal.tsx:14** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label
- **packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327** - Modal missing
  aria-labelledby or aria-label

### ❌ WCAG 1.3.1: Input missing label or aria-label (1 issues)

- **apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:525** - Input missing label or
  aria-label

## 🔧 Implementation Status

- ✅ Accessibility testing infrastructure
- ✅ Custom accessibility components (VisuallyHidden)
- ✅ Automated axe-core integration
- ❌ Critical accessibility issues resolved
- ⚠️ Major accessibility issues resolved
- ✅ Minor accessibility improvements completed

## 📋 Detailed Issues

### 🚨 CRITICAL Issues

#### 1. Modal missing aria-labelledby or aria-label

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationModal.tsx:14`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 2. Input missing label or aria-label

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:525`
- **WCAG Rule:** 1.3.1
- **Code:** `<Input`

#### 3. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 4. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 5. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 6. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 7. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

#### 8. Modal missing aria-labelledby or aria-label

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:327`
- **WCAG Rule:** 4.1.2
- **Code:** `role="dialog"`

### ⚠️ MAJOR Issues

#### 1. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIChat.tsx:130`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 2. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationCard.tsx:114`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 3. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationDisplay.tsx:124`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 4. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:342`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 5. Click handler missing keyboard support

- **File:** `apps/astro/src/components/AIInterpretation/InterpretationForm.tsx:374`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 6. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:213`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 7. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:227`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 8. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:267`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 9. Click handler missing keyboard support

- **File:** `apps/astro/src/components/BlogComments.tsx:345`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 10. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartCalculator.tsx:244`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 11. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:538`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 12. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:548`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 13. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:558`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 14. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:568`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 15. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartDisplay/ChartDisplay.tsx:578`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 16. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ChartPreferences.tsx:278`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 17. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EphemerisPerformanceDashboard.tsx:35`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 18. Click handler missing keyboard support

- **File:** `apps/astro/src/components/EphemerisPerformanceDashboard.tsx:42`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 19. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.stories.tsx:25`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 20. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.tsx:89`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 21. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorBoundary.tsx:95`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 22. Click handler missing keyboard support

- **File:** `apps/astro/src/components/ErrorTestComponent.tsx:28`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 23. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:126`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 24. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:134`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 25. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:232`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 26. Click handler missing keyboard support

- **File:** `apps/astro/src/components/FeatureGuard.tsx:242`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 27. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/ActivationSequenceTab.tsx:52`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 28. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/CoreQuartetTab.tsx:74`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 29. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeyDetails.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 30. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysChart.tsx:109`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 31. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 32. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/GeneKeysComponents.tsx:93`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 33. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/PearlSequenceTab.tsx:52`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 34. Click handler missing keyboard support

- **File:** `apps/astro/src/components/GeneKeysChart/VenusSequenceTab.tsx:103`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 35. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:165`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 36. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:202`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 37. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/GatesChannelsTab.tsx:238`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 38. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignChart.tsx:118`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 39. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:47`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 40. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:105`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 41. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignChart/HumanDesignModal.tsx:151`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 42. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignGeneKeys.tsx:110`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 43. Click handler missing keyboard support

- **File:** `apps/astro/src/components/HumanDesignGeneKeys.tsx:299`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 44. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Login.tsx:90`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 45. Click handler missing keyboard support

- **File:** `apps/astro/src/components/MockLoginPanel.tsx:145`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 46. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:60`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 47. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:129`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 48. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:333`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 49. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:346`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 50. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:370`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 51. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:392`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 52. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:415`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 53. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:440`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 54. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:460`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 55. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:472`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 56. Click handler missing keyboard support

- **File:** `apps/astro/src/components/Navbar.tsx:490`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 57. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:172`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 58. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:179`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 59. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:201`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 60. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NotificationSettings.tsx:209`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 61. Click handler missing keyboard support

- **File:** `apps/astro/src/components/NumerologyCalculator/NumerologyCalculator.tsx:309`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 62. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:258`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 63. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:265`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 64. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:273`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 65. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:290`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 66. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:321`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 67. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:327`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 68. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:374`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 69. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:380`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 70. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineChartDemo.tsx:399`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 71. Click handler missing keyboard support

- **File:** `apps/astro/src/components/OfflineIndicator.tsx:172`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 72. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:162`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 73. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:273`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 74. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PdfExport.tsx:280`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 75. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PremiumFeaturesDashboard.tsx:25`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 76. Click handler missing keyboard support

- **File:** `apps/astro/src/components/PricingPage.tsx:266`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 77. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SimpleBirthForm.tsx:307`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 78. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:125`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 79. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:154`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 80. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:170`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 81. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:180`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 82. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:201`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 83. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:216`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 84. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SocialShare.tsx:226`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 85. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:86`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 86. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:144`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 87. Click handler missing keyboard support

- **File:** `apps/astro/src/components/SynastryAnalysis/SynastryAnalysis.tsx:150`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 88. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/EphemerisChart.tsx:123`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 89. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/EphemerisChartWrapper.tsx:36`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 90. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:38`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 91. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:48`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 92. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:146`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 93. Click handler missing keyboard support

- **File:** `apps/astro/src/components/TransitAnalysis/TransitsTab.tsx:156`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 94. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:177`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 95. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:307`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 96. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:321`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 97. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UnifiedBirthInput.tsx:377`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 98. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:77`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 99. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:84`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 100. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:91`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 101. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradeModalDemo.tsx:102`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 102. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradePrompt.tsx:89`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 103. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UpgradePrompt.tsx:96`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 104. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UserProfile.tsx:289`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 105. Click handler missing keyboard support

- **File:** `apps/astro/src/components/UserProfile.tsx:500`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 106. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:187`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 107. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:198`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 108. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:501`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 109. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/BinauralSettings.tsx:520`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 110. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/ChartPreferences.tsx:198`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 111. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/ErrorBoundary.tsx:125`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 112. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/ErrorBoundary.tsx:132`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 113. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:178`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 114. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:204`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 115. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyControls.tsx:221`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 116. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyGenerator.tsx:256`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 117. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/FrequencyGenerator.tsx:267`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 118. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/HealWaveErrorTestComponent.tsx:30`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 119. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Login.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 120. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Login.tsx:127`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 121. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:70`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 122. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:81`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 123. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:87`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 124. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Navbar.tsx:104`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 125. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:226`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 126. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:239`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 127. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:269`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 128. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:360`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 129. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:389`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 130. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:421`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 131. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:528`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 132. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PresetSelector.tsx:539`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 133. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/PricingPage.tsx:121`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 134. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Signup.tsx:88`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 135. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Signup.tsx:618`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 136. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/Subscribe.tsx:64`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 137. Click handler missing keyboard support

- **File:** `apps/healwave/src/components/UserProfile.tsx:229`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 138. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Accordion.tsx:94`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 139. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Alert.tsx:42`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 140. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:5`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 141. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:22`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 142. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:40`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 143. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Button.tsx:40`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 144. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:78`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 145. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:104`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 146. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:149`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 147. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Dropdown.tsx:177`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 148. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:24`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 149. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:225`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 150. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:231`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 151. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:237`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 152. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:237`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 153. Click handler missing keyboard support

- **File:** `packages/ui/src/components/EnhancedCard.tsx:283`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 154. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:94`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 155. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:121`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 156. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:122`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 157. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:153`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 158. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:163`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 159. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:164`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 160. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:214`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 161. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:224`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 162. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundaries.tsx:225`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 163. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:245`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 164. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:246`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 165. Click handler missing keyboard support

- **File:** `packages/ui/src/components/ErrorBoundary.tsx:247`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 166. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:20`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 167. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:28`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 168. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Modal.tsx:36`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 169. Click handler missing keyboard support

- **File:** `packages/ui/src/components/Tabs.tsx:79`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 170. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:89`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 171. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:105`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 172. Click handler missing keyboard support

- **File:** `packages/ui/src/components/UpgradeModal.tsx:189`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 173. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:127`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 174. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:149`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 175. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:174`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 176. Click handler missing keyboard support

- **File:** `packages/ui/src/components/__tests__/EnhancedCard.test.tsx:443`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 177. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:50`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 178. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:52`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 179. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:355`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 180. Click handler missing keyboard support

- **File:** `packages/ui/src/components/accessibility/AccessibilityUtils.tsx:377`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 181. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ChartModal.tsx:29`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 182. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ChartModal.tsx:41`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 183. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/FrequencyPlayerModal.tsx:19`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 184. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ProfileModal.tsx:19`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 185. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/SettingsModal.tsx:19`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

#### 186. Click handler missing keyboard support

- **File:** `packages/ui/src/components/modals/ShareModal.tsx:19`
- **WCAG Rule:** 2.1.1
- **Code:** `onClick`

## 🎯 Next Steps

- 🚨 **URGENT:** Fix critical accessibility violations immediately
- 🔧 Add proper ARIA labels, alt text, and modal accessibility
- ⚠️ **HIGH:** Resolve major accessibility issues
- 🎯 Improve form labels and interactive element accessibility
- 🧪 Run comprehensive screen reader testing
- 📊 Update CI/CD pipeline with accessibility checks

---

**A11Y-030 Status:** 🔄 IN PROGRESS
