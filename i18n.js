// 다국어 지원 시스템

const translations = {
    ko: {
        // 앱 기본
        'app-title': '🏥 건강 100세',
        'app-subtitle': '나만의 맞춤형 건강식품 추천 서비스',
        
        // 메뉴
        'menu-records': '내 기록',
        'menu-ai-count': 'AI 검사 횟수',
        'menu-referral': '레퍼럴',
        'menu-admin': '관리자',
        'menu-logout': '로그아웃',
        
        // 시작 화면
        'welcome-title': '건강 체크를 시작하세요',
        'welcome-desc': '간단한 질문에 답하시면 맞춤형 건강식품과 영양제를 추천해드립니다',
        'welcome-features': '📋 8가지 설문 + 📸 카메라 건강 체크 + 🤖 AI 분석',
        'benefit-title': '회원가입 혜택',
        'benefit-1': '✅ AI 검사 3회 무료 제공',
        'benefit-2': '✅ 건강 기록 자동 저장',
        'benefit-3': '✅ 레퍼럴 보너스 포인트',
        'benefit-4': '✅ 맞춤형 건강 분석 리포트',
        'btn-signup-now': '지금 가입하기 →',
        'btn-start': '건강 체크 시작하기',
        
        // 특징
        'feature-mobile-title': '모바일 최적화',
        'feature-mobile-desc': '언제 어디서나 편리하게',
        'feature-custom-title': '맞춤형 추천',
        'feature-custom-desc': '나에게 필요한 영양제',
        'feature-science-title': '과학적 분석',
        'feature-science-desc': '체계적인 건강 평가',
        
        // 카메라 기능 소개
        'camera-features-title': '📸 카메라 건강 체크 기능',
        'camera-features-subtitle': '스마트폰 카메라로 간편하게 건강 상태를 확인하세요',
        'camera-feature-heartrate-title': '심박수 측정',
        'camera-feature-heartrate-desc': '손가락을 카메라 후면에 15초간 대면 심박수를 측정합니다.',
        'camera-feature-face-title': '얼굴 분석 (자동 촬영)',
        'camera-feature-face-desc': '얼굴 색상과 혈색을 분석하여 전반적인 건강 상태와 영양 상태를 평가합니다.',
        'camera-feature-tongue-title': '혀 분석 (자동 촬영)',
        'camera-feature-tongue-desc': '혀의 색상과 상태를 분석하여 체질과 건강 상태를 진단합니다.',
        'camera-feature-iris-title': '홍채 분석 (자동 촬영)',
        'camera-feature-iris-desc': '홍채 색상과 패턴을 분석하여 눈 건강과 전반적인 건강 상태를 평가합니다.',
        
        // 설문
        'survey-prev': '이전',
        'survey-next': '다음',
        'survey-result': '결과 보기',
        
        // 카메라
        'camera-choice-title': '📸 카메라 건강 체크',
        'camera-choice-intro': '카메라를 이용한 추가 건강 체크를 진행하시겠습니까?<br>더욱 정확한 건강 분석이 가능합니다!',
        'camera-device-support': '💡 <strong>모든 기기 지원:</strong> 스마트폰, 태블릿, 노트북 모두 사용 가능합니다',
        'camera-device-phone': '📱 스마트폰: 후면 카메라 + 플래시 사용',
        'camera-device-laptop': '💻 노트북/태블릿: 전면 카메라 + 화면 밝기 사용',
        'camera-start-btn': '카메라 체크 하기',
        'camera-start-desc': '심박수, 얼굴 분석, 혀 진단, 홍채 진단',
        'camera-skip-btn': '건너뛰기',
        'camera-skip-desc': '설문 결과만으로 분석',
        'camera-skip-step': '이 단계 건너뛰기',
        'camera-start-measurement': '측정 시작',
        
        // 로딩
        'loading-title': '건강 분석 중...',
        'loading-subtitle': '맞춤형 추천을 준비하고 있습니다',
        'loading-ai-title': '🤖 AI 건강 분석 중...',
        'loading-ai-subtitle': 'GPT-4로 더 정확한 분석을 진행하고 있습니다',
        
        // 결과
        'result-title': '🎯 건강 분석 결과',
        'camera-results-title': '📸 카메라 건강 체크 결과',
        'ai-analysis-title': '🤖 AI 건강 분석',
        'result-supplements': '💊 추천 건강식품 & 영양제',
        'result-tips': '💡 건강 관리 팁',
        'shopping-title': '건강 100세 쇼핑몰',
        'shopping-desc': '추천된 영양제를 편리하게 구매하세요!',
        'shopping-btn': '쇼핑몰 바로가기',
        'btn-restart': '다시 체크하기',
        
        // 인증
        'login': '로그인',
        'signup': '회원가입',
        'email': '이메일',
        'password': '비밀번호',
        'name': '이름',
        
        // 우선순위
        'priority-high': '필수',
        'priority-medium': '권장',
        'priority-low': '선택',
        
        // 레퍼럴
        'referral-code-hint': '또는',
        'referral-link-copy': '링크 복사',
        'referral-link-hint': '👆 이 링크를 공유하면 자동으로 회원가입 페이지가 열립니다',
        'referral-link-success': '추천인의 초대로 회원가입하시면 보너스 포인트를 받을 수 있습니다!',
        
        // 푸터
        'footer-notice': '본 서비스는 일반적인 건강 정보 제공을 목적으로 하며, 의학적 진단이나 처방을 대체할 수 없습니다.',
        'footer-copyright': '© 2025 건강 100세. All rights reserved.',
    },
    
    en: {
        'app-title': '🏥 Health 100',
        'app-subtitle': 'Personalized Health Supplement Recommendation Service',
        
        'menu-records': 'My Records',
        'menu-ai-count': 'AI Tests',
        'menu-referral': 'Referral',
        'menu-admin': 'Admin',
        'menu-logout': 'Logout',
        
        'welcome-title': 'Start Your Health Check',
        'welcome-desc': 'Answer simple questions to get personalized supplement recommendations',
        'welcome-features': '📋 8 Survey Questions + 📸 Camera Health Check + 🤖 AI Analysis',
        'benefit-title': 'Sign Up Benefits',
        'benefit-1': '✅ 3 Free AI Analysis Credits',
        'benefit-2': '✅ Automatic Health Record Saving',
        'benefit-3': '✅ Referral Bonus Points',
        'benefit-4': '✅ Personalized Health Reports',
        'btn-signup-now': 'Sign Up Now →',
        'btn-start': 'Start Health Check',
        
        // Features
        'feature-mobile-title': 'Mobile Optimized',
        'feature-mobile-desc': 'Convenient anytime, anywhere',
        'feature-custom-title': 'Personalized',
        'feature-custom-desc': 'Supplements tailored for you',
        'feature-science-title': 'Scientific Analysis',
        'feature-science-desc': 'Systematic health assessment',
        
        // Camera Features
        'camera-features-title': '📸 Camera Health Check Features',
        'camera-features-subtitle': 'Check your health status easily with your smartphone camera',
        'camera-feature-heartrate-title': 'Heart Rate Measurement',
        'camera-feature-heartrate-desc': 'Place your finger on the rear camera for 15 seconds to measure heart rate.',
        'camera-feature-face-title': 'Face Analysis (Auto Capture)',
        'camera-feature-face-desc': 'Analyze facial color and complexion to assess overall health and nutritional status.',
        'camera-feature-tongue-title': 'Tongue Analysis (Auto Capture)',
        'camera-feature-tongue-desc': 'Analyze tongue color and condition to diagnose constitution and health status.',
        'camera-feature-iris-title': 'Iris Analysis (Auto Capture)',
        'camera-feature-iris-desc': 'Analyze iris color and patterns to assess eye health and overall health status.',
        
        'survey-prev': 'Previous',
        'survey-next': 'Next',
        'survey-result': 'View Results',
        
        // Camera
        'camera-choice-title': '📸 Camera Health Check',
        'camera-choice-intro': 'Would you like to proceed with additional camera health check?<br>More accurate health analysis is possible!',
        'camera-device-support': '💡 <strong>All Devices Supported:</strong> Smartphones, tablets, and laptops',
        'camera-device-phone': '📱 Smartphone: Rear camera + Flash',
        'camera-device-laptop': '💻 Laptop/Tablet: Front camera + Screen brightness',
        'camera-start-btn': 'Start Camera Check',
        'camera-start-desc': 'Heart rate, face analysis, tongue diagnosis, iris analysis',
        'camera-skip-btn': 'Skip',
        'camera-skip-desc': 'Analyze with survey results only',
        'camera-skip-step': 'Skip this step',
        'camera-start-measurement': 'Start Measurement',
        
        'loading-title': 'Analyzing Your Health...',
        'loading-subtitle': 'Preparing personalized recommendations',
        'loading-ai-title': '🤖 AI Health Analysis...',
        'loading-ai-subtitle': 'Getting more accurate analysis with GPT-4',
        
        'result-title': '🎯 Health Analysis Results',
        'camera-results-title': '📸 Camera Health Check Results',
        'ai-analysis-title': '🤖 AI Health Analysis',
        'result-supplements': '💊 Recommended Supplements',
        'result-tips': '💡 Health Management Tips',
        'shopping-title': 'Health 100 Shop',
        'shopping-desc': 'Conveniently purchase recommended supplements!',
        'shopping-btn': 'Visit Shop',
        'btn-restart': 'Take Another Check',
        
        'login': 'Login',
        'signup': 'Sign Up',
        'email': 'Email',
        'password': 'Password',
        'name': 'Name',
        
        'priority-high': 'Essential',
        'priority-medium': 'Recommended',
        'priority-low': 'Optional',
        
        // Referral
        'referral-code-hint': 'or',
        'referral-link-copy': 'Copy Link',
        'referral-link-hint': '👆 Share this link to automatically open the signup page',
        'referral-link-success': 'Sign up with this referral to receive bonus points!',
        
        'footer-notice': 'This service provides general health information and cannot replace medical diagnosis or prescription.',
        'footer-copyright': '© 2025 Health 100. All rights reserved.',
    },
    
    zh: {
        'app-title': '🏥 健康100岁',
        'app-subtitle': '个性化健康食品推荐服务',
        
        'menu-records': '我的记录',
        'menu-ai-count': 'AI检查次数',
        'menu-referral': '推荐',
        'menu-admin': '管理员',
        'menu-logout': '退出',
        
        'welcome-title': '开始健康检查',
        'welcome-desc': '回答简单问题获取个性化营养品推荐',
        'welcome-features': '📋 8个问卷 + 📸 摄像头健康检查 + 🤖 AI分析',
        'benefit-title': '注册优惠',
        'benefit-1': '✅ 免费提供3次AI检查',
        'benefit-2': '✅ 自动保存健康记录',
        'benefit-3': '✅ 推荐奖励积分',
        'benefit-4': '✅ 定制健康分析报告',
        'btn-signup-now': '立即注册 →',
        'btn-start': '开始健康检查',
        
        // 特点
        'feature-mobile-title': '移动优化',
        'feature-mobile-desc': '随时随地便捷使用',
        'feature-custom-title': '个性化推荐',
        'feature-custom-desc': '适合您的营养品',
        'feature-science-title': '科学分析',
        'feature-science-desc': '系统化健康评估',
        
        // 摄像头功能
        'camera-features-title': '📸 摄像头健康检查功能',
        'camera-features-subtitle': '使用智能手机摄像头轻松检查健康状况',
        'camera-feature-heartrate-title': '心率测量',
        'camera-feature-heartrate-desc': '将手指放在后置摄像头上15秒即可测量心率。',
        'camera-feature-face-title': '面部分析（自动拍摄）',
        'camera-feature-face-desc': '分析面部颜色和血色，评估整体健康状况和营养状态。',
        'camera-feature-tongue-title': '舌分析（自动拍摄）',
        'camera-feature-tongue-desc': '分析舌头的颜色和状态，诊断体质和健康状况。',
        'camera-feature-iris-title': '虹膜分析（自动拍摄）',
        'camera-feature-iris-desc': '分析虹膜颜色和图案，评估眼部健康和整体健康状况。',
        
        'survey-prev': '上一步',
        'survey-next': '下一步',
        'survey-result': '查看结果',
        
        // 摄像头
        'camera-choice-title': '📸 摄像头健康检查',
        'camera-choice-intro': '是否要进行额外的摄像头健康检查？<br>可以进行更准确的健康分析！',
        'camera-device-support': '💡 <strong>支持所有设备：</strong> 智能手机、平板电脑、笔记本电脑',
        'camera-device-phone': '📱 智能手机：后置摄像头 + 闪光灯',
        'camera-device-laptop': '💻 笔记本/平板：前置摄像头 + 屏幕亮度',
        'camera-start-btn': '开始摄像头检查',
        'camera-start-desc': '心率、面部分析、舌诊、虹膜诊断',
        'camera-skip-btn': '跳过',
        'camera-skip-desc': '仅使用问卷结果分析',
        'camera-skip-step': '跳过此步骤',
        'camera-start-measurement': '开始测量',
        
        'loading-title': '健康分析中...',
        'loading-subtitle': '正在准备个性化推荐',
        'loading-ai-title': '🤖 AI健康分析中...',
        'loading-ai-subtitle': '使用GPT-4进行更准确的分析',
        
        'result-title': '🎯 健康分析结果',
        'camera-results-title': '📸 摄像头健康检查结果',
        'ai-analysis-title': '🤖 AI健康分析',
        'result-supplements': '💊 推荐营养品',
        'result-tips': '💡 健康管理建议',
        'shopping-title': '健康100岁商城',
        'shopping-desc': '方便购买推荐的营养品！',
        'shopping-btn': '访问商城',
        'btn-restart': '重新检查',
        
        'login': '登录',
        'signup': '注册',
        'email': '邮箱',
        'password': '密码',
        'name': '姓名',
        
        'priority-high': '必需',
        'priority-medium': '推荐',
        'priority-low': '可选',
        
        // 推荐
        'referral-code-hint': '或者',
        'referral-link-copy': '复制链接',
        'referral-link-hint': '👆 分享此链接可自动打开注册页面',
        'referral-link-success': '通过推荐注册可获得奖励积分！',
        
        'footer-notice': '本服务仅供一般健康信息参考，不能替代医学诊断或处方。',
        'footer-copyright': '© 2025 健康100岁。保留所有权利。',
    },
    
    ja: {
        'app-title': '🏥 健康100歳',
        'app-subtitle': 'オーダーメイド健康食品推奨サービス',
        
        'menu-records': 'マイ記録',
        'menu-ai-count': 'AI検査回数',
        'menu-referral': '紹介',
        'menu-admin': '管理者',
        'menu-logout': 'ログアウト',
        
        'welcome-title': '健康チェックを始める',
        'welcome-desc': '簡単な質問に答えてオーダーメイドサプリメントの推奨を受ける',
        'welcome-features': '📋 8つのアンケート + 📸 カメラ健康チェック + 🤖 AI分析',
        'benefit-title': '会員登録特典',
        'benefit-1': '✅ AI検査3回無料',
        'benefit-2': '✅ 健康記録自動保存',
        'benefit-3': '✅ 紹介ボーナスポイント',
        'benefit-4': '✅ カスタム健康分析レポート',
        'btn-signup-now': '今すぐ登録 →',
        'btn-start': '健康チェック開始',
        
        // 特徴
        'feature-mobile-title': 'モバイル最適化',
        'feature-mobile-desc': 'いつでもどこでも便利に',
        'feature-custom-title': 'カスタマイズ推奨',
        'feature-custom-desc': 'あなたに必要なサプリメント',
        'feature-science-title': '科学的分析',
        'feature-science-desc': '体系的な健康評価',
        
        // カメラ機能
        'camera-features-title': '📸 カメラ健康チェック機能',
        'camera-features-subtitle': 'スマートフォンのカメラで簡単に健康状態を確認',
        'camera-feature-heartrate-title': '心拍数測定',
        'camera-feature-heartrate-desc': '指をカメラの背面に15秒間当てると心拍数を測定します。',
        'camera-feature-face-title': '顔分析（自動撮影）',
        'camera-feature-face-desc': '顔の色と血色を分析し、全体的な健康状態と栄養状態を評価します。',
        'camera-feature-tongue-title': '舌分析（自動撮影）',
        'camera-feature-tongue-desc': '舌の色と状態を分析し、体質と健康状態を診断します。',
        'camera-feature-iris-title': '虹彩分析（自動撮影）',
        'camera-feature-iris-desc': '虹彩の色とパターンを分析し、目の健康と全体的な健康状態を評価します。',
        
        'survey-prev': '前へ',
        'survey-next': '次へ',
        'survey-result': '結果を見る',
        
        // カメラ
        'camera-choice-title': '📸 カメラ健康チェック',
        'camera-choice-intro': 'カメラを利用した追加健康チェックを行いますか？<br>より正確な健康分析が可能です！',
        'camera-device-support': '💡 <strong>すべてのデバイスに対応：</strong> スマートフォン、タブレット、ノートパソコン',
        'camera-device-phone': '📱 スマートフォン：リアカメラ + フラッシュ使用',
        'camera-device-laptop': '💻 ノートパソコン/タブレット：フロントカメラ + 画面の明るさ使用',
        'camera-start-btn': 'カメラチェック開始',
        'camera-start-desc': '心拍数、顔分析、舌診断、虹彩診断',
        'camera-skip-btn': 'スキップ',
        'camera-skip-desc': 'アンケート結果のみで分析',
        'camera-skip-step': 'このステップをスキップ',
        'camera-start-measurement': '測定開始',
        
        'loading-title': '健康分析中...',
        'loading-subtitle': 'パーソナライズされた推奨を準備中',
        'loading-ai-title': '🤖 AI健康分析中...',
        'loading-ai-subtitle': 'GPT-4でより正確な分析を実施中',
        
        'result-title': '🎯 健康分析結果',
        'camera-results-title': '📸 カメラ健康チェック結果',
        'ai-analysis-title': '🤖 AI健康分析',
        'result-supplements': '💊 推奨サプリメント',
        'result-tips': '💡 健康管理のヒント',
        'shopping-title': '健康100歳ショップ',
        'shopping-desc': '推奨されたサプリメントを便利に購入！',
        'shopping-btn': 'ショップへ',
        'btn-restart': '再チェック',
        
        'login': 'ログイン',
        'signup': '会員登録',
        'email': 'メール',
        'password': 'パスワード',
        'name': '名前',
        
        'priority-high': '必須',
        'priority-medium': '推奨',
        'priority-low': 'オプション',
        
        // 紹介
        'referral-code-hint': 'または',
        'referral-link-copy': 'リンクをコピー',
        'referral-link-hint': '👆 このリンクを共有すると自動的に登録ページが開きます',
        'referral-link-success': '紹介登録でボーナスポイントを獲得！',
        
        'footer-notice': '本サービスは一般的な健康情報提供を目的とし、医学的診断や処方の代替にはなりません。',
        'footer-copyright': '© 2025 健康100歳。全著作権所有。',
    }
};

