// src/mail/templates.ts
export const websiteErrorTemplate = (websiteName: string) => `
  <p>Dear User,</p>
  <p>We have detected that your website <strong>${websiteName}</strong> is currently offline.</p>
  <p>Please take the necessary actions to bring your website back online.</p>
  <p>Thank you,</p>
  <p>Your Monitoring Team</p>
`;

export const routeErrorTemplate = (websiteName: string, routePath: string) => `
  <p>Dear User,</p>
  <p>We have detected an error in the route <strong>${routePath}</strong> on your website <strong>${websiteName}</strong>.</p>
  <p>Please check the route and take the necessary actions to fix the issue.</p>
  <p>Thank you,</p>
  <p>Your Monitoring Team</p>
`;

export const recoverPasswordTemplate = (name: string, url: string) => `
  <p>Hello, ${name}!</p>
  <p>You requested a password reset. Click the link below to reset your password:</p>
  <a href="${url}">Reset Password</a>
  <p>If you did not request this reset, please ignore this email.</p>
  <p>Thank you!</p>
`;
