import LinkvertiseSettings from '@/views/linkvertise/index';
import lv from '@/views/linkvertise/lv';
import gen from '@/views/linkvertise/gen';
export default {
    dashboard: [
        {
            path: '/linkvertise',
            component: gen,
            name: 'Linkvertise Earn',
            icon: 'fas fa-money-check-alt green',
            category: 'Coins & Resources',
        },
        {
            path: '/linkvertise/lv',
            component: lv,
            name: 'Linkvertise',
            icon: 'fas fa-link blue',
            category: 'Hidden',
        },
        {
            path: '/admin/linkvertise-earn',
            component: LinkvertiseSettings,
            name: 'Linkvertise Earn',
            icon: 'fas fa-link blue',
            category: 'Admin',
            admin: true
        }],
    public: []
}