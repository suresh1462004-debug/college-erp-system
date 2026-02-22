// API Configuration - auto-detect environment
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';
let authToken = localStorage.getItem('token') || '';
let currentAdmin = null;
let currentPage = 1;
let currentModule = 'dashboard';

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id !== 'logoutBtn') {
            item.addEventListener('click', handleNavigation);
        }
    });
    
    // Modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Add buttons
    document.getElementById('addStudentBtn')?.addEventListener('click', () => openStudentForm());
    document.getElementById('addStaffBtn')?.addEventListener('click', () => openStaffForm());
    document.getElementById('addFeeBtn')?.addEventListener('click', () => openFeeForm());
    
    // Search
    document.getElementById('studentSearch')?.addEventListener('input', debounce(searchStudents, 500));
    document.getElementById('staffSearch')?.addEventListener('input', debounce(searchStaff, 500));
    document.getElementById('feeSearch')?.addEventListener('input', debounce(searchFees, 500));
}

// Authentication Functions
function checkAuth() {
    if (authToken) {
        verifyToken();
    } else {
        showLoginPage();
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentAdmin = data.data;
            showDashboard();
        } else {
            localStorage.removeItem('token');
            authToken = '';
            showLoginPage();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showLoginPage();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            currentAdmin = data.admin;
            showDashboard();
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection.');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    authToken = '';
    currentAdmin = null;
    showLoginPage();
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    dashboardPage.style.display = 'none';
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'flex';
    document.getElementById('adminName').textContent = currentAdmin.username;
    loadDashboardStats();
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Hide all content
    document.querySelectorAll('.content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected content
    const contentId = `${page}Content`;
    document.getElementById(contentId).style.display = 'block';
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'students': 'Students Management',
        'staff': 'Staff Management',
        'fees': 'Fee Details Management'
    };
    document.getElementById('pageTitle').textContent = titles[page];
    
    currentModule = page;
    currentPage = 1;
    
    // Load data
    switch(page) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'students':
            loadStudents();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'fees':
            loadFees();
            break;
    }
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        // Load students stats
        const studentsRes = await fetch(`${API_BASE_URL}/students/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const studentsData = await studentsRes.json();
        
        // Load staff stats
        const staffRes = await fetch(`${API_BASE_URL}/staff/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const staffData = await staffRes.json();
        
        // Load fees stats
        const feesRes = await fetch(`${API_BASE_URL}/fees/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const feesData = await feesRes.json();
        
        // Update dashboard
        document.getElementById('totalStudents').textContent = studentsData.data.totalStudents || 0;
        document.getElementById('totalStaff').textContent = staffData.data.totalStaff || 0;
        document.getElementById('totalFees').textContent = feesData.data.totalFees || 0;
        document.getElementById('overdueCount').textContent = feesData.data.overdueCount || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Students Management
async function loadStudents(search = '', page = 1) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/students?page=${page}&limit=10&search=${search}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            displayStudents(data.data);
            updatePagination('students', data.page, data.pages);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.rollNumber}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.department}</td>
            <td>${student.semester}</td>
            <td><span class="badge badge-${getStatusClass(student.status)}">${student.status}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewStudent('${student._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editStudent('${student._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchStudents(e) {
    const search = e.target.value;
    loadStudents(search, 1);
}

function openStudentForm(studentData = null) {
    const isEdit = !!studentData;
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Student' : 'Add New Student';
    
    const formHtml = `
        <div class="form-row">
            <div class="form-group">
                <label>Roll Number *</label>
                <input type="text" name="rollNumber" value="${studentData?.rollNumber || ''}" required ${isEdit ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label>Batch Year *</label>
                <input type="text" name="batch" value="${studentData?.batch || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value="${studentData?.firstName || ''}" required>
            </div>
            <div class="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value="${studentData?.lastName || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="${studentData?.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="text" name="phone" value="${studentData?.phone || ''}" pattern="[0-9]{10}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value="${studentData?.dateOfBirth?.split('T')[0] || ''}" required>
            </div>
            <div class="form-group">
                <label>Gender *</label>
                <select name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="Male" ${studentData?.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${studentData?.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${studentData?.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Department *</label>
                <select name="department" required>
                    <option value="">Select Department</option>
                    <option value="Computer Science" ${studentData?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                    <option value="Electronics" ${studentData?.department === 'Electronics' ? 'selected' : ''}>Electronics</option>
                    <option value="Mechanical" ${studentData?.department === 'Mechanical' ? 'selected' : ''}>Mechanical</option>
                    <option value="Civil" ${studentData?.department === 'Civil' ? 'selected' : ''}>Civil</option>
                    <option value="Electrical" ${studentData?.department === 'Electrical' ? 'selected' : ''}>Electrical</option>
                    <option value="IT" ${studentData?.department === 'IT' ? 'selected' : ''}>IT</option>
                </select>
            </div>
            <div class="form-group">
                <label>Semester *</label>
                <select name="semester" required>
                    <option value="">Select Semester</option>
                    ${[1,2,3,4,5,6,7,8].map(s => 
                        `<option value="${s}" ${studentData?.semester === s ? 'selected' : ''}>${s}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Address</label>
            <input type="text" name="address.street" placeholder="Street" value="${studentData?.address?.street || ''}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>City</label>
                <input type="text" name="address.city" value="${studentData?.address?.city || ''}">
            </div>
            <div class="form-group">
                <label>State</label>
                <input type="text" name="address.state" value="${studentData?.address?.state || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Parent/Guardian Name *</label>
                <input type="text" name="parentName" value="${studentData?.parentName || ''}" required>
            </div>
            <div class="form-group">
                <label>Parent Phone *</label>
                <input type="text" name="parentPhone" value="${studentData?.parentPhone || ''}" pattern="[0-9]{10}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup">
                    <option value="">Select Blood Group</option>
                    ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => 
                        `<option value="${bg}" ${studentData?.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Active" ${studentData?.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${studentData?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="Graduated" ${studentData?.status === 'Graduated' ? 'selected' : ''}>Graduated</option>
                    <option value="Suspended" ${studentData?.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                </select>
            </div>
        </div>
    `;
    
    document.getElementById('formFields').innerHTML = formHtml;
    modal.classList.add('show');
    
    modalForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value;
            } else {
                data[key] = value;
            }
        });
        
        if (isEdit) {
            updateStudent(studentData._id, data);
        } else {
            createStudent(data);
        }
    };
}

async function createStudent(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Student created successfully!');
            closeModal();
            loadStudents();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error creating student');
        }
    } catch (error) {
        console.error('Error creating student:', error);
        alert('Network error');
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            openStudentForm(result.data);
        }
    } catch (error) {
        console.error('Error fetching student:', error);
    }
}

async function updateStudent(id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Student updated successfully!');
            closeModal();
            loadStudents();
        } else {
            alert(result.message || 'Error updating student');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Network error');
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Student deleted successfully!');
            loadStudents();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error deleting student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Network error');
    }
}

async function viewStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const student = result.data;
            alert(`Student Details:\n\nRoll Number: ${student.rollNumber}\nName: ${student.firstName} ${student.lastName}\nEmail: ${student.email}\nDepartment: ${student.department}\nSemester: ${student.semester}\nStatus: ${student.status}`);
        }
    } catch (error) {
        console.error('Error viewing student:', error);
    }
}

// Staff Management (Similar pattern to Students)
async function loadStaff(search = '', page = 1) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/staff?page=${page}&limit=10&search=${search}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            displayStaff(data.data);
            updatePagination('staff', data.page, data.pages);
        }
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function displayStaff(staff) {
    const tbody = document.getElementById('staffTableBody');
    
    if (staff.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No staff found</td></tr>';
        return;
    }
    
    tbody.innerHTML = staff.map(s => `
        <tr>
            <td>${s.employeeId}</td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.department}</td>
            <td>${s.designation}</td>
            <td><span class="badge badge-${getStatusClass(s.status)}">${s.status}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewStaff('${s._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editStaff('${s._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteStaff('${s._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchStaff(e) {
    const search = e.target.value;
    loadStaff(search, 1);
}

function openStaffForm(staffData = null) {
    const isEdit = !!staffData;
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Staff' : 'Add New Staff';
    
    const formHtml = `
        <div class="form-row">
            <div class="form-group">
                <label>Employee ID *</label>
                <input type="text" name="employeeId" value="${staffData?.employeeId || ''}" required ${isEdit ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label>Joining Date *</label>
                <input type="date" name="joiningDate" value="${staffData?.joiningDate?.split('T')[0] || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value="${staffData?.firstName || ''}" required>
            </div>
            <div class="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value="${staffData?.lastName || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="${staffData?.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="text" name="phone" value="${staffData?.phone || ''}" pattern="[0-9]{10}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value="${staffData?.dateOfBirth?.split('T')[0] || ''}" required>
            </div>
            <div class="form-group">
                <label>Gender *</label>
                <select name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="Male" ${staffData?.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${staffData?.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${staffData?.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Department *</label>
                <select name="department" required>
                    <option value="">Select Department</option>
                    <option value="Computer Science" ${staffData?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                    <option value="Electronics" ${staffData?.department === 'Electronics' ? 'selected' : ''}>Electronics</option>
                    <option value="Mechanical" ${staffData?.department === 'Mechanical' ? 'selected' : ''}>Mechanical</option>
                    <option value="Administration" ${staffData?.department === 'Administration' ? 'selected' : ''}>Administration</option>
                </select>
            </div>
            <div class="form-group">
                <label>Designation *</label>
                <select name="designation" required>
                    <option value="">Select Designation</option>
                    <option value="Professor" ${staffData?.designation === 'Professor' ? 'selected' : ''}>Professor</option>
                    <option value="Assistant Professor" ${staffData?.designation === 'Assistant Professor' ? 'selected' : ''}>Assistant Professor</option>
                    <option value="Lecturer" ${staffData?.designation === 'Lecturer' ? 'selected' : ''}>Lecturer</option>
                    <option value="HOD" ${staffData?.designation === 'HOD' ? 'selected' : ''}>HOD</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Qualification *</label>
                <input type="text" name="qualification" value="${staffData?.qualification || ''}" required>
            </div>
            <div class="form-group">
                <label>Experience (Years) *</label>
                <input type="number" name="experience" value="${staffData?.experience || 0}" min="0" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Salary *</label>
                <input type="number" name="salary" value="${staffData?.salary || ''}" min="0" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Active" ${staffData?.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${staffData?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="On Leave" ${staffData?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                </select>
            </div>
        </div>
    `;
    
    document.getElementById('formFields').innerHTML = formHtml;
    modal.classList.add('show');
    
    modalForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (isEdit) {
            updateStaff(staffData._id, data);
        } else {
            createStaff(data);
        }
    };
}

async function createStaff(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Staff created successfully!');
            closeModal();
            loadStaff();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error creating staff');
        }
    } catch (error) {
        console.error('Error creating staff:', error);
        alert('Network error');
    }
}

async function editStaff(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            openStaffForm(result.data);
        }
    } catch (error) {
        console.error('Error fetching staff:', error);
    }
}

async function updateStaff(id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Staff updated successfully!');
            closeModal();
            loadStaff();
        } else {
            alert(result.message || 'Error updating staff');
        }
    } catch (error) {
        console.error('Error updating staff:', error);
        alert('Network error');
    }
}

async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Staff deleted successfully!');
            loadStaff();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error deleting staff');
        }
    } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Network error');
    }
}

async function viewStaff(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const staff = result.data;
            alert(`Staff Details:\n\nEmployee ID: ${staff.employeeId}\nName: ${staff.firstName} ${staff.lastName}\nEmail: ${staff.email}\nDepartment: ${staff.department}\nDesignation: ${staff.designation}\nStatus: ${staff.status}`);
        }
    } catch (error) {
        console.error('Error viewing staff:', error);
    }
}

// Fee Details Management
async function loadFees(search = '', page = 1) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/fees?page=${page}&limit=10&rollNumber=${search}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const data = await response.json();
        
        if (response.ok) {
            displayFees(data.data);
            updatePagination('fees', data.page, data.pages);
        }
    } catch (error) {
        console.error('Error loading fees:', error);
    }
}

