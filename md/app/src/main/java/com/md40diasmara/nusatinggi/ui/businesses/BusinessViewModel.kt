package com.md40diasmara.nusatinggi.ui.businesses

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.liveData
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson // Pastikan import ini ada
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.data.response.ProductResponse
import com.md40diasmara.nusatinggi.data.response.EditProductRequest
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.UUID

class BusinessViewModel : ViewModel() {

    private val _products = MutableLiveData<List<Product>>()
    val products: LiveData<List<Product>> get() = _products

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> get() = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> get() = _errorMessage

    private fun getToken(context: Context): String? {
        val sharedPreferences = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
        return sharedPreferences.getString("user_token", null)
    }

    fun fetchProducts(context: Context) {
        _isLoading.value = true
        viewModelScope.launch {
            try {
                Log.d("FETCH_PRODUCTS", "Fetching products...")
                val response = ApiConfig.getApiService(context).getMyBusiness()

                if (response.isSuccessful) {
                    Log.d("FETCH_PRODUCTS", "Response: ${Gson().toJson(response.body())}")

                    val products = response.body()?.products?.map {
                        Product(
                            id = it.id,
                            title = it.title,
                            description = it.description,
                            price = it.price.toFloat(),
                            rating = it.rating,
                            image = it.image,
                            jumlahRating = it.jumlahRating ?: 0,
                            jumlahPembeli = it.jumlahPembeli ?: 0
                        )
                    } ?: emptyList()
                    _products.value = products
                } else {
                    _errorMessage.value = "Failed to fetch products: ${response.message()}"
                    Log.e("FETCH_PRODUCTS", "Error: ${response.message()}")
                }
            } catch (e: Exception) {
                _errorMessage.value = "Unable to fetch products"
                Log.e("FETCH_PRODUCTS", "Exception: ${e.message}", e)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun addProduct(
        context: Context,
        title: String,
        description: String,
        price: Double,
        imageUri: Uri
    ) {
        Log.d("ADD_PRODUCT", "Starting addProduct process...")

        val token = getToken(context) ?: run {
            _errorMessage.value = "User not authenticated. Please log in again."
            Log.e("ADD_PRODUCT", "Token is null or invalid")
            return
        }
        Log.d("ADD_PRODUCT", "Token acquired: $token")

        // Step 1: Convert Uri to File
        val imageFile = uriToFile(imageUri, context)
        Log.d("ADD_PRODUCT", "Image file path: ${imageFile.absolutePath}, size: ${imageFile.length()} bytes")

        // Step 2: Validate File
        if (!imageFile.exists() || imageFile.length() == 0L) {
            Log.e("ADD_PRODUCT", "Image file is invalid or empty.")
            _errorMessage.value = "Invalid image file. Please try selecting another image."
            return
        }

        // Step 3: Prepare RequestBody Parts
        val titlePart = title.toRequestBody("string".toMediaTypeOrNull())  // Title as string
        val descriptionPart = description.toRequestBody("string".toMediaTypeOrNull())  // Description as string
        val pricePart = price.toString().toRequestBody("Double".toMediaTypeOrNull())  // Price as double

        val imageRequestBody = imageFile.asRequestBody("file".toMediaTypeOrNull())  // Image as file
        val imagePart = MultipartBody.Part.createFormData("file", imageFile.name, imageRequestBody)
        Log.d("ADD_PRODUCT", "Image MultipartBody created successfully.")

        _isLoading.value = true

        // Step 4: Make API Call
        viewModelScope.launch {
            try {
                Log.d("ADD_PRODUCT", "Making API request to add product...")

                val response = ApiConfig.getApiService(context).addProduct(
                    token = "Bearer $token",
                    cookie = "token=$token",
                    title = titlePart,
                    description = descriptionPart,
                    price = pricePart,
                    image = imagePart
                )

                if (response.isSuccessful) {
                    Log.d("ADD_PRODUCT", "API response success: ${response.message()}")
                    fetchProducts(context) // Refresh product list
                    _errorMessage.value = "Product added successfully"
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e(
                        "ADD_PRODUCT",
                        "API response failed: ${response.code()} - ${response.message()}. Error Body: $errorBody"
                    )
                    _errorMessage.value = "Failed to add product: ${response.message()}"
                }
            } catch (e: Exception) {
                Log.e("ADD_PRODUCT", "Exception occurred while adding product: ${e.message}", e)
                _errorMessage.value = "Network error occurred. Please try again later."
            } finally {
                _isLoading.value = false
                Log.d("ADD_PRODUCT", "Loading state set to false")
            }
        }
    }

    private fun uriToFile(uri: Uri, context: Context): File {
        val contentResolver = context.contentResolver

        // Ambil nama file asli dari URI
        val fileName = getFileNameFromUri(uri, context) ?: "default_image.jpg"

        val inputStream = contentResolver.openInputStream(uri)
        val tempFile = File(context.cacheDir, fileName)

        inputStream?.use { input ->
            tempFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }

        Log.d("URI_TO_FILE", "File created: ${tempFile.absolutePath}, size: ${tempFile.length()} bytes")
        return tempFile
    }

    private fun getFileNameFromUri(uri: Uri, context: Context): String? {
        var name: String? = null
        if (uri.scheme == "content") {
            val cursor: Cursor? = context.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val index = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (index != -1) {
                        name = it.getString(index)
                    }
                }
            }
        }
        if (name == null) {
            name = uri.lastPathSegment
        }
        return name
    }

    fun deleteProduct(context: Context, productId: String) {
        val token = getToken(context)
        if (token.isNullOrEmpty()) {
            _errorMessage.value = "User not authenticated"
            return
        }

        Log.d("DELETE_PRODUCT", "Deleting product with ID: $productId")

        _isLoading.value = true
        viewModelScope.launch {
            try {
                val response = ApiConfig.getApiService(context).deleteProduct("Bearer $token", productId)
                if (response.isSuccessful) {
                    Log.d("DELETE_PRODUCT", "Product deleted successfully")
                    fetchProducts(context)
                } else {
                    _errorMessage.value = "Failed to delete product: ${response.message()}"
                    Log.e("DELETE_PRODUCT", "Error: ${response.message()}")
                }
            } catch (e: Exception) {
                _errorMessage.value = "Unable to delete product"
                Log.e("DELETE_PRODUCT", "Exception: ${e.message}", e)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun editProduct(context: Context, productId: String, title: String, description: String, price: Double, imageUri: String?) {
        val token = getToken(context)
        if (token.isNullOrEmpty()) {
            _errorMessage.value = "User not authenticated"
            return
        }

        val requestBody = EditProductRequest(title, description, price, imageUri)
        Log.d("EDIT_PRODUCT", "Payload: ${Gson().toJson(requestBody)}")

        _isLoading.value = true
        viewModelScope.launch {
            try {
                val response = ApiConfig.getApiService(context).editProduct("Bearer $token", productId, requestBody)
                if (response.isSuccessful) {
                    Log.d("EDIT_PRODUCT", "Product edited successfully")
                    fetchProducts(context)
                } else {
                    _errorMessage.value = "Failed to edit product: ${response.message()}"
                    Log.e("EDIT_PRODUCT", "Error: ${response.message()}")
                }
            } catch (e: Exception) {
                _errorMessage.value = "Unable to edit product"
                Log.e("EDIT_PRODUCT", "Exception: ${e.message}", e)
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun mapToProductList(response: List<ProductResponse>): List<Product> {
        return response.map {
            Product(
                id = UUID.fromString(it.id).toString(),
                title = it.title,
                description = it.description,
                price = it.price.toFloat(),
                rating = it.rating,
                image = it.image.toString(),
                jumlahRating = it.jumlahRating ?: 0,
                jumlahPembeli = it.jumlahPembeli ?: 0
            )
        }
    }
}
