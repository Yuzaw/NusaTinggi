package com.md40diasmara.nusatinggi

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.md40diasmara.nusatinggi.data.response.LoginRequest
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import com.md40diasmara.nusatinggi.databinding.ActivityLoginBinding
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val sharedPreferences by lazy {
        getSharedPreferences("user_session", Context.MODE_PRIVATE)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Cek apakah sudah login
        if (isUserLoggedIn()) {
            navigateToMain()
        }

        // Menangani tombol Login
        binding.btnLogin.setOnClickListener {
            val usernameOrEmail = binding.etUsername.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (usernameOrEmail.isNotEmpty() && password.isNotEmpty()) {
                login(usernameOrEmail, password)
            } else {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            }
        }

        // Menangani tombol Register
        binding.btnRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun login(usernameOrEmail: String, password: String) {
        binding.progressBar.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                // Log request login
                Log.d("LOGIN_REQUEST", "Username/Email: $usernameOrEmail, Password: $password")

                // Memanggil API login
                val response = ApiConfig.getApiService(applicationContext).login(LoginRequest(usernameOrEmail, password))
                if (response.isSuccessful) {
                    Log.d("LOGIN_RESPONSE", "Login successful. Token handled by interceptor.")

                    // Simpan status login di SharedPreferences
                    with(sharedPreferences.edit()) {
                        putBoolean("is_logged_in", true) // Menyimpan bahwa pengguna sudah login
                        apply()
                    }

                    Toast.makeText(this@LoginActivity, "Login successful", Toast.LENGTH_SHORT).show()
                    navigateToMain()
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("LOGIN_ERROR", "Error: $errorBody")
                    Toast.makeText(this@LoginActivity, "Login failed: $errorBody", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e("LOGIN_EXCEPTION", "Exception: ${e.message}")
                Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }


    private fun isUserLoggedIn(): Boolean {
        val loggedIn = sharedPreferences.getBoolean("is_logged_in", false)
        Log.d("LOGIN_STATUS", "Is user logged in? $loggedIn")
        return loggedIn
    }

    private fun navigateToMain() {
        Log.d("LOGIN_NAVIGATION", "Navigating to MainActivity")
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
