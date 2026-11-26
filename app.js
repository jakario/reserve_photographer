// --- Firebase Configuration ---
// ใช้การตั้งค่าเดียวกันกับระบบหลัก โดยแยก Node ข้อมูลเป็น 'photographer_bookings'
const firebaseConfig = {
  apiKey: "AIzaSyAz5Mx6GdnyxxrgT1mRvshVw3jHs8ww7yQ",
  authDomain: "reserve-meeting-room-2a1af.firebaseapp.com",
  databaseURL: "https://reserve-meeting-room-2a1af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "reserve-meeting-room-2a1af",
  storageBucket: "reserve-meeting-room-2a1af.firebasestorage.app",
  messagingSenderId: "487896334123",
  appId: "1:487896334123:web:effef836250854b9c40f6e",
  measurementId: "G-5WR0RSLTZT"
};

// Initialize Firebase
let database;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
    } catch (e) {
        console.log("Firebase error or already initialized:", e);
        if (firebase.apps && firebase.apps.length > 0) {
            database = firebase.database();
        }
    }
} else {
    console.log("Firebase not configured yet. Fallback to LocalStorage.");
}

// 3 Photographers Data
const photographers = [
    { 
        id: 1, 
        name: "ช่างภาพหนึ่ง", 
        nickname: "หนึ่ง",
        title: "ผู้เชี่ยวชาญภาพนิ่ง & พิธีการ (Still & Event)", 
        category: "ภาพนิ่ง (Photo)",
        defaultService: "ภาพนิ่ง (Photo)",
        icon: "photo_camera",
        tag: "เชี่ยวชาญภาพนิ่ง",
        description: "บันทึกภาพบรรยากาศงานประชุม สัมมนา งานพิธีการ ภาพหมู่ และภาพถ่ายบุคคลประชาสัมพันธ์ ด้วยโทนภาพที่คมชัด สวยงาม เป็นธรรมชาติ", 
        equipment: ["Full-frame Mirrorless", "Sony GM 24-70 f/2.8 & 70-200 f/2.8", "Speedlite Flash & Diffuser"], 
        deliverable: "ปรับแต่งโทนแสงสี ส่งมอบไฟล์ความละเอียดสูงทาง Cloud Storage",
        duration: "ส่งมอบงานภายใน 1-3 วันทำการ",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 2, 
        name: "ช่างภาพสอง", 
        nickname: "สอง",
        title: "ผู้เชี่ยวชาญวิดีโอ & คอนเทนต์ (Videographer & Motion)", 
        category: "วิดีโอ (Video)",
        defaultService: "วิดีโอ (Video)",
        icon: "videocam",
        tag: "เชี่ยวชาญวิดีโอ",
        description: "บันทึกวิดีโอตลอดการจัดงาน สัมภาษณ์ผู้บริหาร และจัดทำคลิปไฮไลท์สรุปภาพรวม/Reels สำหรับประชาสัมพันธ์บนโซเชียลมีเดีย", 
        equipment: ["กล้อง Cinema 4K 60fps", "ชุดไมโครโฟนไร้สายคู่ (Wireless Mic)", "Gimbal ไม้กันสั่น 3 แกน"], 
        deliverable: "ไฟล์คลิปวิดีโอตัดต่อพร้อมใส่ซับไตเติล ดนตรีประกอบ และกราฟิก",
        duration: "ส่งมอบงานภายใน 3-5 วันทำการ",
        image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 3, 
        name: "ช่างภาพสาม", 
        nickname: "สาม",
        title: "ผู้เชี่ยวชาญสตูดิโอ & ครบวงจร (Studio & All-Rounder)", 
        category: "ภาพนิ่งและวิดีโอ (Photo & Video)",
        defaultService: "ภาพนิ่งและวิดีโอ (Photo & Video)",
        icon: "video_camera_front",
        tag: "ครบวงจร ภาพ & วิดีโอ",
        description: "บริการบันทึกภาพนิ่งพร้อมถ่ายวิดีโอ งานถ่ายทอดสด (Live Stream) และงานสัมมนาขนาดใหญ่ พร้อมชุดไฟสตูดิโอเคลื่อนที่", 
        equipment: ["กล้องภาพนิ่งและวิดีโอครบชุด", "ชุดไฟส่องสว่างต่อเนื่อง LED", "ไมค์สตูดิโอและระบบสลับสัญญาณ"], 
        deliverable: "ไฟล์ภาพนิ่งทั้งหมดที่ปรับแต่งแล้ว + คลิปวิดีโอไฮไลท์และบันทึกฉบับเต็ม",
        duration: "ส่งมอบงานภายใน 3-5 วันทำการ",
        image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80"
    }
];