function displayFees(fees) {
    const tbody = document.getElementById('feesTableBody');
    
    if (fees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No fee records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = fees.map(fee => `
        <tr>
            <td>${fee.rollNumber}</td>
            <td>${fee.student ? fee.student.firstName + ' ' + fee.student.lastName : 'N/A'}</td>
            <td>${fee.feeType}</td>
            <td>₹${fee.totalAmount}</td>
            <td>₹${fee.paidAmount}</td>
            <td>₹${fee.dueAmount}</td>
            <td><span class="badge badge-${getPaymentStatusClass(fee.paymentStatus)}">${fee.paymentStatus}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewFee('${fee._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editFee('${fee._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteFee('${fee._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchFees(e) {
    const search = e.target.value;
    loadFees(search, 1);
}

function openFeeForm(feeData = null) {
    const isEdit = !!feeData;
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Fee Detail' : 'Add New Fee Detail';
    
    const formHtml = `
        <div class="form-row">
            <div class="form-group">
                <label>Roll Number *</label>
                <input type="text" name="rollNumber" value="${feeData?.rollNumber || ''}" required ${isEdit ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label>Academic Year *</label>
                <input type="text" name="academicYear" value="${feeData?.academicYear || '2024-2025'}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Semester *</label>
                <select name="semester" required>
                    <option value="">Select Semester</option>
                    ${[1,2,3,4,5,6,7,8].map(s => 
                        `<option value="${s}" ${feeData?.semester === s ? 'selected' : ''}>${s}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Fee Type *</label>
                <select name="feeType" required>
                    <option value="">Select Fee Type</option>
                    <option value="Tuition Fee" ${feeData?.feeType === 'Tuition Fee' ? 'selected' : ''}>Tuition Fee</option>
                    <option value="Library Fee" ${feeData?.feeType === 'Library Fee' ? 'selected' : ''}>Library Fee</option>
                    <option value="Lab Fee" ${feeData?.feeType === 'Lab Fee' ? 'selected' : ''}>Lab Fee</option>
                    <option value="Sports Fee" ${feeData?.feeType === 'Sports Fee' ? 'selected' : ''}>Sports Fee</option>
                    <option value="Exam Fee" ${feeData?.feeType === 'Exam Fee' ? 'selected' : ''}>Exam Fee</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Total Amount *</label>
                <input type="number" name="totalAmount" value="${feeData?.totalAmount || ''}" min="0" required>
            </div>
            <div class="form-group">
                <label>Paid Amount</label>
                <input type="number" name="paidAmount" value="${feeData?.paidAmount || 0}" min="0">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Due Date *</label>
                <input type="date" name="dueDate" value="${feeData?.dueDate?.split('T')[0] || ''}" required>
            </div>
            <div class="form-group">
                <label>Payment Mode</label>
                <select name="paymentMode">
                    <option value="Not Paid" ${feeData?.paymentMode === 'Not Paid' ? 'selected' : ''}>Not Paid</option>
                    <option value="Cash" ${feeData?.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
                    <option value="Online Transfer" ${feeData?.paymentMode === 'Online Transfer' ? 'selected' : ''}>Online Transfer</option>
                    <option value="Card" ${feeData?.paymentMode === 'Card' ? 'selected' : ''}>Card</option>
                    <option value="UPI" ${feeData?.paymentMode === 'UPI' ? 'selected' : ''}>UPI</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Transaction ID</label>
            <input type="text" name="transactionId" value="${feeData?.transactionId || ''}">
        </div>
        <div class="form-group">
            <label>Remarks</label>
            <textarea name="remarks">${feeData?.remarks || ''}</textarea>
        </div>
    `;
    
    document.getElementById('formFields').innerHTML = formHtml;
    modal.classList.add('show');
    
    modalForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (isEdit) {
            updateFee(feeData._id, data);
        } else {
            createFee(data);
        }
    };
}

async function createFee(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/fees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Fee detail created successfully!');
            closeModal();
            loadFees();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error creating fee detail');
        }
    } catch (error) {
        console.error('Error creating fee:', error);
        alert('Network error');
    }
}

async function editFee(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            openFeeForm(result.data);
        }
    } catch (error) {
        console.error('Error fetching fee:', error);
    }
}

