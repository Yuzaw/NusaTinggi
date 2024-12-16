package com.md40diasmara.nusatinggi.ui.home

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.viewpager2.widget.ViewPager2
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.R
import com.md40diasmara.nusatinggi.adapter.ItemAdapter
import com.md40diasmara.nusatinggi.adapter.JumbotronAdapter
import android.text.Editable
import android.text.TextWatcher
import androidx.core.os.bundleOf
import androidx.navigation.fragment.findNavController

class HomeFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ItemAdapter
    private lateinit var searchBar: EditText
    private lateinit var viewPager: ViewPager2 // Tambahkan untuk jumbotron
    private val homeViewModel: HomeViewModel by viewModels()
    private var productList: List<Product> = emptyList() // Original data

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.fragment_home, container, false)
        recyclerView = view.findViewById(R.id.recycler_view)
        searchBar = view.findViewById(R.id.search_bar)
        viewPager = view.findViewById(R.id.viewPager) // Inisialisasi jumbotron

        setupRecyclerView()
        setupSearchBar(view) // Menambahkan listener untuk menutup keyboard
        setupJumbotron() // Inisialisasi jumbotron
        observeViewModel()
        homeViewModel.fetchProducts(requireContext()) // Tambahkan context untuk fetchProducts

        return view
    }

    private fun setupRecyclerView() {
        adapter = ItemAdapter(emptyList(), object : ItemAdapter.OnProductClickListener {
            override fun onProductClick(product: Product) {
                findNavController().navigate(
                    R.id.action_homeFragment_to_detailFragment,
                    bundleOf("product" to product)
                ) // Membuka detail produk
            }
        })

        recyclerView.layoutManager = GridLayoutManager(context, 2) // 2 columns for cards
        recyclerView.adapter = adapter
    }

    private fun setupJumbotron() {
        homeViewModel.products.observe(viewLifecycleOwner) { products ->
            val imagePaths = products.mapNotNull { it.image }
            if (imagePaths.isNotEmpty()) {
                val jumbotronAdapter = JumbotronAdapter(imagePaths)
                viewPager.adapter = jumbotronAdapter
            } else {
                Toast.makeText(context, "No images available for jumbotron", Toast.LENGTH_SHORT).show()
            }
        }

        homeViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            if (isLoading) {
                Toast.makeText(context, "Loading images for jumbotron...", Toast.LENGTH_SHORT).show()
            }
        }

        homeViewModel.errorMessage.observe(viewLifecycleOwner) { errorMessage ->
            errorMessage?.let {
                Toast.makeText(context, "Error loading images: $it", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun observeViewModel() {
        homeViewModel.products.observe(viewLifecycleOwner) { products ->
            productList = products // Save the original list
            adapter.updateData(products) // Update the adapter with the data
        }

        homeViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            view?.findViewById<ProgressBar>(R.id.progress_bar)?.visibility =
                if (isLoading) View.VISIBLE else View.GONE
        }

        homeViewModel.errorMessage.observe(viewLifecycleOwner) { errorMessage ->
            errorMessage?.let {
                Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupSearchBar(rootView: View) {
        searchBar.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH) {
                val query = searchBar.text.toString().lowercase()
                val filteredList = homeViewModel.products.value?.filter {
                    it.title.lowercase().contains(query)
                } ?: emptyList()

                adapter.updateData(filteredList)
                hideKeyboard()
                searchBar.clearFocus()
                true
            } else {
                false
            }
        }

        rootView.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN) {
                hideKeyboard()
                searchBar.clearFocus()
            }
            false
        }

        searchBar.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s.toString().lowercase()
                if (query.isEmpty()) {
                    adapter.updateData(homeViewModel.products.value ?: emptyList())
                }
            }

            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun hideKeyboard() {
        val imm = context?.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        view?.let { v ->
            imm.hideSoftInputFromWindow(v.windowToken, 0)
        }
    }
}
