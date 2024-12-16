package com.md40diasmara.nusatinggi.data.response

import android.os.Parcel
import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import java.util.Date

// Data Classes for API Requests/Responses
data class RegisterRequest(
    val username: String,        // Nama pengguna
    val email: String,           // Email
    val password: String,        // Kata sandi
    val gender: String,          // Jenis kelamin ("Male"/"Female")
    val dateOfBirth: String      // Tanggal lahir (format "YYYY-MM-DD")
)


data class LoginRequest(
    val usernameOrEmail: String, // Mengganti username menjadi usernameOrEmail
    val password: String
)


data class LoginResponse(
    @SerializedName("token") val token: String
)

data class ProfileResponse(
    @SerializedName("id") val id: String,
    @SerializedName("username") val username: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("dateOfBirth") val dateOfBirth: String?,
    @SerializedName("profilePicture") val profilePicture: String?
)
data class ChatbotRequest(val user_input: String)
data class ChatbotResponse(val response: String)
data class EditMountainRequest(val mountain_id: Int, val new_name: String)


// Data model for a single product in the response
data class ProductResponse(
    val id: String,
    val title: String,
    val description: String,
    val price: Double,
    val rating: Float,
    val image: String?,
    val jumlahRating: Int?,
    val jumlahPembeli: Int?
)






// Data class for EditProductRequest
data class EditProductRequest(
    val title: String,
    val description: String,
    val price: Double,
    val imageUri: String? // Optional image
)
data class MyBusinessResponse(
    val products: List<ProductResponse>
) {

}
