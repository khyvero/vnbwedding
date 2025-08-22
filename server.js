import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'node:url';
import ejsMate from 'ejs-mate';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto'; // For dev cookie secret

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// ---------- Security & parsing ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Secure cookie secret setup
const cookieSecret = process.env.COOKIE_SECRET;
if (process.env.NODE_ENV === 'production' && !cookieSecret) {
  console.error('FATAL: COOKIE_SECRET environment variable must be set in production.');
  process.exit(1);
}
app.use(cookieParser(cookieSecret || crypto.randomBytes(20).toString('hex')));


// Global rate limit (tune as needed)
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// ---------- Views & static ----------
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/visual_assets', express.static(path.join(__dirname, 'visual_assets')));

// ---------- CSRF ----------
const csrfProtection = csrf({ cookie: true });

// ---------- Helpers ----------
const yn = (v) => (v === 'yes' ? true : v === 'no' ? false : null);

const INVITE_GROUPS = ['bridesmaids', 'groomsmen', 'family', 'guest'];
function normalizeInviteGroup(g) {
  const x = String(g || '').trim().toLowerCase();
  if (x === 'bridesmaid') return 'bridesmaids';
  if (x === 'groomsman' || x === 'groom') return 'groomsmen';
  return INVITE_GROUPS.includes(x) ? x : 'guest';
}

async function getViewer(req) {
  const token = req.signedCookies?.acc; // "INV:<id>"
  if (!token) return null;
  const [prefix, idStr] = token.split(':');
  if (prefix !== 'INV') return null;

  const inv = await prisma.invite.findUnique({
    where: { id: Number(idStr) },
    select: {
      accessName: true,
      group: true,
      rsvp:  { select: { placeCardName: true } },
      guest: { select: { placeCardName: true } }
    }
  });
  if (!inv) return null;

  const name = inv.accessName || inv.rsvp?.placeCardName || inv.guest?.placeCardName || null;
  return { name, group: normalizeInviteGroup(inv.group) };
}

function requireAccess(req, res, next) {
  const token = req.signedCookies?.acc; // "INV:<id>"
  if (!token) {
    const nextUrl = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/?showAccessModal=true&next=${nextUrl}`);
  }
  const [prefix, idStr] = token.split(':');
  if (prefix !== 'INV' || !idStr) {
    res.clearCookie('acc');
    const nextUrl = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/?showAccessModal=true&next=${nextUrl}`);
  }
  req.access = { inviteId: parseInt(idStr, 10) };
  next();
}

// ---------- Home (public) ----------
app.get('/', csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    const showAdminLink = process.env.SHOW_ADMIN_LINK !== 'false';
    res.render('index', { page: 'home', csrfToken: req.csrfToken(), viewer, showAdminLink });
  } catch (err) { next(err); }
});

app.get('/travel', csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('travel', { viewer, csrfToken: req.csrfToken() });
  } catch (err) { next(err); }
});

app.get('/story', csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('story', { viewer, csrfToken: req.csrfToken() });
  } catch (err) { next(err); }
});

app.get('/gallery', requireAccess, csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('gallery', { viewer, csrfToken: req.csrfToken() });
  } catch (err) { next(err); }
});

// ---------- Bridesmaids/Groomsmen (gated) ----------
function requireRole(role) {
  return async (req, res, next) => {
    try {
      const token = req.signedCookies?.acc; // "INV:<id>"
      if (!token) {
        const nextUrl = encodeURIComponent(req.originalUrl);
        return res.redirect(`/?showAccessModal=true&next=${nextUrl}`);
      }
      const [prefix, idStr] = token.split(':');
      if (prefix !== 'INV' || !idStr) {
        res.clearCookie('acc');
        const nextUrl = encodeURIComponent(req.originalUrl);
        return res.redirect(`/?showAccessModal=true&next=${nextUrl}`);
      }
      const inviteId = parseInt(idStr, 10);
      const invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        select: { group: true }
      });

      if (invite && normalizeInviteGroup(invite.group) === role) {
        req.access = { inviteId };
        return next();
      }

      return res.status(403).send('Access Denied');
    } catch (err) {
      next(err);
    }
  };
}

