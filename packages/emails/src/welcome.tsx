import React from 'react'
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

interface WelcomeEmailProps {
  firstName: string
  appUrl: string
}

export function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to InTrainin — start learning today</Preview>
      <Body style={{ backgroundColor: '#F8F5F0', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
          <Heading style={{ color: '#1C1510', fontSize: 28, fontWeight: 700 }}>
            Welcome, {firstName}
          </Heading>
          <Text style={{ color: '#1C1510', fontSize: 16, lineHeight: '24px' }}>
            You&apos;re now on InTrainin — the fastest way to get trained, certified,
            and employed in your role.
          </Text>
          <Button
            href={appUrl}
            style={{
              backgroundColor: '#FF6600',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Start learning free
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
