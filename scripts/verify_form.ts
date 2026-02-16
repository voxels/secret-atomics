
import { submitForm } from '@/actions/forms/submit-form';
import { writeClient } from '@/sanity/lib/client';

async function verify() {
    console.log('Testing submitForm action...');
    const testEmail = `test-${Date.now()}@example.com`;

    const result = await submitForm({
        intent: 'contact',
        data: {
            email: testEmail,
            name: 'Test Verification User',
            message: 'This is a test message from verification script.',
            company: 'Antigravity Inc.',
            _honeypot: ''
        },
        metadata: { source: 'script' }
    });

    if (!result?.data?.success) {
        console.error('Action failed:', result?.data?.error || result?.serverError);
        process.exit(1);
    }

    console.log('Action successful. Verifying Sanity document...');

    // Wait a moment for consistency
    await new Promise(r => setTimeout(r, 2000));

    const lead = await writeClient.fetch(
        `*[_type == "lead" && email == $email][0]`,
        { email: testEmail }
    );

    if (!lead) {
        console.error('Lead not found in Sanity!');
        process.exit(1);
    }

    if (lead.message === 'This is a test message from verification script.') {
        console.log('SUCCESS: Lead created with correct message:', lead.message);
    } else {
        console.error('Mismatch in message content:', lead);
        process.exit(1);
    }
}

verify().catch(console.error);