app.get('/bridesmaids', requireRole('bridesmaids'), csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('bridesmaids', { viewer, csrfToken: req.csrfToken() });
  } catch (err) { next(err); }
});

app.get('/groomsmen', requireRole('groomsmen'), csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('groomsmen', { viewer, csrfToken: req.csrfToken() });
  } catch (err) { next(err); }
});

// ---------- Access (Invite) ----------
app.get('/access', csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);
    res.render('access', { next: req.query.next || '/', error: null, csrfToken: req.csrfToken(), viewer });
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res.locals.viewer = !!req.signedCookies?.acc; // requires cookie-parser with secret
  next();
});


app.post('/access', csrfProtection, async (req, res, next) => {
  try {
    const { code, next: rawNext } = req.body;
    const nextSafe = (typeof rawNext === 'string' && rawNext.startsWith('/')) ? rawNext : '/';

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Access code is required. Please try again.' });
    }

    const invites = await prisma.invite.findMany({ select: { id: true, accessCodeHash: true } });

    for (const inv of invites) {
      if (inv.accessCodeHash) {
        const match = await bcrypt.compare(code, inv.accessCodeHash);
        if (match) {
          res.cookie('acc', `INV:${inv.id}`, {
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 90,
          });
          return res.json({ success: true, next: nextSafe });
        }
      }
    }

    return res.status(401).json({ error: 'The access code you entered is incorrect. Please try again.' });
  } catch (error) {
    console.error('Error during /access POST:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

// Logout (Lock)
app.post('/access/logout', csrfProtection, (req, res) => {
  // clear the signed cookie
  res.clearCookie('acc', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Always redirect to home
  return res.redirect('/');
});


// ---------- RSVP (gated) ----------
app.get('/rsvp', requireAccess, csrfProtection, async (req, res, next) => {
  try {
    const viewer = await getViewer(req);

    const invite = await prisma.invite.findUnique({
      where: { id: req.access.inviteId },
      select: {
        maxGuests: true,
        rsvp: {
          select: {
            id: true,
            placeCardName: true,
            email: true,
            dietary: true,
            ceremony: true,
            reception: true,
            transport: true,
            printedInvite: true,
            notes: true,
            guests: { select: { placeCardName: true, dietary: true }, orderBy: { createdAt: 'asc' } }
          }
        }
      }
    });

    const r = invite?.rsvp || {};
    const defaults = {
      placeCardName: r.placeCardName || '',
      email:         r.email || '',
      dietary:       r.dietary || '',
      ceremony:      r.ceremony === true ? 'yes' : (r.ceremony === false ? 'no' : ''),
      reception:     r.reception === true ? 'yes' : (r.reception === false ? 'no' : ''),
      transport:     r.transport === true ? 'yes' : (r.transport === false ? 'no' : ''),
      printedInvite: r.printedInvite === true ? 'yes' : (r.printedInvite === false ? 'no' : ''),
      notes:         r.notes || '',
      guests:        (r.guests || []).map(g => ({ name: g.placeCardName || '', dietary: g.dietary || '' }))
    };

    res.render('rsvp', { csrfToken: req.csrfToken(), defaults, viewer, maxGuests: invite.maxGuests, error: null });
  } catch (err) { next(err); }
});

app.post('/rsvp', requireAccess, csrfProtection, async (req, res, next) => {
  try {
    const {
      placeCardName, email, dietary, ceremony, reception,
      transport, printedInvite, notes, guestNames, guestDietaries
    } = req.body;

    const validationRules = {
      'Place card name': { value: placeCardName, max: 255 },
      'Email': { value: email, max: 255 },
      'Dietary requirements': { value: dietary, max: 1024 },
      'Notes': { value: notes, max: 1024 },
    };

    for (const [fieldName, rule] of Object.entries(validationRules)) {
      if (rule.value && rule.value.length > rule.max) {
        const viewer = await getViewer(req);
        const invite = await prisma.invite.findUnique({
          where: { id: req.access.inviteId },
          select: { maxGuests: true }
        });

        const defaults = {
          placeCardName: placeCardName || '',
          email: email || '',
          dietary: dietary || '',
          ceremony: ceremony || '',
          reception: reception || '',
          transport: transport || '',
          printedInvite: printedInvite || '',
          notes: notes || '',
          guests: (Array.isArray(guestNames) ? guestNames : []).map((name, i) => ({
            placeCardName: name,
            dietary: (Array.isArray(guestDietaries) ? guestDietaries[i] : '') || ''
          }))
        };

        return res.status(400).render('rsvp', {
          csrfToken: req.csrfToken(),
          defaults,
          viewer,
          maxGuests: invite.maxGuests,
          error: `${fieldName} is too long (max ${rule.max} characters).`
        });
      }
    }

    const invite = await prisma.invite.findUnique({
      where: { id: req.access.inviteId },
      select: { rsvpId: true, guestId: true, maxGuests: true, accessName: true }
    });
    if (!invite) return res.status(400).send('Invite not found');

    const isAttendingCeremony = yn(ceremony);
    const isAttendingReception = yn(reception);
    const isAttendingAnything = isAttendingCeremony || isAttendingReception;

    const displayName = (isAttendingReception && placeCardName?.trim()) || invite.accessName;

    if (invite.guestId) {
      await prisma.guest.update({
        where: { id: invite.guestId },
        data: {
          placeCardName: isAttendingReception ? (placeCardName?.trim() || invite.accessName) : invite.accessName,
          dietary: isAttendingReception ? (dietary?.trim() || null) : null,
        }
      });
    } else {
      const targetRsvpId = invite.rsvpId;
      if (!targetRsvpId) return res.status(400).send('RSVP not found');

      const cleanedGuests = [];
      if (isAttendingReception) {
        const names = Array.isArray(guestNames) ? guestNames : (guestNames ? [guestNames] : []);
        const diets = Array.isArray(guestDietaries) ? guestDietaries : (guestDietaries ? [guestDietaries] : []);
        for (let i = 0; i < names.length; i++) {
          const raw = (names[i] || '').trim();
          if (!raw) continue;
          const d = (diets[i] || '').trim();
          cleanedGuests.push({ placeCardName: raw, dietary: d || null });
        }
        if (cleanedGuests.length > invite.maxGuests) {
          return res.status(400).send(`You can only add a maximum of ${invite.maxGuests} guests.`);
        }
      }

      await prisma.rSVP.update({
        where: { id: targetRsvpId },
        data: {
          placeCardName: isAttendingReception ? (placeCardName?.trim() || invite.accessName) : null,
          email:         email?.trim() || null,
          dietary:       isAttendingReception ? (dietary?.trim() || null) : null,
          ceremony:      isAttendingCeremony,
          reception:     isAttendingReception,
          transport:     (isAttendingCeremony && isAttendingReception) ? yn(transport) : null,
          printedInvite: isAttendingAnything ? yn(printedInvite) : null,
          notes:         isAttendingAnything ? (notes?.trim() || null) : null,
          guests:        { deleteMany: {}, create: cleanedGuests }
        }
      });
    }

    const viewer = await getViewer(req);

    res.render('success', {
      name: displayName,
      ceremony: isAttendingCeremony,
      reception: isAttendingReception,
      transport: (isAttendingCeremony && isAttendingReception) ? yn(transport) : null,
      printedInvite: isAttendingAnything ? yn(printedInvite) : null,
      viewer,
      csrfToken: req.csrfToken(),
    });

  } catch (err) {
    next(err);
  }
});


// ---------- Admin ----------
const adminPassword = process.env.ADMIN_PASSWORD;
if (process.env.NODE_ENV === 'production' && !adminPassword) {
  console.error('FATAL: ADMIN_PASSWORD must be set in production');
  process.exit(1);
}

function requireAdmin(req, res, next) {
  if (req.signedCookies.admin === 'true') {
    return next();
  }
  res.redirect('/admin/login');
}

app.get('/admin/login', csrfProtection, (req, res) => {
  res.render('admin/login', { csrfToken: req.csrfToken(), error: null, isAdmin: true });
});

app.post('/admin/login', csrfProtection, (req, res) => {
  const { password } = req.body;
  if (password && password === adminPassword) {
    res.cookie('admin', 'true', {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.redirect('/admin');
  } else {
    res.status(401).render('admin/login', { csrfToken: req.csrfToken(), error: 'Invalid password', isAdmin: true });
  }
});

app.post('/admin/logout', csrfProtection, (req, res) => {
  res.clearCookie('admin');
  res.redirect('/admin/login');
});


// ---------- Admin: dashboard ----------
app.get('/admin', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const primaries = await prisma.rSVP.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        invite: { select: { id: true, accessName: true, group: true, maxGuests: true } },
        guests: { include: { invite: { select: { id: true, accessName: true } } } } 
      },
    });

    // Flatten rows
    const rows = [];
    for (const r of primaries) {
      rows.push({
        kind: 'RSVP',
        id: r.id,
        name: r.invite?.accessName || '',
        placeCardName: r.placeCardName || null,
        ceremony: r.ceremony,
        reception: r.reception,
        dietary: r.dietary,
        transport: r.transport,
        printedInvite: r.printedInvite,
        notes: r.notes,
        when: r.createdAt,
        addedBy: null,
        inviteId: r.invite?.id || null,
        group: r.invite?.group || 'guest',
        maxGuests: r.invite?.maxGuests || null,
      });
      for (const g of r.guests) {
        rows.push({
          kind: 'GUEST',
          id: g.id,
          name: g.invite?.accessName || '',
          placeCardName: g.placeCardName || null,
          ceremony: r.ceremony,
          reception: r.reception,
          dietary: g.dietary,
          transport: r.transport,
          printedInvite: r.printedInvite,
          notes: r.notes,
          when: g.createdAt || r.createdAt,
          addedBy: r.invite?.accessName || null, // show primary's ACCESS NAME
          inviteId: g.invite?.id || null,
          group: g.invite?.group || 'guest',
          maxGuests: g.invite?.maxGuests || null,
        });
      }
    }
    rows.sort((a, b) => new Date(b.when) - new Date(a.when));

    // Duplicate/relationship flags (server-side)
    const norm = (s) => (s || '').trim().toLowerCase();

    const nameCounts  = new Map();
    const placeCounts = new Map();
    const pairCounts  = new Map();

    for (const row of rows) {
      const n = norm(row.name);
      const p = norm(row.placeCardName);
      if (n) nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
      if (p) placeCounts.set(p, (placeCounts.get(p) || 0) + 1);
      if (n || p) {
        const k = `${n}||${p}`;
        pairCounts.set(k, (pairCounts.get(k) || 0) + 1);
      }
    }

    for (const row of rows) {
      const n = norm(row.name);
      const p = norm(row.placeCardName);
      const flags = [];

      if (n && (nameCounts.get(n)  || 0) > 1) flags.push('dupe_name');
      if (p && (placeCounts.get(p) || 0) > 1) flags.push('dupe_place');
      if ((n || p) && (pairCounts.get(`${n}||${p}`) || 0) > 1) flags.push('dupe_pair');

      // (optional) equality flag; harmless if kept even without a UI toggle
      if (row.name?.trim() && row.placeCardName?.trim() && row.name.trim() === row.placeCardName.trim()) {
        flags.push('eq_within');
      }

      if (n) {
        const nameMatchesPlace = (placeCounts.get(n) || 0) > ((p && p === n) ? 1 : 0);
        if (nameMatchesPlace) flags.push('name_in_place');
      }
      if (p) {
        const placeMatchesName = (nameCounts.get(p) || 0) > ((n && n === p) ? 1 : 0);
        if (placeMatchesName) flags.push('place_in_name');
      }

      row._dupes = flags;
    }

    // Simple counts (if needed elsewhere) could be computed here—but homepage no longer shows stats.
    const counts = {
      total:        await prisma.rSVP.count(),
      ceremonyYes:  (await prisma.rSVP.count({ where: { ceremony: true } }))
                    + (await prisma.guest.count({ where: { rsvp: { ceremony: true } } })),
      receptionYes: (await prisma.rSVP.count({ where: { reception: true } }))
                    + (await prisma.guest.count({ where: { rsvp: { reception: true } } })),
    };

    res.render('admin/dashboard', { rows, counts, csrfToken: req.csrfToken(), isAdmin: true });
  } catch (err) { next(err); }
});

// ---------- Admin: invited list ----------
app.get('/admin/invites', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const invites = await prisma.invite.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rsvp:  { select: { id: true, placeCardName: true } },
        guest: { select: { id: true, placeCardName: true, rsvpId: true } },
      },
    });
    res.render('admin/invites', { invites, csrfToken: req.csrfToken(), isAdmin: true });
  } catch (e) { next(e); }
});

