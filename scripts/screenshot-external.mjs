#!/usr/bin/env node

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DEFAULT_URL = 'http://localhost:3000/external?link=https%3A%2F%2Fexample.com';
const ARTIFACTS_DIR = 'artifacts/screens';

async function takeScreenshots() {
  const url = process.env.URL || DEFAULT_URL;
  
  console.log(`Taking screenshots of: ${url}`);
  
  // Ensure artifacts directory exists
  if (!existsSync(ARTIFACTS_DIR)) {
    await mkdir(ARTIFACTS_DIR, { recursive: true });
    console.log(`Created directory: ${ARTIFACTS_DIR}`);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Light mode screenshot
    console.log('Taking light mode screenshot...');
    const lightPage = await browser.newPage({
      colorScheme: 'light',
      viewport: { width: 1280, height: 720 }
    });
    
    await lightPage.goto(url);
    await lightPage.waitForLoadState('networkidle');
    
    const lightScreenshotPath = path.join(ARTIFACTS_DIR, 'external-light.png');
    await lightPage.screenshot({ 
      path: lightScreenshotPath, 
      fullPage: true 
    });
    console.log(`Light mode screenshot saved: ${lightScreenshotPath}`);
    
    await lightPage.close();

    // Dark mode screenshot
    console.log('Taking dark mode screenshot...');
    const darkPage = await browser.newPage({
      colorScheme: 'dark',
      viewport: { width: 1280, height: 720 }
    });
    
    await darkPage.goto(url);
    await darkPage.waitForLoadState('networkidle');
    
    const darkScreenshotPath = path.join(ARTIFACTS_DIR, 'external-dark.png');
    await darkPage.screenshot({ 
      path: darkScreenshotPath, 
      fullPage: true 
    });
    console.log(`Dark mode screenshot saved: ${darkScreenshotPath}`);
    
    await darkPage.close();

    console.log('Screenshots completed successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

takeScreenshots();