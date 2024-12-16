package com.md40diasmara.nusatinggi.ui.profil

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.LoginActivity
import com.md40diasmara.nusatinggi.R
import com.md40diasmara.nusatinggi.data.retrofit.ApiConfig
import com.md40diasmara.nusatinggi.databinding.FragmentProfilBinding
import kotlinx.coroutines.launch

class ProfilFragment : Fragment() {

    private var _binding: FragmentProfilBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Inflate the layout using View Binding
        _binding = FragmentProfilBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // Set up event listeners or data bindings
        binding.buttonEditProfile.setOnClickListener {
            // Navigasi ke halaman Edit Profil
            findNavController().navigate(R.id.action_profilFragment_to_editProfilFragment)
        }

        binding.imageOrder.setOnClickListener {
            // Tambahkan aksi untuk tombol Order
        }

        binding.imageBusinessMode.setOnClickListener {
            Log.d("ProfilFragment", "Navigating to BusinessFragment")
            findNavController().navigate(R.id.action_profilFragment_to_businessFragment)
        }

        binding.settings.setOnClickListener {
            // Tambahkan aksi untuk Pengaturan
        }

        binding.privacyPolicy.setOnClickListener {
            // Tambahkan aksi untuk Kebijakan Privasi
        }

        binding.complaints.setOnClickListener {
            // Tambahkan aksi untuk Keluhan Layanan
        }

        binding.aboutUs.setOnClickListener {
            // Tambahkan aksi untuk Tentang NusaTinggi
        }

        binding.buttonLogout.setOnClickListener {
            val editor = requireContext().getSharedPreferences("user_session", Context.MODE_PRIVATE).edit()
            editor.clear()
            editor.apply()

            val intent = Intent(requireContext(), LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            requireActivity().finish()
        }

        fetchProfileData()

        return root
    }

    private fun fetchProfileData() {
        val apiService = ApiConfig.getApiService(requireContext())
        lifecycleScope.launch {
            try {
                val response = apiService.getProfile()
                if (response.isSuccessful) {
                    response.body()?.let { profile ->
                        binding.textViewUsername.text = profile.username ?: "Tidak tersedia"
                        binding.textViewEmail.text = profile.email ?: "Tidak tersedia"
                        binding.textViewGender.text = profile.gender ?: "Tidak tersedia"
                        binding.textViewDateOfBirth.text = profile.dateOfBirth?.substring(0, 10) ?: "Tanggal tidak tersedia"

                        // Tampilkan gambar profil
                        Glide.with(requireContext())
                            .load(profile.profilePicture ?: R.drawable.ic_profile_placeholder)
                            .placeholder(R.drawable.ic_profile_placeholder)
                            .error(R.drawable.ic_error)
                            .into(binding.imageViewProfilePicture)
                    }
                } else {
                    Log.e("ProfilFragment", "Failed to fetch profile data: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("ProfilFragment", "Exception while fetching profile data: ${e.message}")
            }
        }
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}