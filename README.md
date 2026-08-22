# 건강 100세 (HealthKeeper)

맞춤형 건강식품·영양제 추천 서비스. 8가지 설문 + 카메라 기반 건강 체크(심박수·얼굴·혀·홍채) + AI 분석을 통해 개인 맞춤형 건강 리포트와 영양제를 추천합니다.

- **운영 사이트**: https://healthkeeper.store
- **배포 플랫폼**: Vercel (정적 사이트)
- **백엔드/DB**: Supabase (PostgreSQL / Auth)

## 주요 기능

- 📋 **8가지 건강 설문**: 나이, 성별, 건강 고민, 수면, 운동, 식사, 스트레스, 현재 영양제
- 📸 **카메라 건강 체크** (MediaPipe 기반)
  - ❤️ 심박수 측정 (15초)
  - 👤 얼굴 분석 (혈색/피부톤)
  - 👅 혀 진단 (한의학 기반 색상 분석)
  - 👁️ 홍채 진단 (눈 건강/전반 건강)
- 🤖 **AI 건강 분석 리포트** (OpenAI / AI Hub 연동)
- 💊 **맞춤형 영양제 추천** (필수/권장/선택)
- 🌏 **다국어 지원**: 한국어 / English / 中文 / 日本語
- 👤 **회원 시스템**: 회원가입/로그인, 건강 기록 자동 저장
- 🎁 **레퍼럴 시스템**: 추천 코드, 보너스 크레딧
- 🔍 **AI 검사 크레딧**: 무료 3회 제공, 회원 간 크레딧 전송
- 🔧 **관리자 대시보드**: 통계, AI API 키 관리
- 🛒 **쇼핑몰 연동**: 추천 영양제 구매 링크

## 프로젝트 구조

```
webapp/
├── index.html          # 메인 SPA 페이지 (모든 화면/모달 포함)
├── styles.css          # 전체 스타일시트
├── script.js           # 앱 로직 (설문/카메라/AI/결과/회원)
├── i18n.js             # 다국어 번역 데이터 (ko/en/zh/ja)
├── supabase-db.js      # Supabase 데이터베이스 연동 모듈
├── vercel.json         # Vercel 배포 설정 (보안 헤더, cleanUrls)
├── package.json        # 로컬 개발용 스크립트
└── ecosystem.config.cjs# PM2 로컬 서버 설정 (개발용)
```

## 기술 스택

- **Frontend**: Vanilla JS + HTML + CSS (빌드 불필요, 순수 정적 사이트)
- **DB/Auth**: Supabase (`@supabase/supabase-js@2` CDN)
- **카메라 분석**: MediaPipe (face_mesh, camera_utils 등 CDN)
- **AI 분석**: OpenAI API / AI Hub API (관리자 대시보드에서 키 설정)
- **배포**: Vercel

## 로컬 개발

```bash
# 정적 서버 실행 (기본 포트 3000)
npm run dev
# 또는 PM2 사용
pm2 start ecosystem.config.cjs
```

브라우저에서 http://localhost:3000 접속.

> ⚠️ 카메라 기능은 **HTTPS 환경**에서만 동작합니다 (로컬 localhost 예외).

## 데이터 아키텍처

- **저장소**: Supabase(PostgreSQL). Supabase 연결 실패 시 localStorage로 폴백.
- **주요 데이터**
  - `users`: 회원 정보, AI 크레딧, 레퍼럴 코드
  - 건강 체크 기록 (설문 응답 + 카메라 분석 결과 + AI 리포트)
  - 관리자 설정 (AI API 키 등)

## 배포 (Vercel)

1. GitHub 저장소를 Vercel 프로젝트에 연결
2. 프레임워크: **Other (정적)** / 빌드 명령 없음 / 출력 디렉토리: 루트(`.`)
3. `vercel.json`의 보안 헤더가 자동 적용됨
4. Supabase 프로젝트 URL/Anon Key는 `supabase-db.js`에 설정됨

## 향후 개발 권장 사항

- [ ] Supabase URL/Key를 환경변수 기반으로 분리 (빌드 스텝 추가 시)
- [ ] 건강 리포트 PDF/이미지 저장 기능
- [ ] 카메라 측정 정확도 개선
- [ ] 관리자 대시보드 상세 분석 기능 확장

## 라이선스

MIT

---
_최종 업데이트: 2026-08-22_
