import type { Root, Content, Heading } from 'mdast';

function nodeText(n: any): string {
  if (!n) return '';
  if (typeof n.value === 'string') return n.value;
  if (Array.isArray(n.children)) return n.children.map(nodeText).join('');
  return '';
}

export function remarkStripTitleH1(title: string) {
  const normalized = String(title || '').trim().toLowerCase();
  return function stripTitleH1() {
    return (tree: Root) => {
      if (!Array.isArray((tree as any).children)) return;
      const children = (tree as any).children as Content[];
      for (let i = 0; i < children.length; i++) {
        const node = children[i] as any;
        if (node && node.type === 'heading' && (node as Heading).depth === 1) {
          const text = nodeText(node).trim().toLowerCase();
          if (!normalized || text === normalized) {
            children.splice(i, 1);
          }
          break;
        }
      }
    };
  };
}
