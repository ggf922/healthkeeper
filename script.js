// 건강 체크 설문 데이터 (동적으로 로드)
let surveyQuestions = [];

// 영양제 데이터베이스 (아이콘만 보관, 나머지는 다국어)
const supplements = {
    multivitamin: { icon: "💊" },
    omega3: { icon: "🐟" },
    vitaminD: { icon: "☀️" },
    probiotics: { icon: "🦠" },
    magnesium: { icon: "⚡" },
    vitaminB: { icon: "⚡" },
    iron: { icon: "🔴" },
    calcium: { icon: "🦴" },
    glucosamine: { icon: "🦵" },
    lutein: { icon: "👁️" },
    collagen: { icon: "✨" },
    vitaminC: { icon: "🍊" },
    ashwagandha: { icon: "🌿" },
    coq10: { icon: "❤️" }
};

// 영양제 정보 가져오기 (다국어 지원)
function getSupplement(key) {
    const info = getSupplementInfo(key);
    return {
        ...info,
        icon: supplements[key].icon
    };
}

// 앱 상태
let currentQuestion = 0;
let answers = {};
let cameraResults = {
    heartRate: null,
    faceAnalysis: null,
    tongueAnalysis: null,
    irisAnalysis: null
};
let currentCameraStep = 0;
let videoStream = null;
let currentUser = null;
let lastAnalysisResult = null; // 마지막 분석 결과 저장

// ==================== 사용자 인증 시스템 ====================

// 레퍼럴 코드 생성
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HEALTH';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// 사용자 데이터 가져오기 (동기 함수 - localStorage 우선, Firestore는 백그라운드 동기화)
let usersCache = null;
let usersCacheTime = 0;
const CACHE_DURATION = 5000; // 5초 캐시

function getUsers() {
    // 캐시 확인
    const now = Date.now();
    if (usersCache && (now - usersCacheTime) < CACHE_DURATION) {
        return usersCache;
    }
    
    // localStorage에서 가져오기 (즉시 반환)
    const users = localStorage.getItem('healthUsers');
    const parsed = users ? JSON.parse(users) : [];
    usersCache = parsed;
    usersCacheTime = now;
    
    // Supabase에서 백그라운드로 동기화 (비동기)
    if (typeof getUsersFromSupabase === 'function') {
        getUsersFromSupabase().then(supabaseUsers => {
            if (supabaseUsers && supabaseUsers.length > 0) {
                // Supabase 데이터가 더 최신이면 업데이트
                const localTime = localStorage.getItem('healthUsers_syncTime') || 0;
                const supabaseTime = Date.now();
                
                // Supabase 데이터로 업데이트
                usersCache = supabaseUsers;
                usersCacheTime = supabaseTime;
                localStorage.setItem('healthUsers', JSON.stringify(supabaseUsers));
                localStorage.setItem('healthUsers_syncTime', supabaseTime.toString());
                console.log('✅ Supabase에서 사용자 데이터 동기화 완료');
            }
        }).catch(error => {
            console.warn('Supabase 동기화 실패:', error);
        });
    }
    
    return parsed;
}

// 사용자 데이터 저장 (Firestore와 localStorage 모두 저장)
async function saveUsers(users) {
    // 캐시 업데이트
    usersCache = users;
    usersCacheTime = Date.now();
    
    // localStorage에 즉시 저장
    localStorage.setItem('healthUsers', JSON.stringify(users));
    localStorage.setItem('healthUsers_syncTime', Date.now().toString());
    
    // Supabase에 비동기로 저장 (백그라운드)
    if (typeof saveUsersToSupabase === 'function') {
        saveUsersToSupabase(users).then(() => {
            console.log('✅ Supabase에 사용자 데이터 저장 완료');
        }).catch(error => {
            console.warn('Supabase 저장 실패 (localStorage는 저장됨):', error);
        });
    }
}

// 현재 로그인한 사용자 가져오기
function getCurrentUser() {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return null;
    
    const users = getUsers();
    return users.find(u => u.email === email) || null;
}

// 관리자 여부 확인
function isAdmin() {
    return currentUser && currentUser.email === 'admin@health100.com';
}

// 로그인 상태 확인 및 UI 업데이트
function checkAuthState() {
    currentUser = getCurrentUser();
    
    if (currentUser) {
        // 로그인 상태
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-menu').style.display = 'block';
        document.getElementById('user-display-name').textContent = currentUser.name;
        
        // AI 크레딧 표시
        const creditsDisplay = document.getElementById('user-ai-credits');
        if (creditsDisplay) {
            creditsDisplay.textContent = currentUser.aiCredits || 0;
        }
        
        // 관리자 메뉴 표시
        const adminMenu = document.querySelector('.admin-only');
        if (adminMenu) {
            adminMenu.style.display = isAdmin() ? 'flex' : 'none';
        }
        
        // 드롭다운 이벤트 다시 설정 (UI 업데이트 후)
        setTimeout(() => {
            if (typeof setupDropdownEvents === 'function') {
                setupDropdownEvents();
            }
        }, 200);
    } else {
        // 로그아웃 상태
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('user-menu').style.display = 'none';
    }
}

// URL 파라미터에서 레퍼럴 코드 확인
function checkReferralLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
        console.log('✅ 레퍼럴 코드 감지:', referralCode);
        
        // 이미 로그인한 경우
        if (currentUser) {
            const lang = currentLanguage || 'ko';
            const message = lang === 'ko' ? '이미 로그인되어 있습니다. 레퍼럴 코드는 신규 회원가입 시 사용할 수 있습니다.' :
                           lang === 'en' ? 'You are already logged in. Referral codes can only be used for new signups.' :
                           lang === 'zh' ? '您已登录。推荐码仅适用于新用户注册。' :
                           '既にログインしています。紹介コードは新規登録時のみ使用できます。';
            alert(message);
            // URL 파라미터 제거
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        
        // 회원가입 모달 열기
        console.log('🔄 회원가입 모달 열기 시작...');
        showSignupModal();
        
        // 모달이 완전히 열린 후 레퍼럴 코드 입력
        setTimeout(() => {
            console.log('📝 레퍼럴 코드 자동 입력 시도...');
            const referralInput = document.getElementById('signup-referral');
            
            if (referralInput) {
                referralInput.value = referralCode;
                console.log('✅ 레퍼럴 코드 입력됨:', referralCode);
                
                // 레퍼럴 코드 유효성 확인
                const users = getUsers();
                const referrer = users.find(u => u.referralCode === referralCode);
                
                if (referrer) {
                    console.log('✅ 추천인 찾음:', referrer.name);
                    
                    // 추천인 정보 표시
                    const lang = currentLanguage || 'ko';
                    let message = '';
                    
                    if (lang === 'ko') {
                        message = `✅ ${referrer.name}님의 추천으로 회원가입하시면 보너스 포인트를 받을 수 있습니다!`;
                    } else if (lang === 'en') {
                        message = `✅ Sign up with ${referrer.name}'s referral to receive bonus points!`;
                    } else if (lang === 'zh') {
                        message = `✅ 通过${referrer.name}的推荐注册可获得奖励积分！`;
                    } else {
                        message = `✅ ${referrer.name}さんの紹介で登録するとボーナスポイントを獲得！`;
                    }
                    
                    // 안내 메시지 표시
                    const signupForm = document.querySelector('#signup-modal .modal-body');
                    if (signupForm && !document.getElementById('referral-welcome-msg')) {
                        const welcomeMsg = document.createElement('div');
                        welcomeMsg.id = 'referral-welcome-msg';
                        welcomeMsg.style.cssText = 'background: #e3f2fd; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #2196f3; color: #1976d2; font-weight: 500;';
                        welcomeMsg.textContent = message;
                        signupForm.insertBefore(welcomeMsg, signupForm.firstChild);
                        console.log('✅ 환영 메시지 표시됨');
                    }
                } else {
                    // 유효하지 않은 레퍼럴 코드
                    console.log('❌ 유효하지 않은 레퍼럴 코드');
                    referralInput.value = '';
                    const lang = currentLanguage || 'ko';
                    const message = lang === 'ko' ? '⚠️ 유효하지 않은 레퍼럴 코드입니다.' :
                                   lang === 'en' ? '⚠️ Invalid referral code.' :
                                   lang === 'zh' ? '⚠️ 无效的推荐码。' :
                                   '⚠️ 無効な紹介コードです。';
                    alert(message);
                }
            } else {
                console.error('❌ signup-referral 입력창을 찾을 수 없습니다!');
            }
            
            // URL 파라미터 제거
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('✅ URL 파라미터 제거됨');
        }, 800);
    }
}

// 회원가입 모달 열기
function showSignupModal() {
    // 회원가입은 외부 사이트로 연결
    window.location.href = 'https://modoo.auction/#/auth/register';
}

// 회원가입 모달 닫기
function closeSignupModal() {
    document.getElementById('signup-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('signup-form').reset();
    document.getElementById('signup-error').classList.remove('show');
}

// 로그인 모달 열기
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 로그인 모달 닫기
function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.remove('show');
}

// 모달 전환
function switchToSignup() {
    closeLoginModal();
    setTimeout(() => showSignupModal(), 100);
}

function switchToLogin() {
    closeSignupModal();
    setTimeout(() => showLoginModal(), 100);
}

// 회원가입 처리
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const referralCode = document.getElementById('signup-referral').value.trim().toUpperCase();
    
    const errorMsg = document.getElementById('signup-error');
    
    // 유효성 검사
    if (password !== passwordConfirm) {
        errorMsg.textContent = '비밀번호가 일치하지 않습니다.';
        errorMsg.classList.add('show');
        return;
    }
    
    if (password.length < 6) {
        errorMsg.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
        errorMsg.classList.add('show');
        return;
    }
    
    // 기존 사용자 확인
    let users = getUsers();
    if (users.find(u => u.email === email)) {
        errorMsg.textContent = '이미 가입된 이메일입니다.';
        errorMsg.classList.add('show');
        return;
    }
    
    // 레퍼럴 코드 확인
    let referredBy = null;
    let referrerName = null;
    if (referralCode) {
        const referrerIndex = users.findIndex(u => u.referralCode === referralCode);
        if (referrerIndex === -1) {
            errorMsg.textContent = '유효하지 않은 추천인 코드입니다.';
            errorMsg.classList.add('show');
            return;
        }
        
        referredBy = users[referrerIndex].email;
        referrerName = users[referrerIndex].name;
        
        // 추천인에게 포인트 및 추천수 추가
        users[referrerIndex].referralCount = (users[referrerIndex].referralCount || 0) + 1;
        users[referrerIndex].points = (users[referrerIndex].points || 0) + 100;
        
        console.log(`✅ 추천인 ${referrerName}(${referredBy})에게 포인트 100P 지급, 추천수: ${users[referrerIndex].referralCount}`);
    }
    
    // 새 사용자 생성
    const newUser = {
        name,
        email,
        password, // 실제 프로덕션에서는 해시해야 함
        referralCode: generateReferralCode(),
        referredBy,
        referredByName: referrerName, // 추천인 이름도 저장
        referralCount: 0,
        points: referredBy ? 50 : 0, // 추천받으면 50 포인트
        aiCredits: 3, // 기본 AI 크레딧 3개 제공
        joinDate: new Date().toISOString(),
        healthRecords: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    console.log(`✅ 새 회원 가입 완료: ${name}(${email}), 추천인: ${referredBy || '없음'}`);
    
    // 자동 로그인
    localStorage.setItem('currentUserEmail', email);
    
    // 최신 사용자 정보 가져오기
    const updatedUsers = getUsers();
    currentUser = updatedUsers.find(u => u.email === email);
    
    if (!currentUser) {
        currentUser = newUser;
    }
    
    // 모바일에서 모달이 확실히 닫히도록
    closeSignupModal();
    
    // UI 업데이트 (모바일에서도 확실히 작동하도록)
    setTimeout(() => {
        checkAuthState();
        
        // 환영 메시지
        let welcomeMsg = `🎉 회원가입을 환영합니다, ${name}님!`;
        if (referredBy) {
            welcomeMsg += `\n${referrerName}님의 추천으로 가입하셨습니다.`;
            welcomeMsg += `\n추천 보상 50 포인트가 지급되었습니다!`;
        }
        alert(welcomeMsg);
    }, 100);
}

// 로그인 처리
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    
    const errorMsg = document.getElementById('login-error');
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        errorMsg.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
        errorMsg.classList.add('show');
        return;
    }
    
    // 로그인 성공
    localStorage.setItem('currentUserEmail', email);
    
    // 최신 사용자 정보 가져오기
    const updatedUsers = getUsers();
    currentUser = updatedUsers.find(u => u.email === email);
    
    if (!currentUser) {
        currentUser = user;
    }
    
    // 모바일에서 모달이 확실히 닫히도록
    closeLoginModal();
    
    // UI 업데이트 (모바일에서도 확실히 작동하도록)
    setTimeout(() => {
        checkAuthState();
        alert(`👋 안녕하세요, ${user.name}님!`);
    }, 100);
}

// 로그아웃
function logout() {
    console.log('logout 함수 호출됨');
    
    // 모바일에서 confirm이 작동하지 않을 수 있으므로 즉시 로그아웃
    // 또는 사용자가 원하면 confirm 사용
    let shouldLogout = true;
    
    try {
        // confirm 시도 (실패하면 즉시 로그아웃)
        shouldLogout = confirm('로그아웃 하시겠습니까?');
    } catch (e) {
        console.log('confirm 실패, 즉시 로그아웃:', e);
        shouldLogout = true;
    }
    
    if (shouldLogout) {
        console.log('로그아웃 실행');
        localStorage.removeItem('currentUserEmail');
        currentUser = null;
        
        // 드롭다운 닫기
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
        
        // UI 업데이트
        checkAuthState();
        
        // 시작 화면으로
        showScreen('start-screen');
        
        console.log('로그아웃 완료');
    }
}

// 사용자 드롭다운 토글
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    const isActive = dropdown.classList.contains('active');
    dropdown.classList.toggle('active');
    
    // 드롭다운이 열릴 때 이벤트 리스너 다시 설정
    if (!isActive) {
        setTimeout(() => {
            if (typeof setupDropdownEvents === 'function') {
                setupDropdownEvents();
            }
        }, 50);
    }
}

// 외부 클릭시 드롭다운 닫기
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 설문 시작
function startSurvey() {
    currentQuestion = 0;
    answers = {};
    
    // 현재 언어의 설문 질문 로드
    loadSurveyQuestions();
    
    showScreen('survey-screen');
    renderQuestion();
}

// 설문 질문 로드
function loadSurveyQuestions() {
    const questionData = getSurveyQuestions();
    surveyQuestions = questionData.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        type: "single",
        options: q.options.map((opt, optIdx) => {
            // value는 영어 코드로 통일 (데이터 호환성)
            const values = [
                ["20s", "30s", "40s", "50s", "60+"],
                ["male", "female"],
                ["energy", "immunity", "digestion", "joints", "eyes", "skin", "stress"],
                ["less5", "5to6", "6to7", "7to8", "more8"],
                ["none", "rarely", "sometimes", "often", "daily"],
                ["irregular", "skip", "regular", "healthy"],
                ["very_high", "high", "moderate", "low", "very_low"],
                ["none", "one", "few", "many"]
            ];
            
            return {
                value: values[idx][optIdx],
                label: opt.label,
                icon: opt.icon
            };
        })
    }));
}

