export class Navigation {
    constructor() {
        this.currentPage = 'budget';
        this.initNavigation();
    }

    initNavigation() {
        // Setup burger menu
        const burgerMenu = document.getElementById('burgerMenu');
        const sideNav = document.getElementById('sideNav');
        const overlay = document.getElementById('navOverlay');

        burgerMenu?.addEventListener('click', () => {
            sideNav?.classList.toggle('open');
            overlay?.classList.toggle('show');
            document.body.style.overflow = sideNav?.classList.contains('open') ? 'hidden' : '';
        });

        overlay?.addEventListener('click', () => {
            sideNav?.classList.remove('open');
            overlay?.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Setup navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
                sideNav?.classList.remove('open');
                overlay?.classList.remove('show');
                document.body.style.overflow = '';
            });
        });
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        
        // Show selected page
        const selectedPage = document.getElementById(`${page}Page`);
        if (selectedPage) {
            selectedPage.style.display = 'block';
            this.currentPage = page;
            
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
    }
}