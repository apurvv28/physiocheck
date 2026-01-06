import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailRequest {
  to: string
  patientName: string
  email: string
  password: string
  loginLink: string
}

// Define a type for the error
interface NodemailerError extends Error {
  code?: string
  responseCode?: number
  response?: string
  command?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { to, patientName, email, password, loginLink } = body

    // Validate required environment variables
    const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS']
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingEnvVars.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Missing environment variables:', missingEnvVars)
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
          details: `Missing environment variables: ${missingEnvVars.join(', ')}`
        },
        { status: 500 }
      )
    }

    // Configure nodemailer transporter with better options
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug logging in dev
      logger: process.env.NODE_ENV === 'development' // Enable logger in dev
    })

    // Verify transporter configuration
    await transporter.verify()
    // console.log('SMTP transporter verified successfully')

    // Email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Vital Flow Physiotherapy</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .header {
            background: linear-gradient(135deg, #0ea5e9, #10b981);
            padding: 40px;
            text-align: center;
            border-radius: 12px 12px 0 0;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: bold;
            color: #0ea5e9;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .credentials {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .credential-item {
            margin-bottom: 16px;
        }
        .label {
            font-weight: 600;
            color: #475569;
            margin-bottom: 4px;
            font-size: 14px;
        }
        .value {
            font-family: 'Monaco', 'Consolas', monospace;
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            font-size: 14px;
            word-break: break-all;
        }
        .button {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
        }
        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 16px;
            margin: 24px 0;
            color: #92400e;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        @media (max-width: 640px) {
            .content, .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">VF</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Vital Flow Physiotherapy</h1>
    </div>
    
    <div class="content">
        <h2 style="color: #1e293b; margin-top: 0;">Dear ${patientName},</h2>
        
        <p>Your doctor has created an account for you on the Vital Flow Physiotherapy platform. 
        You can now access your personalized rehabilitation program and track your progress.</p>
        
        <div class="credentials">
            <h3 style="margin-top: 0; color: #1e293b;">Your Login Credentials:</h3>
            
            <div class="credential-item">
                <div class="label">Email Address</div>
                <div class="value">${email}</div>
            </div>
            
            <div class="credential-item">
                <div class="label">Temporary Password</div>
                <div class="value">${password}</div>
            </div>
        </div>
        
        <div class="security-note">
            <strong>⚠️ Security Notice:</strong> 
            Please change your password immediately after your first login for security purposes.
        </div>
        
        <a href="${loginLink}" class="button" style="color: white;">Access Your Account</a>
        
        <p>Once logged in, you'll be able to:</p>
        <ul>
            <li>View assigned exercises from your doctor</li>
            <li>Track your progress with real-time feedback</li>
            <li>Access video instructions for each exercise</li>
            <li>Communicate directly with your doctor</li>
            <li>View your session history and improvements</li>
        </ul>
        
        <p>If you have any issues logging in, please contact your doctor directly.</p>
        
        <div class="footer">
            <p><strong>Vital Flow Physiotherapy</strong><br>
            Professional Rehabilitation Platform</p>
            <p style="font-size: 12px; color: #94a3b8;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `

    // Send email
    const mailOptions = {
      from: `"Vital Flow Physiotherapy" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vitalflow.com'}>`,
      to,
      subject: 'Welcome to Vital Flow Physiotherapy - Your Account Credentials',
      html: htmlContent,
      // Text version for email clients that don't support HTML
      text: `
Dear ${patientName},

Your doctor has created an account for you on the Vital Flow Physiotherapy platform.

Your Login Credentials:
Email: ${email}
Password: ${password}

Please change your password immediately after your first login for security purposes.

Login link: ${loginLink}

Once logged in, you'll be able to:
- View assigned exercises from your doctor
- Track your progress with real-time feedback
- Access video instructions for each exercise
- Communicate directly with your doctor
- View your session history and improvements

If you have any issues logging in, please contact your doctor directly.

Vital Flow Physiotherapy
Professional Rehabilitation Platform

This is an automated message. Please do not reply to this email.
      `.trim()
    }

    const info = await transporter.sendMail(mailOptions)
    // console.log('Email sent successfully:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Credentials sent successfully',
      messageId: info.messageId
    })

  } catch (error: unknown) { // Use unknown instead of any
    // eslint-disable-next-line no-console
    console.error('Error sending email:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to send email'
    let errorDetails = 'Unknown error occurred'

    // Type guard to check if error is an instance of Error
    if (error instanceof Error) {
      errorDetails = error.message
      const nodemailerError = error as NodemailerError

      if (nodemailerError.code === 'EAUTH') {
        errorMessage = 'Authentication failed'
        errorDetails = 'Invalid email credentials. Please check SMTP_USER and SMTP_PASS.'
      } else if (nodemailerError.code === 'ECONNECTION') {
        errorMessage = 'Connection failed'
        errorDetails = 'Unable to connect to SMTP server. Check SMTP_HOST and SMTP_PORT.'
      } else if (nodemailerError.code === 'ENOTFOUND') {
        errorMessage = 'SMTP host not found'
        errorDetails = `SMTP host "${process.env.SMTP_HOST || 'smtp.gmail.com'}" not found.`
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}