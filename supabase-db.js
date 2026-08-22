// Supabase 데이터베이스 연동 모듈
// PostgreSQL을 사용하여 사용자 데이터, 관리자 설정 등을 저장

// Supabase 클라이언트 초기화
let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    // Supabase 설정
    const SUPABASE_URL = 'https://pdvcunbjujflokzdubsf.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_OMIazy75tWP-_L-aHzPr3w_l3BrmV0l';
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase 설정이 완료되지 않았습니다. localStorage를 사용합니다.');
        return null;
    }
    
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase 초기화 완료');
        return supabaseClient;
    } catch (error) {
        console.error('Supabase 초기화 실패:', error);
        return null;
    }
}

// 초기화
initSupabase();

// ==================== 사용자 데이터 관리 ====================

// 모든 사용자 가져오기
async function getUsersFromSupabase() {
    const client = initSupabase();
    if (!client) {
        return getUsersFromLocalStorage();
    }
    
    try {
        const { data, error } = await client
            .from('users')
            .select('*');
        
        if (error) throw error;
        
        // Supabase 필드명을 JavaScript 필드명으로 변환 (기존 코드 호환성)
        const users = (data || []).map(user => ({
            email: user.email || user.id,
            name: user.name,
            password: user.password,
            referralCode: user.referral_code,
            referredBy: user.referred_by,
            referredByName: user.referred_by_name,
            referralCount: user.referral_count || 0,
            points: user.points || 0,
            aiCredits: user.ai_credits || 0,  // ai_credits -> aiCredits 변환
            joinDate: user.join_date,
            healthRecords: user.health_records || [],
            isAdmin: user.is_admin || false
        }));
        
        console.log('✅ Supabase에서 사용자 가져오기 완료:', users.length, '명');
        return users;
    } catch (error) {
        console.error('❌ Supabase에서 사용자 가져오기 실패:', error);
        console.error('   에러 코드:', error?.code);
        console.error('   에러 메시지:', error?.message);
        console.error('   에러 상세:', error?.details || error?.hint || '없음');
        console.error('   전체 에러 객체:', JSON.stringify(error, null, 2));
        return getUsersFromLocalStorage();
    }
}

// 사용자 저장
async function saveUserToSupabase(user) {
    const client = initSupabase();
    if (!client) {
        return saveUserToLocalStorage(user);
    }
    
    try {
        const { error } = await client
            .from('users')
            .upsert({
                email: user.email,
                name: user.name,
                password: user.password,
                referral_code: user.referralCode,
                referred_by: user.referredBy,
                referred_by_name: user.referredByName,
                referral_count: user.referralCount || 0,
                points: user.points || 0,
                ai_credits: user.aiCredits || 0,
                join_date: user.joinDate,
                health_records: user.healthRecords || [],
                is_admin: user.isAdmin || false
            }, {
                onConflict: 'email'
            });
        
        if (error) throw error;
        
        console.log('✅ Supabase에 사용자 저장 완료:', user.email);
        return true;
    } catch (error) {
        console.error('❌ Supabase에 사용자 저장 실패:', error);
        console.error('   에러 코드:', error?.code);
        console.error('   에러 메시지:', error?.message);
        console.error('   에러 상세:', error?.details || error?.hint || '없음');
        console.error('   전체 에러 객체:', JSON.stringify(error, null, 2));
        return saveUserToLocalStorage(user);
    }
}

// 모든 사용자 저장
async function saveUsersToSupabase(users) {
    const client = initSupabase();
    if (!client) {
        return saveUsersToLocalStorage(users);
    }
    
    try {
        // 배치로 저장
        const userData = users.map(user => ({
            email: user.email,
            name: user.name,
            password: user.password,
            referral_code: user.referralCode,
            referred_by: user.referredBy,
            referred_by_name: user.referredByName,
            referral_count: user.referralCount || 0,
            points: user.points || 0,
            ai_credits: user.aiCredits || 0,
            join_date: user.joinDate,
            health_records: user.healthRecords || [],
            is_admin: user.isAdmin || false
        }));
        
        const { error } = await client
            .from('users')
            .upsert(userData, {
                onConflict: 'email'
            });
        
        if (error) throw error;
        
        console.log('✅ Supabase에 모든 사용자 저장 완료');
        return true;
    } catch (error) {
        console.error('❌ Supabase에 사용자 저장 실패 (배치):', error);
        console.error('   에러 코드:', error?.code);
        console.error('   에러 메시지:', error?.message);
        console.error('   에러 상세:', error?.details || error?.hint || '없음');
        console.error('   전체 에러 객체:', JSON.stringify(error, null, 2));
        return saveUsersToLocalStorage(users);
    }
}

