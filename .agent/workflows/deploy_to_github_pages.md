---
description: Deploy the Hanbot DB to GitHub Pages
---

# Deploying to GitHub Pages

Since your project is configured to build a single HTML file (`dist/index.html`) and uses `HashHistory` for routing, it is **fully compatible** with GitHub Pages.

Follow these steps to deploy:

## 1. Initialize Git (if not done)
Run these commands in your terminal:
```bash
git init
git add .
git commit -m "Initial commit"
```

## 2. Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new public repository.
2. Do **not** initialize it with a README, .gitignore, or license (to keep it empty).

## 3. Push your code
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual details:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 4. Configure GitHub Pages
1. Go to your repository **Settings** > **Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Click **Configure** on "Static HTML" or create a file at `.github/workflows/deploy.yml` with the content below.

### Recommended: GitHub Actions Workflow
Create a file named `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Once you push this file, GitHub will automatically build and deploy your site!
