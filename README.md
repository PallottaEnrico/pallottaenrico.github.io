# Academic Portfolio

A clean, minimalist academic portfolio website designed for researchers and academics to showcase their publications and research work.

## Features

- **Modern Design**: Clean, minimalist aesthetic inspired by Apple and Meta AI
- **Responsive**: Fully responsive design that works on all devices
- **Publications Section**: Showcase your research with images and descriptions
- **News Section**: Bullet list of recent updates with expand/collapse functionality
- **Smooth Animations**: Subtle scroll animations and transitions
- **JSON Configuration**: Easy content management through config files (no HTML editing required!)
- **GitHub Stars Badge**: Live total GitHub star count displayed in the hero section, automatically updated daily via GitHub Actions
- **GitHub Pages Ready**: Designed to be hosted on GitHub Pages

## Sections

1. **Hero**: Introduction with name, title, profile image, and GitHub stars badge
2. **About**: Biography with recent news
3. **Publications**: Grid of research papers with venue, description, and links
4. **Contact**: Email, location, and social media links

## Getting Started

1. Clone this repository
2. Edit the configuration files in the `config/` folder
3. Replace placeholder profile image (optional)
4. Push to GitHub and enable GitHub Pages

## Configuration Files

All content is managed through JSON configuration files in the `config/` folder. No need to edit HTML!

### `config/profile.json` - Personal Information

This file contains all your personal information, about me content, and social links.

```json
{
  "name": "Jane",
  "surname": "Smith",
  "title": "Dr.",
  "position": "Researcher in Artificial Intelligence",
  "tagline": "Exploring the frontiers of machine learning...",
  
  "profile_image": "",
  
  "about": {
    "lead": "I am a passionate researcher...",
    "paragraphs": [
      "With over 10 years of experience...",
      "Currently, I am a Professor at..."
    ]
  },
  
  "contact": {
    "email": "jane.smith@university.edu",
    "location": {
      "department": "Department of Computer Science",
      "institution": "University of Technology"
    }
  },
  
  "social": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "cv": "path/to/your-cv.pdf",
    "google_scholar": "https://scholar.google.com/...",
    "orcid": "https://orcid.org/...",
    "researchgate": "",
    "website": ""
  },
  
  "footer": {
    "copyright_name": "Dr. Jane Smith",
    "note": "Built with passion for science"
  }
}
```

### `config/publications.json` - Publications List

This file contains all your publications.

```json
{
  "publications": [
    {
      "id": 1,
      "title": "Your Paper Title",
      "authors": "J. Smith, A. Johnson, M. Williams",
      "venue": "Nature Machine Intelligence",
      "year": 2024,
      "description": "Brief description of your work...",
      "image": "",
      "links": {
        "paper": "https://paper-url.com",
        "code": "https://github.com/repo",
        "demo": "https://demo-url.com"
      }
    }
  ]
}
```

### `config/external_repos.json` - External Repositories for Star Count

This file lists repositories not owned by you that should be included in the total GitHub star count (e.g. repos you contributed to significantly).

```json
[
  "org/repo-name",
  "another-org/another-repo"
]
```

The star count is fetched daily by a GitHub Actions workflow (`.github/workflows/update_stars.yml`) and written to `stars_data.json` at the repo root. The badge is displayed automatically in the hero section once the workflow has run at least once.

> **Note:** The workflow requires the `workflow` scope on your Personal Access Token to push changes to `.github/workflows/`.

### `config/news.json` - News/Updates

This file contains your recent news and updates. Only the 4 most recent items are shown initially, with a "Show more" button to expand.

```json
{
  "news": [
    {
      "date": "2025-03",
      "text": "Our paper has been accepted at CVPR 2025!"
    },
    {
      "date": "2025-02",
      "text": "New preprint available on arXiv"
    }
  ]
}
```

## Customizing Styles

To customize colors and typography, edit `styles.css` and modify the CSS variables:

```css
:root {
    --color-primary: #0071e3;
    --color-text: #1d1d1f;
    /* ... more variables */
}
```

## Technologies

- HTML5
- CSS3 (with CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter)

## License

MIT License - Feel free to use for your own academic portfolio!
