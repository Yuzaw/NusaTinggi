package com.md40diasmara.nusatinggi.data.retrofit

import android.content.Context
import android.util.Log
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiConfig {
    private const val BASE_URL = "https://nusatinggi.et.r.appspot.com/api/"

    fun getApiService(context: Context): ApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        // Interceptor untuk membaca Set-Cookie dan menyimpan token
        val cookieSavingInterceptor = Interceptor { chain ->
            val response = chain.proceed(chain.request())

            // Baca header Set-Cookie dari respons
            val cookies = response.headers("Set-Cookie")
            cookies.forEach { cookie ->
                if (cookie.startsWith("token=")) {
                    val token = cookie.substringAfter("token=").substringBefore(";")
                    val sharedPreferences = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
                    sharedPreferences.edit().putString("user_token", token).apply()
                    Log.d("COOKIE_TOKEN", "Token saved from cookie: $token")
                }
            }

            response
        }

        // Interceptor untuk menambahkan token ke header Authorization dan cookie
        val authInterceptor = Interceptor { chain ->
            val requestBuilder = chain.request().newBuilder()

            // Ambil token dari SharedPreferences
            val sharedPreferences = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
            val token = sharedPreferences.getString("user_token", null)

            // Tambahkan header Authorization dan cookie jika token tersedia
            if (!token.isNullOrEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
                requestBuilder.addHeader("Cookie", "token=$token")
                Log.d("AUTH_TOKEN", "Token added to request: Bearer $token, Cookie: token=$token")
            } else {
                Log.e("AUTH_TOKEN", "No token found in SharedPreferences")
            }

            chain.proceed(requestBuilder.build())
        }

        // CookieJar untuk menyimpan dan mengelola cookie
        val cookieJar = object : CookieJar {
            private val cookieStore: MutableMap<String, MutableList<Cookie>> = mutableMapOf()

            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                cookieStore[url.host] = cookies.toMutableList()
                Log.d("COOKIE_JAR", "Cookies saved for ${url.host}: $cookies")
            }

            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                return cookieStore[url.host] ?: emptyList()
            }
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor) // Logging interceptor untuk debugging
            .addInterceptor(cookieSavingInterceptor) // Simpan token dari Set-Cookie
            .addInterceptor(authInterceptor) // Tambahkan token ke Authorization dan Cookie
            .cookieJar(cookieJar) // Kelola cookie
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
