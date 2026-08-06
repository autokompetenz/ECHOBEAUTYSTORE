require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ─── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL — more reliable than STARTTLS for deliverability
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,         // reuse connections
  maxConnections: 5,
  rateLimit: 5,       // max 5 messages/second
  tls: {
    rejectUnauthorized: true,
  },
});

const DOMAIN = (process.env.SMTP_USER || '').split('@')[1] || 'gmail.com';
const FROM   = `"${process.env.FROM_NAME || 'Echo Beauty Store'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

function getPublicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return 'https://echobeautystore.vercel.app';
}

// ─── Base send helper — adds anti-spam headers ───────────────────────────────
async function sendMail({ to, subject, html, text }) {
  const messageId = `<${crypto.randomUUID()}@${DOMAIN}>`;

  return transporter.sendMail({
    from:    FROM,
    to,
    replyTo: process.env.SMTP_USER,
    subject,
    html,
    text,     // plain-text fallback — required by RFC 2822, helps deliverability
    headers: {
      'Message-ID':        messageId,
      'X-Mailer':          'Echo Beauty Store Mailer v2',
      'X-Entity-Ref-ID':   crypto.randomUUID(),  // unique per message — avoids threading bugs
      'Precedence':        'bulk',
      'List-Unsubscribe':  `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatFCFA(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(amount)) + ' FCFA';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Base HTML wrapper ───────────────────────────────────────────────────────
