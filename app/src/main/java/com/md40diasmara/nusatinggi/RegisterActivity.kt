package com.md40diasmara.nusatinggi

import android.app.DatePickerDialog
import android.os.Bundle
import android.widget.RadioButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.md40diasmara.nusatinggi.data.response.RegisterRequest
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import com.md40diasmara.nusatinggi.databinding.ActivityRegisterBinding
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Menampilkan DatePickerDialog untuk memilih tanggal lahir
        binding.etBirthdate.setOnClickListener {
            showDatePickerDialog()
        }

        binding.btnRegister.setOnClickListener {
            val username = binding.etUsername.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()
            val selectedGenderId = binding.rgGender.checkedRadioButtonId
            val dateOfBirth = binding.etBirthdate.text.toString().trim()

            // Validasi input
            if (username.isEmpty() || email.isEmpty() || password.isEmpty() || selectedGenderId == -1 || dateOfBirth.isEmpty()) {
                Toast.makeText(this, "Semua data harus diisi!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Mendapatkan gender dari RadioButton
            val gender = when (findViewById<RadioButton>(selectedGenderId).text.toString()) {
                "Laki-Laki" -> "Male"
                "Perempuan" -> "Female"
                else -> ""
            }

            if (gender.isEmpty()) {
                Toast.makeText(this, "Pilih jenis kelamin!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val registerRequest = RegisterRequest(username, email, password, gender, dateOfBirth)

            // Menggunakan Coroutine untuk API call
            lifecycleScope.launch {
                try {
                    // Memanggil API menggunakan konfigurasi yang diperbarui
                    val response = ApiConfig.getApiService(applicationContext).register(registerRequest)
                    if (response.isSuccessful) {
                        Toast.makeText(this@RegisterActivity, "Registrasi berhasil!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        val errorMessage = response.errorBody()?.string() ?: "Unknown error"
                        Toast.makeText(this@RegisterActivity, "Registrasi gagal: $errorMessage", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@RegisterActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // Logika untuk kembali ke Login tanpa Intent
        binding.tvLogin.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    // Fungsi untuk menampilkan DatePickerDialog
    private fun showDatePickerDialog() {
        val calendar = Calendar.getInstance()

        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                // Format tanggal menjadi "YYYY-MM-DD"
                val formattedDate = String.format(Locale.getDefault(), "%04d-%02d-%02d", year, month + 1, dayOfMonth)
                binding.etBirthdate.setText(formattedDate)
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )

        datePickerDialog.show()
    }
}