export interface NormalizedInboundEmail {
  from: string;
  subject: string;
  text: string;
  html?: string;
}
