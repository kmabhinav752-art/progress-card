window.StudentModule = {
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
                        <i class="ph ph-student"></i>
                        <span>Student Portal</span>
                    </div>
                    <ul class="nav-links">
                        <li class="nav-item active" data-view="dashboard">
                            <i class="ph ph-squares-four"></i> Dashboard
                        </li>
                        <li class="nav-item" data-view="results">
                            <i class="ph ph-file-pdf"></i> Upload Results
                        </li>
                        <li class="nav-item" data-view="performance">
                            <i class="ph ph-chart-line-up"></i> Performance
                        </li>
                        <li class="nav-item" data-view="attendance">
                            <i class="ph ph-calendar-check"></i> Attendance
                        </li>
                        <li class="nav-item" data-view="feedback">
                            <i class="ph ph-chats-circle"></i> Feedback
                        </li>
                    </ul>
                    <div class="user-profile-mini">
                        <div class="user-avatar">${user.name.charAt(0)}</div>
                        <div>
                            <div style="font-weight:600">${user.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted)">Student</div>
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

                const view = item.dataset.view;
                if (view === 'dashboard') this.renderDashboard();
                if (view === 'results') this.renderUpload();
                if (view === 'performance') this.renderPerformance();
                if (view === 'attendance') this.renderAttendance();
            });
        });
    },

    renderDashboard: function () {
        const user = window.auth.getCurrentUser();
        const records = window.db.getAll('attendance').filter(r => r.studentId === user.id);

        let totalClasses = 0;
        let attendedClasses = 0;
        records.forEach(r => { totalClasses += r.total; attendedClasses += r.attended; });
        const aggPct = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

        const content = document.getElementById('module-content');
        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">My Dashboard</h2>
            
            <div class="stats-grid fade-in">
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="color:var(--success)"><i class="ph ph-trend-up"></i></div>
                    <div>
                        <h3>8.5</h3>
                        <p style="color:var(--text-muted)">Current SGPA</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="color:var(--warning)"><i class="ph ph-clock"></i></div>
                    <div>
                        <h3>${aggPct}%</h3>
                        <p style="color:var(--text-muted)">Overall Attendance</p>
                    </div>
                </div>
            </div>

            <div class="glass-panel fade-in" style="margin-top:2rem;">
                <h3>Recent Activity</h3>
                <ul style="list-style:none; margin-top:1rem; color:var(--text-muted);">
                     <li style="padding:0.5rem 0; border-bottom:1px solid rgba(255,255,255,0.05)">
                        <span style="color:var(--primary)">•</span> System initialized
                    </li>
                </ul>
            </div>
        `;
    },

    renderUpload: function () {
        const content = document.getElementById('module-content');
        content.innerHTML = `
            <h2 class="fade-in">Upload Result PDF</h2>
            <p style="color:var(--text-muted); margin-bottom:1.5rem;">Upload your University Result PDF. Our AI will analyze your grades.</p>
            
            <div class="glass-panel fade-in" style="text-align:center; padding:3rem; border: 2px dashed rgba(255,255,255,0.2);">
                <input type="file" id="pdfInput" accept="application/pdf" style="display:none;" onchange="window.StudentModule.handleFile(this)">
                <i class="ph ph-cloud-arrow-up" style="font-size:3rem; color:var(--primary); margin-bottom:1rem;"></i>
                <h3>Click to Upload PDF</h3>
                <p style="color:var(--text-muted)">Supported Format: .pdf</p>
                <button class="btn-primary" style="margin-top:1.5rem; width:auto;" onclick="document.getElementById('pdfInput').click()">Select File</button>
            </div>

            <div id="ai-results" class="hidden" style="margin-top:2rem;">
                <!-- AI Results go here -->
            </div>
        `;
    },

    handleFile: async function (input) {
        if (input.files.length > 0) {
            const file = input.files[0];
            const resultsContainer = document.getElementById('ai-results');

            // Show Loading
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = `
                <div class="glass-panel fade-in" style="text-align:center;">
                    <div class="spinner" style="margin: 0 auto 1rem;"></div>
                    <h3>AI is analyzing your document...</h3>
                    <p>Extracting subjects, credits, and grades.</p>
                </div>
            `;

            try {
                // Call AI Service
                const data = await window.aiService.processPDF(file);

                // Render Data
                setTimeout(() => {
                    this.renderAnalysis(data);
                }, 1500); // Fake delay for dramatic effect
            } catch (err) {
                resultsContainer.innerHTML = `<p style="color:var(--error)">Error: ${err.message}</p>`;
            }
        }
    },

    renderAnalysis: function (data) {
        const resultsContainer = document.getElementById('ai-results');
        resultsContainer.innerHTML = `
            <div class="glass-panel fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                     <h3>Analysis Complete <i class="ph ph-check-circle" style="color:var(--success)"></i></h3>
                     <div style="text-align:right;">
                        <span style="font-size:0.9rem; color:var(--text-muted)">Calculated SGPA</span>
                        <div style="font-size:1.5rem; font-weight:bold; color:var(--accent)">${data.sgpa}</div>
                     </div>
                </div>
                
                <table style="width:100%; border-collapse:collapse; margin-top:1.5rem;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted); text-align:left;">
                            <th style="padding:0.5rem;">Code</th>
                            <th style="padding:0.5rem;">Subject Name</th>
                            <th style="padding:0.5rem; text-align:center;">Credits</th>
                            <th style="padding:0.5rem; text-align:center;">Int / Ext</th>
                             <th style="padding:0.5rem; text-align:center;">Total</th>
                            <th style="padding:0.5rem; text-align:center;">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.subjects.map(s => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                <td style="padding:0.8rem 0.5rem; font-family:monospace;">${s.code}</td>
                                <td style="padding:0.8rem 0.5rem;">${s.name}</td>
                                <td style="padding:0.8rem 0.5rem; text-align:center;">${s.credits}</td>
                                <td style="padding:0.8rem 0.5rem; text-align:center;">${s.internal} / ${s.external}</td>
                                <td style="padding:0.8rem 0.5rem; text-align:center;">${s.total}</td>
                                <td style="padding:0.8rem 0.5rem; text-align:center; font-weight:bold; color:${this.getGradeColor(s.grade)}">${s.grade}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top:1.5rem; text-align:right;">
                    <button class="btn-primary" style="width:auto; background:var(--success);" onclick="window.app.showToast('Results saved to profile')">Confirm & Save</button>
                </div>
            </div>
        `;
    },

    getGradeColor: function (g) {
        if (g === 'S' || g === 'O') return 'var(--success)';
        if (g === 'F') return 'var(--error)';
        return 'var(--warning)';
    },

    renderPerformance: function () {
        document.getElementById('module-content').innerHTML = '<h2>Performance Analytics</h2><p>Chart visualizations coming soon...</p>';
    },

    renderAttendance: function () {
        const user = window.auth.getCurrentUser();
        const records = window.db.getAll('attendance').filter(r => r.studentId === user.id);
        const subjects = window.db.getAll('subjects');

        const content = document.getElementById('module-content');

        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">My Attendance</h2>
            
            <div class="glass-panel fade-in">
                 <table style="width:100%; border-collapse:collapse; color:white;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                            <th style="padding:1rem;">Subject</th>
                            <th style="padding:1rem;">Sem</th>
                            <th style="padding:1rem;">Classes Held</th>
                            <th style="padding:1rem;">Classes Attended</th>
                            <th style="padding:1rem;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                         ${records.length === 0 ? '<tr><td colspan="5" style="padding:1rem; text-align:center; color:var(--text-muted);">No attendance records found</td></tr>' :
                records.map(r => {
                    const sub = subjects.find(s => s.id === r.subjectId) || { name: 'Unknown', code: '-', semester: '-' };
                    const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
                    return `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                <td style="padding:1rem;">
                                    <div style="font-weight:600">${sub.name}</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">${sub.code}</div>
                                </td>
                                <td style="padding:1rem;">${sub.semester}</td>
                                <td style="padding:1rem;">${r.total}</td>
                                <td style="padding:1rem;">${r.attended}</td>
                                <td style="padding:1rem; font-weight:bold; color:${pct < 75 ? 'var(--error)' : 'var(--success)'}">${pct}%</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};
