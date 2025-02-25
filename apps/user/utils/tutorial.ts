import matter from 'gray-matter';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/perfect-panel/ppanel-tutorial';

async function getVersion() {
  // API rate limit: 60 requests per hour
  const response = await fetch(
    'https://api.github.com/repos/perfect-panel/ppanel-tutorial/commits',
  );
  const json = await response.json();
  return json[0].sha;
}

async function getVersionPath() {
  return getVersion()
    .then(version => `${BASE_URL}@${version}`)
    .catch(error => {
      console.warn('Error fetching the version:', error);
      return BASE_URL;
    });
}

export async function getTutorial(path: string): Promise<{
  config?: Record<string, unknown>;
  content: string;
}> {
  const versionPath = await getVersionPath();
  try {
    const url = `${versionPath}/${path}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const { data, content } = matter(text);
    const markdown = addPrefixToImageUrls(content, getUrlPrefix(url));
    return {
      config: data,
      content: markdown,
    };
  } catch (error) {
    console.error('Error fetching the markdown file:', error);
    throw error;
  }
}

type TutorialItem = {
  title: string;
  path: string;
  subItems?: TutorialItem[];
};

export async function getTutorialList() {
  return await getTutorial('SUMMARY.md').then(({ config, content }) => {
    const navigation = config as Record<string, TutorialItem[]> | undefined;
    let map = new Map<string, TutorialItem[]>();
    if (navigation) {
      for (const value of Object.values(navigation)) {
        for (const item of value) {
          if (item.subItems) {
            for (const subItem of item.subItems) {
              if ("icon" in subItem && typeof subItem.icon === 'string' && !subItem.icon.startsWith('http')) {
                subItem.icon = `${BASE_URL}/${subItem.icon}`;
              }
            }
          }
        }
      }
      map = new Map(Object.entries(navigation));
    } else {
      map = parseTutorialToMap(content);
    }
    return map;
  });
}

function parseTutorialToMap(markdown: string): Map<string, TutorialItem[]> {
  const map = new Map<string, TutorialItem[]>();
  let currentSection = '';
  const lines = markdown.split('\n');

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      map.set(currentSection, []);
    } else if (line.startsWith('* ')) {
      const [, text, link] = line.match(/\* \[(.*?)\]\((.*?)\)/) || [];
      if (text && link) {
        if (!map.has(currentSection)) {
          map.set(currentSection, []);
        }
        map.get(currentSection)!.push({ title: text, path: link });
      }
    } else if (line.startsWith('  * ')) {
      const [, text, link] = line.match(/\* \[(.*?)\]\((.*?)\)/) || [];
      if (text && link) {
        const lastItem = map.get(currentSection)?.slice(-1)[0];
        if (lastItem) {
          if (!lastItem.subItems) {
            lastItem.subItems = [];
          }
          lastItem.subItems.push({ title: text, path: link });
        }
      }
    }
  }

  return map;
}
function getUrlPrefix(url: string): string {
  return url.replace(/\/[^/]+\.md$/, '/');
}
function addPrefixToImageUrls(markdown: string, prefix: string): string {
  return markdown.replace(/!\[(.*?)\]\((.*?)\)/g, (match, imgAlt, imgUrl) => {
    return `![${imgAlt}](${imgUrl.startsWith('http') ? imgUrl : `${prefix}${imgUrl}`})`;
  });
}
