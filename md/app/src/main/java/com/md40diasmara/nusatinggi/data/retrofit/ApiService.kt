
package com.md40diasmara.nusatinggi.data.retrofit

import android.telecom.Call
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.ProductResponse
import com.md40diasmara.nusatinggi.data.response.ChatbotRequest
import com.md40diasmara.nusatinggi.data.response.ChatbotResponse
import com.md40diasmara.nusatinggi.data.response.EditMountainRequest
import com.md40diasmara.nusatinggi.data.response.EditProductRequest
import com.md40diasmara.nusatinggi.data.response.LoginRequest
import com.md40diasmara.nusatinggi.data.response.LoginResponse
import com.md40diasmara.nusatinggi.data.response.MyBusinessResponse
import com.md40diasmara.nusatinggi.data.response.RegisterRequest
import com.md40diasmara.nusatinggi.data.response.ProfileResponse
import com.md40diasmara.nusatinggi.ui.chatbot.ChatbotFragment
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path


interface ApiService {

    @GET("products")
    suspend fun getListProducts(): Response<List<Product>>

    @GET("products/{id}")
    suspend fun getProductById(
        @retrofit2.http.Path("id") id: String // Menggunakan String untuk mendukung UUID
    ): Response<ProductResponse>

    @POST("register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<Void>

    @POST("login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("user/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @PUT("user/update-profile")
    suspend fun updateProfile(
        @Body profile: ProfileResponse
    ): Response<Void>

    @PUT("edit-mountain")
    suspend fun editMountain(
        @Header("Authorization") token: String,
        @Body body: Map<String, Int>
    ): Response<ResponseBody>

    @POST("chat")
    suspend fun sendChat(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<ResponseBody>

    companion object {
        private const val BASE_URL = "https://chatbot-dot-nusatinggi.et.r.appspot.com"

        fun create(): ApiService {
            val client = OkHttpClient.Builder().build()
            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
    @GET("user/myBusiness")
    suspend fun getMyBusiness(): Response<MyBusinessResponse>

    @Multipart
    @POST("user/myBusiness/add")
    suspend fun addProduct(
        @Header("Authorization") token: String,
        @Header("Cookie") cookie: String,
        @Part("title") title: RequestBody,
        @Part("description") description: RequestBody,
        @Part("price") price: RequestBody,
        @Part image: MultipartBody.Part
    ): Response<Void>




    @DELETE("user/myBusiness/{productId}/delete")
    suspend fun deleteProduct(
        @Header("Authorization") token: String,
        @Path("productId") productId: String
    ): Response<Void>

    @PUT("user/myBusiness/{productId}/edit")
    suspend fun editProduct(
        @Header("Authorization") token: String,
        @Path("productId") productId: String,
        @Body body: EditProductRequest
    ): Response<Void>
}