// 질문 렌더링
function renderQuestion() {
    const question = surveyQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;
    
    document.getElementById('progress').style.width = progress + '%';
    
    const questionText = currentLanguage === 'ko' ? '질문' : 
                        currentLanguage === 'en' ? 'Question' :
                        currentLanguage === 'zh' ? '问题' : '質問';
    
    document.getElementById('question-number').textContent = `${questionText} ${currentQuestion + 1}/${surveyQuestions.length}`;
    document.getElementById('question-title').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (answers[question.id] === option.value) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <span class="option-icon">${option.icon}</span>
            <span>${option.label}</span>
        `;
        
        optionDiv.onclick = () => selectOption(question.id, option.value);
        optionsContainer.appendChild(optionDiv);
    });
    
    // 버튼 상태 업데이트
    document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'block' : 'none';
    document.getElementById('next-btn').disabled = !answers[question.id];
    
    const nextText = currentQuestion === surveyQuestions.length - 1 ? t('survey-result') : t('survey-next');
    document.getElementById('next-btn').textContent = nextText;
    document.getElementById('prev-btn').textContent = t('survey-prev');
}

// 옵션 선택
function selectOption(questionId, value) {
    answers[questionId] = value;
    
    // 선택된 옵션 강조
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // 다음 버튼 활성화
    document.getElementById('next-btn').disabled = false;
}

// 다음 질문
function nextQuestion() {
    if (currentQuestion < surveyQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        // 설문 완료 후 카메라 체크 선택으로
        showScreen('camera-choice-screen');
    }
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

// 결과 분석
async function analyzeResults() {
    showScreen('loading-screen');
    
    const settings = getAdminAISettings();
    const hasAPIKey = !!settings.apiKey;
    const hasCredits = currentUser ? getUserAICredits() > 0 : false;
    const useAI = hasAPIKey && (currentUser ? hasCredits : false);
    
    if (useAI) {
        document.getElementById('loading-title').textContent = '🤖 AI 건강 분석 중...';
        document.getElementById('loading-message').textContent = 'GPT-4로 더 정확한 분석을 진행하고 있습니다';
    }
    
    // 기본 분석 수행
    const analysis = performAnalysis();
    
    // AI 분석 추가
    if (useAI) {
        try {
            // 크레딧 차감
            if (currentUser) {
                if (!deductAICredit()) {
                    throw new Error('AI 크레딧이 부족합니다');
                }
            }
            
            // AI 분석 생성
            const aiAnalysis = await generateAIAnalysis(answers, cameraResults, analysis.healthScore);
            if (aiAnalysis) {
                analysis.aiAnalysis = aiAnalysis;
            }
            
            // AI 영양제 추천 근거 생성
            const aiReason = await generateSupplementReason(analysis.recommendations, answers, analysis.healthScore);
            if (aiReason) {
                analysis.aiReason = aiReason;
            }
        } catch (error) {
            console.error('AI 분석 오류:', error);
            alert('⚠️ ' + error.message);
        }
    } else if (currentUser && !hasCredits) {
        // 검사 횟수 부족 알림
        analysis.aiMessage = '💡 AI 검사 가능 횟수가 부족합니다. 관리자에게 문의하세요.';
    } else if (!hasAPIKey) {
        // API 키 미설정
        analysis.aiMessage = '💡 AI 분석 기능이 준비 중입니다.';
    }
    
    displayResults(analysis);
    showScreen('result-screen');
}

// 분석 수행
function performAnalysis() {
    const age = answers[1];
    const gender = answers[2];
    const concern = answers[3];
    const sleep = answers[4];
    const exercise = answers[5];
    const diet = answers[6];
    const stress = answers[7];
    const currentSupplements = answers[8];
    
    let healthScore = 100;
    let recommendations = [];
    let tips = [];
    let summaryItems = [];
    let scoreBreakdown = []; // 점수 산출 근거

    // 점수 근거 라벨 (다국어)
    const sbLabels = {
        ko: { sleepLack: '수면 부족', exerciseLack: '운동 부족', dietPoor: '불규칙한 식사', stressHigh: '높은 스트레스', sleepGood: '충분한 수면', exerciseGood: '규칙적인 운동', heartAbnormal: '심박수 정상 범위 이탈', facePoor: '혈색 저하', tongueWarn: '혀 상태 주의', irisWarn: '홍채 상태 주의' },
        en: { sleepLack: 'Insufficient sleep', exerciseLack: 'Lack of exercise', dietPoor: 'Irregular meals', stressHigh: 'High stress', sleepGood: 'Adequate sleep', exerciseGood: 'Regular exercise', heartAbnormal: 'Heart rate out of normal range', facePoor: 'Poor complexion', tongueWarn: 'Tongue needs attention', irisWarn: 'Iris needs attention' },
        zh: { sleepLack: '睡眠不足', exerciseLack: '缺乏运动', dietPoor: '饮食不规律', stressHigh: '压力较高', sleepGood: '充足睡眠', exerciseGood: '规律运动', heartAbnormal: '心率超出正常范围', facePoor: '气色不佳', tongueWarn: '舌象需注意', irisWarn: '虹膜需注意' },
        ja: { sleepLack: '睡眠不足', exerciseLack: '運動不足', dietPoor: '不規則な食事', stressHigh: '高いストレス', sleepGood: '十分な睡眠', exerciseGood: '規則的な運動', heartAbnormal: '心拍数が正常範囲外', facePoor: '血色の低下', tongueWarn: '舌の状態に注意', irisWarn: '虹彩の状態に注意' }
    };
    const sbl = sbLabels[currentLanguage] || sbLabels.ko;
    const addScore = (delta, label) => { healthScore += delta; scoreBreakdown.push({ delta, label }); };
    
    // 건강 점수 계산
    if (sleep === 'less5' || sleep === '5to6') addScore(-15, sbl.sleepLack);
    if (exercise === 'none' || exercise === 'rarely') addScore(-15, sbl.exerciseLack);
    if (diet === 'irregular' || diet === 'skip') addScore(-10, sbl.dietPoor);
    if (stress === 'very_high' || stress === 'high') addScore(-20, sbl.stressHigh);
    if (sleep === '7to8' || sleep === 'more8') addScore(5, sbl.sleepGood);
    if (exercise === 'often' || exercise === 'daily') addScore(5, sbl.exerciseGood);
    
    // 카메라 결과 반영
    if (cameraResults.heartRate) {
        if (cameraResults.heartRate < 60 || cameraResults.heartRate > 100) {
            addScore(-10, sbl.heartAbnormal);
        }
    }
    
    if (cameraResults.faceAnalysis) {
        if (cameraResults.faceAnalysis.complexion.level === 'poor') {
            addScore(-5, sbl['facePoor']);
        }
    }
    
    if (cameraResults.tongueAnalysis) {
        if (cameraResults.tongueAnalysis.status === 'warning') {
            addScore(-5, sbl.tongueWarn);
        }
    }
    
    if (cameraResults.irisAnalysis) {
        if (cameraResults.irisAnalysis.status === 'warning') {
            addScore(-5, sbl.irisWarn);
        }
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    // 기본 추천 (모든 사람에게)
    recommendations.push({
        supplement: getSupplement('multivitamin'),
        priority: 'high',
        reason: getAnalysisText('multivitaminReason')
    });
    
    recommendations.push({
        supplement: getSupplement('omega3'),
        priority: 'high',
        reason: getAnalysisText('omega3Reason')
    });
    
    recommendations.push({
        supplement: getSupplement('vitaminD'),
        priority: 'medium',
        reason: getAnalysisText('vitaminDReason')
    });
    
    // 주요 건강 고민에 따른 추천
    if (concern === 'energy') {
        recommendations.push({
            supplement: getSupplement('vitaminB'),
            priority: 'high',
            reason: getAnalysisText('energyReason')
        });
        recommendations.push({
            supplement: getSupplement('coq10'),
            priority: 'medium',
            reason: getAnalysisText('cellEnergyReason')
        });
        summaryItems.push({
            title: getAnalysisText('energyTitle'),
            icon: '⚡',
            description: getAnalysisText('energyDesc')
        });
    }
    
    if (concern === 'immunity') {
        recommendations.push({
            supplement: getSupplement('vitaminC'),
            priority: 'high',
            reason: getAnalysisText('immunityBasicReason')
        });
        recommendations.push({
            supplement: getSupplement('probiotics'),
            priority: 'high',
            reason: getAnalysisText('gutHealthReason')
        });
        summaryItems.push({
            title: getAnalysisText('immunityTitle'),
            icon: '🛡️',
            description: getAnalysisText('immunityDesc')
        });
    }
    
    if (concern === 'digestion') {
        recommendations.push({
            supplement: getSupplement('probiotics'),
            priority: 'high',
            reason: getAnalysisText('digestionCoreReason')
        });
        summaryItems.push({
            title: getAnalysisText('digestionTitle'),
            icon: '🦠',
            description: getAnalysisText('digestionDesc')
        });
    }
    
    if (concern === 'joints') {
        recommendations.push({
            supplement: getSupplement('glucosamine'),
            priority: 'high',
            reason: getAnalysisText('jointHealthReason')
        });
        recommendations.push({
            supplement: getSupplement('calcium'),
            priority: 'high',
            reason: getAnalysisText('boneHealthReason')
        });
        summaryItems.push({
            title: getAnalysisText('jointsTitle'),
            icon: '🦴',
            description: getAnalysisText('jointsDesc')
        });
    }
    
    if (concern === 'eyes') {
        recommendations.push({
            supplement: getSupplement('lutein'),
            priority: 'high',
            reason: getAnalysisText('eyeHealthReason')
        });
        summaryItems.push({
            title: getAnalysisText('eyesTitle'),
            icon: '👁️',
            description: getAnalysisText('eyesDesc')
        });
    }
    
    if (concern === 'skin') {
        recommendations.push({
            supplement: getSupplement('collagen'),
            priority: 'high',
            reason: getAnalysisText('skinElasticityReason')
        });
        recommendations.push({
            supplement: getSupplement('vitaminC'),
            priority: 'medium',
            reason: getAnalysisText('collagenSynthesisReason')
        });
        summaryItems.push({
            title: getAnalysisText('skinTitle'),
            icon: '✨',
            description: getAnalysisText('skinDesc')
        });
    }
    
    if (concern === 'stress') {
        recommendations.push({
            supplement: getSupplement('magnesium'),
            priority: 'high',
            reason: getAnalysisText('stressReliefReason')
        });
        recommendations.push({
            supplement: getSupplement('ashwagandha'),
            priority: 'medium',
            reason: getAnalysisText('naturalStressReliefReason')
        });
        summaryItems.push({
            title: getAnalysisText('stressTitle'),
            icon: '😌',
            description: getAnalysisText('stressDesc')
        });
    }
    
    // 수면에 따른 추천
    if (sleep === 'less5' || sleep === '5to6') {
        if (!recommendations.find(r => r.supplement.name.includes(getSupplementInfo('magnesium').name))) {
            recommendations.push({
                supplement: getSupplement('magnesium'),
                priority: 'high',
                reason: getAnalysisText('sleepQualityReason')
            });
        }
        tips.push({
            icon: '🌙',
            text: getAnalysisText('sleepTip')
        });
    }
    
    // 운동에 따른 팁
    if (exercise === 'none' || exercise === 'rarely') {
        tips.push({
            icon: '🏃',
            text: getAnalysisText('exerciseTip')
        });
    }
    
    // 식사 습관에 따른 팁
    if (diet === 'irregular' || diet === 'skip') {
        tips.push({
            icon: '🍱',
            text: getAnalysisText('mealTip')
        });
    }
    
    // 스트레스에 따른 팁
    if (stress === 'very_high' || stress === 'high') {
        tips.push({
            icon: '🧘',
            text: getAnalysisText('stressTip')
        });
    }
    
    // 여성 특화 추천
    if (gender === 'female') {
        if (!recommendations.find(r => r.supplement.name.includes(getSupplementInfo('iron').name))) {
            recommendations.push({
                supplement: getSupplement('iron'),
                priority: 'medium',
                reason: getAnalysisText('womenIronReason')
            });
        }
    }
    
    // 나이에 따른 추천
    if (age === '50s' || age === '60+') {
        if (!recommendations.find(r => r.supplement.name.includes(getSupplementInfo('calcium').name))) {
            recommendations.push({
                supplement: getSupplement('calcium'),
                priority: 'high',
                reason: getAnalysisText('ageBoneReason')
            });
        }
        if (!recommendations.find(r => r.supplement.name.includes(getSupplementInfo('coq10').name))) {
            recommendations.push({
                supplement: getSupplement('coq10'),
                priority: 'medium',
                reason: getAnalysisText('heartEnergyReason')
            });
        }
    }
    
    // 카메라 결과 기반 추천
    if (cameraResults.heartRate) {
        if (cameraResults.heartRate > 100) {
            tips.push({
                icon: '❤️',
                text: '심박수가 다소 높습니다. 스트레스 관리와 규칙적인 운동이 도움됩니다.'
            });
            if (!recommendations.find(r => r.supplement.name === '마그네슘')) {
                recommendations.push({
                    supplement: getSupplement('magnesium'),
                    priority: 'medium',
                    reason: '심박수 안정화와 스트레스 완화'
                });
            }
        } else if (cameraResults.heartRate < 60) {
            tips.push({
                icon: '❤️',
                text: '심박수가 낮습니다. 운동선수가 아니라면 전문의 상담을 권장합니다.'
            });
        }
    }
    
    if (cameraResults.faceAnalysis) {
        if (cameraResults.faceAnalysis.complexion.level === 'poor') {
            summaryItems.push({
                title: '혈색 개선 필요',
                icon: '😊',
                description: cameraResults.faceAnalysis.complexion.desc
            });
            if (!recommendations.find(r => r.supplement.name === '철분')) {
                recommendations.push({
                    supplement: getSupplement('iron'),
                    priority: 'high',
                    reason: '혈색 개선과 빈혈 예방'
                });
            }
        }
    }
    
    if (cameraResults.tongueAnalysis) {
        if (cameraResults.tongueAnalysis.status === 'warning') {
            summaryItems.push({
                title: '혀 상태',
                icon: '👅',
                description: cameraResults.tongueAnalysis.description
            });
        }
    }
    
    if (cameraResults.irisAnalysis) {
        if (cameraResults.irisAnalysis.status === 'warning') {
            summaryItems.push({
                title: '홍채 상태',
                icon: '👁️',
                description: cameraResults.irisAnalysis.description
            });
            // 홍채 건강 관련 추천
            if (!recommendations.find(r => r.supplement.name === '루테인')) {
                recommendations.push({
                    supplement: getSupplement('lutein'),
                    priority: 'medium',
                    reason: '눈 건강 개선 및 홍채 건강 지원'
                });
            }
        }
    }
    
    // 일반적인 건강 팁
    tips.push({
        icon: '💧',
        text: '하루 2리터 이상의 물을 마시세요. 충분한 수분 섭취가 중요합니다.'
    });
    
    tips.push({
        icon: '🥗',
        text: '다양한 색깔의 채소와 과일을 섭취하여 영양 균형을 맞추세요.'
    });
    
    return {
        healthScore,
        recommendations: recommendations.slice(0, 6), // 상위 6개만
        summaryItems,
        tips,
        scoreBreakdown
    };
}

// 건강 점수 산출 근거 렌더링
function renderScoreBreakdown(breakdown) {
    if (!breakdown || breakdown.length === 0) return '';
    const titles = {
        ko: '📊 점수 산출 근거 (기본 100점에서 시작)',
        en: '📊 How your score was calculated (starts from 100)',
        zh: '📊 分数计算依据（从100分开始）',
        ja: '📊 スコアの算出根拠（100点から開始）'
    };
    const title = titles[currentLanguage] || titles.ko;
    let items = breakdown.map(b => {
        const sign = b.delta > 0 ? '+' : '';
        const cls = b.delta > 0 ? 'score-plus' : 'score-minus';
        return `<li class="${cls}"><span class="sb-label">${b.label}</span><span class="sb-delta">${sign}${b.delta}</span></li>`;
    }).join('');
    return `
        <div class="score-breakdown">
            <h4>${title}</h4>
            <ul class="score-breakdown-list">${items}</ul>
        </div>
    `;
}

// 결과 표시
function displayResults(analysis) {
    // 분석 결과 저장 (언어 변경 시 재렌더링용)
    lastAnalysisResult = analysis;
    
    // 건강 기록 저장 (로그인한 경우)
    if (currentUser) {
        let summary = `건강 점수 ${analysis.healthScore}점`;
        if (cameraResults.heartRate) {
            summary += `, 심박수 ${cameraResults.heartRate} BPM`;
        }
        saveHealthRecord(analysis.healthScore, summary);
    }
    
    // 쇼핑몰 링크 표시
    const shoppingSettings = getShoppingSettings();
    const shoppingSection = document.getElementById('shopping-section');
    const shoppingLink = document.getElementById('shopping-link');
    
    if (shoppingSettings.enabled && shoppingSettings.url) {
        shoppingLink.href = shoppingSettings.url;
        shoppingSection.style.display = 'block';
    } else {
        shoppingSection.style.display = 'none';
    }
    
    // 건강 점수
    let scoreText = '';
    let scoreClass = '';
    
    const scoreTexts = {
        ko: { excellent: '매우 좋음 😊', good: '좋음 🙂', fair: '보통 😐', poor: '주의 필요 😟', point: '점' },
        en: { excellent: 'Excellent 😊', good: 'Good 🙂', fair: 'Fair 😐', poor: 'Needs Attention 😟', point: 'pts' },
        zh: { excellent: '非常好 😊', good: '好 🙂', fair: '一般 😐', poor: '需要注意 😟', point: '分' },
        ja: { excellent: '非常に良い 😊', good: '良い 🙂', fair: '普通 😐', poor: '注意が必要 😟', point: '点' }
    };
    
    if (analysis.healthScore >= 80) {
        scoreText = scoreTexts[currentLanguage].excellent;
        scoreClass = 'excellent';
    } else if (analysis.healthScore >= 60) {
        scoreText = scoreTexts[currentLanguage].good;
        scoreClass = 'good';
    } else if (analysis.healthScore >= 40) {
        scoreText = scoreTexts[currentLanguage].fair;
        scoreClass = 'fair';
    } else {
        scoreText = scoreTexts[currentLanguage].poor;
        scoreClass = 'poor';
    }
    
    // 건강 점수 색상 결정
    let scoreBarColor = '#4CAF50'; // 초록
    if (analysis.healthScore < 50) {
        scoreBarColor = '#F44336'; // 빨강
    } else if (analysis.healthScore < 70) {
        scoreBarColor = '#FF9800'; // 주황
    } else if (analysis.healthScore < 85) {
        scoreBarColor = '#FFC107'; // 노랑
    }
    
    document.getElementById('health-score').innerHTML = `
        <div class="${scoreClass}">${analysis.healthScore}${scoreTexts[currentLanguage].point}</div>
        <div style="margin-top: 15px; font-size: 1.2rem;">${scoreText}</div>
        <div class="health-score-bar-container" style="margin-top: 20px;">
            <div class="health-score-bar-background">
                <div class="health-score-bar-fill" style="width: ${analysis.healthScore}%; background-color: ${scoreBarColor};"></div>
                <div class="health-score-indicator" style="left: ${analysis.healthScore}%;">
                    <div class="health-score-tooltip">${analysis.healthScore}점</div>
                </div>
            </div>
            <div class="health-score-labels">
                <span>0</span>
                <span>50</span>
                <span>70</span>
                <span>85</span>
                <span>100</span>
            </div>
            <div class="health-score-zones">
                <span class="zone-bad">주의</span>
                <span class="zone-warning">보통</span>
                <span class="zone-good">양호</span>
                <span class="zone-excellent">우수</span>
            </div>
        </div>
        ${renderScoreBreakdown(analysis.scoreBreakdown)}
    `;
    
    // AI 분석 결과 표시
    document.getElementById('ai-analysis-title').textContent = t('ai-analysis-title');
    
    if (analysis.aiAnalysis) {
        const aiSection = document.getElementById('ai-analysis');
        const aiContent = document.getElementById('ai-analysis-content');
        
        aiContent.innerHTML = `
            <div class="ai-loading">
                ${analysis.aiAnalysis.split('\n').map(line => {
                    if (line.trim()) {
                        return `<p>${line}</p>`;
                    }
                    return '';
                }).join('')}
            </div>
        `;
        
        aiSection.style.display = 'block';
    } else if (analysis.aiMessage) {
        const aiSection = document.getElementById('ai-analysis');
        const aiContent = document.getElementById('ai-analysis-content');
        
        aiContent.innerHTML = `<p>${analysis.aiMessage}</p>`;
        aiSection.style.display = 'block';
    } else {
        document.getElementById('ai-analysis').style.display = 'none';
    }
    
    // 카메라 결과 표시
    const hasCameraResults = cameraResults.heartRate || cameraResults.faceAnalysis || cameraResults.tongueAnalysis || cameraResults.irisAnalysis;
    if (hasCameraResults) {
        document.getElementById('camera-results').style.display = 'block';
        document.getElementById('camera-results-title').textContent = t('camera-results-title');
        let cameraHTML = '';
        
        // 카메라 결과 다국어
        const cameraTexts = {
            ko: {
                heartRate: '심박수',
                normal: '정상',
                low: '낮음',
                high: '높음',
                normalRange: '정상 범위는 60-100 BPM입니다.',
                faceAnalysis: '얼굴 분석',
                skinTone: '피부 톤',
                tongueAnalysis: '혀 진단',
                irisAnalysis: '홍채 진단'
            },
            en: {
                heartRate: 'Heart Rate',
                normal: 'Normal',
                low: 'Low',
                high: 'High',
                normalRange: 'Normal range is 60-100 BPM.',
                faceAnalysis: 'Face Analysis',
                skinTone: 'Skin Tone',
                tongueAnalysis: 'Tongue Analysis',
                irisAnalysis: 'Iris Analysis'
            },
            zh: {
                heartRate: '心率',
                normal: '正常',
                low: '偏低',
                high: '偏高',
                normalRange: '正常范围为60-100 BPM。',
                faceAnalysis: '面部分析',
                skinTone: '肤色',
                tongueAnalysis: '舌诊',
                irisAnalysis: '虹膜诊断'
            },
            ja: {
                heartRate: '心拍数',
                normal: '正常',
                low: '低い',
                high: '高い',
                normalRange: '正常範囲は60-100 BPMです。',
                faceAnalysis: '顔分析',
                skinTone: '肌色',
                tongueAnalysis: '舌診断',
                irisAnalysis: '虹彩診断'
            }
        };
        
        const ct = cameraTexts[currentLanguage];
        
        if (cameraResults.heartRate) {
            const hr = cameraResults.heartRate;
            const minNormal = 60;
            const maxNormal = 100;
            const range = 120; // 표시 범위 (40-120 BPM)
            const minRange = 40;
            
            let hrStatus = ct.normal;
            let hrClass = 'good';
            let hrColor = '#4CAF50'; // 초록
            let deviation = 0;
            let deviationText = '';
            
            if (hr < minNormal) {
                hrStatus = ct.low;
                hrClass = 'warning';
                hrColor = '#FF9800'; // 주황
                deviation = ((minNormal - hr) / minNormal) * 100;
                deviationText = `${Math.round(deviation)}% 낮음`;
            } else if (hr > maxNormal) {
                hrStatus = ct.high;
                hrClass = 'warning';
                hrColor = '#F44336'; // 빨강
                deviation = ((hr - maxNormal) / maxNormal) * 100;
                deviationText = `${Math.round(deviation)}% 높음`;
            } else {
                deviationText = '정상 범위 내';
            }
            
            // 정상 범위 내 위치 계산 (0-100%)
            const position = ((hr - minRange) / (range - minRange)) * 100;
            const normalStart = ((minNormal - minRange) / (range - minRange)) * 100;
            const normalEnd = ((maxNormal - minRange) / (range - minRange)) * 100;
            
            cameraHTML += `
                <div class="camera-result-item">
                    <h4>❤️ ${ct.heartRate}</h4>
                    <div class="result-value">
                        ${hr}
                        <span class="result-unit">BPM</span>
                        <span class="result-status ${hrClass}">${hrStatus}</span>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar-background">
                            <div class="health-bar-normal" style="left: ${normalStart}%; width: ${normalEnd - normalStart}%;"></div>
                            <div class="health-bar-indicator" style="left: ${Math.max(0, Math.min(100, position))}%; background-color: ${hrColor};">
                                <div class="health-bar-tooltip">${hr} BPM</div>
                            </div>
                        </div>
                        <div class="health-bar-labels">
                            <span>40</span>
                            <span>60</span>
                            <span>100</span>
                            <span>120</span>
                        </div>
                    </div>
                    <div class="result-detail">
                        <p class="result-description"><strong>측정값:</strong> ${hr} BPM</p>
                        <p class="result-description"><strong>정상 범위:</strong> ${minNormal}-${maxNormal} BPM</p>
                        <p class="result-description"><strong>편차:</strong> <span style="color: ${hrColor};">${deviationText}</span></p>
                        <p class="result-description">${hr < minNormal ? '심박수가 정상보다 낮습니다. 규칙적인 운동과 충분한 수면이 도움됩니다.' : hr > maxNormal ? '심박수가 정상보다 높습니다. 스트레스 관리와 휴식이 필요합니다.' : '심박수가 정상 범위 내에 있습니다. 현재 심혈관 건강 상태가 양호합니다.'}</p>
                    </div>
                </div>
            `;
        }
        
        if (cameraResults.faceAnalysis) {
            const face = cameraResults.faceAnalysis;
            const level = face.complexion.level;
            let levelValue = 70; // 기본값 (보통)
            let levelColor = '#FF9800'; // 주황
            let levelText = '보통';
            
            if (level === 'good' || level === 'excellent') {
                levelValue = 85;
                levelColor = '#4CAF50'; // 초록
                levelText = '양호';
            } else if (level === 'poor' || level === 'bad') {
                levelValue = 30;
                levelColor = '#F44336'; // 빨강
                levelText = '개선 필요';
            }
            
            cameraHTML += `
                <div class="camera-result-item">
                    <h4>👤 ${ct.faceAnalysis}</h4>
                    <div class="result-value">
                        <span class="result-status ${level}">${face.complexion.status}</span>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar-background">
                            <div class="health-bar-normal" style="left: 60%; width: 25%;"></div>
                            <div class="health-bar-fill" style="width: ${levelValue}%; background-color: ${levelColor};"></div>
                        </div>
                        <div class="health-bar-labels">
                            <span>나쁨</span>
                            <span>보통</span>
                            <span>양호</span>
                        </div>
                    </div>
                    <div class="result-detail">
                        <p class="result-description"><strong>혈색 상태:</strong> ${levelText}</p>
                        <p class="result-description"><strong>피부 톤:</strong> ${face.skinTone.type}</p>
                        <p class="result-description"><strong>상세 분석:</strong> ${face.complexion.desc}</p>
                        <p class="result-description">${level === 'poor' ? '혈색이 좋지 않습니다. 철분과 비타민 B12 보충, 충분한 수면과 규칙적인 운동이 도움됩니다.' : level === 'good' ? '혈색이 양호합니다. 현재 건강 관리를 유지하세요.' : '혈색이 보통 수준입니다. 영양 균형과 충분한 수면을 유지하세요.'}</p>
                    </div>
                </div>
            `;
        }
        
        if (cameraResults.tongueAnalysis) {
            const tongue = cameraResults.tongueAnalysis;
            const status = tongue.status;
            let statusValue = 50; // 기본값
            let statusColor = '#FF9800'; // 주황
            
            if (status === 'good' || status === 'excellent') {
                statusValue = 85;
                statusColor = '#4CAF50'; // 초록
            } else if (status === 'warning' || status === 'bad') {
                statusValue = 25;
                statusColor = '#F44336'; // 빨강
            }
            
            cameraHTML += `
                <div class="camera-result-item">
                    <h4>👅 ${ct.tongueAnalysis}</h4>
                    <div class="result-value">
                        <span class="result-status ${status}">${tongue.color}</span>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar-background">
                            <div class="health-bar-normal" style="left: 60%; width: 25%;"></div>
                            <div class="health-bar-fill" style="width: ${statusValue}%; background-color: ${statusColor};"></div>
                        </div>
                        <div class="health-bar-labels">
                            <span>주의</span>
                            <span>보통</span>
                            <span>건강</span>
                        </div>
                    </div>
                    <div class="result-detail">
                        <p class="result-description"><strong>혀 색상:</strong> ${tongue.color}</p>
                        <p class="result-description"><strong>상태:</strong> ${status === 'good' ? '건강' : status === 'warning' ? '주의 필요' : '정상'}</p>
                        <p class="result-description"><strong>상세 분석:</strong> ${tongue.description}</p>
                        <p class="result-description">${status === 'warning' ? '혀 상태가 좋지 않습니다. 충분한 수분 섭취, 철분과 비타민 보충, 규칙적인 식사를 권장합니다.' : '혀 상태가 건강합니다. 현재 관리 방법을 유지하세요.'}</p>
                    </div>
                </div>
            `;
        }
        
        if (cameraResults.irisAnalysis) {
            const iris = cameraResults.irisAnalysis;
            const status = iris.status;
            let statusValue = 50; // 기본값
            let statusColor = '#FF9800'; // 주황
            
            if (status === 'good' || status === 'excellent') {
                statusValue = 85;
                statusColor = '#4CAF50'; // 초록
            } else if (status === 'warning' || status === 'bad') {
                statusValue = 25;
                statusColor = '#F44336'; // 빨강
            }
            
            cameraHTML += `
                <div class="camera-result-item">
                    <h4>👁️ ${ct.irisAnalysis}</h4>
                    <div class="result-value">
                        <span class="result-status ${status}">${iris.color}</span>
                    </div>
                    <div class="health-bar-container">
                        <div class="health-bar-background">
                            <div class="health-bar-normal" style="left: 60%; width: 25%;"></div>
                            <div class="health-bar-fill" style="width: ${statusValue}%; background-color: ${statusColor};"></div>
                        </div>
                        <div class="health-bar-labels">
                            <span>주의</span>
                            <span>보통</span>
                            <span>건강</span>
                        </div>
                    </div>
                    <div class="result-detail">
                        <p class="result-description"><strong>홍채 색상:</strong> ${iris.color}</p>
                        <p class="result-description"><strong>상태:</strong> ${status === 'good' ? '건강' : status === 'warning' ? '주의 필요' : '정상'}</p>
                        <p class="result-description"><strong>상세 분석:</strong> ${iris.description}</p>
                        ${iris.healthTips ? `<p class="result-description"><strong>건강 팁:</strong></p><ul class="iris-tips"><li>${iris.healthTips.join('</li><li>')}</li></ul>` : ''}
                    </div>
                </div>
            `;
        }
        
        document.getElementById('camera-results-content').innerHTML = cameraHTML;
    }
    
    // 요약
    let summaryHTML = '';
    if (analysis.summaryItems.length > 0) {
        analysis.summaryItems.forEach(item => {
            summaryHTML += `
                <div class="summary-item">
                    <h4><span>${item.icon}</span> ${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
        });
        document.getElementById('result-summary').innerHTML = summaryHTML;
    } else {
        document.getElementById('result-summary').style.display = 'none';
    }
    
    // 추천 영양제
    let supplementHTML = '';
    const priorityTexts = {
        ko: { high: '필수', medium: '권장', low: '선택', dosage: '복용법', caution: '주의사항', evidence: '참고 근거', synergy: '함께 먹으면 좋아요' },
        en: { high: 'Essential', medium: 'Recommended', low: 'Optional', dosage: 'Dosage', caution: 'Caution', evidence: 'Reference', synergy: 'Good to combine with' },
        zh: { high: '必需', medium: '推荐', low: '可选', dosage: '服用方法', caution: '注意事项', evidence: '参考依据', synergy: '搭配服用更好' },
        ja: { high: '必須', medium: '推奨', low: 'オプション', dosage: '服用方法', caution: '注意事項', evidence: '参考根拠', synergy: '一緒に摂ると良い' }
    };
    const pt = priorityTexts[currentLanguage];
    
    analysis.recommendations.forEach(rec => {
        const priorityText = pt[rec.priority];
        const s = rec.supplement;
        const cautionHTML = s.caution ? `<p class="caution">⚠️ <strong>${pt.caution}:</strong> ${s.caution}</p>` : '';
        const synergyHTML = (s.synergy && s.synergy.length) ? `<p class="synergy">🤝 <strong>${pt.synergy}:</strong> ${s.synergy.join(', ')}</p>` : '';
        const evidenceHTML = s.evidence ? `<p class="evidence">📚 <strong>${pt.evidence}:</strong> ${s.evidence}</p>` : '';
        supplementHTML += `
            <div class="supplement-card">
                <h4>
                    <span>${s.icon}</span>
                    ${s.name}
                    <span class="priority ${rec.priority}">${priorityText}</span>
                </h4>
                <p>${rec.reason}</p>
                <p class="benefit">💡 ${s.benefits}</p>
                <p class="dosage">📋 ${pt.dosage}: ${s.dosage}</p>
                ${cautionHTML}
                ${synergyHTML}
                ${evidenceHTML}
            </div>
        `;
    });
    document.getElementById('supplement-list').innerHTML = supplementHTML;
    
    // AI 영양제 추천 근거
    if (analysis.aiReason) {
        const aiReasonDiv = document.getElementById('ai-recommendation-reason');
        aiReasonDiv.innerHTML = `
            <h4>🤖 AI 추천 근거</h4>
            ${analysis.aiReason.split('\n').map(line => {
                if (line.trim()) {
                    return `<p>${line}</p>`;
                }
                return '';
            }).join('')}
        `;
        aiReasonDiv.style.display = 'block';
    } else {
        document.getElementById('ai-recommendation-reason').style.display = 'none';
    }
    
    // 건강 팁
    let tipsHTML = '';
    analysis.tips.forEach(tip => {
        tipsHTML += `
            <div class="tip-item">
                <span class="tip-icon">${tip.icon}</span>
                <p>${tip.text}</p>
            </div>
        `;
    });
    document.getElementById('health-tips-list').innerHTML = tipsHTML;
}