// 영양제 정보 다국어
const supplementInfo = {
    ko: {
        multivitamin: { name: "종합 비타민", benefits: "전반적인 영양 균형을 맞춰주고 면역력을 강화합니다", dosage: "1일 1회, 식후 복용" },
        omega3: { name: "오메가3", benefits: "혈액순환 개선, 심혈관 건강, 뇌 기능 향상", dosage: "1일 1-2회, 1000mg" },
        vitaminD: { name: "비타민 D", benefits: "뼈 건강, 면역력 강화, 우울감 개선", dosage: "1일 1회, 2000IU" },
        probiotics: { name: "유산균", benefits: "장 건강 개선, 소화 기능 향상, 면역력 강화", dosage: "1일 1회, 공복 또는 식전" },
        magnesium: { name: "마그네슘", benefits: "근육 이완, 스트레스 완화, 수면의 질 개선", dosage: "1일 1회, 취침 전 300-400mg" },
        vitaminB: { name: "비타민 B 복합체", benefits: "에너지 생성, 피로 회복, 신경 기능 개선", dosage: "1일 1회, 아침 식후" },
        iron: { name: "철분", benefits: "빈혈 예방, 에너지 증진, 산소 운반", dosage: "1일 1회, 식후 (비타민C와 함께)" },
        calcium: { name: "칼슘", benefits: "뼈 건강, 골다공증 예방, 근육 기능", dosage: "1일 1-2회, 식후 500-1000mg" },
        glucosamine: { name: "글루코사민", benefits: "관절 건강, 연골 보호, 관절염 완화", dosage: "1일 1-2회, 1500mg" },
        lutein: { name: "루테인", benefits: "눈 건강, 황반변성 예방, 시력 보호", dosage: "1일 1회, 10-20mg" },
        collagen: { name: "콜라겐", benefits: "피부 탄력, 주름 개선, 관절 건강", dosage: "1일 1회, 5000-10000mg" },
        vitaminC: { name: "비타민 C", benefits: "면역력 강화, 항산화, 피부 건강", dosage: "1일 1-2회, 500-1000mg" },
        ashwagandha: { name: "아슈와간다", benefits: "스트레스 완화, 불안 감소, 수면 개선", dosage: "1일 1-2회, 300-500mg" },
        coq10: { name: "코엔자임 Q10", benefits: "심장 건강, 에너지 생성, 항산화", dosage: "1일 1회, 100-200mg" }
    },
    en: {
        multivitamin: { name: "Multivitamin", benefits: "Balances overall nutrition and strengthens immunity", dosage: "Once daily after meals" },
        omega3: { name: "Omega-3", benefits: "Improves circulation, heart and brain health", dosage: "1-2 times daily, 1000mg" },
        vitaminD: { name: "Vitamin D", benefits: "Bone health, immunity boost, mood improvement", dosage: "Once daily, 2000IU" },
        probiotics: { name: "Probiotics", benefits: "Improves gut health, digestion, and immunity", dosage: "Once daily, empty stomach" },
        magnesium: { name: "Magnesium", benefits: "Muscle relaxation, stress relief, better sleep", dosage: "Once daily before bed, 300-400mg" },
        vitaminB: { name: "Vitamin B Complex", benefits: "Energy production, fatigue recovery, nerve function", dosage: "Once daily after breakfast" },
        iron: { name: "Iron", benefits: "Prevents anemia, boosts energy, oxygen transport", dosage: "Once daily after meals (with Vitamin C)" },
        calcium: { name: "Calcium", benefits: "Bone health, osteoporosis prevention, muscle function", dosage: "1-2 times daily, 500-1000mg" },
        glucosamine: { name: "Glucosamine", benefits: "Joint health, cartilage protection, arthritis relief", dosage: "1-2 times daily, 1500mg" },
        lutein: { name: "Lutein", benefits: "Eye health, macular degeneration prevention", dosage: "Once daily, 10-20mg" },
        collagen: { name: "Collagen", benefits: "Skin elasticity, wrinkle improvement, joint health", dosage: "Once daily, 5000-10000mg" },
        vitaminC: { name: "Vitamin C", benefits: "Immunity boost, antioxidant, skin health", dosage: "1-2 times daily, 500-1000mg" },
        ashwagandha: { name: "Ashwagandha", benefits: "Stress relief, anxiety reduction, sleep improvement", dosage: "1-2 times daily, 300-500mg" },
        coq10: { name: "Coenzyme Q10", benefits: "Heart health, energy production, antioxidant", dosage: "Once daily, 100-200mg" }
    },
    zh: {
        multivitamin: { name: "综合维生素", benefits: "平衡整体营养并增强免疫力", dosage: "每日1次，餐后服用" },
        omega3: { name: "欧米伽3", benefits: "改善血液循环、心脏和大脑健康", dosage: "每日1-2次，1000mg" },
        vitaminD: { name: "维生素D", benefits: "骨骼健康、增强免疫力、改善情绪", dosage: "每日1次，2000IU" },
        probiotics: { name: "益生菌", benefits: "改善肠道健康、消化功能、免疫力", dosage: "每日1次，空腹服用" },
        magnesium: { name: "镁", benefits: "肌肉放松、缓解压力、改善睡眠质量", dosage: "每日1次，睡前300-400mg" },
        vitaminB: { name: "维生素B复合体", benefits: "能量生成、消除疲劳、改善神经功能", dosage: "每日1次，早餐后" },
        iron: { name: "铁", benefits: "预防贫血、增强能量、运输氧气", dosage: "每日1次，餐后（配合维生素C）" },
        calcium: { name: "钙", benefits: "骨骼健康、预防骨质疏松、肌肉功能", dosage: "每日1-2次，500-1000mg" },
        glucosamine: { name: "氨基葡萄糖", benefits: "关节健康、保护软骨、缓解关节炎", dosage: "每日1-2次，1500mg" },
        lutein: { name: "叶黄素", benefits: "眼睛健康、预防黄斑变性", dosage: "每日1次，10-20mg" },
        collagen: { name: "胶原蛋白", benefits: "皮肤弹性、改善皱纹、关节健康", dosage: "每日1次，5000-10000mg" },
        vitaminC: { name: "维生素C", benefits: "增强免疫力、抗氧化、皮肤健康", dosage: "每日1-2次，500-1000mg" },
        ashwagandha: { name: "南非醉茄", benefits: "缓解压力、减少焦虑、改善睡眠", dosage: "每日1-2次，300-500mg" },
        coq10: { name: "辅酶Q10", benefits: "心脏健康、能量生成、抗氧化", dosage: "每日1次，100-200mg" }
    },
    ja: {
        multivitamin: { name: "総合ビタミン", benefits: "全体的な栄養バランスを整え免疫力を強化", dosage: "1日1回、食後に服用" },
        omega3: { name: "オメガ3", benefits: "血液循環改善、心臓と脳の健康", dosage: "1日1-2回、1000mg" },
        vitaminD: { name: "ビタミンD", benefits: "骨の健康、免疫力強化、気分改善", dosage: "1日1回、2000IU" },
        probiotics: { name: "乳酸菌", benefits: "腸の健康改善、消化機能向上、免疫力強化", dosage: "1日1回、空腹時に服用" },
        magnesium: { name: "マグネシウム", benefits: "筋肉弛緩、ストレス緩和、睡眠質改善", dosage: "1日1回、就寝前300-400mg" },
        vitaminB: { name: "ビタミンB複合体", benefits: "エネルギー生成、疲労回復、神経機能改善", dosage: "1日1回、朝食後" },
        iron: { name: "鉄分", benefits: "貧血予防、エネルギー増進、酸素運搬", dosage: "1日1回、食後（ビタミンCと一緒に）" },
        calcium: { name: "カルシウム", benefits: "骨の健康、骨粗鬆症予防、筋肉機能", dosage: "1日1-2回、500-1000mg" },
        glucosamine: { name: "グルコサミン", benefits: "関節の健康、軟骨保護、関節炎緩和", dosage: "1日1-2回、1500mg" },
        lutein: { name: "ルテイン", benefits: "目の健康、黄斑変性予防", dosage: "1日1回、10-20mg" },
        collagen: { name: "コラーゲン", benefits: "肌の弾力、しわ改善、関節の健康", dosage: "1日1回、5000-10000mg" },
        vitaminC: { name: "ビタミンC", benefits: "免疫力強化、抗酸化、肌の健康", dosage: "1日1-2回、500-1000mg" },
        ashwagandha: { name: "アシュワガンダ", benefits: "ストレス緩和、不安軽減、睡眠改善", dosage: "1日1-2回、300-500mg" },
        coq10: { name: "コエンザイムQ10", benefits: "心臓の健康、エネルギー生成、抗酸化", dosage: "1日1回、100-200mg" }
    }
};

