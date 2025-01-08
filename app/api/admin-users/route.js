import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addLogs } from '@/lib/addLogs';
import { createClientServer } from '@/utils/supabase/server';

// Initialize Supabase Admin Client


// Handler for API routes
export async function GET() {
  // Fetch all users
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
  );

  // Create a separate client for fetching the logged-in user's details
  const supabase = await createClientServer();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const loggedInUser = userData.user;
  const loggedInUserName = loggedInUser.user_metadata?.name || "Unknown User";
  const loggedInUserEmail = loggedInUser.email || "Unknown Email";

  const { email, password, isAdmin, canUploadImage, canCreateFolder, name, canDeleteFolder } = await req.json();

  // Create the user in Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      name,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Build user permissions array
  const permissions = [];
  if (canUploadImage) permissions.push("upload");
  if (canCreateFolder) permissions.push("create");
  if (canDeleteFolder) permissions.push("delete");

  // Insert the user role and permissions into the `roles` table
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from("roles")
    .insert([
      {
        user_email: email,
        user_role: isAdmin ? "admin" : "user",
        user_permissions: permissions, // Insert the permissions array
        user_name: name,
      },
    ]);

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  // Add a log entry with the logged-in user's details
  const logAction = `New user ${email} created`;
  const { data: logData, error: logError } = await supabaseAdmin
    .from("logs")
    .insert([
      {
        action: logAction,
        created_at: new Date().toISOString(),
        user_name: loggedInUserName, // Fetch from the logged-in user
        user_email: loggedInUserEmail, // Fetch from the logged-in user
      },
    ]);

  if (logError) {
    console.error("Error inserting log:", logError.message);
    return NextResponse.json({ error: logError.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}




export async function PUT(req) {
  const { userId, password } = await req.json();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req) {
  const { userId } = await req.json();
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}
