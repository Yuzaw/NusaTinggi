package com.md40diasmara.nusatinggi.ui.profil

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import com.md40diasmara.nusatinggi.data.response.ProfileResponse
import com.md40diasmara.nusatinggi.databinding.FragmentEditProfilBinding
import kotlinx.coroutines.launch
import com.md40diasmara.nusatinggi.R

class EditProfilFragment : Fragment() {

    private var _binding: FragmentEditProfilBinding? = null
    private val binding get() = _binding!!
    private var selectedImageUri: Uri? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEditProfilBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Edit Gambar
        binding.buttonEditImage.setOnClickListener {
            openGallery()
        }

        // Tombol Simpan
        binding.buttonSave.setOnClickListener {
            val username = binding.inputUsername.text.toString()
            val email = binding.inputEmail.text.toString()
            val gender = binding.inputGender.text.toString()
            val dateOfBirth = binding.inputDateOfBirth.text.toString()

            updateProfile(username, email, gender, dateOfBirth)
        }
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        startActivityForResult(intent, REQUEST_IMAGE_PICK)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_IMAGE_PICK && resultCode == Activity.RESULT_OK && data != null) {
            selectedImageUri = data.data
            Glide.with(requireContext())
                .load(selectedImageUri)
                .circleCrop()
                .into(binding.imageViewProfilePicture)
        }
    }

    private fun updateProfile(username: String, email: String, gender: String, dateOfBirth: String) {
        val apiService = ApiConfig.getApiService(requireContext())
        val profile = ProfileResponse(
            id = "", // Pastikan ID disediakan jika diperlukan
            username = if (username.isNotEmpty()) username else null,
            email = if (email.isNotEmpty()) email else null,
            gender = if (gender.isNotEmpty()) gender else null,
            dateOfBirth = if (dateOfBirth.isNotEmpty()) dateOfBirth else null,
            profilePicture = selectedImageUri?.toString() // URL gambar jika ada
        )

        lifecycleScope.launch {
            try {
                val response = apiService.updateProfile(profile)
                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Profil berhasil diperbarui", Toast.LENGTH_SHORT).show()
                    // Navigasi kembali atau perbarui tampilan
                } else {
                    Toast.makeText(requireContext(), "Gagal memperbarui profil: ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Terjadi kesalahan: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val REQUEST_IMAGE_PICK = 1001
    }
}
