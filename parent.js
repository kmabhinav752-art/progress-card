window.ParentModule = {
    init: function () {
        this.app = document.getElementById('app');
        this.app.innerHTML = this.getLayout();
        this.renderDashboard();
        this.setupNavigation();
    },

    getLayout: function () {
        const user = window.auth.getCurrentUser();
        return `
            <div class="dashboard-layout">
                <nav class="sidebar">
                    <div class="logo">
                        <i class="ph ph-users-three"></i>
                        <span>Parent Portal</span>
                    </div>
                    <ul class="nav-links">
                        <li class="nav-item active" data-view="dashboard">
                            <i class="ph ph-squares-four"></i> Dashboard
                        </li>
                        <li class="nav-item" data-view="attendance">
                            <i class="ph ph-calendar-check"></i> Attendance
                        </li>
                         <li class="nav-item" data-view="chat">
                            <i class="ph ph-chat-circle-text"></i> Chat with Staff
                        </li>
                    </ul>
                    <div class="user-profile-mini">
                        <div class="user-avatar">${user.name.charAt(0)}</div>
                        <div>
                            <div style="font-weight:600">${user.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted)">Parent</div>
                        </div>
                        <i class="ph ph-sign-out" style="margin-left:auto; cursor:pointer;" onclick="window.auth.logout()"></i>
                    </div>
                </nav>
                <main class="main-content" id="module-content">
                    <!-- Dynamic Content -->
                </main>
            </div>
        `;
    },

    setupNavigation: function () {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                if (item.dataset.view === 'dashboard') this.renderDashboard();
                if (item.dataset.view === 'attendance') this.renderAttendance();
                if (item.dataset.view === 'chat') this.renderChat();
            });
        });
    },

    renderDashboard: function () {
        const user = window.auth.getCurrentUser();
        // Mock data for child name, but fetch real attendance
        const childName = "John Doe";
        const records = window.db.getAll('attendance').filter(r => r.studentId === user.studentId);

        let totalClasses = 0;
        let attendedClasses = 0;
        records.forEach(r => { totalClasses += r.total; attendedClasses += r.attended; });
        const aggPct = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

        const content = document.getElementById('module-content');

        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">Parent Dashboard</h2>
            
            <div class="glass-panel fade-in" style="margin-bottom:2rem; display:flex; align-items:center; gap:1.5rem;">
                <div style="width:60px; height:60px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:bold;">
                    ${childName.charAt(0)}
                </div>
                <div>
                    <h3>${childName}</h3>
                    <p style="color:var(--text-muted)">B.Tech CSE - Semester 5</p>
                </div>
            </div>

            <div class="stats-grid fade-in">
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="color:var(--success)"><i class="ph ph-chart-line-up"></i></div>
                    <div>
                        <h3>8.5</h3>
                        <p style="color:var(--text-muted)">Overall SGPA</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="color:var(--warning)"><i class="ph ph-clock"></i></div>
                    <div>
                        <h3>${aggPct}%</h3>
                        <p style="color:var(--text-muted)">Attendance</p>
                    </div>
                </div>
            </div>

            <h3 class="fade-in" style="margin-top:2rem; margin-bottom:1rem;">Academic Updates</h3>
            <div class="glass-panel fade-in">
                <ul style="list-style:none;">
                    <li style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                        <span><i class="ph ph-check-circle" style="color:var(--success); margin-right:10px;"></i> Semester 5 Results Declared</span>
                        <span style="color:var(--text-muted); font-size:0.9rem;">2 days ago</span>
                    </li>
                    <li style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                         <span><i class="ph ph-info" style="color:var(--primary); margin-right:10px;"></i> Internal Assessment 2 Completed</span>
                        <span style="color:var(--text-muted); font-size:0.9rem;">1 week ago</span>
                    </li>
                </ul>
            </div>
        `;
    },

    renderAttendance: function () {
        const user = window.auth.getCurrentUser();
        const records = window.db.getAll('attendance').filter(r => r.studentId === user.studentId);
        const subjects = window.db.getAll('subjects');

        const content = document.getElementById('module-content');

        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">Attendance Details</h2>
            
            <div class="glass-panel fade-in">
                 <table style="width:100%; border-collapse:collapse; color:white;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                            <th style="padding:1rem;">Subject</th>
                            <th style="padding:1rem;">Classes Held</th>
                            <th style="padding:1rem;">Classes Attended</th>
                            <th style="padding:1rem;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                         ${records.length === 0 ? '<tr><td colspan="4" style="padding:1rem; text-align:center; color:var(--text-muted);">No attendance records found</td></tr>' :
                records.map(r => {
                    const sub = subjects.find(s => s.id === r.subjectId) || { name: 'Unknown', code: '-' };
                    const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
                    return `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                <td style="padding:1rem;">
                                    <div style="font-weight:600">${sub.name}</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">${sub.code}</div>
                                </td>
                                <td style="padding:1rem;">${r.total}</td>
                                <td style="padding:1rem;">${r.attended}</td>
                                <td style="padding:1rem; font-weight:bold; color:${pct < 75 ? 'var(--error)' : 'var(--success)'}">${pct}%</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderChat: function () {
        document.getElementById('module-content').innerHTML = '<h2>Message Staff</h2><p>Coming soon...</p>';
    }
};
