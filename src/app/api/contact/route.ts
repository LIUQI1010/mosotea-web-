import { Resend } from 'resend'
import { z } from 'zod/v4'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Moso Tea <noreply@mosotea.co.nz>'
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'hello@mosotea.co.nz'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address').max(100),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, message } = result.data

    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `Contact Form — ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F;">
          <h1 style="color: #7C5C3E;">New Contact Message</h1>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Name</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Email</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${email}</td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Phone</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${phone}</td>
            </tr>` : ''}
          </table>
          <div style="padding: 16px; background: #FDF6F0; border-radius: 8px; margin-top: 16px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch {
    return Response.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
