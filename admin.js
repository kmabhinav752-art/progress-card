window.AdminModule = {
    init: function () {
        const app = document.getElementById('app');
        app.innerHTML = this.getLayout();
        this.renderDashboard();
        this.setupNavigation();
    },

    getLayout: function () {
        const user = window.auth.getCurrentUser();
        return `
            <div class="dashboard-layout">
                <nav class="sidebar">
                    <div class="logo">
                        <i class="ph ph-graduation-cap"></i>
                        <span>Admin Portal</span>
                    </div>
                    <ul class="nav-links">
                        <li class="nav-item active" data-view="dashboard">
                            <i class="ph ph-squares-four"></i> Dashboard
                        </li>
                        <li class="nav-item" data-view="departments">
                            <i class="ph ph-buildings"></i> Departments
                        </li>
                        <li class="nav-item" data-view="courses">
                            <i class="ph ph-books"></i> Courses
                        </li>
                        <li class="nav-item" data-view="staff">
                            <i class="ph ph-chalkboard-teacher"></i> Staff
                        </li>
                         <li class="nav-item" data-view="allocations">
                            <i class="ph ph-link"></i> Allocations
                        </li>
                    </ul>
                    <div class="user-profile-mini">
                        <div class="user-avatar">${user.name.charAt(0)}</div>
                        <div>
                            <div style="font-weight:600">${user.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted)">Administrator</div>
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

    renderDashboard: function () {
        const content = document.getElementById('module-content');
        const depts = window.db.getAll('departments').length;
        const users = window.db.getAll('users').length;
        const courses = window.db.getAll('courses').length;

        content.innerHTML = `
            <h2 class="fade-in" style="margin-bottom: 1.5rem;">Dashboard Overview</h2>
            <div class="stats-grid fade-in">
                <div class="glass-panel stat-card">
                    <div class="stat-icon"><i class="ph ph-buildings"></i></div>
                    <div>
                        <h3>${depts}</h3>
                        <p style="color:var(--text-muted)">Departments</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                     <div class="stat-icon"><i class="ph ph-users"></i></div>
                    <div>
                        <h3>${users}</h3>
                        <p style="color:var(--text-muted)">Total Users</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                     <div class="stat-icon"><i class="ph ph-books"></i></div>
                    <div>
                        <h3>${courses}</h3>
                        <p style="color:var(--text-muted)">Active Courses</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-panel fade-in">
                <h3 style="margin-bottom:1rem;">System Status</h3>
                <p>All AI services are running optimally.</p>
                <p>LocalStorage database is active.</p>
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
                if (view === 'departments') this.renderDepartments();
                if (view === 'courses') this.renderCourses();
                if (view === 'staff') this.renderStaff();
                if (view === 'allocations') this.renderAllocations();
            });
        });
    },

    renderDepartments: function () {
        const depts = window.db.getAll('departments');
        const content = document.getElementById('module-content');

        content.innerHTML = `
            <div class="fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Manage Departments</h2>
                    <button class="btn-primary" style="width:auto;" onclick="window.AdminModule.showAddDeptModal()">+ Add New</button>
                </div>
                
                <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">ID</th>
                                <th style="padding:1rem;">Department Name</th>
                                <th style="padding:1rem; text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${depts.map(d => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem; color:var(--text-muted);">${d.id}</td>
                                    <td style="padding:1rem;">${d.name}</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button style="background:none; border:none; color:var(--error); cursor:pointer;" onclick="window.AdminModule.deleteDept('${d.id}')">
                                            <i class="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ${this.getModalTemplate('deptModal', 'Add Department', `
                <div class="form-group">
                    <label>Department Name</label>
                    <input type="text" id="newDeptName" class="glass-input" required>
                </div>
            `, 'window.AdminModule.saveDept()')}
        `;
    },

    renderCourses: function () {
        const courses = window.db.getAll('courses');
        const depts = window.db.getAll('departments');
        const content = document.getElementById('module-content');

        content.innerHTML = `
            <div class="fade-in">
                 <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Manage Courses</h2>
                    <button class="btn-primary" style="width:auto;" onclick="window.AdminModule.showAddCourseModal()">+ Add New</button>
                </div>

                <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">Name</th>
                                <th style="padding:1rem;">Department</th>
                                <th style="padding:1rem;">Semesters</th>
                                <th style="padding:1rem; text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courses.map(c => {
            const d = depts.find(dp => dp.id === c.deptId);
            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem;">${c.name}</td>
                                    <td style="padding:1rem; color:var(--text-muted);">${d ? d.name : 'Unknown'}</td>
                                    <td style="padding:1rem;">${c.semesters}</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button style="background:none; border:none; color:var(--error); cursor:pointer;" onclick="window.AdminModule.deleteCourse('${c.id}')">
                                            <i class="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
             ${this.getModalTemplate('courseModal', 'Add Course', `
                <div class="form-group">
                    <label>Course Name</label>
                    <input type="text" id="newCourseName" class="glass-input" required>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="newCourseDept" class="glass-input">
                        ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                 <div class="form-group">
                    <label>Semesters</label>
                    <input type="number" id="newCourseSem" class="glass-input" value="8" min="1" max="10">
                </div>
            `, 'window.AdminModule.saveCourse()')}
        `;
    },

    // --- Actions ---
    showAddDeptModal: function () {
        document.getElementById('deptModal').classList.remove('hidden');
    },

    saveDept: function () {
        const name = document.getElementById('newDeptName').value;
        if (name) {
            const id = 'dept_' + Date.now();
            window.db.save('departments', { id, name });
            this.renderDepartments();
            window.app.showToast('Department added');
        }
    },

    deleteDept: function (id) {
        // Simple filter delete for demo (in real app, use DB method)
        let items = window.db.getAll('departments');
        items = items.filter(i => i.id !== id);
        localStorage.setItem('departments', JSON.stringify(items));
        this.renderDepartments();
    },

    showAddCourseModal: function () {
        document.getElementById('courseModal').classList.remove('hidden');
    },

    saveCourse: function () {
        const name = document.getElementById('newCourseName').value;
        const deptId = document.getElementById('newCourseDept').value;
        const semesters = document.getElementById('newCourseSem').value;

        if (name && deptId) {
            const id = 'course_' + Date.now();
            window.db.save('courses', { id, name, deptId, semesters });
            this.renderCourses();
            window.app.showToast('Course added');
        }
    },

    deleteCourse: function (id) {
        let items = window.db.getAll('courses');
        items = items.filter(i => i.id !== id);
        localStorage.setItem('courses', JSON.stringify(items));
        this.renderCourses();
    },

    // --- STAFF MANAGEMENT ---
    renderStaff: function () {
        const staff = window.db.getAll('users').filter(u => u.role === 'staff');
        const depts = window.db.getAll('departments');
        const content = document.getElementById('module-content');

        content.innerHTML = `
            <div class="fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Manage Staff</h2>
                    <button class="btn-primary" style="width:auto;" onclick="window.AdminModule.showAddStaffModal()">+ Add New</button>
                </div>
                
                <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">Name</th>
                                <th style="padding:1rem;">Username</th>
                                <th style="padding:1rem;">Department</th>
                                <th style="padding:1rem; text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staff.map(s => {
            const d = depts.find(dp => dp.id === s.deptId);
            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem;">${s.name}</td>
                                    <td style="padding:1rem;">${s.username}</td>
                                    <td style="padding:1rem; color:var(--text-muted);">${d ? d.name : 'N/A'}</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button style="background:none; border:none; color:var(--error); cursor:pointer;" onclick="window.AdminModule.deleteUser('${s.id}')">
                                            <i class="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
             ${this.getModalTemplate('staffModal', 'Add Staff Member', `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="newStaffName" class="glass-input" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="newStaffUser" class="glass-input" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="text" id="newStaffPass" class="glass-input" value="123" required>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="newStaffDept" class="glass-input">
                        ${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
            `, 'window.AdminModule.saveStaff()')}
        `;
    },

    showAddStaffModal: function () { document.getElementById('staffModal').classList.remove('hidden'); },

    saveStaff: function () {
        const name = document.getElementById('newStaffName').value;
        const username = document.getElementById('newStaffUser').value;
        const password = document.getElementById('newStaffPass').value;
        const deptId = document.getElementById('newStaffDept').value;

        if (name && username && password) {
            const id = 'staff_' + Date.now();
            window.db.save('users', { id, name, username, password, role: 'staff', deptId });
            this.renderStaff();
            window.app.showToast('Staff added');
        }
    },

    deleteUser: function (id) {
        let items = window.db.getAll('users');
        items = items.filter(i => i.id !== id);
        localStorage.setItem('users', JSON.stringify(items));
        this.renderStaff(); // Re-render staff view if active
    },

    // --- ALLOCATIONS (Staff <-> Subject) ---
    renderAllocations: function () {
        // Need subjects first
        const allocations = window.db.getAll('allocations');
        const subjects = window.db.getAll('subjects');
        const staff = window.db.getAll('users').filter(u => u.role === 'staff');

        const content = document.getElementById('module-content');

        // Helper to get names
        const getSubjectName = (id) => { const s = subjects.find(x => x.id === id); return s ? s.name : id; };
        const getStaffName = (id) => { const s = staff.find(x => x.id === id); return s ? s.name : id; };

        content.innerHTML = `
             <div class="fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2>Subject Allocations</h2>
                    <button class="btn-primary" style="width:auto;" onclick="window.AdminModule.showAddAllocModal()">+ Allocate</button>
                </div>
                
                 <div class="glass-panel">
                    <table style="width:100%; border-collapse:collapse; color:white;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                                <th style="padding:1rem;">Subject</th>
                                <th style="padding:1rem;">Allocated Staff</th>
                                <th style="padding:1rem; text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allocations.map(a => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:1rem;">${getSubjectName(a.subjectId)}</td>
                                    <td style="padding:1rem;">${getStaffName(a.staffId)}</td>
                                    <td style="padding:1rem; text-align:right;">
                                        <button style="background:none; border:none; color:var(--error); cursor:pointer;" onclick="window.AdminModule.deleteAllocation('${a.id}')">
                                            <i class="ph ph-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            ${this.getModalTemplate('allocModal', 'Allocate Subject', `
                <div class="form-group">
                    <label>Staff Member</label>
                    <select id="allocStaff" class="glass-input">
                        ${staff.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <select id="allocSubject" class="glass-input">
                        ${subjects.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join('')}
                    </select>
                </div>
            `, 'window.AdminModule.saveAllocation()')}
        `;
    },

    showAddAllocModal: function () { document.getElementById('allocModal').classList.remove('hidden'); },

    saveAllocation: function () {
        const staffId = document.getElementById('allocStaff').value;
        const subjectId = document.getElementById('allocSubject').value;

        if (staffId && subjectId) {
            const id = 'alloc_' + Date.now();
            window.db.save('allocations', { id, staffId, subjectId });
            this.renderAllocations();
            window.app.showToast('Allocation added');
        }
    },

    deleteAllocation: function (id) {
        let items = window.db.getAll('allocations');
        items = items.filter(i => i.id !== id);
        localStorage.setItem('allocations', JSON.stringify(items));
        this.renderAllocations();
    },

    // --- Modal Helper ---
    getModalTemplate: function (id, title, content, saveAction) {
        return `
            <div id="${id}" class="auth-wrapper hidden" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:100;">
                <div class="glass-panel fade-in" style="width:400px; margin:auto;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                        <h3>${title}</h3>
                        <i class="ph ph-x" style="cursor:pointer;" onclick="document.getElementById('${id}').classList.add('hidden')"></i>
                    </div>
                    ${content}
                    <button class="btn-primary" onclick="${saveAction}">Save</button>
                </div>
            </div>
        `;
    }
};
