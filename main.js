/**
 * Academic Portfolio - Main JavaScript
 * Handles navigation, animations, and dynamic content loading from JSON config files
 */

// ==========================================
// Configuration
// ==========================================

const CONFIG_PATHS = {
    profile: 'config/profile.json',
    publications: 'config/publications.json',
    news: 'config/news.json'
};

// Global state
let profileData = null;
let publicationsData = null;
let newsData = null;
let newsExpanded = false;

// ==========================================
// DOM Elements
// ==========================================

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ==========================================
// Initialize
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load configuration files
        await loadConfigurations();
        
        // Render content from config
        renderProfile();
        renderNews();
        renderPublications();
        renderContact();
        renderFooter();
        
        // Initialize UI components
        setCurrentYear();
        initScrollAnimations();
        initNavigation();
    } catch (error) {
        console.error('Error initializing portfolio:', error);
    }
});

// ==========================================
// Load Configuration Files
// ==========================================

async function loadConfigurations() {
    const [profileResponse, publicationsResponse, newsResponse] = await Promise.all([
        fetch(CONFIG_PATHS.profile),
        fetch(CONFIG_PATHS.publications),
        fetch(CONFIG_PATHS.news)
    ]);
    
    if (!profileResponse.ok) {
        throw new Error(`Failed to load profile config: ${profileResponse.status}`);
    }
    if (!publicationsResponse.ok) {
        throw new Error(`Failed to load publications config: ${publicationsResponse.status}`);
    }
    if (!newsResponse.ok) {
        throw new Error(`Failed to load news config: ${newsResponse.status}`);
    }
    
    profileData = await profileResponse.json();
    publicationsData = await publicationsResponse.json();
    newsData = await newsResponse.json();
}

// ==========================================
// HTML Sanitization
// ==========================================

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Sanitize HTML content allowing only safe formatting tags
 * Allowed tags: strong, em, b, i, u, a (with href), br, span
 */
function sanitizeHtml(html) {
    if (html === null || html === undefined) return '';
    
    // Create a temporary element to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = String(html);
    
    // Recursively clean nodes
    cleanNode(temp);
    
    return temp.innerHTML;
}

function cleanNode(node) {
    const allowedTags = ['STRONG', 'EM', 'B', 'I', 'U', 'A', 'BR', 'SPAN'];
    const allowedAttributes = {
        'A': ['href', 'target', 'rel'],
        'SPAN': ['class']
    };
    
    // Process child nodes in reverse order (to safely remove nodes)
    const children = Array.from(node.childNodes);
    for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            if (allowedTags.includes(child.tagName)) {
                // Clean attributes - only keep allowed ones
                const attrs = Array.from(child.attributes);
                for (const attr of attrs) {
                    const tagAllowedAttrs = allowedAttributes[child.tagName] || [];
                    if (!tagAllowedAttrs.includes(attr.name)) {
                        child.removeAttribute(attr.name);
                    }
                }
                
                // For anchor tags, ensure href is safe (no javascript:)
                if (child.tagName === 'A' && child.hasAttribute('href')) {
                    const href = child.getAttribute('href');
                    if (href.toLowerCase().trim().startsWith('javascript:')) {
                        child.removeAttribute('href');
                    }
                    // Add security attributes for external links
                    if (href.startsWith('http')) {
                        child.setAttribute('target', '_blank');
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                
                // Recursively clean children
                cleanNode(child);
            } else {
                // Replace disallowed tag with its text content
                const text = document.createTextNode(child.textContent);
                node.replaceChild(text, child);
            }
        }
        // Text nodes are kept as-is
    }
}

/**
 * Set element content with safe HTML rendering
 * Allows formatting tags like <strong>, <em>, <a>, etc.
 */
function setHtmlContent(element, html) {
    if (!element) return;
    element.innerHTML = sanitizeHtml(html);
}

// ==========================================
// Render Profile Section
// ==========================================

function renderProfile() {
    if (!profileData) return;
    
    // Hero section
    const heroName = document.getElementById('hero-name');
    const heroPosition = document.getElementById('hero-position');
    const heroTagline = document.getElementById('hero-tagline');
    const profileImage = document.getElementById('profile-image');
    const heroSocialLinks = document.getElementById('hero-social-links');
    
    if (heroName) {
        heroName.textContent = `${profileData.title || ''} ${profileData.name || ''} ${profileData.surname || ''}`.trim();
    }
    if (heroPosition) {
        heroPosition.textContent = profileData.position || '';
    }
    if (heroTagline) {
        heroTagline.textContent = profileData.tagline || '';
    }
    
    // Profile image
    if (profileImage && profileData.profile_image) {
        const img = document.createElement('img');
        img.src = profileData.profile_image;
        img.alt = `${profileData.name || ''} ${profileData.surname || ''}`.trim();
        img.className = 'profile-img';
        profileImage.innerHTML = '';
        profileImage.appendChild(img);
    }
    
    // Hero social links (below tagline)
    if (heroSocialLinks && profileData.social) {
        heroSocialLinks.innerHTML = '';
        renderSocialLinks(heroSocialLinks, profileData.social, 'hero-social-link');
    }
    
    // About section
    const aboutText = document.getElementById('about-text');
    if (aboutText && profileData.about) {
        aboutText.innerHTML = '';
        
        if (profileData.about.lead) {
            const leadP = document.createElement('p');
            leadP.className = 'about-lead';
            setHtmlContent(leadP, profileData.about.lead);
            aboutText.appendChild(leadP);
        }
        
        if (profileData.about.paragraphs) {
            profileData.about.paragraphs.forEach(text => {
                const p = document.createElement('p');
                setHtmlContent(p, text);
                aboutText.appendChild(p);
            });
        }
    }
}

