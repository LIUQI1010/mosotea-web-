import { z } from 'zod/v4'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendWorkshopInterestNotification,
  sendWorkshopInterestReceivedEmail,
} from '@/lib/resend/emails'

const workshopInterestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be 30 characters or fewer')
    .regex(/^[a-zA-Z\u4e00-\u9fff\s\-']+$/, 'Name may only contain English or Chinese characters'),
  email: z
    .string()
    .trim()
    .max(100, 'Email must be 100 characters or fewer')
    .email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be 20 characters or fewer')
    .refine(
      (val) => {
        const digits = val.replace(/[\s\-().+]/g, '')
        return /^\d{7,15}$/.test(digits)
      },
      { message: 'Invalid phone number' }
    ),
  guests: z.number().int().min(1).max(8, 'Maximum 8 guests'),
  message: z
    .string()
    .trim()
    .max(500, 'Message must be 500 characters or fewer')
    .optional()
    .default(''),
  preferredLanguage: z.enum(['en', 'zh']).optional().default('en'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = workshopInterestSchema.safeParse(body)

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { fullName, email, phone, guests, message, preferredLanguage } = result.data
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('workshop_interest_registrations')
      .insert({
        full_name: fullName,
        email,
        phone,
        guest_count: guests,
        message: message || null,
        preferred_language: preferredLanguage === 'zh' ? 'zh-TW' : 'en',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Workshop interest insert error:', error)
      return Response.json(
        { success: false, error: 'Failed to register interest' },
        { status: 500 }
      )
    }

    try {
      const resolvedLanguage = preferredLanguage === 'zh' ? 'zh-TW' : 'en'

      await Promise.all([
        sendWorkshopInterestNotification({
          customerName: fullName,
          email,
          phone,
          guestCount: guests,
          preferredLanguage: resolvedLanguage,
          message: message || 'No additional message.',
        }),
        sendWorkshopInterestReceivedEmail({
          customerName: fullName,
          email,
          preferredLanguage: resolvedLanguage,
        }),
      ])
    } catch (emailError) {
      console.error('Workshop interest email error:', emailError)
    }

    return Response.json({
      success: true,
      data: { id: data.id },
    })
  } catch (error) {
    console.error('Workshop interest route unexpected error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}