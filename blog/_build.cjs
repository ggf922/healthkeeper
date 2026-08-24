#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { buildArticle } = require('./_generate.cjs');
const data1 = require('./_data1.cjs');
const data2 = require('./_data2.cjs');
const data3 = require('./_data3.cjs');

const DIR = __dirname;
const newArticles = [...data1, ...data2, ...data3];

// 기존 8편 메타데이터(목록 표시 + 네비게이션 순서용). 파일은 이미 존재하므로 재생성하지 않음.
const existing = [
  // AI 건강 분석 원리 시리즈 (카메라 카드 연결) — 맨 앞 배치
  { slug:'ppg-heart-rate-science' },
  { slug:'face-analysis-science' },
  { slug:'tongue-diagnosis-science' },
  { slug:'iris-eye-analysis-science' },
  { slug:'heart-rate-guide', icon:'❤️', category:'심혈관 건강', title:'정상 심박수는 몇일까? 심박수로 읽는 내 건강', short:'심박수 이야기', desc:'안정 시 심박수' },
  { slug:'blood-pressure-basics' },
  { slug:'blood-sugar-management' },
  { slug:'metabolism-basics' },
  { slug:'healthy-weight' },
  { slug:'immunity-boost' },
  { slug:'gut-health' },
  { slug:'liver-care' },
  { slug:'kidney-health' },
  { slug:'bone-joint-health' },
  { slug:'brain-health' },
  { slug:'mental-wellness' },
  { slug:'sleep-health', icon:'😴', category:'수면', title:'잘 자는 것이 곧 건강, 숙면을 위한 7가지 습관', short:'숙면 습관', desc:'수면' },
  { slug:'stress-management', icon:'🧘', category:'스트레스', title:'스트레스가 몸을 망친다? 마음 건강 관리법', short:'스트레스 관리', desc:'스트레스' },
  { slug:'balanced-diet', icon:'🥗', category:'식습관', title:'매일 챙기는 균형 잡힌 식단, 기본 원칙 5가지', short:'균형 잡힌 식단', desc:'식습관' },
  { slug:'protein-intake' },
  { slug:'vitamin-d' },
  { slug:'omega3-fats' },
  { slug:'water-hydration', icon:'💧', category:'생활 습관', title:'하루 물 얼마나 마셔야 할까? 수분 섭취의 과학', short:'수분 섭취', desc:'수분' },
  { slug:'walking-exercise', icon:'🚶', category:'운동', title:'가장 쉬운 운동, 걷기의 놀라운 건강 효과', short:'걷기 운동', desc:'운동' },
  { slug:'strength-training' },
  { slug:'stretching-flexibility' },
  { slug:'posture-correction' },
  { slug:'eye-health', icon:'👁️', category:'눈 건강', title:'디지털 시대의 눈 건강, 홍채와 눈 관리 상식', short:'눈 건강 상식', desc:'눈' },
  { slug:'eye-strain-digital' },
  { slug:'tongue-health', icon:'👅', category:'한방·자가진단', title:'혀 색깔이 알려주는 건강 신호, 설진 이야기', short:'혀 건강 신호', desc:'혀' },
  { slug:'skin-health' },
  { slug:'quit-smoking' },
  { slug:'alcohol-moderation' },
  { slug:'seasonal-health' },
];

// slug -> 메타 병합 (신규 데이터가 우선, 없으면 existing에 하드코딩된 메타)
const byNewSlug = Object.fromEntries(newArticles.map(a => [a.slug, a]));
function metaFor(slug) {
  const e = existing.find(x => x.slug === slug);
  const n = byNewSlug[slug];
  return {
    slug,
    icon: (n && n.icon) || (e && e.icon),
    category: (n && n.category) || (e && e.category),
    title: (n && n.title) || (e && e.title),
    short: (n && n.short) || (e && e.short),
  };
}

// 전체 읽기 순서 = existing 배열 순서
const order = existing.map(e => e.slug);
const orderMeta = order.map(metaFor);

// 1) 신규 22편 HTML 생성 (prev/next는 전체 순서 기준)
let generated = 0;
for (const a of newArticles) {
  const idx = order.indexOf(a.slug);
  const prev = idx > 0 ? orderMeta[idx-1] : null;
  const next = idx < orderMeta.length-1 ? orderMeta[idx+1] : null;
  const html = buildArticle(a, prev, next);
  fs.writeFileSync(path.join(DIR, a.slug + '.html'), html, 'utf8');
  generated++;
}
console.log('신규 아티클 생성:', generated, '편');