// 다시 시작
function restartSurvey() {
    currentQuestion = 0;
    answers = {};
    cameraResults = {
        heartRate: null,
        faceAnalysis: null,
        tongueAnalysis: null,
        irisAnalysis: null
    };
    lastAnalysisResult = null; // 분석 결과 초기화
    showScreen('start-screen');
}

// ==================== 마이페이지 & 레퍼럴 ====================

// 마이페이지 표시
function showMyPage() {
    // 모바일에서 드롭다운 닫기
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        showLoginModal();
        return;
    }
    
    // 최신 사용자 정보 가져오기
    const users = getUsers();
    currentUser = users.find(u => u.email === currentUser.email);
    
    // 사용자 정보 표시
    document.getElementById('mypage-name').textContent = currentUser.name;
    document.getElementById('mypage-email').textContent = currentUser.email;
    // 날짜 형식 안전하게 처리
    try {
        const joinDate = currentUser.joinDate ? new Date(currentUser.joinDate) : new Date();
        document.getElementById('mypage-joindate').textContent = isNaN(joinDate.getTime()) ? '날짜 정보 없음' : joinDate.toLocaleDateString('ko-KR');
    } catch (e) {
        document.getElementById('mypage-joindate').textContent = '날짜 정보 없음';
    }
    document.getElementById('mypage-ai-credits').textContent = currentUser.aiCredits || 0;
    
    // 레퍼럴 코드
    document.getElementById('my-referral-code').textContent = currentUser.referralCode;
    document.getElementById('referral-count').textContent = currentUser.referralCount || 0;
    
    // 건강 기록 표시
    const recordsList = document.getElementById('health-records-list');
    if (currentUser.healthRecords && currentUser.healthRecords.length > 0) {
        let recordsHTML = '';
        currentUser.healthRecords.slice(-5).reverse().forEach(record => {
            recordsHTML += `
                <div class="health-record-item">
                    <div class="record-date">${new Date(record.date).toLocaleString('ko-KR')}</div>
                    <div class="record-score">${record.score}점</div>
                    <p>${record.summary}</p>
                </div>
            `;
        });
        recordsList.innerHTML = recordsHTML;
    } else {
        recordsList.innerHTML = '<p class="no-records">아직 건강 체크 기록이 없습니다.</p>';
    }
    
    document.getElementById('mypage-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 드롭다운 닫기
    document.getElementById('user-dropdown').classList.remove('active');
}

