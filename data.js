import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBKuDKJFy2U0_pozQKO_KuEVsYEm771VEY",
    authDomain: "progress-card111.firebaseapp.com",
    projectId: "progress-card111",
    storageBucket: "progress-card111.firebasestorage.app",
    messagingSenderId: "531985157468",
    appId: "1:531985157468:web:c5edb24b8c2f06efe58599",
    measurementId: "G-Y6E1TYGFL1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class DataManager {
    constructor() {
        this.db = db;
        this.cache = {
            users: [],
            departments: [],
            courses: [],
            subjects: [],
            allocations: [],
            results: [],
            attendance: []
        };
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        console.log('Initializing Firebase DataManager...');

        try {
            await Promise.all([
                this.loadCollection('users'),
                this.loadCollection('departments'),
                this.loadCollection('courses'),
                this.loadCollection('subjects'),
                this.loadCollection('allocations'),
                this.loadCollection('results'),
                this.loadCollection('attendance')
            ]);

            // Seed if empty
            if (this.cache.users.length === 0) {
                await this.seedData();
            }
            this.initialized = true;
            console.log('Firebase Initialization Complete');
        } catch (error) {
            console.error("Firebase Init Failed:", error);
            // Fallback? Or just throw.
            alert("Failed to connect to database. Please check your internet connection.");
        }
    }

    async loadCollection(key) {
        const querySnapshot = await getDocs(collection(this.db, key));
        this.cache[key] = [];
        querySnapshot.forEach((doc) => {
            this.cache[key].push(doc.data());
        });
    }

    async seedData() {
        console.log('Seeding initial data to Firebase...');

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

        const allocations = [
            { id: 'alloc1', staffId: 'staff1', subjectId: 'sub1' }
        ];

        const attendance = [
            { id: 'att1', studentId: 'student1', subjectId: 'sub1', total: 40, attended: 35 }
        ];

        // Helper to batch push
        const pushAll = async (key, items) => {
            for (const item of items) {
                await this.save(key, item);
            }
        };

        await pushAll('users', users);
        await pushAll('departments', departments);
        await pushAll('courses', courses);
        await pushAll('subjects', subjects);
        await pushAll('allocations', allocations);
        await pushAll('attendance', attendance);
    }

    // --- GENERIC GETTERS (SYNC via CACHE) ---
    getAll(key) {
        return this.cache[key] || [];
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

    // --- WRITE OPERATIONS (ASYNC + OPTIMISTIC) ---
    async save(key, item) {
        if (!item.id) {
            console.error("Item has no ID", item);
            return;
        }

        // Optimistic Cache Update
        const list = this.cache[key];
        const index = list.findIndex(i => i.id === item.id);
        if (index >= 0) {
            list[index] = item;
        } else {
            list.push(item);
        }

        // Firebase Update
        try {
            await setDoc(doc(this.db, key, item.id), item);
        } catch (e) {
            console.error(`Error saving to ${key}:`, e);
            // Revert cache if critical? For now we assume success
            // In a real app we'd rollback
        }
    }

    async delete(key, id) {
        // Optimistic Cache Update
        const list = this.cache[key];
        this.cache[key] = list.filter(i => i.id !== id);

        // Firebase Update
        try {
            await deleteDoc(doc(this.db, key, id));
        } catch (e) {
            console.error(`Error deleting from ${key}:`, e);
        }
    }
}

// Global Instance attached to window
window.db = new DataManager();
