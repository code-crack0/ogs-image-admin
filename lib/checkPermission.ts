import { createClient } from "@/utils/supabase/client";

export async function checkPermission(userEmail:string,permission:string){
    const supabase = createClient();
    
    
    const user_email = userEmail;
    const { data, error } = await supabase.from('roles').select('user_permissions').eq('user_email', user_email);
    if (error) {
        return false
    }
    if(data.length === 0){
        return false
    }
    const permissions = data[0].user_permissions;
    console.log(permissions);
    if(permissions.includes(permission)){
        return true
    }
    return false;
}