// 마이페이지 닫기
function closeMyPage() {
    document.getElementById('mypage-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// 레퍼럴 정보 표시
function showReferralInfo() {
    // 모바일에서 드롭다운 닫기
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        showLoginModal();
        return;
    }
    
    // 최신 사용자 정보 가져오기
    const users = getUsers();
    currentUser = users.find(u => u.email === currentUser.email);
    
    document.getElementById('referral-code-display').textContent = currentUser.referralCode;
    document.getElementById('referral-total').textContent = currentUser.referralCount || 0;
    document.getElementById('referral-points').textContent = currentUser.points || 0;
    
    // 레퍼럴 링크 생성
    const referralLink = generateReferralLink(currentUser.referralCode);
    document.getElementById('referral-link-display').value = referralLink;
    
    // 내가 추천한 회원 목록
    const referredUsers = users.filter(u => u.referredBy === currentUser.email);
    const membersList = document.getElementById('referral-members-list');
    
    if (referredUsers.length > 0) {
        let membersHTML = '';
        referredUsers.forEach(user => {
            membersHTML += `
                <div class="referral-member-card">
                    <div class="member-info">
                        <div class="member-name">👤 ${user.name}</div>
                        <div class="member-email">${user.email}</div>
                    </div>
                    <div class="member-points">
                        <div class="member-date">${user.joinDate ? (() => { try { const d = new Date(user.joinDate); return isNaN(d.getTime()) ? '날짜 정보 없음' : d.toLocaleDateString('ko-KR'); } catch(e) { return '날짜 정보 없음'; } })() : '날짜 정보 없음'}</div>
                        <span class="point-badge">${user.points || 0}P</span>
                    </div>
                </div>
            `;
        });
        membersList.innerHTML = membersHTML;
    } else {
        membersList.innerHTML = '<p class="no-records">아직 추천한 회원이 없습니다.</p>';
    }
    
    document.getElementById('referral-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 드롭다운 닫기
    document.getElementById('user-dropdown').classList.remove('active');
}

// 레퍼럴 정보 닫기
function closeReferralInfo() {
    document.getElementById('referral-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// 레퍼럴 코드 복사
// 레퍼럴 링크 생성
function generateReferralLink(referralCode) {
    // 현재 URL의 기본 경로 가져오기
    let baseUrl = window.location.origin;
    
    // pathname이 '/' 또는 '/index.html'인 경우 처리
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/' && !pathname.endsWith('index.html')) {
        baseUrl += pathname;
    }
    
    // 끝에 '/'가 있으면 제거
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    const referralLink = `${baseUrl}?ref=${referralCode}`;
    console.log('생성된 레퍼럴 링크:', referralLink);
    return referralLink;
}

// 레퍼럴 링크 복사
function copyReferralLink() {
    if (!currentUser) {
        const lang = currentLanguage || 'ko';
        const message = lang === 'ko' ? '로그인이 필요합니다.' :
                       lang === 'en' ? 'Login required.' :
                       lang === 'zh' ? '需要登录。' :
                       'ログインが必要です。';
        alert(message);
        return;
    }
    
    const link = generateReferralLink(currentUser.referralCode);
    console.log('복사할 레퍼럴 링크:', link);
    
    // 클립보드 API 사용
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            const lang = currentLanguage || 'ko';
            let message = '';
            
            if (lang === 'ko') {
                message = `✅ 레퍼럴 링크가 복사되었습니다!\n\n${link}\n\n이 링크를 친구에게 보내세요!\n친구가 링크를 클릭하면 자동으로 회원가입 페이지가 열립니다.`;
            } else if (lang === 'en') {
                message = `✅ Referral link copied!\n\n${link}\n\nShare this link with your friends!\nThey will be automatically directed to the signup page.`;
            } else if (lang === 'zh') {
                message = `✅ 推荐链接已复制！\n\n${link}\n\n将此链接发送给您的朋友！\n他们将自动打开注册页面。`;
            } else {
                message = `✅ 紹介リンクがコピーされました！\n\n${link}\n\nこのリンクを友達に送ってください！\n自動的に登録ページが開きます。`;
            }
            
            alert(message);
            console.log('✅ 레퍼럴 링크 복사 완료');
        }).catch(err => {
            console.error('복사 실패:', err);
            fallbackCopy(link);
        });
    } else {
        fallbackCopy(link);
    }
}

function copyReferralCode() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const code = currentUser.referralCode;
    
    // 클립보드 API 사용
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            alert(`✅ 레퍼럴 코드가 복사되었습니다!\n${code}`);
        }).catch(err => {
            console.error('복사 실패:', err);
            fallbackCopy(code);
        });
    } else {
        fallbackCopy(code);
    }
}

// 클립보드 API가 없을 때 대체 복사
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert(`✅ 레퍼럴 코드가 복사되었습니다!\n${text}`);
    } catch (err) {
        alert(`레퍼럴 코드: ${text}\n(수동으로 복사해주세요)`);
    }
    document.body.removeChild(textarea);
}

// 건강 기록 저장
function saveHealthRecord(score, summary) {
    if (!currentUser) return;
    
    const users = getUsers();
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user) return;
    
    if (!user.healthRecords) {
        user.healthRecords = [];
    }
    
    const record = {
        date: new Date().toISOString(),
        score: score,
        summary: summary,
        answers: {...answers},
        cameraResults: {...cameraResults}
    };
    
    user.healthRecords.push(record);
    saveUsers(users);
    currentUser = user;
}

// ==================== 관리자 기능 ====================

let selectedUserForPoint = null;
let currentAdjustmentType = 'point'; // 'point' or 'credit'

