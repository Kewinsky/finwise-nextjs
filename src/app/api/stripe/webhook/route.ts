import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe/webhooks';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    log.info('Stripe webhook received');

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      log.warn('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = await verifyWebhookSignature(body, signature);
    log.info({ eventType: event.type, eventId: event.id }, 'Processing webhook event');

    await handleWebhookEvent(event);

    const duration = Date.now() - start;
    log.info(
      { eventType: event.type, eventId: event.id, duration: `${duration}ms` },
      'Webhook event processed successfully',
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error(error, 'Stripe webhook error');

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
