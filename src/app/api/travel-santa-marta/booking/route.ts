import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      package: packageType,
      preferredDate,
      preferredTime,
      excursions,
      additionalNotes
    } = body

    // Validate required fields
    if (!name || !email || !packageType || !preferredDate || !excursions || excursions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Format package name
    const packageNames: { [key: string]: string } = {
      '1-week': '1 Week Package - $2,500 (for 1-2 people)',
      '2-week': '2 Week Package - $3,000 (for 1-2 people)',
      '1-week-family': '1 Week Family Package - $3,000 (for 3-5 people)',
      '2-week-family': '2 Week Family Package - $3,500 (for 3-5 people)',
      'premium-2-week': 'Premium 2 Week Package - $4,000 (for 1-2 people)',
      'luxury-jungle': 'Luxury 1 Week Jungle Package - $4,000 (for 1-2 people)'
    }
    const packageName = packageNames[packageType] || packageType

    // Format date
    const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Create email content
    const emailContent = `
New Travel Santa Marta Booking Request

Contact Information:
- Name: ${name}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}

Package Selection:
${packageName}

Preferred Schedule:
- Date: ${formattedDate}
${preferredTime ? `- Time: ${preferredTime}` : ''}

Excursions & Activities of Interest:
${excursions.map((exc: string) => `• ${exc}`).join('\n')}

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}

---
This booking request was submitted through joeyhendrickson.com
    `.trim()

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
          🏖️ New Travel Santa Marta Booking Request
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
        </div>

        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
          <h3 style="color: #0284c7; margin-top: 0;">Package Selection</h3>
          <p style="font-size: 18px; font-weight: bold; color: #0c4a6e;">${packageName}</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="color: #16a34a; margin-top: 0;">Preferred Schedule</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          ${preferredTime ? `<p><strong>Time:</strong> ${preferredTime}</p>` : ''}
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #f59e0b; margin-top: 0;">Excursions & Activities of Interest</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${excursions.map((exc: string) => `<li style="margin: 8px 0;">${exc}</li>`).join('')}
          </ul>
        </div>

        ${additionalNotes ? `
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Additional Notes</h3>
          <p style="white-space: pre-wrap; color: #4b5563;">${additionalNotes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This booking request was submitted through <a href="https://joeyhendrickson.com" style="color: #3b82f6;">joeyhendrickson.com</a>
          </p>
        </div>
      </div>
    `

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'joeyhendrickson@me.com',
      subject: `New Travel Santa Marta Booking: ${name} - ${packageName}`,
      text: emailContent,
      html: htmlContent,
      replyTo: email,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Booking request sent successfully'
    })

  } catch (error) {
    console.error('Error sending booking email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send booking request' },
      { status: 500 }
    )
  }
}