// 관리자 대시보드 표시
async function showAdminDashboard() {
    // 모바일에서 드롭다운 닫기
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    if (!isAdmin()) {
        alert('관리자 권한이 필요합니다.');
        return;
    }
    
    // Supabase에서 최신 데이터 강제 동기화
    if (typeof getUsersFromSupabase === 'function') {
        try {
            const supabaseUsers = await getUsersFromSupabase();
            if (supabaseUsers && supabaseUsers.length > 0) {
                // Supabase 데이터로 업데이트
                usersCache = supabaseUsers;
                usersCacheTime = Date.now();
                localStorage.setItem('healthUsers', JSON.stringify(supabaseUsers));
                localStorage.setItem('healthUsers_syncTime', Date.now().toString());
                console.log('✅ 관리자 대시보드: Supabase 데이터 동기화 완료');
            }
        } catch (error) {
            console.warn('⚠️ 관리자 대시보드: Supabase 동기화 실패, localStorage 사용:', error);
        }
    }
    
    const users = getUsers();
    
    // 통계 계산
    const totalUsers = users.length;
    const totalRecords = users.reduce((sum, u) => sum + (u.healthRecords?.length || 0), 0);
    const totalReferrals = users.reduce((sum, u) => sum + (u.referralCount || 0), 0);
    
    // 관리자 계정이 보유한 AI 검사 가능 횟수 (어디서 보든 1,000,000으로 동일하게 맞추기 위함)
    const adminUser = users.find(u => u.email === 'admin@health100.com');
    const adminCredits = adminUser ? (adminUser.aiCredits || 0) : 0;
    
    document.getElementById('admin-total-users').textContent = totalUsers;
    document.getElementById('admin-total-records').textContent = totalRecords;
    document.getElementById('admin-total-referrals').textContent = totalReferrals;
    document.getElementById('admin-total-credits').textContent = adminCredits.toLocaleString();
    
    // AI 설정 로드
    const aiSettings = getAdminAISettings();
    document.getElementById('admin-openai-key').value = aiSettings.apiKey || '';
    document.getElementById('admin-aihub-key').value = aiSettings.aiHubApiKey || '';
    updateAdminAPIStatus();
    updateAIHubAPIStatus();
    
    // 쇼핑몰 설정 로드
    const shoppingSettings = getShoppingSettings();
    document.getElementById('admin-shopping-url').value = shoppingSettings.url || '';
    document.getElementById('admin-shopping-enabled').checked = shoppingSettings.enabled || false;
    updateShoppingStatus();
    
    // 회원 목록 표시
    renderUserList(users);
    
    document.getElementById('admin-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 드롭다운 닫기
    document.getElementById('user-dropdown').classList.remove('active');
}

// 회원 목록 렌더링
function renderUserList(users) {
    const tbody = document.getElementById('admin-users-tbody');
    let html = '';
    
    users.forEach(user => {
        if (user.email === 'admin@health100.com') return; // 관리자 제외
        
        // 추천인 정보
        const referrerInfo = user.referredBy ? 
            `<span style="color: #4caf50;">✓ ${user.referredByName || user.referredBy}</span>` : 
            '<span style="color: #999;">-</span>';
        
        html += `
            <tr>
                <td>
                    <div><strong>${user.name}</strong></div>
                    <div style="font-size: 0.8rem; color: #666;">${user.email}</div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; color: #2196F3;">${user.referralCode || '-'}</div>
                </td>
                <td>
                    <div>${referrerInfo}</div>
                    <div style="font-size: 0.8rem; color: #666;">추천: ${user.referralCount || 0}명</div>
                </td>
                <td class="user-date">${user.joinDate ? (() => { try { const d = new Date(user.joinDate); return isNaN(d.getTime()) ? '날짜 정보 없음' : d.toLocaleDateString('ko-KR'); } catch(e) { return '날짜 정보 없음'; } })() : '날짜 정보 없음'}</td>
                <td><span class="point-badge">${user.points || 0}P</span></td>
                <td><span class="point-badge" style="background: #2196F3;">${user.aiCredits || 0}회</span></td>
                <td>
                    <button class="btn-small btn-edit" onclick='openPointModal(${JSON.stringify(user).replace(/'/g, "&apos;")})'>
                        관리
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="7" style="text-align: center; padding: 30px; color: #999;">회원이 없습니다.</td></tr>';
}

// 회원 검색 필터
function filterUsers() {
    const searchText = document.getElementById('admin-search').value.toLowerCase();
    const users = getUsers().filter(u => u.email !== 'admin@health100.com');
    
    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchText) || 
        user.email.toLowerCase().includes(searchText)
    );
    
    renderUserList(filtered);
}

// 관리자 대시보드 닫기
function closeAdminDashboard() {
    document.getElementById('admin-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// 탭 전환
function switchTab(type) {
    currentAdjustmentType = type;
    
    // 탭 버튼 활성화
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // 라벨 변경
    const label = document.getElementById('point-value-label');
    label.textContent = type === 'point' ? '포인트 값' : '검사 횟수';
}

// 포인트/크레딧 조절 모달 열기
function openPointModal(user) {
    selectedUserForPoint = user;
    currentAdjustmentType = 'point';
    
    document.getElementById('point-user-name').textContent = user.name;
    document.getElementById('point-current').textContent = user.points || 0;
    document.getElementById('credit-current').textContent = user.aiCredits || 0;
    document.getElementById('point-form').reset();
    
    // 탭 초기화
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach((tab, idx) => {
        tab.classList.toggle('active', idx === 0);
    });
    
    document.getElementById('point-modal').classList.add('active');
}

// 포인트 조절 모달 닫기
function closePointModal() {
    document.getElementById('point-modal').classList.remove('active');
    selectedUserForPoint = null;
}

// 포인트/크레딧 조절 처리
function handlePointAdjustment(event) {
    event.preventDefault();
    
    if (!selectedUserForPoint) return;
    
    const action = document.getElementById('point-action').value;
    const value = parseInt(document.getElementById('point-value').value);
    const memo = document.getElementById('point-memo').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === selectedUserForPoint.email);
    
    if (!user) {
        alert('사용자를 찾을 수 없습니다.');
        return;
    }
    
    if (currentAdjustmentType === 'point') {
        // 포인트 조절
        const currentPoints = user.points || 0;
        let newPoints = currentPoints;
        
        switch (action) {
            case 'add':
                newPoints = currentPoints + value;
                break;
            case 'subtract':
                newPoints = Math.max(0, currentPoints - value);
                break;
            case 'set':
                newPoints = value;
                break;
        }
        
        user.points = newPoints;
        
        // 포인트 변경 이력 저장
        if (!user.pointHistory) {
            user.pointHistory = [];
        }
        user.pointHistory.push({
            date: new Date().toISOString(),
            action: action,
            value: value,
            before: currentPoints,
            after: newPoints,
            memo: memo,
            admin: currentUser.email
        });
        
        saveUsers(users);
        alert(`✅ ${user.name}님의 포인트가 ${currentPoints}P → ${newPoints}P로 변경되었습니다.`);
        
    } else {
        // AI 검사 횟수 조절 (전역 재고 없이 계정별로만 관리)
        const currentCredits = user.aiCredits || 0;
        let newCredits = currentCredits;
        
        switch (action) {
            case 'add':
                newCredits = currentCredits + value;
                break;
            case 'subtract':
                newCredits = Math.max(0, currentCredits - value);
                break;
            case 'set':
                newCredits = Math.max(0, value);
                break;
        }
        
        user.aiCredits = newCredits;
        
        // AI 검사 횟수 변경 이력 저장
        if (!user.creditHistory) {
            user.creditHistory = [];
        }
        user.creditHistory.push({
            date: new Date().toISOString(),
            action: action,
            value: value,
            before: currentCredits,
            after: newCredits,
            memo: memo,
            admin: currentUser.email
        });
        
        saveUsers(users);
        alert(`✅ ${user.name}님의 AI 검사 횟수가 ${currentCredits}회 → ${newCredits}회로 변경되었습니다.`);
    }
    
    closePointModal();
    showAdminDashboard();
}

// ==================== 카메라 기능 ====================

// 카메라 체크 시작
function startCameraCheck() {
    currentCameraStep = 0;
    showScreen('camera-screen');
    initCamera();
}

// 카메라 체크 건너뛰기
function skipCameraCheck() {
    analyzeResults();
}

// 기기 타입 감지
function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android.*mobile/.test(ua);
    const isTablet = /ipad|android(?!.*mobile)/.test(ua);
    
    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet
    };
}

// 카메라 초기화
async function initCamera() {
    // 이전 카메라 스트림 완전히 정리
    stopCamera();
    
    // 에러 메시지 및 재시도 버튼 제거
    const cameraControls = document.querySelector('.camera-controls');
    if (cameraControls) {
        const existingRetryBtn = cameraControls.querySelector('.btn-primary[onclick*="initCamera"]');
        const existingSkipBtn = document.querySelector('.camera-status.error')?.nextElementSibling;
        if (existingRetryBtn) existingRetryBtn.remove();
        if (existingSkipBtn && existingSkipBtn.classList.contains('btn-secondary')) existingSkipBtn.remove();
    }
    
    const device = detectDeviceType();
    
    // 기기별 안내 메시지
    let heartrateInstruction = '';
    if (device.isMobile) {
        heartrateInstruction = '📱 휴대폰 후면 카메라에 검지손가락을 가볍게 대주세요. 플래시가 켜지면 손가락 끝이 빨갛게 보일 것입니다.';
    } else if (device.isTablet) {
        heartrateInstruction = '📱 태블릿 카메라 렌즈에 검지손가락을 최대한 가까이 대주세요. 화면이 밝아지면 손가락이 붉게 보일 것입니다.';
    } else {
        heartrateInstruction = '💻 노트북 카메라에 검지손가락을 최대한 가까이 대주세요. 화면이 밝아지면 손가락이 붉게 보일 것입니다. 밝은 곳에서 측정하면 더 정확합니다.';
    }
    
    const steps = [
        {
            title: '❤️ 심박수 측정',
            instruction: heartrateInstruction,
            type: 'heartrate'
        },
        {
            title: '👤 얼굴 분석',
            instruction: '😊 화면을 보며 얼굴이 원 안에 들어오도록 맞춰주세요. 밝은 곳에서 촬영하면 더 정확합니다.',
            type: 'face'
        },
        {
            title: '👅 혀 진단',
            instruction: '👅 혀를 최대한 내밀어 사각형 안에 맞춰주세요. 자연광 아래에서 촬영하면 좋습니다.',
            type: 'tongue'
        },
        {
            title: '👁️ 홍채 진단',
            instruction: '👁️ 카메라를 가까이 대고 눈을 크게 뜨세요. 양쪽 눈을 각각 촬영합니다.',
            type: 'iris'
        }
    ];
    
    const step = steps[currentCameraStep];
    document.getElementById('camera-step').textContent = `${currentCameraStep + 1}/4 단계`;
    document.getElementById('camera-title').textContent = step.title;
    document.getElementById('camera-instruction').textContent = step.instruction;
    
    try {
        const device = detectDeviceType();
        
        // 카메라 권한 요청
        const constraints = {
            video: {
                // 모바일은 심박수 측정 시 후면 카메라, 나머지는 전면 카메라
                // 노트북/태블릿은 항상 전면 카메라 사용
                facingMode: (currentCameraStep === 0 && device.isMobile) ? 'environment' : 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        // 심박수 측정시 플래시 활성화 시도 (모바일만)
        if (currentCameraStep === 0 && device.isMobile) {
            constraints.video.torch = true;
        }
        
        try {
            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            // 후면 카메라가 없으면 전면 카메라로 폴백
            if (constraints.video.facingMode === 'environment') {
                console.log('후면 카메라 없음, 전면 카메라로 전환');
                constraints.video.facingMode = 'user';
                videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            } else {
                throw error;
            }
        }
        
        const video = document.getElementById('video');
        video.srcObject = videoStream;
        
        // 플래시 켜기 시도 (지원되는 경우)
        let hasFlash = false;
        if (currentCameraStep === 0 && videoStream.getVideoTracks().length > 0) {
            const track = videoStream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
                try {
                    await track.applyConstraints({
                        advanced: [{ torch: true }]
                    });
                    hasFlash = true;
                } catch (e) {
                    console.log('플래시를 켤 수 없습니다:', e);
                }
            }
        }
        
        // 플래시가 없으면 화면을 밝게 만들기 (노트북/태블릿용)
        if (currentCameraStep === 0 && !hasFlash) {
            enableScreenFlash();
        }
        
        setupCameraOverlay(step.type);
        updateCameraStatus('info', '카메라가 준비되었습니다. 안내에 따라 촬영해주세요.');
        
        // 자동 측정 시작 (심박수는 15초, 나머지는 3초 후 자동 촬영)
        if (currentCameraStep === 0) {
            setTimeout(() => startHeartRateMeasurement(), 2000);
        } else {
            // 비디오가 준비될 때까지 대기
            const video = document.getElementById('video');
            const checkVideoReady = () => {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA 이상
                    setTimeout(() => captureAndAnalyze(step.type), 3000);
                } else {
                    setTimeout(checkVideoReady, 100);
                }
            };
            checkVideoReady();
        }
        
    } catch (error) {
        console.error('카메라 접근 오류:', error);
        
        let errorMessage = '카메라에 접근할 수 없습니다.';
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage = '카메라를 사용할 수 없습니다. 다른 앱에서 카메라를 사용 중일 수 있습니다.';
        }
        
        updateCameraStatus('error', errorMessage);
        
        // 재시도 버튼 추가 (중복 방지)
        const cameraControls = document.querySelector('.camera-controls');
        if (cameraControls && !cameraControls.querySelector('.btn-retry-camera')) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-primary btn-retry-camera';
            retryBtn.textContent = '다시 시도';
            retryBtn.onclick = () => {
                retryBtn.remove();
                skipBtn?.remove();
                initCamera();
            };
            cameraControls.appendChild(retryBtn);
        }
        
        // 이 단계 건너뛰기 옵션 제공 (중복 방지)
        setTimeout(() => {
            const statusDiv = document.getElementById('camera-status');
            if (statusDiv && statusDiv.classList.contains('error') && !statusDiv.nextElementSibling?.classList.contains('btn-skip-camera')) {
                const skipBtn = document.createElement('button');
                skipBtn.className = 'btn btn-secondary btn-skip-camera';
                skipBtn.style.marginTop = '10px';
                skipBtn.style.width = '100%';
                skipBtn.textContent = '이 단계 건너뛰기';
                skipBtn.onclick = () => {
                    skipCurrentCameraCheck();
                };
                statusDiv.parentNode.insertBefore(skipBtn, statusDiv.nextSibling);
            }
        }, 1000);
    }
}

// 화면 플래시 활성화 (플래시가 없는 기기용)
function enableScreenFlash() {
    const overlay = document.getElementById('camera-overlay');
    overlay.style.background = 'rgba(255, 255, 255, 0.9)';
    
    // 바디 배경도 밝게
    document.body.style.setProperty('--screen-flash', 'white');
    const screenFlash = document.createElement('div');
    screenFlash.id = 'screen-flash';
    screenFlash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 999;
        pointer-events: none;
    `;
    document.body.appendChild(screenFlash);
}

// 화면 플래시 비활성화
function disableScreenFlash() {
    const screenFlash = document.getElementById('screen-flash');
    if (screenFlash) {
        screenFlash.remove();
    }
    const overlay = document.getElementById('camera-overlay');
    if (overlay) {
        overlay.style.background = '';
    }
}

// 카메라 오버레이 설정
function setupCameraOverlay(type) {
    const overlay = document.getElementById('camera-overlay');
    const device = detectDeviceType();
    overlay.innerHTML = '';
    
    if (type === 'heartrate') {
        overlay.className = 'camera-overlay';
        let guideText = '손가락을 카메라에 가볍게 대세요';
        if (device.isDesktop || device.isTablet) {
            guideText = '손가락을 카메라 렌즈에 최대한 가까이 대세요';
        }
        overlay.innerHTML = `<div class="guide-text">${guideText}</div>`;
    } else if (type === 'face') {
        overlay.className = 'camera-overlay';
        overlay.innerHTML = '<div class="face-guide"></div><div class="guide-text">얼굴을 원 안에 맞춰주세요</div>';
    } else if (type === 'tongue') {
        overlay.className = 'camera-overlay';
        overlay.innerHTML = '<div class="tongue-guide"></div><div class="guide-text">혀를 내밀어주세요</div>';
    } else if (type === 'iris') {
        overlay.className = 'camera-overlay';
        overlay.innerHTML = '<div class="iris-guide"></div><div class="guide-text">눈을 크게 뜨고 카메라를 가까이 대세요</div>';
    }
}

// 카메라 상태 업데이트
function updateCameraStatus(type, message) {
    const status = document.getElementById('camera-status');
    status.className = `camera-status ${type}`;
    status.textContent = message;
}

// 심박수 측정
function startHeartRateMeasurement() {
    updateCameraStatus('info', '심박수를 측정하고 있습니다... (15초 소요)');
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    let measurements = [];
    let frameCount = 0;
    const measurementDuration = 15; // 15초
    const fps = 30;
    const totalFrames = measurementDuration * fps;
    
    const overlay = document.getElementById('camera-overlay');
    overlay.className = 'camera-overlay heart-rate-overlay';
    overlay.innerHTML = `
        <div class="bpm-display" id="bpm-display">--</div>
        <div class="bpm-label">BPM</div>
    `;
    
    const measureInterval = setInterval(() => {
        if (frameCount >= totalFrames) {
            clearInterval(measureInterval);
            finishHeartRateMeasurement(measurements);
            return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let redSum = 0;
        for (let i = 0; i < data.length; i += 4) {
            redSum += data[i]; // Red channel
        }
        const redAvg = redSum / (data.length / 4);
        measurements.push(redAvg);
        
        // 실시간 BPM 표시 (단순 추정)
        if (measurements.length > fps * 3) {
            const recentMeasurements = measurements.slice(-fps * 3);
            const estimatedBPM = calculateBPM(recentMeasurements, fps);
            document.getElementById('bpm-display').textContent = Math.round(estimatedBPM);
        }
        
        frameCount++;
        
        // 진행률 업데이트
        const progress = Math.round((frameCount / totalFrames) * 100);
        updateCameraStatus('info', `심박수 측정 중... ${progress}%`);
        
    }, 1000 / fps);
}

// BPM 계산
function calculateBPM(data, fps) {
    // 간단한 피크 감지 알고리즘
    const normalized = normalizeData(data);
    const peaks = findPeaks(normalized);
    
    if (peaks.length < 2) {
        return 70; // 기본값
    }
    
    // 피크 간 평균 거리 계산
    let totalDistance = 0;
    for (let i = 1; i < peaks.length; i++) {
        totalDistance += peaks[i] - peaks[i - 1];
    }
    const avgDistance = totalDistance / (peaks.length - 1);
    
    // BPM = (60 * fps) / avgDistance
    let bpm = (60 * fps) / avgDistance;
    
    // 정상 범위로 제한 (40-180 BPM)
    bpm = Math.max(40, Math.min(180, bpm));
    
    return bpm;
}

// 데이터 정규화
function normalizeData(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    return data.map(val => (val - min) / range);
}

// 피크 찾기
function findPeaks(data, threshold = 0.6) {
    const peaks = [];
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
            peaks.push(i);
        }
    }
    return peaks;
}

// 심박수 측정 완료
function finishHeartRateMeasurement(measurements) {
    const bpm = calculateBPM(measurements, 30);
    cameraResults.heartRate = Math.round(bpm);
    
    // 화면 플래시 끄기
    disableScreenFlash();
    
    updateCameraStatus('success', `✅ 심박수 측정 완료: ${cameraResults.heartRate} BPM`);
    
    // 카메라 종료 후 다음 단계로
    stopCamera();
    setTimeout(() => {
        moveToNextCameraStep();
    }, 1000);
}

// 촬영 및 분석
function captureAndAnalyze(type) {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (type === 'face') {
        analyzeFace(imageData);
    } else if (type === 'tongue') {
        analyzeTongue(imageData);
    } else if (type === 'iris') {
        analyzeIris(imageData);
    }
}

// 얼굴 분석
function analyzeFace(imageData) {
    updateCameraStatus('info', '얼굴을 분석하고 있습니다...');
    
    // 간단한 색상 분석
    const data = imageData.data;
    let redSum = 0, greenSum = 0, blueSum = 0;
    let pixelCount = data.length / 4;
    
    // 중앙 영역만 분석 (얼굴이 있을 것으로 예상)
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const radius = Math.min(imageData.width, imageData.height) / 3;
    
    let centerPixels = 0;
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            if (dx * dx + dy * dy <= radius * radius) {
                const i = (y * imageData.width + x) * 4;
                redSum += data[i];
                greenSum += data[i + 1];
                blueSum += data[i + 2];
                centerPixels++;
            }
        }
    }
    
    const avgRed = redSum / centerPixels;
    const avgGreen = greenSum / centerPixels;
    const avgBlue = blueSum / centerPixels;
    
    // 피부 톤 및 혈색 분석
    const skinTone = analyzeSkinTone(avgRed, avgGreen, avgBlue);
    const complexion = analyzeComplexion(avgRed, avgGreen, avgBlue);
    
    cameraResults.faceAnalysis = {
        skinTone,
        complexion,
        avgColors: { red: avgRed, green: avgGreen, blue: avgBlue }
    };
    
    updateCameraStatus('success', '✅ 얼굴 분석 완료!');
    
    // 카메라 종료 후 다음 단계로
    stopCamera();
    setTimeout(() => {
        moveToNextCameraStep();
    }, 1000);
}