// ==================== 관리자 설정 관리 ====================

// AI 설정 가져오기
async function getAdminAISettingsFromSupabase() {
    const client = initSupabase();
    if (!client) {
        return getAdminAISettingsFromLocalStorage();
    }
    
    try {
        const { data, error } = await client
            .from('admin_settings')
            .select('*')
            .eq('setting_type', 'ai')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116은 데이터 없음
        
        if (data) {
            return { 
                apiKey: data.api_key || '',
                aiHubApiKey: data.ai_hub_api_key || ''
            };
        }
        
        return { apiKey: '', aiHubApiKey: '' };
    } catch (error) {
        console.error('Supabase에서 AI 설정 가져오기 실패:', error);
        return getAdminAISettingsFromLocalStorage();
    }
}

// AI 설정 저장
async function saveAdminAISettingsToSupabase(settings) {
    const client = initSupabase();
    if (!client) {
        return saveAdminAISettingsToLocalStorage(settings);
    }
    
    try {
        const { error } = await client
            .from('admin_settings')
            .upsert({
                setting_type: 'ai',
                api_key: settings.apiKey,
                ai_hub_api_key: settings.aiHubApiKey || ''
            }, {
                onConflict: 'setting_type'
            });
        
        if (error) throw error;
        
        console.log('✅ Supabase에 AI 설정 저장 완료');
        return true;
    } catch (error) {
        console.error('Supabase에 AI 설정 저장 실패:', error);
        return saveAdminAISettingsToLocalStorage(settings);
    }
}

// 쇼핑몰 설정 가져오기
async function getShoppingSettingsFromSupabase() {
    const client = initSupabase();
    if (!client) {
        return getShoppingSettingsFromLocalStorage();
    }
    
    try {
        const { data, error } = await client
            .from('admin_settings')
            .select('*')
            .eq('setting_type', 'shopping')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            return {
                url: data.shopping_url || '',
                enabled: data.shopping_enabled || false
            };
        }
        
        return { url: '', enabled: false };
    } catch (error) {
        console.error('Supabase에서 쇼핑몰 설정 가져오기 실패:', error);
        return getShoppingSettingsFromLocalStorage();
    }
}

// 쇼핑몰 설정 저장
async function saveShoppingSettingsToSupabase(settings) {
    const client = initSupabase();
    if (!client) {
        return saveShoppingSettingsToLocalStorage(settings);
    }
    
    try {
        const { error } = await client
            .from('admin_settings')
            .upsert({
                setting_type: 'shopping',
                shopping_url: settings.url,
                shopping_enabled: settings.enabled
            }, {
                onConflict: 'setting_type'
            });
        
        if (error) throw error;
        
        console.log('✅ Supabase에 쇼핑몰 설정 저장 완료');
        return true;
    } catch (error) {
        console.error('Supabase에 쇼핑몰 설정 저장 실패:', error);
        return saveShoppingSettingsToLocalStorage(settings);
    }
}

// ==================== localStorage 폴백 함수 ====================

function getUsersFromLocalStorage() {
    const users = localStorage.getItem('healthUsers');
    return users ? JSON.parse(users) : [];
}

function saveUsersToLocalStorage(users) {
    localStorage.setItem('healthUsers', JSON.stringify(users));
    return true;
}

function saveUserToLocalStorage(user) {
    const users = getUsersFromLocalStorage();
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    saveUsersToLocalStorage(users);
    return true;
}

function getAdminAISettingsFromLocalStorage() {
    const settings = localStorage.getItem('adminAISettings');
    return settings ? JSON.parse(settings) : { apiKey: '' };
}

function saveAdminAISettingsToLocalStorage(settings) {
    localStorage.setItem('adminAISettings', JSON.stringify(settings));
    return true;
}

function getShoppingSettingsFromLocalStorage() {
    const settings = localStorage.getItem('shoppingSettings');
    return settings ? JSON.parse(settings) : { url: '', enabled: false };
}

function saveShoppingSettingsToLocalStorage(settings) {
    localStorage.setItem('shoppingSettings', JSON.stringify(settings));
    return true;
}