// 2) blog/index.html 재생성 — 카테고리별 그룹
const CATEGORIES = [
  { name:'🔬 AI 건강 분석 원리 (카메라 건강 체크)', slugs:['ppg-heart-rate-science','face-analysis-science','tongue-diagnosis-science','iris-eye-analysis-science'] },
  { name:'심혈관·대사 건강', slugs:['heart-rate-guide','blood-pressure-basics','blood-sugar-management','metabolism-basics','healthy-weight'] },
  { name:'면역·장기 건강', slugs:['immunity-boost','gut-health','liver-care','kidney-health'] },
  { name:'근골격·뇌·마음 건강', slugs:['bone-joint-health','brain-health','mental-wellness'] },
  { name:'운동·자세', slugs:['walking-exercise','strength-training','stretching-flexibility','posture-correction'] },
  { name:'수면·스트레스·생활 습관', slugs:['sleep-health','stress-management','water-hydration','quit-smoking','alcohol-moderation','seasonal-health'] },
  { name:'영양·식습관', slugs:['balanced-diet','protein-intake','vitamin-d','omega3-fats'] },
  { name:'눈·피부·자가진단', slugs:['eye-health','eye-strain-digital','skin-health','tongue-health'] },
];

// 카드용 요약(짧은 설명). 신규는 desc 사용, 기존 8편은 별도 문구.
const cardSummary = {
  'ppg-heart-rate-science':'스마트폰 카메라가 손가락 혈류의 색 변화로 심박수를 재는 PPG 원리와, 안정 시 심박수가 왜 중요한 건강 지표인지 알아봅니다.',
  'face-analysis-science':'의사가 진료 첫 단계에서 얼굴을 관찰하는 이유와, 창백·황달 등 안색이 드러내는 건강 신호를 설명합니다.',
  'tongue-diagnosis-science':'혀가 왜 전신 건강을 반영하는지, 혀 색과 설태가 알려주는 신호를 전통 설진과 현대의학 관점에서 살펴봅니다.',
  'iris-eye-analysis-science':'눈이 왜 혈관을 직접 보는 창인지, 결막·공막·망막 혈관이 알려주는 건강 신호를 최신 AI 연구까지 담아 설명합니다.',
  'heart-rate-guide':'안정 시 심박수의 의미부터 카메라 측정 원리, 심박수를 낮추는 생활 습관까지 정리했습니다.',
  'sleep-health':'수면 부족이 몸에 미치는 영향과, 오늘 밤부터 실천할 수 있는 수면 위생 습관을 소개합니다.',
  'balanced-diet':'탄단지 균형부터 가공식품 줄이기, 나트륨 관리까지 건강한 식습관의 핵심을 담았습니다.',
  'stress-management':'만성 스트레스가 신체에 미치는 영향과 실천 가능한 스트레스 완화법을 정리했습니다.',
  'tongue-health':'혀의 색과 상태로 컨디션을 살피는 전통 자가 관찰법과 카메라 혀 측정의 의미를 설명합니다.',
  'eye-health':'디지털 시대에 지친 눈을 지키는 20-20-20 법칙과 홍채 관찰의 의미, 눈에 좋은 영양소를 소개합니다.',
  'water-hydration':'물이 몸에서 하는 역할과 적정 수분 섭취량, 탈수 신호와 올바른 물 마시기 습관을 알려드립니다.',
  'walking-exercise':'하루 8천 보의 힘, 걷기가 심장·혈당·기분에 주는 효과와 올바른 걷기 자세를 정리했습니다.',
};
function summaryFor(slug){
  if (cardSummary[slug]) return cardSummary[slug];
  const n = byNewSlug[slug];
  return n ? n.desc : '';
}

function card(slug){
  const m = metaFor(slug);
  const sum = summaryFor(slug);
  return `            <a class="article-card" href="/blog/${slug}">
                <div class="thumb">${m.icon}</div>
                <div class="card-body">
                    <span class="tag">${m.category}</span>
                    <h3>${m.title}</h3>
                    <p>${sum}</p>
                    <span class="read-more">자세히 읽기 →</span>
                </div>
            </a>`;
}

const sectionsHtml = CATEGORIES.map(cat => {
  const cards = cat.slugs.map(card).join('\n\n');
  return `        <h2 class="related-title">${cat.name}</h2>
        <section class="article-grid">
${cards}
        </section>`;
}).join('\n\n');

const totalCount = order.length;

