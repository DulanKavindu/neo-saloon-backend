import {z} from "zod"

const userRegistrationSchema = z.object({
    firstName:z.string().max(10),
    lastName:z.string().max(10),
    email:z.email(),
    password:z.string(),
    privilege:z.never().optional(),
    phone:z.string().optional(),
    
})

export type UserRegistrationType = z.infer<typeof userRegistrationSchema>

export  {userRegistrationSchema}