const PRODUCT_BRIEF = "Build a professional Robotics Academy Management Platform for students, instructors, and administrators. Include a dashboard, student registration, robotics courses, project tracking, course progress, and an admin overview. Use HTML, CSS, and JavaScript.";
const STORE_KEY = 'codeship-roboacademy-v1';
const initialData = {
  students: [
    {id:1,name:'Aanya Sharma',email:'aanya@example.com',track:'Robotics Fundamentals',joined:'Oct 18, 2026'},
    {id:2,name:'Rohan Verma',email:'rohan@example.com',track:'AI & Computer Vision',joined:'Oct 16, 2026'},
    {id:3,name:'Meera Singh',email:'meera@example.com',track:'Drone Engineering',joined:'Oct 12, 2026'},
    {id:4,name:'Kabir Das',email:'kabir@example.com',track:'Embedded Systems',joined:'Oct 10, 2026'}
  ],
  courses: [
    {id:'robotics',title:'Robotics Fundamentals',description:'Build a strong foundation in sensors, motors, control logic, and robot assembly.',level:'Beginner',duration:'6 weeks',icon:'⚙',enrolled:true},
    {id:'vision',title:'AI & Computer Vision',description:'Explore image classification, object detection concepts, and camera-based projects.',level:'Intermediate',duration:'8 weeks',icon:'◉',enrolled:true},
    {id:'drones',title:'Drone Engineering',description:'Learn flight components, safe operation principles, and autonomous mission planning.',level:'Intermediate',duration:'5 weeks',icon:'✣',enrolled:false},
    {id:'embedded',title:'Embedded Systems',description:'Connect microcontrollers, electronic components, and software in real prototypes.',level:'Beginner',duration:'7 weeks',icon:'▦',enrolled:false}
  ],
  projects: [
    {id:1,name:'Line-following robot',owner:'Team Alpha',status:'In progress'},
    {id:2,name:'Smart greenhouse monitor',owner:'Team Beta',status:'Planning'},
    {id:3,name:'Obstacle-avoiding rover',owner:'Team Gamma',status:'Completed'}
  ]
};
let data = loadData();
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.students) && Array.isArray(saved.courses) && Array.isArray(saved.projects)) return saved;
  } catch {}
  return structuredClone(initialData);
}
function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return true;
  } catch {
    toast('Browser storage is unavailable. Changes may not persist.');
    return false;
  }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(part => part[0] || '').join('').toUpperCase();
}
function dateLabel() {
  return new Intl.DateTimeFormat('en', {month:'short',day:'numeric',year:'numeric'}).format(new Date());
}
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function goTo(view) {
  const allowed = ['dashboard','students','courses','projects'];
  if (!allowed.includes(view)) return;
  $$('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + view));
  $$('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $('#pageTitle').textContent = ({dashboard:'Overview',students:'Students',courses:'Courses',projects:'Projects'})[view];
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderDashboard() {
  $('#studentMetric').textContent = data.students.length;
  $('#courseMetric').textContent = data.courses.length;
  $('#projectMetric').textContent = data.projects.filter(p => p.status !== 'Completed').length;
  const done = data.projects.length ? Math.round(data.projects.filter(p => p.status === 'Completed').length / data.projects.length * 100) : 0;
  $('#completeMetric').textContent = done + '%';
  $('#dashboardCourses').innerHTML = data.courses.slice(0,3).map(course => '<div class="mini-course"><span class="course-symbol">' + escapeHtml(course.icon) + '</span><div><strong>' + escapeHtml(course.title) + '</strong><small>' + escapeHtml(course.level) + ' · ' + escapeHtml(course.duration) + '</small></div></div>').join('');
  $('#dashboardProjects').innerHTML = data.projects.slice(0,4).map(project => '<div class="activity-item"><span class="activity-dot"></span><div><strong>' + escapeHtml(project.name) + '</strong><small>' + escapeHtml(project.owner) + ' · ' + escapeHtml(project.status) + '</small></div></div>').join('') || '<p class="empty-state">No projects yet. Add one in Project Tracker.</p>';
}
function renderStudents() {
  const query = ($('#studentSearch').value || '').trim().toLowerCase();
  const students = data.students.filter(s => [s.name,s.email,s.track].some(v => v.toLowerCase().includes(query)));
  $('#studentCount').textContent = data.students.length;
  $('#studentRows').innerHTML = students.map(student => '<tr><td><div class="student-cell"><span class="student-avatar">' + escapeHtml(initials(student.name)) + '</span><span><strong>' + escapeHtml(student.name) + '</strong><small>' + escapeHtml(student.email) + '</small></span></div></td><td><span class="track-pill">' + escapeHtml(student.track) + '</span></td><td>' + escapeHtml(student.joined) + '</td><td><button class="delete-button" data-delete-student="' + student.id + '">Remove</button></td></tr>').join('');
  $('#studentEmpty').hidden = students.length !== 0;
}
function renderCourses() {
  $('#courseGrid').innerHTML = data.courses.map(course => '<article class="course-card"><div class="course-card-top"><span class="course-large-icon">' + escapeHtml(course.icon) + '</span><span class="track-pill">' + escapeHtml(course.level) + '</span></div><h3>' + escapeHtml(course.title) + '</h3><p>' + escapeHtml(course.description) + '</p><div class="course-meta"><span>◷ ' + escapeHtml(course.duration) + '</span><span>▣ Practical labs</span></div><button class="primary-button ' + (course.enrolled ? 'enrolled' : '') + '" data-toggle-course="' + escapeHtml(course.id) + '">' + (course.enrolled ? '✓ Enrolled in demo' : 'Enroll in demo course') + '</button></article>').join('');
}
function statusClass(status) {
  return status === 'Completed' ? 'completed' : status === 'In progress' ? 'in-progress' : 'planning';
}
function renderProjects() {
  $('#projectGrid').innerHTML = data.projects.map(project => '<article class="project-card"><div class="project-top"><span class="eyebrow">STUDENT BUILD</span><span class="status-pill ' + statusClass(project.status) + '">' + escapeHtml(project.status) + '</span></div><h3>' + escapeHtml(project.name) + '</h3><p>Team / owner: ' + escapeHtml(project.owner) + '</p><label class="eyebrow" for="status-' + project.id + '">UPDATE STATUS</label><select id="status-' + project.id + '" data-project-status="' + project.id + '"><option' + (project.status === 'Planning' ? ' selected' : '') + '>Planning</option><option' + (project.status === 'In progress' ? ' selected' : '') + '>In progress</option><option' + (project.status === 'Completed' ? ' selected' : '') + '>Completed</option></select></article>').join('') || '<article class="card empty-state">No projects yet. Use the form above to add your first build.</article>';
}
function renderAll() {
  renderDashboard();
  renderStudents();
  renderCourses();
  renderProjects();
}
$$('.nav-link').forEach(button => button.addEventListener('click', () => goTo(button.dataset.view)));
$$('[data-goto]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.goto)));
$('#studentSearch').addEventListener('input', renderStudents);
$('#studentForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  const name = String(fields.get('name') || '').trim();
  const email = String(fields.get('email') || '').trim();
  if (name.length < 2 || !email.includes('@')) {
    toast('Enter a valid student name and email.');
    return;
  }
  if (data.students.some(student => student.email.toLowerCase() === email.toLowerCase())) {
    toast('A student with that email already exists.');
    return;
  }
  data.students.unshift({id:Date.now(),name,email,track:String(fields.get('track')),joined:dateLabel()});
  persist();
  form.reset();
  renderAll();
  toast('Student added to this demo workspace.');
});
$('#studentRows').addEventListener('click', event => {
  const button = event.target.closest('[data-delete-student]');
  if (!button) return;
  const student = data.students.find(item => item.id === Number(button.dataset.deleteStudent));
  if (!student || !window.confirm('Remove ' + student.name + ' from this demo directory?')) return;
  data.students = data.students.filter(item => item.id !== student.id);
  persist();
  renderAll();
  toast('Student removed.');
});
$('#courseGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-toggle-course]');
  if (!button) return;
  const course = data.courses.find(item => item.id === button.dataset.toggleCourse);
  if (!course) return;
  course.enrolled = !course.enrolled;
  persist();
  renderAll();
  toast(course.enrolled ? 'Demo enrollment updated.' : 'Demo enrollment removed.');
});
$('#projectForm').addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const name = String(fields.get('name') || '').trim();
  const owner = String(fields.get('owner') || '').trim();
  if (name.length < 3 || owner.length < 2) {
    toast('Enter a project name and team / owner.');
    return;
  }
  data.projects.unshift({id:Date.now(),name,owner,status:String(fields.get('status'))});
  persist();
  event.currentTarget.reset();
  renderAll();
  toast('Project added to the tracker.');
});
$('#projectGrid').addEventListener('change', event => {
  const select = event.target.closest('[data-project-status]');
  if (!select) return;
  const project = data.projects.find(item => item.id === Number(select.dataset.projectStatus));
  if (!project) return;
  project.status = select.value;
  persist();
  renderAll();
  toast('Project status updated.');
});
renderAll();
// The submitted brief is retained for traceability; demo features are a tailored front-end starter.
console.info('CodeShip template mode. Product brief:', PRODUCT_BRIEF);