const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>건강 정보 - 건강 100세</title>
    <meta name="description" content="건강 100세가 전하는 믿을 수 있는 건강 정보 ${totalCount}편. 심혈관·대사·면역·운동·영양·수면·마음 건강까지, 일상에서 실천하는 건강 상식을 쉽고 정확하게 알려드립니다.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://healthkeeper.shop/blog">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="건강 100세">
    <meta property="og:title" content="건강 정보 - 건강 100세">
    <meta property="og:description" content="믿을 수 있는 건강 정보 ${totalCount}편. 심혈관·대사·면역·운동·영양·수면·마음 건강 상식을 쉽고 정확하게 알려드립니다.">
    <meta property="og:url" content="https://healthkeeper.shop/blog">
    <meta property="og:image" content="https://healthkeeper.shop/assets/logo.png">
    <meta property="og:locale" content="ko_KR">
    <meta name="twitter:card" content="summary">
    <link rel="icon" type="image/png" href="../assets/favicon.png">
    <link rel="stylesheet" href="../page.css?v=20260823">
</head>
<body>
    <nav class="page-nav">
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
    </nav>

    <main class="page-wrap">
        <header class="page-hero">
            <span class="hero-icon">📚</span>
            <h1>건강 정보</h1>
            <p class="hero-sub">일상에서 바로 실천하는 건강 상식을 쉽고 정확하게. 총 ${totalCount}편의 건강 아티클을 만나보세요.</p>
        </header>

${sectionsHtml}

        <div class="doc-card" style="margin-top:36px;">
            <div class="callout">
                📌 본 건강 정보 콘텐츠는 일반적인 건강 상식 제공을 목적으로 하며, 의학적 진단이나 치료를 대체하지 않습니다. 개별 건강 문제는 반드시 전문 의료인과 상담하세요. (<a href="/disclaimer">면책조항</a>)
            </div>
        </div>
    </main>

    <footer class="page-footer">
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
    </footer>
</body>
</html>
`;
fs.writeFileSync(path.join(DIR, 'index.html'), indexHtml, 'utf8');
console.log('blog/index.html 재생성 완료. 총 아티클:', totalCount, '편, 카테고리:', CATEGORIES.length);

// 3) 기존 8편의 prev/next 네비게이션을 새 순서에 맞게 갱신
const EXISTING_FILES = ['heart-rate-guide','sleep-health','balanced-diet','stress-management','tongue-health','eye-health','water-hydration','walking-exercise'];
let navFixed = 0;
for (const slug of EXISTING_FILES) {
  const fp = path.join(DIR, slug + '.html');
  let html = fs.readFileSync(fp, 'utf8');
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? orderMeta[idx-1] : null;
  const next = idx < orderMeta.length-1 ? orderMeta[idx+1] : null;
  const prevLink = prev ? `<a class="prev" href="/blog/${prev.slug}">← 이전 글: ${prev.short}</a>` : `<a class="prev" href="/blog">← 건강 정보 목록</a>`;
  const nextLink = next ? `<a class="next" href="/blog/${next.slug}">다음 글: ${next.short} →</a>` : `<a class="next" href="/blog">건강 정보 목록 →</a>`;
  const navBlock = `<div class="article-nav">\n                ${prevLink}\n                ${nextLink}\n            </div>`;
  html = html.replace(/<div class="article-nav">[\s\S]*?<\/div>/, navBlock);
  fs.writeFileSync(fp, html, 'utf8');
  navFixed++;
}
console.log('기존 아티클 네비게이션 갱신:', navFixed, '편');

// 4) sitemap.xml 자동 생성 (루트 페이지 + 블로그 인덱스 + 전체 아티클)
const SITE = 'https://healthkeeper.shop';
const today = new Date().toISOString().slice(0, 10);
// 루트 페이지: [경로, 우선순위, 변경주기]
const rootPages = [
  ['/',            '1.0', 'weekly'],
  ['/about',       '0.6', 'monthly'],
  ['/blog',        '0.9', 'weekly'],
  ['/contact',     '0.5', 'monthly'],
  ['/privacy',     '0.3', 'yearly'],
  ['/terms',       '0.3', 'yearly'],
  ['/disclaimer',  '0.3', 'yearly'],
];
function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
const rootEntries = rootPages.map(([p, pr, cf]) => urlEntry(p, pr, cf));
const articleEntries = order.map(slug => urlEntry(`/blog/${slug}`, '0.8', 'monthly'));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...rootEntries, ...articleEntries].join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIR, '..', 'sitemap.xml'), sitemap, 'utf8');
console.log('sitemap.xml 생성 완료. 총 URL:', rootPages.length + order.length, '개');
