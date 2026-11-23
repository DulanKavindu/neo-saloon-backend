import {z} from "zod"

const userUpdateAdminSchema = z.object({

    id:z.never().optional(),
    password:z.never().optional(),
    
})

export type useUpdateAdminType= z.infer<typeof userUpdateAdminSchema>
export {userUpdateAdminSchema}