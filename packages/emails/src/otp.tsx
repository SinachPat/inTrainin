import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface OtpEmailProps {
  otp: string
  expiresInMinutes?: number
}

export function OtpEmail({ otp, expiresInMinutes = 10 }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your InTrainin verification code: {otp}</Preview>
      <Body style={{ backgroundColor: '#F8F5F0', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
          <Heading style={{ color: '#1C1510', fontSize: 28, fontWeight: 700 }}>
            Verification Code
          </Heading>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E5DDD0',
              borderRadius: 8,
              padding: '24px',
              textAlign: 'center',
              margin: '24px 0',
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: 700, letterSpacing: 12, color: '#FF6600', margin: 0 }}>
              {otp}
            </Text>
          </div>
          <Text style={{ color: '#6B6460', fontSize: 13 }}>
            This code expires in {expiresInMinutes} minutes. Do not share it with anyone.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
