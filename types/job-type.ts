export interface Job {
    id: number
    position: string
    company: string
    source: string
    status: string
    applied_at: string
    updated_at: string
    deadline_at?: string | null
}

export interface JobDto {
    position: string
    company: string
    source: string
    status: string
    applied_at: string
    updated_at: string
    deadline_at?: string | null
}