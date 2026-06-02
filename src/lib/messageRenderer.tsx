import React from 'react';

const LINK_STYLE: React.CSSProperties = {
  color: '#57ebdd',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  cursor: 'pointer',
  fontWeight: 500,
};

type Segment =
  | { type: 'text'; value: string }
  | { type: 'mdLink'; text: string; url: string }
  | { type: 'phone'; display: string; digits: string }
  | { type: 'bareUrl'; url: string }
  | { type: 'bold'; children: Segment[] }
  | { type: 'italic'; children: Segment[] };

// Markdown link: [text](url)
const MD_LINK_SRC = '\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]+)\\)';

// Phone numbers in common formats, optionally preceded by a label
// Matches: (843) 448-4050 | 843-448-4050 | 843.448.4050 | 8434484050
// Optional label prefix: Phone: | Call: | Tel: | phone | call | tel
const PHONE_SRC =
  '(?:(?:Phone|Call|Tel|phone|call|tel)[:\\s]+)?' +
  '(?:\\(\\d{3}\\)[\\s\\-.]?\\d{3}[\\-.]\\d{4}' +   // (NNN) NNN-NNNN
  '|\\d{3}[\\-.]\\d{3}[\\-.]\\d{4}' +               // NNN-NNN-NNNN or NNN.NNN.NNNN
  '|\\d{10})';                                        // NNNNNNNNNN

// Bare URL not inside a markdown link
const BARE_URL_SRC = '(?<!\\()https?:\\/\\/[^\\s)>]+';

const COMBINED = new RegExp(
  `(${MD_LINK_SRC})|(${PHONE_SRC})|(${BARE_URL_SRC})`,
  'g'
);

// Identifies which capture group fired
const MD_LINK_RE = new RegExp(`^${MD_LINK_SRC}$`);
const PHONE_RE = new RegExp(
  '^(?:(?:Phone|Call|Tel|phone|call|tel)[:\\s]+)?' +
  '(?:\\(\\d{3}\\)[\\s\\-.]?\\d{3}[\\-.]\\d{4}' +
  '|\\d{3}[\\-.]\\d{3}[\\-.]\\d{4}' +
  '|\\d{10})$'
);

const INLINE_TAG_RE = /(<b>[\s\S]*?<\/b>|<i>[\s\S]*?<\/i>|\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/;

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;

  for (const match of text.matchAll(COMBINED)) {
    const start = match.index ?? 0;
    if (start > last) {
      segments.push({ type: 'text', value: text.slice(last, start) });
    }

    const full = match[0];

    if (MD_LINK_RE.test(full)) {
      const inner = full.match(MD_LINK_RE)!;
      segments.push({ type: 'mdLink', text: inner[1], url: inner[2] });
    } else if (PHONE_RE.test(full)) {
      const digits = full.replace(/\D/g, '');
      segments.push({ type: 'phone', display: full, digits });
    } else {
      segments.push({ type: 'bareUrl', url: full });
    }

    last = start + full.length;
  }

  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }

  return segments;
}

function parseLineSegments(line: string): Segment[] {
  const parts = line.split(INLINE_TAG_RE);
  const result: Segment[] = [];

  for (const part of parts) {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      const inner = part.slice(3, -4);
      result.push({ type: 'bold', children: parseSegments(inner) });
    } else if (part.startsWith('<i>') && part.endsWith('</i>')) {
      const inner = part.slice(3, -4);
      result.push({ type: 'italic', children: parseSegments(inner) });
    } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      result.push({ type: 'bold', children: parseSegments(inner) });
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1);
      result.push({ type: 'italic', children: parseSegments(inner) });
    } else if (part.length > 0) {
      result.push(...parseSegments(part));
    }
  }

  return result;
}

function renderSegment(seg: Segment, key: string): React.ReactNode {
  switch (seg.type) {
    case 'text':
      return <React.Fragment key={key}>{seg.value}</React.Fragment>;
    case 'mdLink':
      return (
        <a key={key} href={seg.url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {seg.text}
        </a>
      );
    case 'phone':
      return (
        <a key={key} href={`tel:+1${seg.digits}`} style={LINK_STYLE}>
          {seg.display}
        </a>
      );
    case 'bareUrl':
      return (
        <a key={key} href={seg.url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {seg.url}
        </a>
      );
    case 'bold':
      return (
        <strong key={key}>
          {seg.children.map((child, i) => renderSegment(child, `${key}-b${i}`))}
        </strong>
      );
    case 'italic':
      return (
        <em key={key}>
          {seg.children.map((child, i) => renderSegment(child, `${key}-i${i}`))}
        </em>
      );
  }
}

export function renderAgentMessage(content: string): React.ReactNode[] {
  const lines = content.split('\n');

  return lines.flatMap((line, lineIdx) => {
    const segments = parseLineSegments(line);
    const nodes: React.ReactNode[] = segments.map((seg, i) =>
      renderSegment(seg, `${lineIdx}-${i}`)
    );

    if (lineIdx < lines.length - 1) {
      nodes.push(<br key={`br-${lineIdx}`} />);
    }

    return nodes;
  });
}
