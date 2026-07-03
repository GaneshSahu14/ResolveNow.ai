/**
 * CloudMailin "Multipart Normalized" payload shape.
 *
 * Reference: https://docs.cloudmailin.com/http_post_formats/multipart_normalized/
 *
 * This file is a developer reference — it is NOT imported at runtime.
 * The actual normalization logic lives in normalize.ts.
 */

export interface CloudMailinEnvelope {
  to: string;
  from: string;
  helo_domain?: string;
  remote_ip?: string;
  recipients: string[];
}

export interface CloudMailinHeaders {
  from: string;
  to: string;
  subject: string;
  date?: string;
  message_id?: string;
  [key: string]: string | undefined;
}

export interface CloudMailinAttachment {
  content: string;
  file_name: string;
  content_type: string;
  size: string;
  disposition: string;
}

export interface CloudMailinPayload {
  envelope: CloudMailinEnvelope;
  headers: CloudMailinHeaders;
  plain: string;
  html?: string;
  reply_plain?: string;
  attachments?: CloudMailinAttachment[];
}
