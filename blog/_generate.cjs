#!/usr/bin/env node
/* 건강 100세 블로그 아티클 생성기
 * data 배열의 구조화된 콘텐츠를 받아 사이트 템플릿에 맞춰 HTML을 생성합니다.
 * 기존 8편은 existing 배열로 index 목록에만 포함합니다.
 */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const NAV = `    <nav class="page-nav">
        <a class="nav-brand" href="/">
            <img src="../assets/logo.png" alt="건강 100세 로고">
            <span>건강 100세</span>
        </a>
        <div class="nav-links">
            <a href="/about">소개</a>
            <a href="/blog">건강정보</a>
            <a href="/contact">문의</a>
            <a class="home-cta" href="/">건강 체크 시작 →</a>
        </div>
    </nav>`;

const FOOTER = `    <footer class="page-footer">
        <div class="foot-links">
            <a href="/">홈</a>
            <a href="/about">서비스 소개</a>
            <a href="/blog">건강 정보</a>
            <a href="/privacy">개인정보처리방침</a>
            <a href="/terms">이용약관</a>
            <a href="/disclaimer">면책조항</a>
            <a href="/contact">문의하기</a>
        </div>
        <p class="company-line">
            (주)모두모두닷컴 | 대표 이언경 | 사업자등록번호 764-88-03661 | 통신판매업신고 제 2026 - 서울 송파 - 2122호<br>
            서울특별시 송파구 법원로 11길 25, 4층 제비-414호 (문정동, 에이치 비지니스파크)
        </p>
        <p class="copyright">© 2025 건강 100세 (모두모두닷컴). All rights reserved.</p>
    </footer>`;

const DISCLAIMER = `            <div class="callout warn">
                본 글은 일반적인 건강 정보 제공을 목적으로 하며, 의학적 진단이나 치료를 대체하지 않습니다. 개별 건강 문제는 반드시 전문 의료인과 상담하세요. (<a href="/disclaimer">면책조항</a>)
            </div>`;

// 본문 블록 렌더러
function renderBlock(b) {
  switch (b.t) {
    case 'p': return `            <p>${b.v}</p>`;
    case 'h2': return `            <h2 id="${b.id}">${b.v}</h2>`;
    case 'h3': return `            <h3>${b.v}</h3>`;
    case 'ul': return `            <ul>\n${b.items.map(i => `                <li>${i}</li>`).join('\n')}\n            </ul>`;
    case 'ol': return `            <ol>\n${b.items.map(i => `                <li>${i}</li>`).join('\n')}\n            </ol>`;
    case 'callout': return `            <div class="callout">\n                ${b.v}\n            </div>`;
    case 'warn': return `            <div class="callout warn">\n                ${b.v}\n            </div>`;
    case 'table': return `            <table>\n                <thead>\n                    <tr>${b.head.map(h=>`<th>${h}</th>`).join('')}</tr>\n                </thead>\n                <tbody>\n${b.rows.map(r=>`                    <tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('\n')}\n                </tbody>\n            </table>`;
    default: return '';
  }
}

function renderTOC(sections) {
  const links = sections.map((s, i) => `                <a href="#${s.id}">${i+1}. ${s.title}</a>`).join('<br>\n');
  return `            <div class="article-toc">\n                <strong>목차</strong>\n${links}\n            </div>`;
}

function buildArticle(a, prev, next) {
  // sections: [{id,title, blocks:[...]}]  -> TOC + h2/blocks
  const sections = a.sections;
  const bodyParts = [];
  bodyParts.push(`            <p>${a.intro}</p>`);
  bodyParts.push(renderTOC(sections));
  for (const s of sections) {
    bodyParts.push(`            <h2 id="${s.id}">${s.title}</h2>`);
    for (const b of s.blocks) bodyParts.push(renderBlock(b));
  }
  bodyParts.push(DISCLAIMER);
  if (a.cta) {
    bodyParts.push(`            <div class="callout">\n                💡 ${a.cta}<br>\n                <a href="/">👉 건강 체크 시작하기</a>\n            </div>`);
  }
  // nav
  const prevLink = prev ? `<a class="prev" href="/blog/${prev.slug}">← 이전 글: ${prev.short}</a>` : `<a class="prev" href="/blog">← 건강 정보 목록</a>`;
  const nextLink = next ? `<a class="next" href="/blog/${next.slug}">다음 글: ${next.short} →</a>` : `<a class="next" href="/blog">건강 정보 목록 →</a>`;
  bodyParts.push(`            <div class="article-nav">\n                ${prevLink}\n                ${nextLink}\n            </div>`);

  const body = bodyParts.join('\n\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${a.title} - 건강 100세</title>
    <meta name="description" content="${a.desc}">
    <link rel="icon" type="image/png" href="../assets/favicon.png">
    <link rel="stylesheet" href="../page.css?v=20260822">
</head>
<body>
${NAV}

    <main class="page-wrap">
        <header class="page-hero">
            <span class="hero-icon">${a.icon}</span>
            <h1>${a.title}</h1>
            <div class="article-meta">
                <span class="tag">${a.category}</span>
                <span>2026년 8월 22일</span>
                <span>· 약 ${a.readmin}분 분량</span>
            </div>
        </header>

        <article class="doc-card article-body">
${body}
        </article>
    </main>

${FOOTER}
</body>
</html>
`;
}

module.exports = { buildArticle, renderBlock, renderTOC, NAV, FOOTER, DISCLAIMER };
