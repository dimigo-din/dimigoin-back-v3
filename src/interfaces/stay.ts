import { StayOutgoStatusType } from '../types';

export interface StayOutgoDuration {
    start: Date
    end: Date
}

export interface StayOutgo {
    user: number
    status: StayOutgoStatusType
    date: Date
    duration: StayOutgoDuration
    breakfast: boolean
    lunch: boolean
    dinner: boolean
    reason: string
}

export interface StayApply {
    seat: string
    user: number
    reason: string
}

export interface StayDate {
    date: Date
    outgo: boolean
}

export interface Stay {
    startline: Date
    deadline: Date
    disabled: boolean
    deleted: boolean
    dates: StayDate[]
}