// Global Bookings Array & State
let bookings = [];
let searchQuery = "";
let selectedPhotographerFilter = "all";
let currentPage = 1;
const rowsPerPage = 10;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const serviceGrid = document.getElementById('service-grid');
const modalOverlay = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBookingBtn = document.getElementById('cancel-booking');
const bookingForm = document.getElementById('booking-form');
const modalServiceName = document.getElementById('modal-service-name');
const modalServiceDesc = document.getElementById('modal-service-desc');
const toast = document.getElementById('toast');
const scheduleTbody = document.getElementById('schedule-tbody');
const globalSearch = document.getElementById('global-search');

// Views & Navigation
const navBook = document.getElementById('nav-book');
const navSchedule = document.getElementById('nav-schedule');
const viewBooking = document.getElementById('view-booking');
const viewSchedule = document.getElementById('view-schedule');

navBook.addEventListener('click', (e) => {
    e.preventDefault();
    navBook.classList.add('active');
    navSchedule.classList.remove('active');
    viewBooking.style.display = 'block';
    viewSchedule.style.display = 'none';
});

navSchedule.addEventListener('click', (e) => {
    e.preventDefault();
    navSchedule.classList.add('active');
    navBook.classList.remove('active');
    viewBooking.style.display = 'none';
    viewSchedule.style.display = 'block';
    renderSchedule();
});

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const icon = themeToggle.querySelector('.material-symbols-rounded');
    icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') {
    themeToggle.querySelector('.material-symbols-rounded').textContent = 'light_mode';
}
themeToggle.addEventListener('click', toggleTheme);

// Filter by Photographer Chips
function setupPhotographerFilters() {
    const filterContainer = document.getElementById('photographer-filter-bar');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;

        filterContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        selectedPhotographerFilter = chip.dataset.photographer;
        currentPage = 1;
        renderSchedule();
    });
}

// Search Handling
if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        if (searchQuery.length > 0 && viewBooking.style.display !== 'none') {
            navSchedule.click();
        } else {
            renderSchedule();
        }
    });
}

// Helper: Check if a photographer has jobs today
function getPhotographerTodayJobs(photographerName) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return bookings.filter(b => (b.photographer === photographerName || b.photographerName === photographerName) && b.date === todayStr);
}

