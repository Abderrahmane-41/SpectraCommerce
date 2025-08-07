import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests for direct invocations (like testing)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // --- Verification 4: Environment Variables ---
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !BOT_TOKEN) {
      throw new Error("Missing required environment variables (Supabase URL, Service Key, or Telegram Token).");
    }

    // --- Verification 1: Malformed Payload ---
    let order;
    try {
      const payload = await req.json();
      order = payload.record;
      if (!order) throw new Error("Payload is malformed or 'record' key is missing.");
    } catch (jsonError) {
      console.error("Failed to parse webhook payload:", jsonError.message);
      return new Response(JSON.stringify({ error: `Invalid request body: ${jsonError.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('telegram_chat_id')
      .limit(1)
      .single();

    if (settingsError) {
      console.error("Database error fetching store settings:", settingsError.message);
      throw new Error(`Database error: ${settingsError.message}`);
    }

    // --- Verification 2: Null or Empty Chat ID ---
    if (!settings || !settings.telegram_chat_id) {
      console.log("Chat ID not configured for this store. Skipping notification.");
      // Exit gracefully with a success status code
      return new Response(JSON.stringify({ message: "Notification skipped: Chat ID not configured." }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipientChatId = settings.telegram_chat_id;

    // ... (message formatting logic remains the same)
    let customOptionsString = '';
    if (order.custom_options && typeof order.custom_options === 'object' && Object.keys(order.custom_options).length > 0) {
      customOptionsString = Object.entries(order.custom_options)
        .map(([key, value]) => `   - ${key}: ${value}`)
        .join('\n');
    }
    const message = `
📢 *طلب جديد!* 📢
-----------------------------------
*معلومات الزبون:*
👤 *الاسم:* ${order.customer_name}
📞 *الهاتف:* \`${order.customer_phone}\`
📍 *الولاية:* ${order.wilaya}
🏙️ *البلدية:* ${order.commune || 'غير محددة'}
🏠 *العنوان الكامل:* ${order.full_address}
-----------------------------------
*تفاصيل الطلب:*
🛒 *المنتج:* ${order.product_name}
🔢 *الكمية:* ${order.quantity}
🎨 *اللون:* ${order.color || 'N/A'}
📏 *المقاس:* ${order.size || 'N/A'}
${customOptionsString ? `*خيارات إضافية:*\n${customOptionsString}` : ''}
-----------------------------------
💰 *السعر الإجمالي:* *${order.total_price} د.ج*
    `;

    // --- Verification 3: Telegram API Errors ---
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: recipientChatId,
        text: message.trim(),
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Log the specific error from Telegram for easier debugging
      console.error(`Telegram API Error: ${errorData.description}`, { chatId: recipientChatId });
      throw new Error(`Failed to send notification. Telegram API says: "${errorData.description}"`);
    }

    return new Response(JSON.stringify({ message: "Notification sent successfully!" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });

  } catch (err) {
    console.error("An unexpected error occurred in order-notifier function:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});