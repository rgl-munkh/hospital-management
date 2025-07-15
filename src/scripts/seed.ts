#!/usr/bin/env bun

import { seedAll } from '../app/lib/seed';

async function main() {
  try {
    await seedAll();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main(); 