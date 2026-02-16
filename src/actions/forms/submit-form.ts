'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';
import { logger } from '@/lib/core/logger';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { withRetry } from '@/lib/utils';
import { writeClient } from '@/sanity/lib/client';

// Create SMTP transporter lazily (only when env vars are set)
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

const submissionSchema = withSecurity(
  z.object({
    intent: z.string(),
    data: z.record(z.string(), z.unknown()),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
);

// Helper to safely get string value from data
function getString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function getStringOrUndefined(value: unknown): string | undefined {
  if (!value) return undefined;
  return String(value);
}

// Send email notification for new lead (fire-and-forget)
async function notifyNewLead({
  name,
  email,
  company,
  jobTitle,
  phone,
  message,
  intent,
}: {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  message?: string;
  intent: string;
}) {
  const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter || !notifyEmail || !fromEmail) {
    logger.warn('Lead notification skipped: SMTP or LEAD_NOTIFICATION_EMAIL not configured');
    return;
  }

  const details = [
    `Name: ${name}`,
    `Email: ${email}`,
    company && `Company: ${company}`,
    jobTitle && `Job Title: ${jobTitle}`,
    phone && `Phone: ${phone}`,
    `Intent: ${intent}`,
    message && `\nMessage:\n${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: notifyEmail,
      subject: `New Lead: ${name}${company ? ` — ${company}` : ''}`,
      text: `New lead submitted on ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n\n${details}`,
    });
  } catch (err) {
    // Don't let notification failure break the form
    logger.error({ err }, 'Failed to send lead notification email');
  }
}

export const submitForm = actionClient
  .schema(submissionSchema)
  .action(async ({ parsedInput: { intent, data, metadata = {} } }) => {
    // Honeypot check
    if (data._honeypot) {
      logger.warn('Bot submission blocked via honeypot');
      return { success: true };
    }

    // Check configuration
    if (!writeClient.config().token) {
      logger.error('Sanity write token missing');
      return { error: 'Form submission is currently disabled. Please contact the administrator.' };
    }

    try {
      const email = getString(data.email);
      if (!email || !email.includes('@')) {
        return { error: 'Please enter a valid email address.' };
      }

      const name = getString(data.name || data.fullname);
      const message = getString(data.message || data.content);
      const company = getStringOrUndefined(data.company);
      const jobTitle = getStringOrUndefined(data.jobTitle || data.jobtitle);
      const phone = getStringOrUndefined(data.phone || data.tel);

      // Map form intent to lead source type
      const sourceTypeMap: Record<string, string> = {
        contact: 'contact',
        newsletter: 'newsletter',
        event: 'event',
        download: 'download',
      };

      // Create lead in Sanity
      await withRetry(
        () =>
          writeClient.create({
            _type: 'lead',
            email,
            name: name || 'Anonymous',
            message: message || undefined,
            company,
            jobTitle,
            phone,
            source: {
              type: sourceTypeMap[intent] || 'contact',
            },
            consent: Boolean(data.consent),
            language: getStringOrUndefined(data.language) || 'en',
            createdAt: new Date().toISOString(),
            metadata: {
              originalIntent: intent,
              source: metadata?.source ? String(metadata.source) : 'web',
            },
          }),
        { retries: 3, delay: 1000 }
      );

      // Send notification email (fire-and-forget — don't await to avoid slowing response)
      notifyNewLead({ name: name || 'Anonymous', email, company, jobTitle, phone, message, intent });

      return { success: true };
    } catch (error) {
      logger.error({ err: error, intent }, 'Form submission error');
      return { error: "We couldn't process your submission. Please try again in a few moments." };
    }
  });
