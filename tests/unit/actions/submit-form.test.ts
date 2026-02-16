import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all external dependencies
vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn(() => ({
            sendMail: vi.fn().mockResolvedValue({ messageId: 'test-123' }),
        })),
    },
}));

vi.mock('@/lib/core/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock('@/lib/core/safe-action', () => ({
    actionClient: {
        schema: (schema: any) => ({
            action: (fn: any) => {
                // Store the fn so tests can call it
                const action = async (input: any) => {
                    const parsed = schema.parse(input);
                    return fn({ parsedInput: parsed });
                };
                action._handler = fn;
                return action;
            },
        }),
    },
    withSecurity: (schema: any) => schema,
}));

vi.mock('@/lib/utils', () => ({
    withRetry: (fn: () => Promise<any>) => fn(),
}));

const mockCreate = vi.fn().mockResolvedValue({ _id: 'lead-123' });

vi.mock('@/sanity/lib/client', () => ({
    writeClient: {
        create: (...args: any[]) => mockCreate(...args),
        config: () => ({ token: 'test-token' }),
    },
}));

const originalEnv = { ...process.env };

describe('submit-form action', () => {
    beforeEach(() => {
        vi.resetModules();
        mockCreate.mockClear();
        process.env = {
            ...originalEnv,
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: '587',
            SMTP_SECURE: 'false',
            SMTP_USER: 'test@test.com',
            SMTP_PASS: 'password',
            SMTP_FROM: 'noreply@test.com',
            LEAD_NOTIFICATION_EMAIL: 'admin@test.com',
        };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    describe('getTransporter', () => {
        it('returns null when SMTP vars are missing', async () => {
            delete process.env.SMTP_HOST;
            delete process.env.SMTP_USER;
            delete process.env.SMTP_PASS;
            const { logger } = await import('@/lib/core/logger');

            const { submitForm } = await import('@/actions/forms/submit-form');
            const result = await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: { email: 'user@test.com', name: 'Test' },
                },
            });

            expect(result.success).toBe(true);
            // Should warn about skipping email
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Lead notification skipped')
            );
        });
    });

    describe('form submission', () => {
        it('creates a lead in Sanity with correct fields', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            const result = await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: {
                        email: 'user@example.com',
                        name: 'John Doe',
                        message: 'Hello!',
                        company: 'Acme Corp',
                    },
                },
            });

            expect(result.success).toBe(true);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    _type: 'lead',
                    email: 'user@example.com',
                    name: 'John Doe',
                    message: 'Hello!',
                    company: 'Acme Corp',
                    source: { type: 'contact' },
                })
            );
        });

        it('blocks bot submissions via honeypot', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            const result = await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: {
                        email: 'bot@spam.com',
                        name: 'Bot',
                        _honeypot: 'got you',
                    },
                },
            });

            expect(result.success).toBe(true);
            // Should NOT create a lead in Sanity
            expect(mockCreate).not.toHaveBeenCalled();
        });

        it('rejects invalid email addresses', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            const result = await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: {
                        email: 'not-an-email',
                        name: 'Test',
                    },
                },
            });

            expect(result.error).toBeDefined();
            expect(result.error).toContain('email');
        });

        it('uses "Anonymous" when name is not provided', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: { email: 'user@test.com' },
                },
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Anonymous',
                })
            );
        });

        it('maps intent to correct source type', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'newsletter',
                    data: { email: 'user@test.com', name: 'Test' },
                },
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: { type: 'newsletter' },
                })
            );
        });

        it('falls back to "contact" for unknown intents', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'unknown-intent',
                    data: { email: 'user@test.com', name: 'Test' },
                },
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: { type: 'contact' },
                })
            );
        });

        it('includes metadata in lead document', async () => {
            const { submitForm } = await import('@/actions/forms/submit-form');

            await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: { email: 'user@test.com', name: 'Test' },
                    metadata: { source: 'landing-page' },
                },
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: expect.objectContaining({
                        source: 'landing-page',
                    }),
                })
            );
        });

        it('handles Sanity write errors gracefully', async () => {
            mockCreate.mockRejectedValueOnce(new Error('Sanity unavailable'));
            const { submitForm } = await import('@/actions/forms/submit-form');

            const result = await (submitForm as any)._handler({
                parsedInput: {
                    intent: 'contact',
                    data: { email: 'user@test.com', name: 'Test' },
                },
            });

            expect(result.error).toBeDefined();
        });
    });
});