// 설문 질문 다국어
const surveyTranslations = {
    ko: {
        questions: [
            {
                question: "나이대를 선택해주세요",
                options: [
                    { label: "20대", icon: "👦" },
                    { label: "30대", icon: "👨" },
                    { label: "40대", icon: "🧔" },
                    { label: "50대", icon: "👨‍🦳" },
                    { label: "60대 이상", icon: "👴" }
                ]
            },
            {
                question: "성별을 선택해주세요",
                options: [
                    { label: "남성", icon: "👨" },
                    { label: "여성", icon: "👩" }
                ]
            },
            {
                question: "현재 가장 걱정되는 건강 문제는 무엇인가요?",
                options: [
                    { label: "피로와 무기력", icon: "😴" },
                    { label: "면역력 저하", icon: "🤧" },
                    { label: "소화/장 건강", icon: "🤢" },
                    { label: "관절/뼈 건강", icon: "🦴" },
                    { label: "눈 건강", icon: "👁️" },
                    { label: "피부 건강", icon: "✨" },
                    { label: "스트레스/불면", icon: "😰" }
                ]
            },
            {
                question: "하루 평균 수면 시간은 얼마나 되나요?",
                options: [
                    { label: "5시간 미만", icon: "😫" },
                    { label: "5-6시간", icon: "😪" },
                    { label: "6-7시간", icon: "😌" },
                    { label: "7-8시간", icon: "😊" },
                    { label: "8시간 이상", icon: "😴" }
                ]
            },
            {
                question: "운동 빈도는 어느 정도인가요?",
                options: [
                    { label: "거의 안함", icon: "🛋️" },
                    { label: "월 1-2회", icon: "🚶" },
                    { label: "주 1-2회", icon: "🏃" },
                    { label: "주 3-4회", icon: "💪" },
                    { label: "거의 매일", icon: "🏋️" }
                ]
            },
            {
                question: "식사 습관은 어떤가요?",
                options: [
                    { label: "불규칙적", icon: "🍔" },
                    { label: "자주 거름", icon: "🚫" },
                    { label: "규칙적", icon: "🍱" },
                    { label: "영양 균형 고려", icon: "🥗" }
                ]
            },
            {
                question: "스트레스 수준은 어느 정도인가요?",
                options: [
                    { label: "매우 높음", icon: "😫" },
                    { label: "높음", icon: "😰" },
                    { label: "보통", icon: "😐" },
                    { label: "낮음", icon: "😌" },
                    { label: "매우 낮음", icon: "😊" }
                ]
            },
            {
                question: "현재 복용 중인 영양제가 있나요?",
                options: [
                    { label: "없음", icon: "❌" },
                    { label: "1가지", icon: "💊" },
                    { label: "2-3가지", icon: "💊💊" },
                    { label: "4가지 이상", icon: "💊💊💊" }
                ]
            }
        ]
    },
    en: {
        questions: [
            {
                question: "Please select your age group",
                options: [
                    { label: "20s", icon: "👦" },
                    { label: "30s", icon: "👨" },
                    { label: "40s", icon: "🧔" },
                    { label: "50s", icon: "👨‍🦳" },
                    { label: "60+", icon: "👴" }
                ]
            },
            {
                question: "Please select your gender",
                options: [
                    { label: "Male", icon: "👨" },
                    { label: "Female", icon: "👩" }
                ]
            },
            {
                question: "What is your main health concern?",
                options: [
                    { label: "Fatigue & Lethargy", icon: "😴" },
                    { label: "Low Immunity", icon: "🤧" },
                    { label: "Digestion/Gut Health", icon: "🤢" },
                    { label: "Joint/Bone Health", icon: "🦴" },
                    { label: "Eye Health", icon: "👁️" },
                    { label: "Skin Health", icon: "✨" },
                    { label: "Stress/Insomnia", icon: "😰" }
                ]
            },
            {
                question: "How many hours do you sleep per day?",
                options: [
                    { label: "Less than 5 hours", icon: "😫" },
                    { label: "5-6 hours", icon: "😪" },
                    { label: "6-7 hours", icon: "😌" },
                    { label: "7-8 hours", icon: "😊" },
                    { label: "More than 8 hours", icon: "😴" }
                ]
            },
            {
                question: "How often do you exercise?",
                options: [
                    { label: "Rarely", icon: "🛋️" },
                    { label: "1-2 times/month", icon: "🚶" },
                    { label: "1-2 times/week", icon: "🏃" },
                    { label: "3-4 times/week", icon: "💪" },
                    { label: "Almost daily", icon: "🏋️" }
                ]
            },
            {
                question: "How are your eating habits?",
                options: [
                    { label: "Irregular", icon: "🍔" },
                    { label: "Often skip meals", icon: "🚫" },
                    { label: "Regular", icon: "🍱" },
                    { label: "Balanced nutrition", icon: "🥗" }
                ]
            },
            {
                question: "What is your stress level?",
                options: [
                    { label: "Very high", icon: "😫" },
                    { label: "High", icon: "😰" },
                    { label: "Moderate", icon: "😐" },
                    { label: "Low", icon: "😌" },
                    { label: "Very low", icon: "😊" }
                ]
            },
            {
                question: "Are you currently taking any supplements?",
                options: [
                    { label: "None", icon: "❌" },
                    { label: "1 type", icon: "💊" },
                    { label: "2-3 types", icon: "💊💊" },
                    { label: "4+ types", icon: "💊💊💊" }
                ]
            }
        ]
    },
    zh: {
        questions: [
            {
                question: "请选择您的年龄段",
                options: [
                    { label: "20多岁", icon: "👦" },
                    { label: "30多岁", icon: "👨" },
                    { label: "40多岁", icon: "🧔" },
                    { label: "50多岁", icon: "👨‍🦳" },
                    { label: "60岁以上", icon: "👴" }
                ]
            },
            {
                question: "请选择您的性别",
                options: [
                    { label: "男性", icon: "👨" },
                    { label: "女性", icon: "👩" }
                ]
            },
            {
                question: "您目前最担心的健康问题是什么？",
                options: [
                    { label: "疲劳无力", icon: "😴" },
                    { label: "免疫力低下", icon: "🤧" },
                    { label: "消化/肠道健康", icon: "🤢" },
                    { label: "关节/骨骼健康", icon: "🦴" },
                    { label: "眼睛健康", icon: "👁️" },
                    { label: "皮肤健康", icon: "✨" },
                    { label: "压力/失眠", icon: "😰" }
                ]
            },
            {
                question: "您每天平均睡眠时间是多少？",
                options: [
                    { label: "不足5小时", icon: "😫" },
                    { label: "5-6小时", icon: "😪" },
                    { label: "6-7小时", icon: "😌" },
                    { label: "7-8小时", icon: "😊" },
                    { label: "8小时以上", icon: "😴" }
                ]
            },
            {
                question: "您的运动频率如何？",
                options: [
                    { label: "几乎不运动", icon: "🛋️" },
                    { label: "每月1-2次", icon: "🚶" },
                    { label: "每周1-2次", icon: "🏃" },
                    { label: "每周3-4次", icon: "💪" },
                    { label: "几乎每天", icon: "🏋️" }
                ]
            },
            {
                question: "您的饮食习惯如何？",
                options: [
                    { label: "不规律", icon: "🍔" },
                    { label: "经常不吃", icon: "🚫" },
                    { label: "规律", icon: "🍱" },
                    { label: "营养均衡", icon: "🥗" }
                ]
            },
            {
                question: "您的压力水平如何？",
                options: [
                    { label: "非常高", icon: "😫" },
                    { label: "高", icon: "😰" },
                    { label: "中等", icon: "😐" },
                    { label: "低", icon: "😌" },
                    { label: "非常低", icon: "😊" }
                ]
            },
            {
                question: "您目前在服用营养品吗？",
                options: [
                    { label: "没有", icon: "❌" },
                    { label: "1种", icon: "💊" },
                    { label: "2-3种", icon: "💊💊" },
                    { label: "4种以上", icon: "💊💊💊" }
                ]
            }
        ]
    },
    ja: {
        questions: [
            {
                question: "年齢層を選択してください",
                options: [
                    { label: "20代", icon: "👦" },
                    { label: "30代", icon: "👨" },
                    { label: "40代", icon: "🧔" },
                    { label: "50代", icon: "👨‍🦳" },
                    { label: "60代以上", icon: "👴" }
                ]
            },
            {
                question: "性別を選択してください",
                options: [
                    { label: "男性", icon: "👨" },
                    { label: "女性", icon: "👩" }
                ]
            },
            {
                question: "現在最も心配な健康問題は何ですか？",
                options: [
                    { label: "疲労と無気力", icon: "😴" },
                    { label: "免疫力低下", icon: "🤧" },
                    { label: "消化/腸の健康", icon: "🤢" },
                    { label: "関節/骨の健康", icon: "🦴" },
                    { label: "目の健康", icon: "👁️" },
                    { label: "肌の健康", icon: "✨" },
                    { label: "ストレス/不眠", icon: "😰" }
                ]
            },
            {
                question: "1日の平均睡眠時間はどのくらいですか？",
                options: [
                    { label: "5時間未満", icon: "😫" },
                    { label: "5-6時間", icon: "😪" },
                    { label: "6-7時間", icon: "😌" },
                    { label: "7-8時間", icon: "😊" },
                    { label: "8時間以上", icon: "😴" }
                ]
            },
            {
                question: "運動の頻度はどのくらいですか？",
                options: [
                    { label: "ほとんどしない", icon: "🛋️" },
                    { label: "月1-2回", icon: "🚶" },
                    { label: "週1-2回", icon: "🏃" },
                    { label: "週3-4回", icon: "💪" },
                    { label: "ほぼ毎日", icon: "🏋️" }
                ]
            },
            {
                question: "食事の習慣はどうですか？",
                options: [
                    { label: "不規則", icon: "🍔" },
                    { label: "よく抜く", icon: "🚫" },
                    { label: "規則的", icon: "🍱" },
                    { label: "栄養バランス考慮", icon: "🥗" }
                ]
            },
            {
                question: "ストレスレベルはどのくらいですか？",
                options: [
                    { label: "非常に高い", icon: "😫" },
                    { label: "高い", icon: "😰" },
                    { label: "普通", icon: "😐" },
                    { label: "低い", icon: "😌" },
                    { label: "非常に低い", icon: "😊" }
                ]
            },
            {
                question: "現在サプリメントを服用していますか？",
                options: [
                    { label: "なし", icon: "❌" },
                    { label: "1種類", icon: "💊" },
                    { label: "2-3種類", icon: "💊💊" },
                    { label: "4種類以上", icon: "💊💊💊" }
                ]
            }
        ]
    }
};

