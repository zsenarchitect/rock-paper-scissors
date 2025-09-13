#!/bin/bash

# Assign issues to milestones and add labels

echo "🏷️ Assigning issues to milestones and adding labels..."

# Phase 1 Issues
echo "📋 Phase 1 Issues:"
gh issue edit 3 --milestone "Phase 1: Core Foundation" --add-label "phase-1,enhancement,openai,commentary,voice"

# Phase 2 Issues
echo "📋 Phase 2 Issues:"
gh issue edit 4 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,frontend,typescript,migration"
gh issue edit 5 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,backend,rust,performance"
gh issue edit 6 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,ai-training,python,ml"
gh issue edit 7 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,backend,performance,data"
gh issue edit 8 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,frontend,visualization,d3"
gh issue edit 9 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,testing,infrastructure"
gh issue edit 10 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,infrastructure,docker,devops"
gh issue edit 11 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,infrastructure,ci-cd,devops"
gh issue edit 12 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,infrastructure,monitoring,performance"
gh issue edit 13 --milestone "Phase 2: Performance Optimization" --add-label "phase-2,documentation,migration"

# Phase 3 Issues
echo "📋 Phase 3 Issues:"
gh issue edit 14 --milestone "Phase 3: Production Scale" --add-label "phase-3,infrastructure,microservices,architecture"
gh issue edit 15 --milestone "Phase 3: Production Scale" --add-label "phase-3,ai-training,ml,advanced"

# Summary Issue
echo "📋 Summary Issue:"
gh issue edit 16 --add-label "documentation,roadmap,summary"

echo "✅ Issue assignment completed!"
