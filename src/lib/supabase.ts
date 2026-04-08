import { createClient } from '@supabase/supabase-js';

function getRequiredEnv(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is not set.`);
	}

	return value;
}

export function getSupabaseConfig() {
	return {
		supabaseUrl: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
		supabaseKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
	};
}
// 퍼블리싱 키 : 로그인 전 사용자 조회 등
export function getSupabaseInstance() {
	const { supabaseUrl, supabaseKey } = getSupabaseConfig();
	return createClient(supabaseUrl, supabaseKey);
}

export function getSupabaseServerInstance() {
	const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
	const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

	return createClient(supabaseUrl, serviceRoleKey);
}
