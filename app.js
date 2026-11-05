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
  const addDays = (value, n) => { const d = new Date(value + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const dayList = (from, to, max = 62) => { const out = []; for (let d = from; d <= to && out.length < max; d = addDays(d, 1)) out.push(d); return out; };
  const lastDate = (job) => job.endDate || job.date;
  const daysOf = (job) => Array.isArray(job.workDays) ? job.workDays.slice() : dayList(job.date, lastDate(job));
  const groupDays = (days) => days.reduce((groups, date) => { const last = groups[groups.length - 1]; if (last && addDays(last[1], 1) === date) last[1] = date; else groups.push([date, date]); return groups; }, []);
  const rangesText = (days) => groupDays(days).map(([a, b]) => a === b ? shortDate(a) : `${shortDate(a)}–${shortDate(b)}`).join(', ');
  const weekday = (value) => weekdays[new Date(value + 'T12:00:00Z').getUTCDay()];
  const dayRange = (job) => job.endDate ? `${shortDate(job.date)}–${shortDate(job.endDate)}` : shortDate(job.date);
  const weekdayRange = (job) => job.workDays ? `${job.workDays.length} өдөр · завсартай` : job.endDate ? `${weekday(job.date)} – ${weekday(job.endDate)}` : weekday(job.date);
  const whenLabel = (job) => job.workDays ? `${rangesText(job.workDays)} · ${job.workDays.length} өдөр` : job.endDate ? `${fullDate(job.date)} – ${fullDate(job.endDate)} · ${daysOf(job).length} өдөр` : dateLabel(job.date);
  const timeLabel = (job) => job.schedule ? 'Өдөр бүр өөр цагтай' : `${job.start} – ${job.end}`;
  const dayHours = (start, end) => (toMinutes(end) - toMinutes(start)) / 60;
  const totalHours = (job) => Math.round((job.schedule ? job.schedule.reduce((sum, day) => sum + dayHours(day.start, day.end), 0) : dayHours(job.start, job.end) * daysOf(job).length) * 100) / 100;
  const jobById = (id) => state.jobs.find((job) => job.id === id);
  const applicationFor = (id) => state.applications.find((app) => app.jobId === id && app.status !== 'withdrawn');
  const acceptedCount = (id) => state.applications.filter((app) => app.jobId === id && app.status === 'accepted').length;
  const placesLeft = (job) => Math.max(0, job.openings - acceptedCount(job.id));
  const availability = (job) => job.status === 'paused' ? 'paused' : lastDate(job) < today() ? 'expired' : placesLeft(job) === 0 ? 'full' : 'active';
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const weekShort = { 1: 'Да', 2: 'Мя', 3: 'Лх', 4: 'Пү', 5: 'Ба', 6: 'Бя', 0: 'Ня' };
  const hourList = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);
  const cleanAvail = (value) => ({ dates: Array.isArray(value?.dates) ? [...new Set(value.dates.filter((d) => validDate(d)))].sort().slice(0, 120) : [], from: validTime(value?.from) ? value.from : '', to: validTime(value?.to) ? value.to : '' });
  const myAvail = () => cleanAvail(state.profile);
  const hasAvail = (a) => a.dates.length > 0 || Boolean(a.from) || Boolean(a.to);
  const daysText = (days) => !days.length ? 'Өдөр хамаагүй' : days.length === 7 ? 'Долоо хоног бүр' : weekOrder.filter((d) => days.includes(d)).map((d) => weekShort[d]).join(', ');
  const datesText = (dates) => dates.length ? `${rangesText(dates)} · ${dates.length} өдөр` : 'Өдөр хамаагүй';
  const wdOf = (date) => new Date(date + 'T12:00:00Z').getUTCDay();
  const hoursText = (from, to) => from && to ? `${from} – ${to}` : from ? `${from}-аас хойш` : to ? `${to} хүртэл` : 'Цаг хамаагүй';
  const fitDays = (job, a) => daysOf(job).filter((date) => { const shift = job.schedule?.find((day) => day.date === date) || job; return (a.dates?.length ? a.dates.includes(date) : a.days?.length ? a.days.includes(wdOf(date)) : true) && (!a.from || shift.start >= a.from) && (!a.to || shift.end <= a.to); });
  const fitsJob = (job, a) => fitDays(job, a).length === daysOf(job).length;
  const fitsSome = (job, a) => fitDays(job, a).length > 0;
  const weekStrip = (days) => `<span class="week-strip" aria-label="Боломжтой өдөр: ${daysText(days)}">${weekOrder.map((d) => `<span class="${days.includes(d) ? 'on' : ''}" aria-hidden="true">${weekShort[d]}</span>`).join('')}</span>`;
  const availSummary = (raw) => { const a = cleanAvail(raw); const legacy = !a.dates.length && Array.isArray(raw?.days) && raw.days.length; return `${legacy ? weekStrip(raw.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)) : `<span class="avail-dates">${icon('calendar')}${datesText(a.dates)}</span>`}<strong class="avail-hours-text">${hoursText(a.from, a.to)}</strong>`; };
  const ui = { category: '', district: '', sort: 'newest', seekDates: [], seekLimit: 10, availOpen: { me: false, seek: true }, availMonth: {}, seekFrom: '', seekTo: '', seekDistrict: '', seekJob: '', pickedOnly: false, savedOnly: false, limit: 3, employerTab: 'jobs', applicantJob: '', view: 'jobs', panelJob: null, menuOpen: false };
  let storageMessage = '';
  let toastTimer;
  let state;
  // Firebase web app config (Project settings → Your apps). These values are public by design.
  const FIREBASE_CONFIG = { apiKey: 'AIzaSyAGFUFrTuhxdBAvGcComeQoud4E4AiGtLU', authDomain: 'tsagiinajil-bde42.firebaseapp.com', projectId: 'tsagiinajil-bde42', appId: '1:296583922372:web:baed6fa189c58ec7ebff91' };
  const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  let authReady;
  function firebaseAuth() {
    if (!FIREBASE_CONFIG.apiKey) return Promise.reject(Object.assign(new Error('Firebase is not configured'), { code: 'eelj/not-configured' }));
    authReady ||= Promise.all([import(FIREBASE_SDK + 'firebase-app.js'), import(FIREBASE_SDK + 'firebase-auth.js')])
      .then(([app, fb]) => { const auth = fb.getAuth(app.initializeApp(FIREBASE_CONFIG)); auth.languageCode = 'mn'; return { auth, fb }; })
      .catch((error) => { authReady = null; throw Object.assign(error, { code: error.code || 'auth/network-request-failed' }); });
    return authReady;
  }
  let storeReady;
  function firestore() {
    storeReady ||= Promise.all([firebaseAuth(), import(FIREBASE_SDK + 'firebase-firestore.js')])
      .then(([{ auth }, fs]) => ({ auth, fs, db: fs.getFirestore() }))
      .catch((error) => { storeReady = null; throw error; });
    return storeReady;
  }
  // Students who marked free days (Firestore seekers/{uid}) and invites sent to this student (invites).
  let remoteSeekers = [], inbox = [], inboxToasted = false, publishTimer;
  const toSeeker = (id, d) => ({ id, real: true, name: string(d.name, 80) && d.name.trim() ? d.name : 'Ажил горилогч', school: string(d.school, 80) ? d.school : '', major: '', year: 0, district: districts.includes(d.district) ? d.district : '', dates: (Array.isArray(d.dates) ? d.dates : []).filter((date) => validDate(date) && date >= today()), from: validTime(d.from) ? d.from : '', to: validTime(d.to) ? d.to : '', likes: [], bio: string(d.bio, 300) ? d.bio : '' });
  function listingData() {
    const a = myAvail();
    return { name: state.profile.name, district: state.profile.district || '', school: state.profile.school || '', major: '', dates: a.dates.filter((date) => date >= today()).slice(0, 62), from: a.from, to: a.to, likes: [], bio: state.profile.bio || '', updatedAt: Date.now() };
  }
  // Students are listed for employers while they have upcoming free days and have not opted out.
  function publishAvailability() {
    if (!state.signedIn || state.role !== 'student' || !FIREBASE_CONFIG.apiKey) return;
    clearTimeout(publishTimer);
    publishTimer = setTimeout(async () => {
      try {
        const { auth, fs, db } = await firestore();
        const uid = auth.currentUser?.uid; if (!uid) return;
        const data = listingData(), ref = fs.doc(db, 'seekers', uid);
        if (state.profile.listed === false || !data.dates.length) await fs.deleteDoc(ref); else await fs.setDoc(ref, data);
      } catch { toast('Завтай өдрөө ажил олгогчдод хүргэж чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.'); }
    }, 700);
  }
  async function loadSeekers() {
    if (!state.signedIn || !FIREBASE_CONFIG.apiKey) return;
    try {
      const { fs, db } = await firestore();
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'seekers'), fs.orderBy('updatedAt', 'desc'), fs.limit(200)));
      remoteSeekers = snap.docs.map((item) => toSeeker(item.id, item.data())).filter((person) => person.dates.length);
      renderEmployer();
    } catch { /* Keep the sample list when Firestore is unreachable. */ }
  }
  async function loadInbox() {
    if (!state.signedIn || !FIREBASE_CONFIG.apiKey) return;
    try {
      const { auth, fs, db } = await firestore();
      const uid = auth.currentUser?.uid; if (!uid) return;
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'invites'), fs.where('seekerId', '==', uid)));
      inbox = snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.job && string(item.message, 800)).sort((a, b) => b.createdAt - a.createdAt);
      renderApplications(); renderHeader();
      if (inbox.length && !inboxToasted && state.role === 'student') { inboxToasted = true; toast(`Танд ${inbox.length} ажлын урилга ирсэн байна. “Миний хүсэлтүүд” хэсгээс харна уу.`); }
    } catch { /* Inbox stays empty offline. */ }
  }

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
      ['delivery-help', 'Хүргэлтийн туслах', 'Захиалгыг ангилж, хүргэлтийн жолоочтой хамт хаягаар хүргэх үдээс хойшхи ээлж.', 'Баянгол', 'warehouse', 5, '14:00', '18:00', 15000, 2, 'Шуурхай хүргэлт', '10-р хороолол · Жишээ байршил', 'Хүргэлтийн жагсаалт шалгах, бараа ачих, хүлээн авагчид гарын үсэг зуруулна.', 'Цаг баримтлах\nГадуур явах дургүйцэхгүй байх\nЖолооны үнэмлэх шаардахгүй'],
      ['library-help', 'Номын сангийн туслах', 'Буцаж ирсэн номыг байранд нь тавих, уншигчдад туслах амралтын өдрийн ээлж.', 'Сүхбаатар', 'office', 6, '10:00', '14:00', 13000, 2, 'Мэдлэг номын сан', 'Бага тойруу · Жишээ байршил', 'Ном тавиурт байрлуулах, уншлагын танхим цэгцлэх, ном хайхад туслана.', 'Нямбай байх\nЧимээгүй орчинд ажиллах дуртай байх\nТуршлага шаардахгүй'],
      ['concert-help', 'Тоглолтын тасалбар шалгагч', 'Үзэгчдийн тасалбар шалгаж, суудал руу нь чиглүүлэх оройн ээлж.', 'Хан-Уул', 'event', 0, '18:00', '22:00', 16000, 4, 'Тайз продакшн', 'Зайсангийн гудамж · Жишээ байршил', 'Тасалбар уншуулах, үзэгчдийг угтах, суудал заах, тоглолтын дараа танхим цэгцлэхэд туслана.', 'Орой ажиллах боломжтой байх\nЭелдэг харилцаатай байх\nТуршлага шаардахгүй'],
      ['survey-help', 'Судалгааны мэдээлэл оруулагч', 'Бэлэн асуулгын хариултыг хүснэгтэд оруулж, мэдээлэл шалгах.', 'Сонгинохайрхан', 'office', 6, '13:00', '17:00', 14000, 2, 'Тэмдэг судалгааны баг', '1-р хороолол · Жишээ байршил', 'Цаасан асуулгын хариултыг хүснэгтэд оруулах, давхардал болон дутуу мэдээлэл шалгана.', 'Монгол хэлээр шивдэг байх\nХүснэгттэй ажиллах анхан шатны мэдлэгтэй байх\nНямбай байх']
    ];
    const kinds = [
      ['Кофе шопын туслах', 'cafe', 'Кофе, ундаа бэлтгэхэд туслах, зочдод үйлчлэх өглөөний ээлж.', '08:00', '12:00', 14000, 'Аяга угаах, ширээ цэгцлэх, кассын дэргэд захиалга хүлээн авахад туслана.', 'Эелдэг харилцаатай байх\nЦаг баримтлах\nТуршлага шаардахгүй'],
      ['Эвентийн зохион байгуулалтын туслах', 'event', 'Арга хэмжээний танхим бэлтгэх, зочдыг угтах, чиглүүлэх ээлж.', '15:00', '20:00', 15000, 'Сандал ширээ байрлуулах, бүртгэлийн ширээнд суух, зочдод мэдээлэл өгнө.', 'Хөдөлгөөнтэй байх\nБагаар ажиллах дуртай байх\nТуршлага шаардахгүй'],
      ['Супермаркетын тавиур өрөгч', 'retail', 'Оройн цагаар бараа өрж, тавиур цэгцлэх ажил.', '18:00', '22:00', 13500, 'Шинэ ирсэн барааг тавиурт өрөх, хугацаа шалгах, үнийн шошго солино.', 'Нямбай байх\nОрой ажиллах боломжтой байх\nТуршлага шаардахгүй'],
      ['Агуулахын тооллогын туслах', 'warehouse', 'Барааны тоо ширхэг тоолж, бүртгэлтэй тулгах өдрийн ээлж.', '09:00', '15:00', 16000, 'Сканнер ашиглан бараа тоолох, зөрүүг тэмдэглэх, хайрцаг цэгцэлнэ.', 'Тоонд нямбай байх\nЗогсоо ажиллах боломжтой байх\nЗааварчилгаа өгнө'],
      ['Ресепшний туслах', 'office', 'Үйлчлүүлэгч угтах, утсанд хариулах, бүртгэл хөтлөх.', '13:00', '18:00', 14000, 'Зочдыг бүртгэх, утасны дуудлага шилжүүлэх, мэдээлэл өгнө.', 'Ярианы чадвар сайн байх\nКомпьютер ашиглаж чаддаг байх\nОюутан байж болно'],
      ['Пиццаны газрын туслах', 'cafe', 'Захиалга савлах, гал тогоонд туслах оройн ээлж.', '17:00', '22:00', 14500, 'Хайрцаг бэлтгэх, захиалга савлах, ажлын байраа цэвэрлэнэ.', 'Эрүүл ахуйн дүрэм мөрдөх\nХурдан ажилладаг байх\nТуршлага шаардахгүй'],
      ['Хувцасны дэлгүүрийн зөвлөх', 'retail', 'Худалдан авагчдад хэмжээ, загвар сонгоход туслах.', '12:00', '18:00', 14000, 'Худалдан авагчдад зөвлөх, өмсөж үзэх өрөө хариуцах, хувцас эвхэж өрнө.', 'Загвар сонирхдог байх\nЭелдэг байх\nТуршлага шаардахгүй'],
      ['Сургалтын төвийн туслах', 'office', 'Хичээлийн материал бэлтгэх, оюутнуудыг бүртгэх.', '10:00', '14:00', 13000, 'Материал хувилах, анги бэлтгэх, ирц бүртгэнэ.', 'Хариуцлагатай байх\nКомпьютерын анхан шатны мэдлэгтэй байх\nОюутан байж болно'],
      ['Спорт тэмцээний туслах', 'event', 'Тэмцээний талбайд оролцогчдыг бүртгэх, ус түгээх.', '09:00', '14:00', 15000, 'Оролцогч бүртгэх, дугаар тараах, ус түгээх цэг хариуцна.', 'Гадаа ажиллах боломжтой байх\nХөдөлгөөнтэй байх\nТуршлага шаардахгүй'],
      ['Савлагааны ажилтан', 'warehouse', 'Онлайн захиалгыг савлаж, шошго наах ээлж.', '13:00', '17:00', 15500, 'Бараа ороох, хайрцаглах, хүргэлтийн шошго наана.', 'Нямбай байх\nЦаг баримтлах\nХүнд зүйл өргөх шаардлагагүй'],
      ['Дуудлагын төвийн туслах', 'office', 'Үйлчлүүлэгчийн асуултад утсаар хариулах өдрийн ээлж.', '11:00', '16:00', 14000, 'Бэлэн зааврын дагуу дуудлагад хариулах, хүсэлт бүртгэнэ.', 'Ярианы чадвар сайн байх\nТайван байх\nСургалт өгнө'],
      ['Хүнсний дэлгүүрийн касс туслах', 'retail', 'Кассын дэргэд бараа савлах, худалдан авагчдад туслах.', '09:00', '13:00', 13000, 'Бараа уутлах, тавиур нөхөх, худалдан авагчдад туслана.', 'Эелдэг байх\nЦаг баримтлах\nТуршлага шаардахгүй'],
      ['Үзэсгэлэнгийн хөтөч', 'event', 'Үзэсгэлэнгийн зочдод тайлбар өгч, чиглүүлэх ээлж.', '11:00', '17:00', 16000, 'Зочдыг угтах, үзмэрийн тухай товч тайлбар өгөх, танхимд хяналт тавина.', 'Ярианы чадвар сайн байх\nТүүх, урлаг сонирхдог байх\nЗааварчилгаа өгнө']
    ];
    const brands = ['Өглөөний аяга', 'Талст эвент', 'Нүүдэл маркет', 'Хурд агуулах', 'Цэцэг төв', 'Халуун зуух', 'Өнгө бутик', 'Мэдлэгийн гүүр', 'Тэмцэл спорт', 'Багц савлагаа', 'Холбоо төв', 'Өдөр бүр маркет', 'Түүх үзэсгэлэн', 'Уулын кофе', 'Хөг эвент', 'Сайхан маркет', 'Тэнгэр агуулах', 'Нар оффис', 'Гал пицца', 'Загвар хаус', 'Ухаан академи', 'Аварга клуб', 'Шуудан савлагаа', 'Дуудлага плюс', 'Ойр дэлгүүр', 'Арт хаус', 'Ногоон кофе', 'Баяр эвент', 'Хөх маркет', 'Зам агуулах', 'Төв оффис', 'Амтат зуух', 'Стиль дэлгүүр', 'Ирээдүй сургалт', 'Хүч спорт', 'Хайрцаг хаус', 'Холбоос үйлчилгээ', 'Гэр маркет', 'Өв үзэсгэлэн'];
    const generated = brands.map((company, i) => {
      const [title, category, description, start, end, pay, duties, requirements] = kinds[i % kinds.length];
      return { id: `g-${String(i + 1).padStart(2, '0')}`, title, description, district: districts[(i * 5 + Math.floor(i / kinds.length)) % districts.length], category, offset: 1 + (i * 11) % 36, start, end, pay: pay + (i % 3) * 500, openings: 1 + i % 4, company, address: `${1 + (i * 7) % 24}-р хороо · Жишээ байршил`, duties, requirements, span: i % 6 === 2 ? 3 : i % 9 === 4 ? 5 : 1, meal: ['lunch', 'allowance', 'none'][i % 3] };
    });
    const extras = generated.map((g, index) => {
      const date = addDays(today(), g.offset);
      const { offset, span, ...rest } = g;
      return { ...rest, date, ...(span > 1 ? { endDate: addDays(date, span - 1) } : {}), ...(g.meal === 'allowance' ? { mealAllowance: 6000 + (index % 3) * 2000 } : {}), status: 'active', createdAt: Date.now() - (data.length + index) * 60000 };
    });
    return data.map((item, index) => {
      const [id, title, description, district, category, weekday, start, end, pay, openings, company, address, duties, requirements] = item;
      const date = nextDay(weekday);
      const multi = { 'office-help': { endDate: addDays(date, 4) }, 'kitchen-help': { endDate: addDays(date, 2), schedule: [['08:00', '12:00'], ['09:00', '13:00'], ['08:00', '11:00']].map(([from, to], i) => ({ date: addDays(date, i), start: from, end: to })) } }[id] || {};
      return { id, title, description, district, category, date, start, end, pay, openings, company, address, duties, requirements, meal: ['event-help', 'warehouse-help', 'kitchen-help', 'delivery-help'].includes(id) ? 'lunch' : ['shop-help', 'office-help', 'concert-help'].includes(id) ? 'allowance' : 'none', ...({ 'shop-help': { mealAllowance: 8000 }, 'office-help': { mealAllowance: 10000 }, 'concert-help': { mealAllowance: 7000 } })[id], ...multi, status: 'active', createdAt: Date.now() - index * 60000 };
    }).concat(extras);
  }

  const seekers = [
    ['s-batbayar', 'Батбаяр', 'МУИС', 'Програм хангамж', 2, 'Сүхбаатар', [6, 0], '09:00', '18:00', ['office', 'event'], 'Амралтын өдрүүдэд бүтэн өдөр ажиллах боломжтой. Хүснэгт дээр хурдан ажилладаг.'],
    ['s-nomin', 'Номин', 'СЭЗИС', 'Маркетинг', 3, 'Чингэлтэй', [1, 3, 5], '11:00', '19:00', ['retail', 'cafe'], 'Хичээл маань өглөө тул үдээс хойш завтай. Дэлгүүрт 6 сар ажилласан.'],
    ['s-temuulen', 'Тэмүүлэн', 'ШУТИС', 'Барилгын инженер', 1, 'Баянзүрх', [2, 4, 6], '08:00', '14:00', ['warehouse', 'event'], 'Өглөө эрт босдог, биеийн хүч шаардсан ажил хийж чадна.'],
    ['s-sarnai', 'Сарнай', 'АШУҮИС', 'Сувилахуй', 2, 'Баянгол', [3, 5], '16:00', '22:00', ['cafe', 'retail'], 'Оройн ээлж илүүд үздэг. Кафед зочдод үйлчилж байсан.'],
    ['s-anujin', 'Анужин', 'МУБИС', 'Англи хэл', 4, 'Хан-Уул', [1, 2, 3, 4, 5], '09:00', '15:00', ['office', 'retail'], 'Даваагаас баасан хүртэл өдрийн цагаар завтай. Англиар чөлөөтэй ярьдаг.'],
    ['s-bilguun', 'Билгүүн', 'МУИС', 'Эдийн засаг', 2, 'Сонгинохайрхан', [6], '10:00', '18:00', ['office', 'event'], 'Бямба гарагт бүтэн өдөр ажиллана. Судалгааны мэдээлэл оруулж байсан.'],
    ['s-munkhzul', 'Мөнхзул', 'СЭЗИС', 'Нягтлан бодох бүртгэл', 3, 'Хан-Уул', [2, 3, 4], '07:00', '13:00', ['cafe', 'office'], 'Өглөөний ээлжид тохиромжтой. Гал тогооны эрүүл ахуйн сургалтад хамрагдсан.'],
    ['s-khulan', 'Хулан', 'СУИС', 'График дизайн', 2, 'Сүхбаатар', [0, 6], '11:00', '20:00', ['retail', 'event'], 'Амралтын өдөр завтай. Ном, урлагийн дэлгүүрт ажиллах сонирхолтой.'],
    ['s-tuguldur', 'Төгөлдөр', 'ШУТИС', 'Мэдээллийн технологи', 3, 'Баянзүрх', [4, 5], '09:00', '18:00', ['warehouse', 'office'], 'Пүрэв, баасан гарагт хичээлгүй. Нямбай, тоо бүртгэлд сайн.'],
    ['s-enkhjin', 'Энхжин', 'МУИС', 'Сэтгэл судлал', 1, 'Чингэлтэй', [1, 3, 5, 6], '12:00', '18:00', ['retail', 'event'], 'Хүмүүстэй харилцах дуртай. Эвентэд сайн дураар оролцож байсан.'],
    ['s-ganzorig', 'Ганзориг', 'ХААИС', 'Хүнсний технологи', 2, 'Хан-Уул', [0, 5, 6], '14:00', '23:00', ['event', 'cafe'], 'Оройн болон амралтын өдрийн ээлжид бэлэн. Тоглолтын туслахаар ажиллаж байсан.'],
    ['s-ariunaa', 'Ариунаа', 'МУБИС', 'Бага боловсрол', 3, 'Баянгол', [1, 2, 3, 4, 5], '14:00', '19:00', ['warehouse', 'cafe'], 'Үдээс хойш завтай. Хариуцлагатай, цаг баримталдаг.']
  ].concat((() => {
    const names = ['Алтанцэцэг', 'Баярмаа', 'Ганбат', 'Даваа', 'Жаргал', 'Золбоо', 'Индра', 'Лхагва', 'Мандах', 'Наран', 'Оюун', 'Пүрэв', 'Солонго', 'Тэлмэн', 'Уянга', 'Хатан', 'Цэлмэг', 'Чинзориг', 'Шинэбаяр', 'Эрдэнэ', 'Ялалт', 'Амар', 'Бүрэн', 'Гэрэл', 'Дөлгөөн', 'Есүй', 'Мичид', 'Нандин', 'Отгон', 'Сондор', 'Тамир', 'Түвшин', 'Хишиг', 'Цогт', 'Энхрий', 'Ундрах', 'Өсөх', 'Номуун'];
    const schools = [['МУИС', 'Хууль зүй'], ['ШУТИС', 'Механик'], ['СЭЗИС', 'Санхүү'], ['АШУҮИС', 'Эм зүй'], ['МУБИС', 'Түүх'], ['ХААИС', 'Мал эмнэлэг'], ['СУИС', 'Дуу хөгжим'], ['МУИС', 'Олон улсын харилцаа'], ['ШУТИС', 'Сүлжээ'], ['СЭЗИС', 'Менежмент']];
    const patterns = [[[1, 3, 5], 'Даваа, лхагва, баасан гарагт'], [[2, 4], 'Мягмар, пүрэв гарагт'], [[6, 0], 'Амралтын өдрүүдэд'], [[1, 2, 3, 4, 5], 'Ажлын өдрүүдэд'], [[5, 6], 'Баасан, бямба гарагт'], [[0], 'Ням гарагт'], [[3, 6, 0], 'Лхагва болон амралтын өдөр'], [[1, 2], 'Даваа, мягмар гарагт'], [[4, 5, 6], 'Пүрэвөөс бямба хүртэл'], [[1, 2, 3, 4, 5, 6, 0], 'Долоо хоногийн аль ч өдөр']];
    const windows = [['08:00', '14:00', 'өглөөнөөс үд хүртэл'], ['09:00', '17:00', 'өдрийн цагаар'], ['12:00', '19:00', 'үдээс хойш'], ['14:00', '22:00', 'оройн цагаар'], ['10:00', '20:00', 'бүтэн өдөр'], ['17:00', '23:00', 'орой']];
    const skills = ['Хүмүүстэй харилцах дуртай.', 'Нямбай, цаг баримталдаг.', 'Кафед ажиллаж байсан туршлагатай.', 'Компьютер дээр хурдан ажилладаг.', 'Эвентэд сайн дураар оролцож байсан.', 'Англиар ярьж чадна.', 'Биеийн хүч шаардсан ажил хийж чадна.', 'Дэлгүүрт худалдагчаар ажиллаж байсан.', 'Багаар ажиллах дуртай.', 'Шинэ зүйл хурдан сурдаг.'];
    const likes = [['cafe', 'retail'], ['event', 'office'], ['warehouse', 'retail'], ['office', 'cafe'], ['event', 'warehouse'], ['retail', 'event']];
    return names.map((name, i) => { const [school, major] = schools[i % schools.length], [days, daysWord] = patterns[(i * 3) % patterns.length], [from, to, when] = windows[(i * 5) % windows.length]; return [`s-${String(i + 13).padStart(2, '0')}`, name, school, major, 1 + i % 4, districts[(i * 7) % districts.length], days, from, to, likes[i % likes.length], `${daysWord} ${when} ажиллах боломжтой. ${skills[i % skills.length]}`]; });
  })()).map(([id, name, school, major, year, district, days, from, to, likes, bio], index) => ({ id, name, school, major, year, district, days, from, to, likes, bio, contact: `8800-${String(index + 1).padStart(4, '0')}` }));
  const allSeekers = () => [...remoteSeekers, ...seekers];
  const seekerById = (id) => allSeekers().find((item) => item.id === id);
  // Registered students list exact dates; sample students list weekdays.
  const freeOn = (person, date) => person.dates ? person.dates.includes(date) : person.days.includes(wdOf(date));
  const seekerWhen = (person) => person.dates ? `<span class="avail-dates">${icon('calendar')}${datesText(person.dates)}</span>` : weekStrip(person.days);
  const seekerSchool = (person) => person.real ? escape(person.school || 'Ажил горилогч') : `${escape(person.school)} · ${escape(person.major)} · ${person.year}-р курс`;
  const invitesFor = (id) => state.invites.filter((item) => item.seekerId === id);
  const invitedIds = () => new Set(state.invites.map((item) => item.seekerId));
  const SEED_LEVEL = 3;
  function freshState() { return { version: 1, seedLevel: SEED_LEVEL, jobs: seedJobs(), applications: [], saved: [], invites: [], profile: { name: '', contact: '', dates: [], from: '', to: '' }, role: 'student', signedIn: false, roles: {}, userId: '' }; }
  const string = (value, max = 2000) => typeof value === 'string' && value.length <= max;
  const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(dateObject(value).getTime()) && dateObject(value).toISOString().slice(0, 10) === value;
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  function validJob(job) {
    return job && string(job.id, 100) && string(job.title, 80) && job.title.trim().length >= 3 && string(job.description, 1200) && string(job.company, 80) && string(job.address, 160) && string(job.duties, 1500) && string(job.requirements, 1000) && districts.includes(job.district) && Object.hasOwn(categories, job.category) && validDate(job.date) && validTime(job.start) && validTime(job.end) && toMinutes(job.end) > toMinutes(job.start) && Number.isInteger(job.pay) && job.pay >= 1000 && job.pay <= 1000000 && Number.isInteger(job.openings) && job.openings > 0 && job.openings <= 100 && ['active', 'paused'].includes(job.status) && (job.lunch === undefined || typeof job.lunch === 'boolean') && (job.meal === undefined || Object.hasOwn(meals, job.meal)) && (job.mealAllowance === undefined || (job.meal === 'allowance' && Number.isInteger(job.mealAllowance) && job.mealAllowance >= 500 && job.mealAllowance <= 200000)) && (job.endDate === undefined || (validDate(job.endDate) && job.endDate > job.date && dayList(job.date, job.endDate).length <= 31)) && (job.workDays === undefined || (job.endDate !== undefined && Array.isArray(job.workDays) && job.workDays.length >= 2 && job.workDays.every((d, i) => validDate(d) && d >= job.date && d <= job.endDate && (i === 0 || d > job.workDays[i - 1])) && job.workDays[0] === job.date && job.workDays[job.workDays.length - 1] === job.endDate)) && (job.schedule === undefined || (job.endDate !== undefined && Array.isArray(job.schedule) && job.schedule.length === daysOf(job).length && job.schedule.every((day, i) => day && day.date === daysOf(job)[i] && validTime(day.start) && validTime(day.end) && toMinutes(day.end) > toMinutes(day.start)))) && Number.isFinite(job.createdAt);
  }
  function validState(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.jobs) || value.jobs.length > 500 || !value.jobs.every(validJob) || new Set(value.jobs.map((j) => j.id)).size !== value.jobs.length || !Array.isArray(value.applications) || value.applications.length > 2000 || !Array.isArray(value.saved)) return false;
    return value.applications.every((app) => app && string(app.id, 100) && value.jobs.some((job) => job.id === app.jobId) && string(app.name, 80) && string(app.contact, 100) && string(app.note, 600) && Object.hasOwn(statusNames, app.status) && Number.isFinite(app.createdAt) && validJob(app.snapshot)) && value.saved.every((id) => string(id, 100)) && (value.picked === undefined || Array.isArray(value.picked)) && (value.invites === undefined || (Array.isArray(value.invites) && value.invites.length <= 2000 && value.invites.every((item) => item && string(item.id, 100) && string(item.seekerId, 100) && string(item.jobId, 100) && string(item.message, 600) && Number.isFinite(item.createdAt)))) && value.profile && string(value.profile.name, 80) && string(value.profile.contact, 100) && ['student', 'employer'].includes(value.role) && (value.signedIn === undefined || typeof value.signedIn === 'boolean') && (value.accounts === undefined || Array.isArray(value.accounts)) && (value.roles === undefined || (value.roles && typeof value.roles === 'object' && !Array.isArray(value.roles) && Object.values(value.roles).every((role) => ['student', 'employer'].includes(role)))) && (value.userId === undefined || string(value.userId, 128));
  }
  function validAccount(item) { return item && string(item.id, 100) && string(item.name, 80) && string(item.email, 100) && ['student', 'employer'].includes(item.role) && string(item.salt, 64) && string(item.hash, 64) && Number.isFinite(item.createdAt); }
  function loadState() {
    try { const raw = localStorage.getItem(KEY); if (!raw) return freshState(); const parsed = JSON.parse(raw); if (validState(parsed)) return upgrade(parsed); storageMessage = 'Хадгалсан өгөгдлийг уншиж чадсангүй. Жишээ мэдээллийг шинээр ачааллаа.'; }
    catch { storageMessage = 'Энэ хөтөч мэдээлэл хадгалах боломжгүй байна. Өөрчлөлтүүд хуудас нээлттэй байх хугацаанд ажиллана.'; }
    return freshState();
  }
  function upgrade(value) {
    delete value.picked;
    delete value.accounts;
    value.roles = value.roles || {};
    value.userId = value.userId || '';
    // Firebase confirms the cached session on load; old browser-only accounts are signed out there.
    value.signedIn = value.signedIn === true && Boolean(value.userId);
    if (!value.signedIn) value.userId = '';
    value.invites = (value.invites || []).filter((item) => (item.real || seekerById(item.seekerId)) && value.jobs.some((job) => job.id === item.jobId));
    delete value.profile.days; Object.assign(value.profile, cleanAvail(value.profile));
    if ((value.seedLevel || 1) < SEED_LEVEL) {
      const ids = new Set(value.jobs.map((job) => job.id));
      value.jobs.push(...seedJobs().filter((job) => !ids.has(job.id)));
      value.seedLevel = SEED_LEVEL;
    }
    return value;
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
    const result = state.jobs.filter((job) => (ui.savedOnly ? state.saved.includes(job.id) : availability(job) === 'active') && (!ui.category || job.category === ui.category) && (!ui.district || job.district === ui.district) && (ui.savedOnly || fitsSome(job, myAvail())));
    return result.sort((a, b) => ui.sort === 'pay' ? b.pay - a.pay || b.createdAt - a.createdAt : ui.sort === 'date' ? a.date.localeCompare(b.date) || a.start.localeCompare(b.start) : ui.sort === 'short' ? hours(a) - hours(b) || b.createdAt - a.createdAt : b.createdAt - a.createdAt);
  }
  function jobRow(job) {
    const available = availability(job) === 'active';
    return `<article class="job-row" data-job="${escape(job.id)}">
      <div class="job-description"><button class="job-title" data-action="detail" data-id="${escape(job.id)}" aria-haspopup="dialog">${escape(job.title)}</button><span class="job-company" style="margin-top:6px;margin-bottom:0">${escape(job.company)}</span><span class="job-note">Жишээ байгууллага${!available ? ' · ' + ({ paused: 'Түр зогсоосон', full: 'Орон тоо дүүрсэн', expired: 'Өдөр өнгөрсөн' })[availability(job)] : ''}</span></div>
      <div class="job-meta">${icon('pin')}<div><span class="meta-label">Дүүрэг</span><strong>${escape(job.district)}</strong></div></div>
      <div class="job-meta">${icon('calendar')}<div><span class="meta-label">Ажлын өдөр</span><strong class="date-strong">${dayRange(job)}</strong><span class="meta-weekday">${weekdayRange(job)}</span><span class="meta-extra">${timeLabel(job)}</span>${hasAvail(myAvail()) && !fitsJob(job, myAvail()) && fitsSome(job, myAvail()) ? `<span class="meta-fit">${icon('check')}${daysOf(job).length}-аас ${fitDays(job, myAvail()).length} өдөр таарна</span>` : ''}</div></div>
      <div class="job-meta pay-meta">${icon('pay')}<div><span class="meta-label">Цалин</span><strong>${money(job.pay)} <small>/ цаг</small></strong>${mealOf(job) === 'lunch' ? `<span class="pay-perk">${icon('meal')}Хоолтой</span>` : mealOf(job) === 'allowance' && job.mealAllowance ? `<span class="pay-perk">+${money(job.mealAllowance)} <small>хоолны мөнгө</small></span>` : ''}</div></div>
      <div class="job-actions"><button class="button button-dark" data-action="detail" data-id="${escape(job.id)}" aria-haspopup="dialog">Дэлгэрэнгүй${icon('arrow')}</button>${saveButton(job.id)}</div>
    </article>`;
  }
  function saveButton(id, large = false) {
    const saved = state.saved.includes(id);
    return `<button class="${large ? 'icon-button' : 'save-button'}" data-action="save" data-id="${escape(id)}" aria-pressed="${saved}" aria-label="${saved ? 'Хадгалснаас хасах' : 'Ажлыг хадгалах'}">${icon('bookmark')}${large ? '' : `<span>${saved ? 'Хадгалсан' : 'Хадгалах'}</span>`}</button>`;
  }
  const availOf = (scope) => scope === 'me' ? myAvail() : { dates: ui.seekDates, from: ui.seekFrom, to: ui.seekTo };
  const studentPool = () => state.jobs.filter((job) => availability(job) === 'active' && (!ui.category || job.category === ui.category) && (!ui.district || job.district === ui.district));
  function seekerPool(withDates) {
    const job = jobById(ui.seekJob);
    return allSeekers().filter((person) => (!ui.pickedOnly || invitedIds().has(person.id)) && (!withDates || ui.seekDates.every((date) => freeOn(person, date))) && (!ui.seekFrom || person.from <= ui.seekFrom) && (!ui.seekTo || !person.to || person.to >= ui.seekTo) && (!ui.seekDistrict || person.district === ui.seekDistrict) && (!job || fitsJob(job, person)));
  }
  function dayCounter(scope) {
    if (scope === 'me') { const pool = studentPool(), mine = myAvail(); return (date) => pool.filter((job) => fitDays(job, { dates: [date], from: mine.from, to: mine.to }).length).length; }
    const pool = seekerPool(false); return (date) => pool.filter((person) => freeOn(person, date)).length;
  }
  function availCal(scope, a) {
    const min = today(), last = addDays(min, 92);
    const month = ui.availMonth[scope] || (a.dates[0] && a.dates[0] >= min ? a.dates[0] : min).slice(0, 7);
    ui.availMonth[scope] = month;
    const [y, m] = month.split('-').map(Number);
    const lead = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
    const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const count = dayCounter(scope), unit = scope === 'me' ? 'зар' : 'хүн';
    const cells = Array.from({ length: lead }, () => '<span></span>');
    for (let d = 1; d <= length; d++) {
      const date = `${month}-${String(d).padStart(2, '0')}`, wd = wdOf(date), off = date < min || date > last;
      const n = off ? 0 : count(date), picked = a.dates.includes(date);
      const cls = ['ac-day', picked && 'is-picked', n && 'has-items', date === min && 'is-today', wd === 6 && 'is-sat', wd === 0 && 'is-sun'].filter(Boolean).join(' ');
      cells.push(`<button type="button" class="${cls}" data-action="avail-day" data-id="${scope}:${date}" aria-pressed="${picked}" aria-label="${fullDate(date)} ${weekday(date)}, ${n} ${unit}" ${off ? 'disabled' : ''}><b>${d}</b><small>${off ? '' : n ? `${n} ${unit}` : '–'}</small></button>`);
    }
    return `<div class="ac-head"><button type="button" class="icon-button" data-action="avail-month" data-id="${scope}:-1" aria-label="Өмнөх сар" ${month <= min.slice(0, 7) ? 'disabled' : ''}>${icon('back')}</button><strong>${y} оны ${m}-р сар</strong><button type="button" class="icon-button" data-action="avail-month" data-id="${scope}:1" aria-label="Дараах сар" ${month >= last.slice(0, 7) ? 'disabled' : ''}>${icon('arrow')}</button></div><div class="ac-grid" role="group" aria-label="Өдөр сонгох">${weekOrder.map((d) => `<span class="ac-wd${d === 6 ? ' is-sat' : d === 0 ? ' is-sun' : ''}">${weekShort[d]}</span>`).join('')}${cells.join('')}</div><p class="ac-note">${scope === 'me' ? 'Өдөр бүрийн доорх тоо нь тухайн өдөр ажиллах боломжтой зарын тоо. Хэдэн ч өдөр сонгож болно.' : 'Тоо нь тухайн өдөр завтай ажил хайгчийн тоо. Сонгосон бүх өдөрт завтай хүмүүс доор харагдана.'}</p>`;
  }
  function availPicker(scope, labels) {
    const a = availOf(scope), open = ui.availOpen[scope];
    const options = (value, placeholder) => `<option value="">${placeholder}</option>${hourList.map((hour) => `<option ${hour === value ? 'selected' : ''}>${hour}</option>`).join('')}`;
    return `<div class="avail-picker" data-scope="${scope}"><div class="avail-days"><span class="avail-label">${labels[0]}</span><button type="button" class="avail-toggle${a.dates.length ? ' is-set' : ''}" data-action="avail-open" data-id="${scope}" aria-expanded="${open}">${icon('calendar')}<span>${a.dates.length ? datesText(a.dates) : 'Өдөр сонгох'}</span>${icon('chevron')}</button></div><div class="avail-hours"><span class="avail-label">${labels[1]}</span><select name="${scope}-from" aria-label="${labels[1]}: эхлэх">${options(a.from, 'Эхлэх')}</select><span class="avail-dash" aria-hidden="true">–</span><select name="${scope}-to" aria-label="${labels[1]}: дуусах">${options(a.to, 'Дуусах')}</select></div>${hasAvail(a) ? `<div class="avail-quick"><button type="button" class="text-button" data-action="avail-clear" data-id="${scope}">Арилгах</button></div>` : ''}${open ? `<div class="avail-cal">${availCal(scope, a)}</div>` : ''}</div>`;
  }
  function refocus(selector) { if (selector) document.querySelector(selector)?.focus({ preventScroll: true }); }
  function setAvail(scope, a, focus) {
    if (scope === 'me') { delete state.profile.days; Object.assign(state.profile, a); ui.limit = 3; persist(); renderBrowse(); renderProfile(); publishAvailability(); }
    else { ui.seekDates = a.dates; ui.seekFrom = a.from; ui.seekTo = a.to; ui.seekLimit = 10; renderEmployer(); }
    refocus(focus);
  }
  function readPicker(picker, changed) {
    const scope = picker.dataset.scope;
    const a = { dates: availOf(scope).dates, from: picker.querySelector(`[name=${scope}-from]`).value, to: picker.querySelector(`[name=${scope}-to]`).value };
    if (a.from && a.to && a.to <= a.from) { toast('Дуусах цаг эхлэх цагаас хойш байх ёстой.'); if (changed.name.endsWith('-from')) a.to = ''; else a.from = ''; }
    setAvail(scope, a, `[name="${changed.name}"]`);
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
    const mine = myAvail();
    $('#my-avail').innerHTML = ui.view === 'profile' ? '' : availPicker('me', ['Завтай өдөр', 'Завтай цаг']);
    $('#active-filters').hidden = !ui.category && !ui.district && !hasAvail(mine);
    $('#active-filters').innerHTML = `${ui.category ? `<span class="filter-chip">${escape(categories[ui.category])}</span>` : ''}${ui.district ? `<span class="filter-chip">${escape(ui.district)}</span>` : ''}${hasAvail(mine) ? `<span class="filter-chip">${icon('clock')}${mine.dates.length ? rangesText(mine.dates) : 'Өдөр хамаагүй'} · ${hoursText(mine.from, mine.to)}</span>` : ''}<button class="text-button" data-action="clear-filters">Шүүлт арилгах</button>`;
    $('#job-list').innerHTML = jobs.length ? jobs.slice(0, ui.limit).map(jobRow).join('') : empty(ui.savedOnly ? 'Хадгалсан ажил алга' : 'Энэ шүүлтээр зар олдсонгүй', ui.savedOnly ? 'Сонирхсон ажлынхаа “Хадгалах” товчийг дараарай. Шүүлт сонгосон бол арилгаж үзээрэй.' : (hasAvail(myAvail()) ? 'Таны завтай өдөр, цагт багтах зар алга. Өөр өдөр, цаг нэмж үзээрэй.' : 'Ажлын төрөл эсвэл дүүргээ өөрчилж үзээрэй. Бүх зар нь туршилтын жишээ мэдээлэл.'), ui.savedOnly ? 'Бүх зарыг харах' : 'Шүүлт арилгах', 'reset-filters', 'bookmark');
    $('#load-more-wrap').hidden = !jobs.length;
    $('#load-more').hidden = ui.limit >= jobs.length;
    $('#visible-count').textContent = `${jobs.length} жишээ зараас ${Math.min(ui.limit, jobs.length)}-ыг харуулж байна`;
    $('#greeting-name').textContent = state.profile.name ? ' ' + state.profile.name : '';
    $('#greeting-name').hidden = !state.profile.name;
  }

  function renderApplications() {
    $('#invite-inbox').hidden = !inbox.length;
    $('#invite-inbox').innerHTML = inbox.length ? `<h2 class="inbox-title">Ирсэн урилга <span class="nav-count">${inbox.length}</span></h2>` + inbox.map((item) => {
      const job = item.job, days = job.endDate && validDate(job.endDate) ? `${fullDate(job.date)} – ${fullDate(job.endDate)}` : validDate(job.date) ? `${fullDate(job.date)} · ${weekday(job.date)}` : '';
      return `<article class="invite-card"><div class="invite-card-head"><strong>${escape(job.title)}</strong><span class="small muted">${escape(item.employerName || 'Ажил олгогч')} · ${escape(job.company)}</span></div><p class="invite-card-meta"><span>${icon('calendar')}${escape(days)}</span><span>${icon('clock')}${escape(job.start)} – ${escape(job.end)}</span><span>${icon('pin')}${escape(job.district)}</span><span>${money(Number(job.pay) || 0)} / цаг</span></p><p class="invite-card-message">${escape(item.message)}</p><p class="small muted">${new Date(item.createdAt).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}-нд ирсэн</p></article>`;
    }).join('') : '';
    const apps = [...state.applications].sort((a, b) => b.createdAt - a.createdAt);
    const pending = apps.filter((app) => ['received', 'reviewing'].includes(app.status)).length;
    const accepted = apps.filter((app) => app.status === 'accepted').length;
    $('#applications-summary').innerHTML = [['Нийт хүсэлт', apps.length], ['Хариу хүлээж буй', pending], ['Сонгосон', accepted]].map(([label, count]) => `<div class="summary-item"><strong>${count}</strong><span>${label}</span></div>`).join('');
    $('#applications-list').innerHTML = apps.length ? apps.map((app) => {
      const job = app.snapshot;
      return `<article class="application-row"><div><h3>${escape(job.title)}</h3>${badge(app.status)}<p class="muted">${escape(job.company)} · Жишээ байгууллага</p></div><div><p>${whenLabel(job)}<br>${timeLabel(job)} · ${escape(job.district)}</p><p class="muted">${money(job.pay)} / цаг · ${new Date(app.createdAt).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}-нд хүсэлт илгээсэн</p></div><div class="application-actions"><button class="button button-outline" data-action="application-detail" data-id="${escape(app.id)}">Дэлгэрэнгүй${icon('arrow')}</button>${['received', 'reviewing', 'accepted'].includes(app.status) ? `<button class="text-button" data-action="withdraw" data-id="${escape(app.id)}">Цуцлах</button>` : ''}</div></article>`;
    }).join('') : empty('Эхний ээлжээ олоорой', 'Сонирхсон ажилдаа туршилтын хүсэлт илгээхэд явц нь энд харагдана.', 'Ажил хайх', 'browse', 'calendar');
  }

  function renderEmployer() {
    $('#employer-job-count').textContent = state.jobs.length;
    $('#employer-application-count').textContent = state.applications.filter((app) => app.status !== 'withdrawn').length;
    $('#employer-seekers-count').textContent = allSeekers().length;
    for (const tab of employerTabs) { const selected = ui.employerTab === tab; $(`#employer-${tab}-tab`).setAttribute('aria-selected', String(selected)); $(`#employer-${tab}-tab`).tabIndex = selected ? 0 : -1; }
    $('#employer-panel').setAttribute('aria-labelledby', `employer-${ui.employerTab}-tab`);
    if (ui.employerTab === 'jobs') {
      $('#employer-panel').innerHTML = [...state.jobs].sort((a, b) => b.createdAt - a.createdAt).map((job) => {
        const count = state.applications.filter((app) => app.jobId === job.id && app.status !== 'withdrawn').length;
        return `<article class="employer-job"><div>${badge(availability(job))}<h3>${escape(job.title)}</h3><p class="small muted">${escape(job.company)} · ${escape(job.district)}</p></div><div><p>${whenLabel(job)} · ${timeLabel(job)}</p><p class="small muted">${money(job.pay)} / цаг · ${acceptedCount(job.id)}/${job.openings} орон тоо сонгосон</p></div><div class="management-actions"><button class="button button-soft" data-action="job-applicants" data-id="${escape(job.id)}">${count} хүсэлт</button><button class="button button-outline" data-action="edit-job" data-id="${escape(job.id)}">${icon('edit')}Засах</button><button class="button button-outline" data-action="pause-job" data-id="${escape(job.id)}">${icon(job.status === 'paused' ? 'arrow' : 'pause')}${job.status === 'paused' ? 'Нээх' : 'Зогсоох'}</button></div></article>`;
      }).join('');
    } else if (ui.employerTab === 'seekers') {
      const job = jobById(ui.seekJob);
      const openJobs = state.jobs.filter((item) => availability(item) === 'active');
      const list = seekerPool(true);
      $('#employer-panel').innerHTML = `<div class="seek-tools"><label class="applicant-filter">Зарт тааруулах<select id="seek-job"><option value="">Бүх ажил хайгч</option>${openJobs.map((item) => `<option value="${escape(item.id)}" ${ui.seekJob === item.id ? 'selected' : ''}>${escape(item.title)} · ${dayRange(item)}</option>`).join('')}</select></label><label class="applicant-filter">Дүүрэг<select id="seek-district"><option value="">Бүх дүүрэг</option>${districts.map((name) => `<option ${ui.seekDistrict === name ? 'selected' : ''}>${escape(name)}</option>`).join('')}</select></label></div><div class="seek-picker">${availPicker('seek', ['Хэрэгтэй өдөр', 'Хэрэгтэй цаг'])}</div><div class="seek-summary"><span><strong>${list.length}</strong> ажил хайгч таарч байна${job ? ` · ${escape(job.title)}: ${whenLabel(job)}, ${timeLabel(job)}` : ''}</span><button class="button button-quiet" data-action="picked-only" aria-pressed="${ui.pickedOnly}">${icon('check')}Урьсан <span>${invitedIds().size}</span></button></div>` + (list.length ? list.slice(0, ui.seekLimit).map((person) => {
        const fits = openJobs.filter((item) => fitsJob(item, person));
        const sent = invitesFor(person.id).map((item) => jobById(item.jobId)).filter(Boolean), picked = sent.length > 0;
        return `<article class="seeker-row${picked ? ' is-picked' : ''}"><div class="seeker-who"><span class="seeker-avatar" aria-hidden="true">${escape(person.name.slice(0, 1))}</span><div><h3>${escape(person.name)}${person.id === state.userId ? ' <small class="muted">(та)</small>' : ''}</h3><p class="small muted">${seekerSchool(person)}</p>${person.real ? `<p class="seeker-real">${icon('check')}Бүртгэлтэй ажил горилогч</p>` : `<p class="applicant-contact">${escape(person.contact)} · жишээ</p>`}</div></div><div class="seeker-when">${seekerWhen(person)}<strong>${hoursText(person.from, person.to)}</strong>${person.district || person.likes.length ? `<p class="small muted">${person.district ? `${icon('pin')}${escape(person.district)}` : ''}${person.district && person.likes.length ? ' · ' : ''}${person.likes.map((key) => escape(categories[key])).join(', ')}</p>` : ''}</div><div class="seeker-about"><p class="applicant-note">${escape(person.bio || 'Танилцуулга бичээгүй.')}</p><p class="seeker-fit">${fits.length ? `Таны ${fits.length} зарт таарна: ${fits.slice(0, 2).map((item) => escape(item.title)).join(', ')}${fits.length > 2 ? '…' : ''}` : 'Одоогийн заруудын цагт таарахгүй'}</p>${picked ? `<p class="seeker-invited">${icon('check')}Мэдэгдэл илгээсэн: ${sent.map((item) => escape(item.title)).join(', ')}</p>` : ''}</div><div class="seeker-actions"><button class="button ${picked ? 'button-soft' : 'button-dark'}" data-action="pick-seeker" data-id="${escape(person.id)}" aria-haspopup="dialog">${picked ? `${icon('check')}Урьсан` : `Сонгох${icon('plus')}`}</button></div></article>`;
      }).join('') + (list.length > ui.seekLimit ? `<div class="load-more-wrap seek-more"><button class="button button-outline" data-action="seek-more">Бусад ажил хайгчийг харах${icon('down')}</button><p class="small muted">${list.length}-аас ${ui.seekLimit}-ыг харуулж байна</p></div>` : '') : empty('Энэ хуваарьт таарах хүн алга', 'Өдөр, цагаа багасгаж эсвэл өөр зар сонгож үзээрэй.', 'Шүүлт арилгах', 'seek-reset', 'user'));
    } else {
      const apps = [...state.applications].filter((app) => !ui.applicantJob || app.jobId === ui.applicantJob).sort((a, b) => b.createdAt - a.createdAt);
      $('#employer-panel').innerHTML = `<label class="applicant-filter">Зараар шүүх<select id="applicant-job-filter"><option value="">Бүх зар</option>${state.jobs.map((job) => `<option value="${escape(job.id)}" ${ui.applicantJob === job.id ? 'selected' : ''}>${escape(job.title)}</option>`).join('')}</select></label>` + (apps.length ? apps.map((app) => `<article class="applicant-row"><div><h3>${escape(app.name)}</h3><p class="applicant-contact">${escape(app.contact)}</p><p class="small muted">${new Date(app.createdAt).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })} · Туршилтын хүсэлт</p>${app.availability ? `<div class="avail-line">${availSummary(app.availability)}</div>` : ''}</div><div><strong>${escape(app.snapshot.title)}</strong><p class="small muted">${whenLabel(app.snapshot)} · ${timeLabel(app.snapshot)}</p><p class="applicant-note">${escape(app.note || 'Нэмэлт танилцуулга бичээгүй.')}</p></div><label class="status-control">Хүсэлтийн төлөв<select data-application="${escape(app.id)}" ${app.status === 'withdrawn' ? 'disabled' : ''}>${Object.entries(statusNames).filter(([key]) => key !== 'withdrawn' || app.status === 'withdrawn').map(([key, label]) => `<option value="${key}" ${app.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select><span>Ажил горилогчийн хэсэгт мөн харагдана.</span></label></article>`).join('') : empty('Хүсэлт хараахан ирээгүй', 'Ажил горилогчийн самбараас жишээ ажилд хүсэлт илгээгээд энд буцаж ирээрэй.', 'Ажил горилогчийн самбар руу', 'student', 'user'));
    }
  }

  const employerTabs = ['jobs', 'seekers', 'applications'];
  function renderAll() { renderBrowse(); renderApplications(); renderEmployer(); renderHeader(); renderLanding(); renderProfile(); showStorageMessage(); }
  const roleNames = { student: 'Ажил горилогч', employer: 'Ажил олгогч' };
  // Profile page: own details plus the same "me" availability the job search uses.
  // The "me" picker renders in one place at a time (here or the jobs hero) so ids never clash.
  function renderProfile() {
    if (ui.view !== 'profile' || !state.signedIn) { $('#profile-avail').innerHTML = ''; return; }
    const name = state.profile.name || 'Зочин', employer = state.role === 'employer', mine = myAvail();
    const sent = state.applications.filter((app) => app.status !== 'withdrawn').length;
    const saved = state.saved.filter((id) => jobById(id)).length;
    $('#profile-info').innerHTML = `<div class="profile-id"><span class="avatar avatar-xl" aria-hidden="true">${escape(name.trim().charAt(0).toUpperCase())}</span><div><h2>${escape(name)}</h2><p>${escape(state.profile.contact)}</p><div class="profile-chips"><span class="role-chip" data-role="${state.role}">${roleNames[state.role]}</span>${ui.verified ? `<span class="badge badge-accepted">${icon('check')}И-мэйл баталгаажсан</span>` : '<span class="badge badge-received">И-мэйл баталгаажаагүй</span>'}</div></div></div>
      <dl class="profile-stats"><div><dt>Илгээсэн хүсэлт</dt><dd>${sent}</dd></div><div><dt>Хадгалсан ажил</dt><dd>${saved}</dd></div><div><dt>Завтай өдөр</dt><dd>${mine.dates.length}</dd></div></dl>
      <div class="profile-actions">${ui.verified ? '' : `<button class="button button-outline" data-action="verify-email">${icon('check')}И-мэйл баталгаажуулах</button>`}${ui.hasPassword ? `<button class="button button-outline" data-action="change-password">${icon('edit')}Нууц үг солих</button>` : ''}<button class="button button-outline" data-action="${employer ? 'student' : 'employer'}">${icon('swap')}${employer ? 'Ажил горилогч болох' : 'Ажил олгогч болох'}</button></div>`;
    $('#profile-avail-card').hidden = employer;
    $('#profile-listing').hidden = employer;
    if (employer) { $('#profile-avail').innerHTML = ''; return; }
    const listed = state.profile.listed !== false, upcoming = mine.dates.filter((date) => date >= today()).length;
    $('#profile-listing').innerHTML = `<div class="profile-card-head"><h2>Ажил олгогчид харагдах</h2><p class="muted small">Завтай өдөр сонгосон үед таны нэр, өдөр, цаг, дүүрэг, сургууль, танилцуулга бүртгэлтэй ажил олгогчдод харагдаж, тэд танд ажлын урилга илгээх боломжтой. И-мэйл, утас харагдахгүй.</p></div>
      <form id="listing-form"><label class="check-field"><input type="checkbox" name="listed" ${listed ? 'checked' : ''}>Ажил олгогчдод харагдах</label>
      <div class="form-grid"><label class="field">Дүүрэг<select name="district"><option value="">Сонгоогүй</option>${districts.map((name) => `<option ${state.profile.district === name ? 'selected' : ''}>${escape(name)}</option>`).join('')}</select></label><label class="field">Сургууль, мэргэжил<input name="school" maxlength="80" autocomplete="organization" placeholder="Жишээ: МУИС эсвэл тогооч" value="${escape(state.profile.school || '')}"></label><label class="field field-full">Товч танилцуулга<textarea name="bio" maxlength="300" rows="3" placeholder="Ямар ажил сонирхдог, ямар туршлагатай вэ?">${escape(state.profile.bio || '')}</textarea></label></div>
      <div class="listing-foot"><p class="small">${!listed ? 'Ажил олгогчдод харагдахгүй байна.' : upcoming ? `${icon('check')}Ажил олгогчдод харагдаж байна · ${upcoming} өдөр` : 'Завтай өдөр сонгоход ажил олгогчдод харагдана.'}</p><button class="button button-dark" type="submit">Хадгалах</button></div></form>`;
    const open = ui.availOpen.me; ui.availOpen.me = true;
    $('#profile-avail').innerHTML = availPicker('me', ['Сонгосон өдрүүд', 'Завтай цаг']);
    ui.availOpen.me = open;
    // Live preview: how employers see this availability in their "Ажил хайгчид" list.
    const fitting = state.jobs.filter((job) => availability(job) === 'active' && fitsSome(job, mine)).length;
    const weekdaysPicked = [...new Set(mine.dates.map(wdOf))];
    $('#profile-avail-foot').innerHTML = `<div class="avail-preview" aria-live="polite"><p class="avail-preview-label">${icon('user')}Урьдчилан харах · ажил олгогчид таныг ингэж харна</p>${hasAvail(mine) ? `<article class="seeker-row preview-row"><div class="seeker-who"><span class="seeker-avatar" aria-hidden="true">${escape(name.trim().charAt(0).toUpperCase())}</span><div><h3>${escape(name)}</h3><p class="small muted">${escape(state.profile.school || 'Ажил горилогч')}${state.profile.district ? ` · ${escape(state.profile.district)}` : ''}</p></div></div><div class="seeker-when">${weekdaysPicked.length ? weekStrip(weekdaysPicked) : '<span class="small muted">Өдөр хамаагүй</span>'}<strong>${icon('clock')}${hoursText(mine.from, mine.to)}</strong></div></article>${mine.dates.length ? `<ul class="preview-dates" aria-label="Сонгосон өдрүүд">${mine.dates.map((date) => `<li><b>${shortDate(date)}</b>${weekday(date)}</li>`).join('')}</ul>` : ''}<p class="preview-fit">${fitting ? `${icon('check')}Таны хуваарьт ${fitting} зар таарч байна` : 'Одоогоор таны хуваарьт таарах зар алга'}</p>` : '<p class="preview-empty">Календараас өдрөө сонгоход энд шууд харагдана.</p>'}</div>`;
  }
  function renderHeader() {
    const signedIn = state.signedIn;
    $('#public-header').hidden = signedIn;
    $('#app-header').hidden = !signedIn;
    $('#footer-faq').hidden = !signedIn;
    if (!signedIn) { setMenu(false); return; }
    const employer = state.role === 'employer';
    const name = state.profile.name || 'Зочин';
    const sent = state.applications.filter((app) => app.status !== 'withdrawn').length;
    const waiting = state.applications.filter((app) => app.status === 'received').length;
    const links = employer
      ? [['employer', 'Самбар', waiting], ['jobs', 'Зарууд харах', 0]]
      : [['jobs', 'Ажлын зарууд', 0], ['applications', 'Миний хүсэлтүүд', sent], ['guide', 'Зөвлөмж', 0]];
    $('#app-nav').innerHTML = links.map(([view, label, count]) => `<a href="#${view}" data-nav="${view}"${ui.view === view ? ' aria-current="page"' : ''}>${label}${count ? `<span class="nav-count">${count}</span>` : ''}</a>`).join('');
    $('#role-chip').textContent = roleNames[state.role];
    $('#role-chip').dataset.role = state.role;
    $('#user-avatar').textContent = name.trim().charAt(0).toUpperCase();
    $('#user-name').textContent = name;
    $('#user-role').textContent = roleNames[state.role];
    $('#user-button').setAttribute('aria-label', `${name} · ${roleNames[state.role]} — профайл цэс`);
    $('#user-dropdown').innerHTML = `<a class="menu-item menu-head" href="#profile" title="Миний профайл"><span class="avatar avatar-lg" aria-hidden="true">${escape(name.trim().charAt(0).toUpperCase())}</span><div><strong>${escape(name)}</strong><small>${escape(state.profile.contact || roleNames[state.role])}</small><span class="menu-head-link">Профайл харах</span></div>${icon('chevron')}</a>
      <div class="menu-group">${employer ? `<a class="menu-item" href="#employer">${icon('pay')}Ажил олгогчийн самбар</a>` : `<a class="menu-item" href="#applications">${icon('clock')}Миний хүсэлтүүд${sent ? `<span class="nav-count">${sent}</span>` : ''}</a><button class="menu-item" data-action="saved-menu">${icon('bookmark')}Хадгалсан ажлууд</button>`}
      <button class="menu-item" data-action="${employer ? 'student' : 'employer'}">${icon('swap')}${employer ? 'Ажил горилогч болох' : 'Ажил олгогч болох'}</button></div>
      <div class="menu-group">${ui.verified ? '' : `<button class="menu-item menu-warn" data-action="verify-email">${icon('check')}И-мэйл баталгаажуулах</button>`}${ui.hasPassword ? `<button class="menu-item" data-action="change-password">${icon('edit')}Нууц үг солих</button>` : ''}</div>
      <div class="menu-group"><button class="menu-item menu-danger" data-action="signout">${icon('logout')}Гарах</button></div>`;
  }
  function setMenu(open, focusButton = false) {
    ui.menuOpen = open;
    $('#user-dropdown').hidden = !open;
    $('#user-button').setAttribute('aria-expanded', String(open));
    if (open) $('#user-dropdown .menu-item')?.focus();
    else if (focusButton) $('#user-button').focus();
  }
  function renderLanding() {
    const open = state.jobs.filter((job) => availability(job) === 'active').sort((a, b) => b.createdAt - a.createdAt);
    const avg = open.length ? Math.round(open.reduce((sum, job) => sum + job.pay, 0) / open.length / 100) * 100 : 0;
    $('#landing-stats').innerHTML = `<div><dt>Нээлттэй ээлж</dt><dd>${open.length}</dd></div><div><dt>Дундаж цагийн хөлс</dt><dd>${money(avg)}</dd></div><div><dt>Дүүрэг</dt><dd>${districts.length}</dd></div>`;
  }
  // Homepage showcase: three static cards that slide in left → right → left, exactly once per page load.
  // A card only ever gains `is-in`; nothing removes it, and the cards are static markup that no render touches.
  function setupShowcase() {
    const cards = [...document.querySelectorAll('.showcase-card')];
    if (!cards.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-on');
    let next = 0; let target = -1; let timer = 0;
    const step = () => {
      timer = 0;
      if (next > target) return;
      cards[next].classList.add('is-in');
      next += 1;
      if (next <= target) timer = setTimeout(step, 240);
      else if (next >= cards.length) observer.disconnect();
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { target = Math.max(target, cards.indexOf(entry.target)); observer.unobserve(entry.target); } });
      if (!timer && next <= target) step();
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    cards.forEach((card) => observer.observe(card));
  }
  function navigate(view) { closePanel(); setMenu(false); if (location.hash === '#' + view) route(); else location.hash = view; }
  function route() {
    const hash = location.hash.slice(1);
    setMenu(false);
    syncPalette();
    document.documentElement.dataset.page = state.signedIn ? 'app' : 'landing';
    syncFavicon();
    if (!state.signedIn) {
      ui.view = 'landing';
      $('#landing-view').hidden = false;
      ['#browse-view', '#applications-view', '#employer-view', '#profile-view'].forEach((id) => { $(id).hidden = true; });
      renderHeader();
      document.title = 'Ээлж — Хуваарьт тань таарах цагийн ажлууд';
      const target = hash && document.getElementById(hash);
      if (target && $('#landing-view').contains(target)) requestAnimationFrame(() => target.scrollIntoView());
      else window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const view = ['applications', 'employer', 'profile'].includes(hash) ? hash : 'jobs';
    const moved = ui.view !== view;
    ui.view = view;
    $('#landing-view').hidden = true;
    $('#browse-view').hidden = view !== 'jobs';
    $('#applications-view').hidden = view !== 'applications';
    $('#employer-view').hidden = view !== 'employer';
    $('#profile-view').hidden = view !== 'profile';
    if (moved) { renderBrowse(); renderProfile(); }
    if (view === 'employer' && ui.employerTab === 'seekers') loadSeekers();
    if (view === 'applications') loadInbox();
    renderHeader();
    document.title = `${view === 'applications' ? 'Миний хүсэлтүүд' : view === 'employer' ? 'Ажил олгогчийн самбар' : view === 'profile' ? 'Миний профайл' : 'Хуваарьт тань таарах цагийн ажлууд'} — Ээлж`;
    const scrollTarget = hash === 'guide' || hash === 'faq' ? hash : ui.scrollTo;
    ui.scrollTo = '';
    if (scrollTarget) requestAnimationFrame(() => document.getElementById(scrollTarget)?.scrollIntoView());
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function openSignIn(mode = 'signin', role = '', email = '') {
    ui.panelJob = null;
    const signup = mode === 'signup';
    const pick = role || state.role;
    const roleCard = (value, symbol, title, text) => `<label class="signin-role"><input type="radio" name="role" value="${value}" ${pick === value ? 'checked' : ''}><span>${icon(symbol)}<strong>${title}</strong><small>${text}</small></span></label>`;
    const password = `<label class="field field-full">Нууц үг<span class="password-field"><input name="password" type="password" required minlength="${signup ? 8 : 1}" maxlength="128" autocomplete="${signup ? 'new-password' : 'current-password'}"${signup ? ' aria-describedby="password-hint"' : ''}><button type="button" class="password-toggle" data-action="toggle-password" aria-pressed="false">Харах</button></span>${signup ? '<span class="field-hint" id="password-hint">8-аас доошгүй тэмдэгт.</span>' : ''}</label>${signup ? '' : '<p class="forgot-link"><button type="button" class="text-button" data-action="forgot-password">Нууц үгээ мартсан уу?</button></p>'}`;
    showPanel(`<h2 class="panel-heading" id="panel-title">${signup ? 'Ээлжид бүртгүүлэх' : 'Тавтай морил'}</h2><p class="panel-subtitle">${signup ? 'Хэдхэн секундэд бүртгэл үүсгээрэй.' : 'И-мэйл, нууц үгээрээ нэвтэрнэ үү.'}</p>
      <form id="signin-form" data-mode="${signup ? 'signup' : 'signin'}" novalidate>${signup ? `<fieldset class="signin-roles"><legend>Та хэн бэ?</legend>${roleCard('student', 'user', 'Ажил горилогч', 'Ажил хайх, хүсэлт илгээх')}${roleCard('employer', 'pay', 'Ажил олгогч', 'Зар нэмэх, ажилтан сонгох')}</fieldset>` : ''}
      <button type="button" class="button button-outline google-button" data-action="google-signin"><svg class="google-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Google-ээр ${signup ? 'бүртгүүлэх' : 'нэвтрэх'}</button>
      <p class="signin-divider"><span>эсвэл и-мэйлээр</span></p>
      <div class="form-grid">${signup ? '<label class="field field-full">Нэр<input name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="Жишээ: Бат"></label>' : ''}<label class="field field-full">И-мэйл<input name="email" type="email" required maxlength="100" autocomplete="email" inputmode="email" spellcheck="false" placeholder="Жишээ: bat@example.com" value="${escape(email)}"></label>${password}</div>
      <p id="signin-error" class="form-error" role="alert" hidden></p>
      <div class="form-actions"><button type="submit" class="button button-dark">${signup ? 'Бүртгүүлэх' : 'Нэвтрэх'}${icon('arrow')}</button></div>
      <p class="signin-switch">${signup ? `Бүртгэлтэй юу? <button type="button" class="text-button" data-action="signin" data-id="${pick}">Нэвтрэх</button>` : `Шинэ хэрэглэгч үү? <button type="button" class="text-button" data-action="signup" data-id="${pick}">Бүртгүүлэх</button>`}</p>
      </form>`, signup ? '#signin-form [name=name]' : email ? '#signin-form [name=password]' : '#signin-form [name=email]');
  }
  const authMessages = {
    'auth/email-already-in-use': 'Энэ и-мэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү.',
    'auth/invalid-email': 'Зөв и-мэйл хаяг бичээрэй.',
    'auth/missing-email': 'И-мэйлээ бичээрэй.',
    'auth/weak-password': 'Нууц үг 8-аас доошгүй тэмдэгттэй байна.',
    'auth/invalid-credential': 'И-мэйл эсвэл нууц үг буруу байна.',
    'auth/invalid-login-credentials': 'И-мэйл эсвэл нууц үг буруу байна.',
    'auth/wrong-password': 'И-мэйл эсвэл нууц үг буруу байна.',
    'auth/user-not-found': 'И-мэйл эсвэл нууц үг буруу байна.',
    'auth/user-disabled': 'Энэ бүртгэлийг идэвхгүй болгосон байна.',
    'auth/too-many-requests': 'Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.',
    'auth/network-request-failed': 'Интернэт холболтоо шалгаад дахин оролдоно уу.',
    'auth/popup-blocked': 'Хөтөч Google цонхыг хаасан байна. Pop-up зөвшөөрөөд дахин оролдоно уу.',
    'auth/operation-not-allowed': 'Энэ нэвтрэх арга одоогоор идэвхжээгүй байна.',
    'auth/unauthorized-domain': 'Энэ хаягаас Google-ээр нэвтрэх зөвшөөрөлгүй байна.',
    'auth/account-exists-with-different-credential': 'Энэ и-мэйл өөр аргаар бүртгэгдсэн байна. И-мэйл, нууц үгээрээ нэвтэрнэ үү.',
    'eelj/not-configured': 'Нэвтрэх систем одоогоор тохируулагдаагүй байна.'
  };
  const authMessage = (error) => authMessages[error?.code] || 'Алдаа гарлаа. Дахин оролдоно уу.';
  // Called by Firebase on load and whenever the session changes, including in other tabs.
  function syncUser(user) {
    ui.verified = Boolean(user?.emailVerified);
    ui.hasPassword = Boolean(user?.providerData?.some((item) => item.providerId === 'password'));
    if (!user) { if (state.signedIn) clearSession(); return; }
    const arriving = !state.signedIn || state.userId !== user.uid;
    if (ui.pendingRole) { state.roles[user.uid] = ui.pendingRole; ui.pendingRole = ''; }
    state.userId = user.uid; state.signedIn = true;
    state.role = state.roles[user.uid] || state.role;
    Object.assign(state.profile, { name: user.displayName || user.email.split('@')[0], contact: user.email });
    persist(); renderAll();
    if (arriving) { navigate(state.role === 'employer' ? 'employer' : 'jobs'); loadInbox(); publishAvailability(); }
  }
  async function submitSignIn(form) {
    const data = new FormData(form);
    const signup = form.dataset.mode === 'signup';
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));
    const button = form.querySelector('[type=submit]');
    $('#signin-error').hidden = true;
    if (signup) {
      const name = String(data.get('name')).trim();
      if (name.length < 2) return formError('signin-error', 'Нэрээ 2-оос доошгүй тэмдэгтээр бичээрэй.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return formError('signin-error', 'Зөв и-мэйл хаяг бичээрэй.');
      if (password.length < 8) return formError('signin-error', 'Нууц үг 8-аас доошгүй тэмдэгттэй байна.');
      button.disabled = true;
      try {
        const { auth, fb } = await firebaseAuth();
        ui.pendingRole = data.get('role') === 'employer' ? 'employer' : 'student';
        const { user } = await fb.createUserWithEmailAndPassword(auth, email, password);
        await fb.updateProfile(user, { displayName: name });
        syncUser(user);
        fb.sendEmailVerification(user).catch(() => {});
        toast(`Бүртгэл үүслээ. ${user.email} руу баталгаажуулах холбоос илгээлээ.`);
      } catch (error) { ui.pendingRole = ''; button.disabled = false; formError('signin-error', authMessage(error)); }
      return;
    }
    if (!email || !password) return formError('signin-error', 'И-мэйл, нууц үгээ бичээрэй.');
    button.disabled = true;
    try {
      const { auth, fb } = await firebaseAuth();
      const { user } = await fb.signInWithEmailAndPassword(auth, email, password);
      syncUser(user);
      toast(`Тавтай морил, ${state.profile.name}!`);
    } catch (error) { button.disabled = false; formError('signin-error', authMessage(error)); }
  }
  async function googleSignIn(button) {
    const form = button.closest('form');
    $('#signin-error').hidden = true;
    button.disabled = true;
    try {
      const { auth, fb } = await firebaseAuth();
      // The role cards only exist on the sign-up form; returning users keep their saved role.
      const role = form.querySelector('[name=role]:checked')?.value;
      if (role) ui.pendingRole = role === 'employer' ? 'employer' : 'student';
      const { user } = await fb.signInWithPopup(auth, new fb.GoogleAuthProvider());
      syncUser(user);
      toast(`Тавтай морил, ${state.profile.name}!`);
    } catch (error) {
      ui.pendingRole = ''; button.disabled = false;
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') formError('signin-error', authMessage(error));
    }
  }
  function openReset(email = '') {
    ui.panelJob = null;
    showPanel(`<button class="back-link text-button" data-action="signin">${icon('back')}Нэвтрэх</button><h2 class="panel-heading" id="panel-title">Нууц үг сэргээх</h2><p class="panel-subtitle">Бүртгэлтэй и-мэйлээ оруулбал нууц үг шинэчлэх холбоос илгээнэ.</p>
      <form id="reset-form" novalidate><div class="form-grid"><label class="field field-full">И-мэйл<input name="email" type="email" required maxlength="100" autocomplete="email" inputmode="email" spellcheck="false" value="${escape(email)}"></label></div>
      <p id="reset-error" class="form-error" role="alert" hidden></p>
      <div class="form-actions"><button type="submit" class="button button-dark">Холбоос илгээх${icon('arrow')}</button></div></form>`, '#reset-form [name=email]');
  }
  async function submitReset(form) {
    const email = String(new FormData(form).get('email')).trim();
    const button = form.querySelector('[type=submit]');
    $('#reset-error').hidden = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return formError('reset-error', 'Зөв и-мэйл хаяг бичээрэй.');
    button.disabled = true;
    try {
      const { auth, fb } = await firebaseAuth();
      await fb.sendPasswordResetEmail(auth, email);
      // Same message whether or not the account exists, so the form does not reveal registered emails.
      showPanel(`<h2 class="panel-heading" id="panel-title">И-мэйлээ шалгана уу</h2><p class="panel-subtitle">Хэрэв <strong>${escape(email)}</strong> хаягаар бүртгэл байгаа бол нууц үг шинэчлэх холбоос илгээлээ. Spam хавтсаа ч шалгаарай.</p><div class="form-actions"><button class="button button-dark" data-action="signin" data-email="${escape(email)}">Нэвтрэх${icon('arrow')}</button></div>`);
    } catch (error) { button.disabled = false; formError('reset-error', authMessage(error)); }
  }
  async function accountEmail(kind) {
    try {
      const { auth, fb } = await firebaseAuth();
      const user = auth.currentUser; if (!user) return;
      if (kind === 'verify') {
        await user.reload();
        if (user.emailVerified) { syncUser(user); return toast('И-мэйл баталгаажсан байна.'); }
        await fb.sendEmailVerification(user);
        toast(`${user.email} руу баталгаажуулах холбоос илгээлээ.`);
      } else {
        await fb.sendPasswordResetEmail(auth, user.email);
        toast(`${user.email} руу нууц үг солих холбоос илгээлээ.`);
      }
    } catch (error) { toast(authMessage(error)); }
  }
  function signOut() {
    firebaseAuth().then(({ auth, fb }) => fb.signOut(auth)).catch(() => {});
    clearSession();
    toast('Системээс гарлаа.');
  }
  function clearSession() {
    state.signedIn = false; state.userId = ''; ui.savedOnly = false; ui.verified = false;
    Object.assign(state.profile, { name: '', contact: '' });
    persist(); closePanel();
    history.pushState(null, '', location.pathname + location.search);
    renderAll(); route();
  }
  function showPanel(content, focus) {
    $('#toast').hidden = true;
    $('#panel').classList.remove('job-detail-dialog');
    $('#panel-content').innerHTML = content;
    if (!$('#panel').open) $('#panel').showModal();
    $('#panel').scrollTop = 0;
    if (focus) requestAnimationFrame(() => $(focus)?.focus({ preventScroll: true }));
  }
  function closePanel() { ui.inviteFor = ''; ui.inviteMessage = ''; if ($('#panel').open) $('#panel').close(); document.body.appendChild($('#toast')); ui.panelJob = null; }
  function openAccount() {
    ui.panelJob = null;
    showPanel(`<h2 class="panel-heading" id="panel-title">Өөрийн горимоо сонго</h2><p class="panel-subtitle">Бүртгэл үүсгэхгүйгээр хоёр талын үйл явцыг туршаарай.</p><div class="role-options"><button class="role-option" data-action="student"><span class="role-icon">${icon('user')}</span><div><strong>Ажил горилогч</strong><p>Ажил хайх, хадгалах, хүсэлт илгээх.</p></div>${icon('arrow')}</button><button class="role-option" data-action="employer"><span class="role-icon">${icon('pay')}</span><div><strong>Ажил олгогч</strong><p>Зар нэмэх, хүсэлтүүдийг удирдах.</p></div>${icon('arrow')}</button></div><p class="local-note">Хоёр горим энэ хөтөч дээрх ижил өгөгдлийг ашиглана. Бодит бүртгэл, байгууллага руу мэдээлэл илгээх үйлдэл байхгүй.</p>`);
  }
  function openJob(id) {
    const job = jobById(id); if (!job) return toast('Энэ зар олдсонгүй.');
    ui.panelJob = id;
    const app = applicationFor(id);
    const available = availability(job) === 'active';
    showPanel(`<div class="detail-company">${escape(job.company)} <span class="badge">Жишээ байгууллага</span></div><h2 id="panel-title" class="panel-heading">${escape(job.title)}</h2><p class="panel-subtitle">${escape(categories[job.category])} · ${placesLeft(job)} сул орон тоо</p><div class="detail-pay"><div><span>Цагийн хөлс</span><strong>${money(job.pay)} <small>/ цаг</small></strong></div><div class="total-pay">${job.endDate ? `${daysOf(job).length} өдөр · ${totalHours(job)} цаг` : `${hours(job)} цагийн ээлж`}<strong>${money(Math.round(job.pay * totalHours(job)))}</strong></div></div>${mealOf(job) ? `<p class="detail-perk detail-perk-${mealOf(job)}">${icon('meal')}<span><strong>${meals[mealOf(job)][1]}${mealOf(job) === 'allowance' && job.mealAllowance ? ` · <b class="perk-amount">${money(job.mealAllowance)}</b>` : ''}</strong>${mealOf(job) === 'allowance' && job.mealAllowance ? `Ээлж бүрт ${money(job.mealAllowance)} хоолны мөнгө олгоно.` : meals[mealOf(job)][2]}</span></p>` : ''}<div class="detail-grid"><div>${icon('calendar')}<div><span>Ажлын өдөр</span><strong>${whenLabel(job)}</strong></div></div><div>${icon('clock')}<div><span>Ажлын цаг</span><strong>${timeLabel(job)}</strong><p>${job.schedule ? `Нийт ${totalHours(job)} цаг` : `${hours(job)} цагийн ээлж${job.endDate ? ' · өдөр бүр' : ''}`}</p></div></div><div>${icon('pin')}<div><span>Байршил</span><strong>${escape(job.district)}</strong><p>${escape(job.address)}</p></div></div><div>${icon('user')}<div><span>Орон тоо</span><strong>${placesLeft(job)} / ${job.openings} сул</strong><p>Жишээ зар</p></div></div></div>${job.schedule ? `<div class="detail-block"><h3>Өдрийн хуваарь</h3><ul class="day-schedule">${job.schedule.map((day) => `<li><span>${shortDate(day.date)} · ${weekday(day.date)}</span><strong>${day.start} – ${day.end}</strong></li>`).join('')}</ul></div>` : ''}<div class="detail-block"><h3>Ажлын тухай</h3><p>${escape(job.description)}</p></div><div class="detail-block"><h3>Хийх ажил</h3><p>${escape(job.duties)}</p></div><div class="detail-block"><h3>Тавигдах шаардлага</h3><ul>${job.requirements.split('\n').filter(Boolean).map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div><div class="detail-actions"><button class="button button-dark" data-action="${app ? 'my-applications' : 'apply'}" data-id="${escape(id)}" ${!app && !available ? 'disabled' : ''}>${app ? 'Илгээсэн хүсэлтээ харах' : available ? 'Өргөдөл гаргах' : 'Энэ зар хаалттай'}${icon(app ? 'check' : 'arrow')}</button>${saveButton(id, true)}</div><p class="local-note">Бүх мэдээлэл нь жишээ. Ээлжийн нийт хөлсийг цагийн хөлс × ажлын цагаар тооцов. Татвар, завсарлага, төлбөрийн нөхцөлийг энэ загварт тооцоогүй.</p>`);
    $('#panel').classList.add('job-detail-dialog');
  }
  function openApply(id) {
    const job = jobById(id);
    if (!job || availability(job) !== 'active') return toast('Энэ зар хүсэлт авах боломжгүй байна.');
    if (applicationFor(id)) return navigate('applications');
    ui.panelJob = id;
    showPanel(`<button class="back-link text-button" data-action="detail" data-id="${escape(id)}">${icon('back')}Зарын дэлгэрэнгүй</button><h2 id="panel-title" class="panel-heading">Хүсэлт илгээх</h2><p class="panel-subtitle">${escape(job.title)}<br>${whenLabel(job)} · ${timeLabel(job)}<br>${escape(job.district)} · ${money(job.pay)} / цаг</p><p class="form-intro">Жишээ нэр, холбоо барих мэдээлэл ашиглаарай. Хүсэлт зөвхөн энэ хөтөч дээр хадгалагдана.</p><form id="application-form" data-job-id="${escape(id)}"><div class="form-grid"><label class="field field-full">Таны нэр<input name="name" required minlength="2" maxlength="80" autocomplete="off" placeholder="Жишээ: Бат" value="${escape(state.profile.name)}"></label><label class="field field-full">Утас эсвэл и-мэйл<input name="contact" required maxlength="100" autocomplete="off" placeholder="Жишээ: bat@example.com" value="${escape(state.profile.contact)}"><span class="field-hint">8 оронтой утас эсвэл и-мэйл хаяг.</span></label>${hasAvail(myAvail()) ? `<div class="field field-full apply-avail"><span>Таны завтай цаг</span><div>${availSummary(myAvail())}</div><span class="field-hint">Ажил олгогч энэ хуваарийг таны хүсэлттэй хамт харна.</span></div>` : ''}<label class="field field-full">Товч танилцуулга <span class="field-hint">Заавал биш</span><textarea name="note" maxlength="600" rows="3" placeholder="Яагаад энэ ээлж танд тохирч байна вэ?"></textarea></label><label class="check-field"><input type="checkbox" name="consent" required>Энэ нь туршилтын хүсэлт бөгөөд байгууллага руу илгээгдэхгүйг ойлголоо.</label></div><p id="application-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button button-outline" data-action="detail" data-id="${escape(id)}">Буцах</button><button class="button button-dark" type="submit">Хүсэлт илгээх${icon('arrow')}</button></div></form>`, '#application-form input[name=name]');
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
    const app = { id: prior?.id || crypto.randomUUID(), jobId: job.id, name, contact, note: String(data.get('note')).trim(), status: 'received', createdAt: Date.now(), updatedAt: Date.now(), snapshot: { ...job }, ...(hasAvail(myAvail()) ? { availability: myAvail() } : {}) };
    if (prior) state.applications[state.applications.indexOf(prior)] = app; else state.applications.push(app);
    Object.assign(state.profile, { name, contact });
    persist(); renderAll();
    showPanel(`<div class="success-icon">${icon('check')}</div><h2 id="panel-title" class="panel-heading">Хүсэлт хадгалагдлаа</h2><p class="panel-subtitle">Туршилтын хүсэлтийн явцаа “Миний хүсэлтүүд” хэсгээс хянаарай.</p><div class="confirmation-details"><strong>${escape(job.title)}</strong><span>${whenLabel(job)}</span><span>${timeLabel(job)} · ${escape(job.district)}</span><span>${money(job.pay)} / цаг</span></div><button class="button button-dark" data-action="my-applications">Миний хүсэлтүүд${icon('arrow')}</button><p class="local-note">Ажил олгогчийн горимд шилжин энэ хүсэлтийг шалгаж, төлөвийг нь өөрчилж туршиж болно. Хүсэлт бодит байгууллага руу илгээгдээгүй.</p>`);
  }

  function openApplication(id) {
    const app = state.applications.find((item) => item.id === id); if (!app) return;
    const job = app.snapshot;
    const messages = { received: 'Туршилтын хүсэлт хүлээн авсан төлөвт байна. Ажил олгогчийн горимд шилжиж хариуг өөрчилж туршаарай.', reviewing: 'Ажил олгогчийн горимоос энэ хүсэлтийг шалгаж буй төлөвт оруулсан байна.', accepted: 'Таныг энэ жишээ ээлжид сонгосон төлөвтэй байна. Энэ нь бодит ажилд авсан шийдвэр биш.', declined: 'Ажил олгогчийн горимоос энэ хүсэлтэд татгалзсан төлөв оруулсан байна. Бусад жишээ ажилд хүсэлт илгээж болно.', withdrawn: 'Та энэ хүсэлтийг цуцалсан. Зар нээлттэй байвал дахин хүсэлт илгээж болно.' };
    showPanel(`<h2 id="panel-title" class="panel-heading">${escape(job.title)}</h2>${badge(app.status)}<p class="form-intro" style="margin-top:22px">${messages[app.status]}</p><div class="confirmation-details"><strong>Хүсэлт илгээх үеийн ээлж</strong><span>${whenLabel(job)} · ${timeLabel(job)}</span><span>${escape(job.district)} · ${money(job.pay)} / цаг</span><span>${escape(job.company)} · Жишээ байгууллага</span></div><div class="detail-block"><h3>Таны хүсэлт</h3><p>${escape(app.name)}<br>${escape(app.contact)}</p><p style="margin-top:12px">${escape(app.note || 'Нэмэлт танилцуулга бичээгүй.')}</p></div><div class="detail-actions"><button class="button button-dark" data-action="detail" data-id="${escape(job.id)}">Зарыг харах${icon('arrow')}</button>${['received', 'reviewing', 'accepted'].includes(app.status) ? `<button class="button button-outline" data-action="withdraw" data-id="${escape(app.id)}">Цуцлах</button>` : ''}</div><p class="local-note">Энэ мэдээлэл зөвхөн таны хөтөч дээр хадгалагдсан.</p>`);
  }
  function confirmWithdrawal(id) {
    const app = state.applications.find((item) => item.id === id); if (!app || !['received', 'reviewing', 'accepted'].includes(app.status)) return;
    showPanel(`<h2 id="panel-title" class="panel-heading">Хүсэлтээ цуцлах уу?</h2><p class="panel-subtitle">${escape(app.snapshot.title)}</p><p class="form-intro">Цуцалсан хүсэлт хоёр горимд ижил харагдана. Зар нээлттэй байвал дараа нь дахин хүсэлт илгээж болно.</p><div class="form-actions"><button class="button button-outline" data-action="application-detail" data-id="${escape(id)}">Буцах</button><button class="button button-dark" data-action="confirm-withdraw" data-id="${escape(id)}">Хүсэлт цуцлах</button></div>`);
  }

  const inviteText = (person) => `Сайн байна уу, ${person.name}! Таны завтай цаг манай ээлжид таарч байна. Ажиллах сонирхолтой бол хариу өгөөрэй.`;
  function openInvite(id, focusJob = '') {
    const person = seekerById(id); if (!person) return;
    ui.panelJob = null; ui.inviteFor = id;
    const sent = invitesFor(id), sentJobs = new Set(sent.map((item) => item.jobId));
    const open = state.jobs.filter((job) => availability(job) === 'active').sort((a, b) => fitsJob(b, person) - fitsJob(a, person) || a.date.localeCompare(b.date));
    const first = open.find((job) => !sentJobs.has(job.id) && (!focusJob || job.id === focusJob));
    showPanel(`<div class="invite-person"><span class="seeker-avatar" aria-hidden="true">${escape(person.name.slice(0, 1))}</span><div><h2 id="panel-title" class="panel-heading">${escape(person.name)}</h2><p class="panel-subtitle">Ажилд урих · ${seekerSchool(person)}${person.district ? ` · ${escape(person.district)}` : ''}</p></div></div><div class="invite-avail">${seekerWhen(person)}<strong>${hoursText(person.from, person.to)}</strong></div>${sent.length ? `<div class="detail-block"><h3>Илгээсэн мэдэгдэл</h3><ul class="invite-sent">${sent.map((item) => { const job = jobById(item.jobId); return `<li><span><strong>${escape(job.title)}</strong>${dayRange(job)} · ${timeLabel(job)}</span><button type="button" class="text-button" data-action="invite-cancel" data-id="${escape(item.id)}">Цуцлах</button></li>`; }).join('')}</ul></div>` : ''}<form id="invite-form" data-seeker="${escape(id)}"><fieldset class="invite-modes"><legend class="sr-only">Урих арга</legend><label class="invite-mode"><input type="radio" name="mode" value="existing" ${open.length ? 'checked' : 'disabled'}><span>${icon('check')}<strong>Идэвхтэй зараас сонгох</strong><small>${open.length} нээлттэй зар</small></span></label><label class="invite-mode"><input type="radio" name="mode" value="new" ${open.length ? '' : 'checked'}><span>${icon('plus')}<strong>Шинэ зар нэмэх</strong><small>Энэ хүний хуваарьт тааруулж үүсгэнэ</small></span></label></fieldset><div class="invite-jobs" role="radiogroup" aria-label="Зар сонгох" ${open.length ? '' : 'hidden'}>${open.map((job) => { const done = sentJobs.has(job.id), fit = fitsJob(job, person); return `<label class="invite-job${done ? ' is-done' : ''}"><input type="radio" name="jobId" value="${escape(job.id)}" ${done ? 'disabled' : job === first ? 'checked' : ''}><span class="invite-job-main"><strong>${escape(job.title)}</strong><small>${escape(job.company)} · ${escape(job.district)}</small></span><span class="invite-job-when"><b>${dayRange(job)}</b><small>${timeLabel(job)}</small></span>${done ? '<span class="invite-tag is-done">Урьсан</span>' : fit ? `<span class="invite-tag">${icon('check')}Хуваарьт таарна</span>` : '<span class="invite-tag is-off">Цаг зөрнө</span>'}</label>`; }).join('')}</div><label class="field field-full invite-message">Мэдэгдэл<textarea name="message" rows="3" maxlength="600">${escape(ui.inviteMessage || inviteText(person))}</textarea></label><p id="invite-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button button-outline" data-action="close">Болих</button><button class="button button-dark" type="submit" id="invite-submit">${open.length ? 'Мэдэгдэл илгээх' : 'Шинэ зар нэмэх'}${icon('arrow')}</button></div></form><p class="local-note">${person.real ? `Урилга ${escape(person.name)}-ийн бүртгэл рүү очно. Хариу өгөх боломжтой байхаар таны и-мэйл (${escape(state.profile.contact)}) урилгад хавсрагдана.` : 'Жишээ профайл тул бодит мэдэгдэл илгээгдэхгүй. Илгээсэн урилга энэ хөтөч дээр хадгалагдана.'}</p>`);
    $('#panel').classList.add('job-detail-dialog');
  }
  function sendInvite(person, job, message) {
    const invite = { id: crypto.randomUUID(), seekerId: person.id, jobId: job.id, message: message || inviteText(person), createdAt: Date.now(), ...(person.real ? { real: true } : {}) };
    state.invites.push(invite); ui.inviteMessage = '';
    persist(); renderAll();
    if (person.real) {
      const snapshot = { title: job.title, company: job.company, district: job.district, address: job.address, date: job.date, endDate: job.endDate || '', start: job.start, end: job.end, pay: job.pay };
      firestore().then(({ auth, fs, db }) => fs.addDoc(fs.collection(db, 'invites'), { employerId: auth.currentUser.uid, employerName: state.profile.name, seekerId: person.id, job: snapshot, message: `${invite.message}

Холбоо барих: ${state.profile.contact}`.slice(0, 600), createdAt: invite.createdAt }))
        .then((ref) => { invite.remoteId = ref.id; persist(); })
        .catch(() => toast('Урилгыг илгээж чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.'));
    }
    showPanel(`<div class="success-icon">${icon('check')}</div><h2 id="panel-title" class="panel-heading">Мэдэгдэл илгээгдлээ</h2><p class="panel-subtitle">${person.real ? `${escape(person.name)} урилгаа өөрийн бүртгэлээс харна.` : `${escape(person.name)} таны урилгыг хүлээн авлаа (жишээ).`}</p><div class="confirmation-details"><strong>${escape(job.title)}</strong><span>${whenLabel(job)}</span><span>${timeLabel(job)} · ${escape(job.district)}</span><span>${money(job.pay)} / цаг</span></div><blockquote class="invite-quote">${escape(invite.message)}</blockquote><div class="form-actions"><button class="button button-outline" data-action="pick-seeker" data-id="${escape(person.id)}">Өөр зарт урих</button><button class="button button-dark" data-action="close">Болсон${icon('check')}</button></div>${person.real ? '' : '<p class="local-note">Жишээ профайл тул бодит мэдэгдэл илгээгдээгүй.</p>'}`);
    toast(`Мэдэгдэл илгээлээ: ${person.name}`);
  }
  function submitInvite(form) {
    const person = seekerById(form.dataset.seeker); if (!person) return;
    const data = new FormData(form), message = String(data.get('message') || '').trim();
    if (data.get('mode') === 'new') {
      ui.inviteMessage = message;
      const date = (person.dates ? person.dates.find((d) => d > today()) : dayList(addDays(today(), 1), addDays(today(), 14)).find((d) => freeOn(person, d))) || addDays(today(), 1);
      const from = person.from || '10:00', end = Math.min(toMinutes(person.to || '20:00'), toMinutes(from) + 240);
      return openJobForm(undefined, { date, start: from, end: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`, district: person.district || '', category: person.likes[0] || '' });
    }
    const job = jobById(data.get('jobId'));
    if (!job || availability(job) !== 'active') return formError('invite-error', 'Урих зараа сонгоорой.');
    if (invitesFor(person.id).some((item) => item.jobId === job.id)) return formError('invite-error', 'Энэ зарт аль хэдийн урьсан байна.');
    sendInvite(person, job, message);
  }
  function openJobForm(id, prefill = {}) {
    const job = jobById(id);
    const base = job || { title: '', description: '', company: '', category: '', district: '', address: '', date: '', start: '10:00', end: '15:00', pay: 15000, openings: 2, duties: '', requirements: '', meal: 'none', ...prefill };
    const inviting = !job && seekerById(ui.inviteFor);
    const field = (label, name, type, value, extra = '', full = false) => `<label class="field ${full ? 'field-full' : ''}">${label}<input type="${type}" name="${name}" value="${escape(value)}" ${extra}></label>`;
    const select = (label, name, options, selected) => `<label class="field">${label}<select name="${name}" required><option value="">Сонгох</option>${options.map(([value, title]) => `<option value="${escape(value)}" ${value === selected ? 'selected' : ''}>${escape(title)}</option>`).join('')}</select></label>`;
    showPanel(`<h2 id="panel-title" class="panel-heading">${job ? 'Ажлын зар засах' : 'Шинэ ээлж нэмэх'}</h2><p class="panel-subtitle">Ажлын гол мэдээллээ оруулаарай. Зар жишээ мэдээлэл гэсэн тэмдэглэгээтэй харагдана.</p>${inviting ? `<p class="invite-banner">${icon('user')}<span>Зарыг хадгалмагц <strong>${escape(inviting.name)}</strong> руу мэдэгдэл илгээгдэнэ. Өдөр, цагийг нь түүний хуваарьт тааруулж бөглөсөн.</span></p>` : ''}<form id="job-form" data-job-id="${escape(job?.id || '')}"><div class="form-grid">${field('Ажлын нэр', 'title', 'text', base.title, 'required minlength="3" maxlength="80" placeholder="Жишээ: Эвентийн туслах"', true)}${field('Байгууллагын жишээ нэр', 'company', 'text', base.company, 'required maxlength="80" placeholder="Жишээ: Хотын эвент"', true)}${select('Ажлын төрөл', 'category', Object.entries(categories), base.category)}${select('Дүүрэг', 'district', districts.map((d) => [d, d]), base.district)}${field('Жишээ байршил', 'address', 'text', base.address, 'required maxlength="160" placeholder="Хороолол, ойрхон газрын нэр"', true)}${field('Ажлын өдөр', 'date', 'date', base.date, `required min="${today()}"`)}${field('Орон тоо', 'openings', 'number', base.openings, 'required min="1" max="100" step="1"')}<div class="field field-full multi-day"><label class="toggle-chip"><input type="checkbox" name="multiDay" ${base.endDate ? 'checked' : ''}>${icon('calendar')}Олон өдөр</label><input type="hidden" name="endDate" value="${escape(base.endDate || '')}" disabled><input type="hidden" name="workDays" value="${escape((base.workDays || []).join(','))}" disabled><div class="range-cal" hidden></div></div>${field('Эхлэх цаг', 'start', 'time', base.start, 'required')}${field('Дуусах цаг', 'end', 'time', base.end, 'required')}<div class="field field-full per-day" hidden><label class="toggle-chip"><input type="checkbox" name="perDay" ${base.schedule ? 'checked' : ''}>${icon('clock')}Өдөр бүр өөр хуваарьтай</label><div class="schedule-rows" hidden></div></div>${field('Цагийн хөлс (₮)', 'pay', 'number', base.pay, 'required min="1000" max="1000000" step="1"', true)}<fieldset class="field field-full chip-group"><legend>Нэмэлт нөхцөл</legend><div class="chip-row">${Object.entries(meals).map(([value, [label]]) => `<label class="toggle-chip"><input type="radio" name="meal" value="${value}" ${(mealOf(base) || 'none') === value ? 'checked' : ''}>${value === 'none' ? '' : icon('meal')}${label}</label>`).join('')}</div><label class="field meal-amount" ${mealOf(base) === 'allowance' ? '' : 'hidden'}>Хоолны мөнгөний дүн (₮)<input type="number" name="mealAllowance" min="500" max="200000" step="500" inputmode="numeric" placeholder="Жишээ: 10000" value="${escape(String(base.mealAllowance ?? ''))}" ${mealOf(base) === 'allowance' ? 'required' : 'disabled'}><span class="field-hint">Нэг ээлжид олгох хоолны мөнгө.</span></label></fieldset><label class="field field-full">Зарын товч тайлбар<textarea name="description" required minlength="8" maxlength="1200" rows="2" placeholder="Жагсаалтад харагдах товч тайлбар">${escape(base.description)}</textarea></label><label class="field field-full">Хийх ажлын дэлгэрэнгүй<textarea name="duties" required maxlength="1500" rows="3">${escape(base.duties)}</textarea></label><label class="field field-full">Шаардлага<textarea name="requirements" required maxlength="1000" rows="3" placeholder="Шаардлага бүрийг шинэ мөрөнд бичнэ">${escape(base.requirements)}</textarea><span class="field-hint">Ээлж тухайн өдөртөө дуусна. Одоо байгаа хүсэлтүүд анх илгээсэн үеийн мэдээллээ хадгална.</span></label></div><p id="job-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button button-outline" data-action="close">Болих</button><button class="button button-dark" type="submit">${job ? 'Өөрчлөлт хадгалах' : 'Жишээ зар нийтлэх'}${icon('arrow')}</button></div><p class="local-note">Зар зөвхөн энэ хөтөч дээр харагдана. Байгууллага болон цалин нь жишээ мэдээлэл байна.</p></form>`, '#job-form input[name=title]');
    ui.formSchedule = Object.fromEntries((base.schedule || []).map((day) => [day.date, day]));
    ui.calMonth = ((base.date && base.date >= today()) ? base.date : today()).slice(0, 7);
    ui.calRanges = base.endDate ? groupDays(daysOf(base)) : []; ui.calPending = ''; ui.calBreak = Boolean(base.workDays);
    syncJobForm($('#job-form'));
  }
  function syncJobForm(form) {
    const el = form.elements;
    const multi = el.multiDay.checked;
    el.date.closest('label').hidden = multi; el.date.required = !multi;
    el.endDate.disabled = !multi; el.workDays.disabled = !multi;
    if (!multi) { el.endDate.value = ''; el.workDays.value = ''; }
    form.querySelector('.range-cal').hidden = !multi;
    if (multi) renderRangeCal(form);
    form.querySelector('.per-day').hidden = !multi;
    const per = multi && el.perDay.checked;
    for (const name of ['start', 'end']) { el[name].closest('label').hidden = per; el[name].disabled = per; }
    const rows = form.querySelector('.schedule-rows');
    rows.querySelectorAll('input[type=time]').forEach((input) => { const date = input.name.slice(2); ui.formSchedule[date] = { ...(ui.formSchedule[date] || {}), date, [input.name[0] === 's' ? 'start' : 'end']: input.value }; });
    rows.hidden = !per;
    if (!per) { rows.innerHTML = ''; return; }
    const from = el.date.value, to = el.endDate.value;
    if (!from || !to || to <= from) { rows.innerHTML = '<p class="schedule-hint">Эхлэх болон дуусах өдрөө сонгоход өдөр бүрийн цаг энд гарна.</p>'; return; }
    const days = el.workDays.value ? el.workDays.value.split(',') : dayList(from, to, 32);
    if (days.length > 31) { rows.innerHTML = '<p class="schedule-hint">Олон өдрийн ээлж 31 хоногоос ихгүй байна.</p>'; return; }
    rows.innerHTML = days.map((date) => { const saved = ui.formSchedule[date] || {}; return `<div class="schedule-row"><span>${shortDate(date)} · ${weekday(date)}</span><input type="time" name="s-${date}" value="${escape(saved.start || el.start.value || '10:00')}" required aria-label="${shortDate(date)} эхлэх цаг"><span aria-hidden="true">–</span><input type="time" name="e-${date}" value="${escape(saved.end || el.end.value || '15:00')}" required aria-label="${shortDate(date)} дуусах цаг"></div>`; }).join('');
  }
  function calDays() { return [...new Set(ui.calRanges.flatMap(([a, b]) => dayList(a, b)))].sort(); }
  function renderRangeCal(form) {
    const min = today(), [y, m] = ui.calMonth.split('-').map(Number);
    const lead = (new Date(`${ui.calMonth}-01T12:00:00Z`).getUTCDay() + 6) % 7;
    const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const chosen = calDays(), anchor = [...chosen, ui.calPending].filter(Boolean).sort();
    const lo = anchor.length ? addDays(anchor[anchor.length - 1], -30) : '', hi = anchor.length ? addDays(anchor[0], 30) : '';
    const cells = Array.from({ length: lead }, () => '<span></span>');
    for (let d = 1; d <= length; d++) {
      const date = `${ui.calMonth}-${String(d).padStart(2, '0')}`;
      const range = ui.calRanges.find(([a, b]) => date >= a && date <= b);
      const single = range && range[0] === range[1];
      const edge = date === ui.calPending || single || (range && (date === range[0] || date === range[1]));
      const cls = ['cal-day', edge && 'is-edge', range && !single && date > range[0] && date < range[1] && 'in-range', range && !single && date === range[0] && 'is-start', range && !single && date === range[1] && 'is-end', date === min && 'is-today'].filter(Boolean).join(' ');
      const off = date < min || (anchor.length && (date < lo || date > hi));
      cells.push(`<button type="button" class="${cls}" data-action="cal-day" data-id="${date}" ${off ? 'disabled' : ''} aria-pressed="${Boolean(range) || date === ui.calPending}" aria-label="${fullDate(date)} ${weekday(date)}">${d}</button>`);
    }
    const summary = ui.calPending ? `<strong>${shortDate(ui.calPending)}</strong> · ${ui.calBreak ? 'хугацааныхаа сүүлийн өдрийг сонгоно уу' : 'сүүлийн өдрөө сонгоно уу'}` : chosen.length ? `<strong>${rangesText(chosen)}</strong> · ${chosen.length} өдөр` : (ui.calBreak ? 'Хэд хэдэн хугацааг ээлжлэн сонгоно уу' : 'Эхний өдрөө сонгоно уу');
    form.querySelector('.range-cal').innerHTML = `<div class="cal-presets">${[[3, '3 өдөр'], [5, '5 өдөр'], [7, '7 хоног']].map(([n, label]) => `<button type="button" class="cal-preset" data-action="cal-preset" data-id="${n}">${label}</button>`).join('')}<button type="button" class="cal-preset cal-break" data-action="cal-break" aria-pressed="${ui.calBreak}">${icon('pause')}Завсарлах</button></div>${ui.calBreak ? '<p class="cal-note">Завсартай: эхлэх, дуусах өдрөө хос хосоор нь дарж хэд хэдэн хугацаа нэмнэ. Сонгосон хугацаан дээр дарвал хасагдана.</p>' : ''}<div class="cal-head"><button type="button" class="icon-button" data-action="cal-month" data-id="-1" aria-label="Өмнөх сар" ${ui.calMonth <= min.slice(0, 7) ? 'disabled' : ''}>${icon('back')}</button><strong>${y} оны ${m}-р сар</strong><button type="button" class="icon-button" data-action="cal-month" data-id="1" aria-label="Дараах сар">${icon('arrow')}</button></div><div class="cal-grid" role="group" aria-label="Ажлын өдрүүд">${['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map((w) => `<span class="cal-wd">${w}</span>`).join('')}${cells.join('')}</div><div class="cal-foot"><span>${summary}</span>${chosen.length || ui.calPending ? '<button type="button" class="text-button" data-action="cal-clear">Цэвэрлэх</button>' : ''}</div>`;
  }
  function writeRanges(form, focusDate) {
    ui.calRanges = groupDays(calDays());
    const days = calDays(), el = form.elements;
    el.date.value = days[0] || ''; el.endDate.value = days.length > 1 ? days[days.length - 1] : '';
    el.workDays.value = days.length > 1 && days.length < dayList(days[0], days[days.length - 1]).length ? days.join(',') : '';
    syncJobForm(form);
    if (focusDate) form.querySelector(`[data-action="cal-day"][data-id="${focusDate}"]`)?.focus();
  }
  function pickCalDay(form, date) {
    const inside = ui.calRanges.findIndex(([a, b]) => date >= a && date <= b);
    if (!ui.calPending) {
      if (ui.calBreak && inside >= 0) ui.calRanges.splice(inside, 1);
      else { if (!ui.calBreak) ui.calRanges = []; ui.calPending = date; }
    } else if (date < ui.calPending) ui.calPending = date;
    else if (date === ui.calPending && !ui.calBreak) return;
    else { ui.calRanges.push([ui.calPending, date]); ui.calPending = ''; }
    writeRanges(form, date);
  }
  function submitJob(form) {
    const old = jobById(form.dataset.jobId);
    const data = new FormData(form);
    const fields = Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value).trim()]));
    const job = { ...fields, id: old?.id || crypto.randomUUID(), pay: Number(fields.pay), openings: Number(fields.openings), meal: Object.hasOwn(meals, fields.meal) ? fields.meal : 'none', mealAllowance: fields.meal === 'allowance' ? Number(fields.mealAllowance) : undefined, createdAt: old?.createdAt || Date.now(), status: old?.status || 'active' };
    for (const key of Object.keys(job)) if (/^[se]-/.test(key) || ['multiDay', 'perDay', 'endDate', 'workDays'].includes(key)) delete job[key];
    if (data.has('multiDay')) {
      job.endDate = fields.endDate;
      if (fields.workDays) job.workDays = fields.workDays.split(',');
      if (ui.calPending) return formError('job-error', 'Сүүлд сонгосон хугацааныхаа дуусах өдрийг сонгоорой.');
      if (!validDate(job.date) || !validDate(job.endDate) || job.endDate <= job.date) return formError('job-error', 'Календараас эхний болон сүүлийн өдрөө сонгоорой.');
      if (dayList(job.date, job.endDate).length > 31) return formError('job-error', 'Олон өдрийн ээлж 31 хоногоос ихгүй байна.');
      if (data.has('perDay')) {
        job.schedule = daysOf(job).map((date) => ({ date, start: fields['s-' + date] || '', end: fields['e-' + date] || '' }));
        if (!job.schedule.every((day) => validTime(day.start) && validTime(day.end) && toMinutes(day.end) > toMinutes(day.start))) return formError('job-error', 'Өдөр бүрийн дуусах цаг нь эхлэх цагаасаа хойш байх ёстой.');
        job.start = job.schedule[0].start; job.end = job.schedule[0].end;
      }
    }
    if (job.mealAllowance === undefined) delete job.mealAllowance;
    if (job.meal === 'allowance' && !(Number.isInteger(job.mealAllowance) && job.mealAllowance >= 500 && job.mealAllowance <= 200000)) return formError('job-error', 'Хоолны мөнгөний дүнг 500–200,000₮ хооронд бичээрэй.');
    if (toMinutes(job.end) <= toMinutes(job.start)) return formError('job-error', 'Дуусах цаг нь эхлэх цагаас хойш байх ёстой.');
    if (!validJob(job)) return formError('job-error', 'Мэдээллээ шалгаарай. Нэр, төрөл, дүүрэг, тайлбар болон зөв өдөр, цаг шаардлагатай.');
    if (job.date < today()) return formError('job-error', 'Ажлын өдөр өнөөдөр эсвэл түүнээс хойш байх ёстой.');
    if (job.openings < acceptedCount(job.id)) return formError('job-error', `Энэ ээлжид ${acceptedCount(job.id)} хүн сонгосон байна. Орон тоог үүнээс бага болгох боломжгүй.`);
    if (old) state.jobs[state.jobs.indexOf(old)] = job; else state.jobs.unshift(job);
    const invitee = !old && seekerById(ui.inviteFor);
    state.role = 'employer'; ui.employerTab = invitee ? 'seekers' : 'jobs';
    if (invitee) { const message = ui.inviteMessage; persist(); navigate('employer'); return sendInvite(invitee, job, message); }
    persist(); renderAll(); navigate('employer'); toast(old ? 'Зарын өөрчлөлт хадгалагдлаа.' : 'Жишээ зар нэмэгдлээ. Ажил горилогчийн самбарт харагдана.');
  }
  function changeApplication(id, status) {
    const app = state.applications.find((item) => item.id === id);
    if (!app || app.status === 'withdrawn' || !Object.hasOwn(statusNames, status) || status === 'withdrawn') return renderEmployer();
    const job = jobById(app.jobId);
    if (status === 'accepted' && app.status !== 'accepted' && placesLeft(job) === 0) { toast('Энэ ээлжийн орон тоо дүүрсэн. Орон тоог нэмэх эсвэл өөр хүсэлтийн төлөвийг өөрчилнө үү.'); renderEmployer(); return; }
    app.status = status; app.updatedAt = Date.now(); persist(); renderAll(); document.querySelector(`[data-application="${CSS.escape(id)}"]`)?.focus(); toast('Хүсэлтийн төлөв өөрчлөгдлөө. Ажил горилогчийн хэсэгт мөн харагдана.');
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
  let chosenPalette = 'original';
  let paletteProperties = [];
  function applyPalette(id, remember = true) {
    const palette = palettes.find((item) => item.id === id);
    if (!palette) return;
    const root = document.documentElement;
    paletteProperties.forEach((key) => root.style.removeProperty(key));
    paletteProperties = [];
    selectedPalette = id;
    root.dataset.palette = id;
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
    syncFavicon();
    if (!remember) return;
    chosenPalette = id;
    try { localStorage.setItem(paletteKey, id); } catch { /* Keep the selection for this page session. */ }
  }
  // The logo inverts the page colors: text-color square, background-color mark. The tab icon follows.
  function syncFavicon() {
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    const css = getComputedStyle(document.documentElement);
    const square = css.getPropertyValue('--ink').trim() || '#1C1F1F';
    const mark = css.getPropertyValue('--bg').trim() || '#FFFFFF';
    const tile = !state.signedIn
      ? `<rect width="64" height="64" rx="16" fill="${mark}"/><rect x="4" y="4" width="56" height="56" rx="11" fill="${square}"/>`
      : `<rect width="64" height="64" rx="14" fill="${square}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${tile}<path d="m14 44 20-20H22l10-10h20v20L42 44V32L22 52Z" fill="${mark}"/></svg>`;
    favicon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => syncFavicon());
  // Colors are a signed-in preference; the public landing page always uses the original look.
  function syncPalette() {
    const want = state.signedIn ? chosenPalette : 'original';
    if (want !== selectedPalette || !document.documentElement.dataset.palette) applyPalette(want, false);
  }
  function openColors() {
    ui.panelJob = null;
    showPanel(`<h2 id="panel-title" class="panel-heading">Өнгө сонгох</h2><p class="panel-subtitle">Таалагдсан өнгөө сонгоорой. Сонголт энэ хөтөч дээр хадгалагдана.</p><div class="palette-options">${palettes.map((palette) => `<button class="palette-option" data-action="palette" data-id="${palette.id}" aria-label="${palette.name}" aria-pressed="${chosenPalette === palette.id}"><span class="palette-button-preview" style="background:${palette.button || '#05AD98'};color:${palette.buttonText || '#062A25'}" aria-hidden="true"></span></button>`).join('')}</div>`);
    $('#panel').classList.add('job-detail-dialog');
  }
  try { const savedPalette = localStorage.getItem(paletteKey); if (palettes.some((item) => item.id === savedPalette)) chosenPalette = savedPalette; } catch { /* Use the original palette. */ }

  // Wait briefly so a double-click can cancel home navigation before reloading.
  let logoClickTimer;
  document.addEventListener('click', (event) => {
    const logo = event.target.closest('a.wordmark');
    if (!logo || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    clearTimeout(logoClickTimer);
    if (event.detail >= 2) { location.reload(); return; }
    const home = logo.hash.slice(1) || 'top';
    if (event.detail === 0) { navigate(home); return; }
    logoClickTimer = setTimeout(() => navigate(home), 250);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    if (action === 'cal-day') pickCalDay(button.closest('form'), id);
    else if (action === 'cal-month') { const [y, m] = ui.calMonth.split('-').map(Number); ui.calMonth = new Date(Date.UTC(y, m - 1 + Number(id), 1)).toISOString().slice(0, 7); renderRangeCal(button.closest('form')); }
    else if (action === 'cal-preset') { const form = button.closest('form'); const from = form.elements.date.value >= today() ? form.elements.date.value : today(); ui.calMonth = from.slice(0, 7); ui.calPending = ''; ui.calRanges = [[from, addDays(from, Number(id) - 1)]]; writeRanges(form); }
    else if (action === 'cal-clear') { ui.calRanges = []; ui.calPending = ''; writeRanges(button.closest('form')); }
    else if (action === 'cal-break') { const form = button.closest('form'); ui.calBreak = !ui.calBreak; if (!ui.calBreak) { const days = calDays(); ui.calRanges = days.length ? [[days[0], days[days.length - 1]]] : []; } ui.calPending = ''; writeRanges(form); }
    else if (action === 'avail-clear') { ui.availMonth[id] = ''; setAvail(id, { dates: [], from: '', to: '' }, `[data-action="avail-open"][data-id="${id}"]`); }
    else if (action === 'avail-open') { ui.availOpen[id] = !ui.availOpen[id]; if (id === 'me') { renderBrowse(); renderProfile(); } else renderEmployer(); refocus(`[data-action="avail-open"][data-id="${id}"]`); }
    else if (action === 'avail-day') { const [scope, date] = id.split(':'); const a = availOf(scope); a.dates = a.dates.includes(date) ? a.dates.filter((d) => d !== date) : [...a.dates, date].sort(); setAvail(scope, a, `[data-action="avail-day"][data-id="${id}"]`); }
    else if (action === 'avail-month') { const [scope, step] = id.split(':'); const [y, m] = ui.availMonth[scope].split('-').map(Number); ui.availMonth[scope] = new Date(Date.UTC(y, m - 1 + Number(step), 1)).toISOString().slice(0, 7); if (scope === 'me') { renderBrowse(); renderProfile(); } else renderEmployer(); refocus(`[data-action="avail-month"][data-id="${id}"]:not(:disabled)`) ; }
    else if (action === 'seek-more') { ui.seekLimit += 10; renderEmployer(); }
    else if (action === 'pick-seeker') openInvite(id);
    else if (action === 'invite-cancel') { const item = state.invites.find((value) => value.id === id); if (item?.remoteId) firestore().then(({ fs, db }) => fs.deleteDoc(fs.doc(db, 'invites', item.remoteId))).catch(() => {}); if (item) { state.invites = state.invites.filter((value) => value.id !== id); persist(); renderAll(); openInvite(item.seekerId); toast('Урилгыг цуцаллаа.'); } }
    else if (action === 'picked-only') { ui.pickedOnly = !ui.pickedOnly; renderEmployer(); $('[data-action="picked-only"]')?.focus(); }
    else if (action === 'seek-reset') { ui.seekDates = []; ui.seekLimit = 10; ui.seekFrom = ''; ui.seekTo = ''; ui.seekDistrict = ''; ui.seekJob = ''; ui.pickedOnly = false; renderEmployer(); }
    else if (action === 'colors') { if (state.signedIn) openColors(); }
    else if (action === 'palette') { if (state.signedIn) applyPalette(id); }
    else if (action === 'account') openAccount();
    else if (action === 'signin' || action === 'signup') openSignIn(action, id, button.dataset.email || '');
    else if (action === 'signout') signOut();
    else if (action === 'user-menu') setMenu(!ui.menuOpen);
    else if (action === 'saved-menu') { ui.savedOnly = true; ui.limit = 3; ui.scrollTo = 'jobs'; renderBrowse(); navigate('jobs'); }
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
    else if (action === 'toggle-password') { const input = button.parentElement.querySelector('input'); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; button.textContent = show ? 'Нуух' : 'Харах'; button.setAttribute('aria-pressed', String(show)); input.focus(); }
    else if ((action === 'student' || action === 'employer') && !state.signedIn) openSignIn('signin', action);
    else if (action === 'google-signin') googleSignIn(button);
    else if (action === 'forgot-password') openReset($('#signin-form [name=email]')?.value.trim());
    else if (action === 'verify-email') accountEmail('verify');
    else if (action === 'change-password') accountEmail('password');
    else if (action === 'student' || action === 'employer') { const changed = state.role !== action; state.role = action; state.roles[state.userId] = action; persist(); publishAvailability(); renderAll(); navigate(action === 'employer' ? 'employer' : 'jobs'); if (changed) toast(`${roleNames[action]} горимд шилжлээ.`); }
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
    else if (action === 'clear-filters' || action === 'reset-filters') { ui.category = ''; ui.district = ''; ui.limit = 3; delete state.profile.days; Object.assign(state.profile, { dates: [], from: '', to: '' }); persist(); if (action === 'reset-filters') ui.savedOnly = false; renderBrowse(); }
    else if (action === 'employer-tab') { ui.employerTab = button.dataset.tab; renderEmployer(); if (ui.employerTab === 'seekers') loadSeekers(); }
    else if (action === 'new-job') openJobForm();
    else if (action === 'edit-job') openJobForm(id);
    else if (action === 'job-applicants') { ui.employerTab = 'applications'; ui.applicantJob = id; renderEmployer(); $('#employer-applications-tab').focus(); }
    else if (action === 'pause-job') { const job = jobById(id); if (job) { job.status = job.status === 'active' ? 'paused' : 'active'; persist(); renderAll(); toast(job.status === 'paused' ? 'Зарыг түр зогсоолоо.' : 'Зарыг дахин нээлээ.'); } }
    else if (action === 'reset') showPanel(`<h2 id="panel-title" class="panel-heading">Өгөгдлийг шинэчлэх үү?</h2><p class="panel-subtitle">Энэ хөтөч дээрх хадгалсан ажил, хүсэлт болон таны нэмсэн заруудыг арилгаж, анхны жишээ заруудыг сэргээнэ.</p><div class="form-actions"><button class="button button-outline" data-action="close">Болих</button><button class="button button-dark" data-action="confirm-reset">Шинээр эхлэх</button></div>`);
    else if (action === 'confirm-reset') { const { signedIn, role, roles, userId, profile: { name, contact } } = state; state = freshState(); Object.assign(state, { signedIn, role, roles, userId }); Object.assign(state.profile, { name, contact }); ui.category = ''; ui.district = ''; ui.savedOnly = false; ui.limit = 3; ui.applicantJob = ''; ui.employerTab = 'jobs'; persist(); renderAll(); navigate('jobs'); toast('Туршилтын өгөгдлийг шинэчиллээ.'); }
  });
  document.addEventListener('submit', (event) => {
    if (event.target.id === 'search-form') { event.preventDefault(); const data = new FormData(event.target); ui.category = data.get('category'); ui.district = data.get('district'); ui.limit = 3; renderBrowse(); $('#jobs').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (event.target.id === 'application-form') { event.preventDefault(); submitApplication(event.target); }
    else if (event.target.id === 'job-form') { event.preventDefault(); submitJob(event.target); }
    else if (event.target.id === 'invite-form') { event.preventDefault(); submitInvite(event.target); }
    else if (event.target.id === 'signin-form') { event.preventDefault(); submitSignIn(event.target); }
    else if (event.target.id === 'reset-form') { event.preventDefault(); submitReset(event.target); }
    else if (event.target.id === 'listing-form') {
      event.preventDefault();
      const data = new FormData(event.target), district = String(data.get('district'));
      Object.assign(state.profile, { listed: data.get('listed') === 'on', district: districts.includes(district) ? district : '', school: String(data.get('school')).trim().slice(0, 80), bio: String(data.get('bio')).trim().slice(0, 300) });
      persist(); renderProfile(); publishAvailability();
      toast(state.profile.listed ? 'Профайлаа хадгаллаа.' : 'Ажил олгогчдод харагдахгүй болголоо.');
    }
  });
  document.addEventListener('click', (event) => {
    if (!ui.menuOpen) return;
    const inside = event.target.closest('.user-menu');
    if (!inside || event.target.closest('.user-dropdown a, .user-dropdown button')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    const input = event.target;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
    if (event.key === 'ArrowRight' && input.form?.id === 'job-form' && input.matches('select[name="category"]')) {
      const district = input.form.elements.namedItem('district');
      if (district && !district.disabled) { event.preventDefault(); district.focus(); }
      return;
    }
    if (event.key !== 'ArrowDown') return;
    if (input.form?.id !== 'job-form' || !input.matches('input') || !['text', 'number', 'email', 'tel', 'url', 'search'].includes(input.type)) return;
    const fields = [...input.form.querySelectorAll('input, select, textarea, button')].filter((field) =>
      !field.matches(':disabled') && field.type !== 'hidden' && field.tabIndex >= 0 && field.getClientRects().length &&
      (field.type !== 'radio' || field.checked)
    );
    const next = fields[fields.indexOf(input) + 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
  });

  $('.user-menu').addEventListener('keydown', (event) => {
    if (!ui.menuOpen) return;
    const items = [...document.querySelectorAll('#user-dropdown .menu-item')];
    const at = items.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); items[(at + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus(); }
    else if (event.key === 'Tab' && at !== -1 && (event.shiftKey ? at === 0 : at === items.length - 1)) setMenu(false);
  });
  document.addEventListener('change', (event) => {
    const picker = event.target.closest('.avail-picker');
    if (picker) { readPicker(picker, event.target); return; }
    if (event.target.name === 'mode' && event.target.form?.id === 'invite-form') { const isNew = event.target.value === 'new'; event.target.form.querySelector('.invite-jobs').hidden = isNew; $('#invite-submit').innerHTML = `${isNew ? 'Шинэ зар нэмэх' : 'Мэдэгдэл илгээх'}${icon('arrow')}`; return; }
    if (event.target.id === 'sort') { ui.sort = event.target.value; renderBrowse(); }
    else if (event.target.id === 'seek-job') { ui.seekJob = event.target.value; ui.seekLimit = 10; renderEmployer(); $('#seek-job').focus(); }
    else if (event.target.id === 'seek-district') { ui.seekDistrict = event.target.value; ui.seekLimit = 10; renderEmployer(); $('#seek-district').focus(); }
    else if (event.target.id === 'applicant-job-filter') { ui.applicantJob = event.target.value; renderEmployer(); }
    else if (event.target.dataset.application) changeApplication(event.target.dataset.application, event.target.value);
    else if (event.target.form?.id === 'job-form' && ['multiDay', 'perDay', 'date', 'endDate'].includes(event.target.name)) syncJobForm(event.target.form);
    else if (event.target.name === 'meal' && event.target.form?.id === 'job-form') {
      const wrap = event.target.form.querySelector('.meal-amount'); const input = wrap.querySelector('input'); const on = event.target.value === 'allowance';
      wrap.hidden = !on; input.disabled = !on; input.required = on; if (on) input.focus();
    }
  });
  $('.workspace-tabs').addEventListener('keydown', (event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const at = employerTabs.indexOf(ui.employerTab); ui.employerTab = event.key === 'Home' ? employerTabs[0] : event.key === 'End' ? employerTabs[employerTabs.length - 1] : employerTabs[(at + (event.key === 'ArrowRight' ? 1 : employerTabs.length - 1)) % employerTabs.length]; renderEmployer(); $(`#employer-${ui.employerTab}-tab`).focus(); } });
  $('#panel').addEventListener('click', (event) => { if (event.target === $('#panel')) { const rect = $('#panel').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel(); } });
  window.addEventListener('hashchange', route);
  window.addEventListener('storage', (event) => { if (event.key === KEY) { state = loadState(); renderAll(); route(); } });
  const isPageReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  if (isPageReload) history.scrollRestoration = 'manual';
  state = loadState();
  if (!FIREBASE_CONFIG.apiKey && state.signedIn) { state.signedIn = false; state.userId = ''; persist(); }
  renderAll(); route(); setupShowcase();
  if (FIREBASE_CONFIG.apiKey) firebaseAuth().then(({ auth, fb }) => fb.onAuthStateChanged(auth, syncUser)).catch(() => {});
  if (isPageReload) {
    const showHeader = () => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    if (document.readyState === 'complete') showHeader();
    else window.addEventListener('load', showHeader, { once: true });
  }
  setTimeout(() => document.documentElement.classList.remove('is-reloading'), 1800);
})();
