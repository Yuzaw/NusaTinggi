package com.md40diasmara.nusatinggi.ui.businesses

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.GridLayoutManager
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.R
import com.md40diasmara.nusatinggi.adapter.ItemAdapter
import com.md40diasmara.nusatinggi.databinding.FragmentBusinessBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.md40diasmara.nusatinggi.adapter.BusinessItemAdapter
import java.io.File

class BusinessFragment : Fragment() {

    private var _binding: FragmentBusinessBinding? = null
    private val binding get() = _binding!!
    private val businessViewModel: BusinessViewModel by viewModels()
    private lateinit var adapter: BusinessItemAdapter


    private val PICK_IMAGE_REQUEST = 101
    private var selectedImageUri: Uri? = null
    private lateinit var ivSelectedImage: ImageView

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBusinessBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupObservers()
        setupListeners()

        // Fetch initial product data
        Log.d("BusinessFragment", "Fetching initial product data...")
        businessViewModel.fetchProducts(requireContext())
    }

    private fun setupRecyclerView() {
        adapter = BusinessItemAdapter(emptyList(), object : BusinessItemAdapter.OnBusinessItemClickListener {
            override fun onEditClick(product: Product) {
                showEditProductDialog(product) // Dialog untuk mengedit produk
            }

            override fun onDeleteClick(product: Product) {
                showDeleteConfirmationDialog(product) // Dialog untuk menghapus produk
            }
        })

        binding.recyclerView.apply {
            layoutManager = GridLayoutManager(context, 2)
            adapter = this@BusinessFragment.adapter
        }
    }


    private fun setupObservers() {
        businessViewModel.products.observe(viewLifecycleOwner) { products ->
            Log.d("BusinessFragment", "Products updated: ${products.size} items")
            adapter.updateData(products)
        }

        businessViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            Log.d("BusinessFragment", "Loading status: $isLoading")
        }

        businessViewModel.errorMessage.observe(viewLifecycleOwner) { errorMessage ->
            errorMessage?.let {
                Log.e("BusinessFragment", "Error occurred: $it")
                Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupListeners() {
        binding.fabAddProduct.setOnClickListener {
            showAddProductDialog()
        }
    }

    @SuppressLint("MissingInflatedId")
    private fun showAddProductDialog() {
        val dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_add_product, null)
        val etTitle = dialogView.findViewById<EditText>(R.id.etTitle)
        val etDescription = dialogView.findViewById<EditText>(R.id.etDescription)
        val etPrice = dialogView.findViewById<EditText>(R.id.etPrice)
        val btnSelectImage = dialogView.findViewById<Button>(R.id.btnSelectImage)
        ivSelectedImage = dialogView.findViewById(R.id.ivSelectedImage)

        btnSelectImage.setOnClickListener {
            openGallery()
        }

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .setTitle("Tambah Produk")
            .setPositiveButton("Simpan", null)
            .setNegativeButton("Batal") { dialog, _ -> dialog.dismiss() }
            .create()

        dialog.setOnShowListener {
            val button = dialog.getButton(AlertDialog.BUTTON_POSITIVE)
            button.setOnClickListener {
                val title = etTitle.text.toString().trim()
                val description = etDescription.text.toString().trim()
                val price = etPrice.text.toString().toDoubleOrNull()

                Log.d("AddProduct", "Input data: title=$title, description=$description, price=$price, uri=$selectedImageUri")

                if (validateInput(title, description, price, selectedImageUri)) {
                    val imageFile = selectedImageUri?.let { uriToFile(it) }
                    Log.d("AddProduct", "Image file created: ${imageFile?.absolutePath}, size=${imageFile?.length()} bytes")

                    businessViewModel.addProduct(
                        requireContext(),
                        title,
                        description,
                        price!!,
                        selectedImageUri!!
                    )
                    dialog.dismiss()
                } else {
                    Log.e("AddProduct", "Validation failed.")
                }
            }
        }
        dialog.show()
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        startActivityForResult(intent, PICK_IMAGE_REQUEST)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == Activity.RESULT_OK && data != null) {
            selectedImageUri = data.data
            Log.d("AddProduct", "Image selected: $selectedImageUri")
            ivSelectedImage.setImageURI(selectedImageUri)
        }
    }

    private fun validateInput(
        title: String,
        description: String,
        price: Double?,
        imageUri: Uri?
    ): Boolean {
        return when {
            title.isEmpty() || description.isEmpty() -> {
                Toast.makeText(requireContext(), "Title and description cannot be empty", Toast.LENGTH_SHORT).show()
                false
            }
            price == null || price <= 0 -> {
                Toast.makeText(requireContext(), "Price must be a positive number", Toast.LENGTH_SHORT).show()
                false
            }
            imageUri == null -> {
                Toast.makeText(requireContext(), "Please select an image", Toast.LENGTH_SHORT).show()
                false
            }
            else -> true
        }
    }

    private fun uriToFile(uri: Uri): File {
        Log.d("AddProduct", "Converting Uri to File: $uri")
        val inputStream = requireContext().contentResolver.openInputStream(uri)
        val tempFile = File.createTempFile("selectedImage", ".jpg", requireContext().cacheDir)
        inputStream?.use { input ->
            tempFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }
        Log.d("AddProduct", "File created: ${tempFile.absolutePath}")
        return tempFile
    }

    private fun showEditProductDialog(product: Product) {
        val updatedTitle = "Updated Title"
        val updatedDescription = "Updated Description"
        val updatedPrice = product.price + 10.0
        businessViewModel.editProduct(
            requireContext(),
            product.id.toString(),
            updatedTitle,
            updatedDescription,
            updatedPrice,
            null // Image not updated
        )
    }

    private fun showDeleteConfirmationDialog(product: Product) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Delete Product")
            .setMessage("Are you sure you want to delete this product?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete") { _, _ ->
                businessViewModel.deleteProduct(requireContext(), product.id.toString())
            }
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
