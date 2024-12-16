package com.md40diasmara.nusatinggi.data.retrofit

object ChatRepository {
    suspend fun sendMessage(message: String, token: String): String {
        // Simulasi panggilan API, ubah sesuai dengan API Anda
        return try {
            // Contoh panggilan API
            "Response from chatbot: You said '$message'"
        } catch (e: Exception) {
            throw Exception("Error sending message to chatbot")
        }
    }
}
