const pages = {
  shipping: {
    title: 'Shipping & returns',
    body: [
      'Orders ship within two business days. Delivery inside the US typically takes 3–5 days.',
      'Shipping is free on orders of $200 or more. Below that, a flat $18 covers delivery.',
      'Unworn pairs can be returned within 30 days. Start a return from My Orders and we will send a label.',
    ],
  },
  privacy: {
    title: 'Privacy policy',
    body: [
      'We store the details needed to fulfill an order: your name, email, delivery address, and the pairs you bought.',
      'Passwords are hashed. We do not sell customer lists.',
      'You can review or update your profile from your account at any time.',
    ],
  },
  terms: {
    title: 'Terms',
    body: [
      'By placing an order you confirm the size, color, and delivery details are correct.',
      'Prices are shown in USD and may change as new drops arrive. An order is confirmed once you see an order number.',
      'VELORA reserves the right to cancel an order if an item is no longer in stock, and you will not be charged for cash on delivery.',
    ],
  },
};

export default function StaticPage({ page }) {
  const content = pages[page];
  return (
    <div className="container prose-page">
      <p className="eyebrow">VELORA</p>
      <h1>{content.title}</h1>
      {content.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
