import express from 'express';
import { config, shared } from '@/index';
import db from '@/utils/db';
import { ReqWithUser } from '@/api/admin';
import { User } from '@/types/pterodactylStructure';
import { getUser } from '@/utils/pterodactyl';
import crypto from 'crypto';
const app = express.Router();

async function linkvertise(link: string) {
    var userid = await db.query('SELECT * FROM config WHERE name = ?', ['linkvertise_userId']).then((res: any) => res[0].value);
    var base_url = `https://link-to.net/${userid}/${Math.random() * 1000}/dynamic`;
    var href = base_url + "?r=" + btoa(encodeURI(link));
    return href;
}

app.get('/lv', async (req, res) => {
    const link = req.query.link;
    const unHashedIp: string = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress as string || req.ip as string;
    const ip = crypto.createHash('sha256').update(unHashedIp).digest('hex');
    const limits = await db.query('SELECT * FROM linkvertiseCache WHERE ip = ?', [ip]).then((res: any) => res[0]);
    if (limits.link !== link) return res.json({ success: false, message: 'Invalid link' });
    const settings = await db.query('SELECT * FROM config WHERE name LIKE ?', ['linkvertise_%']).then((res: any) => Object.fromEntries(res.map((setting: any) => [setting.name, setting.value])));
    const token = req.cookies.token;
    if (!token) return res.json({ success: false });
    const session = await db.query('SELECT * FROM sessions WHERE token = ?', [token]).then((res: any) => res[0]);
    if (!session) return res.json({ success: false });
    const user = await db.query('SELECT * FROM users WHERE id = ?', [session.user]).then((res: any) => res[0]);
    if (!user) return res.json({ success: false });
    user.coins += parseInt(settings.linkvertise_earn)
    await db.query('UPDATE users SET coins = ? WHERE id = ?', [user.coins, user.id]);
    await db.query('UPDATE linkvertiseCache SET link = ? WHERE ip = ?', ['', ip]);
    res.json({ success: true, href: config.domain + '/' });

})

app.get('/link', async (req, res) => {
    const settings = await db.query('SELECT * FROM config WHERE name LIKE ?', ['linkvertise_%']).then((res: any) => Object.fromEntries(res.map((setting: any) => [setting.name, setting.value])));
    const unHashedIp: string = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress as string || req.ip as string;
    const ip = crypto.createHash('sha256').update(unHashedIp).digest('hex');
    var limits = await db.query('SELECT * FROM linkvertiseCache WHERE ip = ?', [ip]).then((res: any) => res[0]);
    if (!limits) await db.query('INSERT INTO linkvertiseCache (ip, link, earnedCount, firstEarn) VALUES (?, ?, ?, ?)', [ip, '', 0, new Date()]);
    limits = await db.query('SELECT * FROM linkvertiseCache WHERE ip = ?', [ip]).then((res: any) => res[0]);
    if (limits && limits.earnedCount >= settings.linkvertise_limit && limits.firstEarn > new Date().getTime() - settings.linkvertise_limitTime * 60 * 60 * 1000) return res.json({ success: false, message: 'You have reached the limit of earning from linkvertise' });
    if (limits.firstEarn > new Date().getTime() - settings.linkvertise_limitTime * 60 * 60 * 1000) await db.query('UPDATE linkvertiseCache SET earnedCount = 0, firstEarn = ? WHERE ip = ?', [new Date(), ip]);
    const uuidForLink = crypto.randomBytes(16).toString('hex');
    const link = config.domain + '/linkvertise/lv?link=' + uuidForLink;
    const href = await linkvertise(link);
    await db.query('INSERT INTO linkvertiseCache (ip, link, earnedCount, firstEarn) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE earnedCount = earnedCount + 1, link = ?', [ip, uuidForLink, 1, new Date(), uuidForLink]);
    res.json({ success: true, href });
})

app.use('/settings', async (req: ReqWithUser, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.json({ success: false });
    const session = await db.query('SELECT * FROM sessions WHERE token = ?', [token]).then((res: any) => res[0]);
    if (!session) return res.json({ success: false });
    const user = await db.query('SELECT * FROM users WHERE id = ?', [session.user]).then((res: any) => res[0]);
    if (!user) return res.json({ success: false });
    const pterodactylUser: User = await getUser(user.pterodactyl, user.id).catch((e) => {
        return null as any;
    })
    if (user.role !== 'root_admin') return res.json({ success: false });
    req.user = {
        ...user,
        attributes: pterodactylUser.attributes

    }
    next();
})

app.get('/settings', async (req: ReqWithUser, res) => {
    const settings = await db.query('SELECT * FROM config WHERE name LIKE ?', ['linkvertise_%']).then((res: any) => Object.fromEntries(res.map((setting: any) => [setting.name, setting.value])));
    res.json({ success: true, settings });
})

app.post('/settings', async (req: ReqWithUser, res) => {
    const settings = req.body.settings;
    for (const setting in settings) {
        await db.query('UPDATE config SET value = ? WHERE name = ?', [settings[setting], setting]);
    }
    res.json({ success: true });
})







export default app;