function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Echo Beauty Store</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#111113;border-radius:12px 12px 0 0;padding:32px 40px;border-bottom:2px solid #C8102E;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">ECHO BEAUTY</div>
                  <div style="font-size:9px;letter-spacing:0.4em;color:#C8102E;text-transform:uppercase;margin-top:3px;">STORE · Cotonou</div>
                </td>
                <td align="right">
                  <div style="width:48px;height:48px;background:#C8102E;border-radius:8px;display:inline-block;line-height:48px;text-align:center;font-size:20px;font-weight:900;color:#fff;letter-spacing:0.04em;">EB</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="background:#18181A;padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#111113;border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:rgba(255,255,255,0.3);line-height:1.8;">
                  <strong style="color:rgba(255,255,255,0.5);">Echo Beauty Store</strong><br/>
                  Cotonou, Bénin<br/>
                  📧 contact@echobeautystore.bj
                </td>
                <td align="right" style="font-size:11px;color:rgba(255,255,255,0.15);">
                  © ${new Date().getFullYear()} Echo Beauty Store
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email 1 : Bienvenue après inscription ───────────────────────────────────
async function sendWelcomeEmail({ email, firstName, lastName }) {
  const content = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="width:72px;height:72px;background:rgba(200,16,46,0.1);border:2px solid rgba(200,16,46,0.3);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px;">👋</div>
      <h1 style="margin:0 0 10px;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Bienvenue, ${firstName} !</h1>
      <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.45);line-height:1.6;">Votre compte Echo Beauty Store est prêt.</p>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:32px;"></div>

    <!-- Message -->
    <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.8;margin:0 0 24px;">
      Bonjour <strong style="color:#fff;">${firstName} ${lastName}</strong>,<br/><br/>
      Nous sommes ravis de vous accueillir chez <strong style="color:#C8102E;">Echo Beauty Store</strong>.
      Votre compte est désormais actif et vous pouvez dès à présent explorer notre catalogue de cosmétiques.
    </p>

    <!-- Features -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
          ['🔍', 'Catalogue complet', 'Explorez notre sélection de produits cosmétiques'],
          ['💳', 'Paiement sécurisé', 'Mobile Money (MTN, Moov) ou paiement à la livraison'],
          ['📍', 'Livraison rapide', 'Suivez vos commandes en temps réel'],
        ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:10px 0;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:44px;background:rgba(200,16,46,0.08);border:1px solid rgba(200,16,46,0.2);border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;">${icon}</td>
              <td style="padding-left:14px;">
                <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:2px;">${title}</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.4);">${desc}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')}
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${getPublicSiteUrl()}/catalog"
         style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:6px;">
        🛍️ Découvrir nos produits
      </a>
    </div>

    <p style="font-size:13px;color:rgba(255,255,255,0.25);text-align:center;margin:0;">
      Pour toute question, contactez-nous sur WhatsApp ou par email.
    </p>
  `;

  await sendMail({
    to:      email,
    subject: `Bienvenue chez Echo Beauty Store, ${firstName} !`,
    html:    baseTemplate(content),
    text:    `Bienvenue, ${firstName} ${lastName} !\n\nVotre compte Echo Beauty Store est actif.\n\nDécouvrez notre catalogue : ${getPublicSiteUrl()}/catalog\n\n-- Echo Beauty Store\nCotonou, Bénin\ncontact@echobeautystore.bj`,
  });
}

// ─── Email 2 : Confirmation de commande ─────────────────────────────────────
async function sendOrderConfirmationEmail({ email, firstName, order, items }) {
  const PAYMENT_LABELS = {
    full:    'Paiement intégral (-5%)',
    deposit: 'Acompte 25%',
    monthly: 'Mensualités 60 mois',
  };

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:70px;">
              <img src="${item.product.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=70'}"
                   alt="${item.product.name}"
                   width="70" height="50"
                   style="object-fit:cover;border-radius:6px;display:block;"/>
            </td>
            <td style="padding-left:14px;">
              <div style="font-size:15px;font-weight:700;color:#fff;">${item.product.name}</div>
              ${item.product.subcategory ? `<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:3px;">${item.product.subcategory}</div>` : ''}
            </td>
            <td align="right" style="font-size:17px;font-weight:900;color:#C8102E;white-space:nowrap;">
              ${formatFCFA(item.unitPrice)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Financial summary rows
  const finRows = [];
  if (order.discountAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#22C55E;padding:5px 0;">Remise appliquée (-5%)</td><td align="right" style="font-size:14px;color:#22C55E;font-weight:700;">- ${formatFCFA(order.discountAmount)}</td></tr>`);
  }
  if (order.depositAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:rgba(255,255,255,0.5);padding:5px 0;">Acompte à régler (25%)</td><td align="right" style="font-size:14px;color:#C8102E;font-weight:700;">${formatFCFA(order.depositAmount)}</td></tr>`);
  }
  if (order.monthlyAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:rgba(255,255,255,0.5);padding:5px 0;">Mensualité × ${order.monthlyDuration}</td><td align="right" style="font-size:14px;color:#C8102E;font-weight:700;">${formatFCFA(order.monthlyAmount)}/mois</td></tr>`);
  }

  const content = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:72px;height:72px;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);border-radius:50%;display:inline-block;line-height:72px;font-size:32px;margin-bottom:18px;">✓</div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Commande confirmée !</h1>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);">Merci pour votre confiance, ${firstName}.</p>
    </div>

    <!-- Order number badge -->
    <div style="background:rgba(200,16,46,0.06);border:1px solid rgba(200,16,46,0.2);border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Numéro de bon de commande</div>
      <div style="font-size:32px;font-weight:900;color:#C8102E;letter-spacing:0.08em;font-family:monospace;">${order.orderNumber}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.3);margin-top:6px;">Passée le ${formatDate(order.createdAt)}</div>
    </div>

    <!-- Items -->
    <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:14px;">Produits commandés</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${itemsRows}
    </table>

    <!-- Financial summary -->
    <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:14px;">Récapitulatif financier</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:rgba(255,255,255,0.5);padding:5px 0;">Mode de paiement</td>
          <td align="right" style="font-size:14px;color:#fff;font-weight:600;">${PAYMENT_LABELS[order.paymentType] || order.paymentType}</td>
        </tr>
        ${finRows.join('')}
        <tr><td colspan="2"><div style="height:1px;background:rgba(255,255,255,0.07);margin:10px 0;"></div></td></tr>
        <tr>
          <td style="font-size:16px;font-weight:700;color:#fff;">Total</td>
          <td align="right" style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.02em;">${formatFCFA(order.totalPrice)}</td>
        </tr>
      </table>
    </div>

    <!-- Delivery address -->
    ${order.shippingAddress ? `
    <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Adresse de livraison</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.6;">${order.shippingAddress.replace(/\n/g, '<br/>')}</div>
    </div>` : ''}

    <!-- CTAs -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding-right:8px;">
          <a href="${getPublicSiteUrl()}/track/${order.orderNumber}"
             style="display:block;background:#C8102E;color:#fff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 20px;border-radius:6px;text-align:center;">
            📍 Suivre ma commande
          </a>
        </td>
        <td style="padding-left:8px;">
          <a href="${getPublicSiteUrl()}/orders"
             style="display:block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 20px;border-radius:6px;text-align:center;">
            📦 Mes commandes
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:rgba(255,255,255,0.25);text-align:center;margin:0;line-height:1.7;">
      Notre équipe prend en charge votre commande.<br/>
      Vous recevrez une mise à jour dès que le statut évolue.
    </p>
  `;

  const itemsText = items.map(i => `- ${i.product.name} : ${formatFCFA(i.unitPrice)}`).join('\n');
  const finText   = [
    order.discountAmount  ? `Remise : -${formatFCFA(order.discountAmount)}`                         : null,
    order.depositAmount   ? `Acompte 25% : ${formatFCFA(order.depositAmount)}`                      : null,
    order.monthlyAmount   ? `Mensualité : ${formatFCFA(order.monthlyAmount)}/mois × ${order.monthlyDuration}` : null,
  ].filter(Boolean).join('\n');

  await sendMail({
    to:      email,
    subject: `Bon de commande ${order.orderNumber} - Echo Beauty Store`,
    html:    baseTemplate(content),
    text: [
      `Commande confirmée - Echo Beauty Store`,
      ``,
      `Bonjour ${firstName},`,
      `Votre commande ${order.orderNumber} a bien été enregistrée.`,
      ``,
      `PRODUITS :`,
      itemsText,
      ``,
      `PAIEMENT : ${({ full:'Intégral', deposit:'Acompte 25%', monthly:'Mensualités' })[order.paymentType]}`,
      finText,
      `Total : ${formatFCFA(order.totalPrice)}`,
      ``,
      `Suivi : ${getPublicSiteUrl()}/track/${order.orderNumber}`,
      ``,
      `-- Echo Beauty Store`,
      `Cotonou, Bénin`,
      `contact@echobeautystore.bj`,
    ].join('\n'),
  });
}

const STATUS_LABELS_FR = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

/** Notifie le client lorsque l’admin fait progresser le statut de la commande (ou envoie un message). */
async function sendOrderStatusUpdateEmail({
  email,
  firstName,
  orderNumber,
  status,
  comment,
  statusChanged = true,
}) {
  const base = getPublicSiteUrl();
  const label = STATUS_LABELS_FR[status] || status;
  const safeComment = comment && String(comment).trim()
    ? String(comment).trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : '';
  const commentBlock = safeComment
    ? `<div style="margin-top:20px;padding:16px 18px;background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:8px;">Message de notre équipe</div>
        <div style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.65;white-space:pre-wrap;">${safeComment}</div>
      </div>`
    : '';

  const headline = statusChanged
    ? 'Étape de commande mise à jour'
    : 'Message concernant votre commande';
  const statusLine = statusChanged
    ? `<div style="margin-top:14px;font-size:15px;color:rgba(255,255,255,0.55);">Nouveau statut : <strong style="color:#fff;">${label}</strong></div>`
    : `<div style="margin-top:14px;font-size:15px;color:rgba(255,255,255,0.55);">Statut actuel : <strong style="color:#fff;">${label}</strong></div>`;

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(200,16,46,0.1);border:2px solid rgba(200,16,46,0.35);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:16px;">📦</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${headline}</h1>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);">Bonjour <strong style="color:#fff;">${firstName}</strong>, le suivi de votre commande a été mis à jour.</p>
    </div>
    <div style="background:rgba(200,16,46,0.06);border:1px solid rgba(200,16,46,0.22);border-radius:10px;padding:20px 22px;text-align:center;margin-bottom:22px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:8px;">Bon de commande</div>
      <div style="font-size:26px;font-weight:900;color:#C8102E;letter-spacing:0.06em;font-family:monospace;">${orderNumber}</div>
      ${statusLine}
    </div>
    ${commentBlock}
    <div style="text-align:center;margin-top:28px;">
      <a href="${base}/track/${orderNumber}"
         style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:6px;">
        Voir le détail du suivi
      </a>
    </div>
      <p style="font-size:13px;color:rgba(255,255,255,0.28);text-align:center;margin:24px 0 0;line-height:1.7;">
      Une question ? Répondez à cet e-mail ou contactez-nous à contact@echobeautystore.bj.
    </p>
  `;

  const textIntro = statusChanged
    ? `Votre commande ${orderNumber} : nouveau statut « ${label} ».`
    : `Mise à jour pour la commande ${orderNumber} (statut : ${label}).`;
  const textLines = [
    `Bonjour ${firstName},`,
    ``,
    textIntro,
    safeComment ? `\nMessage :\n${safeComment}` : '',
    ``,
    `Suivi : ${base}/track/${orderNumber}`,
    ``,
    `— Echo Beauty Store`,
  ].filter(Boolean);

  const subj = statusChanged
    ? `Commande ${orderNumber} — ${label} · Echo Beauty Store`
    : `Commande ${orderNumber} — message Echo Beauty Store`;

  await sendMail({
    to: email,
    subject: subj,
    html: baseTemplate(content),
    text: textLines.join('\n'),
  });
}