// ==========================================
// Render News Section
// ==========================================

function renderNews() {
    if (!newsData || !newsData.news) return;
    
    const newsList = document.getElementById('news-list');
    const expandBtn = document.getElementById('news-expand-btn');
    
    if (!newsList) return;
    
    newsList.innerHTML = '';
    const newsItems = newsData.news;
    const maxVisible = 4;
    
    newsItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'news-item';
        if (index >= maxVisible) {
            li.classList.add('news-hidden');
        }
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'news-date';
        dateSpan.textContent = item.date || '';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'news-text';
        setHtmlContent(textSpan, item.text || '');
        
        li.appendChild(dateSpan);
        li.appendChild(textSpan);
        newsList.appendChild(li);
    });
    
    // Show expand button if there are more than maxVisible items
    if (expandBtn && newsItems.length > maxVisible) {
        expandBtn.style.display = 'inline-block';
        expandBtn.addEventListener('click', toggleNewsExpand);
    }
}

function toggleNewsExpand() {
    const hiddenItems = document.querySelectorAll('.news-item.news-hidden');
    const expandBtn = document.getElementById('news-expand-btn');
    
    newsExpanded = !newsExpanded;
    
    hiddenItems.forEach(item => {
        if (newsExpanded) {
            item.classList.add('news-visible');
        } else {
            item.classList.remove('news-visible');
        }
    });
    
    if (expandBtn) {
        expandBtn.textContent = newsExpanded ? 'Show less' : 'Show more';
    }
}

// ==========================================
// Render Publications Section
// ==========================================

function renderPublications() {
    const publicationsGrid = document.getElementById('publications-grid');
    const publicationsCta = document.getElementById('publications-cta');
    
    if (publicationsGrid && publicationsData && publicationsData.publications) {
        publicationsGrid.innerHTML = '';
        publicationsData.publications.forEach(pub => {
            const card = createPublicationCard(pub);
            publicationsGrid.appendChild(card);
        });
    }
    
    // Google Scholar link
    if (publicationsCta && profileData && profileData.social && profileData.social.google_scholar) {
        publicationsCta.innerHTML = '';
        const link = document.createElement('a');
        link.href = profileData.social.google_scholar;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'btn btn-outline';
        link.textContent = 'View All on Google Scholar';
        publicationsCta.appendChild(link);
    }
}

function createPublicationCard(publication) {
    const article = document.createElement('article');
    article.className = 'publication-card fade-in';
    
    // Image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'publication-image';
    
    if (publication.image) {
        const img = document.createElement('img');
        img.src = publication.image;
        img.alt = escapeHtml(publication.title);
        imageDiv.appendChild(img);
    } else {
        imageDiv.innerHTML = `<svg class="publication-image-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>`;
    }
    
    // Content section
    const contentDiv = document.createElement('div');
    contentDiv.className = 'publication-content';
    
    const venueSpan = document.createElement('span');
    venueSpan.className = 'publication-venue';
    venueSpan.textContent = `${publication.venue || ''} ${publication.year || ''}`.trim();
    
    const titleH3 = document.createElement('h3');
    titleH3.className = 'publication-title';
    titleH3.textContent = publication.title || '';
    
    const authorsP = document.createElement('p');
    authorsP.className = 'publication-authors';
    setHtmlContent(authorsP, publication.authors || '');
    
    const descP = document.createElement('p');
    descP.className = 'publication-description';
    setHtmlContent(descP, publication.description || '');
    
    const linksDiv = document.createElement('div');
    linksDiv.className = 'publication-links';
    generatePublicationLinks(publication.links, linksDiv);
    
    contentDiv.appendChild(venueSpan);
    contentDiv.appendChild(titleH3);
    contentDiv.appendChild(authorsP);
    contentDiv.appendChild(descP);
    contentDiv.appendChild(linksDiv);
    
    article.appendChild(imageDiv);
    article.appendChild(contentDiv);
    
    return article;
}