// ---------- Admin: create PRIMARY invite (code unique; name can duplicate) ----------
app.post('/admin/invites/create-primary', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const { guestName, accessCode, inviteGroup, maxGuests } = req.body;
    const accessName = guestName?.trim();
    const codePlain  = accessCode?.trim();
    if (!accessName) return res.status(400).send('Guest name required');
    if (!codePlain)  return res.status(400).send('Access code required');

    // Access name can duplicate — no uniqueness check

    // Uniqueness: accessCode (bcrypt salted → must compare)
    const allCodes = await prisma.invite.findMany({ select: { id: true, accessCodeHash: true } });
    for (const inv of allCodes) {
      if (inv.accessCodeHash && await bcrypt.compare(codePlain, inv.accessCodeHash)) {
        return res.status(400).send('Access code already exists');
      }
    }

    // Create RSVP with no placeCardName (guest fills later)
    const rsvp = await prisma.rSVP.create({ data: {} });

    await prisma.invite.create({
      data: {
        rsvpId: rsvp.id,
        accessName,
        accessCodeHash: await bcrypt.hash(codePlain, 10),
        group: normalizeInviteGroup(inviteGroup),
        maxGuests: maxGuests ? parseInt(maxGuests, 10) : null,
      }
    });

    res.json({ success: true });
  } catch (e) { next(e); }
});

