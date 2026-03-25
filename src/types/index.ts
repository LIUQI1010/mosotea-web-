export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type CancelledBy = 'customer' | 'admin'
export type Language = 'en' | 'zh-TW'

export interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
    is_available: boolean
    created_at: string
}

export interface Booking {
    id: string
    time_slot_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    guest_count: number
    special_requests: string | null
    preferred_language: Language
    status: BookingStatus
    cancellation_token: string | null
    cancellation_token_expires_at: string | null
    cancelled_by: CancelledBy | null
    created_at: string
    updated_at: string
}

export interface BookingWithTimeSlot extends Booking {
    time_slot: TimeSlot
}

export interface Gallery {
    id: string
    url: string
    filename: string
    caption: string | null
    uploaded_at: string
}