function generatePublicationLinks(links, container) {
    if (!links || !container) return;
    
    const linkConfigs = [
        { key: 'paper', label: 'Paper', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
        { key: 'code', label: 'Code', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
        { key: 'page', label: 'Page', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` }
    ];
    
    linkConfigs.forEach(config => {
        if (links[config.key]) {
            const link = document.createElement('a');
            link.href = links[config.key];
            link.className = 'publication-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = config.icon;
            link.appendChild(document.createTextNode(` ${config.label}`));
            container.appendChild(link);
        }
    });
}

// ==========================================
// Render Social Links (shared function)
// ==========================================

function renderSocialLinks(container, socialData, className) {
    if (!container || !socialData) return;
    
    const socialIcons = {
        github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
        cv: `<span class="cv-text-icon">CV</span>`,
        google_scholar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>`,
        orcid: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
    };
    
    const socialLabels = {
        github: 'GitHub',
        cv: 'CV',
        google_scholar: 'Google Scholar',
        orcid: 'ORCID',
        linkedin: 'LinkedIn'
    };
    
    // Order: github, linkedin, google_scholar, cv, orcid
    const displayOrder = ['github', 'linkedin', 'google_scholar', 'cv', 'orcid'];
    
    for (const key of displayOrder) {
        const url = socialData[key];
        if (url && socialIcons[key]) {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = className;
            link.setAttribute('aria-label', socialLabels[key] || key);
            link.innerHTML = socialIcons[key];
            container.appendChild(link);
        }
    }
}

// ==========================================
// Render Contact Section
// ==========================================

function renderContact() {
    if (!profileData) return;
    
    const contactInfo = document.getElementById('contact-info');
    const socialLinks = document.getElementById('social-links');
    
    // Contact info cards
    if (contactInfo && profileData.contact) {
        contactInfo.innerHTML = '';
        
        // Email
        if (profileData.contact.email) {
            const emailItem = createContactItem(
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>`,
                'Email',
                profileData.contact.email,
                `mailto:${profileData.contact.email}`
            );
            contactInfo.appendChild(emailItem);
        }
        
        // Location
        if (profileData.contact.location) {
            const locationItem = createContactItemWithText(
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>`,
                'Location',
                `${profileData.contact.location.department || ''}\n${profileData.contact.location.institution || ''}`
            );
            contactInfo.appendChild(locationItem);
        }
        
        // LinkedIn (if available)
        if (profileData.social && profileData.social.linkedin) {
            const linkedinItem = createContactItem(
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>`,
                'LinkedIn',
                'Connect with me',
                profileData.social.linkedin,
                true
            );
            contactInfo.appendChild(linkedinItem);
        }
    }
    
    // Social links
    if (socialLinks && profileData.social) {
        socialLinks.innerHTML = '';
        renderSocialLinks(socialLinks, profileData.social, 'social-link');
    }
}

function createContactItem(iconSvg, title, linkText, href, isExternal = false) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'contact-icon';
    iconDiv.innerHTML = iconSvg;
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'contact-details';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    
    const link = document.createElement('a');
    link.href = href;
    link.textContent = linkText;
    if (isExternal) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
    
    detailsDiv.appendChild(h3);
    detailsDiv.appendChild(link);
    div.appendChild(iconDiv);
    div.appendChild(detailsDiv);
    
    return div;
}

function createContactItemWithText(iconSvg, title, text) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'contact-icon';
    iconDiv.innerHTML = iconSvg;
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'contact-details';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    
    const p = document.createElement('p');
    // Split by newline and create text with line breaks
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
        p.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
            p.appendChild(document.createElement('br'));
        }
    });
    
    detailsDiv.appendChild(h3);
    detailsDiv.appendChild(p);
    div.appendChild(iconDiv);
    div.appendChild(detailsDiv);
    
    return div;
}

// ==========================================
// Render Footer
// ==========================================

function renderFooter() {
    if (!profileData || !profileData.footer) return;
    
    const footerName = document.getElementById('footer-name');
    const footerNote = document.getElementById('footer-note');
    
    if (footerName) {
        footerName.textContent = profileData.footer.copyright_name;
    }
    if (footerNote) {
        footerNote.textContent = profileData.footer.note;
    }
}

// ==========================================
// Set Current Year
// ==========================================

function setCurrentYear() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// ==========================================
// Navigation
// ==========================================

function initNavigation() {
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
            updateActiveLink(link);
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveLinkOnScroll, { passive: true });
}

function toggleMobileMenu() {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    if (navToggle && navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleNavbarScroll() {
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function updateActiveLink(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function updateActiveLinkOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ==========================================
// Scroll Animations
// ==========================================

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Also observe section elements for staggered animations
    document.querySelectorAll('.stat-item, .contact-item').forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 100}ms`;
        observer.observe(el);
    });
}

// ==========================================
// Smooth Scroll Polyfill (for older browsers)
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
