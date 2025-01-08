import { createClient } from "@/utils/supabase/client";

export async function addLogs(action:string){
    const supabase = createClient();
    const {data:{user}} = await supabase.auth.getUser();
    const user_name = user?.user_metadata?.name || "";
    const user_email = user?.email || "";
    console.log(user_name, user_email);
    console.log(action);
    console.log("Data returned: ",user)
    const { data, error } = await supabase.from('logs').insert([
        {
            action: action,
            created_at: new Date().toISOString(),
            user_name: user_name,
            user_email: user_email
        }
    ]);
    if (error) {
        console.error('Error inserting log:', error.message);
        return [];
    }
    return data;
}
