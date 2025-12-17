class DataManager {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('app_initialized')) {
            this.seedData();
        }
    }

    seedData() {
        console.log('Seeding initial data...');

        const users = [
            { id: 'admin1', name: 'Admin User', username: 'admin', password: '123', role: 'admin' },
            { id: 'staff1', name: 'Dr. Smith', username: 'staff', password: '123', role: 'staff', deptId: 'dept1' },
            { id: 'student1', name: 'John Doe', username: 'student', password: '123', role: 'student', deptId: 'dept1', courseId: 'course1', parentId: 'parent1' },
            { id: 'parent1', name: 'Mr. Doe', username: 'parent', password: '123', role: 'parent', studentId: 'student1' }
        ];

        const departments = [
            { id: 'dept1', name: 'Computer Science' },
            { id: 'dept2', name: 'Electronics' }
        ];

        const courses = [
            { id: 'course1', name: 'B.Tech CSE', deptId: 'dept1', semesters: 8 },
            { id: 'course2', name: 'B.Tech ECE', deptId: 'dept2', semesters: 8 }
        ];

        const subjects = [
            { id: 'sub1', code: 'CS101', name: 'Intro to Programming', credit: 4, semester: 1, courseId: 'course1' },
            { id: 'sub2', code: 'MA101', name: 'Calculus', credit: 3, semester: 1, courseId: 'course1' }
        ];

        // Allocations: Which staff teaches which subject
        const allocations = [
            { id: 'alloc1', staffId: 'staff1', subjectId: 'sub1' }
        ];

        // Results/Marks (Internal & External)
        const results = [];

        // Attendance Records
        const attendance = [
            { id: 'att1', studentId: 'student1', subjectId: 'sub1', total: 40, attended: 35 }
        ];

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('departments', JSON.stringify(departments));
        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('subjects', JSON.stringify(subjects));
        localStorage.setItem('allocations', JSON.stringify(allocations));
        localStorage.setItem('results', JSON.stringify(results));
        localStorage.setItem('attendance', JSON.stringify(attendance));

        localStorage.setItem('app_initialized', 'true');
    }

    // --- GENERIC GETTERS ---
    getAll(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    }

    // --- SPECIFIC HELPERS ---
    getUserByCredentials(username, password) {
        const users = this.getAll('users');
        return users.find(u => u.username === username && u.password === password);
    }

    save(key, item) {
        const items = this.getAll(key);
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        localStorage.setItem(key, JSON.stringify(items));
    }
}

// Global Instance
window.db = new DataManager();