// 피부 톤 분석
function analyzeSkinTone(r, g, b) {
    const brightness = (r + g + b) / 3;
    
    if (brightness > 200) return { type: '밝은 피부', status: 'good' };
    if (brightness > 150) return { type: '보통 피부', status: 'good' };
    if (brightness > 100) return { type: '어두운 피부', status: 'good' };
    return { type: '매우 어두운 피부', status: 'warning' };
}

// 혈색 분석
function analyzeComplexion(r, g, b) {
    const redness = r - (g + b) / 2;
    
    if (redness > 30) return { status: '좋음', desc: '건강한 혈색을 보이고 있습니다', level: 'good' };
    if (redness > 10) return { status: '보통', desc: '혈색이 보통 수준입니다', level: 'fair' };
    return { status: '창백', desc: '혈색이 다소 창백합니다. 철분 섭취에 신경써주세요', level: 'poor' };
}

// 혀 분석
function analyzeTongue(imageData) {
    updateCameraStatus('info', '혀를 분석하고 있습니다...');
    
    const data = imageData.data;
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const width = imageData.width * 0.3;
    const height = imageData.height * 0.25;
    
    let redSum = 0, greenSum = 0, blueSum = 0;
    let pixelCount = 0;
    
    // 중앙 사각형 영역 분석
    for (let y = centerY - height; y < centerY + height; y++) {
        for (let x = centerX - width; x < centerX + width; x++) {
            if (y >= 0 && y < imageData.height && x >= 0 && x < imageData.width) {
                const i = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
                redSum += data[i];
                greenSum += data[i + 1];
                blueSum += data[i + 2];
                pixelCount++;
            }
        }
    }
    
    const avgRed = redSum / pixelCount;
    const avgGreen = greenSum / pixelCount;
    const avgBlue = blueSum / pixelCount;
    
    const tongueAnalysis = analyzeTongueColor(avgRed, avgGreen, avgBlue);
    cameraResults.tongueAnalysis = tongueAnalysis;
    
    updateCameraStatus('success', '✅ 혀 진단 완료!');
    
    // 카메라 종료 후 다음 단계로
    stopCamera();
    setTimeout(() => {
        moveToNextCameraStep();
    }, 1000);
}

// 혀 색상 분석
function analyzeTongueColor(r, g, b) {
    const redness = r / (g + b + 1);
    const paleness = (r + g + b) / 3;
    
    let color, status, description;
    
    if (redness > 1.3) {
        color = '붉은 혀';
        status = 'warning';
        description = '열이 많은 체질일 수 있습니다. 시원한 음식과 수분 섭취를 늘려보세요.';
    } else if (redness < 0.9) {
        color = '창백한 혀';
        status = 'warning';
        description = '혈액순환이나 영양 상태를 체크해보세요. 철분과 비타민 B12가 도움될 수 있습니다.';
    } else if (paleness < 120) {
        color = '어두운 혀';
        status = 'warning';
        description = '혈액순환에 신경써주세요. 충분한 수분 섭취와 규칙적인 운동이 좋습니다.';
    } else {
        color = '건강한 분홍빛';
        status = 'good';
        description = '건강한 혀 상태입니다. 현재 건강 관리를 유지하세요.';
    }
    
    return { color, status, description };
}

// 홍채 분석 (MediaPipe 사용)
let faceMesh = null;
let irisDetectionActive = false;

// MediaPipe Face Mesh 초기화
function initFaceMesh() {
    if (faceMesh) return faceMesh;
    
    // MediaPipe가 로드되지 않은 경우 폴백
    if (typeof FaceMesh === 'undefined') {
        console.warn('MediaPipe Face Mesh가 로드되지 않았습니다. 기본 분석을 사용합니다.');
        return null;
    }
    
    try {
        faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        
        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true, // 홍채 감지를 위해 필요
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        faceMesh.onResults(onFaceMeshResults);
        
        return faceMesh;
    } catch (error) {
        console.warn('MediaPipe 초기화 실패:', error);
        return null;
    }
}

// Face Mesh 결과 처리
function onFaceMeshResults(results) {
    if (!irisDetectionActive || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return;
    }
    
    const landmarks = results.multiFaceLandmarks[0];
    
    // 홍채 랜드마크 인덱스 (MediaPipe Face Mesh)
    // 왼쪽 눈: 468-473, 오른쪽 눈: 473-478
    const leftIrisIndices = [468, 469, 470, 471, 472, 473];
    const rightIrisIndices = [473, 474, 475, 476, 477, 478];
    
    if (landmarks.length >= 478) {
        analyzeIrisFromLandmarks(landmarks, leftIrisIndices, rightIrisIndices);
        irisDetectionActive = false;
    }
}

// 홍채 랜드마크에서 분석
function analyzeIrisFromLandmarks(landmarks, leftIndices, rightIndices) {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 왼쪽 홍채 색상 분석
    const leftIrisColor = extractIrisColor(landmarks, leftIndices, data, canvas.width, canvas.height);
    // 오른쪽 홍채 색상 분석
    const rightIrisColor = extractIrisColor(landmarks, rightIndices, data, canvas.width, canvas.height);
    
    // 평균 색상 계산
    const avgColor = {
        r: (leftIrisColor.r + rightIrisColor.r) / 2,
        g: (leftIrisColor.g + rightIrisColor.g) / 2,
        b: (leftIrisColor.b + rightIrisColor.b) / 2
    };
    
    const irisAnalysis = analyzeIrisColor(avgColor.r, avgColor.g, avgColor.b);
    cameraResults.irisAnalysis = irisAnalysis;
    
    console.log('홍채 분석 완료 (MediaPipe):', irisAnalysis);
    
    updateCameraStatus('success', '✅ 홍채 진단 완료!');
    
    // 카메라 종료 후 완료
    stopCamera();
    setTimeout(() => {
        finishCameraCheck();
    }, 1000);
}

// 홍채 영역에서 색상 추출
function extractIrisColor(landmarks, indices, imageData, width, height) {
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;
    
    for (const idx of indices) {
        if (landmarks[idx]) {
            const x = Math.floor(landmarks[idx].x * width);
            const y = Math.floor(landmarks[idx].y * height);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const i = (y * width + x) * 4;
                rSum += imageData[i];
                gSum += imageData[i + 1];
                bSum += imageData[i + 2];
                count++;
            }
        }
    }
    
    return {
        r: count > 0 ? rSum / count : 128,
        g: count > 0 ? gSum / count : 128,
        b: count > 0 ? bSum / count : 128
    };
}

// 홍채 분석
function analyzeIris(imageData) {
    console.log('홍채 분석 시작', imageData);
    updateCameraStatus('info', '홍채를 감지하고 있습니다...');
    
    // MediaPipe를 사용한 홍채 감지 시도
    const faceMesh = initFaceMesh();
    const video = document.getElementById('video');
    
    if (faceMesh && video && video.readyState >= 2) {
        irisDetectionActive = true;
        
        // MediaPipe로 프레임 처리
        const processFrame = () => {
            if (!irisDetectionActive) return;
            
            try {
                faceMesh.send({ image: video });
                
                // 3초 동안 감지 시도
                setTimeout(() => {
                    if (irisDetectionActive) {
                        console.log('MediaPipe 타임아웃, 폴백 사용');
                        irisDetectionActive = false;
                        // MediaPipe가 작동하지 않으면 기본 색상 분석으로 폴백
                        analyzeIrisFallback(imageData);
                    }
                }, 3000);
            } catch (error) {
                console.warn('MediaPipe 처리 실패:', error);
                irisDetectionActive = false;
                analyzeIrisFallback(imageData);
            }
        };
        
        // 첫 프레임 처리
        setTimeout(processFrame, 500);
    } else {
        console.log('MediaPipe 없음 또는 비디오 미준비, 폴백 사용');
        // MediaPipe가 없으면 바로 폴백 사용
        analyzeIrisFallback(imageData);
    }
}

// 홍채 분석 폴백 (MediaPipe가 작동하지 않을 때)
function analyzeIrisFallback(imageData) {
    const data = imageData.data;
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const radius = Math.min(imageData.width, imageData.height) * 0.15;
    
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;
    
    // 중앙 영역 (눈 위치) 색상 분석
    for (let y = centerY - radius; y < centerY + radius; y++) {
        for (let x = centerX - radius; x < centerX + radius; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            if (dx * dx + dy * dy <= radius * radius) {
                if (y >= 0 && y < imageData.height && x >= 0 && x < imageData.width) {
                    const i = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
                    rSum += data[i];
                    gSum += data[i + 1];
                    bSum += data[i + 2];
                    count++;
                }
            }
        }
    }
    
    const avgR = rSum / count;
    const avgG = gSum / count;
    const avgB = bSum / count;
    
    const irisAnalysis = analyzeIrisColor(avgR, avgG, avgB);
    cameraResults.irisAnalysis = irisAnalysis;
    
    console.log('홍채 분석 완료:', irisAnalysis);
    
    updateCameraStatus('success', '✅ 홍채 진단 완료!');
    
    // 카메라 종료 후 완료
    stopCamera();
    setTimeout(() => {
        finishCameraCheck();
    }, 1000);
}

// 홍채 색상 분석
function analyzeIrisColor(r, g, b) {
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    const redness = r / (g + b + 1);
    
    let color, status, description, healthTips;
    
    // 홍채 색상 및 건강 상태 평가
    if (brightness < 80) {
        color = '어두운 홍채';
        status = 'warning';
        description = '홍채가 어둡게 보입니다. 충분한 수면과 눈 건강 관리가 필요할 수 있습니다.';
        healthTips = ['루테인과 제아잔틴 보충', '충분한 수면 (7-8시간)', '디지털 눈 피로 관리'];
    } else if (brightness > 200) {
        color = '밝은 홍채';
        status = 'good';
        description = '홍채가 밝고 건강해 보입니다. 현재 눈 건강 관리를 유지하세요.';
        healthTips = ['현재 관리 유지', '정기적인 눈 검사'];
    } else if (redness > 1.2) {
        color = '붉은 홍채';
        status = 'warning';
        description = '홍채에 붉은 기가 보입니다. 눈 피로나 염증 가능성을 체크해보세요.';
        healthTips = ['안구 건조증 관리', '충분한 휴식', '오메가-3 보충'];
    } else if (saturation < 30) {
        color = '회색빛 홍채';
        status = 'warning';
        description = '홍채 색상이 탁해 보입니다. 전반적인 건강 상태를 점검해보세요.';
        healthTips = ['종합 비타민 섭취', '규칙적인 운동', '충분한 수분 섭취'];
    } else {
        color = '건강한 홍채';
        status = 'good';
        description = '홍채 상태가 양호합니다. 현재 건강 관리를 계속하세요.';
        healthTips = ['현재 관리 유지', '정기적인 건강 검진'];
    }
    
    return { color, status, description, healthTips };
}

// 카메라 정지
function stopCamera() {
    // 화면 플래시 끄기
    disableScreenFlash();
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => {
            // 플래시 끄기
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
                try {
                    track.applyConstraints({
                        advanced: [{ torch: false }]
                    }).catch(e => {
                        console.log('플래시를 끌 수 없습니다:', e);
                    });
                } catch (e) {
                    console.log('플래시를 끌 수 없습니다:', e);
                }
            }
            // 트랙 완전히 종료
            track.stop();
        });
        videoStream = null;
    }
    
    const video = document.getElementById('video');
    if (video) {
        video.srcObject = null;
        // 비디오 요소도 정리
        video.pause();
        video.load();
    }
}

// 다음 카메라 단계로
function moveToNextCameraStep() {
    // 카메라 완전히 종료 대기
    stopCamera();
    
    // 약간의 지연 후 다음 단계로 (카메라 스트림이 완전히 종료되도록)
    setTimeout(() => {
        currentCameraStep++;
        const steps = [
            { type: 'heartrate' },
            { type: 'face' },
            { type: 'tongue' },
            { type: 'iris' }
        ];
        
        if (currentCameraStep < steps.length) {
            initCamera();
        } else {
            finishCameraCheck();
        }
    }, 500); // 0.5초 지연
}

// 현재 카메라 체크 건너뛰기
function skipCurrentCameraCheck() {
    // 화면 플래시 끄기
    disableScreenFlash();
    
    stopCamera();
    
    // 현재 단계 결과를 null로 설정
    if (currentCameraStep === 0) {
        cameraResults.heartRate = null;
    } else if (currentCameraStep === 1) {
        cameraResults.faceAnalysis = null;
    } else if (currentCameraStep === 2) {
        cameraResults.tongueAnalysis = null;
    } else if (currentCameraStep === 3) {
        cameraResults.irisAnalysis = null;
    }
    
    moveToNextCameraStep();
}

// 카메라 체크 완료
function finishCameraCheck() {
    stopCamera();
    analyzeResults();
}

// 측정 시작 (사용되지 않지만 UI에서 호출 가능)
function startMeasurement() {
    // 이미 자동으로 측정되므로 필요 없음
}

