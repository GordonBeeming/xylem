# Testing Guide for gordonbeeming.com

This document outlines the comprehensive smoke testing plan to verify critical functionality after deployments to [gordonbeeming.com](https://gordonbeeming.com).

## Overview

The smoke test plan covers essential user paths and features to ensure the site functions correctly after each deployment. These tests should be performed manually after every production deployment to catch any critical issues before they affect users.

## Pre-Testing Setup

1. **Clear browser cache** to ensure you're testing the latest deployment
2. **Test in multiple browsers** (Chrome, Firefox, Safari recommended)
3. **Test on both desktop and mobile** viewports
4. **Have multiple blog posts and tags readily available** for navigation testing

## Critical Smoke Tests

### 1. Homepage Verification
**URL:** `https://gordonbeeming.com`

**Test Steps:**
- [ ] Page loads within 3 seconds
- [ ] Site header displays correctly with logo and navigation
- [ ] Recent blog posts are visible in the grid layout
- [ ] Dark/light theme toggle works
- [ ] Footer displays with social links and copyright
- [ ] All images load properly

**Expected Result:** Homepage displays correctly with recent content and all UI elements functional

---

### 2. Blog Post Navigation
**URL:** `https://gordonbeeming.com/blog`

**Test Steps:**
- [ ] Blog listing page loads with posts in grid format
- [ ] Click on a recent blog post
- [ ] Verify post content loads with proper formatting
- [ ] Check that code blocks are highlighted correctly
- [ ] Verify images within posts display properly
- [ ] Test "Previous" and "Next" post navigation
- [ ] Check that post metadata (date, tags, reading time) displays

**Expected Result:** All blog posts are accessible and display with proper formatting

---

### 3. Blog Post Content Verification
**Pick a post with diverse content (code, images, links)**

**Test Steps:**
- [ ] Syntax highlighting works for code blocks
- [ ] External links open correctly
- [ ] Internal links navigate properly
- [ ] Images load and display with correct sizing
- [ ] Math formulas (if any) render correctly with KaTeX
- [ ] Post sharing buttons function (if present)
- [ ] Comments section loads (if enabled)

**Expected Result:** Rich content displays correctly with all formatting intact

---

### 4. Tags and Categories
**URL:** `https://gordonbeeming.com/tags`

**Test Steps:**
- [ ] Tags page loads with tag cloud/list
- [ ] Click on a popular tag (e.g., "JavaScript", "DevOps")
- [ ] Verify filtered posts display correctly
- [ ] Test tag pagination if more than 10 posts
- [ ] Return to tags page and test another tag
- [ ] Verify tag URLs are SEO-friendly (no encoded characters)

**Expected Result:** Tag filtering works correctly and shows relevant posts

---

### 5. Years Archive
**URL:** `https://gordonbeeming.com/years`

**Test Steps:**
- [ ] Years page loads with year listing
- [ ] Click on a recent year (e.g., current year)
- [ ] Verify posts from that year display
- [ ] Test year pagination if applicable
- [ ] Check posts are sorted chronologically

**Expected Result:** Year-based filtering displays correct posts

---

### 6. Search Functionality
**Test on homepage or any page with search**

**Test Steps:**
- [ ] Open search (usually via keyboard shortcut or search icon)
- [ ] Type a common keyword (e.g., "React", "TypeScript")
- [ ] Verify search results appear instantly
- [ ] Click on a search result
- [ ] Verify it navigates to the correct post
- [ ] Test empty search query handling
- [ ] Test search with special characters

**Expected Result:** Search returns relevant results and navigation works

---

### 7. About Page
**URL:** `https://gordonbeeming.com/about`

**Test Steps:**
- [ ] About page loads with author information
- [ ] Profile image displays correctly
- [ ] Social media links work
- [ ] Contact information is accurate
- [ ] Any external links open correctly

**Expected Result:** About page displays complete author information

---

### 8. RSS Feed
**URL:** `https://gordonbeeming.com/feed.xml` or similar

**Test Steps:**
- [ ] RSS feed URL loads without errors
- [ ] Feed contains recent blog posts
- [ ] XML structure is valid
- [ ] Post content is included in feed items

**Expected Result:** RSS feed is valid and contains recent content

---

### 9. SEO and Meta Data
**Test on several different pages**

**Test Steps:**
- [ ] View page source and verify `<title>` tags are descriptive
- [ ] Check Open Graph meta tags are present (`og:title`, `og:description`, `og:image`)
- [ ] Verify Twitter Card meta tags
- [ ] Test social sharing by copying URL to social platforms
- [ ] Check that page URLs are clean and SEO-friendly

**Expected Result:** All pages have proper SEO meta data and social sharing works

---

### 10. Mobile Responsiveness
**Test on mobile device or browser dev tools**

**Test Steps:**
- [ ] Homepage displays correctly on mobile
- [ ] Navigation menu works (hamburger menu if applicable)
- [ ] Blog posts are readable on mobile
- [ ] Images scale properly
- [ ] Touch interactions work (tapping links, buttons)
- [ ] Text is legible without horizontal scrolling

**Expected Result:** Site is fully functional and readable on mobile devices

---

### 11. Performance Check
**Use browser dev tools or online tools**

**Test Steps:**
- [ ] Homepage loads in under 3 seconds
- [ ] Blog posts load quickly
- [ ] Images are optimized and load progressively
- [ ] No JavaScript errors in console
- [ ] No broken resource requests (404s)

**Expected Result:** Site performs well with fast load times

---

### 12. Dark/Light Theme Toggle
**Test theme switching functionality**

**Test Steps:**
- [ ] Click theme toggle button
- [ ] Verify page switches between light and dark themes
- [ ] Navigate to different pages and confirm theme persists
- [ ] Refresh page and verify theme preference is remembered
- [ ] Test that all content is readable in both themes

**Expected Result:** Theme switching works correctly and preference is persistent

---

## Error Scenarios to Test

### 404 Page Handling
- [ ] Visit a non-existent URL: `https://gordonbeeming.com/this-does-not-exist`
- [ ] Verify custom 404 page displays
- [ ] Check that navigation from 404 page works

### Sitemap and Robots.txt
- [ ] Verify `https://gordonbeeming.com/robots.txt` loads
- [ ] Verify `https://gordonbeeming.com/sitemap.xml` loads and contains URLs

## Success Criteria

The smoke test is considered **PASSED** when:
- ✅ All critical smoke tests pass without errors
- ✅ No broken links or 404 errors found
- ✅ Site loads quickly (< 3 seconds for homepage)
- ✅ All content displays correctly
- ✅ Mobile experience is fully functional
- ✅ Search and navigation work as expected

## Failure Response

If any test fails:
1. **Document the issue** with screenshots and browser/device info
2. **Check if it's a critical issue** that affects core functionality
3. **Report to development team** immediately for critical issues
4. **Retest after fixes** are deployed

## Testing Schedule

- **Required:** After every production deployment
- **Recommended:** Weekly spot checks on critical paths
- **Suggested:** Monthly comprehensive testing of all features

## Notes

- This test suite should take approximately **15-20 minutes** to complete
- Focus on critical user paths first (homepage, blog reading, navigation)
- Test on the actual production URL, not preview/staging environments
- Keep this document updated as new features are added

---

*Last updated: [Current Date] - Update this document when new features are added or test procedures change.*