// 현재 언어
let currentLanguage = 'ko';

// 언어 가져오기
function getCurrentLanguage() {
    const saved = localStorage.getItem('language');
    return saved || 'ko';
}

// 언어 저장
function saveLanguage(lang) {
    localStorage.setItem('language', lang);
    currentLanguage = lang;
}

// 번역 가져오기
function t(key) {
    return translations[currentLanguage][key] || translations['ko'][key] || key;
}

// 분석 결과 텍스트 다국어
const analysisTexts = {
    ko: {
        // 요약 제목
        energyTitle: '에너지 & 피로',
        immunityTitle: '면역력',
        digestionTitle: '소화 건강',
        jointsTitle: '관절 & 뼈',
        eyesTitle: '눈 건강',
        skinTitle: '피부 건강',
        stressTitle: '스트레스',
        
        // 요약 설명
        energyDesc: '피로 회복을 위해 비타민 B와 충분한 수면이 중요합니다.',
        immunityDesc: '면역력 강화를 위해 규칙적인 생활과 영양제 복용이 도움됩니다.',
        digestionDesc: '유산균과 식이섬유 섭취로 장 건강을 개선하세요.',
        jointsDesc: '관절 건강을 위해 적절한 운동과 영양 보충이 필요합니다.',
        eyesDesc: '화면 사용 시간을 줄이고 루테인을 꾸준히 섭취하세요.',
        skinDesc: '충분한 수분 섭취와 콜라겐 보충으로 피부 건강을 관리하세요.',
        stressDesc: '명상, 요가, 충분한 휴식으로 스트레스를 관리하세요.',
        
        // 추천 이유 (기본 추천)
        multivitaminReason: '전반적인 영양 균형을 위한 필수 영양소',
        omega3Reason: '심혈관 건강과 뇌 기능 향상에 필수',
        vitaminDReason: '현대인의 부족하기 쉬운 필수 영양소',
        
        // 추천 이유 (특정 증상)
        energyReason: '에너지 생성과 피로 회복에 효과적',
        cellEnergyReason: '세포 에너지 생성 지원',
        immunityBasicReason: '면역력 강화의 기본',
        gutHealthReason: '장 건강을 통한 면역력 증진',
        digestionCoreReason: '장 건강 개선의 핵심',
        jointHealthReason: '관절 건강과 연골 보호',
        boneHealthReason: '뼈 건강 유지',
        eyeHealthReason: '눈 건강과 시력 보호',
        skinElasticityReason: '피부 탄력과 주름 개선',
        collagenSynthesisReason: '콜라겐 합성과 피부 건강',
        stressReliefReason: '스트레스 완화와 수면 개선',
        naturalStressReliefReason: '자연 스트레스 완화제',
        sleepQualityReason: '수면의 질 개선',
        womenIronReason: '여성에게 필요한 철분 보충',
        ageBoneReason: '나이가 들수록 중요한 뼈 건강',
        heartEnergyReason: '심장 건강과 에너지 생성',
        heartRateStabilizationReason: '심박수 안정화와 스트레스 완화',
        ironEnergyReason: '에너지 증진과 피로 개선',
        
        // 건강 팁
        sleepTip: '하루 7-8시간의 충분한 수면이 건강의 기본입니다. 규칙적인 취침 시간을 만들어보세요.',
        exerciseTip: '주 3회 이상, 30분씩 가벼운 걷기나 스트레칭부터 시작해보세요.',
        mealTip: '규칙적인 식사가 건강의 기본입니다. 하루 3끼를 거르지 않도록 노력하세요.',
        stressTip: '명상, 요가, 취미 활동 등으로 스트레스를 관리하세요. 전문가 상담도 고려해보세요.',
        highHeartRateTip: '심박수가 다소 높습니다. 스트레스 관리와 규칙적인 운동이 도움됩니다.',
        lowHeartRateTip: '심박수가 낮습니다. 운동선수가 아니라면 전문의 상담을 권장합니다.'
    },
    en: {
        // Summary titles
        energyTitle: 'Energy & Fatigue',
        immunityTitle: 'Immunity',
        digestionTitle: 'Digestive Health',
        jointsTitle: 'Joints & Bones',
        eyesTitle: 'Eye Health',
        skinTitle: 'Skin Health',
        stressTitle: 'Stress',
        
        // Summary descriptions
        energyDesc: 'Vitamin B and sufficient sleep are important for fatigue recovery.',
        immunityDesc: 'Regular lifestyle and supplements help strengthen immunity.',
        digestionDesc: 'Improve gut health with probiotics and dietary fiber.',
        jointsDesc: 'Proper exercise and nutrition are needed for joint health.',
        eyesDesc: 'Reduce screen time and consistently take lutein.',
        skinDesc: 'Manage skin health with adequate water intake and collagen supplementation.',
        stressDesc: 'Manage stress with meditation, yoga, and adequate rest.',
        
        // Recommendation reasons (Basic)
        multivitaminReason: 'Essential nutrients for overall nutrition balance',
        omega3Reason: 'Essential for cardiovascular and brain health',
        vitaminDReason: 'Essential nutrients often deficient in modern lifestyle',
        
        // Recommendation reasons (Specific)
        energyReason: 'Effective for energy production and fatigue recovery',
        cellEnergyReason: 'Supports cellular energy production',
        immunityBasicReason: 'Foundation of immunity boost',
        gutHealthReason: 'Immunity boost through gut health',
        digestionCoreReason: 'Core of gut health improvement',
        jointHealthReason: 'Joint health and cartilage protection',
        boneHealthReason: 'Bone health maintenance',
        eyeHealthReason: 'Eye health and vision protection',
        skinElasticityReason: 'Skin elasticity and wrinkle improvement',
        collagenSynthesisReason: 'Collagen synthesis and skin health',
        stressReliefReason: 'Stress relief and sleep improvement',
        naturalStressReliefReason: 'Natural stress reliever',
        sleepQualityReason: 'Improves sleep quality',
        womenIronReason: 'Iron supplementation for women',
        ageBoneReason: 'Bone health becomes more important with age',
        heartEnergyReason: 'Heart health and energy production',
        heartRateStabilizationReason: 'Heart rate stabilization and stress relief',
        ironEnergyReason: 'Energy boost and fatigue improvement',
        
        // Health tips
        sleepTip: 'Getting 7-8 hours of sleep daily is fundamental to health. Establish a regular bedtime.',
        exerciseTip: 'Start with light walking or stretching for 30 minutes, 3+ times per week.',
        mealTip: 'Regular meals are the foundation of health. Try not to skip 3 meals a day.',
        stressTip: 'Manage stress with meditation, yoga, or hobbies. Consider professional counseling.',
        highHeartRateTip: 'Your heart rate is somewhat high. Stress management and regular exercise can help.',
        lowHeartRateTip: 'Your heart rate is low. If you are not an athlete, consult a doctor.'
    },
    zh: {
        // 摘要标题
        energyTitle: '能量和疲劳',
        immunityTitle: '免疫力',
        digestionTitle: '消化健康',
        jointsTitle: '关节和骨骼',
        eyesTitle: '眼睛健康',
        skinTitle: '皮肤健康',
        stressTitle: '压力',
        
        // 摘要描述
        energyDesc: '维生素B和充足的睡眠对疲劳恢复很重要。',
        immunityDesc: '规律的生活方式和营养品有助于增强免疫力。',
        digestionDesc: '通过益生菌和膳食纤维改善肠道健康。',
        jointsDesc: '关节健康需要适当的运动和营养补充。',
        eyesDesc: '减少屏幕时间，坚持服用叶黄素。',
        skinDesc: '通过充足的水分摄入和胶原蛋白补充来管理皮肤健康。',
        stressDesc: '通过冥想、瑜伽和充足的休息来管理压力。',
        
        // 推荐理由（基本）
        multivitaminReason: '全面营养平衡的必需营养素',
        omega3Reason: '心血管和大脑健康必需',
        vitaminDReason: '现代人容易缺乏的必需营养素',
        
        // 推荐理由（特定）
        energyReason: '有效促进能量生成和疲劳恢复',
        cellEnergyReason: '支持细胞能量生成',
        immunityBasicReason: '增强免疫力的基础',
        gutHealthReason: '通过肠道健康增强免疫力',
        digestionCoreReason: '改善肠道健康的核心',
        jointHealthReason: '关节健康和软骨保护',
        boneHealthReason: '维持骨骼健康',
        eyeHealthReason: '眼睛健康和视力保护',
        skinElasticityReason: '皮肤弹性和皱纹改善',
        collagenSynthesisReason: '胶原蛋白合成和皮肤健康',
        stressReliefReason: '缓解压力和改善睡眠',
        naturalStressReliefReason: '天然压力缓解剂',
        sleepQualityReason: '改善睡眠质量',
        womenIronReason: '女性所需的铁补充',
        ageBoneReason: '随着年龄增长骨骼健康变得更加重要',
        heartEnergyReason: '心脏健康和能量生成',
        heartRateStabilizationReason: '心率稳定和压力缓解',
        ironEnergyReason: '增强能量和改善疲劳',
        
        // 健康建议
        sleepTip: '每天睡7-8小时是健康的基础。建立规律的就寝时间。',
        exerciseTip: '从每周3次以上、每次30分钟的轻度步行或伸展开始。',
        mealTip: '规律饮食是健康的基础。尽量不要跳过一日三餐。',
        stressTip: '通过冥想、瑜伽或爱好来管理压力。考虑专业咨询。',
        highHeartRateTip: '您的心率有些高。压力管理和规律运动会有所帮助。',
        lowHeartRateTip: '您的心率偏低。如果您不是运动员，建议咨询医生。'
    },
    ja: {
        // 要約タイトル
        energyTitle: 'エネルギーと疲労',
        immunityTitle: '免疫力',
        digestionTitle: '消化器の健康',
        jointsTitle: '関節と骨',
        eyesTitle: '目の健康',
        skinTitle: '肌の健康',
        stressTitle: 'ストレス',
        
        // 要約説明
        energyDesc: 'ビタミンBと十分な睡眠が疲労回復に重要です。',
        immunityDesc: '規則正しい生活とサプリメントが免疫力強化に役立ちます。',
        digestionDesc: '乳酸菌と食物繊維で腸の健康を改善しましょう。',
        jointsDesc: '関節の健康には適切な運動と栄養補給が必要です。',
        eyesDesc: '画面使用時間を減らし、ルテインを継続的に摂取しましょう。',
        skinDesc: '十分な水分摂取とコラーゲン補給で肌の健康を管理しましょう。',
        stressDesc: '瞑想、ヨガ、十分な休息でストレスを管理しましょう。',
        
        // 推奨理由（基本）
        multivitaminReason: '全体的な栄養バランスのための必須栄養素',
        omega3Reason: '心血管と脳の健康に必須',
        vitaminDReason: '現代人に不足しがちな必須栄養素',
        
        // 推奨理由（特定）
        energyReason: 'エネルギー生成と疲労回復に効果的',
        cellEnergyReason: '細胞エネルギー生成をサポート',
        immunityBasicReason: '免疫力強化の基本',
        gutHealthReason: '腸の健康を通じた免疫力向上',
        digestionCoreReason: '腸の健康改善の核心',
        jointHealthReason: '関節の健康と軟骨保護',
        boneHealthReason: '骨の健康維持',
        eyeHealthReason: '目の健康と視力保護',
        skinElasticityReason: '肌の弾力としわ改善',
        collagenSynthesisReason: 'コラーゲン合成と肌の健康',
        stressReliefReason: 'ストレス緩和と睡眠改善',
        naturalStressReliefReason: '天然ストレス緩和剤',
        sleepQualityReason: '睡眠の質改善',
        womenIronReason: '女性に必要な鉄分補給',
        ageBoneReason: '年齢とともに重要になる骨の健康',
        heartEnergyReason: '心臓の健康とエネルギー生成',
        heartRateStabilizationReason: '心拍数安定化とストレス緩和',
        ironEnergyReason: 'エネルギー増進と疲労改善',
        
        // 健康アドバイス
        sleepTip: '1日7-8時間の十分な睡眠が健康の基本です。規則正しい就寝時間を作りましょう。',
        exerciseTip: '週3回以上、30分ずつ軽いウォーキングやストレッチから始めましょう。',
        mealTip: '規則正しい食事が健康の基本です。1日3食を抜かないよう努めましょう。',
        stressTip: '瞑想、ヨガ、趣味活動などでストレスを管理しましょう。専門家への相談も検討しましょう。',
        highHeartRateTip: '心拍数がやや高いです。ストレス管理と規則的な運動が役立ちます。',
        lowHeartRateTip: '心拍数が低いです。アスリートでない場合は、医師に相談することをお勧めします。'
    }
};

