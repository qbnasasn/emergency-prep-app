import * as React from 'react';

interface EmailTemplateProps {
  title: string;
  message: string;
  link?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  title,
  message,
  link,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#000', fontSize: '24px' }}>{title}</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{message}</p>
    {link && (
      <div style={{ marginTop: '20px' }}>
        <a
          href={`https://prepsafe.app${link}`}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          View Details
        </a>
      </div>
    )}
    <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />
    <p style={{ fontSize: '12px', color: '#666' }}>
      You are receiving this email because you have enabled notifications for PrepSafe.
      <br />
      <a href="https://prepsafe.app/dashboard/settings" style={{ color: '#666' }}>Manage Settings</a>
    </p>
  </div>
);
