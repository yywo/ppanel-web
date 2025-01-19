export const AuthControl = [
  {
    title: 'General',
    url: '/dashboard/auth-control/general',
  },
  {
    title: 'Email',
    url: '/dashboard/auth-control/email',
  },
  {
    title: 'Phone Number',
    url: '/dashboard/auth-control/phone',
  },
  {
    title: 'Telegram',
    url: '/dashboard/auth-control/telegram',
  },
  {
    title: 'Apple',
    url: '/dashboard/auth-control/apple',
  },
  {
    title: 'Google',
    url: '/dashboard/auth-control/google',
  },
  {
    title: 'Facebook',
    url: '/dashboard/auth-control/facebook',
  },
  // {
  //   title: 'Twitter',
  //   url: '/dashboard/auth-control/twitter',
  // },
  {
    title: 'GitHub',
    url: '/dashboard/auth-control/github',
  },
];

export const navs = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'flat-color-icons:globe',
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'System Config',
        url: '/dashboard/system',
        icon: 'flat-color-icons:services',
      },
      {
        title: 'Auth Control',
        url: '/dashboard/auth-control',
        icon: 'flat-color-icons:lock-portrait',
        items: AuthControl,
      },
      {
        title: 'Payment Config',
        url: '/dashboard/payment',
        icon: 'flat-color-icons:currency-exchange',
      },
    ],
  },
  {
    title: 'Server',
    items: [
      {
        title: 'Server Management',
        url: '/dashboard/server',
        icon: 'flat-color-icons:data-protection',
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Subscribe Management',
        url: '/dashboard/subscribe',
        icon: 'flat-color-icons:shop',
      },
      {
        title: 'Order Management',
        url: '/dashboard/order',
        icon: 'flat-color-icons:todo-list',
      },
      {
        title: 'Coupon Management',
        url: '/dashboard/coupon',
        icon: 'flat-color-icons:bookmark',
      },
    ],
  },
  {
    title: 'User',
    items: [
      {
        title: 'User Management',
        url: '/dashboard/user',
        icon: 'flat-color-icons:conference-call',
      },
      {
        title: 'Announcement Management',
        url: '/dashboard/announcement',
        icon: 'flat-color-icons:news',
      },
      {
        title: 'Ticket Management',
        url: '/dashboard/ticket',
        icon: 'flat-color-icons:collaboration',
      },
      {
        title: 'Document Management',
        url: '/dashboard/document',
        icon: 'flat-color-icons:document',
      },
    ],
  },
  {
    title: 'System Tool',
    url: '/dashboard/tool',
    icon: 'flat-color-icons:info',
  },
];

export function findNavByUrl(url: string) {
  function findNav(items: any[], url: string, path: any[] = []): any[] {
    for (const item of items) {
      if (item.url === url) {
        return [...path, item];
      }
      if (item.items) {
        const result = findNav(item.items, url, [...path, item]);
        if (result.length) {
          return result;
        }
      }
    }
    return [];
  }

  return findNav(navs, url);
}
