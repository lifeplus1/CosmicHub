# CosmicHub Project Structure

---

## Project Structure (Tree View)

owner: docs
status: moved
last_reviewed: 2025-09-07
review_cycle: 90d
category: redirect
moved_to: docs/04-ARCHITECTURE/PROJECT-STRUCTURE.md
---

This document has moved. Please see docs/04-ARCHITECTURE/PROJECT-STRUCTURE.md
│   │   ├── 🌐 z_c810615cce0f7acb_salt_backend_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_salt_storage_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_aspect_utils_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_caching_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_composite_utils_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_memory_optimization_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_monitoring_py.html
│   │   ├── 🌐 z_c810615cce0f7acb_vectorized_multi_system_utils_py.html
│   │   ├── 🌐 z_d433a708de70faeb_test_presets_py.html
│   │   ├── 🌐 z_d433a708de70faeb_test_subscriptions_py.html
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
│   │   │   ├── dashboards/
│   │   │   ├── provisioning/
│   │   │   └── 📖 README.md
│   │   ├── prometheus/
│   │   │   ├── ⚙️ alert-rules-complete.yml
│   │   │   ├── ⚙️ alert-rules.yml
│   │   │   ├── ⚙️ alertmanager.yml
│   │   │   ├── ⚙️ blackbox.yml
│   │   │   ├── ⚙️ prometheus-complete.yml
│   │   │   └── ⚙️ prometheus.yml
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
│   ├── tests/
│   │   ├── test_healwave/
│   │   │   ├── 🐍 test_presets.py
│   │   │   └── 🐍 test_subscriptions.py
│   │   ├── 🐍 conftest.py
│   │   ├── 🐍 test__client_startup_smoke.py
│   │   ├── 🐍 test_ai_interpretations_core.py
│   │   ├── 🐍 test_analytics_api.py
│   │   ├── 🐍 test_analytics_api_extended.py
│   │   ├── 🐍 test_analytics_api_metrics.py
│   │   ├── 🐍 test_analytics_api_more.py
│   │   ├── 🐍 test_analytics_api_session_duration.py
│   │   ├── 🐍 test_analytics_error_paths.py
│   │   ├── 🐍 test_analytics_module.py
│   │   ├── 🐍 test_analytics_module_extended.py
│   │   ├── 🐍 test_analytics_session_end.py
│   │   ├── 🐍 test_analyze_synthetic_placeholder.py
│   │   ├── 🐍 test_auth_paths.py
│   │   ├── 🐍 test_calculations_cache.py
│   │   ├── 🐍 test_challenging_aspects.py
│   │   ├── 🐍 test_chart.py
│   │   ├── 🐍 test_chart_and_interpretation_flow.py
│   │   ├── 🐍 test_chart_save_direct.py
│   │   ├── 🐍 test_credentials.py
│   │   ├── 🐍 test_database_auth_env_transits.py
│   │   ├── 🐍 test_database_firestore_branch.py
│   │   ├── 🐍 test_endpoints.py
│   │   ├── 🐍 test_ephemeris_client.py
│   │   ├── 🐍 test_gene_keys_edge_cases.py
│   │   ├── 🐍 test_gene_keys_line_themes.py
│   │   ├── 🐍 test_human_design.py
│   │   ├── 🐍 test_interpretation_backward_compat.py
│   │   ├── 🐍 test_interpretations_api.py
│   │   ├── 🐍 test_metrics_interpretation.py
│   │   ├── 🐍 test_numerology.py
│   │   ├── 🐍 test_optimized_integration_phase3.py
│   │   ├── 🐍 test_parquet_exporter.py
│   │   ├── 🐍 test_personality.py
│   │   ├── 🐍 test_privacy_audit.py
│   │   ├── 🐍 test_pseudonymization.py
│   │   ├── 🐍 test_psychology_integration.py
│   │   ├── 🐍 test_salt_backend_selector.py
│   │   ├── 🐍 test_salt_management_api.py
│   │   ├── 🐍 test_salt_management_api_extended.py
│   │   ├── 🐍 test_salt_management_reload.py
│   │   ├── 🐍 test_saturn_mastery.py
│   │   ├── 🐍 test_security_settings_startup.py
│   │   ├── 🐍 test_serialization.py
│   │   ├── 🐍 test_serialization_simple.py
│   │   ├── 🐍 test_services.py
│   │   ├── 🐍 test_settings_edge_cases.py
│   │   ├── 🐍 test_startup_app.py
│   │   ├── 🐍 test_stripe_error_path.py
│   │   ├── 🐍 test_stripe_router.py
│   │   ├── 🐍 test_stripe_webhook_handlers.py
│   │   ├── 🐍 test_synastry_endpoints.py
│   │   ├── 🐍 test_synastry_type_bridge.py
│   │   ├── 🐍 test_synthetic_journey.py
│   │   ├── 🐍 test_synthetic_journey_placeholder.py
│   │   ├── 🐍 test_tcm_systems.py
│   │   ├── 🐍 test_transits_edge_cases.py
│   │   ├── 🐍 test_vectorized_caching_phase3.py
│   │   ├── 🐍 test_vectorized_memory_optimization_phase3.py
│   │   ├── 🐍 test_vectorized_monitoring_phase3.py
│   │   ├── 🐍 test_vectorized_synastry_comprehensive.py
│   │   ├── 🐍 test_vectorized_synastry_diff.py
│   │   ├── 🐍 test_vectorized_synastry_phase2.py
│   │   └── 🐍 test_websocket.py
│   ├── types/
│   │   ├── 🐍 astrology.py
│   │   ├── 🐍 human_design.py
│   │   └── 🐍 tcm_systems.py
│   ├── utils/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 adaptive_concurrency.py
│   │   ├── 🐍 api_result.py
│   │   ├── 🐍 aspect_utils.py
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
│   │   ├── 🐍 vectorized_aspect_utils.py
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
│   ├── 🐍 conftest.py
│   ├── ⚙️ COSMICHUB_PRIVACY_LEADERSHIP_SUMMARY.json
│   ├── 🐍 database.py
│   ├── 🐍 debug_auth.py
│   ├── 🐍 debug_endpoint.py
│   ├── 🐳 Dockerfile
│   ├── ⚙️ firebase.json
│   ├── ⚙️ firestore.indexes.json
│   ├── 🐍 gdpr_compliance_improvement.py
│   ├── ⚙️ integration_test_results.json
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
│   ├── 🐍 test_debug.py
│   ├── 🐍 test_fastapi_integration.py
│   ├── 🐍 test_firebase_auth_direct.py
│   ├── 🐍 test_hang_debug.py
│   ├── 🐍 test_integration.py
│   ├── 🐍 test_rel012_firebase_auth.py
│   ├── 🐍 test_simple_debug.py
│   ├── 🐍 test_spiritual_endpoints.py
│   ├── 🐍 test_synastry.py
│   ├── 🐍 test_synthesis_endpoint.py
│   ├── ⚙️ test_transit_request.json
│   ├── 🐍 test_transits.py
│   └── 🐍 validate_parquet_foundation.py
├── CODE-001-backup-20250902_121720/
│   ├── packages/
│   │   ├── frequency/
│   │   │   ├── src/
│   │   │   ├── 📦 package.json
│   │   │   ├── ⚙️ tsconfig.build.json
│   │   │   ├── ⚙️ tsconfig.json
│   │   │   └── ⚙️ tsconfig.test.json
│   │   ├── storage/
│   │   │   ├── src/
│   │   │   ├── 📦 package.json
│   │   │   └── ⚙️ tsconfig.json
│   │   └── subscriptions/
│   │       ├── src/
│   │       ├── 📦 package.json
│   │       └── ⚙️ tsconfig.json
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
│   │   │   ├── 📝 AI-COORDINATION-RULES.md
│   │   │   ├── 📝 AI_AGENT_COORDINATION_COMPLETE.md
│   │   │   ├── 📝 ANALYTICS-001-IMPLEMENTATION-COMPLETE.md
│   │   │   ├── 📝 CODE_REFACTOR_SUMMARY.md
│   │   │   ├── 📝 CONFIGURATION-CONSOLIDATION-COMPLETE.md
│   │   │   ├── 📝 DATA-001-IMPLEMENTATION-COMPLETE.md
│   │   │   ├── 📝 ENHANCED_COORDINATION_IMPLEMENTATION_COMPLETE.md
│   │   │   ├── 📝 PARALLEL_LINT_IMPLEMENTATION_SUMMARY.md
│   │   │   ├── 📝 PERF-002-IMPLEMENTATION-COMPLETE.md
│   │   │   ├── 📝 SPIRITUAL-002-PSYCHOLOGY-INTEGRATION-COMPLETE.md
│   │   │   ├── 📝 TAILWIND-CONSOLIDATION-COMPLETE.md
│   │   │   ├── 📝 TYPESCRIPT-CONSOLIDATION-COMPLETE.md
│   │   │   ├── 📝 TYPESCRIPT-WORKSPACE-CONSOLIDATION-PLAN.md
│   │   │   └── 📝 VITEST-WORKSPACE-IMPLEMENTATION-COMPLETE.md
│   │   ├── daily-updates/
│   │   │   └── 📝 2025-09-02-psychology-integration-complete.md
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
│   │   ├── 📝 E2E-TEST-PLAN.md
│   │   ├── 📝 GROK-Pre-Refactor-Tests.md
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
│   │   ├── 📝 TEST-001-PARALLEL-WORK-GUIDE.md
│   │   └── 📝 UX-020-IMPLEMENTATION-COMPLETE.md
│   ├── 03-GUIDES/
│   │   ├── data/
│   │   │   └── ⚙️ upgrade_modal_variants.json
│   │   ├── deployment/
│   │   │   ├── 📝 DEPLOYMENT_GUIDE.md
│   │   │   ├── 📝 docker-commands.md
│   │   │   └── 📝 DOCKER_OPTIMIZATION_SUMMARY.md
│   │   ├── environment-status/
│   │   │   └── 📝 ERROR_BOUNDARIES_STATUS.md
│   │   ├── experimentation/
│   │   │   ├── 📝 guardrails.md
│   │   │   ├── 📝 lifecycle.md
│   │   │   ├── 📝 registry.md
│   │   │   └── 📝 VALIDATION_SYSTEM.md
│   │   ├── feature-guides/
│   │   │   ├── 📝 AI_001_FEATURES_GUIDE.md
│   │   │   ├── 📝 AI_LAYERED_INTERPRETATION_ROADMAP.md
│   │   │   ├── 📝 AUTHENTICATION_IMPLEMENTATION_PLAN.md
│   │   │   ├── 📝 ENHANCED_USER_REGISTRATION.md
│   │   │   ├── 📝 FIREBASE_AUTH_FIX.md
│   │   │   ├── 📝 FREEMIUM_STRATEGY.md
│   │   │   ├── 📝 GROK_PROMPTS_READY_TO_USE.md
│   │   │   ├── 📝 interpretation-metrics-and-versioning.md
│   │   │   ├── 📝 MOCK_LOGIN_GUIDE.md
│   │   │   ├── 📝 STRIPE_TESTING_GUIDE.md
│   │   │   └── 📝 UI_COMPONENTS_GUIDE.md
│   │   ├── guides/
│   │   │   ├── 📝 HUMAN_DESIGN_88_DEGREE_PRECISION.md
│   │   │   ├── 📝 HUMAN_DESIGN_GENE_KEYS_SUMMARY.md
│   │   │   ├── 📝 NUMEROLOGY_GUIDE.md
│   │   │   └── 📝 NUMEROLOGY_IMPLEMENTATION.md
│   │   ├── mobile/
│   │   │   └── 📝 MOB-002_IMPLEMENTATION.md
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
│   │   ├── 📝 ENHANCED-TEST-RUNNER-COMPLETE.md
│   │   ├── 📝 ERROR_BOUNDARY_CONSOLIDATION_COMPLETE.md
│   │   ├── 📝 FEATUREGUARD_OPTIMIZATION_COMPLETE.md
│   │   ├── 📝 MEMOIZATION-IMPLEMENTATION-COMPLETE.md
│   │   ├── 📝 MULTI_SYSTEM_REFACTOR_IMPLEMENTATION_COMPLETE.md
│   │   ├── 📝 PARALLEL_AI_IMPLEMENTATION_REVIEW.md
│   │   ├── 📝 PSYCHOLOGY-TESTING-COMPLETE.md
│   │   ├── 📝 PSYCHOLOGY_INTEGRATION_SPECIALIST_COMPLETE.md
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
│   │   │   ├── 📝 SPIRITUAL-001-GROK-CONSULTATION-PROMPTS.md
│   │   │   ├── 📝 SPIRITUAL-001-GROK-RESPONSE-1-VALIDATION.md
│   │   │   ├── 📝 SPIRITUAL-001-GROK-RESPONSE-2-VALIDATION.md
│   │   │   ├── 📝 SPIRITUAL-001-GROK-RESPONSE-3-VALIDATION.md
│   │   │   └── 📝 SPIRITUAL-001-WEEK-1-VS-WEEK-2-CLARIFICATION.md
│   │   ├── 📝 AI-006-CICD-OPTIMIZATION.md
│   │   ├── 📝 AI-006-IMPLEMENTATION-ROADMAP.md
│   │   ├── 📝 AI-006-INTEGRATION-ALIGNMENT.md
│   │   ├── 📝 AI-006-INTEGRATION-ARCHITECTURE.md
│   │   ├── 📝 AI-006-PERFORMANCE-OPTIMIZATION.md
│   │   ├── 📝 AI-006-SECURITY-AUDITING.md
│   │   ├── 📝 AI-006-TESTING-STRATEGIES.md
│   │   ├── 📝 ANALYTICS-001-IMPLEMENTATION-GUIDE.md
│   │   ├── 📝 ANALYTICS-001-PLAN.md
│   │   ├── 📝 CHARTDISPLAY_REFACTORING_PLAN.md
│   │   ├── 📝 DATA-001-PARQUET-ARCHITECTURE-PLAN.md
│   │   ├── 📝 INTEGRATION_STRATEGY.md
│   │   ├── 📝 MULTI-SYSTEM-NAVIGATION-REFACTOR.md
│   │   └── 📝 PERF-002-TREE-SHAKING-PLAN.md
│   ├── 04-ARCHITECTURE/
│   │   ├── architecture/
│   │   │   └── 📝 MULTI_SYSTEM_ASTROLOGY.md
│   │   ├── architecture-and-planning/
│   │   │   ├── 📝 DEPLOYMENT_VALIDATION_REPORT.md
│   │   │   ├── 📝 ENVIRONMENT.md
│   │   │   ├── 📝 PROJECT_SUMMARY.md
│   │   │   └── 📝 STRUCTURE_CLEANUP_PLAN.md
│   │   ├── IMPLEMENTATION/
│   │   │   ├── 📝 AI_AGENT_COORDINATION_COMPLETE.md
│   │   │   ├── 📝 ANALYTICS-001-IMPLEMENTATION-COMPLETE.md
│   │   │   ├── 📝 CONFIGURATION-CONSOLIDATION-COMPLETE.md
│   │   │   ├── 📝 ENHANCED_COORDINATION_IMPLEMENTATION_COMPLETE.md
│   │   │   ├── 📝 INDEX.md
│   │   │   ├── 📝 PARALLEL_LINT_IMPLEMENTATION_SUMMARY.md
│   │   │   ├── 📝 PERF-002-IMPLEMENTATION-COMPLETE.md
│   │   │   ├── 📝 TAILWIND-CONSOLIDATION-COMPLETE.md
│   │   │   ├── 📝 TYPESCRIPT-CONSOLIDATION-COMPLETE.md
│   │   │   └── 📝 VITEST-WORKSPACE-IMPLEMENTATION-COMPLETE.md
│   │   ├── REFACTOR/
│   │   │   └── 📝 CODE_REFACTOR_SUMMARY.md
│   │   ├── 📝 AGENT_ANALYSIS_SYNC_PREVENTION.md
│   │   ├── 📝 ApiResult-Unification-Complete.md
│   │   ├── 📝 CONCURRENCY_MODEL_SPEC.md
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
│   │   └── 📝 VITEST-WORKSPACE-SETUP.md
│   ├── 05-ARCHIVE/
│   │   ├── completed-implementations/
│   │   │   ├── code-implementations/
│   │   │   ├── parallel-ai-2025-09/
│   │   │   └── spiritual-systems/
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
│   │   ├── 📝 HOOK_TESTING_COMPLETE.md
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
│   │   │   ├── 📝 capacity-planning.md
│   │   │   └── 📝 degradation-matrix.md
│   │   ├── runbooks/
│   │   │   ├── 📝 postmortem-template.md
│   │   │   ├── 📝 template.md
│   │   │   └── 📝 unified-serialization-interpretations.md
│   │   ├── 📝 CONSOLE_TO_LOG_MIGRATION.md
│   │   ├── 📝 DEPLOY-PARALLEL-AI-SPECIALISTS.md
│   │   ├── 📝 DOCUMENTATION_DEDUP_MOVE_PLAN.md
│   │   ├── 📝 DOCUMENTATION_GOVERNANCE.md
│   │   ├── 📝 DOCUMENTATION_ORGANIZATION_COMPLETE.md
│   │   ├── 📝 DOCUMENTATION_REORGANIZATION_COMPLETE.md
│   │   ├── 📝 DOCUMENTATION_REORGANIZATION_PLAN.md
│   │   └── 📖 README.md
│   ├── 07-MONITORING/
│   │   ├── observability/
│   │   │   ├── 📝 logging-spec.md
│   │   │   └── 📝 slo-policy.md
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
│   │   │   ├── 📝 data-classification.md
│   │   │   └── 📝 pseudonymization.md
│   │   ├── security/
│   │   │   ├── 📝 csp-rollout.md
│   │   │   ├── 📝 secret-rotation.md
│   │   │   └── 📝 threat-model.md
│   │   ├── 📖 README.md
│   │   └── 📝 SEC-006-IMPLEMENTATION-REPORT.md
│   ├── 99-REFERENCE/
│   │   ├── 📝 AI-ACCESSIBILITY-SPECIALIST-PROMPT.md
│   │   ├── 📝 AI-COORDINATION-RULES.md
│   │   ├── 📝 AI-IMPORT-SPECIALIST-PROMPT.md
│   │   ├── 📝 AI-PARALLEL-LINT-COORDINATION.md
│   │   ├── 📝 AI-REACT-SPECIALIST-PROMPT.md
│   │   ├── 📝 AI-TEST-SPECIALIST-PROMPT.md
│   │   ├── 📝 AI-TYPE-SAFETY-SPECIALIST-PROMPT.md
│   │   ├── 📝 AI_COORDINATION_QUICK_START.md
│   │   ├── 📝 AI_CULTURAL_RESEARCH_SPECIALIST_REPORT.md
│   │   ├── 📝 DATA-FLOW-QUICK-START.md
│   │   ├── 📝 data-flow-visualization.md
│   │   ├── 📝 QUICK_REFERENCE.md
│   │   ├── 📖 README-AI.md
│   │   └── 📖 README.md
│   └── archive/
├── ephe/
├── ephemeris_server/
│   ├── tests/
│   │   ├── 🐍 __init__.py
│   │   ├── 🐍 conftest.py
│   │   ├── 🐍 test_endpoints.py
│   │   └── 🐍 test_service.py
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
│   ├── ⚙️ audit-latest.json
│   ├── ⚙️ bundle-analysis-after-cleanup.json
│   ├── ⚙️ bundle-analysis-baseline.json
│   ├── ⚙️ bundle-size-current.json
│   ├── ⚙️ bundle-size-previous.json
│   ├── ⚙️ bundle-size-report.json
│   ├── ⚙️ coverage-badge.json
│   ├── ⚙️ coverage-projects.json
│   ├── 📝 COVERAGE_REPORT.md
│   ├── ⚙️ daily-metrics-2025-08-19.json
│   ├── ⚙️ outdated-latest.json
│   ├── ⚙️ perf-001-orchestration.json
│   ├── ⚙️ perf-002-cleanup-report.json
│   ├── ⚙️ perf-002-implementation-report.json
│   ├── ⚙️ performance-dashboard-2025-08-26T15-11-31.json
│   ├── ⚙️ performance-dashboard.json
│   ├── ⚙️ test-run-performance.json
│   ├── ⚙️ tree-shaking-analysis.json
│   ├── ⚙️ type-errors-baseline.json
│   └── ⚙️ type-errors-current.json
├── packages/
│   ├── analytics/
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   ├── dashboards/
│   │   │   ├── events/
│   │   │   ├── react/
│   │   │   ├── types/
│   │   │   ├── 🔷 AnalyticsService.ts
│   │   │   └── 🔷 index.ts
│   │   ├── 📝 ANALYTICS_PROVIDER_IMPROVEMENTS.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   ├── ⚙️ tsconfig.json
│   │   └── ⚙️ tsconfig.test.json
│   ├── auth/
│   │   ├── src/
│   │   │   ├── 🔷 auth-context.tsx
│   │   │   ├── 🔷 create-auth-context.tsx
│   │   │   ├── 🔷 index.tsx
│   │   │   ├── 🔷 subscription-utils.test.ts
│   │   │   ├── 🔷 subscription-utils.ts
│   │   │   └── 🔷 SubscriptionProvider.tsx
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.base.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── ⚙️ tsconfig.test.json
│   ├── config/
│   │   ├── scripts/
│   │   │   └── 🟨 copy-dts.mjs
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   ├── component-library/
│   │   │   ├── firebase/
│   │   │   ├── hooks/
│   │   │   ├── lazy-loading/
│   │   │   ├── optimization/
│   │   │   ├── performance/
│   │   │   ├── storage/
│   │   │   ├── subscriptions/
│   │   │   ├── testing/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── 🔷 accessibility-testing.tsx
│   │   │   ├── 🔷 api-result.ts
│   │   │   ├── 🔷 api.ts
│   │   │   ├── 🔷 background-sync-enhanced.ts
│   │   │   ├── 🔷 bundle-optimization.ts
│   │   │   ├── 🔷 caching-service-worker.ts
│   │   │   ├── 🔷 component-library.d.ts
│   │   │   ├── 🟨 component-library.js
│   │   │   ├── 🔷 component-library.tsx
│   │   │   ├── 🔷 config.ts
│   │   │   ├── 🔷 constants.ts
│   │   │   ├── 🔷 enhanced-testing.tsx
│   │   │   ├── 🔷 env.ts
│   │   │   ├── 🔷 featureKeys.ts
│   │   │   ├── 🔷 firebase.d.ts
│   │   │   ├── 🟨 firebase.js
│   │   │   ├── 🔷 firebase.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🔷 lazy-loading.d.ts
│   │   │   ├── 🟨 lazy-loading.js
│   │   │   ├── 🔷 lazy-loading.tsx
│   │   │   ├── 🔷 notification-stats.ts
│   │   │   ├── 🔷 performance.d.ts
│   │   │   ├── 🟨 performance.js
│   │   │   ├── 🔷 performance.ts
│   │   │   ├── 🔷 production-deployment.ts
│   │   │   ├── 🔷 push-notifications.ts
│   │   │   ├── 🔷 react-performance.tsx
│   │   │   ├── 🔷 types.ts
│   │   │   └── 🔷 vite-env.d.ts
│   │   ├── test-results/
│   │   │   └── 🌐 test-report.html
│   │   ├── test-results-temp/
│   │   │   ├── 🌐 test-report.html
│   │   │   └── ⚙️ test-report.json
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   ├── ⚙️ tsconfig.test.json
│   │   └── 🔷 vite-env.d.ts
│   ├── hooks/
│   │   ├── dist-test/
│   │   │   ├── 🔷 useChartProcessing.d.ts
│   │   │   └── 🟨 useChartProcessing.js
│   │   ├── scripts/
│   │   │   └── 🟨 fix-imports.js
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   ├── spiritual/
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🔷 simple.test.ts
│   │   │   ├── 🔷 useAIInterpretationManager.ts
│   │   │   ├── 🔷 useChartProcessing.test.ts
│   │   │   ├── 🔷 useChartProcessing.ts
│   │   │   └── 🔷 useStateValidation.ts
│   │   ├── test-dist/
│   │   │   ├── __tests__/
│   │   │   ├── 🔷 index.d.ts
│   │   │   ├── 🟨 index.js
│   │   │   ├── 🔷 simple.test.d.ts
│   │   │   ├── 🟨 simple.test.js
│   │   │   ├── 🔷 useAIInterpretationManager.d.ts
│   │   │   ├── 🟨 useAIInterpretationManager.js
│   │   │   ├── 🔷 useChartProcessing.d.ts
│   │   │   ├── 🟨 useChartProcessing.js
│   │   │   ├── 🔷 useChartProcessing.test.d.ts
│   │   │   ├── 🟨 useChartProcessing.test.js
│   │   │   ├── 🔷 useStateValidation.d.ts
│   │   │   └── 🟨 useStateValidation.js
│   │   ├── 🟨 demo_hook_integration.mjs
│   │   ├── 📝 IMPLEMENTATION_COMPLETE.md
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── ⚙️ tsconfig.test.json
│   ├── integrations/
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   ├── frequency/
│   │   │   ├── utils/
│   │   │   ├── 🔷 aiEnhancedService.ts
│   │   │   ├── 🔷 api.ts
│   │   │   ├── 🔷 cross-app-hooks.ts
│   │   │   ├── 🔷 cross-app-store.ts
│   │   │   ├── 🔷 enhanced-ephemeris-cache.ts
│   │   │   ├── 🔷 enhanced-index.ts
│   │   │   ├── 🔷 ephemeris.ts
│   │   │   ├── 🔷 firestore-optimizer.ts
│   │   │   ├── 🔷 healwave.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🔷 stripe.ts
│   │   │   ├── 🔷 subscriptions.ts
│   │   │   ├── 🔷 types.ts
│   │   │   ├── 🔷 useCrossAppStore.ts
│   │   │   └── 🔷 xaiService.ts
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── ⚙️ tsconfig.test.json
│   ├── personalization/
│   │   ├── src/
│   │   │   ├── analytics/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   ├── 🔷 adaptive-ui.ts
│   │   │   ├── 🔷 behavior-tracker.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🔷 insight-engine.ts
│   │   │   ├── 🔷 metrics.ts
│   │   │   ├── 🔷 personalization-service.ts
│   │   │   ├── 🔷 spiritual-ai-bridge.ts
│   │   │   └── 🔷 types.ts
│   │   ├── 📝 INTEGRATION_SUMMARY.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ tsconfig.json
│   ├── pwa/
│   │   ├── src/
│   │   │   ├── 🔷 capabilities.test.ts
│   │   │   ├── 🔷 capabilities.ts
│   │   │   ├── 🔷 core.ts
│   │   │   ├── 🔷 engagement.banner.test.ts
│   │   │   ├── 🔷 engagement.test.ts
│   │   │   ├── 🔷 engagement.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🎨 mobile-enhancements.css
│   │   │   ├── 🔷 mobile-enhancements.ts
│   │   │   ├── 🔷 mobile.ts
│   │   │   ├── 🔷 pwa.integration.test.ts
│   │   │   └── 🔷 ui.ts
│   │   ├── 📝 ADR-0001-pwa-consolidation.md
│   │   ├── 📦 package.json
│   │   ├── 📖 README.md
│   │   └── ⚙️ tsconfig.json
│   ├── types/
│   │   ├── src/
│   │   │   ├── __tests__/
│   │   │   ├── 🔷 astrology.types.ts
│   │   │   ├── 🔷 backend-types.ts
│   │   │   ├── 🔷 birth.ts
│   │   │   ├── 🔷 data-flow.types.ts
│   │   │   ├── 🔷 experiment-validators.ts
│   │   │   ├── 🔷 experiments.ts
│   │   │   ├── 🔷 index.ts
│   │   │   ├── 🔷 psychology-ui.types.ts
│   │   │   ├── 🔷 psychology.types.ts
│   │   │   ├── 🔷 serialize.test.ts
│   │   │   ├── 🔷 serialize.ts
│   │   │   ├── 🔷 spiritual-ai.ts
│   │   │   ├── 🔷 spiritual-education.ts
│   │   │   ├── 🔷 spiritual-practices.ts
│   │   │   ├── 🔷 tcm-systems.types.ts
│   │   │   ├── 🔷 type-guards.ts
│   │   │   └── 🔷 utility.ts
│   │   ├── 📝 CHANGELOG.md
│   │   ├── 📦 package.json
│   │   ├── ⚙️ tsconfig.build.json
│   │   ├── ⚙️ tsconfig.json
│   │   └── ⚙️ tsconfig.test.json
│   └── ui/
│       ├── scripts/
│       │   ├── 🔧 build-phase1.sh
│       │   └── 🟨 ignoreErrors.js
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── styles/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── 🔷 index.ts
│       │   └── 🔷 minimal-exports.ts
│       ├── 📝 COMPONENT_ORGANIZATION.md
│       ├── 📦 package.json
│       ├── ⚙️ tsconfig.build.json
│       ├── ⚙️ tsconfig.eslint.json
│       ├── ⚙️ tsconfig.json
│       └── ⚙️ tsconfig.test.json
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
│   ├── 🟨 run-all-tests.mjs
│   ├── 🔧 safe-coordination.sh
│   ├── 🔧 setup-mobile-deployment.sh
│   ├── 🟨 smart-agent-rebalancer.mjs
│   ├── 🟨 strict-summary.mjs
│   ├── 🔧 submit-to-app-stores.sh
│   ├── 🟨 surgical-recovery.mjs
│   ├── 🟨 sync-env.mjs
│   ├── 🔧 test-mobile-app.sh
│   ├── 🔧 test-notifications.sh
│   ├── 🔧 test-pwa.sh
│   ├── 🐍 test_multi_system_integration.py
│   ├── 🐍 test_vectorized_multi_system.py
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
├── test-results/
│   ├── ⚙️ enhanced-test-suite-results.json
│   ├── 🌐 test-report.html
│   └── ⚙️ test-summary.json
├── test-results-temp/
│   ├── 🌐 test-report.html
│   └── ⚙️ test-report.json
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   │   └── experiments/
│   │       └── ⚙️ ai_interpretation_test.json
│   ├── integration/
│   │   ├── 🔷 healwave-astro-integration.test.ts
│   │   └── 🔷 test-integration.ts
│   ├── 🟨 BROWSER_TEST_INSTRUCTIONS.mjs
│   ├── 🟨 INTEGRATION_TEST_COMPLETE.mjs
│   ├── 🐍 test_api_line_themes.py
│   ├── 🐍 test_charts_endpoint.py
│   ├── 🟨 test_final_fix.mjs
│   ├── 🐍 test_line_themes.py
│   ├── 🟨 test_points_frontend.mjs
│   ├── 🟨 TEST_useChartProcessing_COMPREHENSIVE.mjs
│   ├── 🐍 test_vectorized_composite_charts.py
│   └── 🐍 test_vectorized_synastry_integration.py
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
│   ├── testing/
│   │   ├── 🟨 accessibility-audit.mjs
│   │   ├── 🟨 fix-accessibility-issues.mjs
│   │   ├── 🟨 fix-critical-accessibility.mjs
│   │   ├── 🟨 fix-keyboard-support.mjs
│   │   ├── 🟨 run-all-tests.mjs
│   │   ├── 🔧 test-mobile-app.sh
│   │   ├── 🔧 test-notifications.sh
│   │   ├── 🔧 test-pwa.sh
│   │   ├── 🐍 test_multi_system_integration.py
│   │   ├── 🐍 test_vectorized_multi_system.py
│   │   └── 🟨 typecheck.mjs
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
│   │   ├── 🐍_rfc3339.pyi
│   │   ├── 🐍 _sseclient.pyi
│   │   ├── 🐍_token_gen.pyi
│   │   ├── 🐍_user_identifier.pyi
│   │   ├── 🐍_user_import.pyi
│   │   ├── 🐍_user_mgt.pyi
│   │   ├── 🐍_utils.pyi
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
├── 🟨 logger-integration-test.js
├── 🔨 Makefile
├── 📝 NUMEROLOGY_CALCULATOR_OPTIMIZATION_COMPLETE.md
├── 📝 ONBOARDING_FLOW_OPTIMIZATION_COMPLETE.md
├── 📦 package.json
├── ⚙️ pnpm-lock.yaml
├── ⚙️ pnpm-workspace.yaml
├── ⚙️ pyrightconfig.json
├── 📖 README.md
├── 🔧 restore_corrupted_files.sh
├── 🔧 run-enhanced-tests.sh
├── 🐍 run_priv_006.py
├── 📝 SPIRITUAL_CHART_OPTIMIZATION_COMPLETE.md
├── 🔧 start-dev.sh
├── 🟨 tailwind.config.shared.js
├── 🔷 tailwind.config.shared.ts
├── 🌐 test-analytics.html
├── 🌐 test-logger.html
├── ⚙️ test-runner.json
├── 🟨 test_psychology_integration.js
├── ⚙️ tsconfig.apps.json
├── ⚙️ tsconfig.base.json
├── ⚙️ tsconfig.eslint.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.packages.json
├── ⚙️ tsconfig.strict-incremental.json
├── ⚙️ tsconfig.test.base.json
├── ⚙️ turbo.json
├── ⚙️ type-bridge-report.json
├── 🔧 verify-css-migration.sh
└── 🔷 vitest.workspace.ts

```text

## Project Statistics

- **Total Directories:** 305
- **Total Source Files:** 2047

### File Types Distribution

- **ts:** 404 files
- **md:** 397 files
- **tsx:** 368 files
- **py:** 273 files
- **json:** 146 files
- **html:** 141 files
- **mjs:** 102 files
- **sh:** 59 files
- **pyi:** 45 files
- **js:** 42 files
- **css:** 33 files
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
- Hidden files (except important config files)
