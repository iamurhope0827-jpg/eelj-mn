(() => {
  'use strict';

  const KEY = 'eelj.prototype.v1';
  const categories = { event: 'Эвент, арга хэмжээ', retail: 'Дэлгүүр, худалдаа', office: 'Оффис, үйлчилгээ', cafe: 'Кафе, ресторан', warehouse: 'Агуулах, хүргэлт' };
  const districts = ['Сүхбаатар', 'Чингэлтэй', 'Хан-Уул', 'Баянгол', 'Баянзүрх', 'Сонгинохайрхан'];
  const statusNames = { received: 'Хүлээн авсан', reviewing: 'Шалгаж байна', accepted: 'Сонгосон', declined: 'Татгалзсан', withdrawn: 'Цуцалсан' };
  const weekdays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  const $ = (selector) => document.querySelector(selector);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const money = (value) => new Intl.NumberFormat('en-US').format(value) + '₮';
  const dateObject = (value) => new Date(value + 'T12:00:00+08:00');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const dayName = (value) => weekdays[new Date(value + 'T12:00:00Z').getUTCDay()] + ' гараг';
  const shortDate = (value) => `${Number(value.slice(5, 7))}/${Number(value.slice(8, 10))}`;
  const fullDate = (value) => `${value.slice(0, 4)}.${value.slice(5, 7)}.${value.slice(8, 10)}`;
  const dateLabel = (value) => `${fullDate(value)} · ${dayName(value)}`;
  const toMinutes = (value) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
  const hours = (job) => Math.round((toMinutes(job.end) - toMinutes(job.start)) / 60 * 100) / 100;
  const jobById = (id) => state.jobs.find((job) => job.id === id);
  const applicationFor = (id) => state.applications.find((app) => app.jobId === id && app.status !== 'withdrawn');
  const acceptedCount = (id) => state.applications.filter((app) => app.jobId === id && app.status === 'accepted').length;
  const placesLeft = (job) => Math.max(0, job.openings - acceptedCount(job.id));
  const availability = (job) => job.status === 'paused' ? 'paused' : job.date < today() ? 'expired' : placesLeft(job) === 0 ? 'full' : 'active';
  const ui = { category: '', district: '', sort: 'newest', savedOnly: false, limit: 3, employerTab: 'jobs', applicantJob: '', view: 'jobs', panelJob: null };
  let storageMessage = '';
  let toastTimer;
  let state;

  function nextDay(weekday) {
    const base = new Date(today() + 'T12:00:00Z');
    const delta = (weekday - base.getUTCDay() + 7) % 7 || 7;
    base.setUTCDate(base.getUTCDate() + delta);
    return base.toISOString().slice(0, 10);
  }

  const meals = { lunch: ['Өдрийн хоол', 'Өдрийн хоол олгоно', 'Ажил олгогч ээлжийн үеэр өдрийн хоол өгнө.'], allowance: ['Хоолны мөнгө', 'Хоолны мөнгө олгоно', 'Хоол оронд нь мөнгөөр олгоно.'], none: ['Хоол байхгүй', 'Хоол олгохгүй', 'Хоолоо өөрөө бэлдэх эсвэл авч ирээрэй.'] };
  const mealOf = (job) => Object.hasOwn(meals, job.meal) ? job.meal : job.lunch === true ? 'lunch' : job.lunch === false ? 'none' : '';
  function seedJobs() {
    const data = [
      ['event-help', 'Эвентийн бүртгэлийн туслах', 'Иргэдийн бүртгэл, чиглүүлэх, мэдээлэл өгөх зэрэг ажилд дэмжлэг үзүүлэх.', 'Сүхбаатар', 'event', 6, '10:00', '15:00', 15000, 3, 'Хотын эвент', 'Сүхбаатарын талбайн зүүн талд · Жишээ байршил', 'Оролцогчдыг бүртгэх, мэдээлэл өгөх, арга хэмжээний зохион байгуулагчдад тусална.', 'Цаг баримталдаг байх\nХүмүүстэй эелдэг харилцдаг байх\nТуршлага шаардахгүй'],
      ['shop-help', 'Дэлгүүрийн туслах', 'Бараа бүтээгдэхүүн өрөх, худалдан авагчдад туслах, дэлгүүрийн үйл ажиллагаанд дэмжлэг үзүүлэх.', 'Чингэлтэй', 'retail', 5, '11:00', '17:00', 13000, 2, 'Өдөр дэлгүүр', 'Тэнгис кино театрын ойролцоо · Жишээ байршил', 'Тавиурт бараа өрөх, үнийн шошго шалгах, худалдан авагчдад мэдээлэл өгнө.', 'Хариуцлагатай, нямбай байх\n6 цагийн ээлжээр ажиллах боломжтой байх\nТуршлага шаардахгүй'],
      ['office-help', 'Оффисын туслах', 'Баримт бичиг боловсруулах, мэдээлэл цэгцлэх, өдөр тутмын оффисын ажилд туслах.', 'Хан-Уул', 'office', 1, '10:00', '14:00', 14000, 1, 'Товч оффис', '19-р хороолол · Жишээ байршил', 'Баримт бичиг ангилах, хүснэгтэд мэдээлэл оруулах, оффисын өдөр тутмын ажилд тусална.', 'Компьютерын анхан шатны мэдлэгтэй байх\nНямбай ажилладаг байх\nОюутан байж болно'],
      ['cafe-help', 'Кафены үйлчилгээний туслах', 'Захиалга хүргэх, ширээ цэгцлэх, багийнхандаа туслах оройн ээлж.', 'Баянгол', 'cafe', 3, '17:00', '21:00', 14000, 2, 'Завсар кафе', '3, 4-р хороолол · Жишээ байршил', 'Зочдыг угтах, бэлэн болсон захиалга хүргэх, ширээ цэгцэлнэ. Ээлжийн эхэнд ажлын зааварчилгаа өгнө.', 'Эелдэг харилцаатай байх\nБагаар ажиллах сонирхолтой байх\nТуршлага шаардахгүй'],
      ['warehouse-help', 'Захиалга бэлтгэгч', 'Онлайн захиалгын барааг ялгаж, савлагаанд бэлтгэх өдрийн ээлж.', 'Баянзүрх', 'warehouse', 4, '09:00', '13:00', 16000, 3, 'Багц агуулах', 'Натур худалдааны төвийн ойролцоо · Жишээ байршил', 'Захиалгын жагсаалтын дагуу бараа ялгах, тоо ширхэг шалгах, хайрцаглан бэлтгэнэ.', 'Нямбай, хариуцлагатай байх\nЗогсоо ажиллах боломжтой байх\nХүнд зүйл өргөх шаардлагагүй'],
      ['bookshop-help', 'Номын дэлгүүрийн туслах', 'Ном ангилах, тавиур цэгцлэх, уншигчдад ном олоход туслах.', 'Сүхбаатар', 'retail', 0, '12:00', '17:00', 12500, 1, 'Хуудас номын дэлгүүр', 'Их сургуулийн гудамж · Жишээ байршил', 'Номыг төрлөөр нь ангилах, тавиур цэгцлэх, үйлчлүүлэгчдэд мэдээлэл өгнө.', 'Ном сонирхдог байх\nХүмүүстэй харилцах дуртай байх\nТуршлага шаардахгүй'],
      ['kitchen-help', 'Гал тогооны бэлтгэгч', 'Хүнс бэлтгэх, ажлын талбай цэгцлэх өглөөний богино ээлж.', 'Хан-Уул', 'cafe', 2, '08:00', '12:00', 15000, 2, 'Өглөө гал тогоо', 'Яармаг · Жишээ байршил', 'Багийн ахлагчийн заавраар хүнс ангилах, савлагаа бэлтгэх, ажлын орчноо цэгцэлнэ.', 'Эрүүл ахуйн заавар мөрдөх\nЦаг баримтлах\nАжлын зааварчилгаанд хамрагдах'],
      ['survey-help', 'Судалгааны мэдээлэл оруулагч', 'Бэлэн асуулгын хариултыг хүснэгтэд оруулж, мэдээлэл шалгах.', 'Сонгинохайрхан', 'office', 6, '13:00', '17:00', 14000, 2, 'Тэмдэг судалгааны баг', '1-р хороолол · Жишээ байршил', 'Цаасан асуулгын хариултыг хүснэгтэд оруулах, давхардал болон дутуу мэдээлэл шалгана.', 'Монгол хэлээр шивдэг байх\nХүснэгттэй ажиллах анхан шатны мэдлэгтэй байх\nНямбай байх']
    ];
    return data.map((item, index) => {
      const [id, title, description, district, category, weekday, start, end, pay, openings, company, address, duties, requirements] = item;
      return { id, title, description, district, category, date: nextDay(weekday), start, end, pay, openings, company, address, duties, requirements, meal: ['event-help', 'warehouse-help', 'kitchen-help'].includes(id) ? 'lunch' : ['shop-help', 'office-help'].includes(id) ? 'allowance' : 'none', ...({ 'shop-help': { mealAllowance: 8000 }, 'office-help': { mealAllowance: 10000 } })[id], status: 'active', createdAt: Date.now() - index * 60000 };
    });
  }

  function freshState() { return { version: 1, jobs: seedJobs(), applications: [], saved: [], profile: { name: '', contact: '' }, role: 'student' }; }
  const string = (value, max = 2000) => typeof value === 'string' && value.length <= max;
  const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(dateObject(value).getTime()) && dateObject(value).toISOString().slice(0, 10) === value;
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  function validJob(job) {
    return job && string(job.id, 100) && string(job.title, 80) && job.title.trim().length >= 3 && string(job.description, 1200) && string(job.company, 80) && string(job.address, 160) && string(job.duties, 1500) && string(job.requirements, 1000) && districts.includes(job.district) && Object.hasOwn(categories, job.category) && validDate(job.date) && validTime(job.start) && validTime(job.end) && toMinutes(job.end) > toMinutes(job.start) && Number.isInteger(job.pay) && job.pay >= 1000 && job.pay <= 1000000 && Number.isInteger(job.openings) && job.openings > 0 && job.openings <= 100 && ['active', 'paused'].includes(job.status) && (job.lunch === undefined || typeof job.lunch === 'boolean') && (job.meal === undefined || Object.hasOwn(meals, job.meal)) && (job.mealAllowance === undefined || (job.meal === 'allowance' && Number.isInteger(job.mealAllowance) && job.mealAllowance >= 500 && job.mealAllowance <= 200000)) && Number.isFinite(job.createdAt);
  }
  function validState(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.jobs) || value.jobs.length > 500 || !value.jobs.every(validJob) || new Set(value.jobs.map((j) => j.id)).size !== value.jobs.length || !Array.isArray(value.applications) || value.applications.length > 2000 || !Array.isArray(value.saved)) return false;
    return value.applications.every((app) => app && string(app.id, 100) && value.jobs.some((job) => job.id === app.jobId) && string(app.name, 80) && string(app.contact, 100) && string(app.note, 600) && Object.hasOwn(statusNames, app.status) && Number.isFinite(app.createdAt) && validJob(app.snapshot)) && value.saved.every((id) => string(id, 100)) && value.profile && string(value.profile.name, 80) && string(value.profile.contact, 100) && ['student', 'employer'].includes(value.role);
  }
  function loadState() {
    try { const raw = localStorage.getItem(KEY); if (!raw) return freshState(); const parsed = JSON.parse(raw); if (validState(parsed)) return parsed; storageMessage = 'Хадгалсан өгөгдлийг уншиж чадсангүй. Жишээ мэдээллийг шинээр ачааллаа.'; }
    catch { storageMessage = 'Энэ хөтөч мэдээлэл хадгалах боломжгүй байна. Өөрчлөлтүүд хуудас нээлттэй байх хугацаанд ажиллана.'; }
    return freshState();
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageMessage = ''; }
    catch { storageMessage = 'Өөрчлөлтийг хадгалж чадсангүй. Хуудас нээлттэй байх хугацаанд үргэлжлүүлэн туршиж болно.'; }
    showStorageMessage();
  }
  function showStorageMessage() { $('#storage-warning').hidden = !storageMessage; if (storageMessage) $('#storage-warning').textContent = storageMessage; }
  function toast(message) { clearTimeout(toastTimer); const element = $('#toast'); ($('#panel').open ? $('#panel') : document.body).appendChild(element); element.textContent = message; element.hidden = false; toastTimer = setTimeout(() => { element.hidden = true; }, 4500); }
  function badge(status) { return `<span class="badge badge-${escape(status)}">${escape(statusNames[status] || ({ active: 'Нээлттэй', paused: 'Түр зогсоосон', full: 'Орон тоо дүүрсэн', expired: 'Өдөр өнгөрсөн' })[status])}</span>`; }
  function empty(title, description, button, action, symbol = 'search') { return `<div class="empty-state"><div class="empty-icon">${icon(symbol)}</div><h3>${title}</h3><p>${description}</p><button class="button button-dark" data-action="${action}">${button}${icon('arrow')}</button></div>`; }

  function matchingJobs() {
    const result = state.jobs.filter((job) => (ui.savedOnly ? state.saved.includes(job.id) : availability(job) === 'active') && (!ui.category || job.category === ui.category) && (!ui.district || job.district === ui.district));
    return result.sort((a, b) => ui.sort === 'pay' ? b.pay - a.pay || b.createdAt - a.createdAt : ui.sort === 'date' ? a.date.localeCompare(b.date) || a.start.localeCompare(b.start) : ui.sort === 'short' ? hours(a) - hours(b) || b.createdAt - a.createdAt : b.createdAt - a.createdAt);
  }
  function jobRow(job) {
    const available = availability(job) === 'active';
    return `<article class="job-row" data-job="${escape(job.id)}">
      <div class="job-description"><button class="job-title" data-action="detail" data-id="${escape(job.id)}" aria-haspopup="dialog">${escape(job.title)}</button><span class="job-company" style="margin-top:6px;margin-bottom:0">${escape(job.company)}</span><span class="job-note">Жишээ байгууллага${!available ? ' · ' + ({ paused: 'Түр зогсоосон', full: 'Орон тоо дүүрсэн', expired: 'Өдөр өнгөрсөн' })[availability(job)] : ''}</span></div>
      <div class="job-meta">${icon('pin')}<div><span class="meta-label">Дүүрэг</span><strong>${escape(job.district)}</strong></div></div>
      <div class="job-meta">${icon('calendar')}<div><span class="meta-label">${shortDate(job.date)} · Ажлын өдөр</span><strong>${dayName(job.date)}</strong><span class="meta-extra">${job.start} – ${job.end}</span></div></div>
      <div class="job-meta pay-meta">${icon('pay')}<div><span class="meta-label">Цалин</span><strong>${money(job.pay)} <small>/ цаг</small></strong></div></div>
      <div class="job-actions"><button class="button button-dark" data-action="detail" data-id="${escape(job.id)}" aria-haspopup="dialog">Дэлгэрэнгүй${icon('arrow')}</button>${saveButton(job.id)}</div>
    </article>`;
  }
  function saveButton(id, large = false) {
    const saved = state.saved.includes(id);
    return `<button class="${large ? 'icon-button' : 'save-button'}" data-action="save" data-id="${escape(id)}" aria-pressed="${saved}" aria-label="${saved ? 'Хадгалснаас хасах' : 'Ажлыг хадгалах'}">${icon('bookmark')}${large ? '' : `<span>${saved ? 'Хадгалсан' : 'Хадгалах'}</span>`}</button>`;
  }
  function renderBrowse() {
    const jobs = matchingJobs();
    $('#jobs-title').textContent = ui.savedOnly ? 'Хадгалсан ажлууд' : 'Ажлын зарууд';
    $('#job-count').textContent = jobs.length + ' зар';
    $('#saved-count').textContent = state.saved.filter((id) => jobById(id)).length;
    $('#saved-toggle').setAttribute('aria-pressed', String(ui.savedOnly));
    $('#category').value = ui.category;
    $('#district').value = ui.district;
    $('#sort').value = ui.sort;
    $('#active-filters').hidden = !ui.category && !ui.district;
    $('#active-filters').innerHTML = `${ui.category ? `<span class="filter-chip">${escape(categories[ui.category])}</span>` : ''}${ui.district ? `<span class="filter-chip">${escape(ui.district)}</span>` : ''}<button class="text-button" data-action="clear-filters">Шүүлт арилгах</button>`;
    $('#job-list').innerHTML = jobs.length ? jobs.slice(0, ui.limit).map(jobRow).join('') : empty(ui.savedOnly ? 'Хадгалсан ажил алга' : 'Энэ шүүлтээр зар олдсонгүй', ui.savedOnly ? 'Сонирхсон ажлынхаа “Хадгалах” товчийг дараарай. Шүүлт сонгосон бол арилгаж үзээрэй.' : 'Ажлын төрөл эсвэл дүүргээ өөрчилж үзээрэй. Бүх зар нь туршилтын жишээ мэдээлэл.', ui.savedOnly ? 'Бүх зарыг харах' : 'Шүүлт арилгах', 'reset-filters', 'bookmark');
    $('#load-more-wrap').hidden = !jobs.length;
    $('#load-more').hidden = ui.limit >= jobs.length;
    $('#visible-count').textContent = `${jobs.length} жишээ зараас ${Math.min(ui.limit, jobs.length)}-ыг харуулж байна`;
    $('#application-count').textContent = state.applications.filter((app) => app.status !== 'withdrawn').length;
    $('#application-count').hidden = !Number($('#application-count').textContent);
    $('#account-label').textContent = state.role === 'employer' ? 'Ажил олгогч' : 'Нэвтрэх';
    $('#greeting-name').textContent = state.profile.name ? ' ' + state.profile.name : '';
    $('#greeting-name').hidden = !state.profile.name;
  }

  function renderApplications() {
    const apps = [...state.applications].sort((a, b) => b.createdAt - a.createdAt);
    const pending = apps.filter((app) => ['received', 'reviewing'].includes(app.status)).length;
    const accepted = apps.filter((app) => app.status === 'accepted').length;
    $('#applications-summary').innerHTML = [['Нийт хүсэлт', apps.length], ['Хариу хүлээж буй', pending], ['Сонгосон', accepted]].map(([label, count]) => `<div class="summary-item"><strong>${count}</strong><span>${label}</span></div>`).join('');
    $('#applications-list').innerHTML = apps.length ? apps.map((app) => {
      const job = app.snapshot;
      return `<article class="application-row"><div><h3>${escape(job.title)}</h3>${badge(app.status)}<p class="muted">${escape(job.company)} · Жишээ байгууллага</p></div><div><p>${dateLabel(job.date)}<br>${job.start} – ${job.end} · ${escape(job.district)}</p><p class="muted">${money(job.pay)} / цаг · ${new Date(app.createdAt).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}-нд хүсэлт илгээсэн</p></div><div class="application-actions"><button class="button button-outline" data-action="application-detail" data-id="${escape(app.id)}">Дэлгэрэнгүй${icon('arrow')}</button>${['received', 'reviewing', 'accepted'].includes(app.status) ? `<button class="text-button" data-action="withdraw" data-id="${escape(app.id)}">Цуцлах</button>` : ''}</div></article>`;
    }).join('') : empty('Эхний ээлжээ олоорой', 'Сонирхсон ажилдаа туршилтын хүсэлт илгээхэд явц нь энд харагдана.', 'Ажил хайх', 'browse', 'calendar');
  }

  function renderEmployer() {
    $('#employer-job-count').textContent = state.jobs.length;
    $('#employer-application-count').textContent = state.applications.filter((app) => app.status !== 'withdrawn').length;
    for (const tab of ['jobs', 'applications']) { const selected = ui.employerTab === tab; $(`#employer-${tab}-tab`).setAttribute('aria-selected', String(selected)); $(`#employer-${tab}-tab`).tabIndex = selected ? 0 : -1; }
    $('#employer-panel').setAttribute('aria-labelledby', `employer-${ui.employerTab}-tab`);
    if (ui.employerTab === 'jobs') {
      $('#employer-panel').innerHTML = [...state.jobs].sort((a, b) => b.createdAt - a.createdAt).map((job) => {
        const count = state.applications.filter((app) => app.jobId === job.id && app.status !== 'withdrawn').length;
        return `<article class="employer-job"><div>${badge(availability(job))}<h3>${escape(job.title)}</h3><p class="small muted">${escape(job.company)} · ${escape(job.district)}</p></div><div><p>${fullDate(job.date)} · ${job.start} – ${job.end}</p><p class="small muted">${money(job.pay)} / цаг · ${acceptedCount(job.id)}/${job.openings} орон тоо сонгосон</p></div><div class="management-actions"><button class="button button-soft" data-action="job-applicants" data-id="${escape(job.id)}">${count} хүсэлт</button><button class="button button-outline" data-action="edit-job" data-id="${escape(job.id)}">${icon('edit')}Засах</button><button class="button button-outline" data-action="pause-job" data-id="${escape(job.id)}">${icon(job.status === 'paused' ? 'arrow' : 'pause')}${job.status === 'paused' ? 'Нээх' : 'Зогсоох'}</button></div></article>`;
      }).join('');
    } else {
      const apps = [...state.applications].filter((app) => !ui.applicantJob || app.jobId === ui.applicantJob).sort((a, b) => b.createdAt - a.createdAt);
      $('#employer-panel').innerHTML = `<label class="applicant-filter">Зараар шүүх<select id="applicant-job-filter"><option value="">Бүх зар</option>${state.jobs.map((job) => `<option value="${escape(job.id)}" ${ui.applicantJob === job.id ? 'selected' : ''}>${escape(job.title)}</option>`).join('')}</select></label>` + (apps.length ? apps.map((app) => `<article class="applicant-row"><div><h3>${escape(app.name)}</h3><p class="applicant-contact">${escape(app.contact)}</p><p class="small muted">${new Date(app.createdAt).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })} · Туршилтын хүсэлт</p></div><div><strong>${escape(app.snapshot.title)}</strong><p class="small muted">${fullDate(app.snapshot.date)} · ${app.snapshot.start} – ${app.snapshot.end}</p><p class="applicant-note">${escape(app.note || 'Нэмэлт танилцуулга бичээгүй.')}</p></div><label class="status-control">Хүсэлтийн төлөв<select data-application="${escape(app.id)}" ${app.status === 'withdrawn' ? 'disabled' : ''}>${Object.entries(statusNames).filter(([key]) => key !== 'withdrawn' || app.status === 'withdrawn').map(([key, label]) => `<option value="${key}" ${app.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select><span>Оюутны хэсэгт мөн харагдана.</span></label></article>`).join('') : empty('Хүсэлт хараахан ирээгүй', 'Оюутны самбараас жишээ ажилд хүсэлт илгээгээд энд буцаж ирээрэй.', 'Оюутны самбар руу', 'student', 'user'));
    }
  }

  function renderAll() { renderBrowse(); renderApplications(); renderEmployer(); showStorageMessage(); }
  function navigate(view) { closePanel(); if (location.hash === '#' + view) route(); else location.hash = view; }
  function route() {
    const hash = location.hash.slice(1);
    const view = hash === 'applications' ? 'applications' : hash === 'employer' ? 'employer' : 'jobs';
    ui.view = view;
    $('#browse-view').hidden = view !== 'jobs';
    $('#applications-view').hidden = view !== 'applications';
    $('#employer-view').hidden = view !== 'employer';
    document.querySelectorAll('[data-nav]').forEach((link) => { if (link.dataset.nav === view) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    document.title = `${view === 'applications' ? 'Миний хүсэлтүүд' : view === 'employer' ? 'Ажил олгогчийн самбар' : 'Оюутны хуваарьт таарах ажлууд'} — Ээлж`;
    if (hash === 'guide' || hash === 'faq') requestAnimationFrame(() => document.getElementById(hash).scrollIntoView());
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function showPanel(content, focus) {
    $('#toast').hidden = true;
    $('#panel').classList.remove('job-detail-dialog');
    $('#panel-content').innerHTML = content;
    if (!$('#panel').open) $('#panel').showModal();
    $('#panel').scrollTop = 0;
    if (focus) requestAnimationFrame(() => $(focus)?.focus({ preventScroll: true }));
  }
  function closePanel() { if ($('#panel').open) $('#panel').close(); document.body.appendChild($('#toast')); ui.panelJob = null; }
  function openAccount() {
    ui.panelJob = null;
    showPanel(`<h2 class="panel-heading" id="panel-title">Өөрийн горимоо сонго</h2><p class="panel-subtitle">Бүртгэл үүсгэхгүйгээр хоёр талын үйл явцыг туршаарай.</p><div class="role-options"><button class="role-option" data-action="student"><span class="role-icon">${icon('user')}</span><div><strong>Оюутан</strong><p>Ажил хайх, хадгалах, хүсэлт илгээх.</p></div>${icon('arrow')}</button><button class="role-option" data-action="employer"><span class="role-icon">${icon('pay')}</span><div><strong>Ажил олгогч</strong><p>Зар нэмэх, хүсэлтүүдийг удирдах.</p></div>${icon('arrow')}</button></div><p class="local-note">Хоёр горим энэ хөтөч дээрх ижил өгөгдлийг ашиглана. Бодит бүртгэл, байгууллага руу мэдээлэл илгээх үйлдэл байхгүй.</p>`);
  }
  function openJob(id) {
    const job = jobById(id); if (!job) return toast('Энэ зар олдсонгүй.');
    ui.panelJob = id;
    const app = applicationFor(id);
    const available = availability(job) === 'active';
    showPanel(`<div class="detail-company">${escape(job.company)} <span class="badge">Жишээ байгууллага</span></div><h2 id="panel-title" class="panel-heading">${escape(job.title)}</h2><p class="panel-subtitle">${escape(categories[job.category])} · ${placesLeft(job)} сул орон тоо</p><div class="detail-pay"><div><span>Цагийн хөлс</span><strong>${money(job.pay)} <small>/ цаг</small></strong></div><div class="total-pay">${hours(job)} цагийн ээлж<strong>${money(Math.round(job.pay * hours(job)))}</strong></div></div>${mealOf(job) ? `<p class="detail-perk detail-perk-${mealOf(job)}">${icon('meal')}<span><strong>${meals[mealOf(job)][1]}${mealOf(job) === 'allowance' && job.mealAllowance ? ` · <b class="perk-amount">${money(job.mealAllowance)}</b>` : ''}</strong>${mealOf(job) === 'allowance' && job.mealAllowance ? `Ээлж бүрт ${money(job.mealAllowance)} хоолны мөнгө олгоно.` : meals[mealOf(job)][2]}</span></p>` : ''}<div class="detail-grid"><div>${icon('calendar')}<div><span>Ажлын өдөр</span><strong>${dateLabel(job.date)}</strong></div></div><div>${icon('clock')}<div><span>Ажлын цаг</span><strong>${job.start} – ${job.end}</strong><p>${hours(job)} цагийн ээлж</p></div></div><div>${icon('pin')}<div><span>Байршил</span><strong>${escape(job.district)}</strong><p>${escape(job.address)}</p></div></div><div>${icon('user')}<div><span>Орон тоо</span><strong>${placesLeft(job)} / ${job.openings} сул</strong><p>Жишээ зар</p></div></div></div><div class="detail-block"><h3>Ажлын тухай</h3><p>${escape(job.description)}</p></div><div class="detail-block"><h3>Хийх ажил</h3><p>${escape(job.duties)}</p></div><div class="detail-block"><h3>Тавигдах шаардлага</h3><ul>${job.requirements.split('\n').filter(Boolean).map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div><div class="detail-actions"><button class="button button-dark" data-action="${app ? 'my-applications' : 'apply'}" data-id="${escape(id)}" ${!app && !available ? 'disabled' : ''}>${app ? 'Илгээсэн хүсэлтээ харах' : available ? 'Өргөдөл гаргах' : 'Энэ зар хаалттай'}${icon(app ? 'check' : 'arrow')}</button>${saveButton(id, true)}</div><p class="local-note">Бүх мэдээлэл нь жишээ. Ээлжийн нийт хөлсийг цагийн хөлс × ажлын цагаар тооцов. Татвар, завсарлага, төлбөрийн нөхцөлийг энэ загварт тооцоогүй.</p>`);
    $('#panel').classList.add('job-detail-dialog');
  }
  function openApply(id) {
    const job = jobById(id);
    if (!job || availability(job) !== 'active') return toast('Энэ зар хүсэлт авах боломжгүй байна.');
    if (applicationFor(id)) return navigate('applications');
    ui.panelJob = id;
    showPanel(`<button class="back-link text-button" data-action="detail" data-id="${escape(id)}">${icon('back')}Зарын дэлгэрэнгүй</button><h2 id="panel-title" class="panel-heading">Хүсэлт илгээх</h2><p class="panel-subtitle">${escape(job.title)}<br>${dateLabel(job.date)} · ${job.start} – ${job.end}<br>${escape(job.district)} · ${money(job.pay)} / цаг</p><p class="form-intro">Жишээ нэр, холбоо барих мэдээлэл ашиглаарай. Хүсэлт зөвхөн энэ хөтөч дээр хадгалагдана.</p><form id="application-form" data-job-id="${escape(id)}"><div class="form-grid"><label class="field field-full">Таны нэр<input name="name" required minlength="2" maxlength="80" autocomplete="off" placeholder="Жишээ: Бат" value="${escape(state.profile.name)}"></label><label class="field field-full">Утас эсвэл и-мэйл<input name="contact" required maxlength="100" autocomplete="off" placeholder="Жишээ: student@example.com" value="${escape(state.profile.contact)}"><span class="field-hint">8 оронтой утас эсвэл и-мэйл хаяг.</span></label><label class="field field-full">Товч танилцуулга <span class="field-hint">Заавал биш</span><textarea name="note" maxlength="600" rows="3" placeholder="Яагаад энэ ээлж танд тохирч байна вэ?"></textarea></label><label class="check-field"><input type="checkbox" name="consent" required>Энэ нь туршилтын хүсэлт бөгөөд байгууллага руу илгээгдэхгүйг ойлголоо.</label></div><p id="application-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button button-outline" data-action="detail" data-id="${escape(id)}">Буцах</button><button class="button button-dark" type="submit">Хүсэлт илгээх${icon('arrow')}</button></div></form>`, '#application-form input[name=name]');
  }
  function formError(id, message) { const target = document.getElementById(id); target.hidden = false; target.textContent = message; target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function submitApplication(form) {
    const job = jobById(form.dataset.jobId);
    if (!job || availability(job) !== 'active') return formError('application-error', 'Энэ зар хүсэлт авахаа больсон байна. Бусад ажлыг сонгоорой.');
    if (applicationFor(job.id)) return formError('application-error', 'Та энэ ажилд хүсэлт илгээсэн байна. “Миний хүсэлтүүд” хэсгээс харна уу.');
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const contact = String(data.get('contact')).trim();
    if (name.length < 2) return formError('application-error', 'Нэрээ 2-оос доошгүй тэмдэгтээр бичээрэй.');
    if (!/^\d{8}$/.test(contact.replace(/[\s-]/g, '')) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return formError('application-error', '8 оронтой утас эсвэл зөв и-мэйл хаяг бичээрэй.');
    const prior = state.applications.find((app) => app.jobId === job.id && app.status === 'withdrawn');
    const app = { id: prior?.id || crypto.randomUUID(), jobId: job.id, name, contact, note: String(data.get('note')).trim(), status: 'received', createdAt: Date.now(), updatedAt: Date.now(), snapshot: { ...job } };
    if (prior) state.applications[state.applications.indexOf(prior)] = app; else state.applications.push(app);
    state.profile = { name, contact };
    persist(); renderAll();
    showPanel(`<div class="success-icon">${icon('check')}</div><h2 id="panel-title" class="panel-heading">Хүсэлт хадгалагдлаа</h2><p class="panel-subtitle">Туршилтын хүсэлтийн явцаа “Миний хүсэлтүүд” хэсгээс хянаарай.</p><div class="confirmation-details"><strong>${escape(job.title)}</strong><span>${dateLabel(job.date)}</span><span>${job.start} – ${job.end} · ${escape(job.district)}</span><span>${money(job.pay)} / цаг</span></div><button class="button button-dark" data-action="my-applications">Миний хүсэлтүүд${icon('arrow')}</button><p class="local-note">Ажил олгогчийн горимд шилжин энэ хүсэлтийг шалгаж, төлөвийг нь өөрчилж туршиж болно. Хүсэлт бодит байгууллага руу илгээгдээгүй.</p>`);
  }

  function openApplication(id) {
    const app = state.applications.find((item) => item.id === id); if (!app) return;
    const job = app.snapshot;
    const messages = { received: 'Туршилтын хүсэлт хүлээн авсан төлөвт байна. Ажил олгогчийн горимд шилжиж хариуг өөрчилж туршаарай.', reviewing: 'Ажил олгогчийн горимоос энэ хүсэлтийг шалгаж буй төлөвт оруулсан байна.', accepted: 'Таныг энэ жишээ ээлжид сонгосон төлөвтэй байна. Энэ нь бодит ажилд авсан шийдвэр биш.', declined: 'Ажил олгогчийн горимоос энэ хүсэлтэд татгалзсан төлөв оруулсан байна. Бусад жишээ ажилд хүсэлт илгээж болно.', withdrawn: 'Та энэ хүсэлтийг цуцалсан. Зар нээлттэй байвал дахин хүсэлт илгээж болно.' };
    showPanel(`<h2 id="panel-title" class="panel-heading">${escape(job.title)}</h2>${badge(app.status)}<p class="form-intro" style="margin-top:22px">${messages[app.status]}</p><div class="confirmation-details"><strong>Хүсэлт илгээх үеийн ээлж</strong><span>${dateLabel(job.date)} · ${job.start} – ${job.end}</span><span>${escape(job.district)} · ${money(job.pay)} / цаг</span><span>${escape(job.company)} · Жишээ байгууллага</span></div><div class="detail-block"><h3>Таны хүсэлт</h3><p>${escape(app.name)}<br>${escape(app.contact)}</p><p style="margin-top:12px">${escape(app.note || 'Нэмэлт танилцуулга бичээгүй.')}</p></div><div class="detail-actions"><button class="button button-dark" data-action="detail" data-id="${escape(job.id)}">Зарыг харах${icon('arrow')}</button>${['received', 'reviewing', 'accepted'].includes(app.status) ? `<button class="button button-outline" data-action="withdraw" data-id="${escape(app.id)}">Цуцлах</button>` : ''}</div><p class="local-note">Энэ мэдээлэл зөвхөн таны хөтөч дээр хадгалагдсан.</p>`);
  }
  function confirmWithdrawal(id) {
    const app = state.applications.find((item) => item.id === id); if (!app || !['received', 'reviewing', 'accepted'].includes(app.status)) return;
    showPanel(`<h2 id="panel-title" class="panel-heading">Хүсэлтээ цуцлах уу?</h2><p class="panel-subtitle">${escape(app.snapshot.title)}</p><p class="form-intro">Цуцалсан хүсэлт хоёр горимд ижил харагдана. Зар нээлттэй байвал дараа нь дахин хүсэлт илгээж болно.</p><div class="form-actions"><button class="button button-outline" data-action="application-detail" data-id="${escape(id)}">Буцах</button><button class="button button-dark" data-action="confirm-withdraw" data-id="${escape(id)}">Хүсэлт цуцлах</button></div>`);
  }

  function openJobForm(id) {
    const job = jobById(id);
    const base = job || { title: '', description: '', company: '', category: '', district: '', address: '', date: '', start: '10:00', end: '15:00', pay: 15000, openings: 2, duties: '', requirements: '', meal: 'none' };
    const field = (label, name, type, value, extra = '', full = false) => `<label class="field ${full ? 'field-full' : ''}">${label}<input type="${type}" name="${name}" value="${escape(value)}" ${extra}></label>`;
    const select = (label, name, options, selected) => `<label class="field">${label}<select name="${name}" required><option value="">Сонгох</option>${options.map(([value, title]) => `<option value="${escape(value)}" ${value === selected ? 'selected' : ''}>${escape(title)}</option>`).join('')}</select></label>`;
    showPanel(`<h2 id="panel-title" class="panel-heading">${job ? 'Ажлын зар засах' : 'Шинэ ээлж нэмэх'}</h2><p class="panel-subtitle">Ажлын гол мэдээллээ оруулаарай. Зар жишээ мэдээлэл гэсэн тэмдэглэгээтэй харагдана.</p><form id="job-form" data-job-id="${escape(job?.id || '')}"><div class="form-grid">${field('Ажлын нэр', 'title', 'text', base.title, 'required minlength="3" maxlength="80" placeholder="Жишээ: Эвентийн туслах"', true)}${field('Байгууллагын жишээ нэр', 'company', 'text', base.company, 'required maxlength="80" placeholder="Жишээ: Хотын эвент"', true)}${select('Ажлын төрөл', 'category', Object.entries(categories), base.category)}${select('Дүүрэг', 'district', districts.map((d) => [d, d]), base.district)}${field('Жишээ байршил', 'address', 'text', base.address, 'required maxlength="160" placeholder="Хороолол, ойрхон газрын нэр"', true)}${field('Ажлын өдөр', 'date', 'date', base.date, `required min="${today()}"`)}${field('Орон тоо', 'openings', 'number', base.openings, 'required min="1" max="100" step="1"')}${field('Эхлэх цаг', 'start', 'time', base.start, 'required')}${field('Дуусах цаг', 'end', 'time', base.end, 'required')}${field('Цагийн хөлс (₮)', 'pay', 'number', base.pay, 'required min="1000" max="1000000" step="1"', true)}<fieldset class="field field-full chip-group"><legend>Нэмэлт нөхцөл</legend><div class="chip-row">${Object.entries(meals).map(([value, [label]]) => `<label class="toggle-chip"><input type="radio" name="meal" value="${value}" ${(mealOf(base) || 'none') === value ? 'checked' : ''}>${value === 'none' ? '' : icon('meal')}${label}</label>`).join('')}</div><label class="field meal-amount" ${mealOf(base) === 'allowance' ? '' : 'hidden'}>Хоолны мөнгөний дүн (₮)<input type="number" name="mealAllowance" min="500" max="200000" step="500" inputmode="numeric" placeholder="Жишээ: 10000" value="${escape(String(base.mealAllowance ?? ''))}" ${mealOf(base) === 'allowance' ? 'required' : 'disabled'}><span class="field-hint">Нэг ээлжид олгох хоолны мөнгө.</span></label></fieldset><label class="field field-full">Зарын товч тайлбар<textarea name="description" required minlength="8" maxlength="1200" rows="2" placeholder="Жагсаалтад харагдах товч тайлбар">${escape(base.description)}</textarea></label><label class="field field-full">Хийх ажлын дэлгэрэнгүй<textarea name="duties" required maxlength="1500" rows="3">${escape(base.duties)}</textarea></label><label class="field field-full">Шаардлага<textarea name="requirements" required maxlength="1000" rows="3" placeholder="Шаардлага бүрийг шинэ мөрөнд бичнэ">${escape(base.requirements)}</textarea><span class="field-hint">Ээлж тухайн өдөртөө дуусна. Одоо байгаа хүсэлтүүд анх илгээсэн үеийн мэдээллээ хадгална.</span></label></div><p id="job-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button button-outline" data-action="close">Болих</button><button class="button button-dark" type="submit">${job ? 'Өөрчлөлт хадгалах' : 'Жишээ зар нийтлэх'}${icon('arrow')}</button></div><p class="local-note">Зар зөвхөн энэ хөтөч дээр харагдана. Байгууллага болон цалин нь жишээ мэдээлэл байна.</p></form>`, '#job-form input[name=title]');
  }
  function submitJob(form) {
    const old = jobById(form.dataset.jobId);
    const data = new FormData(form);
    const fields = Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value).trim()]));
    const job = { ...fields, id: old?.id || crypto.randomUUID(), pay: Number(fields.pay), openings: Number(fields.openings), meal: Object.hasOwn(meals, fields.meal) ? fields.meal : 'none', mealAllowance: fields.meal === 'allowance' ? Number(fields.mealAllowance) : undefined, createdAt: old?.createdAt || Date.now(), status: old?.status || 'active' };
    if (job.mealAllowance === undefined) delete job.mealAllowance;
    if (job.meal === 'allowance' && !(Number.isInteger(job.mealAllowance) && job.mealAllowance >= 500 && job.mealAllowance <= 200000)) return formError('job-error', 'Хоолны мөнгөний дүнг 500–200,000₮ хооронд бичээрэй.');
    if (toMinutes(job.end) <= toMinutes(job.start)) return formError('job-error', 'Дуусах цаг нь эхлэх цагаас хойш байх ёстой.');
    if (!validJob(job)) return formError('job-error', 'Мэдээллээ шалгаарай. Нэр, төрөл, дүүрэг, тайлбар болон зөв өдөр, цаг шаардлагатай.');
    if (job.date < today()) return formError('job-error', 'Ажлын өдөр өнөөдөр эсвэл түүнээс хойш байх ёстой.');
    if (job.openings < acceptedCount(job.id)) return formError('job-error', `Энэ ээлжид ${acceptedCount(job.id)} хүн сонгосон байна. Орон тоог үүнээс бага болгох боломжгүй.`);
    if (old) state.jobs[state.jobs.indexOf(old)] = job; else state.jobs.unshift(job);
    state.role = 'employer'; ui.employerTab = 'jobs';
    persist(); renderAll(); navigate('employer'); toast(old ? 'Зарын өөрчлөлт хадгалагдлаа.' : 'Жишээ зар нэмэгдлээ. Оюутны самбарт харагдана.');
  }
  function changeApplication(id, status) {
    const app = state.applications.find((item) => item.id === id);
    if (!app || app.status === 'withdrawn' || !Object.hasOwn(statusNames, status) || status === 'withdrawn') return renderEmployer();
    const job = jobById(app.jobId);
    if (status === 'accepted' && app.status !== 'accepted' && placesLeft(job) === 0) { toast('Энэ ээлжийн орон тоо дүүрсэн. Орон тоог нэмэх эсвэл өөр хүсэлтийн төлөвийг өөрчилнө үү.'); renderEmployer(); return; }
    app.status = status; app.updatedAt = Date.now(); persist(); renderAll(); document.querySelector(`[data-application="${CSS.escape(id)}"]`)?.focus(); toast('Хүсэлтийн төлөв өөрчлөгдлөө. Оюутны хэсэгт мөн харагдана.');
  }

  const palettes = [
    { id: 'original', name: 'Одоогийн өнгө', colors: ['#FFFFFF', '#BBBFBF', '#878787', '#05AD98'] },
    { id: 'ocean', name: 'Далайн цэнхэр', colors: ['#03045E', '#023E8A', '#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4', '#CAF0F8'], bg: '#CAF0F8', surface: '#FFFFFF', soft: '#ADE8F4', ink: '#03045E', muted: '#023E8A', button: '#0077B6', buttonText: '#FFFFFF', accent: '#90E0EF' },
    { id: 'sand', name: 'Элсэн дулаан', colors: ['#EDEDE9', '#D6CCC2', '#F5EBE0', '#E3D5CA', '#D5BDAF'], bg: '#F5EBE0', surface: '#EDEDE9', soft: '#E3D5CA', ink: '#352B26', muted: '#63534A', button: '#D5BDAF', buttonText: '#352B26', accent: '#D6CCC2' },
    { id: 'mono', name: 'Хар цагаан', colors: ['#FFFFFF', '#BFBFBF', '#7F7F7F', '#404040', '#000000'], bg: '#FFFFFF', surface: '#FFFFFF', soft: '#F2F2F2', ink: '#000000', muted: '#404040', button: '#000000', buttonText: '#FFFFFF', accent: '#BFBFBF' },
    { id: 'classic', name: 'Улаан ба хөх', colors: ['#780000', '#C1121F', '#FDF0D5', '#003049', '#669BBC'], bg: '#FDF0D5', surface: '#FFFAEF', soft: '#F4E4C5', ink: '#003049', muted: '#435C69', button: '#C1121F', buttonText: '#FFFFFF', accent: '#669BBC' },
    { id: 'pastel', name: 'Зөөлөн пастель', colors: ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF'], bg: '#FFF5FA', surface: '#FFFFFF', soft: '#FFC8DD', ink: '#352C45', muted: '#63516E', button: '#CDB4DB', buttonText: '#352C45', accent: '#BDE0FE' }
  ];
  const paletteKey = 'eelj.palette.v1';
  let selectedPalette = 'original';
  let paletteProperties = [];
  function applyPalette(id) {
    const palette = palettes.find((item) => item.id === id);
    if (!palette) return;
    const root = document.documentElement;
    paletteProperties.forEach((key) => root.style.removeProperty(key));
    paletteProperties = [];
    selectedPalette = id;
    root.dataset.palette = id;
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      const background = palette.button || '#05AD98';
      const foreground = palette.buttonText || '#062A25';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><path d="m14 44 20-20H22l10-10h20v20L42 44V32L22 52Z" fill="${foreground}"/></svg>`;
      favicon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
    if (id !== 'original') {
      const values = {
        '--bg': palette.bg, '--surface': palette.surface, '--bg-2': palette.soft, '--hover': palette.soft,
        '--ink': palette.ink, '--muted': palette.muted, '--faint': palette.muted,
        '--line': `color-mix(in srgb, ${palette.ink} 14%, ${palette.surface})`, '--line-2': `color-mix(in srgb, ${palette.ink} 28%, ${palette.surface})`,
        '--blue': palette.ink, '--teal': palette.button, '--teal-text': palette.ink,
        '--accent': palette.accent, '--accent-t': palette.ink, '--grad-end': palette.muted,
        '--dark-bg': palette.button, '--dark-fg': palette.buttonText, '--dark-hover': `color-mix(in srgb, ${palette.button} 88%, ${palette.ink})`,
        '--glow-1': `color-mix(in srgb, ${palette.accent} 45%, transparent)`, '--glow-2': `color-mix(in srgb, ${palette.soft} 60%, transparent)`,
        '--grid': `color-mix(in srgb, ${palette.ink} 8%, transparent)`, '--b-gray': palette.soft, '--b-gray-t': palette.ink,
        'color-scheme': 'light'
      };
      paletteProperties = Object.keys(values);
      Object.entries(values).forEach(([key, value]) => root.style.setProperty(key, value));
    }
    document.querySelectorAll('[data-action="palette"]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.id === id)));
    try { localStorage.setItem(paletteKey, id); } catch { /* Keep the selection for this page session. */ }
  }
  function openColors() {
    ui.panelJob = null;
    showPanel(`<h2 id="panel-title" class="panel-heading">Өнгө сонгох</h2><p class="panel-subtitle">Таалагдсан өнгөө сонгоорой. Сонголт энэ хөтөч дээр хадгалагдана.</p><div class="palette-options">${palettes.map((palette) => `<button class="palette-option" data-action="palette" data-id="${palette.id}" aria-label="${palette.name}" aria-pressed="${selectedPalette === palette.id}"><span class="palette-button-preview" style="background:${palette.button || '#05AD98'};color:${palette.buttonText || '#062A25'}" aria-hidden="true"></span></button>`).join('')}</div>`);
    $('#panel').classList.add('job-detail-dialog');
  }
  try { const savedPalette = localStorage.getItem(paletteKey); if (savedPalette) applyPalette(savedPalette); } catch { /* Use the original palette. */ }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    if (action === 'colors') openColors();
    else if (action === 'palette') applyPalette(id);
    else if (action === 'account') openAccount();
    else if (action === 'close') closePanel();
    else if (action === 'detail') openJob(id);
    else if (action === 'apply') openApply(id);
    else if (action === 'application-detail') openApplication(id);
    else if (action === 'withdraw') confirmWithdrawal(id);
    else if (action === 'confirm-withdraw') {
      const app = state.applications.find((item) => item.id === id);
      if (app) { app.status = 'withdrawn'; app.updatedAt = Date.now(); persist(); renderAll(); closePanel(); toast('Хүсэлт цуцлагдлаа.'); }
    }
    else if (action === 'my-applications') navigate('applications');
    else if (action === 'browse') navigate('jobs');
    else if (action === 'student' || action === 'employer') { state.role = action; persist(); renderAll(); navigate(action === 'employer' ? 'employer' : 'jobs'); }
    else if (action === 'save') {
      if (!jobById(id)) return;
      const saved = state.saved.includes(id);
      state.saved = saved ? state.saved.filter((value) => value !== id) : [...state.saved, id];
      persist(); renderBrowse();
      const panelButton = $('#panel-content [data-action=save]');
      if (panelButton?.dataset.id === id) { panelButton.setAttribute('aria-pressed', String(!saved)); panelButton.setAttribute('aria-label', saved ? 'Ажлыг хадгалах' : 'Хадгалснаас хасах'); }
      toast(saved ? 'Хадгалснаас хаслаа.' : 'Ажил хадгалагдлаа.');
    }
    else if (action === 'saved') { ui.savedOnly = !ui.savedOnly; ui.limit = 3; renderBrowse(); }
    else if (action === 'more') { ui.limit += 3; renderBrowse(); }
    else if (action === 'clear-filters' || action === 'reset-filters') { ui.category = ''; ui.district = ''; ui.limit = 3; if (action === 'reset-filters') ui.savedOnly = false; renderBrowse(); }
    else if (action === 'employer-tab') { ui.employerTab = button.dataset.tab; renderEmployer(); }
    else if (action === 'new-job') openJobForm();
    else if (action === 'edit-job') openJobForm(id);
    else if (action === 'job-applicants') { ui.employerTab = 'applications'; ui.applicantJob = id; renderEmployer(); $('#employer-applications-tab').focus(); }
    else if (action === 'pause-job') { const job = jobById(id); if (job) { job.status = job.status === 'active' ? 'paused' : 'active'; persist(); renderAll(); toast(job.status === 'paused' ? 'Зарыг түр зогсоолоо.' : 'Зарыг дахин нээлээ.'); } }
    else if (action === 'reset') showPanel(`<h2 id="panel-title" class="panel-heading">Өгөгдлийг шинэчлэх үү?</h2><p class="panel-subtitle">Энэ хөтөч дээрх хадгалсан ажил, хүсэлт болон таны нэмсэн заруудыг арилгаж, анхны жишээ заруудыг сэргээнэ.</p><div class="form-actions"><button class="button button-outline" data-action="close">Болих</button><button class="button button-dark" data-action="confirm-reset">Шинээр эхлэх</button></div>`);
    else if (action === 'confirm-reset') { state = freshState(); ui.category = ''; ui.district = ''; ui.savedOnly = false; ui.limit = 3; ui.applicantJob = ''; ui.employerTab = 'jobs'; persist(); renderAll(); navigate('jobs'); toast('Туршилтын өгөгдлийг шинэчиллээ.'); }
  });
  document.addEventListener('submit', (event) => {
    if (event.target.id === 'search-form') { event.preventDefault(); const data = new FormData(event.target); ui.category = data.get('category'); ui.district = data.get('district'); ui.limit = 3; renderBrowse(); $('#jobs').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (event.target.id === 'application-form') { event.preventDefault(); submitApplication(event.target); }
    else if (event.target.id === 'job-form') { event.preventDefault(); submitJob(event.target); }
  });
  document.addEventListener('change', (event) => {
    if (event.target.id === 'sort') { ui.sort = event.target.value; renderBrowse(); }
    else if (event.target.id === 'applicant-job-filter') { ui.applicantJob = event.target.value; renderEmployer(); }
    else if (event.target.dataset.application) changeApplication(event.target.dataset.application, event.target.value);
    else if (event.target.name === 'meal' && event.target.form?.id === 'job-form') {
      const wrap = event.target.form.querySelector('.meal-amount'); const input = wrap.querySelector('input'); const on = event.target.value === 'allowance';
      wrap.hidden = !on; input.disabled = !on; input.required = on; if (on) input.focus();
    }
  });
  $('.workspace-tabs').addEventListener('keydown', (event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); ui.employerTab = event.key === 'Home' ? 'jobs' : event.key === 'End' ? 'applications' : ui.employerTab === 'jobs' ? 'applications' : 'jobs'; renderEmployer(); $(`#employer-${ui.employerTab}-tab`).focus(); } });
  $('#panel').addEventListener('click', (event) => { if (event.target === $('#panel')) { const rect = $('#panel').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel(); } });
  window.addEventListener('hashchange', route);
  window.addEventListener('storage', (event) => { if (event.key === KEY) { state = loadState(); renderAll(); } });
  state = loadState();
  renderAll(); route();
})();