app.post('/admin/invites/:id/update', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accessName, accessCode, inviteGroup, maxGuests } = req.body;

    const updateData = {
      accessName: accessName?.trim() || null,
      group: normalizeInviteGroup(inviteGroup),
      maxGuests: maxGuests ? parseInt(maxGuests, 10) : null,
    };

    if (accessCode) {
      updateData.accessCodeHash = await bcrypt.hash(accessCode, 10);
    }

    await prisma.invite.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Deletes an entire RSVP party (the primary guest and all their +1s)
app.post('/admin/rsvps/:id/delete', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const rsvpId = parseInt(req.params.id, 10);
    if (!rsvpId) return res.status(400).send('Invalid RSVP ID');

    // Deleting the RSVP will cascade to the Invite and all associated Guests
    await prisma.rSVP.delete({ where: { id: rsvpId } });
    
    res.redirect('/admin');
  } catch (e) {
    if (e.code === 'P2025') {
      console.warn(`Tried to delete an RSVP that was already gone. ID: ${req.params.id}. Redirecting.`);
      return res.redirect('/admin');
    }
    next(e);
  }
});

// Deletes a single Guest (+1)
app.post('/admin/guests/:id/delete', requireAdmin, csrfProtection, async (req, res, next) => {
  try {
    const guestId = parseInt(req.params.id, 10);
    if (!guestId) return res.status(400).send('Invalid Guest ID');

    // Deleting a Guest will cascade to its own Invite
    await prisma.guest.delete({ where: { id: guestId } });
    
    res.redirect('/admin');
  } catch (e) {
    if (e.code === 'P2025') {
      console.warn(`Tried to delete a guest that was already gone. ID: ${req.params.id}. Redirecting.`);
      return res.redirect('/admin');
    }
    next(e);
  }
});


// ---------- Health ----------
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ---------- 404 Handler (must be after all other routes) ----------
app.use(csrfProtection, async (req, res, next) => {
  res.status(404);
  const viewer = await getViewer(req);
  res.render('error', { 
    viewer,
    csrfToken: req.csrfToken(),
    error: { message: 'Page Not Found' }
  });
});

// ---------- Error handler (last) ----------
app.use(async (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status);

  const viewer = await getViewer(req);
  
  // Make sure we have a CSRF token, even if the error happened before the CSRF middleware
  let csrfToken = '';
  if (req.csrfToken) { // The function might not exist if csurf failed
    try { csrfToken = req.csrfToken(); } catch (e) { /* ignore */ }
  }

  res.render('error', {
    viewer,
    csrfToken,
    error: {
      message: err.message,
      status
    }
  });
});

// ---------- Start ----------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Wedding site running at http://localhost:${port}`);
});
