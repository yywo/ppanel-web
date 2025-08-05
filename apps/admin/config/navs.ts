export const navs = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'flat-color-icons:globe',
  },
  {
    title: 'System Management',
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
      },
      {
        title: 'Payment Config',
        url: '/dashboard/payment',
        icon: 'flat-color-icons:currency-exchange',
      },
      {
        title: 'Subscribe Config',
        url: '/dashboard/subscribe',
        icon: 'flat-color-icons:ruler',
      },
      {
        title: 'ADS Config',
        url: '/dashboard/ads',
        icon: 'flat-color-icons:electrical-sensor',
      },
      {
        title: 'System Tool',
        url: '/dashboard/tool',
        icon: 'flat-color-icons:info',
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
      {
        title: 'Product Management',
        url: '/dashboard/product',
        icon: 'flat-color-icons:shop',
      },
      {
        title: 'Application Management',
        url: '/dashboard/application',
        icon: 'flat-color-icons:touchscreen-smartphone',
      },
    ],
  },
  {
    title: 'Finance',
    items: [
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
        items: [
          {
            title: 'User Detail',
            url: '/dashboard/user/:id',
          },
        ],
      },
      {
        title: 'Marketing Management',
        url: '/dashboard/marketing',
        icon: 'flat-color-icons:bullish',
      },
      {
        title: 'Announcement Management',
        url: '/dashboard/announcement',
        icon: 'flat-color-icons:advertising',
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
];

export function findNavByUrl(url: string) {
  function matchDynamicRoute(pattern: string, path: string): boolean {
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  function findNav(items: any[], url: string, path: any[] = []): any[] {
    for (const item of items) {
      if (item.url === url || (item.url && matchDynamicRoute(item.url, url))) {
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
