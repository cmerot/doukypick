import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ContactSubmissionData {
	email: string;
	is_adult: string;
	first_name: string;
	pseudonym: string | null;
	phone: string;
	project_type: string;
	project_description: string;
	size: string | null;
	placement: string | null;
	budget: string | null;
	timeline: string | null;
	additional_comments: string | null;
	send_copy: boolean;
	photo_urls: string[];
	created_at: string;
}

export interface ContactSubmission extends ContactSubmissionData {
	id: number;
}

export async function saveContactSubmission(
	data: ContactSubmissionData
): Promise<{ data: ContactSubmission | null; error: Error | null }> {
	console.log('💾 Saving to Supabase...');
	console.log('📝 Submission data:', data);

	const { data: result, error } = await supabase
		.from('contact_submissions')
		.insert(data)
		.select()
		.single();

	if (error) {
		console.error('❌ Supabase error:', error);
		return { data: null, error: new Error('Database save failed') };
	}

	console.log('✅ Contact form submission saved:', result);
	return { data: result, error: null };
}
