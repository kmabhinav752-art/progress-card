window.StaffModule = {
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
                        <i class="ph ph-chalkboard-teacher"></i>
                        <span>Staff Portal</span>
                    </div>
                    <ul class="nav-links">
                        <li class="nav-item active" data-view="dashboard">
                            <i class="ph ph-squares-four"></i> Dashboard
                        </li>
                        <li class="nav-item" data-view="marks">
                            <i class="ph ph-exam"></i> Enter Marks
                        </li>
                        <li class="nav-item" data-view="attendance">
                             <i class="ph ph-calendar-check"></i> Attendance
                        </li>
                    </ul>
                    <div class="user-profile-mini">
                        <div class="user-avatar">${user.name.charAt(0)}</div>
                        <div>
                            <div style="font-weight:600">${user.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted)">Faculty</div>
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
                if (item.dataset.view === 'marks') this.renderMarksSelection();
                if (item.dataset.view === 'attendance') this.renderAttendance();
            });
        });
    },

    renderDashboard: function () {
        const user = window.auth.getCurrentUser();
        const allocations = window.db.getAll('allocations').filter(a => a.staffId === user.id);
        const subjects = window.db.getAll('subjects');

        const content = document.getElementById('module-content');

        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">Instructor Dashboard</h2>
             <div class="stats-grid fade-in">
                <div class="glass-panel stat-card">
                    <div class="stat-icon"><i class="ph ph-book-bookmark"></i></div>
                    <div>
                        <h3>${allocations.length}</h3>
                        <p style="color:var(--text-muted)">Allocated Subjects</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon"><i class="ph ph-users-three"></i></div>
                    <div>
                        <h3>60</h3>
                        <p style="color:var(--text-muted)">Total Students</p>
                    </div>
                </div>
            </div>

            <h3 class="fade-in" style="margin-top:2rem; margin-bottom:1rem;">Your Subjects</h3>
            <div class="stats-grid fade-in">
                ${allocations.map(a => {
            const s = subjects.find(sub => sub.id === a.subjectId);
            return `
                        <div class="glass-panel" style="padding:1.5rem;">
                            <h4 style="color:var(--primary); margin-bottom:0.5rem;">${s.code}</h4>
                            <div style="font-size:1.2rem; font-weight:600; margin-bottom:1rem;">${s.name}</div>
                            <button class="btn-primary" style="font-size:0.9rem; padding:8px;" onclick="window.StaffModule.renderMarksEntry('${s.id}')">Manage Marks</button>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderMarksSelection: function () {
        this.renderDashboard(); // Re-use for now as it lists subjects
    },

    renderMarksEntry: function (subjectId) {
        const subject = window.db.getById('subjects', subjectId);
        // Find students in the course (simplified: get all students)
        const students = window.db.getAll('users').filter(u => u.role === 'student');

        const content = document.getElementById('module-content');
        content.innerHTML = `
            <div class="fade-in">
                <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-bottom:1rem;" onclick="window.StaffModule.renderDashboard()">
                    <i class="ph ph-arrow-left"></i> Back to Dashboard
                </button>
                
                <h2 style="margin-bottom:1.5rem;">Internal Marks: ${subject.name}</h2>
                
                <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">Student Name</th>
                                <th style="padding:1rem;">Internal 1 (20)</th>
                                <th style="padding:1rem;">Internal 2 (20)</th>
                                <th style="padding:1rem;">Assignment (10)</th>
                                <th style="padding:1rem;">Total (50)</th>
                                <th style="padding:1rem; text-align:right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem;">
                                        <div style="font-weight:600">${s.name}</div>
                                        <div style="font-size:0.8rem; color:var(--text-muted);">${s.username}</div>
                                    </td>
                                    <td style="padding:1rem;"><input type="number" class="glass-input" style="width:60px; padding:5px;" max="20" placeholder="-"></td>
                                    <td style="padding:1rem;"><input type="number" class="glass-input" style="width:60px; padding:5px;" max="20" placeholder="-"></td>
                                    <td style="padding:1rem;"><input type="number" class="glass-input" style="width:60px; padding:5px;" max="10" placeholder="-"></td>
                                    <td style="padding:1rem; font-weight:bold;">-</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button class="btn-primary" style="width:auto; padding:5px 10px; font-size:0.8rem;" onclick="window.app.showToast('Marks Saved for ${s.name}')">Save</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderAttendance: function () {
        // Reuse Dashboard style list for consistency
        const user = window.auth.getCurrentUser();
        const allocations = window.db.getAll('allocations').filter(a => a.staffId === user.id);
        const subjects = window.db.getAll('subjects');
        const content = document.getElementById('module-content');

        content.innerHTML = `
             <h2 class="fade-in" style="margin-bottom: 1.5rem;">Attendance Management</h2>
             <h3 class="fade-in" style="margin-bottom:1rem;">Select Subject</h3>
             <div class="stats-grid fade-in">
                ${allocations.map(a => {
            const s = subjects.find(sub => sub.id === a.subjectId);
            return `
                        <div class="glass-panel" style="padding:1.5rem;">
                            <h4 style="color:var(--primary); margin-bottom:0.5rem;">${s.code}</h4>
                            <div style="font-size:1.2rem; font-weight:600; margin-bottom:1rem;">${s.name}</div>
                            <button class="btn-primary" style="font-size:0.9rem; padding:8px;" onclick="window.StaffModule.renderAttendanceEntry('${s.id}')">Manage Attendance</button>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderAttendanceEntry: function (subjectId) {
        const subject = window.db.getById('subjects', subjectId);
        const students = window.db.getAll('users').filter(u => u.role === 'student'); // Simplified
        const attendanceRecords = window.db.getAll('attendance');

        const content = document.getElementById('module-content');

        content.innerHTML = `
            <div class="fade-in">
                <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-bottom:1rem;" onclick="window.StaffModule.renderAttendance()">
                    <i class="ph ph-arrow-left"></i> Back to Selection
                </button>
                
                <h2 style="margin-bottom:1.5rem;">Mark Attendance: ${subject.name}</h2>
                
                <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">Student Name</th>
                                <th style="padding:1rem;">Total Classes</th>
                                <th style="padding:1rem;">Attended</th>
                                <th style="padding:1rem;">Percentage</th>
                                <th style="padding:1rem; text-align:right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => {
            const record = attendanceRecords.find(r => r.studentId === s.id && r.subjectId === subjectId) || { total: 0, attended: 0 };
            const pct = record.total > 0 ? Math.round((record.attended / record.total) * 100) : 0;
            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem;">
                                        <div style="font-weight:600">${s.name}</div>
                                        <div style="font-size:0.8rem; color:var(--text-muted);">${s.username}</div>
                                    </td>
                                    <td style="padding:1rem;"><input type="number" id="total_${s.id}" class="glass-input" style="width:70px; padding:5px;" value="${record.total}"></td>
                                    <td style="padding:1rem;"><input type="number" id="attended_${s.id}" class="glass-input" style="width:70px; padding:5px;" value="${record.attended}"></td>
                                    <td style="padding:1rem; font-weight:bold; color:${pct < 75 ? 'var(--error)' : 'var(--success)'}">${pct}%</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button class="btn-primary" style="width:auto; padding:5px 10px; font-size:0.8rem;" onclick="window.StaffModule.saveAttendance('${s.id}', '${subjectId}')">Update</button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    saveAttendance: function (studentId, subjectId) {
        const total = parseInt(document.getElementById(`total_${studentId}`).value) || 0;
        const attended = parseInt(document.getElementById(`attended_${studentId}`).value) || 0;

        let records = window.db.getAll('attendance');
        const existingIndex = records.findIndex(r => r.studentId === studentId && r.subjectId === subjectId);

        const newRecord = {
            id: existingIndex >= 0 ? records[existingIndex].id : 'att_' + Date.now(),
            studentId,
            subjectId,
            total,
            attended
        };

        if (existingIndex >= 0) {
            records[existingIndex] = newRecord;
        } else {
            records.push(newRecord);
        }

        localStorage.setItem('attendance', JSON.stringify(records));
        window.app.showToast('Attendance updated');
        this.renderAttendanceEntry(subjectId); // Re-render to update %
    }
};
