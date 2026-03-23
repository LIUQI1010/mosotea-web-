export type ServiceStatus = 'active' | 'inactive'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type CancelledBy = 'customer' | 'admin'
export type Language = 'en' | 'zh-TW'

export interface Service {
    id: string
    name_en: string
    name_zh: string
    description_en: string | null
    description_zh: string | null
    duration_minutes: number
    max_guests: number
    price_nzd: number
    is_active: boolean
    created_at: string
}

export interface TimeSlot {
    id: string
    service_id: string
    start_time: string
    end_time: string
    max_guests: number
    booked_guests: number
    is_available: boolean
    created_at: string
}

export interface Booking {
    id: string
    service_id: string
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

// 带关联数据的类型
export interface BookingWithDetails extends Booking {
    service: Service
    time_slot: TimeSlot
}