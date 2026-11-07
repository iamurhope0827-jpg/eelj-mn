// In-browser stand-ins for the Firebase SDK modules app.js imports from gstatic.
// Users and documents live in sessionStorage, so a reload keeps the session like the real SDK,
// and tests never touch the live Firebase project.

const app = `export const initializeApp = (config) => ({ config });`;

const auth = `
const load = () => JSON.parse(sessionStorage.getItem('fake-auth') || '{"users":{},"current":null,"mail":[]}');
const save = (data) => sessionStorage.setItem('fake-auth', JSON.stringify(data));
const fail = (code) => Object.assign(new Error(code), { code });
const listeners = [];
const view = (u) => u && { uid: u.uid, email: u.email, displayName: u.name, emailVerified: u.verified, providerData: [{ providerId: 'password' }], reload: async () => {} };
const auth = { languageCode: null, get currentUser() { const d = load(); return d.current ? view(d.users[d.current]) : null; } };
const emit = () => setTimeout(() => listeners.forEach((fn) => fn(auth.currentUser)));
export const getAuth = () => auth;
export class GoogleAuthProvider {}
export const onAuthStateChanged = (a, fn) => { listeners.push(fn); setTimeout(() => fn(auth.currentUser)); return () => {}; };
export async function createUserWithEmailAndPassword(a, email, password) {
  const d = load(); email = email.toLowerCase();
  if (d.users[email]) throw fail('auth/email-already-in-use');
  d.users[email] = { uid: 'uid-' + email, email, password, name: null, verified: false }; d.current = email; save(d); emit();
  return { user: view(d.users[email]) };
}
export async function signInWithEmailAndPassword(a, email, password) {
  const d = load(), u = d.users[email.toLowerCase()];
  if (!u || u.password !== password) throw fail('auth/invalid-credential');
  d.current = u.email; save(d); emit(); return { user: view(u) };
}
export async function signInWithPopup() { throw fail('auth/popup-closed-by-user'); }
export async function updateProfile(user, profile) { const d = load(); d.users[user.email].name = profile.displayName; save(d); user.displayName = profile.displayName; }
export async function sendEmailVerification(user) { const d = load(); d.mail.push('verify:' + user.email); save(d); }
export async function sendPasswordResetEmail(a, email) { const d = load(); d.mail.push('reset:' + email); save(d); }
export async function signOut() { const d = load(); d.current = null; save(d); emit(); }
`;

const firestore = `
const load = () => JSON.parse(sessionStorage.getItem('fake-store') || '{}');
const save = (data) => sessionStorage.setItem('fake-store', JSON.stringify(data));
const merge = (a, b) => { const out = { ...a }; for (const [k, v] of Object.entries(b)) out[k] = v && typeof v === 'object' && !Array.isArray(v) && a?.[k] && typeof a[k] === 'object' ? merge(a[k], v) : v; return out; };
export const getFirestore = () => ({});
export const collection = (db, name) => ({ name });
export const doc = (db, name, id) => ({ name, id });
export const where = (field, op, value) => ({ type: 'where', field, value });
export const orderBy = (field, dir = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (n) => ({ type: 'limit', n });
export const query = (col, ...clauses) => ({ name: col.name, clauses });
export async function getDocs(q) {
  let rows = Object.entries(load()[q.name] || {}).map(([id, data]) => ({ id, data }));
  for (const c of q.clauses || []) {
    if (c.type === 'where') rows = rows.filter((r) => r.data[c.field] === c.value);
    if (c.type === 'orderBy') rows.sort((a, b) => (a.data[c.field] > b.data[c.field] ? 1 : -1) * (c.dir === 'desc' ? -1 : 1));
    if (c.type === 'limit') rows = rows.slice(0, c.n);
  }
  return { docs: rows.map((r) => ({ id: r.id, data: () => r.data, exists: () => true })) };
}
export async function setDoc(ref, data, options) { const d = load(); d[ref.name] ||= {}; d[ref.name][ref.id] = options?.merge ? merge(d[ref.name][ref.id] || {}, data) : data; save(d); }
export async function updateDoc(ref, data) { const d = load(); d[ref.name][ref.id] = { ...d[ref.name][ref.id], ...data }; save(d); }
export async function deleteDoc(ref) { const d = load(); delete d[ref.name]?.[ref.id]; save(d); }
export async function addDoc(col, data) { const d = load(), id = 'doc-' + Math.random().toString(36).slice(2); d[col.name] ||= {}; d[col.name][id] = data; save(d); return { id }; }
`;

const modules = { 'firebase-app.js': app, 'firebase-auth.js': auth, 'firebase-firestore.js': firestore };

export async function useFakeFirebase(page) {
  for (const [file, body] of Object.entries(modules)) {
    await page.route(`**/firebasejs/**/${file}`, (route) => route.fulfill({ contentType: 'text/javascript', body }));
  }
}
