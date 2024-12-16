package com.md40diasmara.nusatinggi.ui.detail

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.RatingBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.R

class DetailFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.fragment_detail, container, false)

        val product = arguments?.getParcelable<Product>("product")
        if (product != null) {
            setupUI(view, product)
        }

        return view
    }

    private fun setupUI(view: View, product: Product) {
        val productImage: ImageView = view.findViewById(R.id.detail_product_image)
        val productTitle: TextView = view.findViewById(R.id.detail_product_title)
        val productDescription: TextView = view.findViewById(R.id.detail_product_description)
        val productPrice: TextView = view.findViewById(R.id.detail_product_price)
        val productRating: RatingBar = view.findViewById(R.id.detail_product_rating)
        val productJumlahRating: TextView = view.findViewById(R.id.detail_product_jumlah_rating)
        val productJumlahPembeli: TextView = view.findViewById(R.id.detail_product_jumlah_pembeli)

        productTitle.text = product.title
        productDescription.text = product.description
        productPrice.text = "Rp ${product.price}"
        productRating.rating = product.rating.toFloat()
        productJumlahRating.text = "(${product.jumlahRating} reviews)"
        productJumlahPembeli.text = "Purchased by ${product.jumlahPembeli} users"

        Glide.with(requireContext())
            .load(product.image)
            .into(productImage)
    }
}
