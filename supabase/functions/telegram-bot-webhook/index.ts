// supabase/functions/telegram-bot-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")

serve(async (req) => {
  try {
    const body = await req.json()

    // Check if the message and chat ID exist
    if (!body.message || !body.message.chat || !body.message.chat.id) {
      return new Response("Invalid request body", { status: 400 })
    }

    const chatId = body.message.chat.id
    const firstName = body.message.from.first_name || 'there'

    // Create the reply message
    const replyMessage = `
      👋 مرحبا ${firstName}!

      هذا هو معرف محادثتك في تيليجرام:
      \`${chatId}\`

      من فضل، قم بنسخ هذا المعرف واستخدمه في إعدادات الإشعارات الخاصة بك.
    `

    // Define the Telegram API endpoint to send a reply
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

    // Send the reply back to the user
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyMessage,
        parse_mode: 'Markdown', // This allows you to format the ID with backticks
      }),
    })

    // Return a success response to Telegram
    return new Response("OK", { status: 200 })

  } catch (err) {
    console.error("Error processing Telegram webhook:", err)
    return new Response(String(err?.message ?? "Internal Server Error"), { status: 500 })
  }
})