package com.md40diasmara.nusatinggi.data.retrofit

import com.md40diasmara.nusatinggi.data.response.ChatbotRequest
import com.md40diasmara.nusatinggi.data.response.ChatbotResponse
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

// Retrofit API interface
interface ChatbotApi {
    @POST("/chat")
    suspend fun getChatbotResponse(@Body request: ChatbotRequest): ChatbotResponse

    companion object {
        private const val BASE_URL = "https://chatbot-dot-nusatinggi.et.r.appspot.com"

        fun create(): ChatbotApi {
            val client = OkHttpClient.Builder().build()
            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ChatbotApi::class.java)
        }
    }
}
