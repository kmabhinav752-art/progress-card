class AuthManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    login(username, password) {
        const user = window.db.getUserByCredentials(username, password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.reload();
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

window.auth = new AuthManager();
