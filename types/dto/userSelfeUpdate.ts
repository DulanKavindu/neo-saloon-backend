import {z} from "zod"

const userSelfUpdateSchema = z.object({   
    id:z.never().optional(),
    email:z.email().optional(),
    firstName:z.string().max(10).optional(),
    lastName:z.string().max(10).optional(),
    password:z.never().optional(),
    privilege:z.never().optional(),
    phone:z.string().optional(),
    role:z.never().optional(),
    status:z.never().optional(),
    profilePicture:z.never().optional(),
})

export type UserSelfUpdateType = z.infer<typeof userSelfUpdateSchema>

export  {userSelfUpdateSchema}