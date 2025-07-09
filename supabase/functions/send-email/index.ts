import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRecipient {
  email: string
  name?: string
}

interface EmailRequest {
  to: EmailRecipient[]
  subject: string
  html: string
  text: string
  from?: {
    email: string
    name: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const emailData: EmailRequest = await req.json()

    // Validate required fields
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and html or text' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Default from address
    const fromEmail = emailData.from?.email || Deno.env.get('FROM_EMAIL') || 'noreply@pxvpay.com'
    const fromName = emailData.from?.name || Deno.env.get('FROM_NAME') || 'PXV Pay'

    // Log the email attempt
    console.log(`📧 Attempting to send email to ${emailData.to.length} recipient(s)`)
    console.log(`📧 Subject: ${emailData.subject}`)
    console.log(`📧 From: ${fromName} <${fromEmail}>`)

    // Check if we have SendGrid API key
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (sendGridApiKey) {
      console.log('📧 Using SendGrid for email delivery')
      
      // Prepare SendGrid payload
      const sendGridPayload = {
        personalizations: [
          {
            to: emailData.to.map(recipient => ({
              email: recipient.email,
              name: recipient.name || recipient.email
            }))
          }
        ],
        from: {
          email: fromEmail,
          name: fromName
        },
        subject: emailData.subject,
        content: [
          {
            type: "text/plain",
            value: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
          },
          {
            type: "text/html",
            value: emailData.html || emailData.text.replace(/\n/g, '<br>')
          }
        ]
      }

      // Send via SendGrid
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendGridPayload)
      })

      if (sendGridResponse.ok) {
        console.log('✅ Email sent successfully via SendGrid')
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email sent successfully via SendGrid',
            provider: 'sendgrid'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        const errorText = await sendGridResponse.text()
        console.error('❌ SendGrid error:', errorText)
        throw new Error(`SendGrid API error: ${errorText}`)
      }
    } 
    
    // Check for generic SMTP configuration
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      console.log('📧 Using SMTP for email delivery')
      
      // For now, log the SMTP attempt (actual SMTP implementation would require additional Deno modules)
      console.log(`📧 SMTP Config - Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser}`)
      
      // This is a placeholder - in production, you would implement actual SMTP sending
      // For now, we'll return success to indicate the configuration is detected
      console.log('ℹ️ SMTP detected but not implemented in this demo - email logged')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMTP configuration detected - email would be sent in production',
          provider: 'smtp',
          demo: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fallback: Log the email (for development/testing)
    console.log('⚠️ No email provider configured - logging email details')
    console.log('📧 Email Details:')
    console.log(`   To: ${emailData.to.map(r => `${r.name || ''} <${r.email}>`).join(', ')}`)
    console.log(`   From: ${fromName} <${fromEmail}>`)
    console.log(`   Subject: ${emailData.subject}`)
    console.log(`   HTML Length: ${emailData.html?.length || 0} characters`)
    console.log(`   Text Length: ${emailData.text?.length || 0} characters`)
    
    // In development, we still return success so the application doesn't break
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email logged (no provider configured)',
        provider: 'logger',
        development: true,
        recipients: emailData.to.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Email service error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 