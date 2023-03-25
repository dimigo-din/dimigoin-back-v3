import { OutgoRequestType } from '../types';

export interface OutgoRequest {
    status: OutgoRequestType
    start: Date
    end: Date
    reason: string
    permitter: number
    breakfast: boolean
    lunch: boolean
    dinner: boolean
}

export interface StayApplyDate {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
    outgo: boolean
    requests: OutgoRequest[]
}

export interface StayApply {
    seat: string
    user: number
    reason: string
    dates: StayApplyDate[]
}

export interface StayDate {
    date: Date
    outgo: boolean
}

export interface Stay {
    startlines: Date[]
    deadlines: Date[]
    disabled: boolean
    deleted: boolean
    dates: StayDate[]
    applies: StayApply[]
}
