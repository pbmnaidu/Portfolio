# 🧑‍💻 Bhanu Prakash — Developer Portfolio

A clean, minimal dark-themed developer portfolio website built with pure **HTML, CSS, and JavaScript** — deployed on GitHub Pages.

🔗 **Live Site:** https://404-pbmnaidunotfound.github.io/FUTURE_FS_01

---

## 📁 Project Structure

```
FUTURE_FS_01-/
├── index.html       # Main HTML structure & all sections
├── style.css        # All styling, layout, animations & responsive design
└── script.js        # Typing animation, scroll reveal, navbar, contact form
```

> Fonts and icons are loaded via CDN — no installs or build tools required.

---

## 🌐 Sections

| # | Section | Description |
|---|---------|-------------|
| 01 | **Hero** | Full-screen intro with name, typing animation, and CTA buttons |
| 02 | **About** | Summary, info table, strength tags |
| 03 | **Skills** | Animated progress bars — Languages, Web, Tools & DB |
| 04 | **Projects** | Work Seeker, Rock-Paper-Scissors, EduGuide Chatbot |
| 05 | **Experience** | Internship at Sampath Software Solutions |
| 06 | **Education** | Bhashyam → Andhra Polytechnic → Vignan B.Tech |
| 07 | **Achievements & Certifications** | Hackathons, internship cert |
| 08 | **Profiles** | GitHub, LinkedIn, CodeChef, Email |
| 09 | **Resume** | Download button linked to PDF |
| 10 | **Contact** | Form with name, email, message + validation |

---

## 🎨 Design

| Property | Value |
|----------|-------|
| Theme | Dark minimal |
| Background | `#0c0c0c` |
| Accent Color | `#c8ff00` |
| Display Font | Syne (Google Fonts) |
| Mono Font | DM Mono (Google Fonts) |
| Icons | Font Awesome 6 (CDN) |

---

## 🚀 How to Run Locally

### Option 1 — Double-click
Open the `FUTURE_FS_01-/` folder → double-click `index.html` → opens in browser.

### Option 2 — VS Code Live Server
1. Install the **Live Server** extension in VS Code
2. Open the project folder in VS Code
3. Right-click `index.html` → **Open with Live Server**
4. Runs at `http://127.0.0.1:5500`

### Option 3 — Python
```bash
cd FUTURE_FS_01-
python -m http.server 8000
# Open http://localhost:8000
```

---

## 📦 Dependencies (CDN — no install needed)

| Library | Purpose |
|---------|---------|
| [Google Fonts — Syne](https://fonts.google.com/specimen/Syne) | Display headings |
| [Google Fonts — DM Mono](https://fonts.google.com/specimen/DM+Mono) | Mono labels & tags |
| [Font Awesome 6.4.0](https://fontawesome.com) | All icons |

---

## ✏️ How to Customize

Open any file in VS Code and edit:

### Name & Personal Info — `index.html`
```html
<!-- Hero heading -->
Polimera <em>Bhanuprakash</em> Maliappala Naidu

<!-- Contact details -->
href="mailto:bhanupolimera.9@gmail.com"
href="tel:+919703155423"
```

### Profile Links — `index.html`
```html
href="https://github.com/404-PBMNaiduNotFound/Portfolio-"
href="https://linkedin.com/in/pbmnaidu"
href="https://www.codechef.com/users/bhanupolimera"
```

### Resume PDF — `index.html`
```html
<a href="https://404-pbmnaidunotfound.github.io/BHANU-RESUME.pdf">
```
Replace with your updated PDF URL.

### Accent Color — `style.css`
```css
:root {
  --accent: #c8ff00;  /* Change to any color */
}
```

### Add a New Project — `index.html`
Find the projects section and copy this block:
```html
<div class="project-item reveal">
  <div class="project-num">04</div>
  <div>
    <div class="project-title">Your Project Name</div>
    <p class="project-desc">Short description of what it does.</p>
    <div class="project-techs">
      <span class="tech-badge">HTML</span>
      <span class="tech-badge">CSS</span>
    </div>
  </div>
  <div class="project-links">
    <a href="LIVE_URL" class="p-link" target="_blank">
      <i class="fas fa-external-link-alt"></i> Live
    </a>
    <a href="GITHUB_URL" class="p-link" target="_blank">
      <i class="fab fa-github"></i> Code
    </a>
  </div>
</div>
```

---

## 🌍 Deployment — GitHub Pages

This site is already live on GitHub Pages at:
**https://404-pbmnaidunotfound.github.io/FUTURE_FS_01-/**

### To update the live site:
```bash
# Make your changes to index.html / style.css / script.js
git add .
git commit -m "your update message"
git push origin main
```
GitHub Pages auto-redeploys within ~1 minute. ✅

### GitHub Pages Settings (for reference):
- Repo: `404-PBMNaiduNotFound/FUTURE_FS_01-`
- Branch: `main`
- Root folder: `/` (root)
- Settings → Pages → Source → Deploy from branch

---

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| > 860px | Full multi-column layout, side labels visible |
| ≤ 860px | Single column, hamburger menu |
| ≤ 500px | Compact mobile layout |

---

## 👤 Developer

**Polimera Bhanuprakash Maliappala Naidu**

- 📍 Visakhapatnam, Andhra Pradesh, India
- 🎓 B.Tech CSE (AI) — Vignan Institute of Information Technology
- 🎓 Diploma in CSE (89%) — Andhra Polytechnic
- 💼 Web Development Intern — Sampath Software Solutions
- 🔗 GitHub: [404-PBMNaiduNotFound](https://github.com/404-PBMNaiduNotFound/Portfolio-)
- 🔗 LinkedIn: [pbmnaidu](https://linkedin.com/in/pbmnaidu)
- ♟️ CodeChef: [bhanupolimera](https://www.codechef.com/users/bhanupolimera)
- 📧 bhanupolimera.9@gmail.com

---

## 📄 License

Free to use and modify for personal portfolio purposes.

---

*Built with HTML · CSS · JavaScript · Deployed on GitHub Pages*
