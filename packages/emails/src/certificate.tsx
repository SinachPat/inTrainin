import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface CertificateEmailProps {
  firstName: string
  roleTitle: string
  verificationCode: string
  certificateUrl: string
}

export function CertificateEmail({
  firstName,
  roleTitle,
  verificationCode,
  certificateUrl,
}: CertificateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {roleTitle} certificate is ready</Preview>
      <Body style={{ backgroundColor: '#F8F5F0', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ height: 6, backgroundColor: '#FF6600', borderRadius: 4 }} />
          <Heading style={{ color: '#1C1510', fontSize: 28, fontWeight: 700, marginTop: 24 }}>
            Certificate Earned
          </Heading>
          <Text style={{ color: '#1C1510', fontSize: 16, lineHeight: '24px' }}>
            Congratulations {firstName} — you&apos;ve completed the{' '}
            <strong>{roleTitle}</strong> curriculum and earned your InTrainin certificate.
          </Text>
          <Text style={{ color: '#6B6460', fontSize: 13 }}>
            Verification code: <strong>{verificationCode}</strong>
          </Text>
          <Button
            href={certificateUrl}
            style={{
              backgroundColor: '#FF6600',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            View your certificate
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