// ==================== 사용설명서 모달 ====================

// 모달 열기
function openGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

// 모달 닫기
function closeGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // 스크롤 복원
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    const modal = document.getElementById('guide-modal');
    if (e.target === modal) {
        closeGuide();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('guide-modal');
        if (modal && modal.classList.contains('active')) {
            closeGuide();
        }
    }
});

// ==================== 다국어 지원 ====================

// 언어 변경
function changeLanguage(lang) {
    saveLanguage(lang);
    
    // 언어 버튼 활성화
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // 번역 즉시 적용
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    
    // UI 업데이트
    updateUILanguage();
    
    // 모바일에서도 번역이 적용되도록 추가 실행
    setTimeout(() => {
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    }, 300);
    
    // 설문 진행 중이면 질문 다시 렌더링
    if (document.getElementById('survey-screen').classList.contains('active')) {
        loadSurveyQuestions();
        renderQuestion();
    }
    
    // 카메라 선택 화면이 표시 중이면 UI 업데이트만
    if (document.getElementById('camera-choice-screen').classList.contains('active')) {
        // updateUILanguage()에서 자동으로 처리됨
    }
    
    // 결과 화면이 표시 중이면 분석을 다시 생성하고 렌더링
    if (document.getElementById('result-screen').classList.contains('active') && lastAnalysisResult) {
        // 분석을 다시 생성 (언어에 맞게)
        const newAnalysis = performAnalysis();
        // AI 분석 결과는 유지 (이미 생성된 것)
        if (lastAnalysisResult.aiAnalysis) {
            newAnalysis.aiAnalysis = lastAnalysisResult.aiAnalysis;
        }
        if (lastAnalysisResult.aiMessage) {
            newAnalysis.aiMessage = lastAnalysisResult.aiMessage;
        }
        if (lastAnalysisResult.aiReason) {
            newAnalysis.aiReason = lastAnalysisResult.aiReason;
        }
        displayResults(newAnalysis);
    }
}

// UI 언어 업데이트
function updateUILanguage() {
    // data-i18n 속성이 있는 모든 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = t(key);
        if (text) {
            element.innerHTML = text;
        }
    });
}

// ==================== AI 크레딧 전송 시스템 ====================

// 크레딧 전송 모달 열기
function openSendCreditsModal() {
    document.getElementById('send-credits-modal').classList.add('active');
    document.getElementById('sender-credits-display').textContent = getUserAICredits();
    document.getElementById('send-credits-form').reset();
    document.getElementById('send-credits-error').textContent = '';
    document.getElementById('send-credits-success').style.display = 'none';
}

// 크레딧 전송 모달 닫기
function closeSendCreditsModal() {
    document.getElementById('send-credits-modal').classList.remove('active');
}

// 크레딧 전송 처리
function handleSendCredits(event) {
    event.preventDefault();
    
    const recipientEmail = document.getElementById('recipient-email').value.trim();
    const amount = parseInt(document.getElementById('credit-amount').value);
    const message = document.getElementById('transfer-message').value.trim();
    const errorDiv = document.getElementById('send-credits-error');
    const successDiv = document.getElementById('send-credits-success');
    
    errorDiv.textContent = '';
    successDiv.style.display = 'none';
    
    // 유효성 검사
    if (!currentUser) {
        errorDiv.textContent = '로그인이 필요합니다.';
        return;
    }
    
    if (amount < 1) {
        errorDiv.textContent = '최소 1개 이상 전송해야 합니다.';
        return;
    }
    
    const senderCredits = getUserAICredits();
    if (amount > senderCredits) {
        errorDiv.textContent = `보유 크레딧(${senderCredits}개)이 부족합니다.`;
        return;
    }
    
    if (recipientEmail === currentUser.email) {
        errorDiv.textContent = '자신에게는 전송할 수 없습니다.';
        return;
    }
    
    // 받는 사람 확인
    const users = getUsers();
    const recipient = users.find(u => u.email === recipientEmail);
    
    if (!recipient) {
        errorDiv.textContent = '해당 이메일의 회원을 찾을 수 없습니다.';
        return;
    }
    
    // 크레딧 전송
    try {
        // 보내는 사람 크레딧 차감
        updateUserAICredits(currentUser.email, -amount);
        
        // 받는 사람 크레딧 추가
        updateUserAICredits(recipientEmail, amount);
        
        // 전송 기록 저장
        saveTransferHistory({
            from: currentUser.email,
            fromName: currentUser.name,
            to: recipientEmail,
            toName: recipient.name,
            amount: amount,
            message: message,
            date: new Date().toISOString()
        });
        
        // 성공 메시지
        successDiv.textContent = `✅ ${recipient.name}님에게 ${amount}개의 AI 크레딧을 전송했습니다!`;
        successDiv.style.display = 'block';
        
        // 폼 초기화 및 업데이트
        document.getElementById('send-credits-form').reset();
        document.getElementById('sender-credits-display').textContent = getUserAICredits();
        
        // 마이페이지 업데이트
        if (document.getElementById('mypage-modal').classList.contains('active')) {
            document.getElementById('mypage-ai-credits').textContent = getUserAICredits();
        }
        
        // 현재 사용자 정보 업데이트
        currentUser = users.find(u => u.email === currentUser.email);
        
        // 2초 후 모달 닫기
        setTimeout(() => {
            closeSendCreditsModal();
            showMyPage();
        }, 2000);
        
    } catch (error) {
        errorDiv.textContent = '전송 중 오류가 발생했습니다.';
        console.error('Credit transfer error:', error);
    }
}

// 크레딧 전송 기록 저장
function saveTransferHistory(transfer) {
    const history = JSON.parse(localStorage.getItem('creditTransferHistory')) || [];
    history.unshift(transfer);
    
    // 최근 100개만 유지
    if (history.length > 100) {
        history.splice(100);
    }
    
    localStorage.setItem('creditTransferHistory', JSON.stringify(history));
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('건강 100세 앱이 로드되었습니다!');
    
    // 언어 로드
    currentLanguage = getCurrentLanguage();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });
    
    // 번역 적용 (즉시 실행)
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    updateUILanguage();
    
    // 모바일에서도 번역이 적용되도록 여러 번 실행
    setTimeout(() => {
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    }, 300);
    
    setTimeout(() => {
        if (typeof applyTranslations === 'function') {
            applyTranslations();
        }
    }, 800);
    
    // 화면 리사이즈 시에도 번역 재적용
    window.addEventListener('resize', () => {
        if (typeof applyTranslations === 'function') {
            setTimeout(() => applyTranslations(), 100);
        }
    });
    
    // 관리자 계정 자동 생성 (최초 실행 시)
    initializeAdmin();
    
    // 로그인 상태 확인
    checkAuthState();
    
    // URL 파라미터 확인 (레퍼럴 링크)
    checkReferralLink();
    
    // 모달 내부 링크 스무스 스크롤
    document.querySelectorAll('.guide-toc a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const modalBody = document.querySelector('.modal-body');
                modalBody.scrollTo({
                    top: targetElement.offsetTop - modalBody.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 모달 외부 클릭시 닫기
    const modals = ['login-modal', 'signup-modal', 'mypage-modal', 'referral-modal', 'admin-modal', 'point-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });
    
    // 드롭다운 아이템 클릭/터치 이벤트 처리 (이벤트 위임 방식 - 가장 확실한 방법)
    function setupDropdownEvents() {
        const userDropdown = document.getElementById('user-dropdown');
        if (!userDropdown) return;
        
        // 기존 이벤트 리스너 제거
        const newDropdown = userDropdown.cloneNode(true);
        userDropdown.parentNode.replaceChild(newDropdown, userDropdown);
        
        // 이벤트 위임으로 한 번만 등록
        newDropdown.addEventListener('click', function(e) {
            const item = e.target.closest('.dropdown-item');
            if (!item) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = item.getAttribute('data-action');
            if (!action) return;
            
            console.log('드롭다운 클릭:', action);
            executeDropdownAction(action);
        }, true); // capture phase에서 처리
        
        // 터치 이벤트 (모바일)
        let touchStartTime = 0;
        let touchStartItem = null;
        
        newDropdown.addEventListener('touchstart', function(e) {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                touchStartTime = Date.now();
                touchStartItem = item;
            }
        }, { passive: true });
        
        newDropdown.addEventListener('touchend', function(e) {
            const item = e.target.closest('.dropdown-item');
            if (!item || item !== touchStartItem) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = item.getAttribute('data-action');
            if (!action) return;
            
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 500) {
                console.log('드롭다운 터치:', action);
                executeDropdownAction(action);
            }
            
            touchStartItem = null;
        }, { passive: false });
    }
    
    // 초기 설정
    setupDropdownEvents();
    
    // 드롭다운 액션 실행 함수 (전역 함수로 변경)
    window.executeDropdownAction = function(action) {
        console.log('=== 드롭다운 액션 실행 ===', action);
        
        // 드롭다운 닫기
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
        
        // 즉시 액션 실행
        try {
            switch(action) {
                case 'mypage':
                    console.log('→ showMyPage 호출');
                    if (typeof showMyPage === 'function') {
                        showMyPage();
                    } else {
                        console.error('❌ showMyPage 함수를 찾을 수 없습니다');
                        alert('오류: 내 기록 기능을 찾을 수 없습니다.');
                    }
                    break;
                case 'referral':
                    console.log('→ showReferralInfo 호출');
                    if (typeof showReferralInfo === 'function') {
                        showReferralInfo();
                    } else {
                        console.error('❌ showReferralInfo 함수를 찾을 수 없습니다');
                        alert('오류: 레퍼럴 기능을 찾을 수 없습니다.');
                    }
                    break;
                case 'admin':
                    console.log('→ showAdminDashboard 호출');
                    if (typeof showAdminDashboard === 'function') {
                        showAdminDashboard();
                    } else {
                        console.error('❌ showAdminDashboard 함수를 찾을 수 없습니다');
                        alert('오류: 관리자 기능을 찾을 수 없습니다.');
                    }
                    break;
                case 'logout':
                    console.log('→ logout 호출');
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        console.error('❌ logout 함수를 찾을 수 없습니다');
                        // 함수가 없어도 강제 로그아웃
                        localStorage.removeItem('currentUserEmail');
                        window.currentUser = null;
                        if (typeof checkAuthState === 'function') {
                            checkAuthState();
                        }
                        if (typeof showScreen === 'function') {
                            showScreen('start-screen');
                        }
                        alert('로그아웃되었습니다.');
                    }
                    break;
                default:
                    console.warn('⚠️ 알 수 없는 드롭다운 액션:', action);
                    alert('알 수 없는 메뉴입니다: ' + action);
            }
        } catch (error) {
            console.error('❌ 드롭다운 액션 실행 오류:', error);
            alert('오류가 발생했습니다: ' + error.message);
        }
    };
    
    // 모바일에서 로그인/회원가입 폼이 확실히 작동하도록
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin(e);
        });
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup(e);
        });
    }
});

// ==================== OpenAI API 설정 (관리자 중앙 관리) ====================

// 관리자 AI 설정 가져오기 (동기 함수 - localStorage 우선, Firestore는 백그라운드 동기화)
let aiSettingsCache = null;
function getAdminAISettings() {
    // localStorage에서 가져오기 (즉시 반환)
    const settings = localStorage.getItem('adminAISettings');
    const parsed = settings ? JSON.parse(settings) : { apiKey: '', aiHubApiKey: '' };
    aiSettingsCache = parsed;
    
    // Supabase에서 백그라운드로 동기화 (비동기)
    if (typeof getAdminAISettingsFromSupabase === 'function') {
        getAdminAISettingsFromSupabase().then(supabaseSettings => {
            if (supabaseSettings) {
                aiSettingsCache = supabaseSettings;
                localStorage.setItem('adminAISettings', JSON.stringify(supabaseSettings));
                console.log('✅ Supabase에서 AI 설정 동기화 완료');
            }
        }).catch(error => {
            console.warn('Supabase AI 설정 동기화 실패:', error);
        });
    }
    
    return parsed;
}

// 관리자 AI 설정 저장 (Firestore 우선)
async function saveAdminAISettings(event) {
    if (event) event.preventDefault();
    
    if (!isAdmin()) {
        alert('관리자 권한이 필요합니다.');
        return;
    }
    
    const apiKey = document.getElementById('admin-openai-key').value.trim();
    const aiHubApiKey = document.getElementById('admin-aihub-key').value.trim();
    const settings = { apiKey, aiHubApiKey };
    
    // Supabase에 저장 시도
    if (typeof saveAdminAISettingsToSupabase === 'function') {
        try {
            await saveAdminAISettingsToSupabase(settings);
            aiSettingsCache = settings;
            // 성공하면 localStorage에도 백업 저장
            localStorage.setItem('adminAISettings', JSON.stringify(settings));
            updateAdminAPIStatus();
            updateAIHubAPIStatus();
            alert('✅ AI 설정이 저장되었습니다! (Supabase)');
            return;
        } catch (error) {
            console.warn('Supabase에 AI 설정 저장 실패, localStorage 사용:', error);
        }
    }
    
    // localStorage 폴백
    localStorage.setItem('adminAISettings', JSON.stringify(settings));
    aiSettingsCache = settings;
    updateAdminAPIStatus();
    updateAIHubAPIStatus();
    alert('✅ AI 설정이 저장되었습니다! (로컬)');
}

// ==================== 쇼핑몰 설정 ====================

// 쇼핑몰 설정 가져오기 (동기 함수 - localStorage 우선, Firestore는 백그라운드 동기화)
let shoppingSettingsCache = null;
function getShoppingSettings() {
    // localStorage에서 가져오기 (즉시 반환)
    const settings = localStorage.getItem('shoppingSettings');
    const parsed = settings ? JSON.parse(settings) : { url: '', enabled: false };
    shoppingSettingsCache = parsed;
    
    // Supabase에서 백그라운드로 동기화 (비동기)
    if (typeof getShoppingSettingsFromSupabase === 'function') {
        getShoppingSettingsFromSupabase().then(supabaseSettings => {
            if (supabaseSettings && (supabaseSettings.url || supabaseSettings.enabled !== undefined)) {
                shoppingSettingsCache = supabaseSettings;
                localStorage.setItem('shoppingSettings', JSON.stringify(supabaseSettings));
                console.log('✅ Supabase에서 쇼핑몰 설정 동기화 완료');
            }
        }).catch(error => {
            console.warn('Supabase 쇼핑몰 설정 동기화 실패:', error);
        });
    }
    
    return parsed;
}

// 쇼핑몰 설정 저장 (Firestore 우선)
async function saveShoppingSettings(event) {
    if (event) event.preventDefault();
    
    if (!isAdmin()) {
        alert('관리자 권한이 필요합니다.');
        return;
    }
    
    const url = document.getElementById('admin-shopping-url').value.trim();
    const enabled = document.getElementById('admin-shopping-enabled').checked;
    const settings = { url, enabled };
    
    // Supabase에 저장 시도
    if (typeof saveShoppingSettingsToSupabase === 'function') {
        try {
            await saveShoppingSettingsToSupabase(settings);
            shoppingSettingsCache = settings;
            // 성공하면 localStorage에도 백업 저장
            localStorage.setItem('shoppingSettings', JSON.stringify(settings));
            updateShoppingStatus();
            alert('✅ 쇼핑몰 설정이 저장되었습니다! (Supabase)');
            return;
        } catch (error) {
            console.warn('Supabase에 쇼핑몰 설정 저장 실패, localStorage 사용:', error);
        }
    }
    
    // localStorage 폴백
    localStorage.setItem('shoppingSettings', JSON.stringify(settings));
    shoppingSettingsCache = settings;
    updateShoppingStatus();
    alert('✅ 쇼핑몰 설정이 저장되었습니다! (로컬)');
}

