export class MyNavigation {
    constructor() {
        this.currentPage = 'budget';
        this.initNavigation();
    }

    
    initNavigation() {
        // Setup burger menu
        const burgerMenu = document.getElementById('burgerMenu');
        const sideNav = document.getElementById('sideNav');
        const overlay = document.getElementById('navOverlay');

        // Toggle side nav and overlay visibility when burger menu is clicked
        burgerMenu?.addEventListener('click', () => {
            sideNav?.classList.toggle('open');
            overlay?.classList.toggle('show');
            document.body.style.overflow = sideNav?.classList.contains('open') ? 'hidden' : '';
        });

        // Close side nav and overlay when overlay is clicked
        overlay?.addEventListener('click', () => {
            sideNav?.classList.remove('open');
            overlay?.classList.remove('show');
            document.body.style.overflow = '';
        });
    }


    static navigateTo(page) {
        // Update URL to reflect the page (e.g., "/pages/privacyPolicy")
        window.history.pushState({}, '', `/pages/${page}`);
    
        // Optionally, trigger an event to load content based on the page path
        this.loadPageContent(page);
    
        // Update active state in navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    
        // Scroll to top
        window.scrollTo(0, 0);
    }

    static loadPageContent(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        
        // Show the selected page content by mapping it to its path
        const selectedPage = document.getElementById(`${page}Page`);
        if (selectedPage) {
            selectedPage.style.display = 'block';
            this.currentPage = page;
        }
    }
}