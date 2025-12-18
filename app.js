class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.init();
    }

    init() {
        if (window.auth.isAuthenticated()) {
            this.loadDashboard();
        } else {
            this.renderLogin();
        }
    }

    renderLogin() {
        this.appContainer.innerHTML = `
            <div class="auth-wrapper fade-in">
                <div class="login-card glass-panel">
                    <div class="login-header">
                        <div class="logo justify-center" style="justify-content: center; margin-bottom: 1rem;">
                            <i class="ph ph-graduation-cap"></i>
                            <span>UniPortal</span>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue to your dashboard</p>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" id="username" class="glass-input" placeholder="e.g. admin" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="password" class="glass-input" placeholder="••••••" required>
                        </div>
                        <button type="submit" class="btn-primary">Sign In</button>
                    </form>
                    <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                        <p>Demo Credentials:</p>
                        <p>admin / 123 | staff / 123</p>
                        <p>student / 123 | parent / 123</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const userIn = document.getElementById('username').value;
        const passIn = document.getElementById('password').value;
        const result = window.auth.login(userIn, passIn);

        if (result.success) {
            this.showToast(`Welcome back, ${result.user.name}`, 'success');
            setTimeout(() => this.loadDashboard(), 500);
        } else {
            this.showToast(result.message, 'error');
            this.shakeForm();
        }
    }

    loadDashboard() {
        const user = window.auth.getCurrentUser();
        this.appContainer.innerHTML = ''; // Clear login

        switch (user.role) {
            case 'admin':
                if (window.AdminModule) window.AdminModule.init();
                break;
            case 'staff':
                if (window.StaffModule) window.StaffModule.init();
                break;
            case 'student':
                if (window.StudentModule) window.StudentModule.init();
                break;
            case 'parent':
                if (window.ParentModule) window.ParentModule.init();
                break;
            default:
                console.error('Unknown role');
        }
    }

    showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `glass-panel fade-in`;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '1rem 2rem';
        toast.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
        toast.style.color = '#fff';
        toast.style.zIndex = '1000';
        toast.innerHTML = msg;

        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    shakeForm() {
        const card = document.querySelector('.login-card');
        card.style.animation = 'shake 0.5s';
        setTimeout(() => card.style.animation = '', 500);
    }
}

// Add shake keyframes dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize App after Data is loaded
(async () => {
    // Wait for Firebase
    console.log("Waiting for DB...");
    await window.db.init();

    // Remove loading screen if still there
    const loader = document.querySelector('.loading-screen');
    if (loader) loader.style.display = 'none';

    window.app = new App();
})();
