# CosmicHub Project Structure

Generated on: 2025-09-05 12:44:06

## Directory Tree

```
CosmicHub/
├── ai-agent-coordination/
│   ├── ⚙️ agent-1-astro-components-analysis.json
│   ├── 📝 agent-1-astro-components-instructions.md
│   ├── ⚙️ agent-2-astro-features-analysis.json
│   ├── 📝 agent-2-astro-features-instructions.md
│   ├── ⚙️ agent-3-astro-pages-context-analysis.json
│   ├── 📝 agent-3-astro-pages-context-instructions.md
│   ├── ⚙️ agent-4-astro-services-types-analysis.json
│   ├── 📝 agent-4-astro-services-types-instructions.md
│   ├── ⚙️ agent-5-ui-package-analysis.json
│   ├── 📝 agent-5-ui-package-instructions.md
│   ├── ⚙️ agent-6-config-package-analysis.json
│   ├── 📝 agent-6-config-package-instructions.md
│   ├── ⚙️ agent-7-apps-small-packages-analysis.json
│   ├── 📝 agent-7-apps-small-packages-completion-report.md
│   ├── 📝 agent-7-apps-small-packages-instructions.md
│   ├── 📝 AGENT-7-COMPLETION-SUMMARY.md
│   ├── 📝 AGENT-7-OPTIMIZATION-SUMMARY.md
│   ├── ⚙️ agent-7-storage-analysis.json
│   ├── ⚙️ agent-7-storage-offline-storage-analysis.json
│   ├── ⚙️ agent-7-storage-offline-sync-analysis.json
│   ├── ⚙️ coordination-manifest.json
│   ├── 📝 enhanced-coordination-strategy.md
│   ├── 📝 FILE_NAMING_CONVENTION.md
│   └── ⚙️ rebalanced-agent-config.json
├── apps/
│   ├── astro/
│   │   ├── public/
│   │   ├── scripts/
│   │   ├── src/
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 Dockerfile
│   │   ├── 🔷 eslint.config.ts
│   │   ├── 🌐 index.html
│   │   ├── 📦 package.json
│   │   ├── 📄 postcss.config.cjs
│   │   ├── 🔷 postcss.config.ts
│   │   ├── 🔷 tailwind.config.ts
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.dev.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── 🔷 vite.config.ts
│   ├── healwave/
│   │   ├── public/
│   │   ├── src/
│   │   ├── 🐳 Dockerfile
│   │   ├── 🟨 eslint.config.js
│   │   ├── 🌐 index.html
│   │   ├── 📦 package.json
│   │   ├── 📄 postcss.config.cjs
│   │   ├── 🔷 postcss.config.ts
│   │   ├── 🔷 tailwind.config.ts
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── 🔷 vite.config.ts
│   └── mobile/
│       ├── app/
│       ├── assets/
│       ├── src/
│       ├── 📄 .gitignore
│       ├── ⚙️ app.json
│       ├── 🔷 App.tsx
│       ├── ⚙️ eas.json
│       ├── 🔷 index.ts
│       ├── ⚙️ package-lock.json
│       ├── 📦 package.json
│       └── ⚙️ tsconfig.json
├── backend/
│   ├── analytics/
│   │   ├── 🐍 analytics_api.py
│   │   ├── 🐍 custom_analytics.py
│   │   └── 🐍 websocket_handler.py
│   ├── api/
│   │   ├── bridges/
│   │   ├── endpoints/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 debug.py
│   │   ├── 🐍 interpretations.py
│   │   ├── 🐍 monitoring.py
│   │   ├── 🐍 salt_management.py
│   │   └── 🐍 stripe_integration.py
│   ├── astro/
│   │   ├── api/
│   │   ├── calculations/
│   │   ├── services/
│   │   └── 🐍 __init__.py
│   ├── backend_types/
│   │   ├── stubs/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 astrology_systems.py
│   │   ├── 🐍 astrology_systems_clean.py
│   │   ├── 🐍 psychology_systems.py
│   │   ├── 🐍 runtime_protocols.py
│   │   ├── 🐍 synastry_systems.py
│   │   ├── 🐍 tcm_analytics_schema.py
│   │   ├── 🐍 tcm_api_types.py
│   │   ├── 🐍 tcm_mock_data.py
│   │   └── 🐍 tcm_systems.py
│   ├── config/
│   │   └── 🐍 circuit_breaker_config.py
│   ├── data_export/
│   │   ├── 🐍 config.py
│   │   └── 🐍 parquet_exporter.py
│   ├── ephe/
│   ├── htmlcov/
│   │   ├── 📄 .gitignore
│   │   ├── 🌐 __init___py.html
│   │   ├── 🌐 auth_py.html
│   │   ├── 🌐 class_index.html
│   │   ├── 🟨 coverage_html_cb_6fb7b396.js
│   │   ├── 🌐 database_py.html
│   │   ├── 🌐 function_index.html
│   │   ├── 🌐 index.html
│   │   ├── 🌐 main_py.html
│   │   ├── 🌐 security_py.html
│   │   ├── 🌐 settings_py.html
│   │   ├── 🌐 startup_py.html
│   │   ├── ⚙️ status.json
│   │   ├── 🎨 style_cb_6b508a39.css
│   │   ├── 🌐 z_10414145323772df___init___py.html
│   │   ├── 🌐 z_10414145323772df_csrf_py.html
│   │   ├── 🌐 z_10414145323772df_headers_py.html
│   │   ├── 🌐 z_10414145323772df_rate_limiting_py.html
│   │   ├── 🌐 z_10414145323772df_validation_py.html
│   │   ├── 🌐 z_10fae538ba4e8521___init___py.html
│   │   ├── 🌐 z_10fae538ba4e8521_charts_py.html
│   │   ├── 🌐 z_10fae538ba4e8521_interpretations_py.html
│   │   ├── 🌐 z_10fae538ba4e8521_salt_management_py.html
│   │   ├── 🌐 z_10fae538ba4e8521_stripe_integration_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e___init___py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_ai_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_calculations_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_charts_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_csp_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_ephemeris_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_interpretations_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_presets_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_stripe_router_py.html
│   │   ├── 🌐 z_1a87e07b7d9ec38e_subscriptions_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_ai_interpretations_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_chart_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_ephemeris_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_gene_keys_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_house_systems_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_human_design_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_mayan_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_numerology_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_personality_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_tcm_engine_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_transits_clean_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_uranian_py.html
│   │   ├── 🌐 z_2ed400ac5dc802ce_vedic_py.html
│   │   ├── 🌐 z_6d3f2e5c10bc204c___init___py.html
│   │   ├── 🌐 z_6e8d258084b89723___init___py.html
│   │   ├── 🌐 z_6e8d258084b89723_serialization_py.html
│   │   ├── 🌐 z_6e8d258084b89723_type_guards_py.html
│   │   ├── 🌐 z_6e8d258084b89723_typing_helpers_py.html
│   │   ├── 🌐 z_9b0341f23a4a319f_synastry_py.html
│   │   ├── 🌐 z_c810615cce0f7acb___init___py.html
│   │   ├── 🌐 z_c810615cce0f7acb_api_result_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_compatibility_utils_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_ephemeris_client_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_house_overlay_utils_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_optimized_vectorized_integration_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_pseudonymization_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_salt_backend_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_salt_storage_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_caching_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_composite_utils_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_memory_optimization_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_monitoring_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_multi_system_utils_py.html
│   │   ├── 🌐 z_ea7dcbcd4ae655be___init___py.html
│   │   ├── 🌐 z_ea7dcbcd4ae655be_ai_service_py.html
│   │   ├── 🌐 z_ea7dcbcd4ae655be_astro_service_py.html
│   │   ├── 🌐 z_ea7dcbcd4ae655be_stripe_service_py.html
│   │   ├── 🌐 z_eb3a433c7a885d4e___init___py.html
│   │   ├── 🌐 z_eb3a433c7a885d4e_ai_py.html
│   │   ├── 🌐 z_eb3a433c7a885d4e_ephemeris_py.html
│   │   ├── 🌐 z_eb3a433c7a885d4e_preset_py.html
│   │   └── 🌐 z_eb3a433c7a885d4e_subscription_py.html
│   ├── monitoring/
│   │   ├── grafana/
│   │   ├── prometheus/
│   │   ├── ⚙️ alertmanager.yml
│   │   ├── 🔧 anomaly-detection.sh
│   │   ├── ⚙️ blackbox.yml
│   │   ├── 🔧 deploy-incident-response.sh
│   │   ├── 🔧 deploy-monitoring-complete.sh
│   │   ├── 🔧 deploy-monitoring.sh
│   │   ├── ⚙️ docker-compose.monitoring.yml
│   │   ├── 🐍 incident_response.py
│   │   └── 📖 README.md
│   ├── privacy/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 audit.py
│   │   ├── 🐍 compliance.py
│   │   ├── 🐍 enhanced_anonymization.py
│   │   └── 🐍 risk_analysis.py
│   ├── privacy_audit_results/
│   ├── privacy_pets_results/
│   │   ├── ⚙️ pets_implementation_report_20250825_110209.json
│   │   └── ⚙️ pets_implementation_report_20250825_133405.json
│   ├── routers/
│   │   └── 🐍 synastry.py
│   ├── security/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 abuse_detection.py
│   │   ├── 🐍 advanced_validation.py
│   │   ├── 🐍 csrf.py
│   │   ├── 🐍 headers.py
│   │   ├── 🐍 middleware.py
│   │   ├── 🐍 rate_limiting.py
│   │   └── 🐍 validation.py
│   ├── services/
│   │   └── 🐍 psychology_cache.py
│   ├── types/
│   │   ├── 🐍 astrology.py
│   │   ├── 🐍 human_design.py
│   │   └── 🐍 tcm_systems.py
│   ├── utils/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 adaptive_concurrency.py
│   │   ├── 🐍 api_result.py
│   │   ├── 🐍 circuit_breaker.py
│   │   ├── 🐍 compatibility_utils.py
│   │   ├── 🐍 encrypted_logging.py
│   │   ├── 🐍 ephemeris_client.py
│   │   ├── 🐍 fallback_logging.py
│   │   ├── 🐍 firebase_auth_service.py
│   │   ├── 🐍 house_overlay_utils.py
│   │   ├── 🐍 optimized_vectorized_integration.py
│   │   ├── 🐍 pseudonymization.py
│   │   ├── 🐍 salt_backend.py
│   │   ├── 🐍 salt_storage.py
│   │   ├── 🐍 vectorized_caching.py
│   │   ├── 🐍 vectorized_composite_utils.py
│   │   ├── 🐍 vectorized_memory_optimization.py
│   │   ├── 🐍 vectorized_monitoring.py
│   │   └── 🐍 vectorized_multi_system_utils.py
│   ├── 📄 .dockerignore
│   ├── 📄 .gitignore
│   ├── 🐍 __init__.py
│   ├── 🐍 auth.py
│   ├── 🔧 check-types.sh
│   ├── ⚙️ COSMICHUB_PRIVACY_LEADERSHIP_SUMMARY.json
│   ├── 🐍 database.py
│   ├── 🐍 debug_auth.py
│   ├── 🐍 debug_endpoint.py
│   ├── 🐳 Dockerfile
│   ├── ⚙️ firebase.json
│   ├── ⚙️ firestore.indexes.json
│   ├── 🐍 gdpr_compliance_improvement.py
│   ├── 🐍 main.py
│   ├── 🐍 minimal_app.py
│   ├── 📝 MYPY_INTEGRATION_SUMMARY.md
│   ├── 🐍 pets_implementation.py
│   ├── 🐍 priv_006_implementation.py
│   ├── 🐍 privacy_automation.py
│   ├── 🐍 privacy_enhancement.py
│   ├── 🐍 privacy_leadership_summary.py
│   ├── ⚙️ pyproject.toml
│   ├── 📄 requirements.txt
│   ├── 🐍 security.py
│   ├── 🐍 settings.py
│   ├── 🐍 startup.py
│   └── 🐍 validate_parquet_foundation.py
├── CODE-001-backup-20250902_121720/
│   ├── packages/
│   │   ├── frequency/
│   │   ├── storage/
│   │   └── subscriptions/
│   └── ⚙️ tsconfig.base.json
├── data-flow-diagrams/
├── docs/
│   ├── 00-OVERVIEW/
│   │   ├── 📝 AI_CONTEXT_AUTOMATION.md
│   │   ├── 📝 INDEX.md
│   │   ├── 📝 MASTER_CONTEXT.md
│   │   ├── 📝 PARQUET-IMPLEMENTATION-SUMMARY.md
│   │   ├── 📖 README.md
│   │   └── 📝 ROADMAP.md
│   ├── 01-CURRENT-STATUS/
│   │   ├── completions/
│   │   ├── daily-updates/
│   │   ├── 📝 ASTROLOGICAL_FIXES_SUMMARY.md
│   │   ├── 📝 CODE_HEALTH_STATUS.md
│   │   ├── 📝 CONFLICT_RESOLUTION_SUMMARY.md
│   │   ├── 📝 DOCUMENTATION_ALIGNMENT_UPDATE.md
│   │   ├── 📝 DOCUMENTATION_FRESHNESS.md
│   │   ├── 📝 ENHANCED_COORDINATION_STATUS.md
│   │   ├── 📝 MOB-001-DEPLOYMENT-STATUS.md
│   │   ├── 📝 MOBILE_STATUS.md
│   │   ├── 📝 NEXT_STEPS_POST_AI_SUCCESS.md
│   │   ├── 📝 ORGANIZATION_IMPROVEMENTS_SUMMARY.md
│   │   ├── 📝 PROJECT_PRIORITIES_2025.md
│   │   ├── 📝 PROJECT_PRIORITIES_2025_UPDATED.md
│   │   ├── 📝 PROJECT_STATUS_SUMMARY.md
│   │   ├── 📖 README.md
│   │   └── 📝 UNIFIED_STATUS_SUMMARY.md
│   ├── 02-ACTIVE-PRIORITIES/
│   │   ├── 📝 AI_COORDINATION_TACTICAL_GUIDE.md
│   │   ├── 📝 ANALYTICS-001-IMPLEMENTATION-PLAN.md
│   │   ├── 📝 BIRTHDATA_CONSOLIDATION_PLAN.md
│   │   ├── 📝 CONTEXT_ENHANCEMENT_PLAN.md
│   │   ├── 📝 CUSTOM_HOOKS_IMPLEMENTATION_PLAN.md
│   │   ├── 📝 GROK-RESPONSE-4-COMPLETE-IMPLEMENTATION.md
│   │   ├── 📝 GROK-SPIRITUAL-001-1.md
│   │   ├── 📝 GROK-SPIRITUAL-001-2.md
│   │   ├── 📝 GROK-SPIRITUAL-001-3.md
│   │   ├── 📝 GROK-SPIRITUAL-001-4.md
│   │   ├── 📝 GROK-SPIRITUAL-001-5.md
│   │   ├── 📝 IMMEDIATE_NEXT_STEPS.md
│   │   ├── 📝 INDEX.md
│   │   ├── 📝 ISSUE_TRACKER.md
│   │   ├── 📝 KABBALAH-CORRESPONDENCE-SYSTEM-PLAN.md
│   │   ├── 📝 MASTER_TASK_LIST.md
│   │   ├── 📝 MOB-001-DEPLOYMENT-GATING.md
│   │   ├── 📝 PARALLEL_AI_IMPLEMENTATION_STRATEGY.md
│   │   ├── 📝 PERF-002-IMPLEMENTATION-PLAN.md
│   │   ├── 📝 PHASE-6B-READINESS-MONITOR.md
│   │   ├── 📖 README.md
│   │   ├── 📝 REL-012_IMPLEMENTATION_SUMMARY.md
│   │   ├── 📝 SOLO_DEVELOPER_IMMEDIATE_ACTIONS.md
│   │   ├── 📝 SOLO_DEVELOPER_STRATEGIC_PLAN.md
│   │   ├── 📝 SPIRITUAL-001-KABBALAH-CORRESPONDENCE-MAPPING.md
│   │   ├── 📝 SPIRITUAL-002-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-002-GROK-RESPONSE-1-MBTI-ASTROLOGY.md
│   │   ├── 📝 SPIRITUAL-002-GROK-RESPONSE-2-ENNEAGRAM.md
│   │   ├── 📝 SPIRITUAL-002-GROK-RESPONSE-3-MARKET-POSITIONING.md
│   │   ├── 📝 SPIRITUAL-002-IMPLEMENTATION-ACTION-PLAN.md
│   │   ├── 📝 SPIRITUAL-002-PSYCHOLOGY-BRIDGE-PLAN.md
│   │   ├── 📝 SPIRITUAL-002-PSYCHOLOGY-IMPLEMENTATION-PLAN.md
│   │   ├── 📝 SPIRITUAL-003-GROK-RESPONSE-1-TCM-ASTROLOGY.md
│   │   ├── 📝 SPIRITUAL-003-GROK-RESPONSE-2-HEALWAVE-INTEGRATION.md
│   │   ├── 📝 SPIRITUAL-003-GROK-RESPONSE-3-TCM-DIGITAL.md
│   │   ├── 📝 SPIRITUAL-003-TCM-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-003-TCM-WELLNESS-BRIDGE-PLAN.md
│   │   ├── 📝 SPIRITUAL-004-AYURVEDA-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-004-AYURVEDA-VEDIC-INTEGRATION-PLAN.md
│   │   ├── 📝 SPIRITUAL-004-GROK-RESPONSE-1-AYURVEDA-VEDIC.md
│   │   ├── 📝 SPIRITUAL-004-GROK-RESPONSE-2-AYURVEDA-DIGITAL.md
│   │   ├── 📝 SPIRITUAL-004-GROK-RESPONSE-3-AYURVEDA-ETHICS.md
│   │   ├── 📝 SPIRITUAL-005-GROK-RESPONSE-1-YOGA-SUTRAS-SYSTEMATIC.md
│   │   ├── 📝 SPIRITUAL-005-GROK-RESPONSE-2-YOGA-ASTROLOGY-TIMING.md
│   │   ├── 📝 SPIRITUAL-005-GROK-RESPONSE-3-YOGA-DIGITAL-EDUCATION.md
│   │   ├── 📝 SPIRITUAL-005-YOGA-SUTRAS-CONSCIOUSNESS-PLAN.md
│   │   ├── 📝 SPIRITUAL-005-YOGA-SUTRAS-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-006-ADVANCED-CONSCIOUSNESS-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-006-ADVANCED-CONSCIOUSNESS-SYSTEMS-PLAN.md
│   │   ├── 📝 SPIRITUAL-006-GROK-RESPONSE-1-HUMAN-DESIGN-ENHANCED.md
│   │   ├── 📝 SPIRITUAL-006-GROK-RESPONSE-2-GENE-KEYS-ADVANCED.md
│   │   ├── 📝 SPIRITUAL-006-GROK-RESPONSE-3-MAYAN-ADVANCED.md
│   │   ├── 📝 SPIRITUAL-006-GROK-RESPONSE-4-TAOIST-PRACTICES.md
│   │   ├── 📝 SPIRITUAL-007-GROK-RESPONSE-1-HERMETIC-ALCHEMY.md
│   │   ├── 📝 SPIRITUAL-007-GROK-RESPONSE-2-GALACTIC-SOLAR.md
│   │   ├── 📝 SPIRITUAL-007-GROK-RESPONSE-3-ESOTERIC-POSITIONING.md
│   │   ├── 📝 SPIRITUAL-007-HERMETIC-GALACTIC-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-008-GALACTIC-CONSCIOUSNESS-GROK-CONSULTATION-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-008-GALACTIC-CONSCIOUSNESS-TRILOGY-PLAN.md
│   │   ├── 📝 SPIRITUAL-008-GROK-RESPONSE-1-KEYLONTIC-SCIENCE.md
│   │   ├── 📝 SPIRITUAL-008-GROK-RESPONSE-2-LAW-OF-ONE.md
│   │   ├── 📝 SPIRITUAL-008-GROK-RESPONSE-3-URANTIA-BOOK.md
│   │   ├── 📝 SPIRITUAL-008-GROK-RESPONSE-4-GALACTIC-SYNTHESIS.md
│   │   ├── 📝 SPIRITUAL-GROK-CONSULTATION-MASTER-INDEX.md
│   │   ├── 📝 SPIRITUAL-GROK-RESPONSES-COLLECTION-TRACKER.md
│   │   ├── 📝 SPIRITUAL-SYSTEMS-DETAILED-IMPLEMENTATION-PLAN.md
│   │   ├── 📝 SPIRITUAL-SYSTEMS-IMPLEMENTATION-MASTER-PLAN.md
│   │   ├── 📝 SPIRITUAL-SYSTEMS-IMPLEMENTATION-STATUS.md
│   │   ├── 📝 SPIRITUAL-SYSTEMS-INTEGRATION-ROADMAP.md
│   │   └── 📝 UX-020-IMPLEMENTATION-COMPLETE.md
│   ├── 03-GUIDES/
│   │   ├── data/
│   │   ├── deployment/
│   │   ├── environment-status/
│   │   ├── experimentation/
│   │   ├── feature-guides/
│   │   ├── guides/
│   │   ├── mobile/
│   │   ├── 📝 ADVISORY_SUPPORT_FRAMEWORK.md
│   │   ├── 📝 ai-model-recommendations.md
│   │   ├── 📝 API_REFACTORING_PLAN.md
│   │   ├── 📝 cicd-updates-completion.md
│   │   ├── 📝 COMPONENT_BEST_PRACTICES_CHECKLIST.md
│   │   ├── 📝 documentation-links-completion.md
│   │   ├── 📝 ESLINT_CONFIGURATION_REFINEMENT.md
│   │   ├── 📝 FONT_OPTIMIZATION.md
│   │   ├── 📝 MOB-001-IMPLEMENTATION.md
│   │   ├── 📝 NEXT_STEPS_POST_ENDPOINT_CONSOLIDATION.md
│   │   ├── 📝 PARALLEL_EXECUTION_PLAN.md
│   │   ├── 📝 REACT_HOOK_PATTERNS.md
│   │   ├── 📖 README.md
│   │   ├── 📝 script-consolidation-plan.md
│   │   ├── 📝 script-consolidation-results.md
│   │   ├── 📝 SYNASTRY_ANALYSIS_OPTIMIZATION.md
│   │   ├── 📝 tool-organization-completion.md
│   │   ├── 📝 type-standards-improvement-plan.md
│   │   ├── 📝 UNIFIED_TYPE_VALIDATION_STRATEGY.md
│   │   ├── 📝 UPGRADE_MODAL_IMPLEMENTATION.md
│   │   └── 📝 UX-002-IMPLEMENTATION.md
│   ├── 03-IMPLEMENTATION-LOGS/
│   │   ├── 📝 AI001_DASHBOARD_OPTIMIZATION_COMPLETE.md
│   │   ├── 📝 CHART_REFACTORING_SUMMARY.md
│   │   ├── 📝 CHARTDISPLAY_REFACTORING_COMPLETE.md
│   │   ├── 📝 CHARTWHEEL_CONSOLIDATION_COMPLETE.md
│   │   ├── 📝 COMPONENT_ANALYSIS_REPORT.md
│   │   ├── 📝 COMPONENT_BEST_PRACTICES_2_COMPLETE.md
│   │   ├── 📝 CONSOLE_WARNING_FIXES_SUMMARY.md
│   │   ├── 📝 CRITICAL_COMPONENTS_ENHANCEMENT_AUDIT.md
│   │   ├── 📝 CSS_MODULE_MIGRATION_SUMMARY.md
│   │   ├── 📝 DESCRIPTIVE_TYPE_ENHANCEMENT_COMPLETE.md
│   │   ├── 📝 ERROR_BOUNDARY_CONSOLIDATION_COMPLETE.md
│   │   ├── 📝 FEATUREGUARD_OPTIMIZATION_COMPLETE.md
│   │   ├── 📝 MEMOIZATION-IMPLEMENTATION-COMPLETE.md
│   │   ├── 📝 MULTI_SYSTEM_REFACTOR_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 PARALLEL_AI_IMPLEMENTATION_REVIEW.md
│   │   ├── 📝 SERIALIZATION_ISSUES_INVESTIGATION.md
│   │   ├── 📝 SPIRITUAL-001-IMPLEMENTATION-COMPLETE.md
│   │   ├── 📝 SPIRITUAL-002-PRODUCTION-ENHANCEMENT-COMPLETE.md
│   │   ├── 📝 SPIRITUAL-003-INSTANCE-PROMPTS.md
│   │   ├── 📝 SPIRITUAL-003-PARALLEL-IMPLEMENTATION-PLAN.md
│   │   ├── 📝 SYNTHESIS_MODULE_RESOLUTION_FIXED.md
│   │   ├── 📝 SYNTHESIS_RESOLUTION_FINAL.md
│   │   ├── 📝 TYPE_BRIDGE_GAP_ANALYSIS.md
│   │   ├── 📝 TYPE_ENHANCEMENT_ANALYSIS.md
│   │   ├── 📝 TYPE_ENHANCEMENT_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 TYPE_ENHANCEMENT_OPPORTUNITIES.md
│   │   ├── 📝 TYPE_ENHANCEMENT_SUMMARY.md
│   │   ├── 📝 TYPE_IMPROVEMENT_PLAN.md
│   │   ├── 📝 TYPE_IMPROVEMENTS_REPORT.md
│   │   ├── 📝 UX-002-COMPLETION-SUMMARY.md
│   │   └── 📝 VIRTUALIZATION_AUDIT_REPORT.md
│   ├── 03-IMPLEMENTATION-PLANS/
│   │   ├── spiritual-systems/
│   │   ├── 📝 AI-006-CICD-OPTIMIZATION.md
│   │   ├── 📝 AI-006-IMPLEMENTATION-ROADMAP.md
│   │   ├── 📝 AI-006-INTEGRATION-ALIGNMENT.md
│   │   ├── 📝 AI-006-INTEGRATION-ARCHITECTURE.md
│   │   ├── 📝 AI-006-PERFORMANCE-OPTIMIZATION.md
│   │   ├── 📝 AI-006-SECURITY-AUDITING.md
│   │   ├── 📝 ANALYTICS-001-IMPLEMENTATION-GUIDE.md
│   │   ├── 📝 ANALYTICS-001-PLAN.md
│   │   ├── 📝 CHARTDISPLAY_REFACTORING_PLAN.md
│   │   ├── 📝 DATA-001-PARQUET-ARCHITECTURE-PLAN.md
│   │   ├── 📝 INTEGRATION_STRATEGY.md
│   │   ├── 📝 MULTI-SYSTEM-NAVIGATION-REFACTOR.md
│   │   └── 📝 PERF-002-TREE-SHAKING-PLAN.md
│   ├── 04-ARCHITECTURE/
│   │   ├── architecture/
│   │   ├── architecture-and-planning/
│   │   ├── IMPLEMENTATION/
│   │   ├── REFACTOR/
│   │   ├── 📝 AGENT_ANALYSIS_SYNC_PREVENTION.md
│   │   ├── 📝 ApiResult-Unification-Complete.md
│   │   ├── 📝 PROJECT_STRUCTURE.md
│   │   ├── 📖 README.md
│   │   ├── 📝 REFACTOR_PROPOSAL.md
│   │   ├── 📝 SERIALIZATION_DATA_FLOWS.md
│   │   ├── 📝 STRICTNESS_ROLLOUT_PLAN.md
│   │   ├── 📝 SYSTEM_ARCHITECTURE.md
│   │   ├── 📝 TYPE_BRIDGE_SYSTEM.md
│   │   ├── 📝 TYPE_ERROR_RATCHET.md
│   │   ├── 📝 UI_UX_IMPROVEMENTS.md
│   │   └── 📝 VIEW_ANALYSIS_IMPROVEMENTS.md
│   ├── 04-IMPLEMENTATION/
│   │   └── 📝 UX-002-COMPLETION-SUMMARY.md
│   ├── 04-INFRASTRUCTURE/
│   ├── 05-ARCHIVE/
│   │   ├── completed-implementations/
│   │   ├── implementation-summaries/
│   │   ├── 📝 AI-001-CUSTOM-HOOKS-COMPLETE.md
│   │   ├── 📝 AI-001-CUSTOM-HOOKS-COMPLETION-SUMMARY.md
│   │   ├── 📝 AI_AGENT_COORDINATION_COMPLETE.md
│   │   ├── 📝 BACKEND_AUTOMATION_SUCCESS_REPORT.md
│   │   ├── 📝 BLOG_DOCUMENTATION.md
│   │   ├── 📝 BLOG_NEXT_STEPS.md
│   │   ├── 📝 CHART_INTEGRATION_COMPLETE.md
│   │   ├── 📝 CODE_REFACTOR_SUMMARY.md
│   │   ├── 📝 COLLABRATIVE_CHART_SHARING.md
│   │   ├── 📝 COMPLETE_IMPLEMENTATION_SUMMARY.md
│   │   ├── 📝 CONTEXT_OPTIMIZATIONS_COMPLETE.md
│   │   ├── 📝 CUSTOM_HOOKS_IMPLEMENTATION_PLAN.md
│   │   ├── 📝 DEVELOPMENT_COMPLETION_ARCHIVE.md
│   │   ├── 📝 DOCUMENTATION_CLEANUP_SUMMARY.md
│   │   ├── 📝 DOCUMENTATION_CONSOLIDATION_REPORT.md
│   │   ├── 📝 ENDPOINT-CONSOLIDATION-COMPLETE.md
│   │   ├── 📝 ENVIRONMENT_CLEANUP_COMPLETE.md
│   │   ├── 📝 GPT-5_PREVIEW_SUGGESTIONS.md
│   │   ├── 📝 GROK_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 GROK_SUGGESTIONS.md
│   │   ├── 📝 HOOKS-002-COMPLETION-SUMMARY.md
│   │   ├── 📝 lint-tightening-plan.md
│   │   ├── 📝 LINT_SUMMARY.md
│   │   ├── 📝 LINTING_IMPROVEMENT_PLAN.md
│   │   ├── 📝 MARKETPLACE_PHASED_ROADMAP.md
│   │   ├── 📝 MOB-001-COMPLETE.md
│   │   ├── 📝 MOB-001-COMPLETION-SUMMARY.md
│   │   ├── 📝 MOB-001-DEPLOYMENT-STATUS.md
│   │   ├── 📝 MOB-001-IMPLEMENTATION.md
│   │   ├── 📝 MULTI_SYSTEM_COMPLETE.md
│   │   ├── 📝 MULTISYSTEM_CHART_MODULAR_COMPLETE.md
│   │   ├── 📝 PARALLEL_LINT_IMPLEMENTATION_SUMMARY.md
│   │   ├── 📝 PERF-001-COMPLETION-SUMMARY.md
│   │   ├── 📝 PERF-001-IMPLEMENTATION-SUMMARY.md
│   │   ├── 📖 PERF-001-README.md
│   │   ├── 📝 PERF-002-IMPLEMENTATION-COMPLETE.md
│   │   ├── 📝 PHASE_1_COMPLETE_VECTORIZED_SYNASTRY.md
│   │   ├── 📝 PHASE_1_COMPLETION.md
│   │   ├── 📝 PHASE_1_PROGRESS.md
│   │   ├── 📝 PHASE_2_IMPLEMENTATION_PLAN.md
│   │   ├── 📝 PHASE_2_PLAN.md
│   │   ├── 📝 PHASE_2_VECTORIZATION_COMPLETE.md
│   │   ├── 📝 PHASE_2_WEEK_1_COMPOSITE_VECTORIZATION_COMPLETE.md
│   │   ├── 📝 PHASE_3_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 PRIV-004_SALT_PERSISTENCE_ROTATION_COMPLETE.md
│   │   ├── 📝 PRIV-006-COMPLETE.md
│   │   ├── 📝 PRIV-006-IMMEDIATE-ACTIONS-COMPLETE.md
│   │   ├── 📝 PRIVACY_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📖 README.md
│   │   ├── 📝 REFACTOR_COMPLETE.md
│   │   ├── 📝 SECURITY_PHASE_COMPLETION.md
│   │   ├── 📝 SERIALIZATION_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 SERIALIZATION_OPTIMIZATION_COMPLETE.md
│   │   ├── 📝 STRIPE_INTEGRATION_COMPLETE.md
│   │   ├── 📝 UPGRADE_MODAL_COPY_VARIANTS.md
│   │   ├── 📝 UX-001-COMPLETION-SUMMARY.md
│   │   └── 📝 UX-021-IMPLEMENTATION-COMPLETE.md
│   ├── 06-OPERATIONS/
│   │   ├── operations/
│   │   ├── runbooks/
│   │   ├── 📝 CONSOLE_TO_LOG_MIGRATION.md
│   │   ├── 📝 DOCUMENTATION_DEDUP_MOVE_PLAN.md
│   │   ├── 📝 DOCUMENTATION_GOVERNANCE.md
│   │   ├── 📝 DOCUMENTATION_ORGANIZATION_COMPLETE.md
│   │   ├── 📝 DOCUMENTATION_REORGANIZATION_COMPLETE.md
│   │   ├── 📝 DOCUMENTATION_REORGANIZATION_PLAN.md
│   │   └── 📖 README.md
│   ├── 07-MONITORING/
│   │   ├── observability/
│   │   ├── 📝 accessibility-audit-report.md
│   │   ├── 📝 BEST_PRACTICES_IMPLEMENTATION_AUDIT.md
│   │   ├── 📝 COMPONENT_AUDIT_COMPLETION_REPORT.md
│   │   ├── ⚙️ eslint-report.json
│   │   ├── 📝 INDIVIDUAL_COMPONENT_BEST_PRACTICES_AUDIT.md
│   │   ├── ⚙️ lint-analysis.json
│   │   ├── ⚙️ lint-metrics-badge.json
│   │   ├── ⚙️ lint-out.json
│   │   ├── ⚙️ lint-report.json
│   │   ├── ⚙️ lint-results.json
│   │   ├── 📝 OBS-012-DEPLOYMENT-STATUS.md
│   │   ├── 📝 OBS-012-IMPLEMENTATION-REPORT.md
│   │   ├── ⚙️ phase2b_scan.json
│   │   ├── ⚙️ pyright-output.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ type-bridge-report.json
│   ├── 08-SECURITY/
│   │   ├── privacy/
│   │   ├── security/
│   │   ├── 📖 README.md
│   │   └── 📝 SEC-006-IMPLEMENTATION-REPORT.md
│   ├── 99-REFERENCE/
│   │   ├── 📝 AI-COORDINATION-RULES.md
│   │   ├── 📝 AI-PARALLEL-LINT-COORDINATION.md
│   │   ├── 📝 AI_COORDINATION_QUICK_START.md
│   │   ├── 📝 DATA-FLOW-QUICK-START.md
│   │   ├── 📝 data-flow-visualization.md
│   │   ├── 📝 QUICK_REFERENCE.md
│   │   ├── 📖 README-AI.md
│   │   └── 📖 README.md
│   └── archive/
├── ephe/
├── ephemeris_server/
│   ├── 🐍 __init__.py
│   ├── 🐍 debug_validation.py
│   ├── 🐳 Dockerfile
│   ├── 🐍 main.py
│   ├── 🐍 models.py
│   ├── 📄 requirements.txt
│   └── 🐍 service.py
├── final_privacy_audit_post_improvements/
│   ├── 📝 gdpr_compliance_report.md
│   ├── 📝 PRIV006_executive_summary.md
│   ├── 📝 privacy_audit_report.md
│   ├── ⚙️ privacy_audit_results.json
│   └── 📝 risk_analysis_report.md
├── metrics/
│   ├── ⚙️ any-usage-baseline.json
│   ├── ⚙️ bundle-analysis-after-cleanup.json
│   ├── ⚙️ bundle-analysis-baseline.json
│   ├── ⚙️ bundle-size-current.json
│   ├── ⚙️ bundle-size-previous.json
│   ├── ⚙️ bundle-size-report.json
│   ├── ⚙️ coverage-badge.json
│   ├── ⚙️ coverage-projects.json
│   ├── 📝 COVERAGE_REPORT.md
│   ├── ⚙️ daily-metrics-2025-08-19.json
│   ├── ⚙️ perf-001-orchestration.json
│   ├── ⚙️ perf-002-cleanup-report.json
│   ├── ⚙️ perf-002-implementation-report.json
│   ├── ⚙️ performance-dashboard-2025-08-26T15-11-31.json
│   ├── ⚙️ performance-dashboard.json
│   ├── ⚙️ tree-shaking-analysis.json
│   ├── ⚙️ type-errors-baseline.json
│   └── ⚙️ type-errors-current.json
├── packages/
│   ├── analytics/
│   │   ├── src/
│   │   ├── 📝 ANALYTICS_PROVIDER_IMPROVEMENTS.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ tsconfig.json
│   ├── auth/
│   │   ├── src/
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.base.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   └── ⚙️ tsconfig.json
│   ├── config/
│   │   ├── scripts/
│   │   ├── src/
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── 🔷 vite-env.d.ts
│   ├── hooks/
│   │   ├── scripts/
│   │   ├── src/
│   │   ├── 🟨 demo_hook_integration.mjs
│   │   ├── 📝 IMPLEMENTATION_COMPLETE.md
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   └── ⚙️ tsconfig.json
│   ├── integrations/
│   │   ├── src/
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   └── ⚙️ tsconfig.json
│   ├── personalization/
│   │   ├── src/
│   │   ├── 📝 INTEGRATION_SUMMARY.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ tsconfig.json
│   ├── pwa/
│   │   ├── src/
│   │   ├── 📝 ADR-0001-pwa-consolidation.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ tsconfig.json
│   ├── types/
│   │   ├── src/
│   │   ├── 📝 CHANGELOG.md
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   └── ⚙️ tsconfig.json
│   └── ui/
│       ├── scripts/
│       ├── src/
│       ├── 📝 COMPONENT_ORGANIZATION.md
│       ├── 📦 package.json
│       ├── ⚙️ tsconfig.build.json
│       ├── ⚙️ tsconfig.eslint.json
│       └── ⚙️ tsconfig.json
├── privacy_audit_results/
│   ├── 📝 gdpr_compliance_report.md
│   ├── 📝 PRIV006_executive_summary.md
│   ├── 📝 privacy_audit_report.md
│   ├── ⚙️ privacy_audit_results.json
│   └── 📝 risk_analysis_report.md
├── privacy_automation_results/
│   ├── ⚙️ privacy_assessment_20250825_105918.json
│   └── ⚙️ privacy_dashboard_20250825_105918.json
├── privacy_enhancements/
│   ├── ⚙️ gdpr_compliance_improvement_report_20250825_104716.json
│   └── ⚙️ pseudonymization_enhancement_report_20250825_104534.json
├── schema/
│   ├── ⚙️ env.schema.json
│   └── ⚙️ experiment-registry.schema.json
├── scripts/
│   ├── debug/
│   │   ├── 🟨 debug_data_flow.mjs
│   │   └── 🟨 debug_normalization.js
│   ├── lib/
│   │   ├── 🔷 build-lint-badge.d.ts
│   │   └── 🟨 build-lint-badge.mjs
│   ├── load/
│   │   ├── 🟨 baseline.js
│   │   └── 🟨 stress.js
│   ├── observability/
│   │   ├── 🐍 analyze_synthetic.py
│   │   ├── 🐍 daily_synthetic_rollup.py
│   │   ├── 🐍 generate_slo_report.py
│   │   ├── 🔧 run_synthetic.sh
│   │   └── 🐍 synthetic_journey.py
│   ├── security/
│   │   ├── 🐍 check_secret_ages.py
│   │   ├── 🐍 list_secrets.py
│   │   ├── 🐍 rotate_salts.py
│   │   └── 🔧 rotate_salts.sh
│   ├── temp-fixes/
│   │   ├── 🟨 fix-all-jsx-errors.mjs
│   │   ├── 🟨 fix-analysis-counts.js
│   │   ├── 🔧 fix-healwave-console.sh
│   │   └── 🟨 fix-jsx-syntax.js
│   ├── 🟨 component-analysis.js
│   ├── 🟨 consolidate-scripts.mjs
│   ├── 🟨 consolidate-tsconfigs.mjs
│   ├── ⚙️ coverage-baseline.json
│   ├── 🟨 enhance-scripts.mjs
│   ├── 🔧 init-spiritual-003-instance-1.sh
│   ├── 🟨 migrate-to-tools.mjs
│   ├── 🐍 type-bridge-generator.py
│   └── 🔧 update-ui-imports.sh
├── scripts-backup-2025-09-02/
│   ├── 🟨 accessibility-audit.mjs
│   ├── 🟨 ai-agent-lint-coordinator.mjs
│   ├── 🟨 ai-agent-preprocessor.mjs
│   ├── 🟨 any-count-ratchet.mjs
│   ├── 🐍 benchmark_vectorized_synastry.py
│   ├── 🔧 build-mobile-app.sh
│   ├── 🔧 build-packages-workaround.sh
│   ├── 🔧 build-packages.sh
│   ├── 🟨 bundle-analyzer.mjs
│   ├── 🟨 bundle-size-check.mjs
│   ├── 🟨 bundle-size-monitor.mjs
│   ├── 🔧 cleanup-ai-coordination.sh
│   ├── 🔧 cleanup-project.sh
│   ├── 🐍 collect-metrics.py
│   ├── 🟨 consolidate-scripts.mjs
│   ├── 🟨 coverage-badge.mjs
│   ├── 🟨 coverage-ratchet-check.mjs
│   ├── 🟨 coverage-ratchet.mjs
│   ├── 🟨 coverage-report.mjs
│   ├── 🔧 deploy-mobile-final.sh
│   ├── 🟨 deps-report.mjs
│   ├── 🐍 doc_freshness.py
│   ├── 🟨 enhance-scripts.mjs
│   ├── 🟨 enhanced-coordination-workflow.mjs
│   ├── 🟨 fail-usage-guard.mjs
│   ├── 🔧 fast-docker-build.sh
│   ├── 🟨 fix-accessibility-issues.mjs
│   ├── 🟨 fix-console-statements.js
│   ├── 🟨 fix-critical-accessibility.mjs
│   ├── 🟨 fix-keyboard-support.mjs
│   ├── 🔧 generate-pwa-icons.sh
│   ├── 🐍 generate_active_priorities_index.py
│   ├── 🔧 git-auto-worktree.sh
│   ├── 🟨 lint-badge.mjs
│   ├── 🟨 lint-changed-strict.mjs
│   ├── 🟨 lint-delta.mjs
│   ├── 🟨 lint-guard.mjs
│   ├── 🟨 lint-parallel-batches.mjs
│   ├── 🟨 lint-ratchet.mjs
│   ├── 🟨 lint-update-doc.mjs
│   ├── 🔧 manage-worktree.sh
│   ├── 🐍 micro-benchmark.py
│   ├── 🔧 organize-docs-properly.sh
│   ├── 🔧 organize-docs.sh
│   ├── 🟨 perf-001-orchestrator.mjs
│   ├── 🟨 perf-002-orchestrator.mjs
│   ├── 🟨 performance-dashboard.mjs
│   ├── 🔧 pre_commit_docs.sh
│   ├── 🟨 project-cleanup.mjs
│   ├── 🟨 refresh-agent-analysis.mjs
│   ├── 🔧 rotate-logs.sh
│   ├── 🔧 safe-coordination.sh
│   ├── 🔧 setup-mobile-deployment.sh
│   ├── 🟨 smart-agent-rebalancer.mjs
│   ├── 🟨 strict-summary.mjs
│   ├── 🔧 submit-to-app-stores.sh
│   ├── 🟨 surgical-recovery.mjs
│   ├── 🟨 sync-env.mjs
│   ├── 🟨 tree-shaking-analyzer.mjs
│   ├── 🟨 tree-shaking-cleanup.mjs
│   ├── 🟨 type-error-ratchet.mjs
│   ├── 🟨 type-ratchet.mjs
│   ├── 🟨 typecheck.mjs
│   ├── 🐍 update_priorities_snapshot.py
│   ├── 🟨 validate-env-schema.mjs
│   ├── 🟨 validate-env.mjs
│   ├── 🟨 validate-experiments.mjs
│   ├── 🔧 validate_ai_coord_filenames.sh
│   ├── 🔧 verify-analysis-files.sh
│   └── 🟨 verify-import-fix.js
├── tools/
│   ├── deployment/
│   │   ├── 🔧 deploy-mobile-final.sh
│   │   ├── 🔧 git-auto-worktree.sh
│   │   ├── 🔧 manage-worktree.sh
│   │   ├── 🔧 setup-mobile-deployment.sh
│   │   └── 🔧 submit-to-app-stores.sh
│   ├── development/
│   │   ├── 🟨 ai-agent-lint-coordinator.mjs
│   │   ├── 🟨 ai-agent-preprocessor.mjs
│   │   ├── 🔧 cleanup-ai-coordination.sh
│   │   ├── 🟨 consolidate-scripts.mjs
│   │   ├── 🟨 enhance-scripts.mjs
│   │   ├── 🟨 enhanced-coordination-workflow.mjs
│   │   ├── 🟨 fail-usage-guard.mjs
│   │   ├── 🟨 fix-console-statements.js
│   │   ├── 🟨 lint-badge.mjs
│   │   ├── 🟨 lint-changed-strict.mjs
│   │   ├── 🟨 lint-delta.mjs
│   │   ├── 🟨 lint-guard.mjs
│   │   ├── 🟨 lint-parallel-batches.mjs
│   │   ├── 🟨 lint-ratchet.mjs
│   │   ├── 🟨 lint-update-doc.mjs
│   │   ├── 🟨 refresh-agent-analysis.mjs
│   │   ├── 🔧 safe-coordination.sh
│   │   ├── 🟨 smart-agent-rebalancer.mjs
│   │   ├── 🟨 validate-env-schema.mjs
│   │   ├── 🟨 validate-env.mjs
│   │   ├── 🟨 validate-experiments.mjs
│   │   └── 🟨 verify-import-fix.js
│   ├── documentation/
│   ├── maintenance/
│   │   ├── 🟨 any-count-ratchet.mjs
│   │   ├── 🔧 cleanup-project.sh
│   │   ├── 🐍 collect-metrics.py
│   │   ├── 🟨 coverage-badge.mjs
│   │   ├── 🟨 coverage-ratchet-check.mjs
│   │   ├── 🟨 coverage-ratchet.mjs
│   │   ├── 🟨 coverage-report.mjs
│   │   ├── 🟨 deps-report.mjs
│   │   ├── 🐍 detect-duplicates.py
│   │   ├── 🐍 doc_freshness.py
│   │   ├── 🐍 generate-project-tree.py
│   │   ├── 🔧 generate-project-tree.sh
│   │   ├── 🐍 generate_active_priorities_index.py
│   │   ├── 🔧 organize-docs-properly.sh
│   │   ├── 🔧 organize-docs.sh
│   │   ├── 🔧 pre_commit_docs.sh
│   │   ├── 🟨 project-cleanup.mjs
│   │   ├── 🔧 rotate-logs.sh
│   │   ├── 🟨 strict-summary.mjs
│   │   ├── 🟨 surgical-recovery.mjs
│   │   ├── 🟨 sync-env.mjs
│   │   ├── 🟨 type-error-ratchet.mjs
│   │   ├── 🟨 type-ratchet.mjs
│   │   ├── 🟨 update-script-paths.mjs
│   │   ├── 🐍 update_priorities_snapshot.py
│   │   ├── 🔧 validate_ai_coord_filenames.sh
│   │   └── 🔧 verify-analysis-files.sh
│   ├── metrics/
│   │   ├── ⚙️ bundle-size-current.json
│   │   ├── ⚙️ bundle-size-previous.json
│   │   └── ⚙️ bundle-size-report.json
│   ├── performance/
│   │   ├── 🐍 benchmark_vectorized_synastry.py
│   │   ├── 🐍 micro-benchmark.py
│   │   ├── 🟨 perf-001-orchestrator.mjs
│   │   ├── 🟨 perf-002-orchestrator.mjs
│   │   └── 🟨 performance-dashboard.mjs
│   ├── 🐍 data-flow-analyzer.py
│   ├── 🟨 fix-tool-paths.mjs
│   ├── 🔧 generate-data-flow-diagrams.sh
│   └── 📖 README.md
├── types/
│   └── 🔷 eslint-plugin-jsx-a11y.d.ts
├── typings/
│   ├── firebase_admin/
│   │   ├── 🐍 __about__.pyi
│   │   ├── 🐍 __init__.pyi
│   │   ├── 🐍 _auth_client.pyi
│   │   ├── 🐍 _auth_providers.pyi
│   │   ├── 🐍 _auth_utils.pyi
│   │   ├── 🐍 _http_client.pyi
│   │   ├── 🐍 _messaging_encoder.pyi
│   │   ├── 🐍 _messaging_utils.pyi
│   │   ├── 🐍 _retry.pyi
│   │   ├── 🐍 _rfc3339.pyi
│   │   ├── 🐍 _sseclient.pyi
│   │   ├── 🐍 _token_gen.pyi
│   │   ├── 🐍 _user_identifier.pyi
│   │   ├── 🐍 _user_import.pyi
│   │   ├── 🐍 _user_mgt.pyi
│   │   ├── 🐍 _utils.pyi
│   │   ├── 🐍 app_check.pyi
│   │   ├── 🐍 auth.pyi
│   │   ├── 🐍 credentials.pyi
│   │   ├── 🐍 db.pyi
│   │   ├── 🐍 exceptions.pyi
│   │   ├── 🐍 firestore.pyi
│   │   ├── 🐍 firestore_async.pyi
│   │   ├── 🐍 functions.pyi
│   │   ├── 🐍 instance_id.pyi
│   │   ├── 🐍 messaging.pyi
│   │   ├── 🐍 ml.pyi
│   │   ├── 🐍 project_management.pyi
│   │   ├── 🐍 remote_config.pyi
│   │   ├── 🐍 storage.pyi
│   │   └── 🐍 tenant_mgt.pyi
│   ├── redis/
│   │   └── 🐍 __init__.pyi
│   ├── swisseph/
│   │   └── 🐍 __init__.pyi
│   └── 📖 README.md
├── 📄 .dockerignore
├── 📄 .env.example
├── 📄 .gitignore
├── 🎨 analytics-demo.css
├── 🌐 analytics-demo.html
├── ⚙️ app.json
├── ⚙️ benchmark_synastry_baseline.json
├── 🐍 benchmark_vectorized.py
├── 📝 CHART_PROCESSING_HOOK_OPTIMIZATION_REPORT.md
├── 🔧 CODE-001-cleanup.sh
├── 📝 COMPONENT_ANALYSIS_REPORT.md
├── 📝 COSMIC_OPTIMIZATION_SUMMARY.md
├── 📝 cosmichub-structure.md
├── 📝 cosmichub-tree.md
├── 🎨 data-flow-visualization.css
├── 🌐 data-flow-visualization.html
├── 🌐 demo-ux-021.html
├── 🔧 deploy-dev.sh
├── ⚙️ deployment-manifest.json
├── ⚙️ docker-compose.dev.yml
├── ⚙️ docker-compose.yml
├── ⚙️ eas.json
├── 🟨 eslint.config.js
├── 📝 FEATUREGUARD_OPTIMIZATION_COMPLETE.md
├── ⚙️ firebase.json
├── 🟨 fix-lint-errors.js
├── 🔧 fix-md036.sh
├── 🐍 fix_all_remaining_lint.py
├── ⚙️ lint-analysis.json
├── 🔨 Makefile
├── 📝 NUMEROLOGY_CALCULATOR_OPTIMIZATION_COMPLETE.md
├── 📝 ONBOARDING_FLOW_OPTIMIZATION_COMPLETE.md
├── 📦 package.json
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
├── ⚙️ pyrightconfig.json
├── 📖 README.md
├── 🔧 restore_corrupted_files.sh
├── 🐍 run_priv_006.py
├── 📝 SPIRITUAL_CHART_OPTIMIZATION_COMPLETE.md
├── 🔧 start-dev.sh
├── 🟨 tailwind.config.shared.js
├── 🔷 tailwind.config.shared.ts
├── ⚙️ tsconfig.apps.json
├── ⚙️ tsconfig.base.json
├── ⚙️ tsconfig.eslint.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.packages.json
├── ⚙️ tsconfig.strict-incremental.json
├── ⚙️ turbo.json
├── ⚙️ type-bridge-report.json
└── 🔧 verify-css-migration.sh
```

