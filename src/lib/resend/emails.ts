import { Resend } from 'resend'
import type { BookingWithDetails } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Moso Tea <noreply@mosotea.co.nz>'
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'hello@mosotea.co.nz'

// 发给客户的预约确认邮件
export async function sendBookingConfirmation(
    booking: BookingWithDetails,
    cancellationUrl: string
) {
    const isZh = booking.preferred_language === 'zh-TW'

    await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.customer_email,
        subject: isZh ? '預約確認 — Moso Tea' : 'Booking Confirmation — Moso Tea',
        html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F;">
        <h1 style="color: #7C5C3E;">${isZh ? '預約確認' : 'Booking Confirmed'}</h1>
        <p>${isZh ? '親愛的' : 'Dear'} ${booking.customer_name},</p>
        <p>${isZh ? '感謝您的預約！以下是您的預約詳情：' : 'Thank you for your booking! Here are your details:'}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>${isZh ? '體驗' : 'Experience'}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${isZh ? booking.service.name_zh : booking.service.name_en}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>${isZh ? '日期時間' : 'Date & Time'}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${new Date(booking.time_slot.start_time).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>${isZh ? '賓客人數' : 'Guests'}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.guest_count}</td>
          </tr>
        </table>

        <p style="color: #6B6B6B; font-size: 14px;">
          ${isZh ? '如需取消預約，請點擊以下連結（預約時間前24小時截止）：' : 'To cancel your booking (at least 24 hours before your session):'}
        </p>
        <a href="${cancellationUrl}" style="color: #7C5C3E;">${isZh ? '取消預約' : 'Cancel Booking'}</a>

        <p style="margin-top: 30px;">${isZh ? '期待與您相見！' : 'We look forward to seeing you!'}</p>
        <p>Moso Tea</p>
      </div>
    `,
    })
}

// 发给老板的新预约通知
export async function sendBookingNotification(booking: BookingWithDetails) {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Booking — ${booking.service.name_en}`,
        html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F;">
        <h1 style="color: #7C5C3E;">New Booking Received</h1>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Customer</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Email</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.customer_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Phone</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.customer_phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Experience</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.service.name_en}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Date & Time</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${new Date(booking.time_slot.start_time).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Guests</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.guest_count}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Special Requests</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.special_requests || 'None'}</td>
          </tr>
        </table>
      </div>
    `,
    })
}

// 发给客户的取消确认邮件
export async function sendCancellationConfirmation(booking: BookingWithDetails) {
    const isZh = booking.preferred_language === 'zh-TW'

    await resend.emails.send({
        from: FROM_EMAIL,
        to: booking.customer_email,
        subject: isZh ? '預約已取消 — Moso Tea' : 'Booking Cancelled — Moso Tea',
        html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F;">
        <h1 style="color: #7C5C3E;">${isZh ? '預約已取消' : 'Booking Cancelled'}</h1>
        <p>${isZh ? '親愛的' : 'Dear'} ${booking.customer_name},</p>
        <p>${isZh ? '您的預約已成功取消。' : 'Your booking has been successfully cancelled.'}</p>
        <p>${isZh ? '如需重新預約，歡迎隨時訪問我們的網站。' : 'We hope to welcome you another time. Visit our website to make a new booking.'}</p>
        <p>Moso Tea</p>
      </div>
    `,
    })
}

// 发给老板的取消通知
export async function sendCancellationNotice(booking: BookingWithDetails) {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        subject: `Booking Cancelled — ${booking.service.name_en}`,
        html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3D2B1F;">
        <h1 style="color: #7C5C3E;">Booking Cancelled by Customer</h1>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Customer</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Experience</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.service.name_en}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Date & Time</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${new Date(booking.time_slot.start_time).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;"><strong>Guests</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E8E0D8;">${booking.guest_count}</td>
          </tr>
        </table>
        <p style="color: #6B6B6B;">The time slot has been released and is now available for new bookings.</p>
      </div>
    `,
    })
}