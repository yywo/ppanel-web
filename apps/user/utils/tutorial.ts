const BASE_URL = 'https://cdn.jsdelivr.net/gh/perfect-panel/ppanel-tutorial';

export async function getTutorial(path: string): Promise<string> {
  try {
    const url = `${BASE_URL}/${path}`;
    await fetch(url.replace('cdn', 'purge'));
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const markdown = addPrefixToImageUrls(text, getUrlPrefix(url));
    return markdown;
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
  return await getTutorial('SUMMARY.md').then((markdown) => {
    const map = parseTutorialToMap(markdown);
    map.forEach((value, key) => {
      map.set(
        key,
        value.filter((item) => item.title !== 'README'),
      );
    });
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