## Project Statistics

- **Total Directories:** 256
- **Total Source Files:** 1622

### File Types Distribution

- **md:** 374 files
- **ts:** 303 files
- **tsx:** 282 files
- **py:** 176 files
- **json:** 125 files
- **mjs:** 88 files
- **html:** 79 files
- **sh:** 52 files
- **pyi:** 45 files
- **css:** 31 files
- **js:** 30 files
- **yml:** 13 files
- **yaml:** 2 files
- **txt:** 2 files
- **cjs:** 2 files
- **astro:** 2 files
- **toml:** 1 files
- **example:** 1 files
- **mdx:** 1 files

## Legend

### Icons

- 🔷 TypeScript files
- 🟨 JavaScript files
- 🐍 Python files
- 🚀 Astro components
- 💚 Vue components
- 🧡 Svelte components
- 🌐 HTML files
- 🎨 CSS/Style files
- 📝 Markdown files
- ⚙️ Configuration files
- 🔧 Shell scripts
- 🗄️ Database files
- 📊 GraphQL files
- 🐳 Docker files
- 📦 Package configuration
- 📖 Documentation
- 📄 Other files

### Excluded Items

The following are automatically excluded from the tree:

- Build artifacts (dist/, build/, .next/, etc.)
- Dependencies (node_modules/, .venv/, etc.)
- Temporary files (\*.log, cache/, **pycache**/, etc.)
- IDE files (.vscode/, .idea/, etc.)
- Version control (.git/, .svn/, etc.)
- Test files (_test_, _spec_, **tests**/, tests/)
- Hidden files (except important config files)
