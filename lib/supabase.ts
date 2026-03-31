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

export function getSupabaseInstance() {
	const { supabaseUrl, supabaseKey } = getSupabaseConfig();
	return createClient(supabaseUrl, supabaseKey);
}

export function getSupabaseServerInstance() {
	const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const publishableKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

	return createClient(supabaseUrl, serviceRoleKey || publishableKey);
}
