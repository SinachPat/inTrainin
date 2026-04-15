import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  firstName:   string
  appUrl:      string
  accountType: 'learner' | 'business'
}

const copy = {
  learner: {
    preview: 'Welcome to InTrainin — your career starts here',
    heading: 'Your career starts here',
    body:    "You're now on InTrainin — Nigeria's fastest way to get trained, certified, and matched to the job you deserve. Your first 10 courses are completely free.",
    cta:     'Start learning free',
    ctaPath: '/dashboard',
    footer:  'Browse courses, earn your certificate, and get hired.',
  },
  business: {
    preview: 'Welcome to InTrainin — build your team with certified workers',
    heading: 'Build a team you can rely on',
    body:    "You're now on InTrainin — where Nigerian businesses train their staff, verify skills, and hire certified workers. Your dashboard is ready.",
    cta:     'Set up your dashboard',
    ctaPath: '/admin',
    footer:  'Post hire requests, manage training, and grow your team.',
  },
}

export function WelcomeEmail({ firstName, appUrl, accountType }: WelcomeEmailProps) {
  const c = copy[accountType] ?? copy.learner

  return (
    <Html>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={{ backgroundColor: '#F8F5F0', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>

          {/* Logo bar */}
          <Section style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: 10,
              backgroundColor: '#FF6600',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>IT</span>
            </div>
          </Section>

          {/* Greeting */}
          <Heading style={{ color: '#1C1510', fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>
            Welcome, {firstName}!
          </Heading>
          <Heading style={{ color: '#FF6600', fontSize: 20, fontWeight: 600, margin: '0 0 20px' }}>
            {c.heading}
          </Heading>

          {/* Body */}
          <Text style={{ color: '#3D2B1F', fontSize: 15, lineHeight: '24px', margin: '0 0 28px' }}>
            {c.body}
          </Text>

          {/* CTA */}
          <Button
            href={`${appUrl}${c.ctaPath}`}
            style={{
              backgroundColor: '#FF6600',
              color:            '#ffffff',
              padding:          '13px 28px',
              borderRadius:     8,
              fontWeight:       700,
              fontSize:         15,
              textDecoration:   'none',
              display:          'inline-block',
            }}
          >
            {c.cta} →
          </Button>

          {/* Divider */}
          <Section style={{ borderTop: '1px solid #E8DDD5', margin: '36px 0 20px' }} />

          {/* Footer note */}
          <Text style={{ color: '#7A6358', fontSize: 13, lineHeight: '20px', margin: 0 }}>
            {c.footer}
          </Text>
          <Text style={{ color: '#B5A398', fontSize: 12, marginTop: 12 }}>
            InTrainin · Lagos, Nigeria
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
