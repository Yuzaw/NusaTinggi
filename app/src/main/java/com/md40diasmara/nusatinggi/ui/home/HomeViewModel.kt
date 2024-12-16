package com.md40diasmara.nusatinggi.ui.home

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {

    private val _products = MutableLiveData<List<Product>>()
    val products: LiveData<List<Product>> get() = _products

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> get() = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> get() = _errorMessage

    fun fetchProducts(context: Context) {
        val sharedPreferences = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("user_token", null)
        Log.d("FETCH_PRODUCTS", "Token: $token")

        _isLoading.value = true
        _errorMessage.value = null

        viewModelScope.launch {
            try {
                val response = ApiConfig.getApiService(context).getListProducts()
                if (response.isSuccessful) {
                    _products.value = response.body() ?: emptyList()
                    Log.d("FETCH_PRODUCTS", "Products fetched successfully")
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    _errorMessage.value = "Failed to fetch products: $errorBody"
                    Log.e("FETCH_PRODUCTS", "Error: $errorBody")
                }
            } catch (e: Exception) {
                _errorMessage.value = "Error: ${e.message}"
                Log.e("FETCH_PRODUCTS", "Exception: ${e.message}")
            } finally {
                _isLoading.value = false
            }
        }
    }
}