async function updateFee(id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Fee detail updated successfully!');
            closeModal();
            loadFees();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error updating fee detail');
        }
    } catch (error) {
        console.error('Error updating fee:', error);
        alert('Network error');
    }
}

async function deleteFee(id) {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Fee detail deleted successfully!');
            loadFees();
            loadDashboardStats();
        } else {
            alert(result.message || 'Error deleting fee detail');
        }
    } catch (error) {
        console.error('Error deleting fee:', error);
        alert('Network error');
    }
}

async function viewFee(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const fee = result.data;
            alert(`Fee Details:\n\nRoll Number: ${fee.rollNumber}\nFee Type: ${fee.feeType}\nTotal Amount: ₹${fee.totalAmount}\nPaid Amount: ₹${fee.paidAmount}\nDue Amount: ₹${fee.dueAmount}\nStatus: ${fee.paymentStatus}`);
        }
    } catch (error) {
        console.error('Error viewing fee:', error);
    }
}

// Utility Functions
function closeModal() {
    modal.classList.remove('show');
    modalForm.reset();
}

function getStatusClass(status) {
    const statusMap = {
        'Active': 'success',
        'Inactive': 'danger',
        'Graduated': 'info',
        'Suspended': 'danger',
        'On Leave': 'warning'
    };
    return statusMap[status] || 'info';
}

function getPaymentStatusClass(status) {
    const statusMap = {
        'Paid': 'success',
        'Partial': 'warning',
        'Pending': 'info',
        'Overdue': 'danger'
    };
    return statusMap[status] || 'info';
}

function updatePagination(module, currentPage, totalPages) {
    const paginationId = `${module}Pagination`;
    const pagination = document.getElementById(paginationId);
    
    if (!pagination) return;
    
    let html = '';
    
    if (totalPages > 1) {
        html += `<button onclick="changePage('${module}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
        html += `<span>Page ${currentPage} of ${totalPages}</span>`;
        html += `<button onclick="changePage('${module}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    }
    
    pagination.innerHTML = html;
}

function changePage(module, page) {
    switch(module) {
        case 'students':
            loadStudents('', page);
            break;
        case 'staff':
            loadStaff('', page);
            break;
        case 'fees':
            loadFees('', page);
            break;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