async function sendAdminOrderNotification({ customerName, customerEmail, customerPhone, shippingAddress, orderNumber, order, items, paymentType }) {
  const itemsText = items.map(i =>
    `${i.product.name} x${i.quantity} — ${formatFCFA(i.unitPrice * i.quantity)}`
  ).join('\n');

  const adminEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await sendMail({
    to:      adminEmail,
    subject: `🛒 Nouvelle commande ${orderNumber} · Echo Beauty Store`,
    html:    baseTemplate(`
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#fff;">Nouvelle commande</h1>
        <div style="font-size:24px;font-weight:900;color:#C8102E;letter-spacing:0.06em;font-family:monospace;">${orderNumber}</div>
      </div>
      <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:12px;">Client</div>
        <div style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;">
          <strong style="color:#fff;">${customerName}</strong><br/>
          📧 ${customerEmail}<br/>
          📞 ${customerPhone || 'Non renseigné'}<br/>
        </div>
      </div>
      ${shippingAddress ? `
      <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:18px 24px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:8px;">Adresse de livraison</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.6;">${shippingAddress.replace(/\n/g, '<br/>')}</div>
      </div>` : ''}
      <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:12px;">Produits</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${items.map(i => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:rgba(255,255,255,0.7);">${i.product.name}</td>
            <td align="center" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;color:rgba(255,255,255,0.5);">x${i.quantity}</td>
            <td align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:14px;font-weight:700;color:#C8102E;">${formatFCFA(i.unitPrice * i.quantity)}</td>
          </tr>`).join('')}
        </table>
        <div style="margin-top:12px;text-align:right;font-size:18px;font-weight:900;color:#fff;">Total : ${formatFCFA(order.totalPrice)}</div>
      </div>
      <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 24px;margin-bottom:24px;">
        <div style="font-size:13px;color:rgba(255,255,255,0.5);">Paiement : <strong style="color:#fff;">${({ full:'Intégral', deposit:'Acompte 25%', monthly:'Mensualités' })[paymentType] || paymentType}</strong></div>
      </div>
    `),
    text: [
      `NOUVELLE COMMANDE ${orderNumber}`,
      ``,
      `CLIENT :`,
      `Nom : ${customerName}`,
      `Email : ${customerEmail}`,
      `Tél : ${customerPhone || 'Non renseigné'}`,
      ``,
      shippingAddress ? `ADRESSE :\n${shippingAddress}\n` : '',
      `PRODUITS :`,
      itemsText,
      ``,
      `Total : ${formatFCFA(order.totalPrice)}`,
      `Paiement : ${({ full:'Intégral', deposit:'Acompte 25%', monthly:'Mensualités' })[paymentType] || paymentType}`,
    ].filter(Boolean).join('\n'),
  });
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendAdminOrderNotification,
};