// Render 3 Photographers Cards
function renderPhotographers() {
    if (!serviceGrid) return;
    serviceGrid.innerHTML = '';

    photographers.forEach(p => {
        const todayJobs = getPhotographerTodayJobs(p.name);
        const isBusyToday = todayJobs.length > 0;
        
        const availabilityBadge = isBusyToday 
            ? `<span class="photographer-avail-badge photographer-avail-busy"><span class="material-symbols-rounded" style="font-size: 14px;">event_busy</span> ติดคิวงานวันนี้ (${todayJobs.length})</span>`
            : `<span class="photographer-avail-badge photographer-avail-free"><span class="material-symbols-rounded" style="font-size: 14px;">check_circle</span> ว่างพร้อมรับงาน</span>`;

        const equipmentHTML = p.equipment.map(item => `
            <span class="amenity">
                <span class="material-symbols-rounded" style="font-size: 14px;">check</span> ${item}
            </span>
        `).join('');

        const cardHTML = `
            <div class="room-card" data-id="${p.id}">
                <div class="room-image" style="position: relative;">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" style="height: 200px; width: 100%; object-fit: cover;">
                    <span class="service-badge">
                        <span class="material-symbols-rounded" style="font-size: 14px;">star</span> ${p.tag}
                    </span>
                    ${availabilityBadge}
                </div>
                <div class="room-content">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                        <span class="badge-service">
                            <span class="material-symbols-rounded" style="font-size: 14px;">${p.icon}</span> ${p.category}
                        </span>
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">
                            ${p.name}
                        </span>
                    </div>
                    <h4 class="room-title" style="font-size: 1.15rem; margin-bottom: 4px;">${p.name}</h4>
                    <p style="font-size: 0.82rem; font-weight: 500; color: var(--text-muted); margin-bottom: 8px;">${p.title}</p>
                    <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">${p.description}</p>
                    
                    <div class="room-amenities" style="margin-bottom: 12px;">
                        ${equipmentHTML}
                    </div>

                    <div class="service-card-meta">
                        <div class="service-card-meta-item">
                            <span class="material-symbols-rounded">local_shipping</span>
                            <span>${p.duration}</span>
                        </div>
                        <div class="service-card-meta-item">
                            <span class="material-symbols-rounded">cloud_done</span>
                            <span>${p.deliverable}</span>
                        </div>
                    </div>

                    <div class="room-footer" style="margin-top: 18px; justify-content: flex-end;">
                        <button class="btn-book" onclick="openBookingModal('${p.name}')" style="display: inline-flex; align-items: center; gap: 6px;">
                            <span class="material-symbols-rounded" style="font-size: 18px;">event_available</span>
                            <span>จอง ${p.name}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        serviceGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Render Schedule Table
function renderSchedule() {
    if (!scheduleTbody) return;
    scheduleTbody.innerHTML = '';
    const paginationControls = document.getElementById('pagination-controls');
    
    // Filter by photographer filter
    let filteredBookings = [...bookings];
    if (selectedPhotographerFilter && selectedPhotographerFilter !== "all") {
        filteredBookings = filteredBookings.filter(b => 
            (b.photographer === selectedPhotographerFilter) || 
            (b.photographerName === selectedPhotographerFilter)
        );
    }

    // Filter by search query if any
    if (searchQuery) {
        filteredBookings = filteredBookings.filter(b => 
            (b.title && b.title.toLowerCase().includes(searchQuery)) ||
            (b.photographer && b.photographer.toLowerCase().includes(searchQuery)) ||
            (b.bookedBy && b.bookedBy.toLowerCase().includes(searchQuery)) ||
            (b.location && b.location.toLowerCase().includes(searchQuery)) ||
            (b.serviceType && b.serviceType.toLowerCase().includes(searchQuery)) ||
            (b.phone && b.phone.toLowerCase().includes(searchQuery))
        );
    }

    if (filteredBookings.length === 0) {
        let emptyMsg = "ยังไม่มีข้อมูลคิวงานช่างภาพในระบบ";
        if (searchQuery) {
            emptyMsg = `ไม่พบคิวงานที่ตรงกับคำค้นหา "${searchQuery}"`;
        } else if (selectedPhotographerFilter !== "all") {
            emptyMsg = `ยังไม่มีคิวงานของ "${selectedPhotographerFilter}"`;
        }

        scheduleTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    <span class="material-symbols-rounded" style="font-size: 32px; display: block; margin-bottom: 8px; opacity: 0.6;">calendar_today</span>
                    ${emptyMsg}
                </td>
            </tr>
        `;
        if (paginationControls) paginationControls.innerHTML = '';
        updateBookingStatus();
        renderCalendar();
        return;
    }

    // Sort bookings by date descending, then start time
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
        return a.startTime.localeCompare(b.startTime);
    });
    
    const totalPages = Math.ceil(sortedBookings.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedBookings = sortedBookings.slice(startIndex, startIndex + rowsPerPage);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    paginatedBookings.forEach(b => {
        // Format Thai Date
        const dateObj = new Date(b.date);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('th-TH', options);

        // Determine status tag
        let statusBadge = '';
        if (b.date === todayStr) {
            statusBadge = `<span class="badge-status badge-today"><span class="material-symbols-rounded" style="font-size: 14px;">lens</span> วันนี้</span>`;
        } else if (b.date > todayStr) {
            statusBadge = `<span class="badge-status badge-upcoming"><span class="material-symbols-rounded" style="font-size: 14px;">schedule</span> กำลังมาถึง</span>`;
        } else {
            statusBadge = `<span class="badge-status badge-past"><span class="material-symbols-rounded" style="font-size: 14px;">check_circle</span> เสร็จสิ้น</span>`;
        }

        const photographerName = b.photographer || b.photographerName || 'ช่างภาพหนึ่ง';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500; white-space: nowrap;">${formattedDate}</td>
            <td style="white-space: nowrap; font-variant-numeric: tabular-nums;">
                <span class="material-symbols-rounded" style="font-size: 15px; vertical-align: text-bottom; color: var(--text-muted);">schedule</span>
                ${b.startTime} - ${b.endTime}
            </td>
            <td>
                <span class="photographer-tag">
                    <span class="material-symbols-rounded" style="font-size: 15px;">person</span>
                    ${photographerName}
                </span>
            </td>
            <td>
                <div style="font-weight: 600; color: var(--text-main);">${b.title}</div>
                ${b.notes ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">หมายเหตุ: ${b.notes}</div>` : ''}
            </td>
            <td>
                <span class="badge-service">
                    ${b.serviceType || 'ภาพนิ่ง (Photo)'}
                </span>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 0.88rem;">
                    <span class="material-symbols-rounded" style="font-size: 16px; color: var(--text-muted);">location_on</span>
                    ${b.location || 'ไม่ระบุสถานที่'}
                </div>
            </td>
            <td>
                <div style="font-weight: 500; color: var(--primary);">${b.bookedBy}</div>
                ${b.phone ? `<div style="font-size: 0.78rem; color: var(--text-muted);"><span class="material-symbols-rounded" style="font-size: 13px; vertical-align: middle;">call</span> ${b.phone}</div>` : ''}
            </td>
            <td>${statusBadge}</td>
        `;
        scheduleTbody.appendChild(tr);
    });

    renderPagination(totalPages);
    updateBookingStatus();
    renderCalendar();
}

function renderPagination(totalPages) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;
    
    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px;">chevron_left</span>';
    prevBtn.style.cssText = `display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-main); color: var(--text-main); cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === 1 ? '0.5' : '1'}; transition: background 0.2s;`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderSchedule(); } };
    paginationControls.appendChild(prevBtn);
    
    // Page Numbers
    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `หน้า ${currentPage} / ${totalPages}`;
    pageIndicator.style.cssText = `font-size: 0.9rem; color: var(--text-muted); margin: 0 10px; font-weight: 500;`;
    paginationControls.appendChild(pageIndicator);
    
    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px;">chevron_right</span>';
    nextBtn.style.cssText = `display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-main); color: var(--text-main); cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; opacity: ${currentPage === totalPages ? '0.5' : '1'}; transition: background 0.2s;`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderSchedule(); } };
    paginationControls.appendChild(nextBtn);
}

function updateBookingStatus() {
    const statusIndicator = document.getElementById('booking-status-indicator');
    if (!statusIndicator) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Calculate how many photographers have jobs today
    const busyTodayPhotographers = new Set();
    bookings.filter(b => b.date === todayStr).forEach(b => {
        busyTodayPhotographers.add(b.photographer || b.photographerName || 'ช่างภาพหนึ่ง');
    });

    const freeCount = photographers.length - busyTodayPhotographers.size;

    if (busyTodayPhotographers.size === 0) {
        statusIndicator.innerHTML = `
            <span class="material-symbols-rounded indicator-icon" style="color: #10B981;">check_circle</span> 
            <span class="indicator-text" style="color: #10B981;">ช่างภาพทุกคนว่างพร้อมรับงานวันนี้ (3 ท่าน)</span>
        `;
        return;
    }

    if (freeCount > 0) {
        const busyNames = Array.from(busyTodayPhotographers).join(', ');
        statusIndicator.innerHTML = `
            <span class="material-symbols-rounded indicator-icon" style="color: #F59E0B;">info</span> 
            <span class="indicator-text" style="color: #D97706;">วันนี้มีคิวงาน: ${busyNames} (ยังว่างอีก ${freeCount} ท่าน)</span>
        `;
    } else {
        statusIndicator.innerHTML = `
            <span class="material-symbols-rounded indicator-icon" style="color: #EF4444;">event_busy</span> 
            <span class="indicator-text" style="color: #EF4444;">วันนี้ช่างภาพทุกคนติดคิวงานเต็มทุกท่าน</span>
        `;
    }
}

// Real-time Database Listener
function setupDatabaseListener() {
    if (database) {
        database.ref('photographer_bookings').on('value', (snapshot) => {
            const data = snapshot.val();
            bookings = [];
            if (data) {
                for (let key in data) {
                    bookings.push({ ...data[key], key });
                }
            }
            renderPhotographers();
            renderSchedule();
        }, (error) => {
            console.error("Firebase read error, falling back to LocalStorage:", error);
            loadLocalStorageFallback();
        });
    } else {
        loadLocalStorageFallback();
    }
}

function loadLocalStorageFallback() {
    const savedBookings = localStorage.getItem('photographer_bookings_data');
    if (savedBookings) {
        try {
            bookings = JSON.parse(savedBookings);
        } catch (e) {
            bookings = [];
        }
    }
    renderPhotographers();
    renderSchedule();
}

// Modal Management
window.openBookingModal = function(photographerOrService) {
    let selectedPhotographer = "ช่างภาพหนึ่ง";

    if (typeof photographerOrService === 'string' && photographerOrService.includes('ช่างภาพ')) {
        selectedPhotographer = photographerOrService;
    } else if (typeof photographerOrService === 'number') {
        const p = photographers.find(item => item.id === photographerOrService);
        if (p) selectedPhotographer = p.name;
    }

    const p = photographers.find(item => item.name === selectedPhotographer) || photographers[0];

    modalServiceName.textContent = `จองคิว: ${p.name}`;
    modalServiceDesc.textContent = `${p.title} | ${p.description}`;

    const photographerSelect = document.getElementById('booking-photographer');
    if (photographerSelect) {
        photographerSelect.value = p.name;
    }

    const serviceTypeSelect = document.getElementById('booking-service-type');
    if (serviceTypeSelect) {
        serviceTypeSelect.value = p.defaultService;
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-date').value = today;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// When user switches photographer in modal dropdown, update service defaults
const modalPhotographerSelect = document.getElementById('booking-photographer');
if (modalPhotographerSelect) {
    modalPhotographerSelect.addEventListener('change', (e) => {
        const p = photographers.find(item => item.name === e.target.value);
        if (p) {
            modalServiceName.textContent = `จองคิว: ${p.name}`;
            modalServiceDesc.textContent = `${p.title} | ${p.description}`;
            const serviceTypeSelect = document.getElementById('booking-service-type');
            if (serviceTypeSelect) {
                serviceTypeSelect.value = p.defaultService;
            }
        }
    });
}

function closeBookingModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    bookingForm.reset();
}

closeModalBtn.addEventListener('click', closeBookingModal);
cancelBookingBtn.addEventListener('click', closeBookingModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeBookingModal();
});

// Toast Notification
function showToast(message, isError = false) {
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#EF4444';
        toastIcon.textContent = 'error';
        toastIcon.style.color = '#EF4444';
    } else {
        toast.style.borderLeftColor = '#10B981';
        toastIcon.textContent = 'check_circle';
        toastIcon.style.color = '#10B981';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}

// Handle Form Submission with Overlap Check per Photographer
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const photographer = document.getElementById('booking-photographer').value;
    const serviceType = document.getElementById('booking-service-type').value;
    const title = document.getElementById('booking-title').value.trim();
    const bookedBy = document.getElementById('booking-by').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const date = document.getElementById('booking-date').value;
    const location = document.getElementById('booking-location').value.trim();
    const startTime = document.getElementById('booking-time-start').value;
    const endTime = document.getElementById('booking-time-end').value;
    const purpose = document.getElementById('booking-purpose').value;
    const notes = document.getElementById('booking-notes').value.trim();
    
    if (!startTime || !endTime) {
        showToast('กรุณาระบุเวลาเริ่มและเวลาสิ้นสุดงาน', true);
        return;
    }
    
    if (startTime >= endTime) {
        showToast('เวลาสิ้นสุดงานต้องมากกว่าเวลาเริ่มต้น', true);
        return;
    }
    
    // Overlap condition: check if THIS specific photographer is already booked during this time interval
    const overlappingJob = bookings.find(b => {
        const bPhotographer = b.photographer || b.photographerName || 'ช่างภาพหนึ่ง';
        if (bPhotographer !== photographer) return false; // Allowed if different photographer!
        if (b.date !== date) return false;
        return (startTime < b.endTime) && (endTime > b.startTime);
    });

    if (overlappingJob) {
        showToast(`ไม่สามารถจองได้ เนื่องจาก "${photographer}" มีคิวงาน "${overlappingJob.title}" เวลา ${overlappingJob.startTime} - ${overlappingJob.endTime} น. แล้ว`, true);
        return;
    }
    
    const submitBtn = document.getElementById('btn-submit-booking') || bookingForm.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle;">sync</span> กำลังบันทึกข้อมูล...';
    submitBtn.disabled = true;
    
    const newBooking = {
        id: Date.now(),
        photographer,
        title,
        serviceType,
        bookedBy,
        phone,
        date,
        location,
        startTime,
        endTime,
        purpose,
        notes,
        createdAt: new Date().toISOString()
    };

    if (database) {
        // Push to Firebase node 'photographer_bookings'
        database.ref('photographer_bookings').push(newBooking)
            .then(() => {
                closeBookingModal();
                showToast(`จองคิว "${photographer}" สำเร็จแล้ว! ข้อมูลถูกบันทึกขึ้นระบบส่วนกลาง`);
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            })
            .catch((error) => {
                console.error("Firebase push error:", error);
                saveToLocalStorage(newBooking);
                closeBookingModal();
                showToast(`บันทึกคิว "${photographer}" สำเร็จ (ออฟไลน์โหมด)`);
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            });
    } else {
        saveToLocalStorage(newBooking);
        closeBookingModal();
        showToast(`จองคิว "${photographer}" สำเร็จ (บันทึกลง LocalStorage)`);
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
});

function saveToLocalStorage(booking) {
    bookings.push(booking);
    localStorage.setItem('photographer_bookings_data', JSON.stringify(bookings));
    renderPhotographers();
    renderSchedule();
}

// Calendar State
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

window.changeCalendarMonth = function(offset) {
    currentCalendarMonth += offset;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    } else if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    renderCalendar();
};

// Render Calendar
function renderCalendar() {
    const calendarEl = document.getElementById('sidebar-calendar');
    if (!calendarEl) return;
    
    const year = currentCalendarYear;
    const month = currentCalendarMonth;
    
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = `
        <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center;">
            <button type="button" onclick="changeCalendarMonth(-1)" style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; padding: 4px; border-radius: 4px;" aria-label="Previous month"><span class="material-symbols-rounded" style="font-size: 20px;">chevron_left</span></button>
            <span style="font-weight: 600;">${monthNames[month]} ${year + 543}</span>
            <button type="button" onclick="changeCalendarMonth(1)" style="background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; padding: 4px; border-radius: 4px;" aria-label="Next month"><span class="material-symbols-rounded" style="font-size: 20px;">chevron_right</span></button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-name">อา</div>
            <div class="calendar-day-name">จ</div>
            <div class="calendar-day-name">อ</div>
            <div class="calendar-day-name">พ</div>
            <div class="calendar-day-name">พฤ</div>
            <div class="calendar-day-name">ศ</div>
            <div class="calendar-day-name">ส</div>
    `;
    
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    const now = new Date();
    const isCurrentMonthYear = (year === now.getFullYear() && month === now.getMonth());
    const todayDate = now.getDate();
    
    // Map date to count of bookings
    const bookedDates = new Set(bookings.map(b => b.date));
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = (isCurrentMonthYear && i === todayDate);
        const isBooked = bookedDates.has(dateStr);
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isBooked) classes += ' booked';
        
        html += `<div class="${classes}" title="${isBooked ? 'มีคิวงานช่างภาพ' : ''}">${i}</div>`;
    }
    
    html += `</div>`;
    calendarEl.innerHTML = html;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    setupPhotographerFilters();
    renderPhotographers();
    setupDatabaseListener();
});