// 쇼핑몰 상태 업데이트
function updateShoppingStatus() {
    const settings = getShoppingSettings();
    const statusIcon = document.getElementById('admin-shopping-status-icon');
    const statusText = document.getElementById('admin-shopping-status-text');
    const statusDiv = document.getElementById('admin-shopping-status');
    
    statusDiv.className = 'shopping-status';
    
    if (settings.url && settings.enabled) {
        statusIcon.textContent = '🟢';
        statusText.textContent = '쇼핑몰 링크 활성화됨';
        statusDiv.style.color = '#4caf50';
    } else if (settings.url && !settings.enabled) {
        statusIcon.textContent = '🟡';
        statusText.textContent = '쇼핑몰 URL 설정됨 (비활성)';
        statusDiv.style.color = '#ff9800';
    } else {
        statusIcon.textContent = '⚪';
        statusText.textContent = '쇼핑몰 URL이 설정되지 않았습니다';
        statusDiv.style.color = '#999';
    }
}

// 관리자 API 상태 업데이트
function updateAdminAPIStatus() {
    const settings = getAdminAISettings();
    const statusIcon = document.getElementById('admin-api-status-icon');
    const statusText = document.getElementById('admin-api-status-text');
    const statusDiv = document.getElementById('admin-api-status');
    
    statusDiv.className = 'api-status';
    
    if (settings.apiKey) {
        statusIcon.textContent = '🟢';
        statusText.textContent = 'AI 분석 활성화됨';
        statusDiv.classList.add('success');
    } else {
        statusIcon.textContent = '⚪';
        statusText.textContent = 'API 키가 설정되지 않았습니다';
    }
}

// AI Hub API 상태 업데이트
function updateAIHubAPIStatus() {
    const settings = getAdminAISettings();
    const statusIcon = document.getElementById('admin-aihub-status-icon');
    const statusText = document.getElementById('admin-aihub-status-text');
    const statusDiv = document.getElementById('admin-aihub-status');
    
    if (!statusDiv) return; // 요소가 없으면 리턴
    
    statusDiv.className = 'api-status';
    
    if (settings.aiHubApiKey) {
        statusIcon.textContent = '🟢';
        statusText.textContent = 'AI Hub API 활성화됨';
        statusDiv.classList.add('success');
    } else {
        statusIcon.textContent = '⚪';
        statusText.textContent = 'AI Hub API 키가 설정되지 않았습니다';
    }
}

// AI Hub API 키 테스트
async function testAIHubAPIKey() {
    const apiKey = document.getElementById('admin-aihub-key').value.trim();
    
    if (!apiKey) {
        alert('⚠️ AI Hub API 키를 입력해주세요.');
        return;
    }
    
    const statusDiv = document.getElementById('admin-aihub-status');
    const statusIcon = document.getElementById('admin-aihub-status-icon');
    const statusText = document.getElementById('admin-aihub-status-text');
    
    statusIcon.textContent = '⏳';
    statusText.textContent = '연결 테스트 중...';
    statusDiv.className = 'api-status';
    
    try {
        // AI Hub API 엔드포인트 확인 필요 (예시)
        // 실제 AI Hub API 엔드포인트는 AI Hub 문서를 참조하세요
        const response = await fetch('https://api.aihub.or.kr/api/test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey
            }
        });
        
        if (response.ok || response.status === 200) {
            statusIcon.textContent = '🟢';
            statusText.textContent = 'AI Hub API 연결 성공!';
            statusDiv.classList.add('success');
            alert('✅ AI Hub API 연결이 성공했습니다!');
        } else {
            throw new Error(`API 응답 오류: ${response.status}`);
        }
    } catch (error) {
        console.error('AI Hub API 테스트 실패:', error);
        statusIcon.textContent = '🔴';
        statusText.textContent = '연결 실패: ' + error.message;
        statusDiv.classList.add('error');
        alert('⚠️ AI Hub API 연결에 실패했습니다.\n\n참고: AI Hub API 엔드포인트가 다를 수 있습니다. AI Hub 문서를 확인하세요.');
    }
}

// 관리자 API 키 테스트
async function testAdminAPIKey() {
    const apiKey = document.getElementById('admin-openai-key').value.trim();
    
    if (!apiKey) {
        alert('⚠️ API 키를 입력해주세요.');
        return;
    }
    
    const statusDiv = document.getElementById('admin-api-status');
    const statusIcon = document.getElementById('admin-api-status-icon');
    const statusText = document.getElementById('admin-api-status-text');
    
    statusIcon.textContent = '⏳';
    statusText.textContent = '연결 테스트 중...';
    statusDiv.className = 'api-status';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 10
            })
        });
        
        if (response.ok) {
            statusIcon.textContent = '✅';
            statusText.textContent = 'API 연결 성공!';
            statusDiv.classList.add('success');
            alert('✅ OpenAI API 연결에 성공했습니다!');
        } else {
            const error = await response.json();
            throw new Error(error.error?.message || 'API 오류');
        }
    } catch (error) {
        statusIcon.textContent = '❌';
        statusText.textContent = `연결 실패: ${error.message}`;
        statusDiv.classList.add('error');
        alert(`❌ API 연결 실패:\n${error.message}`);
    }
}

// 사용자 AI 크레딧 확인
function getUserAICredits() {
    if (!currentUser) return 0;
    // 최신 정보 가져오기
    const users = getUsers();
    const user = users.find(u => u.email === currentUser.email);
    return user ? (user.aiCredits || 0) : 0;
}

// 사용자 AI 크레딧 업데이트
function updateUserAICredits(email, amount) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        console.error('사용자를 찾을 수 없습니다:', email);
        return false;
    }
    
    const currentCredits = users[userIndex].aiCredits || 0;
    users[userIndex].aiCredits = Math.max(0, currentCredits + amount);
    
    saveUsers(users);
    
    // currentUser 업데이트
    if (currentUser && currentUser.email === email) {
        currentUser.aiCredits = users[userIndex].aiCredits;
    }
    
    console.log(`✅ ${email}의 AI 크레딧: ${currentCredits} → ${users[userIndex].aiCredits} (${amount > 0 ? '+' : ''}${amount})`);
    return true;
}

// AI 크레딧 차감
function deductAICredit() {
    if (!currentUser) return false;
    
    const users = getUsers();
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user) return false;
    
    if ((user.aiCredits || 0) <= 0) {
        return false;
    }
    
    user.aiCredits = (user.aiCredits || 0) - 1;
    saveUsers(users);
    currentUser = user;
    
    // UI 업데이트
    const creditsDisplay = document.getElementById('user-ai-credits');
    if (creditsDisplay) {
        creditsDisplay.textContent = user.aiCredits;
    }
    
    return true;
}

// OpenAI API 호출 (관리자 키 사용)
async function callOpenAI(prompt, systemPrompt = '') {
    const settings = getAdminAISettings();
    
    if (!settings.apiKey) {
        return null;
    }
    
    try {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 오류:', error);
        return null;
    }
}

// AI 건강 분석 생성
async function generateAIAnalysis(answers, cameraResults, healthScore) {
    const settings = getAdminAISettings();
    if (!settings.apiKey) {
        return null;
    }
    
    // 크레딧 확인 (로그인 사용자만)
    if (currentUser && getUserAICredits() <= 0) {
        return null;
    }
    
    // 언어별 시스템 프롬프트
    const systemPrompts = {
        ko: `당신은 전문 건강 컨설턴트입니다. 사용자의 건강 체크 결과를 분석하고 맞춤형 조언을 제공하세요. 친근하고 이해하기 쉬운 한국어로 작성하며, 의학적 근거를 바탕으로 실용적인 조언을 제공하세요.`,
        en: `You are a professional health consultant. Analyze the user's health check results and provide personalized advice. Write in friendly and easy-to-understand English, providing practical advice based on medical evidence.`,
        zh: `您是一名专业的健康顾问。请分析用户的健康检查结果并提供个性化建议。请用友好且易于理解的中文撰写，并基于医学证据提供实用建议。`,
        ja: `あなたはプロの健康コンサルタントです。ユーザーの健康チェック結果を分析し、カスタマイズされたアドバイスを提供してください。親しみやすく分かりやすい日本語で書き、医学的根拠に基づいた実用的なアドバイスを提供してください。`
    };
    
    const systemPrompt = systemPrompts[currentLanguage] || systemPrompts['ko'];
    
    let prompt = `다음은 사용자의 건강 체크 결과입니다:\n\n`;
    prompt += `건강 점수: ${healthScore}점\n\n`;
    prompt += `설문 결과:\n`;
    prompt += `- 나이대: ${answers[1]}\n`;
    prompt += `- 성별: ${answers[2]}\n`;
    prompt += `- 주요 건강 고민: ${answers[3]}\n`;
    prompt += `- 수면 시간: ${answers[4]}\n`;
    prompt += `- 운동 빈도: ${answers[5]}\n`;
    prompt += `- 식사 습관: ${answers[6]}\n`;
    prompt += `- 스트레스 수준: ${answers[7]}\n`;
    prompt += `- 복용 중인 영양제: ${answers[8]}\n\n`;
    
    if (cameraResults.heartRate) {
        prompt += `카메라 측정 결과:\n`;
        prompt += `- 심박수: ${cameraResults.heartRate} BPM\n`;
        if (cameraResults.faceAnalysis) {
            prompt += `- 얼굴 분석: ${cameraResults.faceAnalysis.complexion.desc}\n`;
        }
        if (cameraResults.tongueAnalysis) {
            prompt += `- 혀 진단: ${cameraResults.tongueAnalysis.description}\n`;
        }
        if (cameraResults.irisAnalysis) {
            prompt += `- 홍채 진단: ${cameraResults.irisAnalysis.description}\n`;
        }
    }
    
    prompt += `\n이 결과를 바탕으로:\n`;
    prompt += `1. 현재 건강 상태에 대한 종합 분석 (2-3문장)\n`;
    prompt += `2. 가장 시급하게 개선해야 할 점 (1-2문장)\n`;
    prompt += `3. 장기적 건강 관리를 위한 조언 (2-3문장)\n`;
    prompt += `\n친근하고 격려하는 톤으로 작성해주세요.`;
    
    return await callOpenAI(prompt, systemPrompt);
}

// AI 영양제 추천 근거 생성
async function generateSupplementReason(recommendations, answers, healthScore) {
    const settings = getAdminAISettings();
    if (!settings.apiKey) {
        return null;
    }
    
    const systemPrompts = {
        ko: `당신은 영양학 전문가입니다. 추천된 영양제가 왜 사용자에게 필요한지 과학적 근거와 함께 설명하세요.`,
        en: `You are a nutrition expert. Explain why the recommended supplements are necessary for the user with scientific evidence.`,
        zh: `您是营养专家。请用科学依据解释为什么推荐这些营养品给用户。`,
        ja: `あなたは栄養の専門家です。推奨されたサプリメントがなぜユーザーに必要なのか、科学的根拠とともに説明してください。`
    };
    
    const systemPrompt = systemPrompts[currentLanguage] || systemPrompts['ko'];
    
    const supplements = recommendations.map(r => r.supplement.name).join(', ');
    
    let prompt = `건강 점수 ${healthScore}점인 사용자에게 다음 영양제들을 추천했습니다: ${supplements}\n\n`;
    prompt += `사용자 정보:\n`;
    prompt += `- 주요 건강 고민: ${answers[3]}\n`;
    prompt += `- 수면: ${answers[4]}, 운동: ${answers[5]}, 식사: ${answers[6]}\n`;
    prompt += `- 스트레스: ${answers[7]}\n\n`;
    prompt += `이 영양제들이 왜 추천되었는지, 어떤 효과를 기대할 수 있는지 2-3문장으로 설명해주세요.`;
    
    return await callOpenAI(prompt, systemPrompt);
}

// 관리자 계정 초기화
function initializeAdmin() {
    try {
        const users = getUsers();
        
        // 기존 사용자 데이터 백업 (안전장치)
        if (users.length > 0) {
            const backup = JSON.stringify(users);
            localStorage.setItem('healthUsers_backup', backup);
            console.log('📦 사용자 데이터 백업 완료:', users.length, '명');
        }
        
        const adminExists = users.find(u => u.email === 'admin@health100.com');
        
        if (!adminExists) {
            // 관리자 계정이 없을 때만 생성 (기존 사용자 데이터는 그대로 유지)
            const adminUser = {
                name: '관리자',
                email: 'admin@health100.com',
                password: 'admin1234', // 🔐 여기를 원하는 비밀번호로 변경하세요
                referralCode: 'ADMIN000',
                referredBy: null,
                referralCount: 0,
                // 기본 적립 포인트는 0, AI 검사 가능 횟수는 1,000,000회
                points: 0,
                aiCredits: 1000000,
                joinDate: new Date().toISOString(),
                healthRecords: [],
                isAdmin: true
            };
            
            // 기존 사용자 배열에 관리자만 추가 (기존 데이터 보존)
            users.push(adminUser);
            saveUsers(users);
            console.log('✅ 관리자 계정이 생성되었습니다. (기존 회원:', users.length - 1, '명 유지)');
            console.log('📧 이메일: admin@health100.com');
            console.log('🔐 비밀번호: admin1234');
        } else {
            // 기존 관리자 계정이 있을 때는 업데이트만 (다른 사용자 데이터는 절대 건드리지 않음)
            let updated = false;
            const adminIndex = users.findIndex(u => u.email === 'admin@health100.com');
            
            if (adminIndex !== -1) {
                if (users[adminIndex].points > 500000) {
                    users[adminIndex].points = 0;
                    updated = true;
                }
                if (!users[adminIndex].aiCredits || users[adminIndex].aiCredits < 1000000) {
                    users[adminIndex].aiCredits = 1000000;
                    updated = true;
                }
                
                if (updated) {
                    saveUsers(users);
                    console.log('🔄 관리자 계정 정보가 업데이트되었습니다. (기존 회원:', users.length - 1, '명 유지)');
                }
            }
        }
        
        // 현재 사용자 수 확인
        const currentUsers = getUsers();
        console.log('📊 현재 등록된 회원 수:', currentUsers.length, '명');
        if (currentUsers.length === 1) {
            console.warn('⚠️ 관리자 계정만 있습니다. 기존 회원 데이터가 손실되었을 수 있습니다.');
            // 백업에서 복구 시도
            const backup = localStorage.getItem('healthUsers_backup');
            if (backup) {
                try {
                    const backupUsers = JSON.parse(backup);
                    if (backupUsers.length > 1) {
                        console.log('💾 백업 데이터 발견:', backupUsers.length, '명');
                        console.log('💡 백업에서 복구하려면 브라우저 콘솔에서 다음 명령을 실행하세요:');
                        console.log('localStorage.setItem("healthUsers", localStorage.getItem("healthUsers_backup"))');
                    }
                } catch (e) {
                    console.error('백업 데이터 파싱 오류:', e);
                }
            }
        }
    } catch (error) {
        console.error('❌ 관리자 초기화 오류:', error);
        // 오류 발생 시에도 기존 데이터는 보존
    }
}

