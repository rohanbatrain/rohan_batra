#!/bin/bash
# Helper script to run migration with proper environment loading
NODE_OPTIONS="-r dotenv/config" DOTENV_CONFIG_PATH=".env.local" pnpm tsx scripts/fix-parent-lesson-durations.ts "$@"