// 분석 텍스트 가져오기
function getAnalysisText(key) {
    const lang = currentLanguage || 'ko';
    return analysisTexts[lang][key] || analysisTexts['ko'][key] || key;
}

// 설문 질문 가져오기
function getSurveyQuestions() {
    const lang = currentLanguage || 'ko';
    return surveyTranslations[lang] ? surveyTranslations[lang].questions : surveyTranslations['ko'].questions;
}

// 영양제 정보 가져오기
function getSupplementInfo(key) {
    const lang = currentLanguage || 'ko';
    return supplementInfo[lang][key] || supplementInfo['ko'][key];
}

// 번역 적용 함수 (data-i18n 속성 처리)
function applyTranslations() {
    const lang = currentLanguage || 'ko';
    const langData = translations[lang] || translations['ko'];
    
    // data-i18n 속성이 있는 모든 요소에 번역 적용
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (langData && langData[key]) {
            let translationText = langData[key];
            
            // <br> 태그를 공백으로 변환 (한 줄로 표시)
            translationText = translationText.replace(/<br\s*\/?>/gi, ' ');
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translationText;
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translationText;
            } else {
                element.textContent = translationText;
            }
        }
    });
}

// UI 언어 업데이트
function updateUILanguage() {
    applyTranslations();
}

// 페이지 로드 시 자동 번역 적용
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyTranslations, 100);
    });
} else {
    setTimeout(applyTranslations, 100);
}

