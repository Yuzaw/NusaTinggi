package com.md40diasmara.nusatinggi.adapter

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.RatingBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.md40diasmara.nusatinggi.Product
import com.md40diasmara.nusatinggi.R

class ItemAdapter(
    private var products: List<Product>, // List produk
    private val listener: OnProductClickListener // Listener untuk event klik
) : RecyclerView.Adapter<ItemAdapter.ProductViewHolder>() {

    // Interface untuk menangani klik item
    interface OnProductClickListener {
        fun onProductClick(product: Product)
    }

    // ViewHolder untuk memegang referensi UI pada item
    class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val productImage: ImageView = view.findViewById(R.id.img_product)
        val productTitle: TextView = view.findViewById(R.id.title_product)
        val productPrice: TextView = view.findViewById(R.id.price_product)
        val productRating: RatingBar = view.findViewById(R.id.rating_product) // Tambahkan RatingBar
    }

    // Inflate layout item dan buat ViewHolder
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_product, parent, false)
        return ProductViewHolder(view)
    }

    // Binding data ke ViewHolder
    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val product = products[position]
        holder.productTitle.text = product.title
        holder.productPrice.text = "Rp ${product.price}"

        // Pastikan rating sesuai dengan data
        holder.productRating.rating = product.rating.toFloat()

        Glide.with(holder.itemView.context)
            .load(product.image)
            .into(holder.productImage)

        holder.itemView.setOnClickListener {
            listener.onProductClick(product) // Membuka detail produk
        }
        Log.d("Adapter", "Position: $position, Rating: ${product.rating}")
    }

    // Mendapatkan jumlah item
    override fun getItemCount(): Int = products.size

    // Fungsi untuk memperbarui data di adapter
    fun updateData(newProducts: List<Product>) {
        products = newProducts
        notifyDataSetChanged() // Meminta RecyclerView untuk refresh UI
    }
}
