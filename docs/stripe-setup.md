# Turning billing on

Sparkquill runs fine without Stripe keys: the paid features stay open and the
dashboard says so plainly. Nothing below is needed until you actually want to
charge.

## 1. Create the product and two prices

In the Stripe dashboard, **test mode** first.

- Product name: `Sparkquill Student Seat`
- Price 1 — recurring, **$10.00 USD monthly**, "per unit" (not tiered)
- Price 2 — recurring, **$100.00 USD yearly**, "per unit"

Copy both price ids; they look like `price_1Abc...`.

Per-unit is the important part. The whole seat model depends on one
subscription per family whose `quantity` is the number of children, so a family
with three children gets one invoice and one renewal date instead of three.

## 2. Create the webhook endpoint

Endpoint URL:

```
https://sparkquill.prosperollc.com/api/stripe/webhook
```

Send these events, and only these — the handler ignores anything else:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Copy the signing secret (`whsec_...`).

## 3. Enable the customer portal

Settings → Billing → Customer portal. Turn on cancellation, payment method
updates and invoice history. The app deliberately does not rebuild those
screens: doing so would mean handling card details on surfaces we control, for
no benefit.

## 4. Put the keys on the server

```bash
ssh ubuntu@138.2.217.209
sudo nano /etc/sparkquill/app.env
```

Add:

```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
```

Then `sudo systemctl restart sparkquill`.

The file is `640 root:sparkquill`, so the app can read it and other users on
the box cannot.

## 5. Test before going live

With test keys, card `4242 4242 4242 4242`, any future expiry, any CVC.

Worth exercising specifically:

| What | How | Expected |
| --- | --- | --- |
| Trial | Complete checkout | Status `trialing`, practice works, no charge |
| Seat fills | Add a second child after subscribing | Child gets a seat if quantity allows |
| Adding a seat | Raise the count on the dashboard | Prorated charge, child starts immediately |
| Removing a seat | Lower the count | No refund, seat stays usable until period end |
| Failed payment | Card `4000 0000 0000 0341` | Status `past_due`, practice pauses, **reports stay visible** |
| Redelivery | Resend an event from the dashboard | Second delivery answers `duplicate: true`, nothing changes twice |

That last row is the one worth doing by hand. Stripe retries deliveries, and an
integration that acts on the same event twice is how families get
double-charged. Every event is recorded before it is acted on, and a duplicate
loses the race and exits.

## Going live

Swap the test keys for live ones and create the webhook again in live mode —
signing secrets do not carry across. Keep the price ids straight; live prices
have different ids from test prices.

## Design decisions worth knowing

**A failed payment pauses practice but never hides reports.** The parent is the
person who has to fix the card, and hiding the reason they subscribed makes
that less likely. A child's history is never touched.

**Removing a seat does not refund and does not revoke access.** The period was
paid for. Charging for something and then withholding it is the alternative.

**Stripe is the source of truth; the database is a cache.** Seat changes are
written by the webhook, not by the action that requested them, so the two paths
cannot disagree about what actually happened.
